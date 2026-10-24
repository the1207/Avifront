import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  API_URL, Besoin, BesoinRequest, Formule, MatierePremiere, MatierePremiereRequest,
  MoteurRequest, MoteurResponse, Profil, ProfilRequest, Utilisateur, UtilisateurRequest, UtilisateurUpdateRequest,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class MatierePremiereService {
  private http = inject(HttpClient);
  private url = `${API_URL}/matieres-premieres`;
  findAll() { return this.http.get<MatierePremiere[]>(this.url); }
  create(r: MatierePremiereRequest) { return this.http.post<MatierePremiere>(this.url, r); }
  update(id: number, r: MatierePremiereRequest) { return this.http.put<MatierePremiere>(`${this.url}/${id}`, r); }
  delete(id: number) { return this.http.delete<void>(`${this.url}/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class ProfilService {
  private http = inject(HttpClient);
  private url = `${API_URL}/profils-nutritionnels`;
  findAll() { return this.http.get<Profil[]>(this.url); }
  create(r: ProfilRequest) { return this.http.post<Profil>(this.url, r); }
  update(id: number, r: ProfilRequest) { return this.http.put<Profil>(`${this.url}/${id}`, r); }
  delete(id: number) { return this.http.delete<void>(`${this.url}/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class BesoinService {
  private http = inject(HttpClient);
  private url = `${API_URL}/besoins-nutritionnels`;
  create(r: BesoinRequest) { return this.http.post<Besoin>(this.url, r); }
  delete(id: number) { return this.http.delete<void>(`${this.url}/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class FormuleService {
  private http = inject(HttpClient);
  private url = `${API_URL}/formules`;
  findAll() { return this.http.get<Formule[]>(this.url); }
  delete(id: number) { return this.http.delete<void>(`${this.url}/${id}`); }
  export(id: number, type: 'csv' | 'pdf') {
    return this.http.get(`${this.url}/${id}/export/${type}`, { responseType: 'blob' });
  }
}

@Injectable({ providedIn: 'root' })
export class MoteurService {
  private http = inject(HttpClient);
  resoudre(r: MoteurRequest) {
    return this.http.post<MoteurResponse>(`${API_URL}/moteur-optimisation/resoudre`, r);
  }
}

@Injectable({ providedIn: 'root' })
export class UtilisateurService {
  private http = inject(HttpClient);
  private url = `${API_URL}/utilisateurs`;
  findAll() { return this.http.get<Utilisateur[]>(this.url); }
  findById(id: number) { return this.http.get<Utilisateur>(`${this.url}/${id}`); }
  create(r: UtilisateurRequest) { return this.http.post<Utilisateur>(this.url, r); }
  update(id: number, r: UtilisateurUpdateRequest) { return this.http.put<Utilisateur>(`${this.url}/${id}`, r); }
  delete(id: number) { return this.http.delete<void>(`${this.url}/${id}`); }
}
