import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  INestApplication,
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { PrismaSelect } from '@paljs/plugins';
import { Prisma, PrismaClient } from '@prisma/client';
import { Cache } from 'cache-manager';
// import { GraphQLResolveInfo } from 'graphql';

@Injectable()
export class PgPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private deletedColumn: string;

  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    super({ omit: { user: { password: true } } });
    this.deletedColumn = this.configService.get<string>('columnLogicDelete');

    // const clientWithExtensions = this.withExtensions();
    // Object.assign(this, clientWithExtensions);
  }

  /**
   * get basic fields of a model
   * @exclude relational fields
   * @param {any} modelName -Prisma.DeletegateModel
   * @return {string[]} An array of basic field names.
   */
  public getModelFields(modelName: any): string[] {
    const fields = { ...modelName.fields };
    return Object.keys(fields);
  }

  public formatGqlArgs<T>(args: T, modelName: string) {
    const { skip, take, orderBy, where } = args as any;
    const skipIndex = skip >= 0 && take ? skip * take : undefined;

    const hasDeleted = this.hasDeletedColumn(modelName);

    return {
      ...args,
      where: hasDeleted ? { ...where, esEliminado: false } : where,
      skipIndex,
      skip: skip || undefined,
      take: take || undefined,
      orderBy: orderBy || undefined,
    };
  }

  // public async parseOneSelect<T>(info: GraphQLResolveInfo, modelName: string): Promise<T> {
  //   return this.parseSelect<T>(info, modelName);
  // }

  // public async parsePagSelect<T>(info: GraphQLResolveInfo, modelName: string): Promise<T> {
  //   return this.parseSelect<T>(info, modelName, true);
  // }

  /**
   * Parses the GraphQL resolve info to extract only fiels for a prisma model.
   *   // https://paljs.com/plugins/select/#install
   *   // https://www.youtube.com/watch?v=7oMfBGEdwsc
   * @param {GraphQLResolveInfo} info - The GraphQL resolve info object.
   * @param {string} modelName - a prisma model name.
   * @param {boolean} [isPaginate=false] - Indicates whether the selection is for pagination.
   * @return {Promise<T>} - A promise that resolves to the selected fields for the model.
   */
  // private async parseSelect<T>(
  //   info: GraphQLResolveInfo,
  //   modelName: string,
  //   isPaginate = false,
  // ): Promise<T> {
  //   const fields = await this.getCachedModelFields(modelName);
  //   let dataSelect = new PrismaSelect(info).value?.select ?? {};
  //   if (isPaginate) {
  //     dataSelect = new PrismaSelect(info).value?.select?.data?.select ?? {};
  //   }

  //   return this.filterObject(dataSelect, fields) as T;
  // }

  /**
   * Retrieves the cached model fields for a model name.
   *
   * @param {string} modelName - The name of the model.
   * @return {Promise<string[]>} - A promise that resolves to an array of field names for the model.
   */
  private async getCachedModelFields(modelName: string): Promise<string[]> {
    const key = `pg-model-fields-${modelName}`;
    let fields = await this.cacheManager.get<string[]>(key);
    if (!fields) {
      const prismaModel = Prisma.dmmf.datamodel.models.find((model) => model.name === modelName);
      if (prismaModel) {
        fields = prismaModel.fields.map((field) => field.name);
        await this.cacheManager.set(key, fields, 1000);
      }
    }
    return fields;
  }

  /**
   * Filters on fields exists in array of keys
   * @example { id: true, name: true}, ['name'] => { name: true }
   * @param {any} obj - The object of prisma select.
   * @param {string[]} keys - The keys to include in the filtered object.
   * @return {any} The filtered object.
   */
  private filterObject(obj: any, keys: string[]): any {
    return keys.reduce((filteredObj, key) => {
      if (obj.hasOwnProperty(key)) {
        filteredObj[key] = obj[key];
      }
      return filteredObj;
    }, {});
  }
  /* ---------------------------------------------------------------------------------------------- */
  /*                                      prisma init functions                                     */
  /* ---------------------------------------------------------------------------------------------- */

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async enableShutdownHooks(app: INestApplication) {
    await app.close();
  }

  // Función para agregar el filtro de eliminación lógica
  private queryEliminacionLogica = ({ model, args, query }) => {
    if (this.hasDeletedColumn(model)) {
      args = args || {};
      args.where = { [this.deletedColumn]: false, ...args.where };
    }
    return query(args);
  };

  // Verificar si el modelo tiene el campo 'esEliminado'
  hasDeletedColumn(model: string): boolean {
    const modelsWithEsEliminado = [
      'Solicitud',
      'Documento',
      'MedidasSujeto',
      'ReferenciaSolicitud',
    ]; // Añade aquí todos los modelos que tienen 'esEliminado'
    return modelsWithEsEliminado.includes(model);
  }

  private withExtensions() {
    const prisma = new PrismaClient();
    return prisma.$extends({
      query: {
        $allModels: {
          count: this.queryEliminacionLogica,
          findFirst: this.queryEliminacionLogica,
          findUnique: this.queryEliminacionLogica,
          findMany: this.queryEliminacionLogica,
          findFirstOrThrow: this.queryEliminacionLogica,
          findUniqueOrThrow: this.queryEliminacionLogica,
        },
      },
    });
  }
}
