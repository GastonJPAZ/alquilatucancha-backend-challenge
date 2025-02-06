import { Body, Controller, Logger,Post } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { UseZodGuard } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

import { ClubUpdatedEvent } from '../../domain/events/club-updated.event';
import { CourtUpdatedEvent } from '../../domain/events/court-updated.event';
import { SlotBookedEvent } from '../../domain/events/slot-booked.event';
import { SlotAvailableEvent } from '../../domain/events/slot-cancelled.event';

const SlotSchema = z.object({
  price: z.number(),
  duration: z.number(),
  datetime: z.string(),
  start: z.string(),
  end: z.string(),
  _priority: z.number(),
});

export const ExternalEventSchema = z.union([
  z.object({
    type: z.enum(['booking_cancelled', 'booking_created']),
    clubId: z.number().int(),
    courtId: z.number().int(),
    slot: SlotSchema,
  }),
  z.object({
    type: z.literal('club_updated'),
    clubId: z.number().int(),
    fields: z.array(
      z.enum(['attributes', 'openhours', 'logo_url', 'background_url']),
    ),
  }),
  z.object({
    type: z.literal('court_updated'),
    clubId: z.number().int(),
    courtId: z.number().int(),
    fields: z.array(z.enum(['attributes', 'name'])),
  }),
]);

export type ExternalEventDTO = z.infer<typeof ExternalEventSchema>;

@Controller('events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private readonly eventBus: EventBus) { }

  @Post()
  @UseZodGuard('body', ExternalEventSchema)
  async receiveEvent(@Body() externalEvent: ExternalEventDTO) {
    this.logger.log(`Received event: ${externalEvent.type}`);

    try {
      switch (externalEvent.type) {
        case 'booking_created':
          this.eventBus.publish(
            new SlotBookedEvent(
              externalEvent.clubId,
              externalEvent.courtId,
              externalEvent.slot,
            ),
          );
          this.logger.log(`Processed booking_created event for clubId: ${externalEvent.clubId}, courtId: ${externalEvent.courtId}`);
          break;
        case 'booking_cancelled':
          this.eventBus.publish(
            new SlotAvailableEvent(
              externalEvent.clubId,
              externalEvent.courtId,
              externalEvent.slot,
            ),
          );
          this.logger.log(`Processed booking_cancelled event for clubId: ${externalEvent.clubId}, courtId: ${externalEvent.courtId}`);
          break;
        case 'club_updated':
          this.eventBus.publish(
            new ClubUpdatedEvent(externalEvent.clubId, externalEvent.fields),
          );
          this.logger.log(`Processed club_updated event for clubId: ${externalEvent.clubId}`);
          break;
        case 'court_updated':
          this.eventBus.publish(
            new CourtUpdatedEvent(
              externalEvent.clubId,
              externalEvent.courtId,
              externalEvent.fields,
            ),
          );
          this.logger.log(`Processed court_updated event for clubId: ${externalEvent.clubId}, courtId: ${externalEvent.courtId}`);
          break;
        default:
          this.logger.warn(`Unknown event type received: ${(externalEvent as any).type}`);
          return { status: 'error', message: `Unknown event type: ${(externalEvent as any).type}` };
      }

      return { status: 'success', message: 'Event processed successfully' };
    } catch (error: any) {
      this.logger.error(`Error processing event: ${externalEvent.type}`, error.stack || error);
      return { status: 'error', message: 'Failed to process event' };
    }
  }
}
