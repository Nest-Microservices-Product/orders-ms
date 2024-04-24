import 'dotenv/config';
import { envSchema } from './validators/EnvVarSchema.validator';
import { EnvVars } from './entities/EnvVars.entity';

const getEnvVars = () => {
  const { error, value } = envSchema.validate({
    ...process.env,
    NATS_SERVERS: process.env?.NATS_SERVERS.split(','),
  });

  if (error) {
    throw new Error(
      `There was an error with the config validation ${error.message}`,
    );
  }

  const envVars: EnvVars = value;

  return {
    port: envVars.PORT,
    natsServer: envVars.NATS_SERVERS,
  };
};

export const envs = getEnvVars();
