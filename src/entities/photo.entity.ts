import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Review } from './review.entity';

@Entity({
  name: 'photo',
})
export class Photo {
  @PrimaryColumn({ name: 'id', type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'reviewId', type: 'varchar', length: 36 })
  reviewId: string;

  @ManyToOne(() => Review, (review) => review.photos)
  review: Review;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}
