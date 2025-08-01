import React, { useState, useEffect, useRef } from "react";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Mail,
  Tag,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { selectuser } from "@/Feature/Userslice";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { showNotification } from "@/services/notificationService";

interface Application {
  _id: string;
  company: string;
  category: string;
  status: string;
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const Applications = [
  {
    _id: "1",
    company: "Tech Corp",
    category: "Software",
    user: { name: "John Doe", email: "john@example.com" },
    createAt: "2024-03-10T12:00:00Z",
    status: "approved",
  },
  {
    _id: "2",
    company: "Health Solutions",
    category: "Healthcare",
    user: { name: "Rahul", email: "jane@example.com" },
    createAt: "2024-03-08T10:30:00Z",
    status: "pending",
  },
  {
    _id: "3",
    company: "EduLearn",
    category: "Education",
    user: { name: "Rahul", email: "alice@example.com" },
    createAt: "2024-03-05T09:15:00Z",
    status: "rejected",
  },
];

const getStatusColor = (status: any) => {
  switch (status.toLowerCase()) {
    case "approved":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
};

const index = () => {
  const [searchTerm, setsearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [data, setdata] = useState<Application[]>([]);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const user = useSelector(selectuser);

  // Ask for Notification permission on first login
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Fetch notification preference from localStorage or API
  useEffect(() => {
    const fetchNotificationPref = async () => {
      try {
        // First check localStorage
        const localPref = localStorage.getItem('notificationEnabled');
        if (localPref !== null) {
          setNotificationEnabled(localPref === 'true');
          return;
        }

        // Fallback to API if localStorage is not set
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await axios.get('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const apiPref = response.data.notificationEnabled ?? true;
        setNotificationEnabled(apiPref);
        localStorage.setItem('notificationEnabled', apiPref.toString());
      } catch (error) {
        console.error('[UserApp] Error fetching notification preference:', error);
        // Default to enabled if API fails
        setNotificationEnabled(true);
        localStorage.setItem('notificationEnabled', 'true');
      }
    };
    fetchNotificationPref();
  }, []);

  // WebSocket connection for real-time notifications
  useEffect(() => {
    if (!user?.email) return;

    const socket = io("http://localhost:5000", {
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.emit("join", user.email);

    socket.on("application-status-changed", (data) => {
      console.log("🔔 Event received", data);

      // Update UI state immediately
      setdata(prev => prev.map(app => 
        app._id === data.applicationId ? { ...app, status: data.status } : app
      ));

      // Show notification if conditions are met
      if (Notification.permission === "granted" && notificationEnabled) {
        const title = data.status === "accepted" ? "🎉 You're Hired!" : "❌ Application Rejected";
        const body = `Status: ${data.status.toUpperCase()} for ${data.title}`;
        
        showNotification(title, body);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.email, notificationEnabled]);

  // Fetch applications data (only once, no polling)
  useEffect(() => {
    const fetchdata = async () => {
      try {
        setLoading(true);
        if (user) {
          const userIdentifier = user.uid || user.email;
          if (userIdentifier) {
            const res = await axios.get(`http://localhost:5000/api/application/user/${encodeURIComponent(userIdentifier)}`);
            setdata(res.data);
          }
        }
      } catch (error) {
        console.error('[UserApp] Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchdata();
  }, [user]);

  // Map UI filter keys to actual status values in the database
  const statusMap: Record<string, string | null> = {
    all: null,
    pending: 'pending',
    approved: 'accepted', // 'approved' button maps to 'accepted' status
    rejected: 'rejected',
  };

  // Remove the user filtering since we're now getting user-specific data from the API
  const filteredapplications = data.filter((application: Application) => {
    const searchmatch =
      application.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.category.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "all") return searchmatch;
    const mappedStatus = statusMap[filter];
    return searchmatch && mappedStatus && application.status && application.status.toLowerCase() === mappedStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track and manage your job and intenrhsip applications
            </p>
          </div>

          {/* Filters and Search */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex-1 w-full">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setsearchTerm(e.target.value)}
                    placeholder="Search by company, category, or applicant..."
                    className="text-black w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Mail className="absolute top-3 left-3 text-gray-400" />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === "all"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("pending")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilter("approved")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === "approved"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  Approved
                </button>
                <button
                  onClick={() => setFilter("rejected")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  Rejected
                </button>
              </div>
            </div>
          </div>

          {/* Applications List */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Company & Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Applicant
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Applied Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      Loading applications...
                    </td>
                  </tr>
                ) : filteredapplications.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      {data.length === 0 ? "No applications found. Start applying to see your applications here!" : "No applications match your search criteria."}
                    </td>
                  </tr>
                ) : (
                  filteredapplications.map((application:any) => (
                    <tr key={application._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {application.company}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Tag className="h-4 w-4 mr-1" />
                              {application.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {application.user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {
                            new Date(application.createdAt)
                              .toISOString()
                              .split("T")[0]
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            application.status
                          )}`}
                        >
                          {application.status}
                        </span>
                      </td>
                    
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;
