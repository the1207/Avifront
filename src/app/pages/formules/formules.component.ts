import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { Formule } from '../../core/models/api.models';
import { FormuleService } from '../../core/services/api.services';
import { messageErreur, telecharger } from '../../core/services/download';

@Component({
  selector: 'app-formules',
  template: `
    <h1 class="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">Historique des formules</h1>

    @if (erreur()) {
      <p role="alert" class="mb-4 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-500">{{ erreur() }}</p>
    }

    <div class="space-y-4">
      @for (formule of formules(); track formule.id) {
        <section class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              class="text-start"
              [attr.aria-expanded]="ouvert() === formule.id"
              (click)="basculer(formule.id)"
            >
              <span class="block font-medium text-gray-800 dark:text-white/90">Formule n°{{ formule.id }} — {{ formule.dateCreation }}</span>
              <span class="block text-sm text-gray-500">
                {{ formule.quantiteTotale }} kg · {{ formule.coutParKg.toFixed(2) }} FCFA/kg · total {{ formule.coutTotal.toFixed(0) }} FCFA · {{ formule.statut }} · {{ formule.auteur }}
              </span>
            </button>
            <div class="flex flex-wrap gap-2">
              <button type="button" class="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700" (click)="exporter(formule, 'csv')">CSV</button>
              <button type="button" class="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700" (click)="exporter(formule, 'pdf')">PDF</button>
              @if (auth.hasRole('NUTRITIONNISTE', 'ADMINISTRATEUR')) {
                <button type="button" class="rounded-lg px-3 py-1.5 text-sm font-medium text-error-600 hover:bg-error-50 dark:text-error-400" (click)="supprimer(formule)">Supprimer</button>
              }
            </div>
          </div>

          @if (ouvert() === formule.id) {
            <div class="mt-4 grid grid-cols-1 gap-6 overflow-x-auto lg:grid-cols-2">
              <table class="w-full min-w-[360px]">
                <thead class="border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th class="px-4 py-2 text-start text-xs font-medium text-gray-500">Matière</th>
                    <th class="px-4 py-2 text-start text-xs font-medium text-gray-500">kg</th>
                    <th class="px-4 py-2 text-start text-xs font-medium text-gray-500">%</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                  @for (ligne of formule.lignes; track ligne.id) {
                    <tr>
                      <td class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{{ ligne.matierePremiereNom }}</td>
                      <td class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{{ ligne.quantiteKg.toFixed(2) }}</td>
                      <td class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{{ ligne.pourcentage.toFixed(2) }}</td>
                    </tr>
                  }
                </tbody>
              </table>
              <table class="w-full min-w-[420px]">
                <thead class="border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th class="px-4 py-2 text-start text-xs font-medium text-gray-500">Nutriment</th>
                    <th class="px-4 py-2 text-start text-xs font-medium text-gray-500">Obtenu</th>
                    <th class="px-4 py-2 text-start text-xs font-medium text-gray-500">Cible</th>
                    <th class="px-4 py-2 text-start text-xs font-medium text-gray-500">OK</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                  @for (resultat of formule.resultats; track resultat.id) {
                    <tr>
                      <td class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{{ resultat.nomNutriment }}</td>
                      <td class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{{ resultat.valeurObtenue.toFixed(2) }}</td>
                      <td class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{{ resultat.valeurCible }} - {{ resultat.valeurCibleMax }}</td>
                      <td class="px-4 py-2 text-sm">{{ resultat.conforme ? '✔' : '✘' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </section>
      } @empty {
        <p class="text-sm text-gray-500">Aucune formule enregistrée pour le moment.</p>
      }
    </div>
  `,
})
export class FormulesComponent {
  private api = inject(FormuleService);
  auth = inject(AuthService);

  formules = signal<Formule[]>([]);
  ouvert = signal<number | null>(null);
  erreur = signal('');

  constructor() { this.charger(); }

  charger() {
    this.api.findAll().subscribe({
      next: formules => this.formules.set([...formules].sort((a, b) => b.id - a.id)),
      error: error => this.erreur.set(messageErreur(error)),
    });
  }

  basculer(id: number) {
    this.ouvert.set(this.ouvert() === id ? null : id);
  }

  exporter(formule: Formule, type: 'csv' | 'pdf') {
    this.erreur.set('');
    this.api.export(formule.id, type).subscribe({
      next: blob => telecharger(blob, `formule-${formule.id}.${type}`),
      error: error => this.erreur.set(messageErreur(error, 'Export impossible.')),
    });
  }

  supprimer(formule: Formule) {
    if (!confirm(`Supprimer la formule n°${formule.id} ?`)) return;
    this.erreur.set('');
    this.api.delete(formule.id).subscribe({
      next: () => this.charger(),
      error: error => this.erreur.set(messageErreur(error)),
    });
  }
}
