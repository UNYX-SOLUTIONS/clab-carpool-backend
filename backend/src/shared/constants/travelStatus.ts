export const TravelStatus = {
  ACTIVE: 'active',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type TravelStatusValue = (typeof TravelStatus)[keyof typeof TravelStatus];

export const TravelRequestStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
} as const;

export type TravelRequestStatusValue =
  (typeof TravelRequestStatus)[keyof typeof TravelRequestStatus];

export const TransactionType = {
  RECHARGE: 'recharge',
  PAYMENT: 'payment',
  REFUND: 'refund',
} as const;

export type TransactionTypeValue =
  (typeof TransactionType)[keyof typeof TransactionType];
