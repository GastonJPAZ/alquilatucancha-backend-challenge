/* eslint-disable */
import { Controller, Get, Query, Logger, UsePipes } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import * as moment from 'moment';
import { createZodDto, ZodValidationPipe } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

import {
  ClubWithAvailability,
  GetAvailabilityQuery,
} from '../../domain/commands/get-availaiblity.query';

const GetAvailabilitySchema = z.object({
  placeId: z.string(),
  date: z
    .string()
    .regex(/\d{4}-\d{2}-\d{2}/)
    .refine((date) => moment(date).isValid())
    .transform((date) => moment(date).toDate()),
});

class GetAvailabilityDTO extends createZodDto(GetAvailabilitySchema) { }

@Controller('search')
export class SearchController {
  private readonly logger = new Logger(SearchController.name);

  constructor(private readonly queryBus: QueryBus) { }

  @Get()
  @UsePipes(ZodValidationPipe)
  async searchAvailability(
    @Query() query: GetAvailabilityDTO,
  ): Promise<ClubWithAvailability[]> {
    this.logger.log(`Received search request for placeId: ${query.placeId} and date: ${moment(query.date).format('YYYY-MM-DD')}`);

    try {
      const result = await this.queryBus.execute(
        new GetAvailabilityQuery(query.placeId, query.date),
      );
      this.logger.log(`Search completed successfully.`);
      return result;
    } catch (error: any) {
      this.logger.error(`Search failed for placeId: ${query.placeId} and date: ${moment(query.date).format('YYYY-MM-DD')}`, error.stack);

      throw error;
    }
  }
}