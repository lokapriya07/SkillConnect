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
      const isVerified = await AsyncStorage.getItem('is_verified_worker');
      const hasRequested = await AsyncStorage.getItem('verification_requested');

      if (isVerified === 'true') {
        setVerificationStatus('verified');
      } else if (hasRequested === 'true') {
        setVerificationStatus('pending');
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
