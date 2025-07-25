
import React, { useState } from 'react';
import { CameraCapture } from '@/components/camera/CameraCapture';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Parse and format markdown-like text to JSX
const formatMarkdownToJSX = (text: string) => {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let currentIndex = 0;

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

export const PrescriptionAnalyzer: React.FC = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    text: string;
    confidence: 'high' | 'low';
  } | null>(null);

  const GEMINI_API_KEY = 'AIzaSyAjyyUq0pCHtgepXMAAC-6EWNKi2F31D4k';

  const analyzeImage = async (imageBase64: string) => {
    console.log('Starting image analysis...');
    setIsAnalyzing(true);
    setShowCamera(false);
    try {
      console.log('Calling Gemini API directly...');
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: "Analyze this prescription image and provide a comprehensive medical analysis. Structure your response with proper markdown formatting:\n\n## Medical Condition/Disease\nExplain what condition or disease this prescription is treating, including symptoms and causes.\n\n## Prescribed Medications\nFor each medication, provide:\n\n**Medication Name:** [Name]\n**Dosage:** [Amount and strength]\n**Frequency:** [How often to take]\n**Instructions:** [Special instructions like 'with food', 'before bedtime', etc.]\n**Duration:** [How long to take if specified]\n**Purpose:** [What this medication treats]\n**Common Side Effects:** [Any warnings or side effects]\n\n## Treatment Plan\nExplain the overall treatment approach and expected outcomes.\n\n## Important Notes\nInclude any additional warnings, precautions, or follow-up instructions.\n\nUse proper markdown formatting with headers (##), bold text (**text**), and bullet points where appropriate."
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: imageBase64
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 4096,
          }
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to analyze image');
      }

      const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to analyze the prescription image.';

      setAnalysis({
        text: analysisText,
        confidence: analysisText.length > 50 ? 'high' : 'low'
      });
      toast.success('Prescription analyzed successfully!');
    } catch (error) {
      console.error('Error analyzing prescription:', error);
      toast.error('Failed to analyze prescription. Please try again.');
      setAnalysis({
        text: 'Unable to analyze prescription. Please try again later.',
        confidence: 'low'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      {!analysis && !isAnalyzing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-2xl">📷</span>
              <span>Prescription Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Take a photo or upload an image of your prescription to get an AI-powered explanation of your medications.
            </p>
            <Button onClick={() => setShowCamera(true)} className="w-full">
              <Camera className="w-4 h-4 mr-2" />
              Analyze Prescription
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
                <p className="font-medium">Analyzing your prescription...</p>
                <p className="text-sm text-gray-500">This may take a few moments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Analysis Results</h3>
              <Badge variant={analysis.confidence === 'high' ? 'default' : 'secondary'}>
                {analysis.confidence === 'high' ? (
                  <><CheckCircle className="w-3 h-3 mr-1" /> High Confidence</>
                ) : (
                  <><AlertCircle className="w-3 h-3 mr-1" /> Review Needed</>
                )}
              </Badge>
            </div>
            
            <div className="bg-muted/20 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-foreground mb-3">Medical Analysis:</h4>
              <div className="text-foreground">
                {formatMarkdownToJSX(analysis.text)}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={() => setAnalysis(null)} 
                variant="outline"
                className="flex-1"
              >
                Analyze Another
              </Button>
              {analysis.confidence === 'low' && (
                <Button variant="default">
                  <FileText className="w-4 h-4 mr-2" />
                  Ask Doctor
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {showCamera && (
        <CameraCapture
          onImageCapture={analyzeImage}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};
