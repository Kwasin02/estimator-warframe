/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { WfmApiEnvelope, WfmOrderWithUser } from './wfm.types';

@Injectable()
export class WfmHttpClient {
  private readonly baseUrl = 'https://api.warframe.market/v2';

  constructor(private readonly http: HttpService) {}

  /**
   * Obtiene órdenes de un item por slug.
   * Header Platform=pc fijo. CrossPlay configurable.
   */
  async getOrdersByItemSlug(params: {
    slug: string;
    crossplay: boolean;
  }): Promise<{ orders: WfmOrderWithUser[]; notFound: boolean }> {
    const { slug, crossplay } = params;

    const url = `${this.baseUrl}/orders/item/${encodeURIComponent(slug)}`;

    try {
      const resp = await firstValueFrom(
        this.http.get(url, {
          headers: {
            Platform: 'pc',
            CrossPlay: String(crossplay),
          },
          timeout: 10_000,
        }),
      );

      const body = resp.data as WfmApiEnvelope<any>;

      // Si el envelope marca error, tratamos como fallo (pero sin throw)
      if (body?.error) {
        return { orders: [], notFound: false };
      }

      // La doc general indica {data, error}, pero la forma exacta del data puede variar por endpoint.
      // Intentamos extraer órdenes de manera tolerante:
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const ordersCandidate =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        body?.data?.orders ??
        body?.data?.payload?.orders ??
        body?.data?.items ??
        body?.data;

      const orders = Array.isArray(ordersCandidate)
        ? (ordersCandidate as WfmOrderWithUser[])
        : [];

      return { orders, notFound: false };
    } catch (e) {
      const err = e as AxiosError;

      const status = err.response?.status;
      if (status === 404) return { orders: [], notFound: true };

      // Rate limit / cloudflare / network: lo tratamos como wfm_error
      return { orders: [], notFound: false };
    }
  }
}
