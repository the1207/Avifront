import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { ROLES, Role, Utilisateur } from '../../core/models/api.models';
import { UtilisateurService } from '../../core/services/api.services';
import { messageErreur } from '../../core/services/download';

@Component({
  selector: 'app-utilisateurs',
  imports: [FormsModule],
  template: `
    <h1 class="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">Utilisateurs</h1>

    @if (erreur()) {
      <p role="alert" class="mb-4 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-500">{{ erreur() }}</p>
    }

    @if (fiche()) {
      <section class="mb-6 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]" aria-label="Détail de l'utilisateur">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-base font-semibold text-gray-800 dark:text-white/90">Détail du compte</h2>
            <dl class="mt-3 grid gap-3 text-sm sm:grid-cols-3">
              <div><dt class="text-gray-500">Identifiant</dt><dd class="font-medium text-gray-800 dark:text-gray-200">{{ fiche()?.id }}</dd></div>
              <div><dt class="text-gray-500">Adresse e-mail</dt><dd class="font-medium text-gray-800 dark:text-gray-200">{{ fiche()?.email }}</dd></div>
              <div><dt class="text-gray-500">Rôle</dt><dd class="font-medium text-gray-800 dark:text-gray-200">{{ fiche()?.role }}</dd></div>
            </dl>
          </div>
          <button type="button" class="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200" (click)="fermerFiche()">Fermer</button>
        </div>
      </section>
    }

    @if (editionId() !== null) {
      <form novalidate class="mb-6 grid grid-cols-1 items-end gap-4 rounded-lg border border-brand-200 bg-white p-5 dark:border-brand-500/30 dark:bg-white/[0.03] sm:grid-cols-2 lg:grid-cols-4" (ngSubmit)="enregistrerModification()">
        <h2 class="text-base font-semibold text-gray-800 dark:text-white/90 sm:col-span-2 lg:col-span-4">Modifier le compte</h2>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Adresse e-mail</label>
          <input class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" type="text" inputmode="email" autocomplete="email" name="editEmail" [(ngModel)]="edition.email" required />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Rôle</label>
          <select class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" name="editRole" [(ngModel)]="edition.role">
            @for (role of roles; track role) { <option [value]="role">{{ role }}</option> }
          </select>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Nouveau mot de passe (facultatif)</label>
          <input class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" type="password" autocomplete="new-password" name="editPassword" [(ngModel)]="edition.motDePasse" />
        </div>
        <div class="flex gap-2">
          <button class="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50" type="submit" [disabled]="modificationEnCours()">{{ modificationEnCours() ? 'Enregistrement...' : 'Enregistrer' }}</button>
          <button class="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5" type="button" (click)="annulerModification()">Annuler</button>
        </div>
      </form>
    }

    <form novalidate class="mb-6 grid grid-cols-1 items-end gap-4 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:grid-cols-2 lg:grid-cols-4" (ngSubmit)="creer()">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Email</label>
        <input class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" type="text" inputmode="email" autocomplete="email" name="email" [(ngModel)]="nouveau.email" required />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Mot de passe</label>
        <input class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" type="password" autocomplete="new-password" name="pwd" [(ngModel)]="nouveau.motDePasse" required />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Rôle</label>
        <select class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" name="role" [(ngModel)]="nouveau.role">
          @for (role of roles; track role) { <option [value]="role">{{ role }}</option> }
        </select>
      </div>
      <button class="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50" type="submit" [disabled]="creationEnCours()">{{ creationEnCours() ? 'Création...' : "Créer l'utilisateur" }}</button>
    </form>

    <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
      <table class="w-full min-w-[520px]">
        <thead class="border-b border-gray-100 dark:border-gray-800">
          <tr>
            <th class="px-4 py-3 text-start text-xs font-medium text-gray-500">Email</th>
            <th class="px-4 py-3 text-start text-xs font-medium text-gray-500">Rôle</th>
            <th class="px-4 py-3 text-end text-xs font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          @for (utilisateur of utilisateurs(); track utilisateur.id) {
            <tr>
              <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{{ utilisateur.email }}</td>
              <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{{ utilisateur.role }}</td>
              <td class="px-4 py-3 text-end text-sm">
                <div class="flex justify-end gap-3">
                  <button class="text-brand-600 dark:text-brand-400" (click)="consulter(utilisateur)">Consulter</button>
                  <button class="text-brand-600 dark:text-brand-400" (click)="ouvrirModification(utilisateur)">Modifier</button>
                  @if (utilisateur.email.toLowerCase() === auth.email().toLowerCase()) {
                    <span class="text-gray-500">Compte actuel</span>
                  } @else {
                    <button class="text-error-600 dark:text-error-400" (click)="supprimer(utilisateur)">Supprimer</button>
                  }
                </div>
              </td>
            </tr>
          } @empty {
            <tr><td class="px-4 py-3 text-sm text-gray-500" colspan="3">Aucun utilisateur.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class UtilisateursComponent {
  private api = inject(UtilisateurService);
  auth = inject(AuthService);

  roles = ROLES;
  utilisateurs = signal<Utilisateur[]>([]);
  fiche = signal<Utilisateur | null>(null);
  erreur = signal('');
  creationEnCours = signal(false);
  modificationEnCours = signal(false);
  editionId = signal<number | null>(null);
  edition: { email: string; role: Role; motDePasse: string } = { email: '', role: 'NUTRITIONNISTE', motDePasse: '' };
  nouveau: { email: string; motDePasse: string; role: Role } = {
    email: '',
    motDePasse: '',
    role: 'NUTRITIONNISTE',
  };

  constructor() { this.charger(); }

  charger() {
    this.api.findAll().subscribe({
      next: utilisateurs => this.utilisateurs.set(utilisateurs),
      error: error => this.erreur.set(messageErreur(error)),
    });
  }

  creer() {
    this.erreur.set('');
    const email = this.nouveau.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.erreur.set('Saisis une adresse e-mail valide, par exemple nom@domaine.fr.');
      return;
    }
    this.creationEnCours.set(true);
    this.api.create({ ...this.nouveau, email }).subscribe({
      next: () => {
        this.creationEnCours.set(false);
        this.nouveau = { email: '', motDePasse: '', role: 'NUTRITIONNISTE' };
        this.charger();
      },
      error: error => {
        this.creationEnCours.set(false);
        this.erreur.set(messageErreur(error));
      },
    });
  }

  consulter(utilisateur: Utilisateur) {
    this.erreur.set('');
    this.api.findById(utilisateur.id).subscribe({
      next: detail => this.fiche.set(detail),
      error: error => this.erreur.set(messageErreur(error, 'Impossible de charger ce compte.')),
    });
  }

  fermerFiche() {
    this.fiche.set(null);
  }

  ouvrirModification(utilisateur: Utilisateur) {
    this.fiche.set(null);
    this.erreur.set('');
    this.editionId.set(utilisateur.id);
    this.edition = { email: utilisateur.email, role: utilisateur.role, motDePasse: '' };
  }

  annulerModification() {
    this.editionId.set(null);
    this.edition = { email: '', role: 'NUTRITIONNISTE', motDePasse: '' };
  }

  enregistrerModification() {
    const id = this.editionId();
    if (id === null) return;
    const email = this.edition.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.erreur.set('Saisis une adresse e-mail valide, par exemple nom@domaine.fr.');
      return;
    }
    this.erreur.set('');
    this.modificationEnCours.set(true);
    const motDePasse = this.edition.motDePasse.trim();
    this.api.update(id, {
      email,
      role: this.edition.role,
      ...(motDePasse ? { motDePasse } : {}),
    }).subscribe({
      next: () => {
        this.modificationEnCours.set(false);
        this.annulerModification();
        this.charger();
      },
      error: error => {
        this.modificationEnCours.set(false);
        this.erreur.set(messageErreur(error, 'Modification impossible.'));
      },
    });
  }

  supprimer(utilisateur: Utilisateur) {
    if (utilisateur.email.toLowerCase() === this.auth.email().toLowerCase()) return;
    if (!confirm(`Supprimer ${utilisateur.email} ?`)) return;
    this.erreur.set('');
    this.api.delete(utilisateur.id).subscribe({
      next: () => this.charger(),
      error: error => this.erreur.set(messageErreur(error)),
    });
  }
}
