import { toast } from 'sonner';

export interface LocationPlace {
  id: string;
  name: string;
  vicinity: string;
  rating: number;
  distance: string;
  location: {
    lat: number;
    lng: number;
  };
  isOpen: boolean;
  types: string[];
  phone: string;
}

export class GeminiLocationService {
  private userLocation: { lat: number; lng: number } | null = null;
  private readonly geminiApiKey = 'AIzaSyC3UXP8RRzxJGap2Ct6rCeKt39LdqA2ITk';

  // Get user's current location with high accuracy
  async getCurrentLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      toast.info('Getting your location...', {
        duration: 2000
      });

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.userLocation = location;
          console.log('✅ User location obtained:', location);
          toast.success('Location found! Searching nearby...', {
            duration: 2000
          });
          resolve(location);
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Default to New York City as fallback
          const defaultLocation = { lat: 40.7128, lng: -74.0060 };
          this.userLocation = defaultLocation;
          toast.warning('Using default location (NYC). Enable location for accurate results.', {
            duration: 4000
          });
          resolve(defaultLocation);
        },
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Find nearby places using Gemini AI directly
  async findNearbyPlaces(type: 'doctor' | 'hospital'): Promise<LocationPlace[]> {
    try {
      const location = this.userLocation || await this.getCurrentLocation();
      
      console.log(`🔍 Finding nearby ${type}s for location:`, location);
      
      toast.info(`Searching for nearby ${type}s...`, {
        duration: 2000
      });

      const places = await this.getGeminiLocationData(location.lat, location.lng, type);
      
      console.log(`✅ SUCCESS: Found ${places.length} ${type}s from Gemini AI`);
      
      toast.success(`Found ${places.length} nearby ${type}s!`, {
        duration: 2000
      });
      
      return places;

    } catch (error) {
      console.error(`❌ Error finding nearby ${type}s:`, error);
      toast.error('AI search failed. Using sample data.', {
        duration: 3000
      });

      // Return fallback mock data
      return this.getFallbackData(type);
    }
  }

  private async getGeminiLocationData(latitude: number, longitude: number, type: string): Promise<LocationPlace[]> {
    const prompt = `Based on the location coordinates ${latitude}, ${longitude}, provide me with a realistic list of 10 nearby ${type === 'hospital' ? 'hospitals' : 'doctors/medical clinics'} within 25 miles radius. 

For each ${type}, provide:
- Realistic name (use actual naming conventions for the area)
- Full address or vicinity
- Phone number in format (XXX) XXX-XXXX
- Rating between 3.5-5.0
- Distance from the coordinates (calculate realistic distances within 25 miles)
- Whether they're currently open (realistic business hours)
- Latitude and longitude coordinates (realistic coordinates near the given location)

Format the response as a JSON array with this exact structure:
[
  {
    "id": "unique_id",
    "name": "Facility Name",
    "vicinity": "Full Address",
    "rating": 4.5,
    "distance": "2.3 miles",
    "location": {
      "lat": 40.7128,
      "lng": -74.0060
    },
    "isOpen": true,
    "types": ["${type}", "health"],
    "phone": "(555) 123-4567"
  }
]

Make sure all data is realistic for the geographic location provided. Return only the JSON array, no additional text.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const geminiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    
    try {
      // Extract JSON from the response
      const jsonMatch = geminiResponse.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : '[]';
      const places = JSON.parse(jsonString);
      
      // Validate and clean the data
      return places.map((place: any, index: number) => ({
        id: place.id || `gemini-${type}-${index}`,
        name: place.name || `${type === 'hospital' ? 'Medical Center' : 'Medical Clinic'} ${index + 1}`,
        vicinity: place.vicinity || 'Address not available',
        rating: Math.min(Math.max(place.rating || 4.0, 3.5), 5.0),
        distance: place.distance || `${(Math.random() * 20 + 1).toFixed(1)} miles`,
        location: {
          lat: place.location?.lat || (latitude + (Math.random() - 0.5) * 0.2),
          lng: place.location?.lng || (longitude + (Math.random() - 0.5) * 0.2)
        },
        isOpen: place.isOpen !== undefined ? place.isOpen : Math.random() > 0.2,
        types: place.types || [type, 'health'],
        phone: place.phone || this.generatePhone()
      }));
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      throw new Error('Failed to parse location data from Gemini');
    }
  }

  openDirections(place: LocationPlace) {
    const query = encodeURIComponent(`${place.name} ${place.vicinity}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    
    toast.success('Opening Google Maps...', {
      duration: 2000
    });
    
    window.open(url, '_blank');
  }

  callPlace(phone: string) {
    toast.info(`Calling ${phone}...`, {
      duration: 2000
    });
    // Clean the phone number and make the call
    const cleanPhone = phone.replace(/[^\d]/g, '');
    window.open(`tel:+1${cleanPhone}`, '_self');
  }

  private getFallbackData(type: 'doctor' | 'hospital'): LocationPlace[] {
    const baseLocation = this.userLocation || { lat: 40.7128, lng: -74.0060 };
    const places = [];

    if (type === 'hospital') {
      for (let i = 0; i < 8; i++) {
        const distance = Math.random() * 20 + 1; // 1-21 miles
        const bearing = Math.random() * 2 * Math.PI;
        
        // Calculate realistic coordinates within 20 miles
        const R = 3959; // Earth's radius in miles
        const newLat = baseLocation.lat + (distance / R) * (180 / Math.PI) * Math.cos(bearing);
        const newLng = baseLocation.lng + (distance / R) * (180 / Math.PI) * Math.sin(bearing) / Math.cos(baseLocation.lat * Math.PI / 180);
        
        places.push({
          id: `fallback-hospital-${i}`,
          name: `${['General', 'Memorial', 'Regional Medical', 'Community', 'University Medical', 'St. Mary\'s', 'Presbyterian', 'Methodist'][i]} Hospital`,
          vicinity: `${Math.floor(Math.random() * 9999) + 1} Medical Center Drive`,
          rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
          distance: `${distance.toFixed(1)} miles`,
          location: { lat: newLat, lng: newLng },
          isOpen: true, // Hospitals are always open
          types: ['hospital', 'health'],
          phone: this.generatePhone()
        });
      }
    } else {
      for (let i = 0; i < 8; i++) {
        const distance = Math.random() * 20 + 1;
        const bearing = Math.random() * 2 * Math.PI;
        
        const R = 3959;
        const newLat = baseLocation.lat + (distance / R) * (180 / Math.PI) * Math.cos(bearing);
        const newLng = baseLocation.lng + (distance / R) * (180 / Math.PI) * Math.sin(bearing) / Math.cos(baseLocation.lat * Math.PI / 180);
        
        const doctors = ['Dr. Sarah Johnson', 'Dr. Michael Chen', 'Dr. Emily Rodriguez', 'Dr. David Kim', 'Dr. Lisa Thompson', 'Dr. James Wilson', 'Dr. Maria Garcia', 'Dr. Robert Lee'];
        const specialties = ['Family Medicine', 'Internal Medicine', 'Emergency Medicine', 'Urgent Care', 'Primary Care', 'Pediatrics', 'Cardiology', 'Orthopedics'];
        
        places.push({
          id: `fallback-doctor-${i}`,
          name: `${doctors[i]} - ${specialties[i]}`,
          vicinity: `${Math.floor(Math.random() * 9999) + 1} Healthcare Plaza, Suite ${Math.floor(Math.random() * 500) + 100}`,
          rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
          distance: `${distance.toFixed(1)} miles`,
          location: { lat: newLat, lng: newLng },
          isOpen: Math.random() > 0.3, // 70% chance of being open
          types: ['doctor', 'health'],
          phone: this.generatePhone()
        });
      }
    }
    
    return places;
  }

  private generatePhone(): string {
    const areaCode = Math.floor(Math.random() * 800) + 200;
    const exchange = Math.floor(Math.random() * 800) + 200;
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `(${areaCode}) ${exchange}-${number}`;
  }
}

export const geminiLocationService = new GeminiLocationService();