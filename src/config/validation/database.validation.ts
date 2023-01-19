import * as Joi from 'joi';

const databaseValidationSchema = {
  DB_TYPE: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.string().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  DB_AUTOLOADENTITIES: Joi.boolean().default(false),
  DB_SYNCHRONIZE: Joi.boolean().default(false),
  DB_KEEP_CONNECTION_ALIVE: Joi.boolean().default(false),
  DB_LOGGING: Joi.any().default(true),
  // logging: boolean | query | error | schema | warn | info | log
  DB_CHARSET: Joi.string().default('utf8mb4_general_ci'),
};

export default databaseValidationSchema;
