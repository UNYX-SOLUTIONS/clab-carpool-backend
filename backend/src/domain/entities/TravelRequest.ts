export interface TravelRequestProps {
  id: string;
  travelId: string;
  passengerId: string;
  passengerName?: string;
  status: string;
  requestedAt: Date;
  confirmedAt?: Date | null;
  rejectedAt?: Date | null;
  cancelledAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class TravelRequest {
  private constructor(private readonly props: TravelRequestProps) {}

  static create(props: TravelRequestProps): TravelRequest {
    return new TravelRequest(props);
  }

  toJSON(): TravelRequestProps {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get travelId(): string {
    return this.props.travelId;
  }

  get passengerId(): string {
    return this.props.passengerId;
  }

  get passengerName(): string | undefined {
    return this.props.passengerName;
  }

  get status(): string {
    return this.props.status;
  }

  get requestedAt(): Date {
    return this.props.requestedAt;
  }

  get confirmedAt(): Date | null | undefined {
    return this.props.confirmedAt;
  }

  get rejectedAt(): Date | null | undefined {
    return this.props.rejectedAt;
  }

  get cancelledAt(): Date | null | undefined {
    return this.props.cancelledAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
