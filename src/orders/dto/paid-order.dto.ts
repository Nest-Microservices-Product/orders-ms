import { IsString, IsUUID, IsUrl } from 'class-validator';

export class PaidOrderDto {
  @IsString()
  stripePaymentId: string;
  @IsString()
  @IsUUID()
  orderId: string;
  @IsString()
  @IsUrl()
  receive_payment: string;
}