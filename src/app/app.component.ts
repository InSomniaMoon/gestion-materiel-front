import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Button } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { PwaService } from './core/services/pwa.service';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, Button],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  readonly pwaService = inject(PwaService);

  readonly showButton = this.pwaService.showButton;

  public installPwa() {
    this.pwaService.installPwa();
  }

  closeToast() {
    this.pwaService.closeToast();
  }
}
