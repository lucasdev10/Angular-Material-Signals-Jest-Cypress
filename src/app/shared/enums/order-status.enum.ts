/**
 * Status de pedidos
 */
export enum EOrderStatus {
  Pending = 'PENDING',
  Processing = 'PROCESSING',
  Shipped = 'SHIPPED',
  Delivered = 'DELIVERED',
  Cancelled = 'CANCELLED',
  Refunded = 'REFUNDED',
}

/**
 * Labels para exibição
 */
export const OrderStatusLabels: Record<EOrderStatus, string> = {
  [EOrderStatus.Pending]: 'Pending',
  [EOrderStatus.Processing]: 'Processing',
  [EOrderStatus.Shipped]: 'Shipped',
  [EOrderStatus.Delivered]: 'Delivered',
  [EOrderStatus.Cancelled]: 'Cancelled',
  [EOrderStatus.Refunded]: 'Refunded',
};

/**
 * Cores para cada status
 */
export const OrderStatusColors: Record<EOrderStatus, string> = {
  [EOrderStatus.Pending]: 'warn',
  [EOrderStatus.Processing]: 'accent',
  [EOrderStatus.Shipped]: 'primary',
  [EOrderStatus.Delivered]: 'success',
  [EOrderStatus.Cancelled]: 'error',
  [EOrderStatus.Refunded]: 'warn',
};
