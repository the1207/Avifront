import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { Role } from '../../../core/models/api.models';
import { SidebarService } from '../../services/sidebar.service';

type NavItem = { name: string; path: string; roles?: Role[] };

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './app-sidebar.component.html',
})
export class AppSidebarComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private routeSubscription?: Subscription;

  private readonly tousLesItems: NavItem[] = [
    { name: 'Accueil', path: '/' },
    { name: 'Optimisation', path: '/optimisation', roles: ['NUTRITIONNISTE', 'ADMINISTRATEUR'] },
    { name: 'Formules', path: '/formules', roles: ['NUTRITIONNISTE', 'OPERATEUR_ATELIER', 'ADMINISTRATEUR'] },
    { name: 'Profils nutritionnels', path: '/profils', roles: ['NUTRITIONNISTE', 'ADMINISTRATEUR'] },
    { name: 'Matières premières', path: '/matieres-premieres', roles: ['GESTIONNAIRE_ACHATS', 'ADMINISTRATEUR'] },
    { name: 'Utilisateurs', path: '/utilisateurs', roles: ['ADMINISTRATEUR'] },
  ];

  readonly isExpanded$;
  readonly isMobileOpen$;
  readonly isHovered$;

  constructor(public sidebarService: SidebarService) {
    this.isExpanded$ = sidebarService.isExpanded$;
    this.isMobileOpen$ = sidebarService.isMobileOpen$;
    this.isHovered$ = sidebarService.isHovered$;
  }

  get navItems(): NavItem[] {
    return this.tousLesItems.filter(item => !item.roles || this.auth.hasRole(...item.roles));
  }

  ngOnInit() {
    this.routeSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.fermerMobile());
  }

  ngOnDestroy() {
    this.routeSubscription?.unsubscribe();
  }

  isActive(path: string): boolean {
    return this.router.url.split('?')[0] === path;
  }

  onSidebarMouseEnter() {
    this.isExpanded$.subscribe(expanded => {
      if (!expanded) this.sidebarService.setHovered(true);
    }).unsubscribe();
  }

  fermerMobile() {
    this.sidebarService.setMobileOpen(false);
  }
}
