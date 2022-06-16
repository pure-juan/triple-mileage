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
    const mileage =
      (await this.mileageStore.findOne({
        where: { userId: payload.userId },
      })) || this.mileageStore.create({ userId: payload.userId, point: 0 });

    const previous = await this.reviewStore.count({
      where: { placeId: payload.placeId },
    });
    const mileageHistory: Array<Partial<MileageHistory>> = [];

    // 첫 리뷰
    if (previous === 1) {
      mileageHistory.push({
        reviewId: payload.reviewId,
        type: MileageType.FIRST,
        point: 1,
      });
      mileage.point += 1;
    }

    // 리뷰 작성
    if (payload.content.length > 0) {
      mileageHistory.push({
        reviewId: payload.reviewId,
        type: MileageType.CONTENT,
        point: 1,
      });
      mileage.point += 1;
    }

    // 이미지 리뷰 작성
    if (payload.attachedPhotoIds.length > 0) {
      mileageHistory.push({
        reviewId: payload.reviewId,
        type: MileageType.PHOTOS,
        point: 1,
      });
      mileage.point += 1;
    }

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
    const mileage =
      (await this.mileageStore.findOne({
        where: {
          userId: payload.userId,
        },
      })) ||
      this.mileageStore.create({
        userId: payload.userId,
        point: 0,
      });
    const mileageHistory: Array<Partial<MileageHistory>> = [];

    // 리뷰에서 이미지를 삭제 했을 경우
    if (previousReview.photos.length > 0 && review.photos.length === 0) {
      mileage.point -= 1;
      mileageHistory.push({
        mileageId: mileage.id,
        reviewId: payload.reviewId,
        type: MileageType.PHOTOS,
        point: -1,
      });
    } else if (previousReview.photos.length === 0 && review.photos.length > 0) {
      // 이미지가 없었지만 추가한 경우
      mileage.point += 1;
      mileageHistory.push({
        mileageId: mileage.id,
        reviewId: payload.reviewId,
        type: MileageType.PHOTOS,
        point: 1,
      });
    }

    // 내용이 없어진 경우
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
      // 내용이 없었다가 추가된 경우
      mileage.point += 1;
      mileageHistory.push({
        mileageId: mileage.id,
        reviewId: payload.reviewId,
        type: MileageType.CONTENT,
        point: 1,
      });
    }

    await this.mileageStore.upsert(mileage, ['userId']);
    await this.mileageHistoryStore.save(mileageHistory);
  }

  async #deleteAction(payload: EventRequestDTO, review: Review): Promise<void> {
    const mileage =
      (await this.mileageStore.findOne({
        where: {
          userId: payload.userId,
        },
      })) ||
      this.mileageStore.create({
        userId: payload.userId,
        point: 0,
      });
    const mileageHistory: Array<Partial<MileageHistory>> = [];

    // 이미지 리뷰 였는지
    if (review.photos?.length > 0) {
      mileageHistory.push({
        mileageId: mileage.id,
        reviewId: payload.reviewId,
        type: MileageType.PHOTOS,
        point: -1,
      });
      mileage.point -= 1;
    }

    // 리뷰 내용이 있었는지
    if (review.content.length > 0) {
      mileageHistory.push({
        mileageId: mileage.id,
        reviewId: payload.reviewId,
        type: MileageType.CONTENT,
        point: -1,
      });
      mileage.point -= 1;
    }

    // 첫 리뷰였는지
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
      // 첫 리뷰로 포인트를 받은 적이 있는지
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

    await this.mileageStore.upsert(mileage, ['userId']);
    await this.mileageHistoryStore.save(mileageHistory);
  }
}
