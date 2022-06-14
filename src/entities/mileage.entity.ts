import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'mileage',
})
export class Mileage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'userId', type: 'varchar', length: 36, unique: true })
  userId: string;

  @Column({ name: 'point', type: 'int', unsigned: true })
  point: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
