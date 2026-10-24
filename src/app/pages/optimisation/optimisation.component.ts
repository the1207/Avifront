import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Formule, MatierePremiere, MoteurResponse, Profil } from '../../core/models/api.models';
import { MatierePremiereService, MoteurService, ProfilService } from '../../core/services/api.services';
import { messageErreur } from '../../core/services/download';

@Component({
  selector: 'app-optimisation',
  imports: [FormsModule],
  template: `
    <h1 class="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">Optimisation de formule</h1>
    @if (erreur()) {
      <p role="alert" class="mb-4 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-500">{{ erreur() }}</p>
    }
    <form class="space-y-5" (ngSubmit)="resoudre()">
      <section class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 class="mb-4 font-medium text-gray-800 dark:text-white/90">Paramètres</h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label for="profil" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Profil nutritionnel</label>
            <select id="profil" name="profil" [(ngModel)]="profilNutritionnelId" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
              <option [ngValue]="null" disabled>Choisir un profil</option>
              @for (profil of profils(); track profil.id) {
                <option [ngValue]="profil.id">{{ profil.nomCategorie }} — {{ profil.stade }}</option>
              }
            </select>
          </div>
          <div>
            <label for="quantite" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Quantité totale (kg)</label>
            <input id="quantite" name="quantite" type="number" min="0.01" step="any" [(ngModel)]="quantiteTotale" required class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" />
          </div>
        </div>
      </section>
      <section class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 class="mb-4 font-medium text-gray-800 dark:text-white/90">Matières premières disponibles</h2>
        <div class="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          @for (matiere of matieres(); track matiere.id) {
            <label class="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" [checked]="matieresSelectionnees().includes(matiere.id)" (change)="basculerMatiere(matiere.id, $any($event.target).checked)" />
              <span>{{ matiere.nom }} <span class="text-gray-500">· {{ matiere.prixUnitaire }} FCFA/kg</span></span>
            </label>
          } @empty {
            <p class="text-sm text-gray-500">Aucune matière disponible.</p>
          }
        </div>
        <button type="submit" [disabled]="enCours() || !matieresSelectionnees().length || !profils().length" class="mt-5 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50">
          {{ enCours() ? 'Optimisation en cours...' : 'Lancer l’optimisation' }}
        </button>
      </section>
    </form>
    @if (resultat()?.succes && resultat()?.formule; as formule) {
      <section class="mt-6 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 class="mb-4 font-medium text-gray-800 dark:text-white/90">Formule optimisée n°{{ formule.id }}</h2>
        <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">{{ formule.quantiteTotale }} kg · {{ formule.coutParKg.toFixed(2) }} FCFA/kg · coût total {{ formule.coutTotal.toFixed(2) }} FCFA</p>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[560px]">
            <thead class="border-b border-gray-100 dark:border-gray-800"><tr><th class="px-3 py-2 text-start text-xs font-medium text-gray-500">Matière</th><th class="px-3 py-2 text-start text-xs font-medium text-gray-500">Quantité (kg)</th><th class="px-3 py-2 text-start text-xs font-medium text-gray-500">Pourcentage</th></tr></thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              @for (ligne of formule.lignes; track ligne.id) {
                <tr><td class="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{{ ligne.matierePremiereNom }}</td><td class="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{{ ligne.quantiteKg.toFixed(2) }}</td><td class="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{{ ligne.pourcentage.toFixed(2) }} %</td></tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    } @else if (resultat()?.erreur) {
      <p role="status" class="mt-6 rounded-lg bg-warning-50 px-4 py-3 text-sm text-warning-700 dark:bg-warning-500/15 dark:text-warning-400">{{ resultat()?.erreur }}</p>
    }
  `,
})
export class OptimisationComponent {
  private matiereApi = inject(MatierePremiereService);
  private profilApi = inject(ProfilService);
  private moteurApi = inject(MoteurService);

  matieres = signal<MatierePremiere[]>([]);
  profils = signal<Profil[]>([]);
  matieresSelectionnees = signal<number[]>([]);
  resultat = signal<MoteurResponse | null>(null);
  erreur = signal('');
  enCours = signal(false);
  profilNutritionnelId: number | null = null;
  quantiteTotale = 100;

  constructor() {
    this.matiereApi.findAll().subscribe({
      next: matieres => this.matieres.set(matieres.filter(matiere => matiere.disponible)),
      error: error => this.erreur.set(messageErreur(error)),
    });
    this.profilApi.findAll().subscribe({
      next: profils => this.profils.set(profils),
      error: error => this.erreur.set(messageErreur(error)),
    });
  }

  basculerMatiere(id: number, selectionnee: boolean) {
    this.matieresSelectionnees.update(ids => selectionnee ? [...ids, id] : ids.filter(item => item !== id));
  }

  resoudre() {
    if (this.profilNutritionnelId === null || this.quantiteTotale <= 0) return;
    this.erreur.set('');
    this.resultat.set(null);
    this.enCours.set(true);
    this.moteurApi.resoudre({
      matieresPremieresIds: this.matieresSelectionnees(),
      profilNutritionnelId: this.profilNutritionnelId,
      quantiteTotale: this.quantiteTotale,
    }).subscribe({
      next: resultat => {
        this.resultat.set(resultat);
        this.enCours.set(false);
      },
      error: error => {
        this.erreur.set(messageErreur(error, 'Échec de l’optimisation.'));
        this.enCours.set(false);
      },
    });
  }
}