import React from 'react';
import { FeatureCard } from './FeatureCard';
import { PrescriptionAnalyzer } from '@/components/ai/PrescriptionAnalyzer';
import { HealthReportsScreen } from '@/components/health/HealthReportsScreen';
import { HealthArticlesScreen } from '@/components/health/HealthArticlesScreen';
import { ChatbotScreen } from '@/components/ai/ChatbotScreen';
import { ProfileManagementScreen } from '@/components/profile/ProfileManagementScreen';
import { EmergencyScreen } from '@/components/emergency/EmergencyScreen';
import { TodaysMedicationsCard } from '@/components/medications/TodaysMedicationsCard';
import { AddMedicationDialog } from '@/components/medications/AddMedicationDialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import medicationsIcon from '@/assets/medications-icon.png';
import prescriptionIcon from '@/assets/prescription-pro-icon.png';
import reportsIcon from '@/assets/reports-icon.png';
import articlesIcon from '@/assets/articles-icon.png';
import chatbotIcon from '@/assets/chatbot-icon.png';
import profilesIcon from '@/assets/family-profiles-icon.png';
import emergencyIcon from '@/assets/emergency-icon.png';
interface HomeScreenProps {
  onTabChange?: (tab: string) => void;
}
export const HomeScreen: React.FC<HomeScreenProps> = ({
  onTabChange
}) => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const emergencyFeatures = [{
    id: 'emergency',
    image: emergencyIcon,
    title: 'Emergency Services',
    description: 'Find nearest doctors and hospitals quickly',
    action: () => setActiveFeature('emergency'),
    badge: 'SOS',
    gradient: 'from-red-500 to-red-700'
  }];
  const features = [{
    id: 'medications',
    image: medicationsIcon,
    title: "Manage Medications",
    description: 'View and track your daily medication schedule with reminders',
    action: () => onTabChange?.('medications')
  }, {
    id: 'prescription',
    image: prescriptionIcon,
    title: 'Explain a Prescription',
    description: 'Upload prescription images for AI-powered explanations',
    action: () => setActiveFeature('prescription')
  }, {
    id: 'reports',
    image: reportsIcon,
    title: 'Health Report Insights',
    description: 'Upload lab reports and get simplified summaries',
    action: () => setActiveFeature('reports')
  }, {
    id: 'articles',
    image: articlesIcon,
    title: 'Health Articles',
    description: 'Curated content based on your health profile',
    action: () => setActiveFeature('articles')
  }, {
    id: 'chatbot',
    image: chatbotIcon,
    title: 'AI Chatbot Assistant',
    description: 'Ask questions about medicines and health reports',
    action: () => setActiveFeature('chatbot')
  }, {
    id: 'profiles',
    image: profilesIcon,
    title: 'Manage Profiles',
    description: 'Add and manage family member health profiles',
    action: () => setActiveFeature('profiles')
  }];
  if (activeFeature === 'emergency') {
    return <EmergencyScreen onBack={() => setActiveFeature(null)} />;
  }
  if (activeFeature === 'prescription') {
    return <div className="flex-1 bg-gray-50">
        <div className="bg-white shadow-sm">
          <div className="px-4 py-6 safe-area-top">
            <div className="flex items-center space-x-3 mb-4">
              <button onClick={() => setActiveFeature(null)} className="p-2 hover:bg-gray-100 rounded-full">
                ←
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Prescription Analysis</h1>
            </div>
          </div>
        </div>
        <div className="px-4 py-6 pb-24">
          <PrescriptionAnalyzer />
        </div>
      </div>;
  }
  if (activeFeature === 'reports') {
    return <HealthReportsScreen onBack={() => setActiveFeature(null)} />;
  }
  if (activeFeature === 'articles') {
    return <HealthArticlesScreen onBack={() => setActiveFeature(null)} />;
  }
  if (activeFeature === 'chatbot') {
    return <ChatbotScreen onBack={() => setActiveFeature(null)} />;
  }
  if (activeFeature === 'profiles') {
    return <ProfileManagementScreen onBack={() => setActiveFeature(null)} />;
  }
  return <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6 safe-area-top">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Good morning</h1>
            <span className="text-2xl">👋</span>
          </div>
          <p className="text-gray-600 mt-1">Welcome to your health dashboard</p>
        </div>
      </div>

      {/* Today's Medications */}
      <div className="px-4 py-4 pb-24">
        <div className="mb-6">
          <TodaysMedicationsCard onViewAll={() => onTabChange?.('medications')} />
        </div>

        {/* Emergency Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Emergency Services</h2>
          <div className="space-y-4">
            {emergencyFeatures.map(feature => <FeatureCard key={feature.id} image={feature.image} title={feature.title} description={feature.description} onClick={feature.action} badge={feature.badge} gradient={feature.gradient} />)}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Health Services</h2>
          {features.map(feature => <FeatureCard key={feature.id} image={feature.image} title={feature.title} description={feature.description} onClick={feature.action} />)}
        </div>
      </div>
    </div>;
};