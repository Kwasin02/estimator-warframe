export interface ItemSearchResultDto {
  slug: string;
  name: string; // i18n.name (si existe) o fallback al slug
  icon?: string | null;
  thumb?: string | null;
  tags?: string[];
}

export interface ItemsSearchResponseDto {
  q: string;
  count: number;
  results: ItemSearchResultDto[];
  cachedAt: string; // ISO
}
