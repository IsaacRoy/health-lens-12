
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, User, ArrowLeft, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileManagementScreenProps {
  onBack: () => void;
}

export const ProfileManagementScreen: React.FC<ProfileManagementScreenProps> = ({ onBack }) => {
  const [profiles] = useState([
    {
      id: '1',
      name: 'John Doe',
      relation: 'Self',
      age: 35,
      initials: 'JD'
    },
    {
      id: '2',
      name: 'Jane Doe',
      relation: 'Spouse',
      age: 32,
      initials: 'JD'
    },
    {
      id: '3',
      name: 'Sam Doe',
      relation: 'Child',
      age: 8,
      initials: 'SD'
    }
  ]);

  const handleAddProfile = () => {
    toast.info('Add profile feature coming soon!');
  };

  const handleProfileClick = (profile: any) => {
    toast.info(`Opening ${profile.name}'s profile...`);
  };

  return (
    <div className="flex-1 bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6 safe-area-top">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <button 
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Family Profiles 👪</h1>
            </div>
            <Button onClick={handleAddProfile} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 pb-24">
        <div className="space-y-4">
          {profiles.map((profile) => (
            <Card 
              key={profile.id} 
              className="shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleProfileClick(profile)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                      {profile.initials}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{profile.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{profile.relation}</span>
                      <span>•</span>
                      <span>{profile.age} years old</span>
                    </div>
                  </div>
                  
                  <Settings className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6 border-dashed border-2">
          <CardContent className="p-6 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-2">Add Family Member</h3>
            <p className="text-sm text-gray-600 mb-4">
              Manage health information for your family members
            </p>
            <Button onClick={handleAddProfile} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add New Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
