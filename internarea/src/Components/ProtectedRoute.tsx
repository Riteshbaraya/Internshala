import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectuser } from '@/Feature/Userslice';
import { selectAuth } from '@/Feature/AuthSlice';
import { useRouter } from 'next/router';
import { auth, provider } from '@/firebase/firebase';
import { signInWithPopup } from 'firebase/auth';
import { toast } from 'react-toastify';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  allowedRoles = []
}) => {
  const firebaseUser = useSelector(selectuser);
  const jwtAuth = useSelector(selectAuth);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const hasShownAuthToast = useRef(false);

  // Pages that don't require authentication
  const publicPages = ['/admin-login', '/admin/dashboard', '/', '/internship', '/job'];
  const isPublicPage = publicPages.includes(router.pathname);

  // Admin pages that require JWT admin authentication
  const adminPages = ['/admin/dashboard', '/admin/create-job', '/admin/create-internship', '/admin/applications'];
  const isAdminPage = adminPages.some(page => router.pathname.startsWith(page));

  // User pages that require Firebase authentication
  const userPages = ['/profile', '/userapplication', '/applications', '/postJob', '/postInternship'];
  const isUserPage = userPages.some(page => router.pathname.startsWith(page));

  useEffect(() => {
    hasShownAuthToast.current = false;
  }, [router.pathname]);

  useEffect(() => {
    // If it's a public page, don't check authentication
    if (isPublicPage) {
      setIsLoading(false);
      return;
    }

    // If authentication is not required, allow access
    if (!requireAuth) {
      setIsLoading(false);
      return;
    }

    // Check authentication based on page type
    if (isAdminPage) {
      // Admin pages require JWT admin authentication
      const token = localStorage.getItem('token');
      if (!token || !jwtAuth.isAuthenticated || jwtAuth.role !== 'admin') {
        setIsLoading(false);
        return;
      }
    } else if (isUserPage) {
      // User pages require Firebase authentication
      if (!firebaseUser) {
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(false);
  }, [firebaseUser, jwtAuth, router.pathname, isPublicPage, isAdminPage, isUserPage, requireAuth]);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      toast.success("Logged in successfully");
    } catch (error) {
      console.error(error);
      toast.error("Login failed");
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is not authenticated and trying to access an admin page, redirect to admin login
  // if (isAdminPage && (!jwtAuth.isAuthenticated || jwtAuth.role !== 'admin')) {
  //   if (!hasShownAuthToast.current) {
  //     toast.error("Admin authentication required");
  //     hasShownAuthToast.current = true;
  //   }
  //   router.push('/admin-login');
  //   return null;
  // }
  // If user is //  authenticated and trying to access a user page, show sign-in page
  if (isUserPage && !firebaseUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Sign in to continue
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You need to be signed in to access this page
          </p>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="space-y-6">
              <button
                onClick={handleSignIn}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-gray-700 font-medium">Continue with Google</span>
              </button>
              
              <div className="text-center">
                <a
                  href="/admin-login"
                  className="text-blue-600 hover:text-blue-500 text-sm"
                >
                  Admin Login
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user is authenticated or authentication is not required, show the page
  return <>{children}</>;
};

export default ProtectedRoute; 