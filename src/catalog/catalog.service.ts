import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  ItemsSearchResponseDto,
  ItemSearchResultDto,
} from './dto/items-search.response.dto';

type ItemShort = {
  id?: string;
  slug: string;
  tags?: string[];
  i18n?: {
    en?: {
      name?: string;
      icon?: string;
      thumb?: string;
    };
  };
};

type WfmEnvelope<T> = {
  apiVersion?: string;
  data: T | null;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  error: any | null;
};

@Injectable()
export class CatalogService {
  private itemsCache: ItemShort[] | null = null;
  private cacheFetchedAt: number | null = null;
  private readonly cacheTtlMs = 24 * 60 * 60 * 1000; // 24h

  private readonly baseUrl = 'https://api.warframe.market/v2';

  constructor(private readonly http: HttpService) {}

  async search(q: string, limit = 20): Promise<ItemsSearchResponseDto> {
    const query = (q ?? '').trim();
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    if (!query) {
      return {
        q: '',
        count: 0,
        results: [],
        cachedAt: this.cacheFetchedAt
          ? new Date(this.cacheFetchedAt).toISOString()
          : new Date().toISOString(),
      };
    }

    const items = await this.getItemsCached();
    const normalizedQ = this.normalize(query);

    const scored = items
      .map((it) => {
        const name = it.i18n?.en?.name ?? it.slug;
        const hay = this.normalize(
          `${it.slug} ${name} ${(it.tags ?? []).join(' ')}`,
        );

        // 0 = startsWith (mejor), 1 = contains
        let score = 999;
        if (
          this.normalize(it.slug).startsWith(normalizedQ) ||
          this.normalize(name).startsWith(normalizedQ)
        ) {
          score = 0;
        } else if (hay.includes(normalizedQ)) {
          score = 1;
        }

        return { it, name, score };
      })
      .filter((x) => x.score !== 999)
      .sort((a, b) => {
        // 1) score base
        if (a.score !== b.score) return a.score - b.score;

        // 2) intención por tags (warframe sets primero)
        const pa = this.intentPriority(a.it);
        const pb = this.intentPriority(b.it);
        if (pa !== pb) return pa - pb;

        // 3) desempate: slug más corto
        return a.it.slug.length - b.it.slug.length;
      })
      .slice(0, safeLimit);

    const results: ItemSearchResultDto[] = scored.map(({ it, name }) => ({
      slug: it.slug,
      name,
      // imágenes NO importan, pero las dejo por si luego las usas
      icon: it.i18n?.en?.icon ?? null,
      thumb: it.i18n?.en?.thumb ?? null,
      tags: it.tags ?? [],
    }));

    return {
      q: query,
      count: results.length,
      results,
      cachedAt: new Date(this.cacheFetchedAt ?? Date.now()).toISOString(),
    };
  }

  private async getItemsCached(): Promise<ItemShort[]> {
    const now = Date.now();
    const fresh =
      this.itemsCache &&
      this.cacheFetchedAt !== null &&
      now - this.cacheFetchedAt < this.cacheTtlMs;

    if (fresh) return this.itemsCache!;

    const url = `${this.baseUrl}/items`;

    const resp = await firstValueFrom(
      this.http.get(url, {
        headers: {
          Platform: 'pc',
          Language: 'en',
        },
        timeout: 15_000,
      }),
    );

    const body = resp.data as WfmEnvelope<any>;

    if (body?.error) {
      // si falla y existe cache, úsalo
      if (this.itemsCache) return this.itemsCache;
      return [];
    }

    // /v2/items devuelve data: ItemShort[]
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const candidate = body?.data;
    const items: ItemShort[] = Array.isArray(candidate)
      ? (candidate as ItemShort[])
      : [];

    this.itemsCache = items;
    this.cacheFetchedAt = now;

    return items;
  }

  private intentPriority(it: ItemShort): number {
    const tags = new Set((it.tags ?? []).map((t) => this.normalize(t)));

    const isWarframe = tags.has('warframe');
    const isSet = tags.has('set');
    const isBlueprint = tags.has('blueprint');
    const isComponent = tags.has('component');

    // menor = mejor
    if (isWarframe && isSet) return 0; // warframe set
    if (isWarframe && isBlueprint && isComponent) return 1; // partes blueprint
    if (isWarframe && isBlueprint) return 2; // blueprint general
    if (tags.has('mod')) return 5; // mods abajo
    if (tags.has('skin') || tags.has('arcane_helmet')) return 6; // cosméticos abajo
    return 3; // resto
  }

  private normalize(s: string): string {
    return s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9 _-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
