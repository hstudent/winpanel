import { MonitorPowerState } from './monitor-power-state';

export interface Rectangle {
  X: number;
  Y: number;
  Width: number;
  Height: number;
}

// Основной интерфейс монитора
export interface Monitor {
  Index: number; // Уникальный идентификатор (0-based или 1-based)

  DeviceName: string; // Системное имя устройства (например, "\\.\DISPLAY1")

  FriendlyName: string; // Человеко-читаемое имя

  // Статус и состояние
  IsPrimary: boolean; // Основной ли это монитор

  // Геометрия
  Bounds: Rectangle; // Полные границы монитора

  WorkingArea: Rectangle; // Рабочая область (без панели задач)

  PowerState: MonitorPowerState | null; // Состояние питания
}

// Информация о расположении относительно других мониторов
export interface MonitorPositionInfo {
  monitorId: number;
  relativeToId: number;
  position: RelativePosition;
  distance: {
    horizontal: number;
    vertical: number;
  };
}

// Относительное положение
export enum RelativePosition {
  Left = 'LEFT',
  Right = 'RIGHT',
  Above = 'ABOVE',
  Below = 'BELOW',
  Overlapping = 'OVERLAPPING',
  SamePosition = 'SAME_POSITION',
  Unknown = 'UNKNOWN',
}

// Настройки визуализации
export interface VisualizationSettings {
  showGrid: boolean;
  showCoordinates: boolean;
  showMonitorNumbers: boolean;
  showResolution: boolean;
  showWorkingArea: boolean;
  colorScheme: ColorScheme;
  gridSize: number;
}

// Цветовые схемы
export enum ColorScheme {
  Light = 'LIGHT',
  Dark = 'DARK',
  HighContrast = 'HIGH_CONTRAST',
  ColorBlind = 'COLOR_BLIND',
}

// Конфигурация системы мониторов
export interface MonitorSystemConfig {
  totalMonitors: number;
  virtualScreen: Rectangle;
  primaryMonitorId: number;
  arrangementType: MonitorArrangement;
  totalPixels: number;
  supportsDDCCI: boolean;
}

// Тип расположения мониторов
export enum MonitorArrangement {
  Single = 'SINGLE', // Один монитор
  Horizontal = 'HORIZONTAL', // Горизонтальное растяжение
  Vertical = 'VERTICAL', // Вертикальное растяжение
  Grid = 'GRID', // Сетка
  Mixed = 'MIXED', // Смешанное расположение
  Clone = 'CLONE', // Клонирование (одинаковое изображение)
  Unknown = 'UNKNOWN',
}

// События взаимодействия с монитором
export interface MonitorEvent {
  type: MonitorEventType;
  monitorId: number;
  timestamp: Date;
  data?: any;
}

// Типы событий
export enum MonitorEventType {
  Click = 'CLICK',
  DoubleClick = 'DOUBLE_CLICK',
  MouseEnter = 'MOUSE_ENTER',
  MouseLeave = 'MOUSE_LEAVE',
  PowerOn = 'POWER_ON',
  PowerOff = 'POWER_OFF',
  SelectionChanged = 'SELECTION_CHANGED',
  PositionChanged = 'POSITION_CHANGED',
}

// Команды управления монитором
export interface MonitorCommand {
  type: MonitorCommandType;
  monitorId: number;
  parameters?: any;
}

// Типы команд
export enum MonitorCommandType {
  PowerOn = 'POWER_ON',
  PowerOff = 'POWER_OFF',
  Standby = 'STANDBY',
  SetBrightness = 'SET_BRIGHTNESS',
  SetContrast = 'SET_CONTRAST',
  Move = 'MOVE',
  Resize = 'RESIZE',
}

// Для API запросов
export interface MonitorApiResponse {
  success: boolean;
  message?: string;
  data: Monitor[] | Monitor | MonitorSystemConfig;
  timestamp: Date;
}

// Для фильтрации и поиска
export interface MonitorFilter {
  isPrimary?: boolean;
  isActive?: boolean;
  minWidth?: number;
  minHeight?: number;
  manufacturer?: string;
  powerState?: MonitorPowerState;
}

// Для пагинации
export interface MonitorPagination {
  page: number;
  pageSize: number;
  total: number;
  monitors: Monitor[];
}
