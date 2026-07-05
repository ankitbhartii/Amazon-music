'use client';

import React, { useState, FormEvent } from 'react';
import { 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Info
} from 'lucide-react';
import { authService, isMockMode, AuthUser } from '@/lib/supabaseClient';
import styles from './AuthForm.module.css';

interface AuthFormProps {
  onAuthSuccess: (user: AuthUser) => void;
}

type AuthMode = 'signin' | 'signup';

export default function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Simple validation checks
  const validateForm = () => {
    if (!email || !password) {
      setError('Please fill in all required fields.');
      return false;
    }
    
    // Email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }

    if (mode === 'signup') {
      if (!fullName) {
        setError('Please enter your full name.');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { user, message, error: signupError } = await authService.signUp(
          email,
          password,
          fullName
        );

        if (signupError) {
          setError(signupError.message);
        } else {
          setSuccess(message || 'Account created successfully!');
          if (user) {
            // Auto login after signup
            setTimeout(() => {
              onAuthSuccess(user);
            }, 1000);
          }
        }
      } else {
        const { user, error: loginError } = await authService.signIn(email, password);

        if (loginError) {
          setError(loginError.message);
        } else {
          setSuccess('Log in successful! Redirecting...');
          if (user) {
            setTimeout(() => {
              onAuthSuccess(user);
            }, 1000);
          }
        }
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialClick = async (provider: string) => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    const providerKey = provider.toLowerCase() as 'google' | 'apple' | 'amazon';
    
    try {
      const { error: oauthError } = await authService.signInWithOAuth(providerKey);
      if (oauthError) {
        setError(oauthError.message);
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'An unexpected error occurred during social login.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setSuccess(null);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        {/* Mock Mode Alert */}
        {isMockMode && (
          <div className={styles.mockBadge} title="Check environment variables in .env.local">
            <Info size={14} />
            <span>Mock Auth Mode Active</span>
          </div>
        )}

        <div className={styles.logoWrapper}>
          <h1 className={styles.logoText}>
            amazon <span className={styles.logoMusic}>music</span>
          </h1>
        </div>

        <div className={styles.tabGroup}>
          <button
            type="button"
            className={`${styles.tabButton} ${mode === 'signin' ? styles.tabButtonActive : ''}`}
            onClick={() => switchMode('signin')}
            disabled={loading}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`${styles.tabButton} ${mode === 'signup' ? styles.tabButtonActive : ''}`}
            onClick={() => switchMode('signup')}
            disabled={loading}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className={styles.errorBox}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className={styles.successBox}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} style={{ marginTop: error || success ? '16px' : '0' }}>
          {mode === 'signup' && (
            <div className={styles.inputGroup}>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={styles.inputField}
                placeholder=" "
                disabled={loading}
                required
              />
              <label htmlFor="fullName" className={styles.inputLabel}>
                Full Name
              </label>
            </div>
          )}

          <div className={styles.inputGroup}>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.inputField}
              placeholder=" "
              disabled={loading}
              required
            />
            <label htmlFor="email" className={styles.inputLabel}>
              Email address
            </label>
          </div>

          <div className={styles.passwordWrapper}>
            <div className={styles.inputGroup}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.inputField}
                placeholder=" "
                disabled={loading}
                required
              />
              <label htmlFor="password" className={styles.inputLabel}>
                Password
              </label>
            </div>
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={loading}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {mode === 'signup' && (
            <div className={styles.inputGroup}>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.inputField}
                placeholder=" "
                disabled={loading}
                required
              />
              <label htmlFor="confirmPassword" className={styles.inputLabel}>
                Confirm Password
              </label>
            </div>
          )}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <span className={styles.spinner} />
            ) : mode === 'signin' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className={styles.divider}>or</div>

        <div className={styles.socialGroup}>
          <button
            type="button"
            className={`${styles.socialBtn} ${styles.socialBtnAmazon}`}
            onClick={() => handleSocialClick('Amazon')}
            disabled={loading}
          >
            {/* Amazon Smile SVG */}
            <svg width="18" height="18" viewBox="0 0 256 256" style={{ fill: 'currentColor' }}>
              <path d="M117.8 190.8c-28.7-2-58.4 5.9-80.1 23-4.8 3.8-1 10.6 4.6 8.3 35.8-15 76.7-18.4 114-6.4 5.6 1.8 9.4-4 4.3-8.1-12.7-10-27-15.3-42.8-16.8zM245.5 198c-8.9-.7-19.1-1.3-30.8-.2-6.5.6-7.8 7-2 10 13.8 7.3 30.6 6.8 44.8 2.2 4.9-1.6 4.7-7.9-.5-9.3-3.7-1-7.8-2-11.5-2.7zm-26.6-43c2.7-8.9.2-16.4-7.4-22.3-5-3.8-11.5-1.5-10.2 4.4 2.8 12.3-8.8 24.6-21.7 27.2-1.3.3-2.6.4-3.9.4-11.1 0-21.2-8.3-23-20.2-2.3-15 7.7-29.2 22.8-31.5 5-.7 8-5.3 5.4-9.3-12.1-19-35.3-28.7-58.1-24.2-27.4 5.4-46.7 29.5-44.5 57.5 2.1 27.2 24.6 48.7 52.1 49.3h2c28.2 0 53-17.7 61.5-44.6.4-1.2 3.8 6.7 5.1 11.5 1 3.9 5.3 5.9 8.7 3.9a111 111 0 0 0 16.7-13c5.3-5 1.5-12.8-3-12.8z"/>
            </svg>
            <span>Continue with Amazon</span>
          </button>
          
          <button
            type="button"
            className={styles.socialBtn}
            onClick={() => handleSocialClick('Google')}
            disabled={loading}
          >
            {/* Google Logo SVG */}
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.7 12.3c0-.8-.1-1.7-.2-2.5H12v4.8h6.6c-.3 1.5-1.1 2.8-2.4 3.7v3.1h3.9c2.3-2.1 3.6-5.2 3.6-9.1z"/>
              <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3.1c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.2C3.3 21.4 7.4 24 12 24z"/>
              <path fill="#FBBC05" d="M5.3 14.2c-.2-.7-.4-1.5-.4-2.2s.2-1.5.4-2.2V6.6H1.3C.5 8.2 0 10 0 12s.5 3.8 1.3 5.4l4-3.2z"/>
              <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.3 2.6 1.3 6.6l4 3.2c.9-2.9 3.6-5 6.7-5z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
          
          <button
            type="button"
            className={styles.socialBtn}
            onClick={() => handleSocialClick('Apple')}
            disabled={loading}
          >
            {/* Apple Logo SVG */}
            <svg width="15" height="18" viewBox="0 0 170 200" style={{ fill: 'currentColor' }}>
              <path d="M150.4 105c-.3-26 21-38.6 22-39.3-12-17.6-30.7-20-37.4-20.5-16.1-1.6-31.5 9.5-39.7 9.5-8.2 0-21-9.3-34.6-9-17.9.3-34.4 10.4-43.6 26.4-18.7 32.4-4.8 80.3 13.3 106.5 8.9 12.8 19.3 27 33.1 26.5 13.3-.5 18.4-8.6 34.5-8.6 16.1 0 20.7 8.6 34.5 8.3 14.1-.3 23.2-13 31.8-25.7 10-14.6 14.1-28.7 14.3-29.5-.3-.1-27.6-10.6-27.9-42.3zm-24.1-68.5c7.3-8.9 12.2-21.2 10.8-33.5-10.5.4-23.2 7-30.8 15.9-6.7 7.7-12.6 20.2-11 32.2 11.7.9 23.7-5.7 31-14.6z"/>
            </svg>
            <span>Continue with Apple</span>
          </button>
        </div>

        <div className={styles.switchPrompt}>
          {mode === 'signin' ? (
            <>
              New to Amazon Music?
              <button
                type="button"
                className={styles.switchLink}
                onClick={() => switchMode('signup')}
                disabled={loading}
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?
              <button
                type="button"
                className={styles.switchLink}
                onClick={() => switchMode('signin')}
                disabled={loading}
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
