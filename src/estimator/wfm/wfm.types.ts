export type WfmUserStatus = 'ingame' | 'online' | 'offline' | 'invisible';

export interface WfmUserShort {
  ingameName: string;
  status: WfmUserStatus;
  reputation?: number;
  platform?: string;
  crossplay?: boolean;
}

export interface WfmOrderWithUser {
  id: string;
  type: 'sell' | 'buy';
  platinum: number;
  quantity: number;
  visible?: boolean;
  user: WfmUserShort;
}

export interface WfmApiEnvelope<T> {
  apiVersion?: string;
  data: T | null;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  error: any | null;
}
export interface WfmItemOrdersResponse {
  orders: WfmOrderWithUser[];
}
