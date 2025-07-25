import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, TrendingUp, Calendar, ArrowLeft, AlertCircle, CheckCircle, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { HealthReportAnalyzer } from './HealthReportAnalyzer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface HealthReportsScreenProps {
  onBack: () => void;
}

interface HealthReport {
  id: string;
  report_type: string;
  test_date: string;
  analysis_data: any;
  confidence: string;
  created_at: string;
}

export const HealthReportsScreen: React.FC<HealthReportsScreenProps> = ({ onBack }) => {
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchReports();
    }
  }, [user?.id]);

  const fetchReports = async () => {
    try {
      // For now, use mock data until the health_reports table is created
      const mockReports: HealthReport[] = [
        {
          id: '1',
          report_type: 'Blood Test',
          test_date: '2024-01-15',
          analysis_data: {
            summary: 'Blood test results show normal glucose levels and good overall health markers.',
            keyFindings: [
              { parameter: 'Glucose', value: '95 mg/dL', normalRange: '70-100 mg/dL', status: 'normal', significance: 'Normal fasting glucose level' },
              { parameter: 'Cholesterol', value: '180 mg/dL', normalRange: '<200 mg/dL', status: 'normal', significance: 'Healthy cholesterol level' }
            ],
            followUpNeeded: false,
            recommendations: ['Maintain current diet', 'Continue regular exercise']
          },
          confidence: 'high',
          created_at: new Date().toISOString()
        }
      ];
      setReports(mockReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load health reports');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'normal':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'abnormal':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'borderline':
        return <Minus className="w-4 h-4 text-yellow-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence?.toLowerCase()) {
      case 'high':
        return <Badge className="bg-green-100 text-green-800">High Confidence</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Confidence</Badge>;
      case 'low':
        return <Badge className="bg-red-100 text-red-800">Review Needed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const calculateTrends = () => {
    const trends = {
      totalReports: reports.length,
      recentReports: reports.filter(r => {
        const reportDate = new Date(r.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return reportDate >= thirtyDaysAgo;
      }).length,
      highConfidenceReports: reports.filter(r => r.confidence === 'high').length,
      needsFollowUp: reports.filter(r => r.analysis_data?.followUpNeeded).length
    };
    return trends;
  };

  const trends = calculateTrends();

  if (showAnalyzer) {
    return (
      <div className="flex-1 bg-gray-50">
        <div className="bg-white shadow-sm">
          <div className="px-4 py-6 safe-area-top">
            <div className="flex items-center space-x-3 mb-4">
              <button 
                onClick={() => setShowAnalyzer(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Analyze Health Report</h1>
            </div>
          </div>
        </div>
        <div className="px-4 py-6 pb-24">
          <HealthReportAnalyzer />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6 safe-area-top">
          <div className="flex items-center space-x-3 mb-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Health Reports 📁</h1>
          </div>
          
          <Button onClick={() => setShowAnalyzer(true)} className="w-full">
            <Upload className="w-4 h-4 mr-2" />
            Analyze New Report
          </Button>
        </div>
      </div>

      <div className="px-4 py-6 pb-24">
        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="all">All Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-4 mt-6">
            {loading ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">Loading reports...</p>
                </CardContent>
              </Card>
            ) : reports.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No health reports yet</p>
                  <p className="text-sm text-gray-400">Upload your first report to get started</p>
                </CardContent>
              </Card>
            ) : (
              reports.slice(0, 5).map((report) => (
                <Card key={report.id} className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(report.analysis_data?.keyFindings?.[0]?.status)}
                        <div>
                          <h3 className="font-semibold">{report.report_type}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(report.test_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {getConfidenceBadge(report.confidence)}
                    </div>
                    
                    {report.analysis_data?.summary && (
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                        {report.analysis_data.summary}
                      </p>
                    )}
                    
                    {report.analysis_data?.keyFindings?.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-600">Key Findings:</p>
                        {report.analysis_data.keyFindings.slice(0, 2).map((finding: any, index: number) => (
                          <div key={index} className="flex items-center space-x-2">
                            {getStatusIcon(finding.status)}
                            <span className="text-xs text-gray-600">
                              {finding.parameter}: {finding.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {report.analysis_data?.followUpNeeded && (
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          <span className="text-xs text-yellow-800">Follow-up recommended</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="trends" className="mt-6">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Health Analytics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{trends.totalReports}</div>
                      <div className="text-sm text-blue-600">Total Reports</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{trends.recentReports}</div>
                      <div className="text-sm text-green-600">Last 30 Days</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{trends.highConfidenceReports}</div>
                      <div className="text-sm text-purple-600">High Confidence</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{trends.needsFollowUp}</div>
                      <div className="text-sm text-orange-600">Need Follow-up</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {reports.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {reports.slice(0, 3).map((report) => (
                        <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(report.analysis_data?.keyFindings?.[0]?.status)}
                            <div>
                              <p className="font-medium text-sm">{report.report_type}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(report.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {getConfidenceBadge(report.confidence)}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="all" className="space-y-4 mt-6">
            {loading ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">Loading all reports...</p>
                </CardContent>
              </Card>
            ) : reports.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No reports found</p>
                  <p className="text-sm text-gray-400">Your health report history will appear here</p>
                </CardContent>
              </Card>
            ) : (
              reports.map((report) => (
                <Card key={report.id} className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(report.analysis_data?.keyFindings?.[0]?.status)}
                        <div>
                          <h3 className="font-semibold">{report.report_type}</h3>
                          <p className="text-sm text-gray-600">
                            Test: {new Date(report.test_date).toLocaleDateString()} | 
                            Uploaded: {new Date(report.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {getConfidenceBadge(report.confidence)}
                    </div>
                    
                    {report.analysis_data?.summary && (
                      <p className="text-sm text-gray-700 mb-3">
                        {report.analysis_data.summary}
                      </p>
                    )}
                    
                    {report.analysis_data?.keyFindings?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-600">Key Findings:</p>
                        {report.analysis_data.keyFindings.map((finding: any, index: number) => (
                          <div key={index} className="flex items-start space-x-2 text-xs">
                            {getStatusIcon(finding.status)}
                            <div>
                              <span className="font-medium">{finding.parameter}:</span> {finding.value}
                              {finding.normalRange && (
                                <span className="text-gray-500"> (Normal: {finding.normalRange})</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};