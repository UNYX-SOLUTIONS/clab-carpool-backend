import { PrismaClient } from '@prisma/client';

import { Rating } from '../../domain/entities/Rating';
import {
  CreateRatingData,
  IRatingRepository,
} from '../../domain/repositories/IRatingRepository';

export class PrismaRatingRepository implements IRatingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateRatingData): Promise<Rating> {
    const rating = await this.prisma.rating.create({
      data: {
        travelId: data.travelId,
        raterId: data.raterId,
        ratedId: data.ratedId,
        score: data.score,
        comment: data.comment,
      },
    });

    return Rating.create({
      id: rating.id,
      travelId: rating.travelId,
      raterId: rating.raterId,
      ratedId: rating.ratedId,
      score: rating.score,
      comment: rating.comment,
      createdAt: rating.createdAt,
      updatedAt: rating.updatedAt,
    }).value;
  }

  async findByTravelAndRater(
    travelId: string,
    raterId: string,
  ): Promise<Rating | null> {
    const rating = await this.prisma.rating.findFirst({
      where: { travelId, raterId },
    });

    if (!rating) return null;

    return Rating.create({
      id: rating.id,
      travelId: rating.travelId,
      raterId: rating.raterId,
      ratedId: rating.ratedId,
      score: rating.score,
      comment: rating.comment,
      createdAt: rating.createdAt,
      updatedAt: rating.updatedAt,
    }).value;
  }

  async findByRatedUser(ratedId: string): Promise<Rating[]> {
    const ratings = await this.prisma.rating.findMany({
      where: { ratedId },
      orderBy: { createdAt: 'desc' },
    });

    return ratings.map((rating) =>
      Rating.create({
        id: rating.id,
        travelId: rating.travelId,
        raterId: rating.raterId,
        ratedId: rating.ratedId,
        score: rating.score,
        comment: rating.comment,
        createdAt: rating.createdAt,
        updatedAt: rating.updatedAt,
      }).value,
    );
  }

  async getAverageByRatedUser(ratedId: string): Promise<number | null> {
    const aggregate = await this.prisma.rating.aggregate({
      where: { ratedId },
      _avg: { score: true },
    });

    if (aggregate._avg.score === null || aggregate._avg.score === undefined) {
      return null;
    }

    return Math.round(aggregate._avg.score * 100) / 100;
  }
}
