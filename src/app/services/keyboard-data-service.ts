import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigurationService } from './configuration-service';

@Injectable({
  providedIn: 'root',
})
export class KeyboardDataService {
  private readonly configurationService = inject(ConfigurationService);
  private readonly httpClient = inject(HttpClient);

  sendCommand(command: string): Observable<boolean> {
    const url = `${this.configurationService.targetSeverConnection()}/api/keyboard/command`;
    return this.httpClient.post<boolean>(
      url,
      { Value: command },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  sendMediaCommand(command: string): Observable<boolean> {
    const url = `${this.configurationService.targetSeverConnection()}/api/media/${command}`;
    return this.httpClient.post<boolean>(url, null);
  }
}
