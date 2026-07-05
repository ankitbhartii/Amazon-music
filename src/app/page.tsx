'use client';

import React, { useState, useEffect } from 'react';
import AuthForm from '@/components/AuthForm';
import Dashboard from '@/components/Dashboard';
import { authService, AuthUser } from '@/lib/supabaseClient';

export default function Home() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check persistent session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Error fetching persistent session:', err);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const handleAuthSuccess = (authenticatedUser: AuthUser) => {
    setUser(authenticatedUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100vw',
          height: '100vh',
          backgroundColor: '#07080a',
          color: '#ffffff',
          gap: '20px',
          fontFamily: 'system-ui, sans-serif'
        }}
      >
        <div 
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(0, 210, 243, 0.1)',
            borderTopColor: '#00d2f3',
            borderRadius: '50%',
            animation: 'spin-loading 0.8s linear infinite',
            boxShadow: '0 0 15px rgba(0, 210, 243, 0.2)'
          }}
        />
        <span style={{ fontSize: '0.9rem', color: '#8e9cae', fontWeight: 500, letterSpacing: '0.05em' }}>
          LOADING AMAZON MUSIC...
        </span>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin-loading {
            to { transform: rotate(360deg); }
          }
        `}} />
      </div>
    );
  }

  return (
    <>
      {!user ? (
        <AuthForm onAuthSuccess={handleAuthSuccess} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </>
  );
}
