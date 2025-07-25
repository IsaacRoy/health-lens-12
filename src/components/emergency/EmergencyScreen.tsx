import React, { useState } from 'react';
import { NearbyDoctors } from './NearbyDoctors';
import { NearbyHospitals } from './NearbyHospitals';
import { Phone, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import doctorIcon from '@/assets/doctor-icon.png';
import hospitalIcon from '@/assets/hospital-icon.png';
interface EmergencyScreenProps {
  onBack: () => void;
}
export const EmergencyScreen: React.FC<EmergencyScreenProps> = ({
  onBack
}) => {
  const [activeView, setActiveView] = useState<'main' | 'doctors' | 'hospitals'>('main');
  if (activeView === 'doctors') {
    return <NearbyDoctors onBack={() => setActiveView('main')} />;
  }
  if (activeView === 'hospitals') {
    return <NearbyHospitals onBack={() => setActiveView('main')} />;
  }
  return <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-red-600 text-white shadow-sm">
        <div className="px-4 py-6 safe-area-top">
          <div className="flex items-center space-x-3 mb-4">
            <button onClick={onBack} className="p-2 hover:bg-red-500 rounded-full text-white">
              ←
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🚨</span>
              <h1 className="text-2xl font-bold">Emergency Services</h1>
            </div>
          </div>
          <p className="text-red-100">Quick access to medical help when you need it most</p>
        </div>
      </div>

      <div className="px-4 py-6 pb-24 space-y-4">
        {/* Emergency Hotline */}
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-800">Emergency Hotline</h3>
                  <p className="text-sm text-red-600">Call 911 for immediate help</p>
                </div>
              </div>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => window.open('tel:911')}>
                Call 911
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveView('doctors')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center">
                  <img src={doctorIcon} alt="Doctor" className="w-16 h-16 rounded-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Find Nearest Doctor</h3>
                  <p className="text-sm text-gray-600">Locate available doctors in your area</p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>Based on your location</span>
                  </div>
                </div>
                <div className="text-blue-600">→</div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveView('hospitals')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center">
                  <img src={hospitalIcon} alt="Hospital" className="w-16 h-16 rounded-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Find Nearest Hospital</h3>
                  <p className="text-sm text-gray-600">Locate hospitals and emergency rooms</p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>24/7 emergency services</span>
                  </div>
                </div>
                <div className="text-green-600">→</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Emergency Info */}
        
      </div>
    </div>;
};