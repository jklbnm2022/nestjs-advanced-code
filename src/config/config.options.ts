import * as Joi from 'joi';
import serverConfig from './server.config';
import databaseConfig from './database.config';
import databaseValidationSchema from './validation/database.validation';
import getEnvFilePath from 'src/common/getEnvFilePath';

const configOption = {
  validationSchema: Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'production', 'test', 'provision')
      .default('development'),
    PORT: Joi.number().default(3000),
    ...databaseValidationSchema,
  }),
  validationOptions: {
    allowUnknown: true,
    abortEarly: true,
  },
  envFilePath: getEnvFilePath(process.env.NODE_ENV),
  isGlobal: true,
  load: [serverConfig, databaseConfig],
};

export default configOption;
