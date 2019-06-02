// Copyright 2019 Cognite AS

import * as types from '../../types/types';
import { API } from '../api';
import { AssetList } from './assetList';

export class Asset implements types.Asset {
  public id: types.CogniteInternalId;
  public externalId?: types.CogniteExternalId;
  public parentId?: types.CogniteInternalId;
  public description?: types.AssetDescription;
  public metadata?: types.Metadata;
  public source?: types.AssetSource;
  public lastUpdatedTime: Date;
  public createdTime: Date;
  public path: number[];
  public depth: number;
  private client: API;

  constructor(client: API, props: types.Asset) {
    this.client = client;
    this.id = props.id;
    this.externalId = props.externalId;
    this.parentId = props.parentId;
    this.description = props.description;
    this.metadata = props.metadata;
    this.source = props.source;
    this.lastUpdatedTime = props.lastUpdatedTime;
    this.createdTime = props.createdTime;
    this.path = props.path;
    this.depth = props.depth;
  }

  public delete = () => {
    return this.client.assets.delete([
      {
        id: this.id,
      },
    ]);
  };

  public parent: () => Promise<null | Asset> = async () => {
    const { parentId } = this;
    if (!parentId) {
      return null;
    }
    const [parentAsset] = await this.client.assets.retrieve([{ id: parentId }]);
    return parentAsset;
  };

  public children: () => Promise<AssetList> = async () => {
    return this.client.assets
      .list({
        filter: {
          parentIds: [this.id],
        },
      })
      .autoPagingToArray();
  };
}