import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectAuth } from "@/Feature/AuthSlice";
import { toast } from "react-toastify";
import {
  Briefcase,
  Building2,
  MapPin,
  Tags,
  Info,
  Users,
  DollarSign,
  Calendar,
  ArrowLeft,
  GraduationCap,
  Workflow,
} from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { API_URL } from '@/utils/config';

const AdminCreateInternship = () => {
  const [formType, setFormType] = useState<'job' | 'internship'>('internship');
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    category: "",
    aboutCompany: "",
    aboutJob: "",
    aboutInternship: "",
    whoCanApply: "",
    perks: "",
    numberOfOpening: "",
    CTC: "",
    stipend: "",
    startDate: "",
    AdditionalInfo: "",
    additionalInfo: "",
  });
  
  const router = useRouter();
  const { isAuthenticated, role } = useSelector(selectAuth);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormTypeChange = (type: 'job' | 'internship') => {
    setFormType(type);
    // Reset form data when switching types
    setFormData({
      title: "",
      company: "",
      location: "",
      category: "",
      aboutCompany: "",
      aboutJob: "",
      aboutInternship: "",
      whoCanApply: "",
      perks: "",
      numberOfOpening: "",
      CTC: "",
      stipend: "",
      startDate: "",
      AdditionalInfo: "",
      additionalInfo: "",
    });
  };

  const validateForm = () => {
    const requiredFields = [
      'title', 'company', 'location', 'category', 'aboutCompany', 
      'whoCanApply', 'perks', 'numberOfOpening', 'startDate'
    ];

    if (formType === 'job') {
      requiredFields.push('aboutJob', 'CTC', 'AdditionalInfo');
    } else {
      requiredFields.push('aboutInternship', 'stipend', 'additionalInfo');
    }

    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]?.toString().trim());
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Admin session expired. Please login again.');
      router.push('/admin-login');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      
      if (formType === 'job') {
        // Transform data to match backend expectations for job
        const jobData = {
          title: formData.title,
          company: formData.company,
          location: formData.location,
          Experience: formData.numberOfOpening, // Backend expects Experience field
          category: formData.category,
          aboutCompany: formData.aboutCompany,
          aboutJob: formData.aboutJob,
          whoCanApply: formData.whoCanApply,
          perks: formData.perks.split(',').map(perk => perk.trim()), // Convert to array
          AdditionalInfo: formData.AdditionalInfo,
          CTC: formData.CTC,
          StartDate: formData.startDate, // Backend expects StartDate
        };
        
        const response = await axios.post(`${API_URL}/api/job`, jobData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        toast.success("Job posted successfully");
      } else {
        // Transform data to match backend expectations for internship
        const internshipData = {
          title: formData.title,
          company: formData.company,
          location: formData.location,
          category: formData.category,
          aboutCompany: formData.aboutCompany,
          aboutInternship: formData.aboutInternship,
          whoCanApply: formData.whoCanApply,
          perks: formData.perks.split(',').map(perk => perk.trim()), // Convert to array
          numberOfOpening: formData.numberOfOpening,
          stipend: formData.stipend,
          startDate: formData.startDate,
          additionalInfo: formData.additionalInfo,
        };
        
        const response = await axios.post(`${API_URL}/api/internship`, internshipData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        toast.success("Internship posted successfully");
      }
      
      router.push("/admin/dashboard");
    } catch (error: any) {
      console.log(error);
      toast.error(`Error posting ${formType}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Link href="/admin/dashboard">
                <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back to Dashboard</span>
                </button>
              </Link>
            </div>
            
            {/* Form Type Toggle */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Create New Opportunity</h1>
              <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
                <button
                  onClick={() => handleFormTypeChange('job')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    formType === 'job'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Workflow className="h-4 w-4" />
                  <span>Post Job</span>
                </button>
                <button
                  onClick={() => handleFormTypeChange('internship')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    formType === 'internship'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <GraduationCap className="h-4 w-4" />
                  <span>Post Internship</span>
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {formType === 'job' 
                  ? 'Post a new job opportunity for candidates'
                  : 'Post a new internship opportunity for students'
                }
              </p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    <div className="flex items-center mb-1">
                      <Briefcase className="h-4 w-4 mr-1" />
                      Title*
                    </div>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="text-black mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder={formType === 'job' ? "e.g. Frontend Developer" : "e.g. Frontend Developer Intern"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    <div className="flex items-center mb-1">
                      <Building2 className="h-4 w-4 mr-1" />
                      Company Name*
                    </div>
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="text-black mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="e.g. Tech Solutions Inc"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    <div className="flex items-center mb-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      Location*
                    </div>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="text-black mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="e.g. Mumbai, India"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    <div className="flex items-center mb-1">
                      <Tags className="h-4 w-4 mr-1" />
                      Category*
                    </div>
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="text-black mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="e.g. Software Development"
                  />
                </div>
              </div>
            </div>

            {/* Company & Role Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center mb-1">
                    <Info className="h-4 w-4 mr-1" />
                    About Company*
                  </div>
                </label>
                <textarea
                  name="aboutCompany"
                  value={formData.aboutCompany}
                  onChange={handleChange}
                  rows={4}
                  className="text-black mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Describe your company..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center mb-1">
                    <Briefcase className="h-4 w-4 mr-1" />
                    {formType === 'job' ? 'About Job*' : 'About Internship*'}
                  </div>
                </label>
                <textarea
                  name={formType === 'job' ? 'aboutJob' : 'aboutInternship'}
                  value={formType === 'job' ? formData.aboutJob : formData.aboutInternship}
                  onChange={handleChange}
                  rows={4}
                  className="text-black mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder={formType === 'job' ? "Describe the job role..." : "Describe the internship role..."}
                />
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center mb-1">
                    <Users className="h-4 w-4 mr-1" />
                    Who Can Apply*
                  </div>
                </label>
                <textarea
                  name="whoCanApply"
                  value={formData.whoCanApply}
                  onChange={handleChange}
                  rows={3}
                  className="text-black mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Eligibility criteria..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center mb-1">
                    <Info className="h-4 w-4 mr-1" />
                    Perks* (comma-separated)
                  </div>
                </label>
                <textarea
                  name="perks"
                  value={formData.perks}
                  onChange={handleChange}
                  rows={3}
                  className="text-black mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Health insurance, flexible hours, remote work..."
                />
              </div>
            </div>

            {/* Final Details */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center mb-1">
                    <Users className="h-4 w-4 mr-1" />
                    Number of Openings*
                  </div>
                </label>
                <input
                  type="number"
                  name="numberOfOpening"
                  value={formData.numberOfOpening}
                  onChange={handleChange}
                  min="1"
                  className="text-black mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="e.g. 5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center mb-1">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {formType === 'job' ? 'CTC*' : 'Stipend*'}
                  </div>
                </label>
                <input
                  type="text"
                  name={formType === 'job' ? 'CTC' : 'stipend'}
                  value={formType === 'job' ? formData.CTC : formData.stipend}
                  onChange={handleChange}
                  className="text-black mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder={formType === 'job' ? "e.g. ₹10 LPA" : "e.g. ₹25,000/month"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center mb-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    Start Date*
                  </div>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="text-black mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center mb-1">
                    <Info className="h-4 w-4 mr-1" />
                    Additional Information*
                  </div>
                </label>
                <textarea
                  name={formType === 'job' ? 'AdditionalInfo' : 'additionalInfo'}
                  value={formType === 'job' ? formData.AdditionalInfo : formData.additionalInfo}
                  onChange={handleChange}
                  rows={3}
                  className="text-black mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Any additional details..."
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Creating {formType}...
                  </div>
                ) : (
                  `Create ${formType === 'job' ? 'Job' : 'Internship'}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateInternship; 