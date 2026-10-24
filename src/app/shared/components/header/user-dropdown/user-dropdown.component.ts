import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-user-dropdown',
  standalone: true,
  templateUrl: './user-dropdown.component.html',
  imports: [CommonModule],
})
export class UserDropdownComponent {
  readonly auth = inject(AuthService);
  isOpen = false;

  constructor(private elementRef: ElementRef) {}

  initiales(): string {
    return this.auth.email().slice(0, 1).toLocaleUpperCase() || 'U';
  }

  toggleDropdown(event?: Event): void {
    event?.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  fermer(): void {
    this.isOpen = false;
  }

  seDeconnecter(): void {
    this.fermer();
    this.auth.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.fermer();
    }
  }
}
