import { Injectable } from '@nestjs/common';
import { EstimateRequestDto } from './dto/estimate.request.dto';
import {
  EstimateResponseDto,
  EstimatedItemDto,
  SellerDto,
  UnavailableItemDto,
  UserStatus,
} from './dto/estimate.response.dto';
import { WfmHttpClient } from './wfm/wfm-http.client';
import { WfmOrderWithUser } from './wfm/wfm.types';

@Injectable()
export class EstimatorService {
  constructor(private readonly wfm: WfmHttpClient) {}

  async estimate(dto: EstimateRequestDto): Promise<EstimateResponseDto> {
    const crossplay = dto.crossplay ?? true;

    const itemsOut: EstimatedItemDto[] = [];
    const unavailable: UnavailableItemDto[] = [];

    // MVP: secuencial para evitar rate limit
    for (const item of dto.items) {
      const { slug, quantity } = item;

      const result = await this.wfm.getOrdersByItemSlug({ slug, crossplay });

      if (result.notFound) {
        unavailable.push({ slug, reason: 'not_found' });
        itemsOut.push({
          slug,
          quantity,
          estimatedUnitPrice: null,
          subtotal: null,
          seller: null,
        });
        continue;
      }

      const sellOrders = this.filterSellOrders(result.orders);

      if (sellOrders.length === 0) {
        // Si no hay órdenes y tampoco es notFound, asumimos “sin sell orders”
        unavailable.push({ slug, reason: 'no_sell_orders' });
        itemsOut.push({
          slug,
          quantity,
          estimatedUnitPrice: null,
          subtotal: null,
          seller: null,
        });
        continue;
      }

      const best = this.pickBestSeller(sellOrders);

      if (!best) {
        unavailable.push({ slug, reason: 'no_sell_orders' });
        itemsOut.push({
          slug,
          quantity,
          estimatedUnitPrice: null,
          subtotal: null,
          seller: null,
        });
        continue;
      }

      const unitPrice = best.platinum;
      const subtotal = unitPrice * quantity;

      const seller: SellerDto = {
        orderId: best.id,
        ingameName: best.user.ingameName,
        status: best.user.status,
        reputation: best.user.reputation ?? null,
        price: best.platinum,
        quantity: best.quantity,
      };

      itemsOut.push({
        slug,
        quantity,
        estimatedUnitPrice: unitPrice,
        subtotal,
        seller,
      });
    }

    const total = itemsOut.reduce((acc, it) => acc + (it.subtotal ?? 0), 0);

    return {
      platform: 'pc',
      crossplay,
      currency: 'platinum',
      total,
      items: itemsOut,
      unavailable,
      generatedAt: new Date().toISOString(),
    };
  }

  private filterSellOrders(orders: WfmOrderWithUser[]): WfmOrderWithUser[] {
    return (orders ?? []).filter((o) => {
      if (!o) return false;
      if (o.type !== 'sell') return false;
      if (typeof o.platinum !== 'number' || o.platinum <= 0) return false;
      if (typeof o.quantity !== 'number' || o.quantity <= 0) return false;
      if (!o.user?.ingameName) return false;

      // visible puede no venir; si viene, exigimos true
      if (typeof o.visible === 'boolean' && o.visible !== true) return false;

      // status si no viene, asumimos offline (pero aquí debería venir según OrderWithUser)
      return true;
    });
  }

  private pickBestSeller(orders: WfmOrderWithUser[]): WfmOrderWithUser | null {
    const ranked = [...orders].sort((a, b) => {
      // 1) status
      const sa = this.statusRank(a.user.status);
      const sb = this.statusRank(b.user.status);
      if (sa !== sb) return sa - sb;

      // 2) menor precio
      if (a.platinum !== b.platinum) return a.platinum - b.platinum;

      // 3) mayor reputación
      const ra = a.user.reputation ?? 0;
      const rb = b.user.reputation ?? 0;
      if (ra !== rb) return rb - ra;

      // 4) mayor cantidad
      return (b.quantity ?? 0) - (a.quantity ?? 0);
    });

    return ranked[0] ?? null;
  }

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  private statusRank(status: UserStatus | string | undefined): number {
    // menor = mejor
    switch (status) {
      case 'ingame':
        return 0;
      case 'online':
        return 1;
      case 'offline':
        return 2;
      case 'invisible':
        return 3;
      default:
        return 2;
    }
  }
}
