import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatierePremiere, MatierePremiereRequest } from '../../core/models/api.models';
import { MatierePremiereService } from '../../core/services/api.services';
import { messageErreur } from '../../core/services/download';

interface Champ { key: keyof MatierePremiereRequest; label: string; }

@Component({
  selector: 'app-matieres',
  imports: [FormsModule],
  template: `
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-semibold text-gray-800 dark:text-white/90">Matières premières</h1>
      <button class="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600" (click)="ouvrir()">+ Nouvelle matière</button>
    </div>

    @if (erreur()) {
      <p role="alert" class="mb-4 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-500">{{ erreur() }}</p>
    }

    @if (afficherForm()) {
      <form class="mb-6 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]" (ngSubmit)="enregistrer()">
        <h2 class="mb-4 font-medium text-gray-800 dark:text-white/90">{{ editId ? 'Modifier' : 'Ajouter' }} une matière</h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="sm:col-span-2">
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Nom *</label>
            <input class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" name="nom" [(ngModel)]="form['nom']" required />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Prix unitaire *</label>
            <input class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" type="number" step="any" min="0" name="prixUnitaire" [(ngModel)]="form['prixUnitaire']" required />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Taux min (%) *</label>
            <input class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" type="number" step="any" min="0" name="tauxMin" [(ngModel)]="form['tauxIncorporationMin']" required />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Taux max (%) *</label>
            <input class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" type="number" step="any" min="0" name="tauxMax" [(ngModel)]="form['tauxIncorporationMax']" required />
          </div>
          @for (champ of champs; track champ.key) {
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">{{ champ.label }}</label>
              <input class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" type="number" step="any" [name]="champ.key" [(ngModel)]="form[champ.key]" />
            </div>
          }
          <div class="flex items-end">
            <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" name="disponible" [(ngModel)]="form['disponible']" /> Disponible
            </label>
          </div>
        </div>
        <div class="mt-5 flex flex-wrap gap-3">
          <button class="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50" type="submit" [disabled]="enregistrement()">{{ enregistrement() ? 'Enregistrement...' : 'Enregistrer' }}</button>
          <button class="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700" type="button" (click)="fermerFormulaire()">Annuler</button>
        </div>
      </form>
    }

    <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
      <table class="w-full min-w-[760px]">
        <thead class="border-b border-gray-100 dark:border-gray-800">
          <tr>
            <th class="px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400">Nom</th>
            <th class="px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400">PB %</th>
            <th class="px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400">EM kcal/kg</th>
            <th class="px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400">Prix</th>
            <th class="px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400">Min-Max %</th>
            <th class="px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400">Dispo</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          @for (matiere of matieres(); track matiere.id) {
            <tr>
              <td class="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">{{ matiere.nom }}</td>
              <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{{ matiere.proteinesBrutes }}</td>
              <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{{ matiere.energieMetabolisable }}</td>
              <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{{ matiere.prixUnitaire }}</td>
              <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{{ matiere.tauxIncorporationMin }} - {{ matiere.tauxIncorporationMax }}</td>
              <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{{ matiere.disponible ? 'Oui' : 'Non' }}</td>
              <td class="px-4 py-3 text-end text-sm">
                <div class="flex justify-end gap-3">
                  <button class="text-brand-500" (click)="ouvrir(matiere)">Modifier</button>
                  <button class="text-error-600 dark:text-error-400" (click)="supprimer(matiere)">Supprimer</button>
                </div>
              </td>
            </tr>
          } @empty {
            <tr><td class="px-4 py-3 text-sm text-gray-500" colspan="7">Aucune matière première.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class MatieresComponent {
  private api = inject(MatierePremiereService);

  matieres = signal<MatierePremiere[]>([]);
  erreur = signal('');
  afficherForm = signal(false);
  enregistrement = signal(false);
  editId: number | null = null;
  form: Record<string, any> = {};

  champs: Champ[] = [
    { key: 'matiereSeche', label: 'Matière sèche %' },
    { key: 'proteinesBrutes', label: 'Protéines brutes %' },
    { key: 'energieMetabolisable', label: 'Énergie métab. kcal/kg' },
    { key: 'matieresGrasses', label: 'Matières grasses %' },
    { key: 'celluloseBrute', label: 'Cellulose brute %' },
    { key: 'lysine', label: 'Lysine %' },
    { key: 'methionine', label: 'Méthionine %' },
    { key: 'aas', label: 'AAS %' },
    { key: 'calcium', label: 'Calcium %' },
    { key: 'phosphore', label: 'Phosphore %' },
    { key: 'sodium', label: 'Sodium %' },
  ];

  constructor() { this.charger(); }

  charger() {
    this.api.findAll().subscribe({
      next: matieres => this.matieres.set(matieres),
      error: error => this.erreur.set(messageErreur(error)),
    });
  }

  ouvrir(matiere?: MatierePremiere) {
    this.erreur.set('');
    this.editId = matiere?.id ?? null;
    this.form = matiere ? { ...matiere } : {
      disponible: true,
      tauxIncorporationMin: 0,
      tauxIncorporationMax: 100,
    };
    this.afficherForm.set(true);
  }

  fermerFormulaire() {
    this.afficherForm.set(false);
    this.editId = null;
    this.form = {};
  }

  enregistrer() {
    this.erreur.set('');
    this.enregistrement.set(true);
    const { id, ...corps } = this.form;
    const requete = corps as MatierePremiereRequest;
    const appel = this.editId
      ? this.api.update(this.editId, requete)
      : this.api.create(requete);

    appel.subscribe({
      next: () => {
        this.enregistrement.set(false);
        this.fermerFormulaire();
        this.charger();
      },
      error: error => {
        this.enregistrement.set(false);
        this.erreur.set(messageErreur(error, 'Enregistrement impossible.'));
      },
    });
  }

  supprimer(matiere: MatierePremiere) {
    if (!confirm(`Supprimer « ${matiere.nom} » ?`)) return;
    this.erreur.set('');
    this.api.delete(matiere.id).subscribe({
      next: () => this.charger(),
      error: error => this.erreur.set(messageErreur(error, 'Suppression impossible (matière utilisée dans une formule ?).')),
    });
  }
}
