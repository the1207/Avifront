import { Routes } from '@angular/router';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard()],
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Accueil | Aviform',
        loadComponent: () => import('./pages/home/home.component').then(module => module.HomeComponent),
      },
      {
        path: 'matieres-premieres',
        title: 'Matières premières | Aviform',
        canActivate: [authGuard(['GESTIONNAIRE_ACHATS', 'ADMINISTRATEUR'])],
        loadComponent: () => import('./pages/matieres/matieres.component').then(module => module.MatieresComponent),
      },
      {
        path: 'optimisation',
        title: 'Optimisation | Aviform',
        canActivate: [authGuard(['NUTRITIONNISTE', 'ADMINISTRATEUR'])],
        loadComponent: () => import('./pages/optimisation/optimisation.component').then(module => module.OptimisationComponent),
      },
      {
        path: 'profils',
        title: 'Profils nutritionnels | Aviform',
        canActivate: [authGuard(['NUTRITIONNISTE', 'ADMINISTRATEUR'])],
        loadComponent: () => import('./pages/profils/profils.component').then(module => module.ProfilsComponent),
      },
      {
        path: 'formules',
        title: 'Formules | Aviform',
        canActivate: [authGuard(['NUTRITIONNISTE', 'OPERATEUR_ATELIER', 'ADMINISTRATEUR'])],
        loadComponent: () => import('./pages/formules/formules.component').then(module => module.FormulesComponent),
      },
      {
        path: 'utilisateurs',
        title: 'Utilisateurs | Aviform',
        canActivate: [authGuard(['ADMINISTRATEUR'])],
        loadComponent: () => import('./pages/utilisateurs/utilisateurs.component').then(module => module.UtilisateursComponent),
      },
    ],
  },
  { path: 'signin', component: SignInComponent, title: 'Connexion | Aviform' },
  { path: '**', component: NotFoundComponent, title: 'Page introuvable | Aviform' },
];
