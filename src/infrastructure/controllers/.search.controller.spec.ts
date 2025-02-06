import { Test, TestingModule } from '@nestjs/testing';
import { QueryBus } from '@nestjs/cqrs';
import { SearchController } from './search.controller';
import * as moment from 'moment';
import { GetAvailabilityQuery } from '../../domain/commands/get-availaiblity.query';
import { Logger } from '@nestjs/common';

describe('SearchController', () => {
    let controller: SearchController;
    let queryBus: QueryBus;

    beforeAll(() => {
        jest.spyOn(Logger.prototype, 'log').mockImplementation();
        jest.spyOn(Logger.prototype, 'error').mockImplementation();
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SearchController],
            providers: [
                {
                    provide: QueryBus,
                    useValue: {
                        execute: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<SearchController>(SearchController);
        queryBus = module.get<QueryBus>(QueryBus);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('searchAvailability', () => {
        it('should log and execute GetAvailabilityQuery successfully', async () => {
            const query = {
                placeId: 'test-place',
                date: moment('2024-08-17').toDate(),
            };
            const result = [
                { clubId: 'club1', availability: [] },
                { clubId: 'club2', availability: [] },
            ];

            jest.spyOn(queryBus, 'execute').mockResolvedValue(result);

            const response = await controller.searchAvailability(query);

            expect(Logger.prototype.log).toHaveBeenCalledWith(`Received search request for placeId: ${query.placeId} and date: ${moment(query.date).format('YYYY-MM-DD')}`);
            expect(queryBus.execute).toHaveBeenCalledWith(new GetAvailabilityQuery(query.placeId, query.date));
            expect(Logger.prototype.log).toHaveBeenCalledWith('Search completed successfully.');
            expect(response).toEqual(result);
        });

        it('should log and throw an error if the query fails', async () => {
            const query = {
                placeId: 'test-place',
                date: moment('2024-08-17').toDate(),
            };
            const error = new Error('Something went wrong');

            jest.spyOn(queryBus, 'execute').mockRejectedValue(error);

            await expect(controller.searchAvailability(query)).rejects.toThrow(error);

            expect(Logger.prototype.error).toHaveBeenCalledWith(
                `Search failed for placeId: ${query.placeId} and date: ${moment(query.date).format('YYYY-MM-DD')}`,
                error.stack
            );
        });
    });
});