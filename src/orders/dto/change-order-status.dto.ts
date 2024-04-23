import { IsEnum, IsUUID } from 'class-validator';
import { OrderStatus } from '../entities/orderStatus.entity';

export class ChangeOrderStatusDto {
  @IsUUID()
  id: string;
  @IsEnum(OrderStatus, {
    message: `The values for the order status are PENDING, DELIVERED, CANCELLED`,
  })
  status: OrderStatus;
}
