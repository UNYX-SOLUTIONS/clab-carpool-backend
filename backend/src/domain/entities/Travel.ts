import { Result } from '../../shared/core/Result';
import { ValidationException } from '../exceptions/ValidationException';

export interface TravelProps {
  id: string;
  driverId: string;
  driverName?: string;
  vehicleId: string;
  vehicle?: {
    brand: string;
    model: string;
    plate: string;
    color: string;
    seats: number;
  } | null;
  origin: string;
  destination: string;
  departureTime: Date;
  availableSeats: number;
  pricePerSeat: number;
  status: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Travel {
  private constructor(private readonly props: TravelProps) {}

  static create(props: TravelProps): Result<Travel> {
    if (!props.origin.trim() || !props.destination.trim()) {
      return Result.fail(
        new ValidationException('Origen y destino son obligatorios'),
      );
    }

    if (props.availableSeats < 0) {
      return Result.fail(
        new ValidationException('Los asientos disponibles no pueden ser negativos'),
      );
    }

    if (props.pricePerSeat < 0) {
      return Result.fail(
        new ValidationException('El precio por asiento no puede ser negativo'),
      );
    }

    if (props.departureTime.getTime() < Date.now()) {
      return Result.fail(
        new ValidationException('La hora de salida debe ser en el futuro'),
      );
    }

    return Result.ok(new Travel(props));
  }

  toJSON(): TravelProps {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get driverId(): string {
    return this.props.driverId;
  }

  get driverName(): string | undefined {
    return this.props.driverName;
  }

  get vehicleId(): string {
    return this.props.vehicleId;
  }

  get vehicle(): TravelProps['vehicle'] {
    return this.props.vehicle;
  }

  get origin(): string {
    return this.props.origin;
  }

  get destination(): string {
    return this.props.destination;
  }

  get departureTime(): Date {
    return this.props.departureTime;
  }

  get availableSeats(): number {
    return this.props.availableSeats;
  }

  get pricePerSeat(): number {
    return this.props.pricePerSeat;
  }

  get status(): string {
    return this.props.status;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  hasAvailableSeats(): boolean {
    return this.props.availableSeats > 0;
  }

  reserveSeat(): Result<void> {
    if (this.props.availableSeats <= 0) {
      return Result.fail(new ValidationException('No hay asientos disponibles'));
    }
    this.props.availableSeats -= 1;
    return Result.ok();
  }

  releaseSeat(): Result<void> {
    this.props.availableSeats += 1;
    return Result.ok();
  }
}
