import { computed, Injectable, signal } from '@angular/core';
import { ServerEndpoint } from '../model/server-endpoint';
import { isValidServerEndpoint } from '../server-endpoint/server-endpoint-validation';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {
  isMock = signal<boolean>(true);

  private readonly serverEndpointKey = 'serverendpoint';

  targetServer = signal<ServerEndpoint | null>({
    name: 'notebook',
    protocol: 'http',
    ip: '192.168.88.249',
    port: 8080,
  });

  targetSeverConnection = computed(() => {
    if (this.targetServer()) {
      const server = this.targetServer() as ServerEndpoint;
      return `${server.protocol}://${server.ip}:${server.port}`;
    }
    return null;
  });

  loadFromLocalStorage(): ServerEndpoint | null {
    const serverEndpointJson = localStorage.getItem(this.serverEndpointKey);
    if (serverEndpointJson) {
      const serverEndpoint = JSON.parse(serverEndpointJson);
      // Проверяем, что это объект
      if (typeof serverEndpoint !== 'object' || serverEndpoint === null) {
        return null;
      }

      if (isValidServerEndpoint(serverEndpoint)) {
        return serverEndpoint;
      }
    }
    return null;
  }

  saveToLocalStorage(): void {
    if (this.targetServer()) {
      const json = JSON.stringify(this.targetServer());
      localStorage.setItem(this.serverEndpointKey, json);
    } else {
      localStorage.removeItem(this.serverEndpointKey);
    }
  }
}
