export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  created_at: number;
}

export interface CommerceLayerSkuResponse {
  data: SkuData[];
  meta: {
    page_count: number;
    record_count: number;
  };
}

export interface SkuData {
  id: string;
  type: string;
  attributes: {
    code: string;
    name: string;
    description: string;
    image_url?: string;
    [key: string]: any;
  };
  relationships?: {
    [key: string]: any;
  };
}
