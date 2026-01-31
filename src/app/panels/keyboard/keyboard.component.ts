import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ConfigurationService } from '../../services/configuration-service';
import { KeyboardDataService } from '../../services/keyboard-data-service';
import { ToastService } from '../../services/toast-service';
import { catchError, EMPTY, Observable, of, Subject, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface KeyboardCommand {
  command: string;
  media: boolean;
}

@Component({
  selector: 'app-keyboard',
  imports: [MatButtonModule, MatDividerModule, MatIconModule],
  templateUrl: './keyboard.component.html',
  styleUrl: './keyboard.component.css',
})
export class KeyboardComponent {
  private readonly toastService = inject(ToastService);
  private readonly dataService = inject(KeyboardDataService);
  private readonly configurationService = inject(ConfigurationService);

  private readonly command = new Subject<KeyboardCommand>();

  constructor() {
    this.command
      .pipe(
        switchMap((command) => {
          if (!this.configurationService.targetServer()) {
            this.toastService.show('Подключение не задано');
            return EMPTY;
          }

          return this.sendKeyboardCommand(command).pipe(
            catchError((err) => {
              this.toastService.show('Команда не выполнена');
              return of(false);
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe(() => {});
  }

  sendKeyboardCommand(command: KeyboardCommand): Observable<boolean> {
    return command.media
      ? this.dataService.sendMediaCommand(command.command)
      : this.dataService.sendCommand(command.command);
  }

  sendCommand(command: string, media: boolean = false): void {
    this.command.next({ command, media });
  }
}
