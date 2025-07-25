import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Pill, ArrowRight } from 'lucide-react';
import { useMedications } from '@/contexts/MedicationContext';

interface TodaysMedicationsCardProps {
  onViewAll?: () => void;
}

export const TodaysMedicationsCard: React.FC<TodaysMedicationsCardProps> = ({ onViewAll }) => {
  const { medications, markMedicationTaken, getTodaysProgress } = useMedications();
  const { takenDoses, totalDoses, progressPercentage } = getTodaysProgress();

  // Get next 3 upcoming medications
  const upcomingMeds = medications
    .flatMap(med => 
      med.times.map((time, index) => ({
        ...med,
        timeIndex: index,
        time,
        taken: med.taken[index]
      }))
    )
    .filter(med => !med.taken)
    .slice(0, 3);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Pill className="w-5 h-5 text-primary" />
            <span>Today's Medications</span>
          </CardTitle>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{takenDoses} of {totalDoses} doses taken</span>
            <span className="font-semibold text-primary">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {upcomingMeds.length === 0 ? (
          <div className="text-center py-4">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">All medications taken for today! 🎉</p>
          </div>
        ) : (
          <>
            {upcomingMeds.map((med) => (
              <div key={`${med.id}-${med.timeIndex}`} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 bg-${med.color}-100 rounded-lg`}>
                    <Pill className={`w-4 h-4 text-${med.color}-600`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{med.name}</p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{med.time}</span>
                      <span>•</span>
                      <span>{med.dosage}</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  size="sm" 
                  onClick={() => markMedicationTaken(med.id, med.timeIndex)}
                  variant={new Date().getHours() >= parseInt(med.time.split(':')[0]) ? 'default' : 'outline'}
                >
                  Mark Taken
                </Button>
              </div>
            ))}
            
            {medications.length > 3 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" onClick={onViewAll} className="text-primary">
                  View all medications
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};