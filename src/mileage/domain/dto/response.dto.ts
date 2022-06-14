import { MileageHistory } from 'src/entities/mileage-history.entity';
import { Mileage } from 'src/entities/mileage.entity';

export type GetMileageResponse = Mileage;

export type GetMileageHistoryResponse = {
  mileage: Mileage;
  history: MileageHistory[];
};
