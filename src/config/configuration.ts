import { join } from 'node:path';

export interface IPackageJson {
  name: string;
  version: string;
  description: string;
  author: string;
  contact: {
    name: string;
    url: string;
    email: string;
  };
  license: string;
}

/* ------------------------------------ configuracion default ----------------------------------- */
export const configuration = () => {
  const locatePackagejson = process.cwd();
  let pm2 = false;
  if (locatePackagejson.includes('dist')) {
    pm2 = true;
  }

  return {
    packageJson: require(join(process.cwd(), pm2 ? '../package.json' : 'package.json')),
    port: Number(process.env.ENV_PORT || 3000),
    host: process.env.ENV_HOST_IP || '0.0.0.0',
    appMaxSize: Number(process.env.ENV_FILE_MAX_SIZE || '10485760'),

    showSwagger: process.env.ENV_SWAGGER_SHOW === 'true',
    showDebugServer: process.env.ENV_DEBUG_SERVER === 'true',
    allowDualStorage: process.env.ENV_DUAL_STORAGE === 'true',

    mongoDbUrl: process.env.ENV_MONGO_DB_URL ?? null,

    nodeEnv: process.env.NODE_ENV || 'dev',
    cors: process.env.ENV_CORS || '*',
  };
};
