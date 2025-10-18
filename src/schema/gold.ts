export interface gold_price {
  id?: number;
  price?: string;
  price_time?: string;
  price_channel?: string;
  created_time?: Date;   // timestamptz -> Date | null（或 string | null）
  updated_time?: Date;   // timestamptz -> Date | null（或 string | null）
  price_time_type?: string;
  product_sku?: string;
}