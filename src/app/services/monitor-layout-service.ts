import { Monitor, MonitorArrangement } from '../model/monitor.model';

export interface GridLayout {
  rows: number;
  columns: number;
  arrangement: MonitorArrangement;
  grid: (Monitor | null)[][]; // 2D массив мониторов (null для пустых ячеек)
}

export class MonitorLayoutService {
  static calculateMonitorGrid(monitors: Monitor[]): GridLayout {
    if (monitors.length === 0) {
      return {
        rows: 0,
        columns: 0,
        arrangement: MonitorArrangement.Single,
        grid: [],
      };
    }

    if (monitors.length === 1) {
      return {
        rows: 1,
        columns: 1,
        arrangement: MonitorArrangement.Single,
        grid: [[monitors[0]]],
      };
    }

    // Получаем уникальные координаты по X и Y
    const uniqueX = Array.from(new Set(monitors.map((m) => m.bounds.x))).sort(
      (a, b) => a - b,
    );
    const uniqueY = Array.from(new Set(monitors.map((m) => m.bounds.y))).sort(
      (a, b) => a - b,
    );

    const columns = uniqueX.length;
    const rows = uniqueY.length;

    // Определяем тип расположения
    let arrangement = MonitorArrangement.Mixed;

    if (rows === 1 && columns === 1) {
      arrangement = MonitorArrangement.Single;
    } else if (rows === 1 && columns > 1) {
      arrangement = MonitorArrangement.Horizontal;
    } else if (rows > 1 && columns === 1) {
      arrangement = MonitorArrangement.Vertical;
    } else if (rows > 1 && columns > 1) {
      arrangement = MonitorArrangement.Grid;
    }

    // Проверяем, является ли расположение сеткой (ровные промежутки)
    if (columns > 1 && rows > 1) {
      const isRegularGrid = MonitorLayoutService.checkRegularGrid(
        monitors,
        uniqueX,
        uniqueY,
      );
      if (!isRegularGrid) {
        arrangement = MonitorArrangement.Mixed;
      }
    }

    // Строим 2D сетку мониторов
    const grid: (Monitor | null)[][] = Array(rows)
      .fill(null)
      .map(() => Array(columns).fill(null));

    // Заполняем сетку
    monitors.forEach((monitor) => {
      const colIndex = uniqueX.indexOf(monitor.bounds.x);
      const rowIndex = uniqueY.indexOf(monitor.bounds.y);

      if (colIndex >= 0 && rowIndex >= 0) {
        grid[rowIndex][colIndex] = monitor;
      }
    });

    return {
      rows,
      columns,
      arrangement,
      grid,
    };
  }

  /**
   * Проверяет, является ли расположение регулярной сеткой
   * (одинаковые расстояния между мониторами)
   */
  static checkRegularGrid(
    monitors: Monitor[],
    uniqueX: number[],
    uniqueY: number[],
  ): boolean {
    // Проверяем горизонтальные интервалы
    if (uniqueX.length > 1) {
      const horizontalGaps: number[] = [];
      for (let i = 1; i < uniqueX.length; i++) {
        horizontalGaps.push(uniqueX[i] - uniqueX[i - 1]);
      }

      // Проверяем, одинаковы ли промежутки (с допуском 10%)
      const avgGap =
        horizontalGaps.reduce((a, b) => a + b) / horizontalGaps.length;
      const isRegularHorizontal = horizontalGaps.every(
        (gap) => Math.abs(gap - avgGap) / avgGap < 0.1,
      );

      if (!isRegularHorizontal) return false;
    }

    // Проверяем вертикальные интервалы
    if (uniqueY.length > 1) {
      const verticalGaps: number[] = [];
      for (let i = 1; i < uniqueY.length; i++) {
        verticalGaps.push(uniqueY[i] - uniqueY[i - 1]);
      }

      const avgGap = verticalGaps.reduce((a, b) => a + b) / verticalGaps.length;
      const isRegularVertical = verticalGaps.every(
        (gap) => Math.abs(gap - avgGap) / avgGap < 0.1,
      );

      if (!isRegularVertical) return false;
    }

    // Проверяем одинаковость размеров мониторов в каждой колонке
    for (let col = 0; col < uniqueX.length; col++) {
      const monitorsInColumn = monitors.filter(
        (m) => m.bounds.x === uniqueX[col],
      );
      const widths = monitorsInColumn.map((m) => m.bounds.width);
      const avgWidth = widths.reduce((a, b) => a + b) / widths.length;

      const isSameWidth = widths.every(
        (width) => Math.abs(width - avgWidth) / avgWidth < 0.05,
      );

      if (!isSameWidth) return false;
    }

    // Проверяем одинаковость размеров мониторов в каждом ряду
    for (let row = 0; row < uniqueY.length; row++) {
      const monitorsInRow = monitors.filter((m) => m.bounds.y === uniqueY[row]);
      const heights = monitorsInRow.map((m) => m.bounds.height);
      const avgHeight = heights.reduce((a, b) => a + b) / heights.length;

      const isSameHeight = heights.every(
        (height) => Math.abs(height - avgHeight) / avgHeight < 0.05,
      );

      if (!isSameHeight) return false;
    }

    return true;
  }
}
