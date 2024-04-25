import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { OrderStatus } from '../entities/orderStatus.entity';

export class OrderPaginationDto extends PaginationDto {
  @IsEnum(OrderStatus, {
    message: `The values for the order status are PENDING, DELIVERED, CANCELLED, PAID`,
  })
  @IsOptional()
  status: OrderStatus = OrderStatus.PENDING;
}
