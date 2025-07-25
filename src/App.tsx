
import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { MedicationProvider } from '@/contexts/MedicationContext';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { HomeScreen } from '@/components/home/HomeScreen';
import { MedicationsScreen } from '@/components/medications/MedicationsScreen';
import { RecordsScreen } from '@/components/records/RecordsScreen';
import { ProfileScreen } from '@/components/profile/ProfileScreen';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { TopNavigation } from '@/components/layout/TopNavigation';

const queryClient = new QueryClient();

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onTabChange={setActiveTab} />;
      case 'medications':
        return <MedicationsScreen />;
      case 'records':
        return <RecordsScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNavigation />
      {renderScreen()}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <MedicationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </MedicationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
