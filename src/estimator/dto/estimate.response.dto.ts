export type UserStatus = 'ingame' | 'online' | 'offline' | 'invisible';

export interface SellerDto {
  orderId: string;
  ingameName: string;
  status: UserStatus;
  reputation: number | null;
  price: number;
  quantity: number;
}

export interface EstimatedItemDto {
  slug: string;
  quantity: number;
  estimatedUnitPrice: number | null;
  subtotal: number | null;
  seller: SellerDto | null;
}

export type UnavailableReason = 'no_sell_orders' | 'not_found' | 'wfm_error';

export interface UnavailableItemDto {
  slug: string;
  reason: UnavailableReason;
}

export interface EstimateResponseDto {
  platform: 'pc';
  crossplay: boolean;
  currency: 'platinum';
  total: number;
  items: EstimatedItemDto[];
  unavailable: UnavailableItemDto[];
  generatedAt: string; // ISO
}
