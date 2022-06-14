import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EventType {
  REVIEW = 'REVIEW',
}

export enum EventAction {
  ADD = 'ADD',
  MODIFY = 'MOD',
  DELETE = 'DELETE',
}

@Entity({
  name: 'event',
})
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'type', type: 'varchar', length: 10, enum: EventType })
  type: EventType;

  @Column({ name: 'reviewId', type: 'varchar', length: 36 })
  reviewId: string;

  @Column({ name: 'userId', type: 'varchar', length: 36 })
  userId: string;

  @Column({ name: 'placeId', type: 'varchar', length: 36 })
  placeId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
