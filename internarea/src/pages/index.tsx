import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import {
  ArrowUpRight,
  Banknote,
  Calendar,
  ChevronRight,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import axios from "@/utils/axios";
import { useSelector } from "react-redux";
import { selectuser } from "@/Feature/Userslice";
import { auth, provider } from "@/firebase/firebase";
import { signInWithPopup } from "firebase/auth";
import { toast } from "react-toastify";
import { API_URL } from '@/utils/config';

export default function SvgSlider() {
  const user = useSelector(selectuser);
  
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      toast.success("Logged in successfully");
    } catch (error) {
      console.error(error);
      toast.error("Login failed");
    }
  };

  const categories = [
    "Big Brands",
    "Work From Home",
    "Part-time",
    "MBA",
    "Engineering",
    "Media",
    "Design",
    "Data Science",
  ];
  // const internships = [
  //   {
  //     _id: "1",
  //     title: "Software Engineering Intern",
  //     company: "Google",
  //     location: "Remote",
  //     stipend: "$1,500/month",
  //     duration: "3 months",
  //     category: "Engineering",
  //   },
  //   {
  //     _id: "2",
  //     title: "Marketing Intern",
  //     company: "Meta",
  //     location: "New York",
  //     stipend: "$1,200/month",
  //     duration: "6 months",
  //     category: "Media",
  //   },
  //   {
  //     _id: "3",
  //     title: "Graphic Design Intern",
  //     company: "Adobe",
  //     location: "San Francisco",
  //     stipend: "$1,000/month",
  //     duration: "4 months",
  //     category: "Design",
  //   },
  // ];

  // const jobs = [
  //   {
  //     _id: "101",
  //     title: "Frontend Developer",
  //     company: "Amazon",
  //     location: "Seattle",
  //     CTC: "$100K/year",
  //     Experience: "2+ years",
  //     category: "Engineering",
  //   },
  //   {
  //     _id: "102",
  //     title: "Data Analyst",
  //     company: "Microsoft",
  //     location: "Remote",
  //     CTC: "$90K/year",
  //     Experience: "1+ years",
  //     category: "Data Science",
  //   },
  //   {
  //     _id: "103",
  //     title: "UX Designer",
  //     company: "Apple",
  //     location: "California",
  //     CTC: "$110K/year",
  //     Experience: "3+ years",
  //     category: "Design",
  //   },
  // ];
  const slides = [
    {
      pattern: "pattern-1",
      title: "Start Your Career Journey",
      bgColor: "bg-indigo-600",
    },
    {
      pattern: "pattern-2",
      title: "Learn From The Best",
      bgColor: "bg-blue-600",
    },
    {
      pattern: "pattern-3",
      title: "Grow Your Skills",
      bgColor: "bg-purple-600",
    },
    {
      pattern: "pattern-4",
      title: "Connect With Top Companies",
      bgColor: "bg-teal-600",
    },
  ];

  const stats = [
    { number: "300K+", label: "companies hiring" },
    { number: "10K+", label: "new openings everyday" },
    { number: "21Mn+", label: "active students" },
    { number: "600K+", label: "learners" },
  ];
  const [internships, setinternship] = useState<any>([]);
  const [jobs, setjob] = useState<any>([]);
  useEffect(() => {
    const fetchdata = async () => {
      try {
        // Removed debug logs
        const [internshipres, jobres] = await Promise.all([
          axios.get(`${API_URL}/api/internship`),
          axios.get(`${API_URL}/api/job`),
        ]);
        setinternship(internshipres.data);
        setjob(jobres.data);
      } catch (error: any) {
        if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
          // User-friendly error for backend unreachable
          if (typeof window !== 'undefined') {
            // Only show toast in browser
            import('react-toastify').then(({ toast }) => {
              toast.error('Could not connect to backend. Please check your server or network.');
            });
          }
        } else {
          console.error('Error fetching homepage data:', error);
        }
      }
    };
    fetchdata();
  }, []);
  const [selectedCategory, setSelectedCategory] = useState("");
  const filteredInternships = internships.filter(
    (item: any) => !selectedCategory || item.category === selectedCategory
  );
  const filteredJobs = jobs.filter(
    (item: any) => !selectedCategory || item.category === selectedCategory
  );
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* hero section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Make your dream career a reality
        </h1>
        <p className="text-xl text-gray-600">Trending on InternArea 🔥</p>
      </div>

      {/* Welcome message for authenticated users or Sign-in call-to-action for unauthenticated users */}
      {user ? (
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-8 mb-12 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">
            Welcome back, {user.name}! 👋
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Ready to explore new opportunities? Browse internships and jobs, apply with one click, and track your applications.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/internship">
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Browse Internships
              </button>
            </Link>
            <Link href="/job">
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Browse Jobs
              </button>
            </Link>
            <Link href="/profile">
              <button className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                View Profile
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 mb-12 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">
            Ready to start your career journey?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Sign in to apply for internships and jobs, track your applications, and get personalized recommendations.
          </p>
          <Link href="/user-auth">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2 mx-auto">
              <span>Sign In / Sign Up</span>
            </button>
          </Link>
        </div>
      )}
      {/* Swiper section */}
      <div className="mb-16">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          className="rounded-xl overflow-hidden shadow-lg"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className={`relative h-[400px] ${slide.bgColor}`}>
                {/* SVG Pattern Background */}
                <div className="absolute inset-0 opacity-20">
                  <svg
                    className="w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {slide.pattern === "pattern-1" && (
                      <pattern
                        id="pattern-1"
                        x="0"
                        y="0"
                        width="20"
                        height="20"
                        patternUnits="userSpaceOnUse"
                      >
                        <circle cx="10" cy="10" r="3" fill="white" />
                      </pattern>
                    )}
                    {slide.pattern === "pattern-2" && (
                      <pattern
                        id="pattern-2"
                        x="0"
                        y="0"
                        width="40"
                        height="40"
                        patternUnits="userSpaceOnUse"
                      >
                        <rect
                          x="15"
                          y="15"
                          width="10"
                          height="10"
                          fill="white"
                        />
                      </pattern>
                    )}
                    {slide.pattern === "pattern-3" && (
                      <pattern
                        id="pattern-3"
                        x="0"
                        y="0"
                        width="40"
                        height="40"
                        patternUnits="userSpaceOnUse"
                      >
                        <path d="M0 20 L20 0 L40 20 L20 40 Z" fill="white" />
                      </pattern>
                    )}
                    {slide.pattern === "pattern-4" && (
                      <pattern
                        id="pattern-4"
                        x="0"
                        y="0"
                        width="60"
                        height="60"
                        patternUnits="userSpaceOnUse"
                      >
                        <path d="M30 5 L55 30 L30 55 L5 30 Z" fill="white" />
                      </pattern>
                    )}
                    <rect
                      x="0"
                      y="0"
                      width="100%"
                      height="100%"
                      fill={`url(#${slide.pattern})`}
                    />
                  </svg>
                </div>

                {/* Content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <h2 className="text-4xl font-bold text-white">
                    {slide.title}
                  </h2>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      {/* Category section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Latest internships on Intern Area
        </h2>
        <div className="flex flex-wrap gap-4">
          <span className="text-gray-700 font-medium">POPULAR CATEGORIES:</span>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      {/* INternship grid   */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {filteredInternships.map((internship: any, index: any) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 transition-transform hover:transform hover:scale-105"
          >
            <div className="flex items-center gap-2 text-blue-600 mb-4">
              <ArrowUpRight size={20} />
              <span className="font-medium">Actively Hiring</span>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              {internship.title}
            </h3>
            <p className="text-gray-500 mb-4">{internship.company}</p>
            <div className="space-y-3 text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin size={18} />
                <span>{internship.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Banknote size={18} />
                <span>{internship.stipend}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>{internship.duration}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-6">
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                Internship
              </span>
              <Link
                href={`/detailiternship/${internship._id}`}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View details
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>
      {/* Jobs grid   */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Jobs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredJobs.map((job: any, index: any) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 transition-transform hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-2 text-blue-600 mb-4">
                <ArrowUpRight size={20} />
                <span className="font-medium">Actively Hiring</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                {job.title}
              </h3>
              <p className="text-gray-500 mb-4">{job.company}</p>
              <div className="space-y-3 text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin size={18} />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Banknote size={18} />
                  <span>{job.CTC}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  <span>{job.Experience}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-6">
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                  Jobs
                </span>
                <Link
                  href={`/detailInternship?q=${job._id}`}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  View details
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Stat Section  */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
