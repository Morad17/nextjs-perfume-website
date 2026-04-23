export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  size: number;
}

export interface Order {
  id: string;
  stripeSessionId: string;
  customerEmail: string;
  customerName: string;
  status: OrderStatus;
  total: number;
  shippingAddress: Record<string, unknown>;
  createdAt: Date;
  items: OrderItem[];
}
