import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WinDisplayPanelComponent } from './panels/win-display-panel/win-display-panel.component';
import { ConfigurationService } from './services/configuration-service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ServerEndpointComponent } from './server-endpoint/server-endpoint.component';
import { ServerEndpoint } from './model/server-endpoint';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { KeyboardComponent } from './panels/keyboard/keyboard.component';
import { SystemPanelComponent } from './panels/system-panel/system-panel.component';
import {
  SwipeDirection,
  TabSwipeDirective,
} from './directives/tab-swipe-directive';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    WinDisplayPanelComponent,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatDialogModule,
    MatTabsModule,
    KeyboardComponent,
    SystemPanelComponent,
    TabSwipeDirective,
  ],

  providers: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private readonly SelectedTabIndexKey = 'SelectedTabIndex';

  @ViewChild('tabGroup') tabGroup!: MatTabGroup;

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

  readonly selectedTabIndex = signal<number>(0);

  constructor() {
    const endpoint =
      this.configurationService.loadFromLocalStorage() ?? this.defaultEndpoint;
    this.configurationService.targetServer.set(endpoint);
    this.configurationService.isMock.set(true);

    const tabIndex = this.loadTabIndexFromStorage();
    this.selectedTabIndex.set(tabIndex);
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

  toggleMockMode() {
    const isMocked = this.configurationService.isMock();
    this.configurationService.isMock.set(!isMocked);
  }

  onSwipe(direction: SwipeDirection): void {
    const currentIndex = this.selectedTabIndex();
    const totalTabs = this.tabGroup._tabs.length;

    if (direction === 'right') {
      this.tabGroup.selectedIndex = Math.max(0, currentIndex - 1);
    } else {
      this.tabGroup.selectedIndex = Math.min(totalTabs - 1, currentIndex + 1);
    }
  }

  onSelectedIndexChanged(tabIndex: number) {
    localStorage.setItem(this.SelectedTabIndexKey, tabIndex.toString());
  }

  loadTabIndexFromStorage(): number {
    const storageValue = localStorage.getItem(this.SelectedTabIndexKey);

    if (storageValue) {
      const tabIndex = parseInt(storageValue, 10);
      return tabIndex ? tabIndex : 0;
    }

    return 0;
  }
}
