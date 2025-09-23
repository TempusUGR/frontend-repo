import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, tap } from 'rxjs';
import { IcsDownloadsStats, LoginsStats, RegistrationStats } from '../models/statistics.model';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  constructor(private apiService: ApiService) { }

  // GET /statistics/registrations
  getRegistrations(): Observable<RegistrationStats> {
    return this.apiService.get<RegistrationStats>('statistics/registrations').pipe(
      tap((response) => {
        //console.log('Registrations stats:', response);
      })
    );
  }

  // GET /statistics/registrations/period?startMonth=...&endMonth=...&year=...
  getRegistrationsPeriod(startMonth: string, endMonth: string, year: number): Observable<RegistrationStats> {
    const params = { startMonth, endMonth, year };
    return this.apiService.get<RegistrationStats>('statistics/registrations/period', params).pipe(
      tap((response) => {
        //console.log('Registrations period stats:', response);
      })
    );
  }

  // GET /statistics/logins/month?month=...&year=...
  getLoginsByMonth(month: string, year: number): Observable<LoginsStats> {
    const params = { month, year };
    return this.apiService.get<LoginsStats>('statistics/logins/month', params).pipe(
      tap((response) => {
        //console.log('Logins by month stats:', response);
      })
    );
  }

  // GET /statistics/ics-downloads/month?month=...&year=...
  getIcsDownloadsByMonth(month: string, year: number): Observable<IcsDownloadsStats> {
    const params = { month, year };
    return this.apiService.get<IcsDownloadsStats>('statistics/ics-downloads/month', params).pipe(
      tap((response) => {
        //console.log('ICS downloads by month stats:', response);
      })
    );
  }
}
