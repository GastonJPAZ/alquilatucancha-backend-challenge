import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { EventsController } from './events.controller';
import { ClubUpdatedEvent } from '../../domain/events/club-updated.event';
import { CourtUpdatedEvent } from '../../domain/events/court-updated.event';
import { SlotBookedEvent } from '../../domain/events/slot-booked.event';
import { SlotAvailableEvent } from '../../domain/events/slot-cancelled.event';
import { Logger } from '@nestjs/common';

describe('EventsController', () => {
    let controller: EventsController;
    let eventBus: EventBus;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [EventsController],
            providers: [
                {
                    provide: EventBus,
                    useValue: {
                        publish: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<EventsController>(EventsController);
        eventBus = module.get<EventBus>(EventBus);

        jest.spyOn(Logger.prototype, 'log').mockImplementation();
        jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('receiveEvent', () => {
        it('should handle booking_created event', async () => {
            const event = {
                type: 'booking_created' as const,
                clubId: 1,
                courtId: 2,
                slot: {
                    price: 100,
                    duration: 60,
                    datetime: '2024-08-17T10:00:00Z',
                    start: '10:00',
                    end: '11:00',
                    _priority: 1,
                },
            };

            await controller.receiveEvent(event);

            expect(eventBus.publish).toHaveBeenCalledWith(
                new SlotBookedEvent(event.clubId, event.courtId, event.slot),
            );
            expect(Logger.prototype.log).toHaveBeenCalledWith('Received event: booking_created');
            expect(Logger.prototype.log).toHaveBeenCalledWith(`Processed booking_created event for clubId: ${event.clubId}, courtId: ${event.courtId}`);
        });

        it('should handle booking_cancelled event', async () => {
            const event = {
                type: 'booking_cancelled' as const,
                clubId: 1,
                courtId: 2,
                slot: {
                    price: 100,
                    duration: 60,
                    datetime: '2024-08-17T10:00:00Z',
                    start: '10:00',
                    end: '11:00',
                    _priority: 1,
                },
            };

            await controller.receiveEvent(event);

            expect(eventBus.publish).toHaveBeenCalledWith(
                new SlotAvailableEvent(event.clubId, event.courtId, event.slot),
            );
            expect(Logger.prototype.log).toHaveBeenCalledWith('Received event: booking_cancelled');
            expect(Logger.prototype.log).toHaveBeenCalledWith(`Processed booking_cancelled event for clubId: ${event.clubId}, courtId: ${event.courtId}`);
        });

        it('should handle club_updated event', async () => {
            const event = {
                type: 'club_updated' as const,
                clubId: 1,
                fields: ['attributes', 'openhours'] as ('attributes' | 'openhours')[],
            };

            await controller.receiveEvent(event);

            expect(eventBus.publish).toHaveBeenCalledWith(
                new ClubUpdatedEvent(event.clubId, event.fields),
            );
            expect(Logger.prototype.log).toHaveBeenCalledWith('Received event: club_updated');
            expect(Logger.prototype.log).toHaveBeenCalledWith(`Processed club_updated event for clubId: ${event.clubId}`);
        });

        it('should handle court_updated event', async () => {
            const event = {
                type: 'court_updated' as const,
                clubId: 1,
                courtId: 2,
                fields: ['attributes', 'name'] as ('attributes' | 'name')[],
            };

            await controller.receiveEvent(event);

            expect(eventBus.publish).toHaveBeenCalledWith(
                new CourtUpdatedEvent(event.clubId, event.courtId, event.fields),
            );
            expect(Logger.prototype.log).toHaveBeenCalledWith('Received event: court_updated');
            expect(Logger.prototype.log).toHaveBeenCalledWith(`Processed court_updated event for clubId: ${event.clubId}, courtId: ${event.courtId}`);
        });

        it('should log a warning for unknown event types', async () => {
            const event = {
                type: 'unknown_event',
                clubId: 1,
            } as any;

            await controller.receiveEvent(event);

            expect(eventBus.publish).not.toHaveBeenCalled();
            expect(Logger.prototype.warn).toHaveBeenCalledWith('Unknown event type received: unknown_event');
        });
    });
});