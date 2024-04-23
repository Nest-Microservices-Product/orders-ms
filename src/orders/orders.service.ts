import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { ChangeOrderStatusDto, OrderPaginationDto } from './dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('OrdersService');
  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }
  create(createOrderDto: CreateOrderDto) {
    return this.order.create({
      data: createOrderDto,
    });
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
    const order = await this.order.findFirst({
      where: { id },
    });
    if (!order) {
      throw new RpcException({
        message: `Could not find order with id ${id}`,
        status: HttpStatus.NOT_FOUND,
      });
    }
    return order;
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
