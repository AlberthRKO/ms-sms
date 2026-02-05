import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import { IPackageJson } from '../config/configuration';
import { bold } from 'chalk';
import * as os from 'node:os';

const nameParsePresentation = (name: string): string => {
  return name.toUpperCase().replaceAll('-', ' ');
};

export const configSwagger = (
  app: INestApplication,
  packageJson: IPackageJson,
  options: SwaggerCustomOptions & { nodeEnv?: string } = {},
) => {
  const nodeEnv = options?.nodeEnv ?? process.env.NODE_ENV;
  const envSufix: string = nodeEnv ? `- (${nodeEnv})` : '';

  const documentBuilder = new DocumentBuilder()
    .setTitle(`${nameParsePresentation(packageJson.name)} ${envSufix}`)
    .setVersion(packageJson.version)
    .setDescription(packageJson.description)
    .setContact(packageJson.contact.name, '', packageJson.contact.email)
    .setLicense(packageJson.license, packageJson.contact.email)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, documentBuilder);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: nameParsePresentation(packageJson.name),
    customfavIcon: '/public/assets/favicon.ico',
    customCss: `
         .swagger-ui .topbar { display: none; }
         .swagger-ui .info { margin: 20px 0;}
         .swagger-ui .info hgroup.main { margin: 0 0 0;}
         .title span { display: block; }
    `,
    ...options,
  });
};

/**
 * Returns the first available local IPv4 address in the form of a string.
 * The address is returned as a URL with the specified port number.
 * If no local IPv4 address is found, returns null.
 * @param {number} [port=3000] The port number to include in the returned URL.
 * @return {string|null} The first available local IPv4 address, or null if none is found.
 */
const getLocalIP = (port = 3000): string | null => {
  const interfaces = os.networkInterfaces();

  for (const interfaceName in interfaces) {
    const ifaceList = interfaces[interfaceName];
    if (!ifaceList) continue;
    for (const iface of ifaceList) {
      // Ignorar direcciones IPv6 y las que son internas (loopback)
      if (iface.family === 'IPv4' && !iface.internal) {
        return `http://${iface.address}:${port}`; // Retornar la primera dirección IPv4 encontrada
      }
    }
  }
  return null; // Mensaje por defecto si no se encuentra ninguna
};

const defaultPrintOptions = { route: 'api' };

/**
 * Prints the server log with the specified application and package information.
 *
 * @param {INestApplication} app - The Nest application instance.
 * @param {IPackageJson} packageJson - The package information.
 * @return {Promise<void>} A promise that resolves when the server log is printed.
 */
export const printServerInitLog = async (
  app: INestApplication,
  packageJson: IPackageJson,
  options: { route?: string; appName?: string; port?: number } = defaultPrintOptions,
) => {
  const port = options?.port ?? app.getHttpServer().address().port;
  const server = getLocalIP(port) ?? (await app.getUrl());
  const appName = options?.appName ?? packageJson.name;

  console.info(
    bold.blue(
      `🚀 "${appName}", version:"${packageJson.version}" is listening ON PORT`,
      `${server}/${bold.bgBlueBright(options?.route ?? 'api')}`,
    ),
  );
};
