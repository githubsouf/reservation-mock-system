'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || 'Erreur lors de la création du compte.');
    else router.push('/login?registered=1');
    setLoading(false);
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 10,
    padding: '11px 14px', fontSize: 14, outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit', color: '#0f172a',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff' }}>S</div>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>SalleRésa</span>
          </Link>
        </div>

        <div style={{ background: '#ffffff', borderRadius: 20, padding: '36px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Créer un compte ✨</h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 28px' }}>Rejoignez SalleRésa et réservez vos salles</p>

          <form onSubmit={handleSubmit}>
            {[
              { key: 'name', label: 'Nom complet', type: 'text', placeholder: 'Prénom Nom' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'vous@exemple.com' },
              { key: 'password', label: 'Mot de passe', type: 'password', placeholder: 'Minimum 6 caractères' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key} style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
                <input
                  type={type} required minLength={key === 'password' ? 6 : undefined}
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  style={inputStyle}
                />
              </div>
            ))}

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 18 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', background: loading ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginTop: 6,
            }}>
              {loading ? 'Création…' : 'Créer mon compte'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 14, color: '#64748b', margin: '20px 0 0' }}>
            Déjà un compte ?{' '}
            <Link href="/login" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
