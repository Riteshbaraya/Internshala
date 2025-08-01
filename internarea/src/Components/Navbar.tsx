import React, { use, useEffect, useRef, useState } from "react";
import logo from "../Assets/logo.png";
import Link from "next/link";
import { auth, provider } from "../firebase/firebase";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { signInWithPopup, signOut } from "firebase/auth";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { selectuser, login, logout } from "@/Feature/Userslice";

interface User {
  name: string;
  email: string;
  photo: string;
}

const Navbar = () => {
  const user = useSelector(selectuser);
  const dispatch = useDispatch();

  // Load user data from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData && !user) {
      try {
        const parsedUser = JSON.parse(userData);
        dispatch(login({
          name: parsedUser.name,
          email: parsedUser.email,
          photo: `https://ui-avatars.com/api/?name=${parsedUser.name}&background=random&color=fff&size=128`
        }));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [dispatch, user]);

  const handlelogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      toast.success("logged in successfully");
    } catch (error) {
      console.error(error);
      toast.error("login failed");
    }
    // setuser({
    //   name: "Rahul",
    //   email: "xyz@gmail.com",
    //   photo:
    //     "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=faces",
    // });
  };
  const handlelogout = () => {
    // Clear Firebase auth
    signOut(auth);
    
    // Clear JWT data
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    
    // Clear Redux state
    dispatch(logout());
    
    toast.success("Logged out successfully");
  };
  return (
    <div className="relative">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="/" className="text-xl font-bold text-blue-600">
                <img src={"/logo.png"} alt="" className="h-16" />
              </a>
            </div>
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
                <Link href={"/internship"}>
                  <span>Internships</span>
                </Link>
              </button>
              <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
                <Link href={"/job"}>
                  <span>Jobs</span>
                </Link>
              </button>
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search opportunities..."
                  className="ml-2 bg-transparent focus:outline-none text-sm w-48"
                />
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative flex items-center space-x-2">
                  <button className="flex items-center space-x-2">
                    {" "}
                    <Link href={"/profile"}>
                      <img
                        src={user.photo}
                        alt=""
                        className="w-8 h-8 rounded-full"
                      />
                    </Link>
                  </button>
                  <button
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                    onClick={handlelogout}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/user-auth">
                    <button
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <span>Login</span>
                    </button>
                  </Link>
                  <a
                    href="/admin-login"
                    className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Admin
                  </a>
                </>
              )}
            </div>
          </div>{" "}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
