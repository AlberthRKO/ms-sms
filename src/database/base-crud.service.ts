import { Prisma, PrismaClient } from '@prisma/client';
import {
  CacheMappedListType,
  PrismaMethodOptionsType,
  PrismaPaginationType,
} from './utils/prisma-services.type';
import {
  ResponseDTO,
  dataResponseError,
  dataResponseSuccess,
} from 'fiscalia_bo-nest-helpers/dist/dto';
import { UserPayload } from 'fiscalia_bo-nest-helpers/dist/modules/ms-seguridad/ms-seguridad.decorator';
import { CacheKeys } from 'src/enums/cache-keys.enum';
import { MsRedisService } from 'fiscalia_bo-nest-helpers/dist/modules/ms-redis';
import { Logger } from '@nestjs/common';
import { convertStrOrderByToObject } from './utils/prisma-extends.helper';
import { errorPrismaManager } from './utils/prisma-error.helper';

export class PrismaJl2BaseService<
  ModelDelegate,
  CacheListQueryType extends Partial<
    Pick<Prisma.Args<ModelDelegate, 'findMany'>, 'select' | 'include'>
  >,
> {
  private queryToCache: Pick<Prisma.Args<ModelDelegate, 'findMany'>, 'select' | 'include'>;
  private localCacheKey: string;

  dbConnection: PrismaClient;
  tableName: Prisma.ModelName;

  constructor(
    dbConnection: PrismaClient,
    tableName: Prisma.ModelName,
    private readonly clientCleanMsRedisCacheService?: MsRedisService,
    private readonly listCacheClean?: CacheKeys[],
    private readonly dbCache?: number,
  ) {
    this.dbConnection = dbConnection;
    this.tableName = tableName;
  }

  protected enableLocalCacher(
    keyCache: string,
    queryToCacheList?: Partial<Pick<Prisma.Args<ModelDelegate, 'findMany'>, 'select' | 'include'>>,
  ) {
    this.queryToCache = queryToCacheList as any;
    this.localCacheKey = `${keyCache}_mapId`;
  }

  limpiarCacheDeKeys() {
    if (this.clientCleanMsRedisCacheService) {
      this.listCacheClean?.map((cacheKey) =>
        this.clientCleanMsRedisCacheService.DeleteCache(cacheKey, this.dbCache),
      );
    }
    if (this.localCacheKey) {
      this.clientCleanMsRedisCacheService.DeleteCache(this.localCacheKey, this.dbCache);
    }
  }

  async findAll<
    T extends PrismaPaginationType & Omit<Prisma.Args<ModelDelegate, 'findMany'>, 'take' | 'size'>,
  >(
    data: T,
    options?: PrismaMethodOptionsType<Prisma.TransactionClient>,
  ): Promise<
    ResponseDTO<
      Prisma.Result<
        ModelDelegate,
        { [K in keyof T]: K extends 'select' | 'include' ? T[K] : never },
        'findMany'
      >
    >
  > {
    const repository: any = options?.txClient
      ? options?.txClient[this.tableName]
      : this.dbConnection[this.tableName];
    if (!repository) return dataResponseError<undefined>('No se tiene conexión a la base de datos');
    try {
      const limitOfItems = data.size;
      const records = await repository.findMany({
        select: data.select,
        where: data.where,
        orderBy: Object.keys(data.orderBy ?? {}).length
          ? convertStrOrderByToObject(data.orderBy)
          : { id: 'desc' },
        skip: limitOfItems ? (data.page > 0 ? (data.page - 1) * limitOfItems : 0) : undefined,
        take: limitOfItems,
        include: data.include,
      });
      return dataResponseSuccess<typeof records>(
        {
          data: records,
          pagination: data?.size
            ? {
                // size: limitOfItems,
                size: limitOfItems,
                page: data.page || 1,
                total: Number(await repository.count({ where: data.where })),
              }
            : undefined,
        },
        {},
      );
    } catch (err) {
      return errorPrismaManager(err);
    }
  }

  async create<T extends Omit<Prisma.Args<ModelDelegate, 'create'>, 'data'>>(
    dataToCreate: Prisma.Args<ModelDelegate, 'create'>['data'],
    respOptions?: T,
    options?: PrismaMethodOptionsType<Prisma.TransactionClient>,
  ): Promise<
    ResponseDTO<
      Prisma.Result<
        ModelDelegate,
        { [K in keyof T]: K extends 'select' | 'include' ? T[K] : never },
        'create'
      >
    >
  > {
    // Verificar coneccion de escritura
    const repository: { create?: (data: any) => any } & ModelDelegate = (
      options?.txClient ? options?.txClient[this.tableName] : this.dbConnection[this.tableName]
    ) as ModelDelegate;
    if (!repository) return dataResponseError<undefined>('No se tiene conexión a la base de datos');

    // preparar datos para nuevo registro
    try {
      const regSaved = await repository.create({ data: dataToCreate, ...respOptions });
      this.limpiarCacheDeKeys();
      return dataResponseSuccess<typeof regSaved>(
        { data: regSaved },
        {
          message: options?.message,
          status: options?.status,
        },
      );
    } catch (err) {
      return errorPrismaManager(err);
    }
  }

  async findOne<T extends Omit<Prisma.Args<ModelDelegate, 'findUnique'>, 'where'>>(
    id: number | string,
    anyData?: T,
    options?: PrismaMethodOptionsType<Prisma.TransactionClient>,
  ): Promise<
    ResponseDTO<
      Prisma.Result<
        ModelDelegate,
        { [K in keyof T]: K extends 'select' | 'include' ? T[K] : never },
        'findUnique'
      >
    >
  > {
    // Verificar conexión de lectura
    const repository: { findUnique?: (data: any) => any } & ModelDelegate = (
      options?.txClient ? options?.txClient[this.tableName] : this.dbConnection[this.tableName]
    ) as ModelDelegate;
    if (!repository) return dataResponseError<undefined>('No se tiene conexión a la base de datos');
    if (!id)
      return dataResponseError<undefined>(`Debe proporcionar un id para obtener ${this.tableName}`);
    // preparar consulta
    try {
      const data = await repository.findUnique({
        where: { id },
        select: anyData?.select,
        include: anyData?.include,
      });

      if (!data)
        return dataResponseError('Registro no encontrado!.', {
          response: { data: null },
          status: 404,
        });

      return dataResponseSuccess<typeof data>(
        {
          data,
        },
        {
          message: options?.message,
          status: options?.status,
        },
      );
    } catch (err) {
      return errorPrismaManager(err);
    }
  }

  async findUnique<T extends Omit<Prisma.Args<ModelDelegate, 'findUnique'>, 'where'>>(
    whereUnique: Prisma.Args<ModelDelegate, 'findUnique'>['where'],
    anyData?: T,
    options?: PrismaMethodOptionsType<Prisma.TransactionClient>,
  ): Promise<
    ResponseDTO<
      Prisma.Result<
        ModelDelegate,
        { [K in keyof T]: K extends 'select' | 'include' ? T[K] : never },
        'findUnique'
      >
    >
  > {
    // Verificar conexión de lectura
    const repository: { findUnique?: (data: any) => any } & ModelDelegate = (
      options?.txClient ? options?.txClient[this.tableName] : this.dbConnection[this.tableName]
    ) as ModelDelegate;
    if (!repository) return dataResponseError<undefined>('No se tiene conexión a la base de datos');
    // preparar consulta
    try {
      const data = await repository.findUnique({
        where: whereUnique,
        select: anyData?.select,
        include: anyData?.include,
      });

      if (!data)
        return dataResponseError('Registro no encontrado!.', {
          response: { data: null },
          status: 404,
        });

      return dataResponseSuccess<typeof data>(
        {
          data,
        },
        {
          message: options?.message,
          status: options?.status,
        },
      );
    } catch (err) {
      return errorPrismaManager(err);
    }
  }

  async findFirst<T extends Prisma.Args<ModelDelegate, 'findFirst'>>(
    anyData: T,
    options?: PrismaMethodOptionsType<Prisma.TransactionClient>,
  ): Promise<
    ResponseDTO<
      Prisma.Result<
        ModelDelegate,
        { [K in keyof T]: K extends 'select' | 'include' ? T[K] : never },
        'findFirst'
      >
    >
  > {
    // Verificar conexión de lectura
    const repository: { findFirst?: (data: any) => any } & ModelDelegate = (
      options?.txClient ? options?.txClient[this.tableName] : this.dbConnection[this.tableName]
    ) as ModelDelegate;
    if (!repository) return dataResponseError<undefined>('No se tiene conexión a la base de datos');
    // preparar consulta
    try {
      const data = await repository.findFirst(anyData);

      if (!data)
        return dataResponseError('Registro no encontrado!.', {
          response: { data: null },
          status: 404,
        });

      return dataResponseSuccess<typeof data>(
        {
          data,
        },
        {
          message: options?.message,
          status: options?.status,
        },
      );
    } catch (err) {
      return errorPrismaManager(err);
    }
  }

  async update<T extends Omit<Prisma.Args<ModelDelegate, 'update'>, 'data' | 'where'>>(
    id: number | string,
    dataUp: Prisma.Args<ModelDelegate, 'update'>['data'],
    respOptions?: T,
    options?: PrismaMethodOptionsType<Prisma.TransactionClient>,
  ): Promise<
    ResponseDTO<
      Prisma.Result<
        ModelDelegate,
        { [K in keyof T]: K extends 'select' | 'include' ? T[K] : never },
        'update'
      >
    >
  > {
    // Rellenar columnas en null
    // Verificar conexión de Escritura
    const repository: { update?: (data: any) => any } & ModelDelegate = (
      options?.txClient ? options?.txClient[this.tableName] : this.dbConnection[this.tableName]
    ) as ModelDelegate;
    if (!repository) return dataResponseError<undefined>('No se tiene conexión a la base de datos');
    if (!id)
      return dataResponseError<undefined>(
        `Debe proporcionar un id para actualizar ${this.tableName}`,
      );
    // Preparar datos para la actualización
    try {
      const respUp = await repository.update({
        where: { id },
        data: dataUp,
      });
      this.limpiarCacheDeKeys();
      return dataResponseSuccess<typeof respUp>(
        { data: respUp },
        {
          message: options?.message,
          status: options?.status,
        },
      );
    } catch (err) {
      return errorPrismaManager(err);
    }
  }

  async remove(
    id: number | string,
    user?: UserPayload,
    options?: PrismaMethodOptionsType<Prisma.TransactionClient>,
  ): Promise<ResponseDTO<Prisma.Result<ModelDelegate, any, 'delete'>>> {
    // Verificar conexión de escritura
    const repository: { update?: (data: any) => any; delete?: (data: any) => any } & ModelDelegate =
      (
        options?.txClient ? options?.txClient[this.tableName] : this.dbConnection[this.tableName]
      ) as ModelDelegate;

    if (!repository) return dataResponseError<undefined>('No se tiene conexión a la base de datos');
    if (!id)
      return dataResponseError<undefined>(
        `Debe proporcionar un id para eliminar ${this.tableName}`,
      );
    // RECODE contemplar el campo "deleted" si el modelo tiene para eliminar logicamente
    // Preparar datos para eliminar el registro
    try {
      const data = await repository.delete({
        where: { id },
        // data: {
        //   esEliminado: true,
        //   actualizadorUsuarioId: user.usuarioId,
        //   actualizadoEn: new Date(),
        // },
      });
      this.limpiarCacheDeKeys();
      return dataResponseSuccess<typeof data>(
        { data },
        {
          message: options?.message || 'Registro Eliminado exitosamente.',
          status: options?.status,
        },
      );
    } catch (err) {
      return errorPrismaManager(err);
    }
  }

  async deleteOne<T extends Prisma.Args<ModelDelegate, 'delete'>>(
    delData: T,
    options?: PrismaMethodOptionsType<Prisma.TransactionClient>,
  ): Promise<
    ResponseDTO<
      Prisma.Result<
        ModelDelegate,
        { [K in keyof T]: K extends 'select' | 'include' ? T[K] : never },
        'delete'
      >
    >
  > {
    // Verificar conexión de escritura
    const repository: { delete?: (data: any) => any } & ModelDelegate = (
      options?.txClient ? options?.txClient[this.tableName] : this.dbConnection[this.tableName]
    ) as ModelDelegate;
    if (!repository) return dataResponseError<undefined>('No se tiene conexión a la base de datos');
    // Preparar datos para eliminar el registro
    try {
      const data = await repository.delete(delData);
      return dataResponseSuccess<typeof data>(
        { data },
        {
          message: options?.message || 'Eliminado fisico realizado correctamente',
          status: options?.status,
        },
      );
    } catch (err) {
      return errorPrismaManager(err);
    }
  }

  /* --------------------------------- CACHE LOCAL PARA CATALOGOS --------------------------------- */
  async getListMapById(): Promise<
    | CacheMappedListType<
        Prisma.Result<
          ModelDelegate,
          {
            [K in keyof CacheListQueryType]: K extends 'select' | 'include'
              ? CacheListQueryType[K]
              : never;
          },
          'findUnique'
        >
      >
    | undefined
  > {
    if (!this.clientCleanMsRedisCacheService) {
      Logger.error(
        'Este modulo no tiene habilidato el cacheo',
        `PrismaJl2BaseSevice - ${this.tableName}`,
      );
      return undefined;
    }

    const cached = await this.clientCleanMsRedisCacheService.getCache<any>(
      this.localCacheKey,
      this.dbCache,
    );

    if (cached.cache && Object.keys(cached.response).length > 0) {
      return cached.response;
    }

    const respList = await this.findAll({
      ...(this.queryToCache as any),
    });
    if (respList.error) {
      Logger.error(
        `Error al recuperar datos para mapear ${this.localCacheKey}:\n${respList.message}`,
        `PrismaJl2BaseSevice - ${this.tableName}`,
      );
      return undefined;
    }
    const mapRegistros:
      | CacheMappedListType<
          Prisma.Result<
            ModelDelegate,
            {
              [K in keyof CacheListQueryType]: K extends 'select' | 'include'
                ? CacheListQueryType[K]
                : never;
            },
            'findUnique'
          >
        >
      | undefined = respList.response.data.reduce((map, ec: any) => {
      map[ec['id']] = ec;
      return map;
    }, {} as any);
    await this.clientCleanMsRedisCacheService.SetCache(
      this.localCacheKey,
      JSON.stringify(mapRegistros),
      60 * 60 * 4,
      this.dbCache,
    );

    return mapRegistros;
  }
}
