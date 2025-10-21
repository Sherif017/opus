export interface User {
  id: string
  email: string
  entreprise_id: string
  role: 'admin' | 'manager' | 'commercial' | 'technicien'
  nom?: string
  prenom?: string
}

export interface SignupData {
  email: string
  password: string
  nomEntreprise: string
  nomArtisan: string
  prenomArtisan: string
}

export interface LoginData {
  email: string
  password: string
}