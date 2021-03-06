// Copyright 2019 Cognite AS

export { loginPopupHandler, isLoginPopupWindow } from './resources/login';
export { default as CogniteClient, POPUP, REDIRECT } from './cogniteClient';
export * from './types/types';
export { CogniteError } from './error';
export { CogniteMultiError } from './multiError';
export { CogniteLoginError } from './loginError';
export { HttpError } from './utils/http/httpError';
export { Asset as AssetClass } from './resources/classes/asset';
export { TimeSeries as TimeSeriesClass } from './resources/classes/timeSeries';
export { AssetList } from './resources/classes/assetList';
export { TimeSeriesList } from './resources/classes/timeSeriesList';
export {
  AuthTokens,
  AuthenticateParams,
  AuthorizeOptions,
  AuthorizeParams,
  IdInfo,
  OnAuthenticateLoginObject,
} from './resources/login';
