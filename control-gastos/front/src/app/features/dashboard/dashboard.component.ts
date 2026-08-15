import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * Placeholder del Dashboard.
 * Aún no existe la vista real, así que solo confirmamos que el login
 * funcionó: mostramos el mensaje de éxito, el nombre y el rol del usuario.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="success-box">
      <h1>✅ Inicio de sesión exitoso</h1>
      <p>Bienvenido, <strong>{{ user?.name }}</strong></p>
      <p>Rol: <strong>{{ user?.role }}</strong></p>
      <button (click)="logout()">Cerrar sesión</button>
    </div>
  `,
  styles: [`
    .success-box {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      height: 100vh; font-family: sans-serif; gap: 0.5rem;
    }
    button {
      margin-top: 1rem; padding: 0.6rem 1.2rem; border: none; border-radius: 8px;
      background: #4f46e5; color: #fff; cursor: pointer;
    }
  `],
})
export class DashboardComponent {
  user: ReturnType<AuthService['getUser']>;

  constructor(private authService: AuthService, private router: Router) {
    this.user = this.authService.getUser();
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
