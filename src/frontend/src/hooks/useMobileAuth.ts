import { useState, useCallback, useRef, useEffect } from 'react';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

interface OTPSession {
  mobile: string;
  timestamp: number;
  otp?: string;
}

type ConnectionStatus = 'idle' | 'initializing' | 'authenticating' | 'connecting' | 'ready' | 'error';

export function useMobileAuth() {
  const { actor, isFetching: actorFetching } = useActor();
  const { login, identity, loginStatus, loginError } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [mobile, setMobile] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [lastAction, setLastAction] = useState<'generate' | 'verify' | null>(null);
  
  // Use refs to always access the latest values in async closures
  const actorRef = useRef(actor);
  const identityRef = useRef(identity);
  const loginStatusRef = useRef(loginStatus);
  const loginErrorRef = useRef(loginError);
  
  useEffect(() => {
    actorRef.current = actor;
  }, [actor]);

  useEffect(() => {
    identityRef.current = identity;
  }, [identity]);

  useEffect(() => {
    loginStatusRef.current = loginStatus;
  }, [loginStatus]);

  useEffect(() => {
    loginErrorRef.current = loginError;
  }, [loginError]);

  // Enhanced retry logic with exponential backoff
  const retryWithBackoff = async <T,>(
    fn: () => Promise<T>,
    maxRetries: number = 5,
    initialDelay: number = 500
  ): Promise<T> => {
    let lastError: any;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        // Wait before retry (except first attempt)
        if (i > 0) {
          const delay = initialDelay * Math.pow(2, i - 1);
          console.log(`Retry attempt ${i + 1}/${maxRetries} after ${delay}ms delay`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        const result = await fn();
        console.log(`Operation succeeded on attempt ${i + 1}`);
        return result;
      } catch (err: any) {
        lastError = err;
        console.log(`Attempt ${i + 1}/${maxRetries} failed:`, err?.message || err);
        
        // Don't retry on validation errors
        if (err?.message?.includes('Invalid') || err?.message?.includes('format')) {
          throw err;
        }
      }
    }
    
    throw lastError;
  };

  // Wait for actor to be available with timeout
  const waitForActor = async (timeoutMs: number = 15000): Promise<boolean> => {
    const startTime = Date.now();
    let attempts = 0;
    
    setConnectionStatus('connecting');
    
    while (!actorRef.current && (Date.now() - startTime) < timeoutMs) {
      attempts++;
      console.log(`Waiting for actor initialization... attempt ${attempts}`);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    const available = !!actorRef.current;
    console.log(`Actor availability check: ${available ? 'available' : 'unavailable'} after ${attempts} attempts`);
    
    if (available) {
      setConnectionStatus('ready');
    } else {
      setConnectionStatus('error');
    }
    
    return available;
  };

  // Ensure Internet Identity login before OTP operations
  const ensureAuthenticated = async (): Promise<boolean> => {
    console.log('Checking Internet Identity authentication...');
    
    // Check if already authenticated
    if (identityRef.current && !identityRef.current.getPrincipal().isAnonymous()) {
      console.log('Already authenticated with Internet Identity');
      return true;
    }

    // Check if login is in progress
    const currentStatus = loginStatusRef.current;
    if (currentStatus === 'logging-in') {
      console.log('Internet Identity login already in progress, waiting...');
      setConnectionStatus('authenticating');
      
      // Wait for login to complete (max 45 seconds)
      const startTime = Date.now();
      while (loginStatusRef.current === 'logging-in' && (Date.now() - startTime) < 45000) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if identity became available during wait
        if (identityRef.current && !identityRef.current.getPrincipal().isAnonymous()) {
          console.log('Internet Identity login completed successfully');
          setConnectionStatus('idle');
          return true;
        }
      }
      
      // After the loop, check final status using a fresh read
      const finalStatus = loginStatusRef.current;
      const finalIdentity = identityRef.current;
      
      if (finalIdentity && !finalIdentity.getPrincipal().isAnonymous()) {
        console.log('Internet Identity login completed successfully');
        setConnectionStatus('idle');
        return true;
      }
      
      if (finalStatus === 'loginError') {
        setConnectionStatus('idle');
        throw new Error('Internet Identity login failed. Please try again.');
      }
      
      setConnectionStatus('idle');
      throw new Error('Internet Identity login did not complete');
    }

    // Trigger Internet Identity login
    console.log('Triggering Internet Identity login...');
    setConnectionStatus('authenticating');
    
    try {
      // Call login() without awaiting (it doesn't return a promise)
      login();
      
      // Wait for authentication to complete by monitoring refs
      const startTime = Date.now();
      const maxWaitTime = 45000; // 45 seconds
      
      while ((Date.now() - startTime) < maxWaitTime) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Read current values
        const currentIdentity = identityRef.current;
        const currentLoginStatus = loginStatusRef.current;
        
        // Check if login succeeded
        if (currentIdentity && !currentIdentity.getPrincipal().isAnonymous()) {
          console.log('Internet Identity login successful');
          
          // Wait for actor to be re-initialized with authenticated identity
          setConnectionStatus('connecting');
          const actorReady = await waitForActor(15000);
          if (!actorReady) {
            setConnectionStatus('error');
            throw new Error('Connection failed after authentication. Please refresh and try again.');
          }
          
          setConnectionStatus('idle');
          return true;
        }
        
        // Check if login failed
        if (currentLoginStatus === 'loginError') {
          setConnectionStatus('idle');
          const errorMsg = loginErrorRef.current?.message || 'Authentication failed';
          if (errorMsg.includes('already authenticated')) {
            // Edge case: already authenticated but identity not yet available
            if (currentIdentity && !currentIdentity.getPrincipal().isAnonymous()) {
              return true;
            }
          }
          throw new Error('Internet Identity login failed. Please try again.');
        }
        
        // Check if user cancelled (status went back to idle without success)
        if (currentLoginStatus === 'idle' && (!currentIdentity || currentIdentity.getPrincipal().isAnonymous())) {
          setConnectionStatus('idle');
          throw new Error('Login was cancelled. Please try again.');
        }
      }
      
      setConnectionStatus('idle');
      throw new Error('Login timed out. Please try again.');
    } catch (err: any) {
      setConnectionStatus('idle');
      console.error('Internet Identity login error:', err);
      throw new Error(err.message || 'Please complete Internet Identity login to continue');
    }
  };

  // Send OTP with Internet Identity pre-check
  const sendOTP = useCallback(async (mobileNumber: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setGeneratedOtp(null);
    setLastAction('generate');
    setConnectionStatus('initializing');

    try {
      // Validate mobile number format
      const trimmed = mobileNumber.trim();
      if (trimmed.length !== 10 || !/^[6-9]\d{9}$/.test(trimmed)) {
        throw new Error('Please enter a valid 10-digit mobile number');
      }

      console.log('Starting OTP generation process for mobile:', trimmed);

      // CRITICAL: Ensure Internet Identity authentication first
      const isAuthenticated = await ensureAuthenticated();
      if (!isAuthenticated) {
        throw new Error('Authentication required. Please complete Internet Identity login.');
      }

      console.log('Internet Identity authenticated, proceeding with OTP generation...');

      // Wait for actor to be available with timeout
      const actorAvailable = await waitForActor(15000);
      
      if (!actorAvailable) {
        throw new Error('CONNECTION_TIMEOUT');
      }

      console.log('Actor is available, calling generateOtp...');

      // Call backend with enhanced retry logic
      const otpCode = await retryWithBackoff(
        async () => {
          if (!actorRef.current) {
            console.error('Actor became unavailable during retry');
            throw new Error('Backend connection lost');
          }
          
          console.log('Calling actor.generateOtp...');
          const result = await actorRef.current.generateOtp(trimmed);
          console.log('generateOtp result:', result);
          return result;
        },
        5,
        500
      );
      
      // Store OTP session with the generated OTP
      const session: OTPSession = {
        mobile: trimmed,
        timestamp: Date.now(),
        otp: otpCode,
      };
      localStorage.setItem('otp_session', JSON.stringify(session));
      
      // Log success
      console.log(`OTP generated successfully: ${otpCode}`);
      
      setMobile(trimmed);
      setGeneratedOtp(otpCode);
      setOtpSent(true);
      setIsLoading(false);
      setConnectionStatus('idle');
      return true;
    } catch (err: any) {
      console.error('Send OTP error:', err);
      
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      if (err?.message?.includes('Invalid') || err?.message?.includes('format')) {
        errorMessage = err.message;
      } else if (err?.message?.includes('Too many')) {
        errorMessage = err.message;
      } else if (err?.message?.includes('Authentication required') || err?.message?.includes('Internet Identity')) {
        errorMessage = err.message;
      } else if (err?.message?.includes('CONNECTION_TIMEOUT')) {
        errorMessage = 'Connection timed out. Please refresh the page and try again.';
      } else if (err?.message?.includes('Connection failed')) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsLoading(false);
      setConnectionStatus('idle');
      return false;
    }
  }, []);

  // Verify OTP
  const verifyOTP = useCallback(async (mobileNumber: string, otpCode: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setLastAction('verify');
    setConnectionStatus('connecting');

    try {
      const trimmed = mobileNumber.trim();
      
      if (otpCode.length !== 6 || !/^\d{6}$/.test(otpCode)) {
        throw new Error('Please enter a valid 6-digit OTP');
      }

      console.log('Starting OTP verification...');

      // Wait for actor to be available
      const actorAvailable = await waitForActor(15000);
      
      if (!actorAvailable) {
        throw new Error('CONNECTION_TIMEOUT');
      }

      console.log('Actor is available, calling verifyOtp...');

      // Call backend with retry logic
      const isValid = await retryWithBackoff(
        async () => {
          if (!actorRef.current) {
            throw new Error('Backend connection lost');
          }
          
          console.log('Calling actor.verifyOtp...');
          const result = await actorRef.current.verifyOtp(trimmed, otpCode);
          console.log('verifyOtp result:', result);
          return result;
        },
        5,
        500
      );

      if (isValid) {
        console.log('OTP verification successful');
        localStorage.setItem('verified_mobile', trimmed);
        
        // Invalidate queries to refresh session state and profile
        queryClient.invalidateQueries({ queryKey: ['sessionState'] });
        queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        
        setIsLoading(false);
        setConnectionStatus('idle');
        return true;
      } else {
        throw new Error('Invalid OTP. Please check and try again.');
      }
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      
      let errorMessage = 'Failed to verify OTP. Please try again.';
      
      if (err?.message?.includes('Invalid')) {
        errorMessage = err.message;
      } else if (err?.message?.includes('expired')) {
        errorMessage = 'OTP has expired. Please request a new one.';
      } else if (err?.message?.includes('CONNECTION_TIMEOUT')) {
        errorMessage = 'Connection timed out. Please refresh the page and try again.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
      setConnectionStatus('idle');
      return false;
    }
  }, [queryClient]);

  return {
    sendOTP,
    verifyOTP,
    isLoading,
    error,
    otpSent,
    mobile,
    generatedOtp,
    connectionStatus,
    lastAction,
  };
}
