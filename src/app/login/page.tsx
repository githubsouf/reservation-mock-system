'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await signIn('credentials', { ...form, redirect: false });
    if (res?.error) setError('Email ou mot de passe incorrect.');
    else router.push('/rooms');
    setLoading(false);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff' }}>S</div>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>SalleRésa</span>
          </Link>
        </div>

        {/* Card */}
        <div style={{ background: '#ffffff', borderRadius: 20, padding: '36px 36px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Bon retour 👋</h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 28px' }}>Connectez-vous à votre compte SalleRésa</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email</label>
              <input
                type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="vous@exemple.com"
                style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#0f172a' }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Mot de passe</label>
              <input
                type="password" required value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#0f172a' }}
              />
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 18 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', background: loading ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            }}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 14, color: '#64748b', margin: '20px 0 0' }}>
            Pas de compte ?{' '}
            <Link href="/register" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>S&apos;inscrire</Link>
          </p>

          <div style={{ marginTop: 20, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ fontSize: 12, color: '#166534', margin: 0, fontWeight: 500 }}>🔑 Compte démo admin</p>
            <p style={{ fontSize: 12, color: '#166534', margin: '2px 0 0' }}>admin@salle.app / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
