import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiErrorCodes } from 'src/core/define';
import { ApiException } from 'src/core/exception';
import { Event, EventAction } from 'src/entities/event.entity';
import { Photo } from 'src/entities/photo.entity';
import { Review } from 'src/entities/review.entity';
import { MileageProvider } from 'src/mileage/mileage.provider';
import { Repository } from 'typeorm';
import { EventRequestDTO } from '../domain/dto/request.dto';
import { EventResponseDTO } from '../domain/dto/response.dto';
import { IEventService } from '../domain/event.service';

@Injectable()
export class EventServiceImpl implements IEventService {
  constructor(
    @InjectRepository(Event) private readonly eventStore: Repository<Event>,
    @InjectRepository(Review) private readonly reviewStore: Repository<Review>,
    @InjectRepository(Photo) private readonly photoStore: Repository<Photo>,
    @Inject(MileageProvider) private readonly mileageProvider: MileageProvider,
  ) {}

  async event(payload: EventRequestDTO): Promise<EventResponseDTO> {
    switch (payload.action) {
      case EventAction.ADD:
        await this.#addEvent(payload);
        break;
      case EventAction.MODIFY:
        await this.#updateEvent(payload);
        break;
      case EventAction.DELETE:
        await this.#deleteEvent(payload);
    }

    return 'OK';
  }

  async #addEvent(payload: EventRequestDTO): Promise<void> {
    if (
      await this.eventStore.findOne({ where: { reviewId: payload.reviewId } })
    ) {
      throw new ApiException(ApiErrorCodes.EVENT.ALREADY_EXISTS);
    }
    // EVENT
    const event = this.eventStore.create({
      type: payload.type,
      reviewId: payload.reviewId,
      userId: payload.userId,
      placeId: payload.placeId,
    });
    await this.eventStore.save(event, { reload: true });

    // REVIEW
    const exists = await this.reviewStore.count({
      where: { id: payload.reviewId },
    });
    let review: Review;
    if (!exists) {
      review = this.reviewStore.create({
        id: payload.reviewId,
        userId: payload.userId,
        placeId: payload.placeId,
        content: payload.content,
      });
      await this.reviewStore.save(review);
    } else {
      review = await this.reviewStore.findOne({
        where: { id: payload.reviewId },
        relations: ['photos'],
      });
    }

    // PHOTO
    const photos = payload.attachedPhotoIds.map((attachedPhotoId) =>
      this.photoStore.create({ id: attachedPhotoId, reviewId: event.reviewId }),
    );
    await this.photoStore.save(photos);

    // 포인트 계ㄴ
    await this.mileageProvider.calculate(payload, review);
  }

  async #updateEvent(payload: EventRequestDTO): Promise<void> {
    // EVENT
    const event = await this.eventStore.findOne({
      where: {
        reviewId: payload.reviewId,
        userId: payload.userId,
      },
    });
    if (!event) throw new ApiException(ApiErrorCodes.EVENT.NOT_FOUND);

    // REVIEW
    const previousReview = await this.reviewStore.findOne({
      where: {
        id: event.reviewId,
      },
      relations: ['photos'],
    });
    if (!previousReview) throw new ApiException(ApiErrorCodes.REVIEW.NOT_FOUND);
    let review = {
      ...previousReview,
      content: payload.content,
    };
    await this.reviewStore.save(review);

    // PHOTO
    const photoIds = (
      await this.photoStore.find({
        where: { reviewId: event.reviewId },
      })
    ).map((photo) => photo.id);
    {
      // 추가될 이미지들
      const willAddedPhotos = payload.attachedPhotoIds.filter(
        (photoId) => !photoIds.includes(photoId),
      );
      // 삭제될 이미지들
      const willDeletedPhotos = photoIds.filter(
        (photoId) => !payload.attachedPhotoIds.includes(photoId),
      );
      if (willAddedPhotos.length > 0) {
        await this.photoStore.save(
          willAddedPhotos.map((photo) => ({
            id: photo,
            reviewId: payload.reviewId,
          })),
        );
      }
      if (willDeletedPhotos.length > 0) {
        await this.photoStore.delete(willDeletedPhotos);
      }
      review = await this.reviewStore.findOne({
        where: { id: payload.reviewId },
        relations: ['photos'],
      });
    }

    // 포인트 계산
    await this.mileageProvider.calculate(payload, review, previousReview);
  }

  async #deleteEvent(payload: EventRequestDTO): Promise<void> {
    const event = await this.eventStore.findOne({
      where: { reviewId: payload.reviewId, userId: payload.userId },
    });
    if (!event) {
      throw new ApiException(ApiErrorCodes.EVENT.NOT_FOUND);
    }

    const review = await this.reviewStore.findOne({
      where: { id: payload.reviewId, userId: payload.userId },
      relations: ['photos'],
    });
    if (!review) {
      throw new ApiException(ApiErrorCodes.REVIEW.NOT_FOUND);
    }

    await this.mileageProvider.calculate(payload, review);

    await this.photoStore.delete({ reviewId: event.reviewId });
    await this.reviewStore.delete({ id: review.id });
    await this.eventStore.delete(event);
  }
}
