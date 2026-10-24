import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NUTRIMENTS, Profil } from '../../core/models/api.models';
import { BesoinService, ProfilService } from '../../core/services/api.services';
import { messageErreur } from '../../core/services/download';

@Component({
  selector: 'app-profils',
  imports: [FormsModule],
  template: `
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-semibold text-gray-800 dark:text-white/90">Profils nutritionnels</h1>
      <button class="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600" (click)="ouvrirCreation()">+ Nouveau profil</button>
    </div>

    @if (erreur()) {
      <p role="alert" class="mb-4 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-500">{{ erreur() }}</p>
    }

    @if (afficherForm()) {
      <form class="mb-6 grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:grid-cols-3" (ngSubmit)="enregistrerProfil()">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Catégorie *</label>
          <input class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" name="cat" [(ngModel)]="formulaire.nomCategorie" placeholder="Poulet de chair" required />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Stade *</label>
          <input class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" name="stade" [(ngModel)]="formulaire.stade" placeholder="Démarrage" required />
        </div>
        <div class="flex items-end gap-3">
          <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" name="perso" [(ngModel)]="formulaire.estPersonnalise" /> Personnalisé
          </label>
          <button class="ms-auto rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50" type="submit" [disabled]="creationEnCours()">{{ creationEnCours() ? 'Enregistrement...' : (editId ? 'Enregistrer' : 'Créer') }}</button>
          @if (editId) {
            <button class="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700" type="button" (click)="annulerEdition()">Annuler</button>
          }
        </div>
      </form>
    }

    <div class="space-y-6">
      @for (profil of profils(); track profil.id) {
        <section class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="font-medium text-gray-800 dark:text-white/90">{{ profil.nomCategorie }} — {{ profil.stade }}</h2>
              <p class="text-xs text-gray-500">{{ profil.estPersonnalise ? 'Personnalisé' : 'Standard' }}</p>
            </div>
            <div class="flex gap-3">
              <button class="text-sm text-brand-500" (click)="ouvrirEdition(profil)">Modifier</button>
              <button class="text-sm text-error-600 dark:text-error-400" (click)="supprimerProfil(profil)">Supprimer le profil</button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full min-w-[420px]">
              <thead class="border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th class="px-4 py-2 text-start text-xs font-medium text-gray-500">Nutriment</th>
                  <th class="px-4 py-2 text-start text-xs font-medium text-gray-500">Min</th>
                  <th class="px-4 py-2 text-start text-xs font-medium text-gray-500">Max</th>
                  <th class="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                @for (besoin of profil.besoins; track besoin.id) {
                  <tr>
                    <td class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{{ besoin.nomNutriment }}</td>
                    <td class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{{ besoin.valeurMin }}</td>
                    <td class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{{ besoin.valeurMax }}</td>
                    <td class="px-4 py-2 text-end text-sm">
                      <button class="text-error-600 dark:text-error-400" (click)="supprimerBesoin(besoin.id)">Retirer</button>
                    </td>
                  </tr>
                } @empty {
                  <tr><td class="px-4 py-2 text-sm text-gray-500" colspan="4">Aucun besoin défini.</td></tr>
                }
              </tbody>
            </table>
          </div>

          <form class="mt-4 grid grid-cols-1 items-end gap-3 sm:grid-cols-4" (ngSubmit)="ajouterBesoin(profil.id)">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Nutriment</label>
              <select class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" [name]="'nutriment-' + profil.id" [(ngModel)]="besoin.nomNutriment" required>
                @for (nutriment of nutriments; track nutriment) { <option [value]="nutriment">{{ nutriment }}</option> }
              </select>
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Min</label>
              <input class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" type="number" step="any" [name]="'min-' + profil.id" [(ngModel)]="besoin.valeurMin" required />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Max</label>
              <input class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" type="number" step="any" [name]="'max-' + profil.id" [(ngModel)]="besoin.valeurMax" required />
            </div>
            <button class="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700" type="submit">+ Ajouter un besoin</button>
          </form>
        </section>
      } @empty {
        <p class="text-sm text-gray-500">Aucun profil pour le moment.</p>
      }
    </div>
  `,
})
export class ProfilsComponent {
  private profilApi = inject(ProfilService);
  private besoinApi = inject(BesoinService);

  nutriments = NUTRIMENTS;
  profils = signal<Profil[]>([]);
  erreur = signal('');
  afficherForm = signal(false);
  creationEnCours = signal(false);
  formulaire = { nomCategorie: '', stade: '', estPersonnalise: false };
  editId: number | null = null;
  besoin: { nomNutriment: string; valeurMin: number | null; valeurMax: number | null } = {
    nomNutriment: 'PROTEINES_BRUTES',
    valeurMin: null,
    valeurMax: null,
  };

  constructor() { this.charger(); }

  charger() {
    this.profilApi.findAll().subscribe({
      next: profils => this.profils.set(profils),
      error: error => this.erreur.set(messageErreur(error)),
    });
  }

  ouvrirCreation() {
    this.editId = null;
    this.formulaire = { nomCategorie: '', stade: '', estPersonnalise: false };
    this.afficherForm.set(true);
  }

  ouvrirEdition(profil: Profil) {
    this.editId = profil.id;
    this.formulaire = {
      nomCategorie: profil.nomCategorie,
      stade: profil.stade,
      estPersonnalise: profil.estPersonnalise,
    };
    this.afficherForm.set(true);
  }

  annulerEdition() {
    this.afficherForm.set(false);
    this.editId = null;
    this.formulaire = { nomCategorie: '', stade: '', estPersonnalise: false };
  }

  enregistrerProfil() {
    this.erreur.set('');
    this.creationEnCours.set(true);
    const appel = this.editId
      ? this.profilApi.update(this.editId, this.formulaire)
      : this.profilApi.create(this.formulaire);
    appel.subscribe({
      next: () => {
        this.creationEnCours.set(false);
        this.formulaire = { nomCategorie: '', stade: '', estPersonnalise: false };
        this.editId = null;
        this.afficherForm.set(false);
        this.charger();
      },
      error: error => {
        this.creationEnCours.set(false);
        this.erreur.set(messageErreur(error));
      },
    });
  }

  supprimerProfil(profil: Profil) {
    if (!confirm(`Supprimer le profil « ${profil.nomCategorie} — ${profil.stade} » ?`)) return;
    this.erreur.set('');
    this.profilApi.delete(profil.id).subscribe({
      next: () => this.charger(),
      error: error => this.erreur.set(messageErreur(error, 'Suppression impossible (profil utilisé par une formule ?).')),
    });
  }

  ajouterBesoin(profilId: number) {
    if (this.besoin.valeurMin === null || this.besoin.valeurMax === null) return;
    this.erreur.set('');
    this.besoinApi.create({
      nomNutriment: this.besoin.nomNutriment,
      valeurMin: this.besoin.valeurMin,
      valeurMax: this.besoin.valeurMax,
      profilNutritionnelId: profilId,
    }).subscribe({
      next: () => {
        this.besoin.valeurMin = null;
        this.besoin.valeurMax = null;
        this.charger();
      },
      error: error => this.erreur.set(messageErreur(error)),
    });
  }

  supprimerBesoin(id: number) {
    this.erreur.set('');
    this.besoinApi.delete(id).subscribe({
      next: () => this.charger(),
      error: error => this.erreur.set(messageErreur(error)),
    });
  }
}
