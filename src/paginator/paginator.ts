export interface PaginatedResult<T> {
    data: T[]
    pagination: {
      total: number
      lastPage: number
      currentPage: number
      limit: number
      prev: number | null
      next: number | null
    }
  }
  
  export type PaginateOptions = { page?: number | string, limit?: number | string }
  export type PaginateFunction = <T, K>(model: any, args?: K, options?: PaginateOptions) => Promise<PaginatedResult<T>>
  
  export const paginator = (defaultOptions: PaginateOptions): PaginateFunction => {
    return async (model, args: any = { where: undefined }, options) => {
      const page = Number(options?.page || defaultOptions?.page) || 1;
      const limit = Number(options?.limit || defaultOptions?.limit) || 10;
  
      const skip = page > 0 ? limit * (page - 1) : 0;
      const [total, data] = await Promise.all([
        model.count({ where: args.where }),
        model.findMany({
          ...args,
          take: limit,
          skip,
        }),
      ]);
      const lastPage = Math.ceil(total / limit);
  
      return {
        data,
        pagination: {
          total,
          lastPage,
          currentPage: page,
          limit,
          prev: page > 1 ? page - 1 : null,
          next: page < lastPage ? page + 1 : null,
        },
      };
    };
  };