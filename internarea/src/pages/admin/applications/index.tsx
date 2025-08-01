import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectAuth } from "@/Feature/AuthSlice";
import { toast } from "react-toastify";
import axios from "axios";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Mail,
  Tag,
  User,
  XCircle,
  ArrowLeft,
  Filter,
  Search,
  BarChart3,
  Download,
  Eye,
  Clock,
  AlertCircle,
  CheckSquare,
  Square
} from "lucide-react";
import Link from "next/link";
import { API_URL } from '@/utils/config';

const AdminApplications = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [data, setData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  const router = useRouter();
  const { isAuthenticated, role } = useSelector(selectAuth);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return; // let ProtectedRoute handle auth
      const response = await axios.get(`${API_URL}/api/application`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setData(response.data);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to fetch applications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredApplications = data.filter((application: any) => {
    const searchMatch =
      application.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "all") return searchMatch;
    return searchMatch && application.status?.toLowerCase() === filter;
  });

  const handleAcceptReject = async (id: string, action: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Admin session expired. Please login again.');
        router.push('/admin-login');
        return;
      }
      const response = await axios.put(
        `${API_URL}/api/application/${id}`,
        { action },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const updatedApplication = data.map((app: any) =>
        app._id === id ? response.data.data : app
      );
      setData(updatedApplication);
      
      const actionText = action === "accepted" ? "approved" : "rejected";
      toast.success(`Application ${actionText} successfully`);
    } catch (error: any) {
      console.error(error);
      toast.error("Error updating application");
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedApplications.length === 0) {
      toast.error("Please select applications first");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Admin session expired. Please login again.');
        router.push('/admin-login');
        return;
      }
      const promises = selectedApplications.map(id =>
        axios.put(
          `${API_URL}/api/application/${id}`,
          { action },
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )
      );

      await Promise.all(promises);
      await fetchApplications();
      setSelectedApplications([]);
      setShowBulkActions(false);
      
      const actionText = action === "accepted" ? "approved" : "rejected";
      toast.success(`${selectedApplications.length} applications ${actionText} successfully`);
    } catch (error: any) {
      console.error(error);
      toast.error("Error performing bulk action");
    }
  };

  const handleSelectAll = () => {
    if (selectedApplications.length === filteredApplications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(filteredApplications.map((app: any) => app._id));
    }
  };

  const handleSelectApplication = (id: string) => {
    if (selectedApplications.includes(id)) {
      setSelectedApplications(selectedApplications.filter(appId => appId !== id));
    } else {
      setSelectedApplications([...selectedApplications, id]);
    }
  };

  // Calculate statistics
  const stats = {
    total: data.length,
    pending: data.filter((app: any) => app.status === "pending").length,
    accepted: data.filter((app: any) => app.status === "accepted").length,
    rejected: data.filter((app: any) => app.status === "rejected").length,
  };

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
              <Link href="/admin/dashboard">
                <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back to Dashboard</span>
                </button>
              </Link>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Applications Management</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.accepted}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">All Applications</h2>
                <p className="text-sm text-gray-500">
                  {filteredApplications.length} of {data.length} applications
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Bulk Actions
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {showBulkActions && (
            <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {selectedApplications.length} applications selected
                  </span>
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {selectedApplications.length === filteredApplications.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleBulkAction("accepted")}
                    disabled={selectedApplications.length === 0}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Accept Selected
                  </button>
                  <button
                    onClick={() => handleBulkAction("rejected")}
                    disabled={selectedApplications.length === 0}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject Selected
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filters and Search */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute top-3 left-3 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by company, category, or applicant..."
                    className="text-black w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                  All ({stats.total})
                </button>
                <button
                  onClick={() => setFilter("pending")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  Pending ({stats.pending})
                </button>
                <button
                  onClick={() => setFilter("accepted")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === "accepted"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  Accepted ({stats.accepted})
                </button>
                <button
                  onClick={() => setFilter("rejected")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  Rejected ({stats.rejected})
                </button>
              </div>
            </div>
          </div>

          {/* Applications List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {showBulkActions && (
                      <th scope="col" className="px-6 py-3">
                        <input
                          type="checkbox"
                          checked={selectedApplications.length === filteredApplications.length && filteredApplications.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                    )}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company & Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((application: any) => (
                    <tr key={application._id} className="hover:bg-gray-50">
                      {showBulkActions && (
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedApplications.includes(application._id)}
                            onChange={() => handleSelectApplication(application._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                      )}
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
                              {application.user?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.user?.email || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(application.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(application.status)}
                          <span className={`ml-2 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(application.status)}`}>
                            {application.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-3">
                          <Link
                            href={`/detailapplication/${application._id}`}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                          {application.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleAcceptReject(application._id, "accepted")}
                                className="text-green-600 hover:text-green-900 flex items-center"
                                title="Accept Application"
                              >
                                <CheckCircle2 className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleAcceptReject(application._id, "rejected")}
                                className="text-red-600 hover:text-red-900 flex items-center"
                                title="Reject Application"
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredApplications.length === 0 && (
                <div className="text-center py-12">
                  <Mail className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'Try adjusting your search terms.' : 'No applications match the current filter.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminApplications; 