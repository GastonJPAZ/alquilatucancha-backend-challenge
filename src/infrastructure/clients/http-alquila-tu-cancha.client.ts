import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';

import { Club } from '../../domain/model/club';
import { Court } from '../../domain/model/court';
import { Slot } from '../../domain/model/slot';
import { AlquilaTuCanchaClient } from '../../domain/ports/aquila-tu-cancha.client';

@Injectable()
export class HTTPAlquilaTuCanchaClient implements AlquilaTuCanchaClient {
  private base_url: string;
  constructor(private httpService: HttpService, config: ConfigService) {
    this.base_url = config.get<string>('ATC_BASE_URL', 'http://localhost:4000');
  }

  async getClubs(placeId: string): Promise<Club[]> {
    console.log("No hay conexion con la api MOck, pero se ve esto");
    
    return this.httpService.axiosRef
      .get('clubs', {
        baseURL: this.base_url,
        params: { placeId },
      })
      .then((res) => {
        if (res.status === 200) {
          return res.data;
        }
      })
      .catch((error) => {
        console.log("fallo comunicacion con API mock");
        console.log("devolver datos guardados en el backup JSON");
        return [];
      });
  }

  async getCourts(clubId: number): Promise<Court[]> {
    return this.httpService.axiosRef
      .get(`/clubs/${clubId}/courts`, {
        baseURL: this.base_url,
      })
      .then((res) => res.data)
      .catch((error) => {
        console.log("fallo comunicacion con API mock");
        console.log("devolver datos guardados en el backup JSON");
        return [];
      });
      
  }

  async getAvailableSlots(
    clubId: number,
    courtId: number,
    date: Date,
  ): Promise<Slot[]> {
    return this.httpService.axiosRef
      .get(`/clubs/${clubId}/courts/${courtId}/slots`, {
        baseURL: this.base_url,
        params: { date: moment(date).format('YYYY-MM-DD') },
      })
      .then((res) => res.data)
      .catch((error) => {
        console.log("fallo comunicacion con API mock");
        console.log("devolver datos guardados en el backup JSON");
        return [];
      });
  }
}

