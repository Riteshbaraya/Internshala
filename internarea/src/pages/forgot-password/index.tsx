import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email.');
      return;
    }
    setLoading(true);
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/forgot-password`;
    console.debug('[ForgotPassword] API URL:', apiUrl);
    try {
      const res = await axios.post(apiUrl, { email });
      if (res.data && res.data.message) {
        toast.success(res.data.message);
      } else {
        toast.error('Unexpected response from server.');
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message);
        return; // Prevent error from bubbling up
      } else {
        toast.error('An error occurred. Please try again later.');
        return; // Prevent error from bubbling up
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full border p-2 rounded mb-4"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword; 