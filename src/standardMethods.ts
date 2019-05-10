// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { makeAutoPaginationMethods } from './autoPagination';
import { rawRequest } from './axiosWrappers';
import { MetadataMap } from './metadata';
import { CursorResponse, ItemsResponse } from './types/types';

type CreateEndpoint<RequestType, ResponseType> = (
  items: RequestType[]
) => Promise<ResponseType[]>;

/** @hidden */
export function generateCreateEndpoint<RequestType, ResponseType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap
): CreateEndpoint<RequestType, ResponseType> {
  return async function create(items) {
    type Response = ItemsResponse<ResponseType>;
    const response = await rawRequest<Response>(axiosInstance, {
      method: 'post',
      url: resourcePath,
      data: { items },
    });
    return metadataMap.addAndReturn(response.data.items, response);
  };
}

/** @hidden */
export function listByGet<RequestFilter, ResponseType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  filter: RequestFilter
) {
  return rawRequest<CursorResponse<ResponseType>>(
    axiosInstance,
    {
      method: 'get',
      url: resourcePath,
      params: filter,
    },
    true
  );
}

/** @hidden */
export function listByPost<RequestFilter, ResponseType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  filter: RequestFilter
) {
  return rawRequest<CursorResponse<ResponseType>>(
    axiosInstance,
    {
      method: 'post',
      url: `${resourcePath}/list`,
      data: filter,
    },
    true
  );
}

/** @hidden */
export function generateListEndpoint<
  RequestFilter extends object,
  ResponseType
>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap,
  withPost: boolean = true
) {
  function addNextPageFunction<T>(
    dataWithCursor: CursorResponse<T>,
    params: RequestFilter
  ) {
    const { nextCursor } = dataWithCursor;
    const next = nextCursor
      ? () => list(Object.assign({}, params, { cursor: nextCursor }))
      : undefined;
    Object.assign(dataWithCursor, { next });
  }

  async function list(filter: RequestFilter) {
    const response = await (withPost
      ? listByPost<RequestFilter, ResponseType>(
          axiosInstance,
          resourcePath,
          filter
        )
      : listByGet<RequestFilter, ResponseType>(
          axiosInstance,
          resourcePath,
          filter
        ));
    addNextPageFunction(response.data, filter);
    return metadataMap.addAndReturn(response.data, response);
  }

  return (params: RequestFilter = {} as RequestFilter) => {
    const listPromise = list(params);
    return Object.assign(
      listPromise,
      listPromise,
      makeAutoPaginationMethods(listPromise)
    );
  };
}

/** @hidden */
export function generateSimpleListEndpoint<RequestParams, ResponseType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap
) {
  return async function list(filter: RequestParams): Promise<ResponseType[]> {
    const response = await rawRequest<ItemsResponse<ResponseType>>(
      axiosInstance,
      {
        method: 'post',
        url: `${resourcePath}/list`,
        data: filter,
      },
      true
    );
    return metadataMap.addAndReturn(response.data.items, response);
  };
}

export function generateRetrieveEndpoint<IdType, ResponseType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap
) {
  return async function retrieve(ids: IdType[]): Promise<ResponseType[]> {
    const response = await rawRequest<ItemsResponse<ResponseType>>(
      axiosInstance,
      {
        method: 'post',
        url: `${resourcePath}/byids`,
        data: { items: ids },
      },
      true
    );
    return metadataMap.addAndReturn(response.data.items, response);
  };
}

export function generateRetrieveSingleEndpoint<IdType, ResponseType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap
) {
  return async function retrieveSingle(id: IdType): Promise<ResponseType> {
    const response = await rawRequest<ResponseType>(axiosInstance, {
      url: `${resourcePath}/${id}`,
      method: 'get',
    });
    return metadataMap.addAndReturn(response.data, response);
  };
}

/** @hidden */
export function generateDeleteEndpoint<IdType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap
) {
  return async function remove(ids: IdType[]): Promise<{}> {
    const response = await rawRequest<{}>(
      axiosInstance,
      {
        url: `${resourcePath}/delete`,
        method: 'post',
        data: { items: ids },
      },
      true
    );
    return metadataMap.addAndReturn({}, response);
  };
}

/** @hidden */
export function generateUpdateEndpoint<RequestType, ResponseType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap
) {
  return async function update(
    changes: RequestType[]
  ): Promise<ResponseType[]> {
    type Response = ItemsResponse<ResponseType>;
    const response = await rawRequest<Response>(axiosInstance, {
      url: `${resourcePath}/update`,
      method: 'post',
      data: { items: changes },
    });
    return metadataMap.addAndReturn(response.data.items, response);
  };
}

/** @hidden */
export function generateSearchEndpoint<RequestParams, ResponseType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap
) {
  return async function search(query: RequestParams): Promise<ResponseType[]> {
    const response = await rawRequest<ItemsResponse<ResponseType>>(
      axiosInstance,
      {
        method: 'post',
        url: `${resourcePath}/search`,
        data: query,
      },
      true
    );
    return metadataMap.addAndReturn(response.data.items, response);
  };
}

/** @hidden */
export function generateRetrieveLatestEndpoint<RequestParams, ResponseType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap
) {
  return async function retrieveLatest(
    query: RequestParams
  ): Promise<ResponseType[]> {
    const response = await rawRequest<ItemsResponse<ResponseType>>(
      axiosInstance,
      {
        method: 'post',
        url: `${resourcePath}/latest`,
        data: query,
      },
      true
    );
    return metadataMap.addAndReturn(response.data.items, response);
  };
}

/** @hidden */
export function generateInsertEndpoint<RequestParams, ResponseType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap
) {
  return async function insert(items: RequestParams): Promise<{}> {
    const response = await rawRequest<ItemsResponse<ResponseType>>(
      axiosInstance,
      {
        method: 'post',
        url: resourcePath,
        data: { items },
      },
      true
    );
    return metadataMap.addAndReturn({}, response);
  };
}