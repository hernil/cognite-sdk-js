/*!
 * Copyright 2019 Cognite AS
 */

export interface AssetIdEither {
  /**
   * A JavaScript-friendly internal ID for the object.
   */
  id?: number;
  /**
   * The external ID provided by the client. Must be unique within the project.
   */
  externalId?: string;
}