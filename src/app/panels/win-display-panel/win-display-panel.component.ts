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
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommandStatusComponent } from '../../command-status/command-status.component';
import { CommandStatus } from '../../command-status/command-status';
import { ConfigurationService } from '../../services/configuration-service';

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
  private readonly snackBar = inject(MatSnackBar);
  private readonly configurationService = inject(ConfigurationService);

  DEBUG_MONITORS: Monitor[] = [
    {
      Index: 0,
      DeviceName: '\\\\.\\DISPLAY1',
      FriendlyName: 'Основной монитор',
      IsPrimary: true,
      PowerState: MonitorPowerState.On,
      Bounds: {
        X: 0,
        Y: 0,
        Width: 1920,
        Height: 1080,
      },
      WorkingArea: {
        X: 0,
        Y: 0,
        Width: 1920,
        Height: 1040,
      },
    },
    {
      Index: 1,
      DeviceName: '\\\\.\\DISPLAY2',
      FriendlyName: 'Дополнительный монитор',
      IsPrimary: false,
      PowerState: MonitorPowerState.On,
      Bounds: {
        X: 1920, // Расположен справа от основного
        Y: -150, // Слегка выше основного
        Width: 1680,
        Height: 1050,
      },
      WorkingArea: {
        X: 1920,
        Y: -150,
        Width: 1680,
        Height: 1010,
      },
    },
  ];

  readonly serverItems = httpResource<Monitor[]>(
    () => `http://192.168.88.249:8080/api/monitors`,
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

  toggleSelection(monitor: Monitor | null) {
    if (!monitor || this.selectedMonitor() === monitor) {
      this.selectedMonitor.set(null);
    } else {
      this.selectedMonitor.set(monitor);
    }
  }

  sendCommand(state: MonitorPowerState): void {
    if (!this.configurationService.targetServer()) {
      this.showToast('Подключение не задано');
      return;
    }

    const target = this.selectedMonitor();
    if (!target) {
      this.showToast('Необходимо выбрать монитор');
      return;
    }

    if (this.commandStatus() === CommandStatus.progress) {
      this.showToast('Необходимо дождаться выполнения команды');
      return;
    }

    this.targetCommand.next({ id: target.Index, state });
  }
  turnMonitorOff() {
    this.sendCommand(MonitorPowerState.SoftOff);
  }

  turnMonitorOn() {
    this.sendCommand(MonitorPowerState.On);
  }

  showToast(message: string) {
    this.snackBar.open(message, 'Закрыть', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
