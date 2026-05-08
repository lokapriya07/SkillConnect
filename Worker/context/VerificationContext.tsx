import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type VerificationStatus = 'not_submitted' | 'pending' | 'assigned' | 'verified';

type VerificationContextType = {
  verificationStatus: VerificationStatus;
  setVerificationStatus: (status: VerificationStatus) => void;
  refreshVerificationStatus: () => Promise<void>;
};

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

export function VerificationProvider({ children }: { children: React.ReactNode }) {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('not_submitted');

  const refreshVerificationStatus = useCallback(async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) {
        setVerificationStatus('not_submitted');
        return;
      }
      const user = JSON.parse(userStr);
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/work/profile/${user.id}`);
      const result = await response.json();
      if (result.success && result.data) {
        const rawStatus = result.data.status;
        const normalizedStatus: VerificationStatus =
          rawStatus === 'pending' ? 'pending' :
          rawStatus === 'assigned' ? 'assigned' :
          rawStatus === 'verified' ? 'verified' :
          'not_submitted';
        setVerificationStatus(normalizedStatus);
      } else {
        setVerificationStatus('not_submitted');
      }
    } catch (error) {
      console.error('Verification status error:', error);
      setVerificationStatus('not_submitted');
    }
  }, []);

  // Load verification status on mount
  useEffect(() => {
    refreshVerificationStatus();
  }, [refreshVerificationStatus]);

  return (
    <VerificationContext.Provider
      value={{
        verificationStatus,
        setVerificationStatus,
        refreshVerificationStatus,
      }}
    >
      {children}
    </VerificationContext.Provider>
  );
}

export function useVerification() {
  const context = useContext(VerificationContext);
  if (context === undefined) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return context;
}
