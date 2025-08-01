import { selectuser } from "@/Feature/Userslice";
import { ExternalLink, Mail, User, Bell, BellOff, Clock, Crown } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import LocationWeather from "@/Components/LocationWeather";
import axios from "axios";
import { toast } from "react-toastify";

interface User {
  name: string;
  email: string;
  photo: string;
}

const index = () => {
  const user = useSelector(selectuser);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on page load
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Session expired. Please login.');
        window.location.href = '/user-auth';
        return;
      }
      setIsAuthenticated(true);
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // Check authentication and fetch notification preferences
  useEffect(() => {
    if (isAuthenticated) {
      console.log('[Profile] User is authenticated, fetching notification preferences');
      fetchUserNotificationPreference();
    } else {
      console.log('[Profile] No authentication token found');
      setNotificationEnabled(true); // Default to enabled
    }
  }, [isAuthenticated]);

  const fetchUserNotificationPreference = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Session expired. Please login.');
        setNotificationEnabled(true); // Default to enabled
        return;
      }
      
      console.log('[Profile] Fetching user profile...');
      
      // Add timeout to the request
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 10000 // 10 second timeout
      });
      
      setNotificationEnabled(response.data.notificationEnabled ?? true);
      console.log('[Profile] notificationEnabled from API:', response.data.notificationEnabled);
    } catch (error: any) {
      console.error('[Profile] Error fetching user notification preference:', error);
      
      // Handle different types of errors
      if (error.code === 'ECONNABORTED') {
        console.log('[Profile] Request timeout - backend server might not be running');
        toast.error('Unable to connect to server. Please check if backend is running.');
      } else if (error.code === 'ERR_NETWORK') {
        console.log('[Profile] Network error - backend server not reachable');
        toast.error('Network error. Please check your connection and ensure backend server is running.');
      } else if (error.response) {
        // Server responded with error status
        console.log('[Profile] Server error:', error.response.status, error.response.data);
        if (error.response.status === 401) {
          console.log('[Profile] Authentication failed - token may be invalid or expired');
          toast.error('Authentication failed. Please login again.');
          // Clear invalid token and redirect
          localStorage.removeItem('token');
          window.location.href = '/user-auth';
        } else {
          toast.error('Failed to fetch user preferences');
        }
      } else {
        // Other errors
        console.log('[Profile] Unknown error:', error.message);
        toast.error('Failed to fetch user preferences');
      }
      
      // Set default value if API call fails
      setNotificationEnabled(true);
    }
  };

  const handleNotificationToggle = async () => {
    setIsLoading(true);
    try {
      const newValue = !notificationEnabled;
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to update notification settings');
        setIsLoading(false);
        return;
      }
      
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/user/profile/notification`, 
        { notificationEnabled: newValue },
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 10000 // 10 second timeout
        }
      );
      console.log('[Profile] Updated notificationEnabled to:', newValue);
      setNotificationEnabled(newValue);
      // Save to localStorage for immediate access
      localStorage.setItem('notificationEnabled', newValue.toString());
      toast.success(newValue ? 'Notifications enabled' : 'Notifications disabled');
    } catch (error: any) {
      console.error('[Profile] Error updating notification settings:', error);
      
      // Handle different types of errors
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout. Please check if backend server is running.');
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Network error. Please check your connection and ensure backend server is running.');
      } else if (error.response) {
        if (error.response.status === 401) {
          toast.error('Authentication failed. Please login again.');
          localStorage.removeItem('token');
          window.location.href = '/user-auth';
        } else {
          toast.error('Failed to update notification settings');
        }
      } else {
        toast.error('Failed to update notification settings');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Authentication required</p>
          <button 
            onClick={() => window.location.href = '/user-auth'}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Add fallback for missing user
  if (!user) return <div style={{padding: 40, fontSize: 24, color: 'red'}}>No user loaded</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto px-2 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-blue-100">
          {/* Profile Header */}
          <div className="relative h-36 bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center">
            <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2">
              {user?.photo ? (
                <img
                  src={user?.photo}
                  alt={user?.name}
                  className="w-28 h-28 rounded-full border-4 border-white shadow-xl object-cover"
                />
              ) : (
                <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl bg-green-400 flex items-center justify-center text-3xl font-bold text-white">
                  {user?.name ? user.name[0].toUpperCase() : <User className="h-12 w-12 text-gray-400" />}
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-20 pb-10 px-6 bg-white">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{user?.name}</h1>
              <div className="mt-2 flex items-center justify-center text-gray-500 text-base">
                <Mail className="h-4 w-4 mr-2" />
                <span>{user?.email}</span>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-xl p-6 text-center shadow hover:shadow-md transition-shadow">
                  <span className="text-blue-600 font-bold text-3xl">0</span>
                  <p className="text-blue-500 text-base mt-2 font-medium">Active Applications</p>
                </div>
                <div className="bg-green-50 rounded-xl p-6 text-center shadow hover:shadow-md transition-shadow">
                  <span className="text-green-600 font-bold text-3xl">0</span>
                  <p className="text-green-500 text-base mt-2 font-medium">Accepted Applications</p>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="bg-gray-50 rounded-xl p-6 shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {notificationEnabled ? (
                      <Bell className="h-6 w-6 text-blue-600" />
                    ) : (
                      <BellOff className="h-6 w-6 text-gray-400" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Application Notifications</h3>
                      <p className="text-sm text-gray-500">
                        Get notified when your application status changes
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleNotificationToggle}
                    disabled={isLoading}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      notificationEnabled ? 'bg-blue-600' : 'bg-gray-200'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Location and Weather Section */}
              <div className="rounded-2xl shadow-lg bg-gradient-to-br from-blue-50 to-white p-0 sm:p-1">
                <LocationWeather />
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    href="/my-logins"
                    className="flex items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">Login History</h4>
                      <p className="text-xs text-gray-500">View your recent login sessions</p>
                    </div>
                  </Link>

                  <Link
                    href="/subscribe"
                    className="flex items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Crown className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">Subscription Plans</h4>
                      <p className="text-xs text-gray-500">Upgrade your plan for more applications</p>
                    </div>
                  </Link>

                  <Link
                    href="/userapplication"
                    className="flex items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <ExternalLink className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">My Applications</h4>
                      <p className="text-xs text-gray-500">Track your job applications</p>
                    </div>
                  </Link>

                  <Link
                    href="/"
                    className="flex items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <User className="h-5 w-5 text-orange-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">Browse Jobs</h4>
                      <p className="text-xs text-gray-500">Find new opportunities</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-center pt-4">
                <Link
                  href="/userapplication"
                  className="inline-flex items-center px-7 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow hover:bg-blue-700 transition-all duration-200 text-lg gap-2"
                >
                  <span>📄</span> View Applications
                  <ExternalLink className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;
