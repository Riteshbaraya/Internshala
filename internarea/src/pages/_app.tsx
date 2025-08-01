import Footer from "@/Components/Fotter";
import Navbar from "@/Components/Navbar";
import ProtectedRoute from "@/Components/ProtectedRoute";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { store } from "../store/store";
import { Provider, useDispatch } from "react-redux";
import { useEffect } from "react";
import { auth } from "@/firebase/firebase";
import { login, logout } from "@/Feature/Userslice";
import { loginSuccess, logout as jwtLogout } from "@/Feature/AuthSlice";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App({ Component, pageProps }: AppProps) {
  function AuthListener() {
    const dispatch = useDispatch();
    
    useEffect(() => {
      // Check for admin token on app load
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify if it's an admin token by checking the role
          const userData = localStorage.getItem('user');
          if (userData) {
            const user = JSON.parse(userData);
            if (user.role === 'admin') {
              dispatch(loginSuccess({
                user: { name: user.name, email: user.email, role: user.role },
                token: token,
                role: user.role
              }));
            }
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }

      // Firebase authentication listener
      auth.onAuthStateChanged((authuser) => {
        if (authuser) {
          dispatch(
            login({
              uid: authuser.uid,
              photo: authuser.photoURL,
              name: authuser.displayName,
              email: authuser.email,
              phoneNumber: authuser.phoneNumber,
            })
          );
        } else {
          dispatch(logout());
        }
      });
    }, [dispatch]);
    
    return null;
  }

  return (
    <Provider store={store}>
      <AuthListener />
      <div className="bg-white">
        <ToastContainer/>
        <Navbar />
        <ProtectedRoute>
          <Component {...pageProps} />
        </ProtectedRoute>
        <Footer />
      </div>
    </Provider>
  );
}
