export enum SortOrder {
  asc,
  desc,
}

export type QueryFunction = (record: unknown) => boolean;