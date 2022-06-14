import * as MileageResponseDTO from './dto/response.dto';

export interface IMileageService {
  get(userId: string): Promise<MileageResponseDTO.GetMileageResponse>;
  getHistory(
    userId: string,
  ): Promise<MileageResponseDTO.GetMileageHistoryResponse>;
}

export const MILEAGE_SERVICE = Symbol('MileageService');
