import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectuser } from "@/Feature/Userslice";
import { ArrowLeft, Check, Crown, Star, Zap, CreditCard, AlertCircle } from "lucide-react";
import Link from "next/link";
import axios from "@/utils/axios";
import { toast } from "react-toastify";
import { isAuthenticated } from "@/utils/authHelper";
import moment from "moment-timezone";

interface Plan {
  id: string;
  name: string;
  price: number;
  applications: number;
  features: string[];
  color: string;
  icon: React.ReactNode;
}

const Subscribe = () => {
  const user = useSelector(selectuser);
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [isPaymentTime, setIsPaymentTime] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const plans: Plan[] = [
    {
      id: "free",
      name: "Free",
      price: 0,
      applications: 1,
      features: ["1 application per month", "Basic job search", "Email notifications"],
      color: "border-gray-300 bg-gray-50",
      icon: <Star className="h-6 w-6 text-gray-500" />
    },
    {
      id: "bronze",
      name: "Bronze",
      price: 100,
      applications: 3,
      features: ["3 applications per month", "Priority support", "Advanced filters", "Resume builder"],
      color: "border-amber-300 bg-amber-50",
      icon: <Zap className="h-6 w-6 text-amber-500" />
    },
    {
      id: "silver",
      name: "Silver",
      price: 300,
      applications: 5,
      features: ["5 applications per month", "Premium support", "AI job matching", "Interview prep"],
      color: "border-gray-400 bg-gray-100",
      icon: <Crown className="h-6 w-6 text-gray-600" />
    },
    {
      id: "gold",
      name: "Gold",
      price: 1000,
      applications: -1, // unlimited
      features: ["Unlimited applications", "VIP support", "All premium features", "Career coaching"],
      color: "border-yellow-400 bg-yellow-50",
      icon: <Crown className="h-6 w-6 text-yellow-600" />
    }
  ];

  const checkPaymentTime = () => {
    // Payment allowed at any time for testing in development
    const isAllowed = process.env.NODE_ENV === 'development' ? true : (() => {
      const istTime = moment().tz('Asia/Kolkata');
      const currentHour = istTime.hour();
      return currentHour === 10;
    })();
    setIsPaymentTime(isAllowed);
  };

  const fetchCurrentPlan = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Session expired. Please login.');
        router.push('/user-auth');
        return;
      }

      console.log('🔍 [Subscribe] Fetching current plan with token:', {
        hasToken: !!token,
        tokenLength: token.length,
        tokenStart: token.substring(0, 20) + '...'
      });

      const response = await axios.get('/api/subscription/current', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('✅ [Subscribe] Current plan fetched successfully:', response.data);
      setCurrentPlan(response.data);
    } catch (error: any) {
      console.error('❌ [Subscribe] Error fetching current plan:', error);
      
      // Handle 401 Unauthorized error
      if (error.response?.status === 401) {
        console.log('Token expired or invalid, redirecting to login');
        localStorage.removeItem('token');
        toast.error('Session expired. Please login again.');
        router.push('/user-auth');
        return;
      }
      
      // Handle other errors
      if (error.response?.status >= 500) {
        toast.error('Server error. Please try again later.');
      } else if (error.response?.status >= 400) {
        toast.error('Failed to fetch subscription details.');
      } else if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
        toast.error('Network error. Please check your connection.');
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/user-auth');
      return;
    }

    console.log('✅ [Subscribe] Token found, proceeding with subscription page');

    // Debug: Log current token status
    console.log('🔍 [Subscribe] Token check:', {
      hasToken: !!token,
      tokenLength: token?.length,
      isAuthenticated: isAuthenticated()
    });

    fetchCurrentPlan();
    checkPaymentTime();
    setIsInitializing(false);
    
    // Update time every minute
    const interval = setInterval(checkPaymentTime, 60000);
    return () => clearInterval(interval);
  }, [router]);

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  const handleSubscribe = async (planId: string) => {
    // Validate plan selection
    if (!planId) {
      toast.error("Please select a plan");
      return;
    }

    const plan = plans.find((p) => p.id === planId);
    if (!plan) {
      toast.error("Invalid plan");
      return;
    }

    // Free plan: switch instantly
    if (plan.price === 0) {
      setSelectedPlan(planId);
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Session expired. Please login.');
          router.push('/user-auth');
          return;
        }
        const response = await axios.post('/api/user/change-subscription', { plan: planId }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Subscription changed successfully!');
        fetchCurrentPlan();
        setSelectedPlan(null);
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to change subscription.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Paid plan: enforce 10-11 AM IST
    const currentIST = moment().tz('Asia/Kolkata');
    if (currentIST.hour() !== 10) {
      toast.error('Payment allowed only between 10-11 AM IST');
      return;
    }

    setSelectedPlan(planId);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Session expired. Please login.');
        router.push('/user-auth');
        return;
      }
      // 1. Create Razorpay order
      const { data } = await axios.post('/api/payment/checkout', { plan: planId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // 2. Show Razorpay popup
      const razorpay = new (window as any).Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: 'INR',
        order_id: data.orderId,
        name: 'InternArea',
        description: `${plan.name} Plan Subscription`,
        handler: async function (response: any) {
          try {
            await axios.post('/api/user/change-subscription', {
              plan: planId,
              razorpayPaymentId: response.razorpay_payment_id,
              invoiceId: data.invoiceId
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Subscription activated!');
            fetchCurrentPlan();
            setSelectedPlan(null);
          } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to activate subscription.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || ''
        },
        theme: { color: '#3B82F6' }
      });
      razorpay.open();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to initiate payment.');
      setLoading(false);
    }
  };

  const isCurrentPlan = (planId: string) => {
    return currentPlan?.planName === planId;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/profile" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Profile</span>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
          </div>
          <p className="mt-2 text-gray-600">
            Choose a plan that fits your career goals
          </p>
          
          {/* Debug Info - REMOVED FOR PRODUCTION */}
        </div>

        {/* Current Plan Status */}
        {currentPlan && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Current Plan</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{currentPlan.planName.charAt(0).toUpperCase() + currentPlan.planName.slice(1)}</span> Plan
                </p>
                <p className="text-xs text-gray-500">
                  Valid till: {new Date(currentPlan.validTill).toLocaleDateString()}
                </p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-lg border-2 p-6 ${plan.color} ${
                isCurrentPlan(plan.id) ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {isCurrentPlan(plan.id) && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="text-center mb-4">
                <div className="flex justify-center mb-2">
                  {plan.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-2">
                  {plan.price === 0 ? (
                    <span className="text-2xl font-bold text-gray-900">Free</span>
                  ) : (
                    <div>
                      <span className="text-2xl font-bold text-gray-900">₹{plan.price}</span>
                      <span className="text-gray-500">/month</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {plan.applications === -1 ? 'Unlimited' : `${plan.applications} applications`}
                </p>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading || isCurrentPlan(plan.id)}
                className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  isCurrentPlan(plan.id)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading && selectedPlan === plan.id ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : isCurrentPlan(plan.id) ? (
                  'Current Plan'
                ) : (
                  'Subscribe Now'
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Payment Information */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Payment Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Payment Schedule</h4>
              <ul className="space-y-1">
                <li>• Payments are processed monthly</li>
                <li>• All payments are in Indian Rupees (₹)</li>
                <li>• Secure payment via Razorpay</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">⏰ Time Restrictions - ACTIVE</h4>
              <ul className="space-y-1">
                <li>•  Payments are allowed only between 10:00 AM and 11:00 AM IST</li>
                <li>• Please try again during the allowed time window</li>
                <li>•  Paid plan changes are blocked outside of this time</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscribe; 