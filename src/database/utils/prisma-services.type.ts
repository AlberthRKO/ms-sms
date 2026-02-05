export type PrismaMethodOptionsType<TransactionClient> = {
  message?: string;
  status?: number;
  txClient?: TransactionClient;
};

export type PrismaPaginationType = {
  page?: number;
  size?: number;
};

export function convertPageSizeToPrismaFormat(data: PrismaPaginationType): {
  skip?: number;
  take?: number;
} {
  return {
    skip: data.size ? (data.page > 0 ? (data.page - 1) * data.size : 0) : undefined,
    take: data.size,
  };
}

export type CacheMappedListType<T> = {
  [key: string | number]: T;
};
