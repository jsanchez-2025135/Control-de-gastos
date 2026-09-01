import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SessionExpiredModalComponent } from './shared/components/session-expired-modal/session-expired-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SessionExpiredModalComponent],
  template: `
    <router-outlet></router-outlet>
    <app-session-expired-modal></app-session-expired-modal>
  `,
})
export class AppComponent {}