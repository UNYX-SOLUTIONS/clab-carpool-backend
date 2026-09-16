import { Result } from '../../shared/core/Result';
import { ValidationException } from '../exceptions/ValidationException';

export interface RatingProps {
  id: string;
  travelId: string;
  raterId: string;
  ratedId: string;
  score: number;
  comment?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Rating {
  private constructor(private readonly props: RatingProps) {}

  static create(props: RatingProps): Result<Rating> {
    if (!Number.isInteger(props.score) || props.score < 1 || props.score > 5) {
      return Result.fail(
        new ValidationException('La calificación debe ser un entero entre 1 y 5'),
      );
    }

    return Result.ok(new Rating(props));
  }

  toJSON(): RatingProps {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get travelId(): string {
    return this.props.travelId;
  }

  get raterId(): string {
    return this.props.raterId;
  }

  get ratedId(): string {
    return this.props.ratedId;
  }

  get score(): number {
    return this.props.score;
  }

  get comment(): string | null | undefined {
    return this.props.comment;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
