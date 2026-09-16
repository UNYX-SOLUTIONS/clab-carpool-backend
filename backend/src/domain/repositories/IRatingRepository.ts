import { Rating } from '../entities/Rating';

export interface CreateRatingData {
  travelId: string;
  raterId: string;
  ratedId: string;
  score: number;
  comment?: string;
}

export interface IRatingRepository {
  create(data: CreateRatingData): Promise<Rating>;
  findByTravelAndRater(travelId: string, raterId: string): Promise<Rating | null>;
  findByRatedUser(ratedId: string): Promise<Rating[]>;
  getAverageByRatedUser(ratedId: string): Promise<number | null>;
}
