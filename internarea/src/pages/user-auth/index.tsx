import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { selectuser, login } from "@/Feature/Userslice";
import { auth, provider } from "@/firebase/firebase";
import { signInWithPopup } from "firebase/auth";
import { toast } from "react-toastify";
import { User, Lock, Mail, Eye, EyeOff, ArrowLeft, Shield } from "lucide-react";
import axios from "axios";
import Link from "next/link";

const UserAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [requiresOTP, setRequiresOTP] = useState(false);
  const [isChrome, setIsChrome] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
  });

  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector(selectuser);

  // Check if browser is Chrome
  useEffect(() => {
    setIsChrome(navigator.userAgent.includes("Chrome"));
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push('/profile');
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // Get Firebase ID token
      const idToken = await user.getIdToken();
      // Send to backend to get JWT
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/google-login`, {
        email: user.email,
        name: user.displayName,
        photo: user.photoURL,
        idToken,
      });
      if (!response.data.token) {
        toast.error("Google login failed: No token received");
        setIsLoading(false);
        return;
      }
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      dispatch(login({
        name: response.data.user.name,
        email: response.data.user.email,
        photo: response.data.user.photo || user.photoURL
      }));
      toast.success("Logged in successfully with Google");
      router.push('/profile');
    } catch (error) {
      console.error(error);
      toast.error("Google login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || (!isLogin && !formData.name)) {
      toast.error("Please fill in all required fields");
      return;
    }

    // For Chrome browsers, OTP is required if we're in OTP mode
    if (isLogin && isChrome && requiresOTP && !formData.otp) {
      toast.error("Please enter the OTP sent to your email");
      return;
    }

    try {
      setIsLoading(true);
      
      if (isLogin) {
        // Login
        const loginData: any = {
          email: formData.email,
          password: formData.password,
        };

        // Add OTP if provided
        if (formData.otp) {
          loginData.otp = formData.otp;
        }

        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/login`, loginData);

        // Check if OTP is required
        if (response.data.requiresOTP) {
          setRequiresOTP(true);
          toast.success("OTP sent to your email. Please check and enter it.");
          setIsLoading(false);
          return;
        }

        if (!response.data.token) {
          toast.error("Login failed: No token received");
          setIsLoading(false);
          return;
        }

        // Store user data in localStorage for JWT auth
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userData', JSON.stringify({
          name: response.data.name,
          email: response.data.email,
          role: response.data.role
        }));

        // Dispatch user data to Redux
        dispatch(login({
          name: response.data.name,
          email: response.data.email,
          photo: `https://ui-avatars.com/api/?name=${response.data.name}&background=random&color=fff&size=128`
        }));

        toast.success("Logged in successfully");
        router.push('/profile');
      } else {
        // Signup
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/register`, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });

        toast.success("Account created successfully! Please log in.");
        setIsLogin(true);
        setFormData({ name: "", email: "", password: "", otp: "" });
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || "Authentication failed";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: "", email: "", password: "", otp: "" });
    setRequiresOTP(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center mb-6">
          <Link href="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
        </div>
        
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isLogin ? "Sign in to your account" : "Create your account"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={toggleMode}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Email/Password Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1 relative">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your full name"
                  />
                  <User className="absolute top-3 right-3 h-5 w-5 text-gray-400" />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email"
                />
                <Mail className="absolute top-3 right-3 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* OTP Input for Chrome browsers */}
            {isLogin && isChrome && requiresOTP && (
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  OTP Verification
                </label>
                <div className="mt-1 relative">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    value={formData.otp}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                  />
                  <Shield className="absolute top-3 right-3 h-5 w-5 text-gray-400" />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  We've sent a 6-digit OTP to your email for Chrome verification
                </p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : (isLogin ? "Sign in" : "Sign up")}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="ml-2">Sign in with Google</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAuth; 