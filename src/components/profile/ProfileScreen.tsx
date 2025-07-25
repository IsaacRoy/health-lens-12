
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, Users, Bell, Shield, LogOut, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export const ProfileScreen = () => {
  const { user, familyMembers, logout, currentProfile } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const profileSettings = [
    { id: 'notifications', label: 'Push Notifications', enabled: true },
    { id: 'reminders', label: 'Medication Reminders', enabled: true },
    { id: 'darkMode', label: 'Dark Mode', enabled: false },
    { id: 'biometric', label: 'Biometric Login', enabled: false }
  ];

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6 safe-area-top">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile 👤</h1>
          
          {/* Current Profile Card */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {currentProfile?.name?.charAt(0) || 'U'}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{currentProfile?.name}</h3>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                  {currentProfile?.age && (
                    <p className="text-sm text-gray-500">Age: {currentProfile.age}</p>
                  )}
                  
                  {currentProfile?.chronicConditions && currentProfile.chronicConditions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {currentProfile.chronicConditions.map((condition) => (
                        <Badge key={condition} variant="secondary" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Family Members */}
        {familyMembers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Family Members
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {familyMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.relationship} • Age {member.age}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
              
              <Button variant="outline" className="w-full mt-3">
                Add Family Member
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profileSettings.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between">
                <span className="font-medium">{setting.label}</span>
                <Switch 
                  checked={setting.enabled} 
                  onCheckedChange={() => toast.info(`${setting.label} toggled`)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start h-12"
            onClick={() => toast.info('Opening notification settings...')}
          >
            <Bell className="w-4 h-4 mr-3" />
            Notification Preferences
            <ChevronRight className="w-4 h-4 ml-auto" />
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start h-12"
            onClick={() => toast.info('Opening privacy settings...')}
          >
            <Shield className="w-4 h-4 mr-3" />
            Privacy & Security
            <ChevronRight className="w-4 h-4 ml-auto" />
          </Button>
        </div>

        {/* Health Stats Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Health Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">85%</div>
                <div className="text-sm text-green-800">Medication Adherence</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-sm text-blue-800">Records Uploaded</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card>
          <CardHeader>
            <CardTitle>About HealthLens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Built for Health Tech Hackathon 2024
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Version 1.0.0</Badge>
              <Badge variant="outline">PWA Ready</Badge>
              <Badge variant="outline">HIPAA Compliant</Badge>
            </div>
            
            <div className="pt-4 border-t">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => toast.info('Opening team information...')}
              >
                <span className="mr-2">👥</span>
                Team & Credits
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button 
          variant="destructive" 
          className="w-full h-12"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>

        {/* Bottom Spacing for Navigation */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};
