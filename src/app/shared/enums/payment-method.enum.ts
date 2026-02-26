/**
 * Métodos de pagamento
 */
export enum EPaymentMethod {
  CreditCard = 'CREDIT_CARD',
  DebitCard = 'DEBIT_CARD',
  Pix = 'PIX',
  Boleto = 'BOLETO',
  PayPal = 'PAYPAL',
}

/**
 * Labels para exibição
 */
export const PaymentMethodLabels: Record<EPaymentMethod, string> = {
  [EPaymentMethod.CreditCard]: 'Credit Card',
  [EPaymentMethod.DebitCard]: 'Debit Card',
  [EPaymentMethod.Pix]: 'PIX',
  [EPaymentMethod.Boleto]: 'Boleto',
  [EPaymentMethod.PayPal]: 'PayPal',
};

/**
 * Ícones para cada método
 */
export const PaymentMethodIcons: Record<EPaymentMethod, string> = {
  [EPaymentMethod.CreditCard]: 'credit_card',
  [EPaymentMethod.DebitCard]: 'credit_card',
  [EPaymentMethod.Pix]: 'qr_code',
  [EPaymentMethod.Boleto]: 'receipt',
  [EPaymentMethod.PayPal]: 'account_balance',
};
