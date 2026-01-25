// monitor-power-state.enum.ts
export enum MonitorPowerState {
  /**
   * 0x01 - Полностью включен
   */
  On = 0x01,

  /**
   * 0x02 - Дежурный режим (Standby)
   */
  Standby = 0x02,

  /**
   * 0x03 - Приостановлен (Suspend)
   */
  Suspend = 0x03,

  /**
   * 0x04 - Полностью выключен
   */
  Off = 0x04,

  /**
   * 0x05 - Программное выключение
   */
  SoftOff = 0x05,
}
