import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Bell } from 'lucide-react';
import { AddMedicationDialog } from '@/components/medications/AddMedicationDialog';
import { Badge } from '@/components/ui/badge';
import { useMedications } from '@/contexts/MedicationContext';
export const TopNavigation: React.FC = () => {
  const {
    getTodaysProgress
  } = useMedications();
  const {
    takenDoses,
    totalDoses
  } = getTodaysProgress();
  const hasUnfinishedMeds = takenDoses < totalDoses;
  return <div className="bg-white shadow-sm border-b border-border">
      <div className="px-4 py-3 safe-area-top">
        
      </div>
    </div>;
};