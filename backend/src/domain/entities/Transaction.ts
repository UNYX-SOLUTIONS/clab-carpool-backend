export interface TransactionProps {
  id: string;
  walletId: string;
  userId: string;
  amount: number;
  type: string;
  status: string;
  description?: string | null;
  referenceId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Transaction {
  private constructor(private readonly props: TransactionProps) {}

  static create(props: TransactionProps): Transaction {
    return new Transaction(props);
  }

  toJSON(): TransactionProps {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get walletId(): string {
    return this.props.walletId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get amount(): number {
    return this.props.amount;
  }

  get type(): string {
    return this.props.type;
  }

  get status(): string {
    return this.props.status;
  }

  get description(): string | null | undefined {
    return this.props.description;
  }

  get referenceId(): string | null | undefined {
    return this.props.referenceId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
