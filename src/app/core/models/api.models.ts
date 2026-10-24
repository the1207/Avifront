export const API_URL = 'http://localhost:8080/api';

export type Role = 'NUTRITIONNISTE' | 'GESTIONNAIRE_ACHATS' | 'OPERATEUR_ATELIER' | 'ADMINISTRATEUR';
export const ROLES: Role[] = ['NUTRITIONNISTE', 'GESTIONNAIRE_ACHATS', 'OPERATEUR_ATELIER', 'ADMINISTRATEUR'];

/** Doit correspondre exactement a l'enum NutrientType du backend. */
export const NUTRIMENTS = [
  'PROTEINES_BRUTES', 'LYSINE', 'METHIONINE', 'CALCIUM', 'PHOSPHORE',
  'SODIUM', 'MATIERES_GRASSES', 'CELLULOSE_BRUTE', 'ENERGIE_METABOLISABLE',
] as const;

export interface MatierePremiere {
  id: number; nom: string;
  matiereSeche: number | null; celluloseBrute: number | null; matieresGrasses: number | null;
  energieMetabolisable: number | null; proteinesBrutes: number | null; lysine: number | null;
  methionine: number | null; aas: number | null; calcium: number | null;
  phosphore: number | null; sodium: number | null;
  prixUnitaire: number; tauxIncorporationMin: number; tauxIncorporationMax: number;
  disponible: boolean;
}
export type MatierePremiereRequest = Omit<MatierePremiere, 'id'>;

export interface Besoin { id: number; nomNutriment: string; valeurMin: number; valeurMax: number; }
export interface Profil { id: number; nomCategorie: string; stade: string; estPersonnalise: boolean; besoins: Besoin[]; }
export interface ProfilRequest { nomCategorie: string; stade: string; estPersonnalise: boolean; }
export interface BesoinRequest { nomNutriment: string; valeurMin: number; valeurMax: number; profilNutritionnelId: number; }

export interface LigneFormule { id: number; quantiteKg: number; pourcentage: number; matierePremiereId: number; matierePremiereNom: string; }
export interface ResultatAnalyse { id: number; nomNutriment: string; valeurObtenue: number; valeurCible: number; valeurCibleMax: number; conforme: boolean; }
export interface Formule {
  id: number; dateCreation: string; auteur: string; quantiteTotale: number;
  coutTotal: number; coutParKg: number; statut: string;
  lignes: LigneFormule[]; resultats: ResultatAnalyse[];
}

export interface MoteurRequest { matieresPremieresIds: number[]; profilNutritionnelId: number; quantiteTotale: number; }
export interface MoteurResponse { formule: Formule | null; succes: boolean; erreur: string | null; }

export interface Utilisateur { id: number; email: string; role: Role; }
export interface UtilisateurRequest { email: string; motDePasse: string; role: Role; }
export interface UtilisateurUpdateRequest { email: string; role: Role; motDePasse?: string; }
