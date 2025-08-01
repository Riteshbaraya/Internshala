import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectuser } from "@/Feature/Userslice";
import { ArrowLeft, Monitor, Smartphone, Globe, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-toastify";
import { isAuthenticated } from "@/utils/authHelper";

interface LoginSession {
  _id: string;
  browser: string;
  os: string;
  device: string;
  ipAddress: string;
  location: string;
  loginTime: string;
  userAgent: string;
}

const MyLogins = () => {
  const user = useSelector(selectuser);
  const router = useRouter();
  const [loginSessions, setLoginSessions] = useState<LoginSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push('/user-auth');
      return;
    }

    fetchLoginHistory();
  }, [router]);

  const fetchLoginHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        router.push('/user-auth');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/auth/login-history', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setLoginSessions(response.data);
    } catch (error: any) {
      console.error('Error fetching login history:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
        router.push('/user-auth');
      } else {
        toast.error('Failed to fetch login history');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('mobile')) {
      return <Smartphone className="h-5 w-5 text-blue-500" />;
    }
    return <Monitor className="h-5 w-5 text-green-500" />;
  };

  const getBrowserColor = (browser: string) => {
    const browserLower = browser.toLowerCase();
    if (browserLower.includes('chrome')) return 'text-green-600';
    if (browserLower.includes('firefox')) return 'text-orange-600';
    if (browserLower.includes('safari')) return 'text-blue-600';
    if (browserLower.includes('edge')) return 'text-blue-500';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading login history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/profile" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Profile</span>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Login History</h1>
          </div>
          <p className="mt-2 text-gray-600">
            Track your recent login sessions and device information
          </p>
        </div>

        {/* Login Sessions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Login Sessions</h2>
            <p className="text-sm text-gray-500 mt-1">
              Showing your last 10 login sessions
            </p>
          </div>

          {loginSessions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No login history</h3>
              <p className="text-gray-500">Your login sessions will appear here once you log in.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {loginSessions.map((session, index) => (
                <div key={session._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getDeviceIcon(session.device)}
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {session.device} • {session.os}
                          </h3>
                          <p className={`text-sm font-medium ${getBrowserColor(session.browser)}`}>
                            {session.browser}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <span>IP: {session.ipAddress}</span>
                        </div>
                        {session.location && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{session.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(session.loginTime)}</span>
                      </div>
                      {index === 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Current Session
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security Tips */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Security Tips</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Review your login sessions regularly for any suspicious activity</li>
            <li>• If you notice any unfamiliar sessions, change your password immediately</li>
            <li>• Keep your browser and operating system updated for better security</li>
            <li>• Use strong, unique passwords for your account</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MyLogins; 