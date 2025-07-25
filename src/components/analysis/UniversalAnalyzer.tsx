import React, { useState } from 'react';
import { CameraCapture } from '@/components/camera/CameraCapture';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, FileText, AlertCircle, CheckCircle, Loader2, TrendingUp, TrendingDown, Minus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UniversalAnalyzerProps {
  type: 'prescription' | 'lab-report';
  onBack?: () => void;
}

interface PrescriptionAnalysis {
  text: string;
  confidence: 'high' | 'low';
}

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

// Parse and format markdown-like text to JSX
const formatMarkdownToJSX = (text: string) => {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];

  const processLine = (line: string, index: number): JSX.Element | null => {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) {
      return <div key={index} className="h-2" />;
    }

    // Headers
    if (trimmedLine.startsWith('###')) {
      return (
        <h3 key={index} className="text-lg font-semibold text-primary mb-2 mt-4">
          {trimmedLine.replace(/^###\s*/, '')}
        </h3>
      );
    }
    if (trimmedLine.startsWith('##')) {
      return (
        <h2 key={index} className="text-xl font-bold text-primary mb-3 mt-6">
          {trimmedLine.replace(/^##\s*/, '')}
        </h2>
      );
    }
    if (trimmedLine.startsWith('#')) {
      return (
        <h1 key={index} className="text-2xl font-bold text-primary mb-4 mt-6">
          {trimmedLine.replace(/^#\s*/, '')}
        </h1>
      );
    }

    // Bullet points
    if (trimmedLine.startsWith('*   ') || trimmedLine.startsWith('- ')) {
      const content = trimmedLine.replace(/^[\*\-]\s*/, '');
      return (
        <div key={index} className="flex items-start mb-2">
          <span className="text-primary mr-2 mt-1">•</span>
          <span className="text-sm">{processInlineFormatting(content)}</span>
        </div>
      );
    }

    // Bold text detection and medication entries
    if (trimmedLine.includes('**') || trimmedLine.includes('*')) {
      return (
        <div key={index} className="mb-2">
          {processInlineFormatting(trimmedLine)}
        </div>
      );
    }

    // Regular paragraphs
    return (
      <p key={index} className="mb-2 text-sm leading-relaxed">
        {processInlineFormatting(trimmedLine)}
      </p>
    );
  };

  const processInlineFormatting = (text: string): JSX.Element => {
    const parts = [];
    let currentText = text;
    let keyIndex = 0;

    // Process bold text (**text** or __text__)
    const boldRegex = /\*\*(.*?)\*\*|__(.*?)__/g;
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(currentText)) !== null) {
      // Add text before the bold
      if (match.index > lastIndex) {
        parts.push(
          <span key={keyIndex++}>
            {currentText.substring(lastIndex, match.index)}
          </span>
        );
      }
      
      // Add bold text
      parts.push(
        <strong key={keyIndex++} className="font-semibold text-foreground">
          {match[1] || match[2]}
        </strong>
      );
      
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < currentText.length) {
      parts.push(
        <span key={keyIndex++}>
          {currentText.substring(lastIndex)}
        </span>
      );
    }

    return <>{parts}</>;
  };

  lines.forEach((line, index) => {
    const element = processLine(line, index);
    if (element) {
      elements.push(element);
    }
  });

  return <div className="space-y-1">{elements}</div>;
};

export const UniversalAnalyzer: React.FC<UniversalAnalyzerProps> = ({ type, onBack }) => {
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prescriptionAnalysis, setPrescriptionAnalysis] = useState<PrescriptionAnalysis | null>(null);
  const [healthReportAnalysis, setHealthReportAnalysis] = useState<HealthReportAnalysis | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const { user } = useAuth();

  const analyzePrescription = async (imageBase64: string) => {
    if (!user?.id) {
      toast.error('Please log in to analyze prescriptions');
      return;
    }

    console.log('Starting prescription analysis...');
    setIsAnalyzing(true);
    setShowCamera(false);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-prescription', {
        body: {
          imageBase64: imageBase64,
          prompt: "Analyze this prescription image and provide a comprehensive medical analysis. Structure your response with proper markdown formatting:\n\n## Medical Condition/Disease\nExplain what condition or disease this prescription is treating, including symptoms and causes.\n\n## Prescribed Medications\nFor each medication, provide:\n\n**Medication Name:** [Name]\n**Dosage:** [Amount and strength]\n**Frequency:** [How often to take]\n**Instructions:** [Special instructions like 'with food', 'before bedtime', etc.]\n**Duration:** [How long to take if specified]\n**Purpose:** [What this medication treats]\n**Common Side Effects:** [Any warnings or side effects]\n\n## Treatment Plan\nExplain the overall treatment approach and expected outcomes.\n\n## Important Notes\nInclude any additional warnings, precautions, or follow-up instructions.\n\nUse proper markdown formatting with headers (##), bold text (**text**), and bullet points where appropriate."
        }
      });

      if (error) throw error;

      setPrescriptionAnalysis({
        text: data.analysis,
        confidence: data.confidence
      });

      // Analysis is automatically stored by the edge function
      setReportId('prescription-' + Date.now());
      toast.success('Prescription analyzed successfully!');
    } catch (error) {
      console.error('Error analyzing prescription:', error);
      toast.error('Failed to analyze prescription. Please try again.');
      setPrescriptionAnalysis({
        text: 'Unable to analyze prescription. Please try again later.',
        confidence: 'low'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeHealthReport = async (imageBase64: string) => {
    if (!user?.id) {
      toast.error('Please log in to analyze health reports');
      return;
    }

    console.log('Starting health report analysis...');
    setIsAnalyzing(true);
    setShowCamera(false);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-health-report', {
        body: {
          imageBase64: imageBase64,
          userId: user.id
        }
      });

      if (error) throw error;

      if (data.analysis) {
        setHealthReportAnalysis(data.analysis);
        setReportId(data.reportId);
        toast.success('Health report analyzed successfully!');
      } else {
        throw new Error('No analysis returned');
      }
    } catch (error) {
      console.error('Error analyzing health report:', error);
      toast.error('Failed to analyze health report. Please try again.');
      setHealthReportAnalysis({
        reportType: 'Unknown',
        summary: 'Unable to analyze health report. Please try again later.',
        keyFindings: [],
        trends: { improving: [], worsening: [], stable: [] },
        recommendations: [],
        riskFactors: [],
        followUpNeeded: false,
        confidence: 'low'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageCapture = (imageBase64: string) => {
    if (type === 'prescription') {
      analyzePrescription(imageBase64);
    } else {
      analyzeHealthReport(imageBase64);
    }
  };

  const resetAnalysis = () => {
    setPrescriptionAnalysis(null);
    setHealthReportAnalysis(null);
    setReportId(null);
  };

  const getIcon = () => {
    return type === 'prescription' ? '📷' : '🔬';
  };

  const getTitle = () => {
    return type === 'prescription' ? 'Prescription Analysis' : 'Health Report Analysis';
  };

  const getDescription = () => {
    return type === 'prescription' 
      ? 'Take a photo or upload an image of your prescription to get an AI-powered explanation of your medications.'
      : 'Upload your lab results, blood tests, X-rays, or other medical reports to get AI-powered insights and track your health trends over time.';
  };

  const renderPrescriptionAnalysis = () => {
    if (!prescriptionAnalysis) return null;

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Analysis Results</h3>
            <Badge variant={prescriptionAnalysis.confidence === 'high' ? 'default' : 'secondary'}>
              {prescriptionAnalysis.confidence === 'high' ? (
                <><CheckCircle className="w-3 h-3 mr-1" /> High Confidence</>
              ) : (
                <><AlertCircle className="w-3 h-3 mr-1" /> Review Needed</>
              )}
            </Badge>
          </div>
          
          <div className="bg-muted/20 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-foreground mb-3">Medical Analysis:</h4>
            <div className="text-foreground">
              {formatMarkdownToJSX(prescriptionAnalysis.text)}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={resetAnalysis} variant="outline" className="flex-1">
              Analyze Another
            </Button>
            {prescriptionAnalysis.confidence === 'low' && (
              <Button variant="default">
                <FileText className="w-4 h-4 mr-2" />
                Ask Doctor
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderHealthReportAnalysis = () => {
    if (!healthReportAnalysis) return null;

    return (
      <div className="space-y-4">
        {/* Report Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>{healthReportAnalysis.reportType}</span>
              </CardTitle>
              <Badge variant={healthReportAnalysis.confidence === 'high' ? 'default' : 'secondary'}>
                {healthReportAnalysis.confidence === 'high' ? (
                  <><CheckCircle className="w-3 h-3 mr-1" /> High Confidence</>
                ) : healthReportAnalysis.confidence === 'medium' ? (
                  <><Minus className="w-3 h-3 mr-1" /> Medium Confidence</>
                ) : (
                  <><AlertCircle className="w-3 h-3 mr-1" /> Review Needed</>
                )}
              </Badge>
            </div>
            {healthReportAnalysis.testDate && (
              <p className="text-sm text-gray-600">Test Date: {healthReportAnalysis.testDate}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="bg-muted/20 rounded-lg p-4">
              <h4 className="font-medium mb-2">Summary:</h4>
              <p className="text-sm">{healthReportAnalysis.summary}</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button onClick={resetAnalysis} variant="outline" className="flex-1">
            Analyze Another Report
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with back button */}
      {onBack && (
        <div className="flex items-center space-x-2 mb-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h2 className="text-xl font-semibold">{getTitle()}</h2>
        </div>
      )}

      {!prescriptionAnalysis && !healthReportAnalysis && !isAnalyzing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-2xl">{getIcon()}</span>
              <span>{getTitle()}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{getDescription()}</p>
            <Button onClick={() => setShowCamera(true)} className="w-full">
              <Camera className="w-4 h-4 mr-2" />
              {type === 'prescription' ? 'Analyze Prescription' : 'Analyze Health Report'}
            </Button>
          </CardContent>
        </Card>
      )}

      {isAnalyzing && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <div className="text-center">
                <p className="font-medium">
                  Analyzing your {type === 'prescription' ? 'prescription' : 'health report'}...
                </p>
                <p className="text-sm text-gray-500">This may take a few moments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {type === 'prescription' && renderPrescriptionAnalysis()}
      {type === 'lab-report' && renderHealthReportAnalysis()}

      {showCamera && (
        <CameraCapture
          onImageCapture={handleImageCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};