import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PRODUCTS_SERVICES_NAMES } from 'src/shared/entities/ProductsServicesNames';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from 'src/config/getEnvs';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: PRODUCTS_SERVICES_NAMES.SERVICE_NAME,
        transport: Transport.TCP,
        options: {
          host: envs.productsMsHost,
          port: envs.productsMsPort,
        },
      },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
