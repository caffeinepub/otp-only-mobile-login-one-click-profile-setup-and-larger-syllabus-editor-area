import { useState, useCallback, useRef, useEffect } from 'react';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

interface OTPSession {
  mobile: string;
  timestamp: number;
  otp?: string;
}

export function useMobileAuth() {
  const { actor } = useActor();
  const { login, identity, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [mobile, setMobile] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [isAwaitingII, setIsAwaitingII] = useState(false);
  const [lastAction, setLastAction] = useState<'generate' | 'verify' | null>(null);
  
  // Use ref to always access the latest actor
  const actorRef = useRef(actor);
  
  useEffect(() => {
    actorRef.current = actor;
  }, [actor]);

  // Enhanced retry logic with exponential backoff and connection health checks
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
  const waitForActor = async (timeoutMs: number = 10000): Promise<boolean> => {
    const startTime = Date.now();
    let attempts = 0;
    
    while (!actorRef.current && (Date.now() - startTime) < timeoutMs) {
      attempts++;
      console.log(`Waiting for actor initialization... attempt ${attempts}`);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    const available = !!actorRef.current;
    console.log(`Actor availability check: ${available ? 'available' : 'unavailable'} after ${attempts} attempts`);
    return available;
  };

  // Ensure Internet Identity login before OTP operations
  const ensureAuthenticated = async (): Promise<boolean> => {
    console.log('Checking Internet Identity authentication...');
    
    // Check if already authenticated
    if (identity && !identity.getPrincipal().isAnonymous()) {
      console.log('Already authenticated with Internet Identity');
      return true;
    }

    // Check if login is in progress
    if (loginStatus === 'logging-in') {
      console.log('Internet Identity login already in progress, waiting...');
      setIsAwaitingII(true);
      
      // Wait for login to complete (max 30 seconds)
      const startTime = Date.now();
      while (loginStatus === 'logging-in' && (Date.now() - startTime) < 30000) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setIsAwaitingII(false);
      
      if (identity && !identity.getPrincipal().isAnonymous()) {
        console.log('Internet Identity login completed successfully');
        return true;
      }
      
      throw new Error('Internet Identity login did not complete');
    }

    // Trigger Internet Identity login
    console.log('Triggering Internet Identity login...');
    setIsAwaitingII(true);
    
    try {
      await login();
      
      // Wait for identity to be established (max 30 seconds)
      const startTime = Date.now();
      while ((!identity || identity.getPrincipal().isAnonymous()) && (Date.now() - startTime) < 30000) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setIsAwaitingII(false);
      
      if (identity && !identity.getPrincipal().isAnonymous()) {
        console.log('Internet Identity login successful');
        
        // Wait for actor to be re-initialized with authenticated identity
        const actorReady = await waitForActor(10000);
        if (!actorReady) {
          throw new Error('Actor not available after authentication');
        }
        
        return true;
      }
      
      throw new Error('Failed to establish authenticated identity');
    } catch (err: any) {
      setIsAwaitingII(false);
      console.error('Internet Identity login error:', err);
      
      if (err.message === 'User is already authenticated') {
        // Handle edge case where user is already authenticated
        if (identity && !identity.getPrincipal().isAnonymous()) {
          return true;
        }
      }
      
      throw new Error('Please complete Internet Identity login to continue');
    }
  };

  // Send OTP with Internet Identity pre-check
  const sendOTP = useCallback(async (mobileNumber: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setGeneratedOtp(null);
    setLastAction('generate');

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
      const actorAvailable = await waitForActor(10000);
      
      if (!actorAvailable) {
        throw new Error('SERVICE_UNAVAILABLE');
      }

      console.log('Actor is available, calling generateOtp...');

      // Call backend with enhanced retry logic and connection health checks
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
      return true;
    } catch (err: any) {
      console.error('Send OTP error:', err);
      
      let errorMessage = 'Service temporarily unavailable. Please refresh the page and try again in a moment.';
      
      if (err?.message?.includes('Invalid') || err?.message?.includes('format')) {
        errorMessage = err.message;
      } else if (err?.message?.includes('Too many')) {
        errorMessage = err.message;
      } else if (err?.message?.includes('Authentication required')) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  }, [ensureAuthenticated, waitForActor, retryWithBackoff]);

  // Verify OTP
  const verifyOTP = useCallback(async (mobileNumber: string, otpCode: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setLastAction('verify');

    try {
      const trimmed = mobileNumber.trim();
      
      if (otpCode.length !== 6 || !/^\d{6}$/.test(otpCode)) {
        throw new Error('Please enter a valid 6-digit OTP');
      }

      console.log('Starting OTP verification...');

      // Wait for actor to be available
      const actorAvailable = await waitForActor(10000);
      
      if (!actorAvailable) {
        throw new Error('SERVICE_UNAVAILABLE');
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
        return true;
      } else {
        throw new Error('Invalid OTP. Please check and try again.');
      }
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      
      let errorMessage = 'Service temporarily unavailable. Please refresh the page and try again in a moment.';
      
      if (err?.message?.includes('Invalid')) {
        errorMessage = err.message;
      } else if (err?.message?.includes('expired')) {
        errorMessage = 'OTP has expired. Please request a new one.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  }, [waitForActor, retryWithBackoff, queryClient]);

  return {
    sendOTP,
    verifyOTP,
    isLoading,
    error,
    otpSent,
    mobile,
    generatedOtp,
    isAwaitingII,
    lastAction,
  };
}
