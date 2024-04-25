import { OrderStatus } from '@prisma/client';

export interface OrderWithProductI {
  OrderDetail: {
    name: any;
    productId: number;
    quantity: number;
    price: number;
  }[];
  id: string;
  totalAmount: number;
  totalItems: number;
  status: OrderStatus;
  isPaid: boolean;
  paidAt: Date;
  stripeChargeId: string;
  createdAt: Date;
  updatedAt: Date;
}
