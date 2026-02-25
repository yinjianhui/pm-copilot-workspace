import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { fetchCurrentUser, refreshTokens, resetAuth } from '../../store/authSlice';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, tokens } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const checkAuth = async () => {
      if (tokens) {
        try {
          // Check if token is expired and refresh if needed
          await dispatch(refreshTokens()).unwrap();
          // Fetch current user after token refresh
          await dispatch(fetchCurrentUser()).unwrap();
        } catch {
          dispatch(resetAuth());
          navigate('/login');
        }
      }
    };

    checkAuth();
  }, [dispatch, navigate, tokens]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return <>{children}</>;
};
