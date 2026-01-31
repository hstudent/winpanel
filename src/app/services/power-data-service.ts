import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigurationService } from './configuration-service';

@Injectable({
  providedIn: 'root',
})
export class PowerDataService {
  private readonly configurationService = inject(ConfigurationService);
  private readonly httpClient = inject(HttpClient);

  sendCommand(command: string): Observable<boolean> {
    const url = `${this.configurationService.targetSeverConnection()}/api/power/${command}`;
    return this.httpClient.post<boolean>(url, null);
  }
}
