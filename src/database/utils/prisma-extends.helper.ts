const deletedColumn = process.env.ENV_ELIMINACION_LOGICA_COLUMN || 'esEliminado';

import { HttpException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { dataResponseError } from 'fiscalia_bo-nest-helpers/dist/dto';

export function getJl2PenalWithExtensions(client?: PrismaClient): PrismaClient {
  if (!client) client = new PrismaClient();
  if (process.env.ENV_ELIMINACION_LOGICA === 'true') {
    console.log('ELIMINACION LOGICA ACTIVADA <--------------');
    return client.$extends({
      query: {
        $allModels: {
          count: queryEliminacionLogica,
          findFirst: queryEliminacionLogica,
          findUnique: queryEliminacionLogica,
          findMany: queryEliminacionLogica,
          findFirstOrThrow: queryEliminacionLogica,
          findUniqueOrThrow: queryEliminacionLogica,
        },
      },
    }) as PrismaClient;
  }
  return client;
}

export class Jl2PenalExtended extends PrismaClient {
  constructor(client?: PrismaClient) {
    super();
    return getJl2PenalWithExtensions(client);
  }
}

export const queryEliminacionLogica = async ({ query, args }) => {
  args.where = { [deletedColumn]: false, ...args.where };
  return query(args);
};

/* -------------------------------------- helpers to query -------------------------------------- */

function getFormatTipoToQuery(value: number | string | Array<number | string>): string {
  if (typeof value === 'number') {
    return `${value}`;
  } else if (typeof value === 'string') {
    const valueNormalized = value.normalize();
    if (validSqlValue(valueNormalized)) {
      return `'${valueNormalized}'`;
    } else {
      throw Error('Uno de los valores tiene contenido peligroso.');
    }
  } else if (typeof value === 'object' && Array.isArray(value)) {
    return `(${value.map((val) => getFormatTipoToQuery(val)).join(',')})`;
  } else {
    throw new HttpException(
      dataResponseError(`Tipo de dato no permitido [${typeof value}].`, { status: 422 }),
      422,
    );
  }
}

export function validSqlValue(strValue) {
  const regexValidParam = new RegExp(
    /SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|\bUNION\b|\bSELECT\s+.*?\bFROM\b|\bINSERT\s+INTO\b|\bUPDATE\b|\bDELETE\s+FROM\b|'|\bOR\b|\bAND\b|\bSELECT\s+CASE\b|\bWHEN\b|\bTHEN\b|\bEND\b|\bEXEC\b|\bEXECUTE\b|\bTRUNCATE\b|\bDROP\b|\bALTER\b|\bCREATE\b|\bTABLE\b|\bDATABASE\b|\bGROUP\s+BY\b|\bHAVING\b|\bORDER\s+BY\b|\bLIKE\b|\bIS\s+NULL\b|\bNULL\s+OR\b|\bNULL\s+AND\b|`/,
    'gi',
  );
  const isInjectionAttempt = regexValidParam.test(strValue);
  return !isInjectionAttempt;
}

export function assignValuesToQuery(
  query: string,
  values: { [key: string]: string | number | Array<number | string> },
): string {
  //check query
  const regexQuery = /INSERT|UPDATE|DELETE|ALTER|CREATE|DROP|TRIGGER|CHECK`\b/i;
  if (regexQuery.test(query))
    throw new HttpException(
      dataResponseError(`Esta consulta no se puede realizar: "${query}".`, { status: 422 }),
      422,
    );

  let queryReplaced = query;
  // List values
  Object.keys(values).forEach((valueKey) => {
    /* ------------------------ REPLACE VALUES IN QUERY ------------------------ */
    queryReplaced = queryReplaced.replace(
      new RegExp(`\\$${valueKey}`, 'g'),
      getFormatTipoToQuery(values[valueKey]),
    );
  });
  return queryReplaced;
}

/* ------------------------------------------ ORDER BY ------------------------------------------ */

export function convertStrOrderByToObject<T>(strorderby: { [key: string]: string }): T {
  let objOrderBy: T = {} as T;
  try {
    const parseOB = strorderby;
    const key = Object.keys(parseOB)[0];
    if (key.includes('.')) {
      const arrObject = key.split('.');
      objOrderBy = arrObject.reverse().reduce(
        (pv, pk) => {
          const objetAnidado = {};
          objetAnidado[pk] = pv;
          return objetAnidado;
        },
        parseOB[key].toLowerCase() === 'desc' ? 'desc' : 'asc',
      ) as T;
    } else {
      objOrderBy[key] = parseOB[key].toLowerCase() === 'desc' ? 'desc' : 'asc';
    }
  } catch (_) {
    return undefined;
  }
  return objOrderBy;
}
