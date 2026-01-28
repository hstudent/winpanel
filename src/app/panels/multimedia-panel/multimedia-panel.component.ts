import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MultiMediaDataService } from '../../services/multimedia-data-service';
import { MediaAction } from '../../services/media-action';
import { ConfigurationService } from '../../services/configuration-service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-multimedia-panel',
  imports: [MatButtonModule, MatDividerModule, MatIconModule],
  templateUrl: './multimedia-panel.component.html',
  styleUrl: './multimedia-panel.component.css',
})
export class MultimediaPanelComponent {
  private readonly snackBar = inject(MatSnackBar);
  private readonly dataService = inject(MultiMediaDataService);
  private readonly configurationService = inject(ConfigurationService);

  MediaAction = MediaAction;

  sendCommand(action: MediaAction): void {
    if (!this.configurationService.targetServer()) {
      this.showToast('Подключение не задано');
      return;
    }

    this.dataService.execute(action).subscribe(() => {});
  }

  showToast(message: string) {
    this.snackBar.open(message, 'Закрыть', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
