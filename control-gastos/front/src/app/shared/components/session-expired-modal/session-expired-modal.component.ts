import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { SessionExpiredService } from '../../../core/services/session-expired.service';

@Component({
  selector: 'app-session-expired-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overlay" *ngIf="visible">
      <div class="modal">
        <h2>Sesión expirada</h2>
        <p>Su sesión ha expirado. Por favor, inicie sesión nuevamente.</p>
        <button (click)="close()">Aceptar</button>
      </div>
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal {
      background: #fff;
      border-radius: 12px;
      padding: 1.75rem 2rem;
      max-width: 360px;
      width: 90%;
      text-align: center;
      font-family: sans-serif;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    }
    .modal h2 {
      margin: 0 0 0.75rem;
      color: #1f2937;
    }
    .modal p {
      margin: 0 0 1.25rem;
      color: #4b5563;
    }
    .modal button {
      padding: 0.6rem 1.5rem;
      border: none;
      border-radius: 8px;
      background: #4f46e5;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
    }
    .modal button:hover {
      background: #4338ca;
    }
  `],
})
export class SessionExpiredModalComponent implements OnInit, OnDestroy {
  visible = false;
  private subscription?: Subscription;

  constructor(
    private sessionExpiredService: SessionExpiredService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscription = this.sessionExpiredService.expired$.subscribe(() => {
      this.visible = true;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  close(): void {
    this.visible = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}