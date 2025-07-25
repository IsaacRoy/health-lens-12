
export interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
  chronicConditions?: string[];
  profileImage?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  age: number;
  relationship: string;
  chronicConditions?: string[];
  profileImage?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string[];
  taken: boolean;
  missed: boolean;
  color: string;
}

export interface HealthRecord {
  id: string;
  type: 'prescription' | 'lab-report' | 'doctor-note';
  title: string;
  date: string;
  aiSummary?: string;
  confidence?: 'high' | 'low';
  flagged?: boolean;
  imageUrl?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  distance: string;
  available: boolean;
  image: string;
}

export interface Hospital {
  id: string;
  name: string;
  distance: string;
  emergency: boolean;
  phone: string;
}
