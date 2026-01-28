import { Component, DestroyRef, inject, Inject, signal } from '@angular/core';
import { filter, finalize, Observable, Subject, switchMap } from 'rxjs';
import { ServerEndpoint } from '../model/server-endpoint';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { getServerEndpointUrl } from './server-endpoint-validation';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-server-endpoint',
  imports: [
    MatDialogModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
  ],
  templateUrl: './server-endpoint.component.html',
  styleUrl: './server-endpoint.component.css',
})
export class ServerEndpointComponent {
  private readonly snackBar = inject(MatSnackBar);

  private destroyRef = inject(DestroyRef);
  private readonly httpClient = inject(HttpClient);

  private dialogRef = inject(MatDialogRef<ServerEndpointComponent>);

  readonly endpoint: ServerEndpoint;
  isConnectionCheckInProgress = signal<boolean>(false);

  constructor(@Inject(MAT_DIALOG_DATA) data: any) {
    if (data.endpoint) {
      this.endpoint = { ...data.endpoint };
    } else {
      this.endpoint = {
        name: '',
        protocol: 'http',
        ip: '',
        port: 0,
      };
    }
  }

  static edit(
    matDialog: MatDialog,
    endpoint: ServerEndpoint | null,
  ): Observable<ServerEndpoint> {
    return matDialog
      .open(ServerEndpointComponent, {
        data: { endpoint },
        disableClose: true,
      })
      .afterClosed()
      .pipe(filter((endpoint) => endpoint !== null));
  }

  getFullUrl(): string {
    return getServerEndpointUrl(this.endpoint);
  }

  onSave(): void {
    this.isConnectionCheckInProgress.set(true);

    const url = `${getServerEndpointUrl(this.endpoint)}/api/connect`;
    this.httpClient
      .get<string>(url)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isConnectionCheckInProgress.set(false)),
      )
      .subscribe(
        (status: string) => {
          if (status === 'connected') {
            this.dialogRef.close(this.endpoint);
          } else {
            this.showToast('Неверный ответ от сервера');
          }
        },
        (err) => this.showToast('Ошибка подключения к серверу'),
      );
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  showToast(message: string) {
    this.snackBar.open(message, 'Закрыть', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
