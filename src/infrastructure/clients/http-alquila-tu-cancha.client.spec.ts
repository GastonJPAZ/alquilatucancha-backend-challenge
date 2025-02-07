import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { HTTPAlquilaTuCanchaClient } from './http-alquila-tu-cancha.client';
import { of } from 'rxjs';
import * as moment from 'moment';

describe('HTTPAlquilaTuCanchaClient', () => {
  let client: HTTPAlquilaTuCanchaClient;
  let httpService: HttpService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HTTPAlquilaTuCanchaClient,
        {
          provide: HttpService,
          useValue: {
            axiosRef: {
              get: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:4000'),
          },
        },
      ],
    }).compile();

    client = module.get<HTTPAlquilaTuCanchaClient>(HTTPAlquilaTuCanchaClient);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should fetch clubs by placeId', async () => {
    const mockData = [{ id: 1, name: 'Club A' }];
    jest.spyOn(httpService.axiosRef, 'get').mockResolvedValue({ data: mockData });

    const clubs = await client.getClubs('123');
    expect(httpService.axiosRef.get).toHaveBeenCalledWith('clubs', {
      baseURL: 'http://localhost:4000',
      params: { placeId: '123' },
    });
    expect(clubs).toEqual(mockData);
  });

  it('should fetch courts by clubId', async () => {
    const mockData = [{ id: 1, name: 'Court A' }];
    jest.spyOn(httpService.axiosRef, 'get').mockResolvedValue({ data: mockData });

    const courts = await client.getCourts(1);
    expect(httpService.axiosRef.get).toHaveBeenCalledWith('/clubs/1/courts', {
      baseURL: 'http://localhost:4000',
    });
    expect(courts).toEqual(mockData);
  });

  it('should fetch available slots by clubId, courtId, and date', async () => {
    const mockData = [{ id: 1, time: '10:00' }];
    const date = new Date();
    const formattedDate = moment(date).format('YYYY-MM-DD');
    jest.spyOn(httpService.axiosRef, 'get').mockResolvedValue({ data: mockData });

    const slots = await client.getAvailableSlots(1, 1, date);
    expect(httpService.axiosRef.get).toHaveBeenCalledWith('/clubs/1/courts/1/slots', {
      baseURL: 'http://localhost:4000',
      params: { date: formattedDate },
    });
    expect(slots).toEqual(mockData);
  });
});
