import { Component, signal } from '@angular/core';
import {
  Monitor,
  MonitorArrangement,
  MonitorPowerState,
} from '../../model/monitor.model';
import {
  GridLayout,
  MonitorLayoutService,
} from '../../services/monitor-layout-service';

import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-win-display-panel',
  imports: [MatButtonModule, MatDividerModule, MatIconModule],
  templateUrl: './win-display-panel.component.html',
  styleUrl: './win-display-panel.component.css',
})
export class WinDisplayPanelComponent {
  DEBUG_MONITORS: Monitor[] = [
    {
      id: 1,
      deviceName: '\\\\.\\DISPLAY1',
      friendlyName: 'Основной монитор',
      isPrimary: true,
      isActive: true,
      powerState: MonitorPowerState.On,
      bounds: {
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
      },
      workingArea: {
        x: 0,
        y: 0,
        width: 1920,
        height: 1040,
      },
    },
    {
      id: 2,
      deviceName: '\\\\.\\DISPLAY2',
      friendlyName: 'Дополнительный монитор',
      isPrimary: false,
      isActive: true,
      powerState: MonitorPowerState.On,
      bounds: {
        x: 1920, // Расположен справа от основного
        y: -150, // Слегка выше основного
        width: 1680,
        height: 1050,
      },
      workingArea: {
        x: 1920,
        y: -150,
        width: 1680,
        height: 1010,
      },
    },
  ];

  readonly monitors = signal<Monitor[]>([]);
  readonly layout: GridLayout;
  readonly selectedMonitor = signal<Monitor | null>(null);

  constructor() {
    this.monitors.set(this.DEBUG_MONITORS);
    this.layout = MonitorLayoutService.calculateMonitorGrid(this.monitors());

    // Для отладки: вручную задаем сетку
    this.layout = {
      rows: 1, // Один ряд
      columns: 2, // Два столбца
      arrangement: MonitorArrangement.Horizontal,
      grid: [[this.monitors()[0], this.monitors()[1]]],
    };

    // this.layout = {
    //   rows: 2, // Два ряда
    //   columns: 1, // Один столбец
    //   arrangement: MonitorArrangement.Vertical, // Вертикальное расположение
    //   grid: [
    //     [this.monitors()[0]], // Верхний монитор (ряд 0, столбец 0)
    //     [this.monitors()[1]], // Нижний монитор (ряд 1, столбец 0)
    //   ],
    // };
  }

  selectMonitor(monitor: Monitor | null) {
    if (monitor === this.selectedMonitor()) {
      this.selectedMonitor.set(null);
    } else {
      this.selectedMonitor.set(monitor);
    }
  }
}
