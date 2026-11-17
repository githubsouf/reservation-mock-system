'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const user = session?.user as { role?: string; name?: string } | undefined;

  const navLinks = [
    { href: '/rooms', label: 'Salles' },
    { href: '/reservations', label: 'Mes réservations' },
  ];
  if (user?.role === 'admin') navLinks.push({ href: '/admin', label: 'Administration' });

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-blue-600 text-lg tracking-tight">
          🏢 SalleRésa
        </Link>
        <div className="flex items-center gap-6">
          {session && navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors ${pathname.startsWith(l.href) ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              {l.label}
            </Link>
          ))}
          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 hidden sm:block">{user?.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors text-gray-700"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5">Connexion</Link>
              <Link href="/register" className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors">S&apos;inscrire</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
