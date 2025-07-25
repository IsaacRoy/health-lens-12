import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, userId } = await req.json();
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Analyze the health report with Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: `Analyze this health report/lab result image and provide a comprehensive medical analysis. Structure your response as JSON with the following format:

{
  "reportType": "Type of test/report (e.g., Blood Test, X-Ray, etc.)",
  "testDate": "Date of the test if visible",
  "summary": "Brief summary of overall health status",
  "keyFindings": [
    {
      "parameter": "Test parameter name",
      "value": "Measured value",
      "normalRange": "Normal range if available",
      "status": "normal/abnormal/borderline",
      "significance": "Clinical significance explanation"
    }
  ],
  "trends": {
    "improving": ["Parameters that show improvement"],
    "worsening": ["Parameters that show decline"],
    "stable": ["Parameters that are stable"]
  },
  "recommendations": [
    "List of recommendations based on the results"
  ],
  "riskFactors": [
    "Identified risk factors or concerns"
  ],
  "followUpNeeded": true/false,
  "followUpReason": "Reason for follow-up if needed",
  "confidence": "high/medium/low"
}

Provide accurate medical information and be thorough in your analysis.`
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
          temperature: 0.3,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
        }
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to analyze health report');
    }

    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    // Parse the JSON response
    let analysisData;
    try {
      // Clean up the response to extract JSON
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : analysisText;
      analysisData = JSON.parse(jsonString);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      analysisData = {
        reportType: "Health Report",
        summary: analysisText,
        confidence: "low"
      };
    }

    // Store the analysis in Supabase
    const { data: savedReport, error: saveError } = await supabase
      .from('health_reports')
      .insert({
        user_id: userId,
        report_type: analysisData.reportType || 'Unknown',
        test_date: analysisData.testDate || new Date().toISOString().split('T')[0],
        analysis_data: analysisData,
        image_data: imageBase64,
        confidence: analysisData.confidence || 'medium',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving health report:', saveError);
      // Continue even if save fails, return analysis
    }

    // Get recent trends by fetching user's previous reports
    const { data: previousReports } = await supabase
      .from('health_reports')
      .select('analysis_data, test_date')
      .eq('user_id', userId)
      .order('test_date', { ascending: false })
      .limit(5);

    return new Response(JSON.stringify({ 
      analysis: analysisData,
      reportId: savedReport?.id,
      trends: previousReports || [],
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-health-report function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      analysis: {
        summary: 'Sorry, we could not analyze this health report. Please try again or consult with a healthcare professional.',
        confidence: 'low'
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});