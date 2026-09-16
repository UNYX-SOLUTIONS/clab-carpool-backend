export interface PinValidationProps {
  id: string;
  userId: string;
  travelId: string;
  pin: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class PinValidation {
  private constructor(private readonly props: PinValidationProps) {}

  static create(props: PinValidationProps): PinValidation {
    return new PinValidation(props);
  }

  toJSON(): PinValidationProps {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get travelId(): string {
    return this.props.travelId;
  }

  get pin(): string {
    return this.props.pin;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get isUsed(): boolean {
    return this.props.isUsed;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isExpired(): boolean {
    return this.props.expiresAt.getTime() < Date.now();
  }
}
