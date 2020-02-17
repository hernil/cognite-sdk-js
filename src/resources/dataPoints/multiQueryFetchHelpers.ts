// Copyright 2019 Cognite AS

import _ from 'lodash';
import ms from 'ms';
import {
  DatapointsGetAggregateDatapoint,
  DatapointsGetDatapoint,
  DatapointsMultiQuery,
  ItemsWrapper,
} from '../..';
import { API_MAX_DATAPOINTS_PER_REQUEST } from '../../constants';
import { CDFHttpClient } from '../../utils/http/cdfHttpClient';
import {
  ConsolidatedQueryValues,
  PotentiallyUndefinedQueryValues,
  QueryResponse,
} from './types';

function cleanQueryInput(
  q: DatapointsMultiQuery
): PotentiallyUndefinedQueryValues {
  function alwaysReturnNumber(value: string | number | Date): number {
    if (typeof value === 'string') {
      return ms(value);
    }
    if (value instanceof Date) {
      return value.getMilliseconds();
    }
    return value;
  }
  function numberOrUndefined(
    // tslint:disable-next-line:max-union-size
    value: number | string | Date | undefined
  ): number | undefined {
    return typeof value === 'undefined' ? value : alwaysReturnNumber(value);
  }
  const start = numberOrUndefined(q.start);
  const end = numberOrUndefined(q.end);
  const limit = numberOrUndefined(q.limit);
  const granularity: undefined | number = numberOrUndefined(q.granularity);

  return { start, end, limit, granularity };
}

function extrapolateStart(
  end: number,
  granularity: number,
  limit: number
): number {
  return end - granularity * limit;
}

function extrapolateEnd(
  start: number,
  granularity: number,
  limit: number
): number {
  return start + granularity * limit;
}

function extrapolateLimit(
  start: number,
  end: number,
  granularity: number
): number {
  return Math.ceil((end - start) / granularity);
}

function extrapolateGranularity(start: number, end: number, limit: number) {
  return Math.floor((start - end) / limit);
}

export function extrapolateValues(
  query: DatapointsMultiQuery
): ConsolidatedQueryValues {
  // tslint:disable-next-line:no-shadowed-variable
  let { start, end, limit, granularity } = cleanQueryInput(query);
  if (start && end && granularity) {
    limit = extrapolateLimit(start, end, granularity);
  } else if (start && limit && granularity) {
    end = extrapolateEnd(start, limit, granularity);
  } else if (end && limit && granularity) {
    start = extrapolateStart(end, limit, granularity);
  } else if (start && end && limit) {
    granularity = extrapolateGranularity(start, end, limit);
  } else {
    throw new Error('Invalid query composition');
  }
  return { start, end, limit, granularity } as ConsolidatedQueryValues;
}

export function createRequests(
  originalQuery: DatapointsMultiQuery,
  httpClient: CDFHttpClient,
  path: string
) {
  const { start, end, granularity } = extrapolateValues(originalQuery);

  const requests = [];
  originalQuery.limit = API_MAX_DATAPOINTS_PER_REQUEST;
  originalQuery.granularity = ms(granularity);
  let newStart = start;
  let newEnd = 0;
  while (newEnd < end) {
    const { ...newQuery } = originalQuery;
    const potentialNewEnd =
      newStart + API_MAX_DATAPOINTS_PER_REQUEST * granularity;
    newEnd = potentialNewEnd < end ? potentialNewEnd : end;
    newQuery.start = newStart;
    newQuery.end = newEnd;
    const request = httpClient.post<
      ItemsWrapper<(DatapointsGetAggregateDatapoint | DatapointsGetDatapoint)[]>
    >(path, {
      data: newQuery,
    });
    requests.push(request);
    newStart = newEnd;
  }
  return requests;
}

export function mergeResponses(acc: QueryResponse, cur: QueryResponse) {
  // Override 'mergeWith' default behaviour for the datapoint array
  const concatAndSortDatapoints = (
    objValue: any,
    srcValue: any,
    key: string
  ) => {
    if (key === 'datapoints') {
      return (
        objValue
          .concat(srcValue)
          // Sorting has significant performance impact on larger data sets
          .sort(
            (a: { timestamp: Date }, b: { timestamp: Date }) =>
              a.timestamp.getTime() - b.timestamp.getTime()
          )
      );
    }
  };
  return _.mergeWith(cur, acc, concatAndSortDatapoints);
}