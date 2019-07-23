/*!
 * Copyright 2019 Cognite AS
 */

export interface DataSecurityCategorySpecDTO {
  items: DataSecurityCategorySpecDTOItem[];
}

export interface DataSecurityCategorySpecDTOItem {
  /**
   * Name of the security category
   */
  name: string;
}