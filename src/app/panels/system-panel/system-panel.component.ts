import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { interval, Subscription, takeWhile } from 'rxjs';
import { PowerDataService } from '../../services/power-data-service';
import { ToastService } from '../../services/toast-service';
import { ConfigurationService } from '../../services/configuration-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-system-panel',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './system-panel.component.html',
  styleUrl: './system-panel.component.css',
})
export class SystemPanelComponent implements OnDestroy {
  private readonly toastService = inject(ToastService);
  private readonly configurationService = inject(ConfigurationService);
  private readonly destroyRef = inject(DestroyRef);
  readonly dataService = inject(PowerDataService);

  // Оставшееся время в секундах
  readonly remainingTime = signal<number>(0);

  readonly command = signal<string | null>(null);
  readonly isCommandScheduled = computed(() => (this.command() ? true : false));

  // Исходное время таймера в секундах
  private readonly COUNTDOWN_DURATION = 5;

  private timerSubscription?: Subscription;

  constructor() {
    effect(() => {
      const current = this.command();
      // сброс таймера
      this.stopCountDownTimer();
      // если команда задана, то запускаем таймер
      if (current) {
        this.startCountDownTimer();
      }
    });
  }

  startCountDownTimer(): void {
    // Устанавливаем начальное значение
    this.remainingTime.set(this.COUNTDOWN_DURATION);

    // Создаем таймер с интервалом 1 секунда
    this.timerSubscription = interval(1000)
      .pipe(takeWhile(() => this.remainingTime() > 0))
      .subscribe(
        () => {
          // Уменьшаем время на 1 секунду
          const newTime = this.remainingTime() - 1;
          this.remainingTime.set(newTime);

          // Если время вышло
          if (newTime <= 0) {
            const command = this.command();
            this.resetCommand();
            this.sendCommandToServer(command); // Выполняем действие по завершении
          }
        },
        (err) => this.resetCommand(),
      );
  }

  stopCountDownTimer(): void {
    // Отписываемся от таймера
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = undefined;
    }
  }

  private sendCommandToServer(command: string | null): void {
    if (command) {
      if (!this.configurationService.targetServer()) {
        this.toastService.show('Подключение не задано');
        return;
      }
      this.dataService
        .sendCommand(command)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => this.toastService.show('Команда отправлена'),
          error: (error) => {
            console.error(error);
            this.toastService.show('Произошла ошибка');
          },
        });
    }
  }

  resetCommand(): void {
    this.command.set(null);
  }

  scheduleCommand(command: string): void {
    this.command.set(command);
  }

  ngOnDestroy(): void {
    this.stopCountDownTimer(); // Очистка при уничтожении компонента
    this.resetCommand();
  }
}
