// Copyright 2019 Cognite AS

import {
  Asset as TypeAsset,
  CogniteClient,
  EventFilter,
  FileFilter,
  TimeseriesFilter,
} from '../../index';
import {
  AssetAggregateResult,
  AssetDescription,
  AssetName,
  AssetSource,
  CogniteExternalId,
  CogniteInternalId,
  Metadata,
} from '../../types/types';
import { AssetList } from './assetList';
import { BaseResource } from './baseResource';

export interface SubtreeOptions {
  depth?: number;
}
export interface DeleteOptions {
  recursive?: boolean;
}
export class Asset extends BaseResource<TypeAsset> implements TypeAsset {
  public id: CogniteInternalId;
  public externalId?: CogniteExternalId;
  public parentId?: CogniteInternalId;
  public name: AssetName;
  public description?: AssetDescription;
  public metadata?: Metadata;
  public source?: AssetSource;
  public lastUpdatedTime: Date;
  public createdTime: Date;
  public rootId: CogniteInternalId;
  public aggregates?: AssetAggregateResult;
  public parentExternalId?: CogniteExternalId;

  constructor(client: CogniteClient, props: TypeAsset) {
    super(client);
    this.id = props.id;
    this.externalId = props.externalId;
    this.parentId = props.parentId;
    this.name = props.name;
    this.description = props.description;
    this.metadata = props.metadata;
    this.source = props.source;
    this.lastUpdatedTime = props.lastUpdatedTime;
    this.createdTime = props.createdTime;
    this.rootId = props.rootId;
    this.aggregates = props.aggregates;
    this.parentExternalId = props.parentExternalId;

    Object.defineProperties(this, {
      delete: { value: this.delete.bind(this), enumerable: false },
      parent: { value: this.parent.bind(this), enumerable: false },
      children: { value: this.children.bind(this), enumerable: false },
      subtree: { value: this.subtree.bind(this), enumerable: false },
      timeSeries: { value: this.timeSeries.bind(this), enumerable: false },
      events: { value: this.events.bind(this), enumerable: false },
      files: { value: this.files.bind(this), enumerable: false },
    });
  }

  /**
   * Deletes the current asset
   *
   * @param {DeleteOptions} options Allow to delete recursively, default ({}) is recursive = false
   * ```js
   * await asset.delete();
   * ```
   */
  public async delete(options: DeleteOptions = {}) {
    return this.client.assets.delete(
      [
        {
          id: this.id,
        },
      ],
      options
    );
  }

  /**
   * Retrieves the parent of the current asset
   * ```js
   * const parentAsset = await asset.parent();
   * ```
   */
  public async parent() {
    if (this.parentId) {
      const [parentAsset] = await this.client.assets.retrieve([
        { id: this.parentId },
      ]);
      return parentAsset;
    }
    return null;
  }

  /**
   * Returns an AssetList object with all children of the current asset
   * ```js
   * const children = await asset.children();
   * ```
   */
  public async children() {
    const childAssets = await this.client.assets
      .list({
        filter: {
          parentIds: [this.id],
        },
      })
      .autoPagingToArray({ limit: Infinity });
    return new AssetList(this.client, childAssets);
  }

  /**
   * Returns the full subtree of the current asset, including the asset itself
   * @param {SubtreeOptions} options Specify the depth of the required subtree, default is the whole asset-hierarchy
   * ```js
   * const subtree = await asset.subtree();
   * ```
   */
  public async subtree(options?: SubtreeOptions) {
    const query: SubtreeOptions = options || {};
    return this.client.assets.retrieveSubtree(
      { id: this.id },
      query.depth || Infinity
    );
  }

  /**
   * Returns all timeseries for the current asset
   * @param {TimeseriesFilter} filter Allow specified filter for what timeseries to retrieve
   * ```js
   * const timeSeries = await asset.timeSeries();
   * ```
   */
  public async timeSeries(filter: TimeseriesFilter = {}) {
    return this.client.timeseries
      .list({
        ...filter,
        assetIds: [this.id],
      })
      .autoPagingToArray({ limit: Infinity });
  }

  /**
   * Returns all events for the current asset
   * @param {EventFilter} filter Allow specified filter for what events to retrieve
   * ```js
   * const events = await asset.events();
   * ```
   */
  public async events(filter: EventFilter = {}) {
    return this.client.events
      .list({
        filter: { ...filter, assetIds: [this.id] },
      })
      .autoPagingToArray({ limit: Infinity });
  }

  /**
   * Returns all files for the current asset
   * @param {FileFilter} filter Allow specified filter for what files to retrieve
   * ```js
   * const files = await asset.files();
   * ```
   */
  public async files(filter: FileFilter = {}) {
    return this.client.files
      .list({
        filter: { ...filter, assetIds: [this.id] },
      })
      .autoPagingToArray({ limit: Infinity });
  }

  public toJSON() {
    return { ...this };
  }
}
