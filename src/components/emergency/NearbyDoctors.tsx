import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Star, Clock, AlertCircle } from 'lucide-react';
import { geminiLocationService, LocationPlace } from '@/services/geminiLocationService';
import { toast } from 'sonner';
interface NearbyDoctorsProps {
  onBack: () => void;
}
export const NearbyDoctors: React.FC<NearbyDoctorsProps> = ({
  onBack
}) => {
  const [doctors, setDoctors] = useState<LocationPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching nearby doctors...');
        const places = await geminiLocationService.findNearbyPlaces('doctor');
        console.log('Received doctors:', places);
        setDoctors(places);
        if (places.length === 0) {
          setError('No doctors found within 50km. Showing sample data for reference.');
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError('Unable to fetch nearby doctors. Using sample data.');
        toast.error('Location services may be disabled. Please enable location access for better results.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);
  const handleCall = (doctor: LocationPlace) => {
    geminiLocationService.callPlace(doctor.phone);
  };
  const handleDirections = (doctor: LocationPlace) => {
    geminiLocationService.openDirections(doctor);
  };
  return <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6 safe-area-top">
          <div className="flex items-center space-x-3 mb-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
              ←
            </button>
            <div className="flex items-center space-x-2">
              
              <h1 className="text-2xl font-bold text-gray-900">Nearby Doctors</h1>
            </div>
          </div>
          <p className="text-gray-600">Available doctors within 50km of your location</p>
        </div>
      </div>

      <div className="px-4 py-6 pb-24">
        {error && <Card className="bg-orange-50 border-orange-200 mb-4">
            <CardContent className="p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-orange-800">Location Notice</h3>
                  <p className="text-sm text-orange-700 mt-1">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>}
        
        {loading ? <div className="space-y-4">
            {[1, 2, 3].map(i => <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div> : <div className="space-y-4">
            {doctors.map(doctor => <Card key={doctor.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">👨‍⚕️</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{doctor.name}</h3>
                        <div className={`px-2 py-1 text-xs font-medium rounded-full ${doctor.isOpen ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {doctor.isOpen ? 'Available' : 'Closed'}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{doctor.vicinity}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                        <div className="flex items-center">
                          <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                          <span>{doctor.rating.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>{doctor.distance}</span>
                        </div>
                        {doctor.isOpen && <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>Available now</span>
                          </div>}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleCall(doctor)} className="flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>Call</span>
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDirections(doctor)} className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>Directions</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
            
            {doctors.length > 0 && <div className="text-center py-4">
                <p className="text-sm text-gray-500">
                  Showing {doctors.length} doctors within 50km radius
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Results are updated in real-time based on your location
                </p>
              </div>}
          </div>}
      </div>
    </div>;
};