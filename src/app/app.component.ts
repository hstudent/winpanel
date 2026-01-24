import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WinDisplayPanelComponent } from './panels/win-display-panel/win-display-panel.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, WinDisplayPanelComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'WinWebPanel';
}
