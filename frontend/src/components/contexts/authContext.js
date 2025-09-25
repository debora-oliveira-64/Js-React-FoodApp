import { useState, useEffect, useCallback } from 'react';

export function useAuth() {
  const [authState, setAuthState] = useState({
    user: null,
    userId: null,
    loading: true,
  });

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/auth/me', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.auth) {
        setAuthState({ user: data.decoded, userId: data.userId, loading: false });
      } else {
        setAuthState({ user: null, userId: null, loading: false});
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthState({ user: null, userId: null, loading: false});
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (username, password) => {
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });
      const data = await response.json();
      if (data.auth) {
        setAuthState({ user: data.decoded, userId: data.userId, loading: false });
        return true;
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/auth/logout', {
        method: 'GET',
        credentials: 'include',
      });
      setAuthState({ user: null, userId: null, loading: false });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (response.ok) {
        setAuthState({ user: data.decoded, userId: data.userId, loading: false });
        await login(userData.username, userData.password);
        return true;
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  }, [login]);

  return {
    user: authState.user,
    userId: authState.userId,
    loading: authState.loading,
    login,
    logout,
    register,
    checkAuth,
  };
}

