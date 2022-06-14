import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum MileageType {
  CONTENT = 'CONTENT',
  PHOTOS = 'PHOTOS',
  FIRST = 'FIRST',
}

@Entity({
  name: 'mileage_history',
})
export class MileageHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'mileageId', type: 'int', unsigned: true })
  mileageId: number;

  @Column({ name: 'type', type: 'varchar', length: 10 })
  type: MileageType;

  @Column({ name: 'point', type: 'int' })
  point: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}
