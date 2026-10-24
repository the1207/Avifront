export function telecharger(blob: Blob, nom: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nom;
  a.click();
  URL.revokeObjectURL(url);
}

export function messageErreur(e: any, defaut = 'Une erreur est survenue.'): string {
  const b = e?.error;
  if (b?.erreur) return b.erreur;
  if (b?.message) return b.message;
  if (b?.erreurs) return Object.values(b.erreurs).join(' ');
  if (e?.status === 0) return "Impossible de joindre le serveur (backend arrêté ?).";
  return defaut;
}
