import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API_URL, Role } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly KEY = 'gestnutri_token';

  token = signal<string | null>(typeof localStorage === 'undefined' ? null : localStorage.getItem(this.KEY));

  private payload = computed<{ sub: string; role?: string; exp: number } | null>(() => {
    const token = this.token();
    const encodedPayload = token?.split('.')[1];
    if (!encodedPayload) return null;
    try {
      const base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
      const paddedBase64 = base64.padEnd(base64.length + ((4 - base64.length % 4) % 4), '=');
      return JSON.parse(atob(paddedBase64));
    } catch {
      return null;
    }
  });

  email = computed(() => this.payload()?.sub ?? '');
  role = computed(() => this.payload()?.role?.replace('ROLE_', '') as Role | undefined);
  isLoggedIn = computed(() => {
    const payload = this.payload();
    return !!payload && payload.exp * 1000 > Date.now();
  });

  login(email: string, motDePasse: string) {
    return this.http.post<{ token: string }>(`${API_URL}/auth/login`, { email, motDePasse }).pipe(
      tap(response => {
        localStorage.setItem(this.KEY, response.token);
        this.token.set(response.token);
      })
    );
  }

  hasRole(...roles: Role[]): boolean {
    const role = this.role();
    return !!role && roles.includes(role);
  }

  logout() {
    localStorage.removeItem(this.KEY);
    this.token.set(null);
    this.router.navigate(['/signin']);
  }
}
