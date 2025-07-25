import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  taken: boolean[];
  color: string;
  reminderEnabled: boolean;
}

interface MedicationContextType {
  medications: Medication[];
  addMedication: (medication: Omit<Medication, 'id' | 'taken'>) => void;
  markMedicationTaken: (medId: string, timeIndex: number) => void;
  getTodaysMedications: () => Medication[];
  getTodaysProgress: () => { takenDoses: number; totalDoses: number; progressPercentage: number };
}

const MedicationContext = createContext<MedicationContextType | undefined>(undefined);

export const useMedications = () => {
  const context = useContext(MedicationContext);
  if (!context) {
    throw new Error('useMedications must be used within a MedicationProvider');
  }
  return context;
};

export const MedicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: '1',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      times: ['08:00', '20:00'],
      taken: [true, false],
      color: 'blue',
      reminderEnabled: true
    },
    {
      id: '2',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      times: ['08:00'],
      taken: [false],
      color: 'red',
      reminderEnabled: true
    },
    {
      id: '3',
      name: 'Atorvastatin',
      dosage: '20mg',
      frequency: 'Once daily',
      times: ['22:00'],
      taken: [false],
      color: 'green',
      reminderEnabled: true
    },
    {
      id: '4',
      name: 'Aspirin',
      dosage: '81mg',
      frequency: 'Once daily',
      times: ['08:00'],
      taken: [true],
      color: 'purple',
      reminderEnabled: true
    },
    {
      id: '5',
      name: 'Vitamin D',
      dosage: '1000 IU',
      frequency: 'Once daily',
      times: ['08:00'],
      taken: [true],
      color: 'yellow',
      reminderEnabled: true
    }
  ]);

  const addMedication = (newMedication: Omit<Medication, 'id' | 'taken'>) => {
    const medication: Medication = {
      ...newMedication,
      id: Math.random().toString(36).substr(2, 9),
      taken: new Array(newMedication.times.length).fill(false)
    };
    setMedications(prev => [...prev, medication]);
    toast.success('Medication added successfully!');
  };

  const markMedicationTaken = (medId: string, timeIndex: number) => {
    setMedications(prev => 
      prev.map(med => 
        med.id === medId 
          ? {
              ...med,
              taken: med.taken.map((taken, index) => 
                index === timeIndex ? true : taken
              )
            }
          : med
      )
    );
    toast.success('Medication marked as taken!');
  };

  const getTodaysMedications = () => {
    return medications;
  };

  const getTodaysProgress = () => {
    const totalDoses = medications.reduce((sum, med) => sum + med.times.length, 0);
    const takenDoses = medications.reduce((sum, med) => sum + med.taken.filter(t => t).length, 0);
    const progressPercentage = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
    
    return { takenDoses, totalDoses, progressPercentage };
  };

  return (
    <MedicationContext.Provider
      value={{
        medications,
        addMedication,
        markMedicationTaken,
        getTodaysMedications,
        getTodaysProgress
      }}
    >
      {children}
    </MedicationContext.Provider>
  );
};