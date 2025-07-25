
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Plus, CheckCircle, Pill } from 'lucide-react';
import { useMedications } from '@/contexts/MedicationContext';
import { AddMedicationDialog } from './AddMedicationDialog';

export const MedicationsScreen = () => {
  const { medications, markMedicationTaken, getTodaysProgress } = useMedications();
  const { takenDoses, totalDoses, progressPercentage } = getTodaysProgress();

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6 safe-area-top">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Medications 💊</h1>
            <AddMedicationDialog
              trigger={
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Med
                </Button>
              }
            />
          </div>
          
          {/* Today's Progress */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">Today's Progress</h3>
                <p className="text-blue-700">{takenDoses} of {totalDoses} doses taken</p>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">{progressPercentage}%</span>
              </div>
            </div>
            <div className="mt-3 bg-blue-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 pb-24">
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4 mt-6">
            {medications.map((med) => (
              <Card key={med.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 bg-${med.color}-100 rounded-lg`}>
                      <Pill className={`w-5 h-5 text-${med.color}-600`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{med.name}</h3>
                          <p className="text-sm text-gray-600">{med.dosage} • {med.frequency}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {med.times.map((time, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">{time}</span>
                            </div>
                            
                            {med.taken[index] ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Taken
                              </Badge>
                            ) : (
                              <Button 
                                size="sm" 
                                onClick={() => markMedicationTaken(med.id, index)}
                                variant={new Date().getHours() >= parseInt(time.split(':')[0]) ? 'default' : 'outline'}
                              >
                                Mark Taken
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="schedule" className="mt-6">
            <div className="space-y-4">
              {medications.map((med) => (
                <Card key={med.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Pill className={`w-5 h-5 text-${med.color}-600`} />
                      <span>{med.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-2">{med.dosage} - {med.frequency}</p>
                    <div className="flex flex-wrap gap-2">
                      {med.times.map((time, index) => (
                        <Badge key={index} variant="outline">
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Medication History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Today's Adherence</span>
                    <span className="font-semibold">{progressPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>This Week's Average</span>
                    <span className="font-semibold">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>This Month's Average</span>
                    <span className="font-semibold">92%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
