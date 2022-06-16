import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventAction } from 'src/entities/event.entity';
import {
  MileageHistory,
  MileageType,
} from 'src/entities/mileage-history.entity';
import { Mileage } from 'src/entities/mileage.entity';
import { Review } from 'src/entities/review.entity';
import { EventRequestDTO } from 'src/event/domain/dto/request.dto';
import { Repository } from 'typeorm';

@Injectable()
export class MileageProvider {
  constructor(
    @InjectRepository(Mileage)
    private readonly mileageStore: Repository<Mileage>,
    @InjectRepository(MileageHistory)
    private readonly mileageHistoryStore: Repository<MileageHistory>,
    @InjectRepository(Review) private readonly reviewStore: Repository<Review>,
  ) {}

  async calculate(
    payload: EventRequestDTO,
    review: Review,
    previousReview?: Review,
  ): Promise<void> {
    switch (payload.action) {
      case EventAction.ADD:
        await this.#addAction(payload);
        break;
      case EventAction.MODIFY:
        await this.#modAction(payload, review, previousReview);
        break;
      case EventAction.DELETE:
        await this.#deleteAction(payload, review);
    }
  }

  async #addAction(payload: EventRequestDTO): Promise<void> {
    let point = 0;
    const previous = await this.reviewStore.count({
      where: { placeId: payload.placeId },
    });
    const mileageHistory: Array<Partial<MileageHistory>> = [];

    if (previous === 1) {
      // First
      point += 1;
      mileageHistory.push({
        reviewId: payload.reviewId,
        type: MileageType.FIRST,
        point: 1,
      });
    }

    if (payload.content.length > 0) {
      point += 1;
      mileageHistory.push({
        reviewId: payload.reviewId,
        type: MileageType.CONTENT,
        point: 1,
      });
    }

    if (payload.attachedPhotoIds.length > 0) {
      point += 1;
      mileageHistory.push({
        reviewId: payload.reviewId,
        type: MileageType.PHOTOS,
        point: 1,
      });
    }

    const mileage =
      (await this.mileageStore.findOne({
        where: { userId: payload.userId },
      })) || this.mileageStore.create({ userId: payload.userId, point: 0 });
    mileage.point += point;
    await this.mileageStore.upsert(mileage, ['userId']);
    await this.mileageHistoryStore.save(
      mileageHistory.map((history) => ({ mileageId: mileage.id, ...history })),
    );
  }

  async #modAction(
    payload: EventRequestDTO,
    review: Review,
    previousReview: Review,
  ): Promise<void> {
    const mileage = await this.mileageStore.findOne({
      where: {
        userId: payload.userId,
      },
    });
    const mileageHistory: Array<Partial<MileageHistory>> = [];

    if (previousReview.photos.length > 0 && review.photos.length === 0) {
      mileage.point -= 1;
      mileageHistory.push({
        mileageId: mileage.id,
        reviewId: payload.reviewId,
        type: MileageType.PHOTOS,
        point: -1,
      });
    } else if (previousReview.photos.length === 0 && review.photos.length > 0) {
      mileage.point += 1;
      mileageHistory.push({
        mileageId: mileage.id,
        reviewId: payload.reviewId,
        type: MileageType.PHOTOS,
        point: 1,
      });
    }

    if (previousReview.content.length > 0 && review.content.length === 0) {
      mileage.point -= 1;
      mileageHistory.push({
        mileageId: mileage.id,
        reviewId: payload.reviewId,
        type: MileageType.CONTENT,
        point: -1,
      });
    } else if (
      previousReview.content.length === 0 &&
      review.content.length > 0
    ) {
      mileage.point += 1;
      mileageHistory.push({
        mileageId: mileage.id,
        reviewId: payload.reviewId,
        type: MileageType.CONTENT,
        point: 1,
      });
    }

    await this.mileageStore.save(mileage);
    await this.mileageHistoryStore.save(mileageHistory);
  }

  async #deleteAction(payload: EventRequestDTO, review: Review): Promise<void> {
    const mileage = await this.mileageStore.findOne({
      where: { userId: payload.userId },
    });
    const mileageHistory: Array<Partial<MileageHistory>> = [];

    if (review.photos?.length > 0) {
      mileageHistory.push({
        mileageId: mileage.id,
        reviewId: payload.reviewId,
        type: MileageType.PHOTOS,
        point: -1,
      });
      mileage.point -= 1;
    }

    if (review.content.length > 0) {
      mileageHistory.push({
        mileageId: mileage.id,
        reviewId: payload.reviewId,
        type: MileageType.CONTENT,
        point: -1,
      });
      mileage.point -= 1;
    }

    const first = await this.reviewStore.findOne({
      where: { placeId: payload.placeId },
      order: { createdAt: 'ASC' },
    });

    if (review.id === first.id) {
      const history = await this.mileageHistoryStore.findOne({
        where: {
          mileageId: mileage.id,
          reviewId: review.id,
          type: MileageType.FIRST,
        },
        order: { createdAt: 'DESC' },
      });
      if (history && history.point === 1) {
        mileageHistory.push({
          mileageId: mileage.id,
          reviewId: payload.reviewId,
          type: MileageType.FIRST,
          point: -1,
        });
        mileage.point -= 1;
      }
    }

    await this.mileageStore.save(mileage);
    await this.mileageHistoryStore.save(mileageHistory);
  }
}
