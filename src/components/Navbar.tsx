'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const user = session?.user as { role?: string; name?: string } | undefined;
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: '/rooms', label: 'Salles' },
    { href: '/reservations', label: 'Mes réservations' },
  ];
  if (user?.role === 'admin') navLinks.push({ href: '/admin', label: 'Administration' });

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <nav style={{
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: '#fff',
          }}>S</div>
          <span style={{ fontWeight: 800, fontSize: 18, color: '#0f172a', letterSpacing: '-0.3px' }}>SalleRésa</span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {session && navLinks.map(l => (
            <Link key={l.href} href={l.href} style={{
              textDecoration: 'none',
              padding: '7px 14px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              color: isActive(l.href) ? '#2563eb' : '#64748b',
              background: isActive(l.href) ? '#eff6ff' : 'transparent',
              transition: 'all 0.15s',
            }}>{l.label}</Link>
          ))}

          {session ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 8 }}>
              <div style={{
                width: 34, height: 34, background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 13, fontWeight: 700,
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <button onClick={() => signOut({ callbackUrl: '/' })} style={{
                fontSize: 13, fontWeight: 500, color: '#64748b',
                background: '#f1f5f9', border: '1px solid #e2e8f0',
                padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
              }}>Déconnexion</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link href="/login" style={{
                textDecoration: 'none', fontSize: 14, fontWeight: 500, color: '#64748b',
                padding: '7px 14px', borderRadius: 8,
              }}>Connexion</Link>
              <Link href="/register" style={{
                textDecoration: 'none', fontSize: 14, fontWeight: 600, color: '#fff',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                padding: '8px 18px', borderRadius: 8,
              }}>S&apos;inscrire</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
