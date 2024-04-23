import 'dotenv/config';
import { envSchema } from './validators/EnvVarSchema.validator';
import { EnvVars } from './entities/EnvVars.entity';

const getEnvVars = () => {
  const { error, value } = envSchema.validate(process.env);

  if (error) {
    throw new Error(
      `There was an error with the config validation ${error.message}`,
    );
  }

  const envVars: EnvVars = value;

  return {
    port: envVars.PORT,
    productsMsHost: envVars.PRODUCTS_MS_HOST,
    productsMsPort: envVars.PRODUCTS_MS_PORT,
  };
};

export const envs = getEnvVars();
