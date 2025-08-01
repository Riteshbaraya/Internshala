import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import axios from 'axios';
import { MapPin, Cloud, Thermometer, AlertCircle } from 'lucide-react';
import { GOOGLE_MAPS_API_KEY, WEATHER_API_KEY } from '@/utils/config';

interface LocationData {
  city: string;
  state: string;
  country: string;
}

interface WeatherData {
  temperature: number;
  weatherType: string;
  icon: string;
}

const libraries: ("places")[] = ["places"];

const containerStyle = {
  width: '100%',
  height: '100%'
};

const LocationWeather: React.FC = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use config instead of process.env
  const googleMapsApiKey = GOOGLE_MAPS_API_KEY;
  const weatherApiKey = WEATHER_API_KEY;

  const isGoogleKeyInvalid = !googleMapsApiKey || googleMapsApiKey.includes('your_');
  const isWeatherKeyInvalid = !weatherApiKey || weatherApiKey.includes('your_');

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey || '',
    libraries: libraries
  });

  const getLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      // Check if API keys are configured
      if (isGoogleKeyInvalid) {
        throw new Error('Google Maps API key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file');
      }

      if (isWeatherKeyInvalid) {
        throw new Error('Weather API key is not configured. Please add NEXT_PUBLIC_WEATHER_API_KEY to your .env.local file');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true
        });
      });

      const { latitude, longitude } = position.coords;
      setLocation({ lat: latitude, lng: longitude });

      // Debug: Log the Google Maps API Key being used
      console.log('Using Google Maps API Key:', googleMapsApiKey);

      // Get location data using Google Maps Geocoding API
      const geocodeResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleMapsApiKey}`
      );

      if (geocodeResponse.data.status !== 'OK') {
        throw new Error(`Geocoding failed: ${geocodeResponse.data.status}`);
      }

      const addressComponents = geocodeResponse.data.results[0].address_components;
      const locationData: LocationData = {
        city: '',
        state: '',
        country: ''
      };

      addressComponents.forEach((component: any) => {
        if (component.types.includes('locality')) {
          locationData.city = component.long_name;
        } else if (component.types.includes('administrative_area_level_1')) {
          locationData.state = component.long_name;
        } else if (component.types.includes('country')) {
          locationData.country = component.long_name;
        }
      });

      setLocationData(locationData);

      // Get weather data using WeatherAPI.com
      const weatherResponse = await axios.get(
        `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${latitude},${longitude}&aqi=no`
      );

      if (weatherResponse.data.error) {
        throw new Error(`Weather API error: ${weatherResponse.data.error.message}`);
      }

      setWeatherData({
        temperature: Math.round(weatherResponse.data.current.temp_c),
        weatherType: weatherResponse.data.current.condition.text,
        icon: weatherResponse.data.current.condition.icon
      });
    } catch (err: any) {
      console.error('Location/Weather error:', err);
      setError(err.message || 'Failed to get location or weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [googleMapsApiKey, weatherApiKey, isGoogleKeyInvalid, isWeatherKeyInvalid]);

  // Show setup instructions if API keys are missing
  if (isGoogleKeyInvalid || isWeatherKeyInvalid) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Location & Weather</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">API Keys Required</h3>
              <p className="text-sm text-yellow-700 mt-1">
                To use the location and weather feature, you need to configure API keys:
              </p>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                {!googleMapsApiKey && (
                  <li>• <strong>Google Maps API Key:</strong> Get from <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
                )}
                {!weatherApiKey && (
                  <li>• <strong>Weather API Key:</strong> Get from <a href="https://www.weatherapi.com/" target="_blank" rel="noopener noreferrer" className="underline">WeatherAPI.com</a></li>
                )}
              </ul>
              <p className="text-sm text-yellow-700 mt-2">
                Add them to your <code className="bg-yellow-100 px-1 rounded">.env.local</code> file:
              </p>
              <pre className="text-xs bg-yellow-100 p-2 rounded mt-2 overflow-x-auto">
{`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
NEXT_PUBLIC_WEATHER_API_KEY=your_weather_api_key_here`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Location & Weather</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Google Maps Error</h3>
              <p className="text-sm text-red-700 mt-1">
                Failed to load Google Maps. Please check your API key and try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">Location & Weather</h2>
      
      <button
        onClick={getLocation}
        disabled={loading}
        className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
      >
        <MapPin className="w-5 h-5 mr-2" />
        {loading ? 'Getting Location...' : 'Obtain Location'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {locationData && weatherData && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">
                {locationData.city}, {locationData.state}
              </h3>
              <p className="text-gray-600">{locationData.country}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Thermometer className="w-5 h-5 text-orange-500 mr-1" />
                <span className="text-lg font-medium">{weatherData.temperature}°C</span>
              </div>
              <div className="flex items-center">
                <Cloud className="w-5 h-5 text-blue-500 mr-1" />
                <span className="text-gray-700">{weatherData.weatherType}</span>
              </div>
            </div>
          </div>

          {isLoaded && location && (
            <div className="h-[300px] rounded-lg overflow-hidden">
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={location}
                zoom={12}
                options={{
                  zoomControl: true,
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false,
                }}
              >
                <Marker position={location} />
              </GoogleMap>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationWeather; 