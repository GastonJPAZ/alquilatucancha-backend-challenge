/*eslint-disable */
import { Test } from '@nestjs/testing';
import { ClubUpdatedEvent } from '../events/club-updated.event';
import { ClubUpdatedHandler } from './club-updated.handler';

describe('ClubUpdatedHandler', () => {
    let handler: ClubUpdatedHandler;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [ClubUpdatedHandler],
        }).compile();

        handler = moduleRef.get<ClubUpdatedHandler>(ClubUpdatedHandler);
    });

    describe('handle', () => {
        it('should log the club update', () => {
            const logSpy = jest.spyOn(handler['logger'], 'log');
            const event = new ClubUpdatedEvent(12345, []);

            handler.handle(event);

            expect(logSpy).toHaveBeenCalledWith('Club 12345 updated');
        });
    });
});