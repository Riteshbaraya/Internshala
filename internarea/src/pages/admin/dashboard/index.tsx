import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { selectAuth } from "@/Feature/AuthSlice";
import { logout } from "@/Feature/AuthSlice";
import { toast } from "react-toastify";
import { 
  Briefcase, 
  Users, 
  FileText, 
  Plus, 
  LogOut, 
  Shield,
  BarChart3,
  Settings,
  Workflow
} from "lucide-react";
import Link from "next/link";
import axios from 'axios';
import { API_URL } from '@/utils/config';

const AdminDashboard = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, role, user } = useSelector(selectAuth);
  const [stats, setStats] = useState({ jobs: 0, internships: 0, applications: 0, users: 0 });

  // useEffect for API fetch only, not for auth toasts or redirects
  useEffect(() => {
    // Fetch real-time stats from backend
    const fetchStats = async () => {
      const token = localStorage.getItem('token'); // FIX: Use 'token' not 'adminToken'
      if (!token) return; // let ProtectedRoute handle auth
      try {
        const headers = { headers: { 'Authorization': `Bearer ${token}` } };
        const [jobsRes, internshipsRes, applicationsRes, usersRes] = await Promise.all([
          axios.get(`${API_URL}/api/job`, headers),
          axios.get(`${API_URL}/api/internship`, headers),
          axios.get(`${API_URL}/api/application`, headers),
          axios.get(`${API_URL}/api/admin/user`, headers),
        ]);
        setStats({
          jobs: Array.isArray(jobsRes.data) ? jobsRes.data.length : 0,
          internships: Array.isArray(internshipsRes.data) ? internshipsRes.data.length : 0,
          applications: Array.isArray(applicationsRes.data) ? applicationsRes.data.length : 0,
          users: Array.isArray(usersRes.data) ? usersRes.data.length : 0,
        });
      } catch (err: any) {
        if (err.response?.status === 401) {
          toast.error('Admin session expired. Please login again.');
          localStorage.removeItem('token');
          router.push('/admin-login');
          return;
        }
        console.error('Error fetching dashboard stats:', err);
      }
    };
    fetchStats();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch(logout());
    toast.success("Logged out successfully");
    router.push('/admin-login');
  };

  const adminFeatures = [
    {
      title: "Create Opportunity",
      description: "Post new jobs or internships with dynamic form",
      icon: <Workflow className="h-8 w-8" />,
      href: "/admin/create-job",
      color: "bg-gradient-to-r from-blue-500 to-green-500"
    },
    {
      title: "View Applications",
      description: "Review and manage job applications",
      icon: <FileText className="h-8 w-8" />,
      href: "/admin/applications",
      color: "bg-purple-500"
    },
    {
      title: "Manage Users",
      description: "View and manage user accounts",
      icon: <Users className="h-8 w-8" />,
      href: "/admin/users",
      color: "bg-orange-500"
    },
    {
      title: "Analytics",
      description: "View platform statistics and reports",
      icon: <BarChart3 className="h-8 w-8" />,
      href: "/admin/analytics",
      color: "bg-red-500"
    },
    {
      title: "Settings",
      description: "Configure admin settings",
      icon: <Settings className="h-8 w-8" />,
      href: "/admin/settings",
      color: "bg-gray-500"
    }
  ];

  if (!isAuthenticated || role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.name || 'Admin'}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Admin Dashboard
          </h2>
          <p className="text-gray-600">
            Manage jobs, internships, applications, and platform settings
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.jobs}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Internships</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.internships}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.applications}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.users}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminFeatures.map((feature, index) => (
            <Link key={index} href={feature.href}>
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${feature.color} text-white`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 