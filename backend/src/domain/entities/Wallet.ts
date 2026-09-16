export interface WalletProps {
  id: string;
  userId: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Wallet {
  private constructor(private readonly props: WalletProps) {}

  static create(props: WalletProps): Wallet {
    return new Wallet(props);
  }

  toJSON(): WalletProps {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get balance(): number {
    return this.props.balance;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
