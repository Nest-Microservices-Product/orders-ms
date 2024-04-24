import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from 'src/config/getEnvs';
import { NAST_SERVICE } from 'src/shared/constants/NATS_SERVICE';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: NAST_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: envs.natsServer,
        },
      },
    ]),
  ],
  exports: [
    ClientsModule.register([
      {
        name: NAST_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: envs.natsServer,
        },
      },
    ]),
  ],
})
export class NatsModule {}
