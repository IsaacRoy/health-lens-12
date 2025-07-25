import React, { useState } from 'react';
import { CameraCapture } from '@/components/camera/CameraCapture';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, FileText, AlertCircle, CheckCircle, Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
interface HealthReportAnalysis {
  reportType: string;
  testDate?: string;
  summary: string;
  keyFindings: Array<{
    parameter: string;
    value: string;
    normalRange?: string;
    status: 'normal' | 'abnormal' | 'borderline';
    significance: string;
  }>;
  trends: {
    improving: string[];
    worsening: string[];
    stable: string[];
  };
  recommendations: string[];
  riskFactors: string[];
  followUpNeeded: boolean;
  followUpReason?: string;
  confidence: 'high' | 'medium' | 'low';
}
export const HealthReportAnalyzer: React.FC = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<HealthReportAnalysis | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const {
    user
  } = useAuth();
  const analyzeHealthReport = async (imageBase64: string) => {
    if (!user?.id) {
      toast.error('Please log in to analyze health reports');
      return;
    }
    console.log('Starting health report analysis...');
    setIsAnalyzing(true);
    setShowCamera(false);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('analyze-health-report', {
        body: {
          imageBase64: imageBase64,
          userId: user.id
        }
      });
      if (error) throw error;
      if (data.analysis) {
        setAnalysis(data.analysis);
        setReportId(data.reportId);
        toast.success('Health report analyzed successfully!');
      } else {
        throw new Error('No analysis returned');
      }
    } catch (error) {
      console.error('Error analyzing health report:', error);
      toast.error('Failed to analyze health report. Please try again.');
      setAnalysis({
        reportType: 'Unknown',
        summary: 'Unable to analyze health report. Please try again later.',
        keyFindings: [],
        trends: {
          improving: [],
          worsening: [],
          stable: []
        },
        recommendations: [],
        riskFactors: [],
        followUpNeeded: false,
        confidence: 'low'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'abnormal':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'borderline':
        return <Minus className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'abnormal':
        return 'bg-red-100 text-red-800';
      case 'borderline':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getTrendIcon = (type: 'improving' | 'worsening' | 'stable') => {
    switch (type) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'worsening':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-blue-600" />;
    }
  };
  return <div className="space-y-4">
      {!analysis && !isAnalyzing && <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-2xl">🔬</span>
              <span>Health Report Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Upload your lab results, blood tests, X-rays, or other medical reports to get AI-powered insights and track your health trends over time.
            </p>
            <Button onClick={() => setShowCamera(true)} className="w-full">
              <Camera className="w-4 h-4 mr-2" />
              Analyze Health Report
            </Button>
          </CardContent>
        </Card>}

      {isAnalyzing && <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <div className="text-center">
                <p className="font-medium">Analyzing your health report...</p>
                <p className="text-sm text-gray-500">This may take a few moments</p>
              </div>
            </div>
          </CardContent>
        </Card>}

      {analysis && <div className="space-y-4">
          {/* Report Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>{analysis.reportType}</span>
                </CardTitle>
                <Badge variant={analysis.confidence === 'high' ? 'default' : 'secondary'}>
                  {analysis.confidence === 'high' ? <><CheckCircle className="w-3 h-3 mr-1" /> High Confidence</> : analysis.confidence === 'medium' ? <><Minus className="w-3 h-3 mr-1" /> Medium Confidence</> : <><AlertCircle className="w-3 h-3 mr-1" /> Review Needed</>}
                </Badge>
              </div>
              {analysis.testDate && <p className="text-sm text-gray-600">Test Date: {analysis.testDate}</p>}
            </CardHeader>
            <CardContent>
              <div className="bg-muted/20 rounded-lg p-4">
                <h4 className="font-medium mb-2">Summary:</h4>
                <p className="text-sm">{analysis.summary}</p>
              </div>
            </CardContent>
          </Card>

          {/* Key Findings */}
          {analysis.keyFindings && analysis.keyFindings.length > 0 && <Card>
              <CardHeader>
                <CardTitle>Key Findings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.keyFindings.map((finding, index) => <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(finding.status)}
                          <span className="font-medium">{finding.parameter}</span>
                        </div>
                        <Badge className={getStatusColor(finding.status)}>
                          {finding.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                        <div>
                          <span className="text-gray-600">Value: </span>
                          <span className="font-medium">{finding.value}</span>
                        </div>
                        {finding.normalRange && <div>
                            <span className="text-gray-600">Normal: </span>
                            <span>{finding.normalRange}</span>
                          </div>}
                      </div>
                      <p className="text-sm text-gray-700">{finding.significance}</p>
                    </div>)}
                </div>
              </CardContent>
            </Card>}

          {/* Trends */}
          {analysis.trends && <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Health Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.trends.improving.length > 0 && <div>
                      <div className="flex items-center space-x-2 mb-2">
                        {getTrendIcon('improving')}
                        <span className="font-medium text-green-700">Improving</span>
                      </div>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {analysis.trends.improving.map((item, index) => <li key={index} className="text-green-600">• {item}</li>)}
                      </ul>
                    </div>}
                  
                  {analysis.trends.worsening.length > 0 && <div>
                      <div className="flex items-center space-x-2 mb-2">
                        {getTrendIcon('worsening')}
                        <span className="font-medium text-red-700">Needs Attention</span>
                      </div>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {analysis.trends.worsening.map((item, index) => <li key={index} className="text-red-600">• {item}</li>)}
                      </ul>
                    </div>}
                  
                  {analysis.trends.stable.length > 0 && <div>
                      <div className="flex items-center space-x-2 mb-2">
                        {getTrendIcon('stable')}
                        <span className="font-medium text-blue-700">Stable</span>
                      </div>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {analysis.trends.stable.map((item, index) => <li key={index} className="text-blue-600">• {item}</li>)}
                      </ul>
                    </div>}
                </div>
              </CardContent>
            </Card>}

          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.recommendations.map((recommendation, index) => <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{recommendation}</span>
                    </li>)}
                </ul>
              </CardContent>
            </Card>}

          {/* Risk Factors */}
          {analysis.riskFactors && analysis.riskFactors.length > 0 && <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span>Risk Factors</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.riskFactors.map((risk, index) => <li key={index} className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{risk}</span>
                    </li>)}
                </ul>
              </CardContent>
            </Card>}

          {/* Follow-up */}
          {analysis.followUpNeeded && <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Follow-up Recommended</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      {analysis.followUpReason || 'Please consult with your healthcare provider about these results.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>}

          {/* Actions */}
          <div className="flex space-x-2">
            <Button onClick={() => {
          setAnalysis(null);
          setReportId(null);
        }} variant="outline" className="flex-1">
              Analyze Another Report
            </Button>
            {analysis.confidence === 'low'}
          </div>
        </div>}

      {showCamera && <CameraCapture onImageCapture={analyzeHealthReport} onClose={() => setShowCamera(false)} />}
    </div>;
};