import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Photo } from './photo.entity';

@Entity({
  name: 'review',
})
export class Review {
  @PrimaryColumn({ name: 'id', type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'userId', type: 'varchar', length: 36 })
  userId: string;

  @Column({ name: 'placeId', type: 'varchar', length: 36 })
  placeId: string;

  @Column({ name: 'content', type: 'text' })
  content: string;

  @OneToMany(() => Photo, (photo) => photo.review)
  photos: Array<Photo>;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
