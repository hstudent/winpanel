import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MonitorPowerState } from '../model/monitor-power-state';

@Injectable()
export class MonitorDataService {
  private httpClient = inject(HttpClient);

  setMonitorPowerState(
    monitorId: number,
    state: MonitorPowerState,
  ): Observable<boolean> {
    const url = `http://192.168.88.249:8080/api/monitors/${monitorId}/power`;
    return this.httpClient.post<boolean>(
      url,
      { state },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
