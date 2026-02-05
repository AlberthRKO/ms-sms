import { join } from 'path';

export const configuration = async () => {
  const locatePackagejson = process.cwd();
  let pm2 = false;
  if (locatePackagejson.includes('dist')) {
    pm2 = true;
  }

  const packageJsonPath = join(process.cwd(), pm2 ? '../package.json' : 'package.json');
  const packageJson = await import(packageJsonPath);

  return {
    packageJson: packageJson,
    port: parseInt(process.env.ENV_PORT, 10) || 8400,
    host: process.env.ENV_HOST_IP,
    appMaxSize: process.env.ENV_FILE_MAX_SIZE || '100mb',

    showDebugServer: process.env.ENV_DEBUG_SERVER || 'false',
    showDebugFront: process.env.ENV_DEBUG_FRONT || 'false',
    showSwagger: process.env.ENV_SWAGGER_SHOW || 'false',

    mongoDbUrl: process.env.ENV_MONGO_DB_URL ?? null,

    // mail: {
    //   host: process.env.ENV_MAIL_HOST ?? null,
    //   port: process.env.ENV_MAIL_PORT ?? null,
    // },

    nodeEnv: process.env.NODE_ENV || 'dev',
    cors: process.env.ENV_CORS || '*',
  };
};
