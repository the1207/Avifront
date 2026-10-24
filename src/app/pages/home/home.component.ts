import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { Role } from '../../core/models/api.models';

interface HomeAction {
  title: string;
  description: string;
  path: string;
  roles: Role[];
}

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <div class="space-y-8">
      <section class="relative overflow-hidden rounded-lg bg-brand-700 px-6 py-8 text-white sm:px-9 sm:py-10">
        <div class="pointer-events-none absolute inset-y-0 end-0 hidden w-2/5 border-s border-white/10 lg:block">
          <div class="absolute inset-y-0 start-1/3 w-px bg-white/10"></div>
          <div class="absolute inset-y-0 start-2/3 w-px bg-white/10"></div>
          <div class="absolute inset-x-0 top-1/2 h-px bg-white/10"></div>
        </div>
        <div class="relative max-w-2xl">
          <p class="mb-3 text-xs font-semibold uppercase text-white/75">{{ dateDuJour }}</p>
          <h1 class="text-3xl font-semibold sm:text-4xl">Bonjour, {{ prenom }}.</h1>
          <p class="mt-3 max-w-lg text-base leading-7 text-white/80">Bienvenue dans votre espace Aviform. Votre prochain mélange commence ici.</p>
          @if (auth.hasRole('NUTRITIONNISTE', 'ADMINISTRATEUR')) {
            <a routerLink="/optimisation" class="mt-6 inline-flex min-h-11 items-center gap-3 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-brand-800 transition hover:bg-white/90">
              Créer une formule optimisée
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </a>
          } @else if (auth.hasRole('GESTIONNAIRE_ACHATS')) {
            <a routerLink="/matieres-premieres" class="mt-6 inline-flex min-h-11 items-center gap-3 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-brand-800 transition hover:bg-white/90">
              Gérer les matières premières
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </a>
          } @else {
            <a routerLink="/formules" class="mt-6 inline-flex min-h-11 items-center gap-3 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-brand-800 transition hover:bg-white/90">
              Voir les formules
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </a>
          }
        </div>
      </section>

      <section aria-labelledby="actions-title">
        <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p class="text-xs font-semibold uppercase text-brand-600 dark:text-brand-400">Espace de travail</p>
            <h2 id="actions-title" class="mt-1 text-xl font-semibold text-gray-800 dark:text-white/90">Accès rapides</h2>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ roleLabel }}</p>
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          @for (action of actions; track action.path) {
            <a [routerLink]="action.path" class="group flex min-h-32 flex-col justify-between rounded-lg border border-gray-200 bg-white p-5 transition hover:border-brand-400 hover:bg-brand-50/40 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-500/60 dark:hover:bg-brand-500/5">
              <span class="text-base font-semibold text-gray-800 group-hover:text-brand-700 dark:text-white/90 dark:group-hover:text-brand-300">{{ action.title }}</span>
              <span class="mt-2 flex items-end justify-between gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span>{{ action.description }}</span>
                <svg class="mb-0.5 shrink-0 text-gray-400 transition group-hover:translate-x-1 group-hover:text-brand-600 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
              </span>
            </a>
          }
        </div>
      </section>

      <footer class="border-t border-gray-200 pt-4 dark:border-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Session ouverte : {{ auth.email() }}</p>
      </footer>
    </div>
  `,
})
export class HomeComponent {
  auth = inject(AuthService);

  private readonly tousLesRaccourcis: HomeAction[] = [
    { title: 'Optimisation', description: 'Composer un mélange au meilleur coût.', path: '/optimisation', roles: ['NUTRITIONNISTE', 'ADMINISTRATEUR'] },
    { title: 'Formules', description: 'Retrouver les formulations enregistrées.', path: '/formules', roles: ['NUTRITIONNISTE', 'OPERATEUR_ATELIER', 'ADMINISTRATEUR'] },
    { title: 'Profils nutritionnels', description: 'Consulter les objectifs nutritionnels.', path: '/profils', roles: ['NUTRITIONNISTE', 'ADMINISTRATEUR'] },
    { title: 'Matières premières', description: 'Mettre à jour les ingrédients et leurs coûts.', path: '/matieres-premieres', roles: ['GESTIONNAIRE_ACHATS', 'ADMINISTRATEUR'] },
    { title: 'Utilisateurs', description: 'Gérer les comptes et les accès.', path: '/utilisateurs', roles: ['ADMINISTRATEUR'] },
  ];

  readonly dateDuJour = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date());

  get prenom(): string {
    const identifiant = this.auth.email().split('@')[0] || 'à vous';
    return identifiant.split(/[._-]/)[0];
  }

  get roleLabel(): string {
    const labels: Record<Role, string> = {
      NUTRITIONNISTE: 'Nutritionniste',
      GESTIONNAIRE_ACHATS: 'Gestion des achats',
      OPERATEUR_ATELIER: 'Opérations atelier',
      ADMINISTRATEUR: 'Administration',
    };
    const role = this.auth.role();
    return role ? labels[role] : '';
  }

  get actions(): HomeAction[] {
    return this.tousLesRaccourcis.filter(action => this.auth.hasRole(...action.roles));
  }
}
