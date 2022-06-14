import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiErrorCodes } from 'src/core/define';
import { ApiException } from 'src/core/exception';
import { MileageHistory } from 'src/entities/mileage-history.entity';
import { Mileage } from 'src/entities/mileage.entity';
import { Repository } from 'typeorm';
import {
  GetMileageHistoryResponse,
  GetMileageResponse,
} from '../domain/dto/response.dto';
import { IMileageService } from '../domain/mileage.service';

@Injectable()
export class MileageServiceImpl implements IMileageService {
  constructor(
    @InjectRepository(Mileage)
    private readonly mileageStore: Repository<Mileage>,
    @InjectRepository(MileageHistory)
    private readonly mileageHistoryStore: Repository<MileageHistory>,
  ) {}

  async get(userId: string): Promise<GetMileageResponse> {
    const mileage = await this.mileageStore.findOne({ where: { userId } });
    if (!mileage) {
      throw new ApiException(ApiErrorCodes.MILEAGE.NOT_FOUND);
    }

    return mileage;
  }

  async getHistory(userId: string): Promise<GetMileageHistoryResponse> {
    const mileage = await this.mileageStore.findOne({ where: { userId } });
    if (!mileage) {
      throw new ApiException(ApiErrorCodes.MILEAGE.NOT_FOUND);
    }
    const history = await this.mileageHistoryStore.find({
      where: { mileageId: mileage.id },
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      mileage,
      history,
    };
  }
}
