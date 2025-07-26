import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/apiService';

export const useApiAuth = () => {
  const { currentUser } = useAuth();

  useEffect(() => {
    const setAuthToken = async () => {
      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken();
          apiService.setAuthToken(idToken);
        } catch (error) {
          console.error('Failed to get ID token:', error);
        }
      } else {
        apiService.setAuthToken('');
      }
    };

    setAuthToken();
  }, [currentUser]);
};