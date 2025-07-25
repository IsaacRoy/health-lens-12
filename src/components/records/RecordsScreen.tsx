
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Image, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { UniversalAnalyzer } from '@/components/analysis/UniversalAnalyzer';

export const RecordsScreen = () => {
  const [currentView, setCurrentView] = useState<'list' | 'analyze-prescription' | 'analyze-lab-report'>('list');
  const [records] = useState([
    {
      id: '1',
      type: 'prescription' as const,
      title: 'Diabetes Prescription - Dr. Smith',
      date: '2024-01-15',
      aiSummary: 'Metformin 500mg prescribed for Type 2 diabetes management. Take twice daily with meals.',
      confidence: 'high' as const,
      flagged: false
    },
    {
      id: '2',
      type: 'lab-report' as const,
      title: 'Blood Test Results',
      date: '2024-01-10',
      aiSummary: 'HbA1c levels slightly elevated at 7.2%. Blood glucose within normal range.',
      confidence: 'high' as const,
      flagged: true
    },
    {
      id: '3',
      type: 'doctor-note' as const,
      title: 'Cardiology Consultation',
      date: '2024-01-05',
      aiSummary: 'Blood pressure monitoring recommended. Continue current medication regimen.',
      confidence: 'low' as const,
      flagged: false
    }
  ]);

  const handleUpload = (type: 'prescription' | 'lab-report') => {
    if (type === 'prescription') {
      setCurrentView('analyze-prescription');
    } else {
      setCurrentView('analyze-lab-report');
    }
  };

  const handleAIReview = (recordId: string) => {
    toast.info('Processing with AI...');
  };

  if (currentView === 'analyze-prescription') {
    return (
      <div className="flex-1 bg-gray-50 p-4 pb-24">
        <UniversalAnalyzer 
          type="prescription" 
          onBack={() => setCurrentView('list')} 
        />
      </div>
    );
  }

  if (currentView === 'analyze-lab-report') {
    return (
      <div className="flex-1 bg-gray-50 p-4 pb-24">
        <UniversalAnalyzer 
          type="lab-report" 
          onBack={() => setCurrentView('list')} 
        />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6 safe-area-top">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Health Records 📂</h1>
          
          {/* Upload Options */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="h-16 flex-col space-y-1"
              onClick={() => handleUpload('prescription')}
            >
              <span className="text-xl">📷</span>
              <span className="text-sm">Analyze Prescription</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 flex-col space-y-1"
              onClick={() => handleUpload('lab-report')}
            >
              <span className="text-xl">📊</span>
              <span className="text-sm">Analyze Lab Report</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 pb-24">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="prescriptions">Scripts</TabsTrigger>
            <TabsTrigger value="lab-reports">Labs</TabsTrigger>
            <TabsTrigger value="flagged">Flagged</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {records.map((record) => (
              <Card key={record.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {record.type === 'prescription' && <FileText className="w-5 h-5 text-blue-600" />}
                      {record.type === 'lab-report' && <Image className="w-5 h-5 text-green-600" />}
                      {record.type === 'doctor-note' && <FileText className="w-5 h-5 text-purple-600" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{record.title}</h3>
                        <div className="flex space-x-1">
                          {record.confidence === 'high' ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              High Confidence
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-orange-200 text-orange-800">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Review Needed
                            </Badge>
                          )}
                          {record.flagged && (
                            <Badge variant="destructive">Flagged</Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{record.date}</p>
                      
                      {record.aiSummary && (
                        <div className="bg-blue-50 rounded-lg p-3 mb-3">
                          <h4 className="font-medium text-blue-900 mb-1">AI Summary:</h4>
                          <p className="text-sm text-blue-800">{record.aiSummary}</p>
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        {record.confidence === 'low' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleAIReview(record.id)}
                          >
                            Ask Doctor
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="prescriptions" className="mt-6">
            <div className="space-y-4">
              {records.filter(r => r.type === 'prescription').map((record) => (
                <Card key={record.id} className="shadow-sm">
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{record.title}</h3>
                    <p className="text-sm text-gray-600">{record.date}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="lab-reports" className="mt-6">
            <div className="space-y-4">
              {records.filter(r => r.type === 'lab-report').map((record) => (
                <Card key={record.id} className="shadow-sm">
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{record.title}</h3>
                    <p className="text-sm text-gray-600">{record.date}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="flagged" className="mt-6">
            <div className="space-y-4">
              {records.filter(r => r.flagged).map((record) => (
                <Card key={record.id} className="shadow-sm border-red-200">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-red-900">{record.title}</h3>
                    <p className="text-sm text-gray-600">{record.date}</p>
                    <Badge variant="destructive" className="mt-2">Needs Attention</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
