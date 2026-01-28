import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MediaAction } from './media-action';
import { ConfigurationService } from './configuration-service';

@Injectable({
  providedIn: 'root',
})
export class MultiMediaDataService {
  private readonly configurationService = inject(ConfigurationService);
  private readonly httpClient = inject(HttpClient);

  execute(action: MediaAction): Observable<boolean> {
    const url = `${this.configurationService.targetSeverConnection()}/api/media/${action}`;
    return this.httpClient.post<boolean>(url, null);
  }
}
