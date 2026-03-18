'use client';

import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthOptional } from '@/lib/auth-context';
import { api, User } from '@/lib/api';

const DEMO_EMAIL = 'demo@resonate.msp';
const DEMO_PASSWORD = 'demo';

const DEMO_USER: User = {
  id: 'demo',
  name: 'Demo User',
  email: DEMO_EMAIL,
  role: 'admin',
  initials: 'DU',
};

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuthOptional();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (auth) {
        await auth.login(email, password);
      } else {
        // Fallback: call the API directly when outside AuthProvider
        const { access_token } = await api.auth.login(email, password);
        localStorage.setItem('auth_token', access_token);
      }
      router.push('/');
    } catch {
      // Demo mode: if backend is unavailable, create a mock session
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        localStorage.setItem('auth_token', 'demo-token');
        // Inject a synthetic user into auth context when available
        if (auth) {
          // Trigger a re-mount by pushing the route; the token is now set
          // and AuthProvider will call /auth/me on next mount. Since backend
          // is down, we store the mock user directly via a custom key.
          localStorage.setItem('auth_mock_user', JSON.stringify(DEMO_USER));
        }
        router.push('/');
        return;
      }
      setError('Invalid email or password. Try Demo Mode to explore without a backend.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDemoMode() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: '#070D1A' }}
    >
      {/* Subtle radial glow behind the card */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 45%, rgba(0,212,170,0.07) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div
          className="rounded-2xl border px-8 py-10"
          style={{ backgroundColor: '#080E1C', borderColor: '#0F2040' }}
        >
          {/* Logo */}
          <div className="mb-2 text-center">
            <span
              className="text-2xl font-bold tracking-widest"
              style={{
                fontFamily: "'Space Mono', monospace",
                color: '#00D4AA',
                letterSpacing: '0.25em',
              }}
            >
              RESONATE
            </span>
          </div>

          {/* Tagline */}
          <p
            className="mb-8 text-center text-xs tracking-widest uppercase"
            style={{ color: '#334155', fontFamily: "'Space Mono', monospace" }}
          >
            MSP Operating System
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium"
                style={{ color: '#64748B' }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#00D4AA]"
                style={{
                  backgroundColor: '#070D1A',
                  borderColor: '#0F2040',
                  color: '#E2E8F0',
                }}
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-medium"
                style={{ color: '#64748B' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2.5 pr-10 text-sm outline-none transition-colors focus:border-[#00D4AA]"
                  style={{
                    backgroundColor: '#070D1A',
                    borderColor: '#0F2040',
                    color: '#E2E8F0',
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#475569' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p
                className="rounded-lg border px-3 py-2 text-xs"
                style={{
                  backgroundColor: 'rgba(239,68,68,0.08)',
                  borderColor: 'rgba(239,68,68,0.25)',
                  color: '#F87171',
                }}
              >
                {error}
              </p>
            )}

            {/* Sign In */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity disabled:opacity-60"
              style={{
                backgroundColor: '#00D4AA',
                color: '#070D1A',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1" style={{ backgroundColor: '#0F2040' }} />
            <span className="text-xs" style={{ color: '#334155' }}>
              or
            </span>
            <div className="h-px flex-1" style={{ backgroundColor: '#0F2040' }} />
          </div>

          {/* Demo Mode */}
          <button
            type="button"
            onClick={handleDemoMode}
            className="w-full rounded-lg border py-2.5 text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'transparent',
              borderColor: '#0F2040',
              color: '#64748B',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Demo Mode
          </button>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs" style={{ color: '#1E293B' }}>
          Resonate MSP Platform &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
