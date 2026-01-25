import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommandStatus } from './command-status';
import { map, Subject, switchMap, takeUntil, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-command-status',
  imports: [MatIconModule],
  templateUrl: './command-status.component.html',
  styleUrl: './command-status.component.css',
})
export class CommandStatusComponent {
  status = input<CommandStatus>(CommandStatus.none);
  displayStatus = signal<CommandStatus>(CommandStatus.none);

  // "немедленные" и "отложенные" статусы
  private immediateStatus$ = new Subject<CommandStatus>();
  private delayedStatus$ = new Subject<CommandStatus>();
  private cancelDelayed$ = new Subject<void>();

  private destroyRef = inject(DestroyRef);

  constructor() {
    // Завершаем cancelDelayed$ при уничтожении
    this.destroyRef.onDestroy(() => this.cancelDelayed$.complete());

    effect(() => {
      const newStatus = this.status();
      const currentDisplay = this.displayStatus();

      // Проверяем условие прямо в effect
      const isImmediate =
        newStatus === CommandStatus.error ||
        currentDisplay === CommandStatus.none ||
        currentDisplay === CommandStatus.completed ||
        currentDisplay === newStatus;

      if (isImmediate) {
        this.cancelDelayed$.next();
        this.immediateStatus$.next(newStatus);
      } else {
        this.delayedStatus$.next(newStatus);
      }
    });

    // Немедленные статусы
    this.immediateStatus$
      .pipe(takeUntilDestroyed())
      .subscribe((status) => this.displayStatus.set(status));

    // Отложенные статусы с debounce
    this.delayedStatus$
      .pipe(
        switchMap((status) =>
          timer(700).pipe(
            takeUntil(this.cancelDelayed$),
            map(() => status),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((status) => this.displayStatus.set(status));
  }

  statusClass = computed(() => {
    switch (this.displayStatus()) {
      case CommandStatus.progress:
        return 'blue-color';
      case CommandStatus.completed:
        return 'green-color';
      case CommandStatus.error:
        return 'red-color';
      default:
        return null;
    }
  });

  statusText = computed(() => {
    switch (this.displayStatus()) {
      case CommandStatus.progress:
        return 'Отправка команды';
      case CommandStatus.completed:
        return 'Команда выполнена';
      case CommandStatus.error:
        return 'Ошибка выполнения';
      default:
        return null;
    }
  });

  isSpinning = computed(() => this.displayStatus() === CommandStatus.progress);

  readonly iconName = computed(() => {
    switch (this.displayStatus()) {
      case CommandStatus.progress:
        return 'autorenew';
      case CommandStatus.completed:
        return 'check';
      case CommandStatus.error:
        return 'error';
      default:
        return null;
    }
  });
}
