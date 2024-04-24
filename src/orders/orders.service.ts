import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaClient } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { ChangeOrderStatusDto, OrderPaginationDto } from './dto';
import { PRODUCTS_SERVICES_NAMES } from 'src/shared/entities/ProductsServicesNames';
import { firstValueFrom } from 'rxjs';
import { NAST_SERVICE } from 'src/shared/constants/NATS_SERVICE';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  constructor(
    @Inject(NAST_SERVICE)
    private readonly client: ClientProxy,
  ) {
    super();
  }
  private readonly logger = new Logger('OrdersService');
  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }
  async create(createOrderDto: CreateOrderDto) {
    try {
      // check if the product is a product existent in the database
      const productIds = createOrderDto.items.map((item) => item.productId);
      const products: any[] = await firstValueFrom(
        this.client.send(
          { cmd: PRODUCTS_SERVICES_NAMES.VALIDATE_PRODUCTS },
          productIds,
        ),
      );

      // calculate the values from the products
      const totalAmount = createOrderDto.items.reduce((acc, item) => {
        const price = products.find((p) => p.id === item.productId).price;
        return acc + price * item.quantity;
      }, 0);

      const totalItems = createOrderDto.items.reduce((acc, item) => {
        return acc + item.quantity;
      }, 0);
      // create a transaction
      const newOrder = await this.order.create({
        data: {
          totalAmount: totalAmount,
          totalItems: totalItems,
          OrderDetail: {
            createMany: {
              data: createOrderDto.items.map((item) => ({
                price: products.find((p) => p.id === item.productId).price,
                productId: item.productId,
                quantity: item.quantity,
              })),
            },
          },
        },
        include: {
          OrderDetail: {
            select: {
              price: true,
              quantity: true,
              productId: true,
            },
          },
        },
      });

      const orderFormated = {
        ...newOrder,
        OrderDetail: newOrder.OrderDetail.map((o) => ({
          ...o,
          name: products.find((p) => p.id === o.productId).name,
        })),
      };
      return orderFormated;
    } catch (error) {
      throw new RpcException({
        message: error.message,
        status: error.status,
      });
    }
  }

  async findAll(paginationDto: OrderPaginationDto) {
    const { page, limit, status } = paginationDto;
    const skipResults = (page - 1) * limit;
    const totalRows = await this.order.count({
      where: {
        status,
      },
    });
    const lastPage = Math.ceil(totalRows / limit);
    const dataRes = await this.order.findMany({
      where: {
        status,
      },
      skip: skipResults,
      take: limit,
    });
    if (!dataRes.length) {
      throw new RpcException({
        message: 'No results found',
        status: HttpStatus.NO_CONTENT,
      });
    }
    return {
      data: dataRes,
      meta: {
        totalRows: totalRows,
        lastPage: lastPage,
        actualPage: page,
      },
    };
  }

  async findOne(id: string) {
    const order: any = await this.order.findFirst({
      where: { id },
      include: {
        OrderDetail: {
          select: {
            price: true,
            quantity: true,
            productId: true,
          },
        },
      },
    });
    if (!order) {
      throw new RpcException({
        message: `Could not find order with id ${id}`,
        status: HttpStatus.NOT_FOUND,
      });
    }
    const productIds = order.OrderDetail.map((item) => item.productId);
    const products: any[] = await firstValueFrom(
      this.client.send(
        { cmd: PRODUCTS_SERVICES_NAMES.VALIDATE_PRODUCTS },
        productIds,
      ),
    );
    return {
      ...order,
      OrderDetail: order.OrderDetail.map((o) => ({
        ...o,
        name: products.find((p) => p.id === o.productId).name,
      })),
    };
  }

  async changeStatus(reqOrderStatus: ChangeOrderStatusDto) {
    const { id, status } = reqOrderStatus;
    const existingOrder = await this.findOne(id);
    if (existingOrder.status === status) {
      return existingOrder;
    }
    return this.order.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }
}
