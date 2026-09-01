import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SessionExpiredService {
  private timerId: ReturnType<typeof setTimeout> | null = null;

  readonly expired$ = new Subject<void>();

  scheduleExpiration(msUntilExpiration: number): void {
    this.clear();

    if (msUntilExpiration <= 0) {
      this.triggerExpired();
      return;
    }

    this.timerId = setTimeout(() => this.triggerExpired(), msUntilExpiration);
  }

  clear(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  triggerExpired(): void {
    this.clear();
    this.expired$.next();
  }
}