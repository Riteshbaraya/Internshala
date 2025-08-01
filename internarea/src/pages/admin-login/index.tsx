import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { loginStart, loginSuccess, loginFailure, logout } from "@/Feature/AuthSlice";
import { selectAuth } from "@/Feature/AuthSlice";
import { toast } from "react-toastify";
import { User, Lock, Shield } from "lucide-react";
import axios from "axios";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, role, isLoading, error } = useSelector(selectAuth);

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && role === 'admin') {
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, role, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      dispatch(loginStart());
      
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/admin-login`, formData);
      
      const { token, user } = response.data;
      
      // Store token and user data in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch(loginSuccess({
        user: { name: user.name, email: user.email, role: user.role },
        token,
        role: user.role
      }));
      
      toast.success("Admin login successful");
      router.push('/admin/dashboard');
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Login failed";
      dispatch(loginFailure(errorMessage));
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Shield className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mt-4">
          Admin Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Access the admin dashboard to manage jobs and applications
        </p>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full text-black pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter admin username"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full text-black pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter admin password"
                />
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign in as Admin"
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 