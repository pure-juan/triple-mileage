import { Controller, Get, Inject, Param } from '@nestjs/common';
import { IMileageService, MILEAGE_SERVICE } from '../domain/mileage.service';

@Controller('mileage')
export class MileageController {
  constructor(
    @Inject(MILEAGE_SERVICE) private readonly mileageService: IMileageService,
  ) {}

  @Get('users/:userId')
  get(@Param('userId') userId: string) {
    return this.mileageService.get(userId);
  }

  @Get('users/:userId/history')
  getHistory(@Param('userId') userId: string) {
    return this.mileageService.getHistory(userId);
  }
}
