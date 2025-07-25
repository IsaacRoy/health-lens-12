
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, prompt } = await req.json();
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: prompt || "Analyze this prescription image and provide a detailed breakdown of all medications. For each medication, provide:\n\n• Medication Name: [Name]\n• Dosage: [Amount and strength]\n• Frequency: [How often to take]\n• Instructions: [Special instructions like 'with food', 'before bedtime', etc.]\n• Duration: [How long to take if specified]\n• Warnings: [Any warnings or side effects mentioned]\n\nFormat each medication as a separate bullet point with clear headings. Include any general notes or warnings at the end."
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

    return new Response(JSON.stringify({ 
      analysis: analysisText,
      confidence: analysisText.length > 50 ? 'high' : 'low'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-prescription function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      analysis: 'Sorry, we could not analyze this prescription. Please try again or consult with a healthcare professional.',
      confidence: 'low'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
