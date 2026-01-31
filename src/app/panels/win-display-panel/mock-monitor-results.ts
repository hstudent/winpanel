import { MonitorPowerState } from '../../model/monitor-power-state';
import { Monitor } from '../../model/monitor.model';

export const MOCK_MONITOR_RESULTS: Monitor[] = [
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
