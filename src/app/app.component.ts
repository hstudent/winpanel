import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WinDisplayPanelComponent } from './panels/win-display-panel/win-display-panel.component';
import { MultimediaPanelComponent } from './panels/multimedia-panel/multimedia-panel.component';
import { ConfigurationService } from './services/configuration-service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ServerEndpointComponent } from './server-endpoint/server-endpoint.component';
import { ServerEndpoint } from './model/server-endpoint';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    WinDisplayPanelComponent,
    MultimediaPanelComponent,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatDialogModule,
  ],

  providers: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  readonly configurationService = inject(ConfigurationService);
  private readonly matDialog = inject(MatDialog);

  isServerSelected = computed(
    () => this.configurationService.targetServer() !== null,
  );

  serverName = computed(() => this.configurationService.targetServer()?.name);

  private readonly defaultEndpoint: ServerEndpoint = {
    name: 'notebook',
    protocol: 'http',
    ip: '192.168.88.249',
    port: 8080,
  };

  constructor() {
    const endpoint =
      this.configurationService.loadFromLocalStorage() ?? this.defaultEndpoint;
    this.configurationService.targetServer.set(endpoint);
  }

  removeConnection() {
    this.configurationService.targetServer.set(null);
    this.configurationService.saveToLocalStorage();
  }

  editConnection() {
    ServerEndpointComponent.edit(
      this.matDialog,
      this.configurationService.targetServer(),
    ).subscribe((endpoint) => {
      this.configurationService.targetServer.set(endpoint);
      this.configurationService.saveToLocalStorage();
    });
  }
}
