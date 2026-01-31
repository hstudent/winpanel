import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MonitorPowerState } from '../model/monitor-power-state';
import { ConfigurationService } from './configuration-service';

@Injectable({
  providedIn: 'root',
})
export class MonitorDataService {
  private readonly configurationService = inject(ConfigurationService);
  private readonly httpClient = inject(HttpClient);

  setMonitorPowerState(
    monitorId: number,
    state: MonitorPowerState,
  ): Observable<boolean> {
    const url = `${this.configurationService.targetSeverConnection()}/api/monitors/${monitorId}/power`;
    return this.httpClient.post<boolean>(
      url,
      { state },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  deactivate(): Observable<boolean> {
    const url = `${this.configurationService.targetSeverConnection()}/api/monitors/deactivate`;
    return this.httpClient.get<boolean>(url);
  }

  activate(): Observable<boolean> {
    const url = `${this.configurationService.targetSeverConnection()}/api/monitors/activate`;
    return this.httpClient.get<boolean>(url);
  }
}
