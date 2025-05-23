import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import {
  ChangeOrderStatusDto,
  CreateOrderDto,
  OrderPaginationDto,
  PaidOrderDto,
} from './dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern({ cmd: 'create_order' })
  async create(@Payload() createOrderDto: CreateOrderDto) {
    const order = await this.ordersService.create(createOrderDto);
    const paymentSession = await this.ordersService.createPaymentSession(order);
    return {
      order,
      paymentSession,
    };
  }

  @MessagePattern({ cmd: 'find_all_orders' })
  findAll(@Payload() paginationDto: OrderPaginationDto) {
    return this.ordersService.findAll(paginationDto);
  }

  @MessagePattern({ cmd: 'find_one_order' })
  findOne(@Payload() id: string) {
    return this.ordersService.findOne(id);
  }

  @MessagePattern({ cmd: 'find_all_orders_by_user' })
  findAllByUserId(@Payload() userId: string) {
    return this.ordersService.findAllByUserId(userId);
  }

  @MessagePattern({ cmd: 'change_order_status' })
  changeOrderStatus(@Payload() reqOrderStatus: ChangeOrderStatusDto) {
    return this.ordersService.changeStatus(reqOrderStatus);
  }
  @EventPattern('payment.successful')
  paidOrder(@Payload() paidOrderDto: PaidOrderDto) {
    return this.ordersService.paidOrder(paidOrderDto);
  }
}
