
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Image, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { UniversalAnalyzer } from '@/components/analysis/UniversalAnalyzer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface HealthRecord {
  id: string;
  user_id: string;
  report_type: string;
  test_date: string;
  analysis_data: any;
  confidence: string;
  created_at: string;
}

export const RecordsScreen = () => {
  const [currentView, setCurrentView] = useState<'list' | 'analyze'>('list');
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzeType, setAnalyzeType] = useState<'prescription' | 'lab-report'>('prescription');
  const { user } = useAuth();

  // Fetch records from Supabase
  useEffect(() => {
    const fetchRecords = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Use rpc or raw query since health_reports might not be in types yet
        const { data, error } = await (supabase as any)
          .from('health_reports')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRecords((data as HealthRecord[]) || []);
      } catch (error) {
        console.error('Error fetching records:', error);
        toast.error('Failed to load records');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();

    // Set up real-time subscription
    const subscription = supabase
      .channel('health_reports_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'health_reports',
          filter: `user_id=eq.${user?.id}`
        }, 
        (payload) => {
          console.log('Real-time update:', payload);
          // Refresh records when changes occur
          fetchRecords();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  const handleAnalyze = () => {
    setCurrentView('analyze');
  };

  const handleAIReview = (recordId: string) => {
    toast.info('Processing with AI...');
  };

  if (currentView === 'analyze') {
    return (
      <div className="flex-1 bg-gray-50 p-4 pb-24">
        <div className="space-y-4">
          {/* Type Selection */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold mb-3">What would you like to analyze?</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant={analyzeType === 'prescription' ? 'default' : 'outline'}
                onClick={() => setAnalyzeType('prescription')}
                className="h-20 flex-col space-y-2"
              >
                <span className="text-2xl">💊</span>
                <span className="text-sm">Prescription</span>
              </Button>
              <Button 
                variant={analyzeType === 'lab-report' ? 'default' : 'outline'}
                onClick={() => setAnalyzeType('lab-report')}
                className="h-20 flex-col space-y-2"
              >
                <span className="text-2xl">🔬</span>
                <span className="text-sm">Lab Report</span>
              </Button>
            </div>
          </div>
          
          <UniversalAnalyzer 
            type={analyzeType}
            onBack={() => setCurrentView('list')} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6 safe-area-top">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Health Records 📂</h1>
          
          {/* Single Analyze Option */}
          <Button 
            variant="default" 
            className="w-full h-16 flex items-center justify-center space-x-3"
            onClick={handleAnalyze}
          >
            <span className="text-xl">🔍</span>
            <span>Analyze Prescription & Lab Reports</span>
          </Button>
        </div>
      </div>

      <div className="px-4 py-6 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading records...</span>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Records</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
              <TabsTrigger value="lab-reports">Lab Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              {records.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No records yet</h3>
                  <p className="text-gray-600 mb-4">Start by analyzing your first prescription or lab report</p>
                  <Button onClick={handleAnalyze}>
                    Analyze First Record
                  </Button>
                </div>
              ) : (
                records.map((record) => (
                  <Card key={record.id} className="shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">{record.report_type}</h3>
                            <Badge variant={record.confidence === 'high' ? 'default' : 'secondary'}>
                              {record.confidence === 'high' ? (
                                <><CheckCircle className="w-3 h-3 mr-1" /> High Confidence</>
                              ) : (
                                <><AlertCircle className="w-3 h-3 mr-1" /> Review Needed</>
                              )}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            {new Date(record.test_date).toLocaleDateString()}
                          </p>
                          
                          {record.analysis_data?.summary && (
                            <div className="bg-blue-50 rounded-lg p-3 mb-3">
                              <h4 className="font-medium text-blue-900 mb-1">AI Summary:</h4>
                              <p className="text-sm text-blue-800">
                                {record.analysis_data.summary}
                              </p>
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
                ))
              )}
            </TabsContent>

            <TabsContent value="prescriptions" className="mt-6">
              <div className="space-y-4">
                {records.filter(r => r.report_type.toLowerCase().includes('prescription')).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No prescription records found</p>
                  </div>
                ) : (
                  records.filter(r => r.report_type.toLowerCase().includes('prescription')).map((record) => (
                    <Card key={record.id} className="shadow-sm">
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{record.report_type}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(record.test_date).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="lab-reports" className="mt-6">
              <div className="space-y-4">
                {records.filter(r => !r.report_type.toLowerCase().includes('prescription')).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No lab report records found</p>
                  </div>
                ) : (
                  records.filter(r => !r.report_type.toLowerCase().includes('prescription')).map((record) => (
                    <Card key={record.id} className="shadow-sm">
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{record.report_type}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(record.test_date).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};
