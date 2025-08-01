/**
 * Authentication Helper Utilities
 */

export function isAuthenticated() {
  return !!localStorage.getItem('token');
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem('userToken');
};

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
}

export const checkTokenValidity = async (): Promise<boolean> => {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const response = await fetch('http://localhost:5000/api/user/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.ok;
  } catch (error) {
    console.error('Token validation failed:', error);
    return false;
  }
}; 