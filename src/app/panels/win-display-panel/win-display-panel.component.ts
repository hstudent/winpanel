import { Component, computed, inject, signal } from '@angular/core';
import { Monitor, MonitorArrangement } from '../../model/monitor.model';
import { GridLayout } from '../../services/monitor-layout-service';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MonitorDataService } from '../../services/monitor-data-service';
import { MonitorPowerState } from '../../model/monitor-power-state';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { httpResource } from '@angular/common/http';
import { catchError, exhaustMap, map, of, Subject, tap } from 'rxjs';
import { CommandStatusComponent } from '../../command-status/command-status.component';
import { CommandStatus } from '../../command-status/command-status';
import { ConfigurationService } from '../../services/configuration-service';
import { MOCK_MONITOR_RESULTS } from './mock-monitor-results';
import { ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-win-display-panel',
  imports: [
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    CommandStatusComponent,
  ],
  templateUrl: './win-display-panel.component.html',
  styleUrl: './win-display-panel.component.css',
})
export class WinDisplayPanelComponent {
  private readonly dataService = inject(MonitorDataService);
  private readonly toastService = inject(ToastService);
  private readonly configurationService = inject(ConfigurationService);

  readonly serverItems = httpResource<Monitor[]>(
    () =>
      this.configurationService.isMock()
        ? undefined
        : `http://192.168.88.249:8080/api/monitors`,
    {
      defaultValue: MOCK_MONITOR_RESULTS,
    },
  );

  readonly monitors = computed(() =>
    this.serverItems.hasValue() ? this.serverItems.value() : [],
  );

  readonly layout = computed(() => this.calculateLayout(this.monitors()));

  readonly selectedMonitor = signal<Monitor | null>(null);
  readonly commandStatus = signal<CommandStatus>(CommandStatus.none);
  readonly targetCommand = new Subject<{
    id: number;
    state: MonitorPowerState;
  }>();

  calculateLayout(monitors: Monitor[]): GridLayout<Monitor> {
    return {
      rows: 1, // Один ряд
      columns: monitors.length, // количество столбцов по количеству мониторов
      arrangement: MonitorArrangement.Horizontal,
      grid: [[...monitors]],
    };
  }

  constructor() {
    this.targetCommand
      .pipe(
        tap(() => this.commandStatus.set(CommandStatus.progress)),
        exhaustMap(({ id, state }) =>
          this.dataService.setMonitorPowerState(id, state).pipe(
            map(() => ({ success: true })),
            catchError(() => {
              return of({ success: false });
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((result) => {
        this.commandStatus.set(
          result.success ? CommandStatus.completed : CommandStatus.error,
        );
      });
  }

  toggleSelection(monitor: Monitor | null): void {
    if (!monitor || this.selectedMonitor() === monitor) {
      this.selectedMonitor.set(null);
    } else {
      this.selectedMonitor.set(monitor);
    }
  }

  sendCommand(state: MonitorPowerState): void {
    if (!this.configurationService.targetServer()) {
      this.toastService.show('Подключение не задано');
      return;
    }

    const target = this.selectedMonitor();
    if (!target) {
      this.toastService.show('Необходимо выбрать монитор');
      return;
    }

    if (this.commandStatus() === CommandStatus.progress) {
      this.toastService.show('Необходимо дождаться выполнения команды');
      return;
    }

    this.targetCommand.next({ id: target.Index, state });
  }

  turnMonitorOff(): void {
    this.sendCommand(MonitorPowerState.SoftOff);
  }

  turnMonitorOn(): void {
    this.sendCommand(MonitorPowerState.On);
  }

  deactivate(): void {
    if (!this.configurationService.targetServer()) {
      this.toastService.show('Подключение не задано');
      return;
    }
    this.dataService.deactivate().subscribe(() => {});
  }

  activate(): void {
    if (!this.configurationService.targetServer()) {
      this.toastService.show('Подключение не задано');
      return;
    }
    this.dataService.activate().subscribe(() => {});
  }
}
