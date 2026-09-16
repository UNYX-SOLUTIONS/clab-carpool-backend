import { Result } from '../../shared/core/Result';
import { ValidationException } from '../exceptions/ValidationException';

export interface VehicleProps {
  id: string;
  userId: string;
  brand: string;
  model: string;
  plate: string;
  color: string;
  seats: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Vehicle {
  private constructor(private readonly props: VehicleProps) {}

  static create(props: VehicleProps): Result<Vehicle> {
    if (props.seats < 1 || props.seats > 10) {
      return Result.fail(
        new ValidationException('El número de asientos debe estar entre 1 y 10'),
      );
    }

    if (!props.brand.trim() || !props.model.trim() || !props.color.trim()) {
      return Result.fail(
        new ValidationException('Marca, modelo y color son obligatorios'),
      );
    }

    return Result.ok(new Vehicle(props));
  }

  toJSON(): VehicleProps {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get brand(): string {
    return this.props.brand;
  }

  get model(): string {
    return this.props.model;
  }

  get plate(): string {
    return this.props.plate;
  }

  get color(): string {
    return this.props.color;
  }

  get seats(): number {
    return this.props.seats;
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
}
