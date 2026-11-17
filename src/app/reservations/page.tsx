'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Reservation {
  id: number; title: string; start_at: string; end_at: string;
  status: string; room_name: string; building: string; floor: string;
}

export default function ReservationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const user = session?.user as { id?: string } | undefined;

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated' && user?.id) {
      fetch(`/api/reservations?user_id=${user.id}`)
        .then(r => r.json())
        .then(d => { setReservations(Array.isArray(d) ? d : []); setLoading(false); });
    }
  }, [status, user?.id, router]);

  async function cancel(id: number) {
    if (!confirm('Annuler cette réservation ?')) return;
    await fetch(`/api/reservations/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'cancelled' }) });
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));
  }

  const upcoming = reservations.filter(r => r.status === 'confirmed' && new Date(r.start_at) > new Date());
  const past = reservations.filter(r => r.status !== 'confirmed' || new Date(r.start_at) <= new Date());

  const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
    confirmed: { bg: '#f0fdf4', color: '#16a34a', label: 'Confirmée' },
    cancelled:  { bg: '#fef2f2', color: '#dc2626', label: 'Annulée' },
    no_show:    { bg: '#fefce8', color: '#ca8a04', label: 'No-show' },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Navbar />

      <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)', padding: '40px 24px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.5px' }}>Mes réservations</h1>
          <p style={{ fontSize: 15, color: '#94a3b8', margin: 0 }}>{reservations.length} réservation{reservations.length !== 1 ? 's' : ''} au total</p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Chargement…</div>
        ) : (
          <>
            {/* Upcoming */}
            <div style={{ marginBottom: 36 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                  À venir <span style={{ background: '#eff6ff', color: '#2563eb', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700, marginLeft: 8 }}>{upcoming.length}</span>
                </h2>
                <Link href="/rooms" style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>+ Réserver →</Link>
              </div>
              {upcoming.length === 0 ? (
                <div style={{ background: '#fff', border: '2px dashed #e2e8f0', borderRadius: 16, padding: '48px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
                  <p style={{ color: '#94a3b8', fontSize: 15, margin: '0 0 16px' }}>Aucune réservation à venir</p>
                  <Link href="/rooms" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: '#fff', padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, display: 'inline-block' }}>Réserver une salle</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {upcoming.map(r => <ReservationCard key={r.id} r={r} statusConfig={statusConfig} onCancel={cancel} showCancel />)}
                </div>
              )}
            </div>

            {/* Past */}
            {past.length > 0 && (
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px' }}>
                  Historique <span style={{ background: '#f1f5f9', color: '#64748b', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700, marginLeft: 8 }}>{past.length}</span>
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {past.map(r => <ReservationCard key={r.id} r={r} statusConfig={statusConfig} onCancel={cancel} showCancel={false} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ReservationCard({ r, statusConfig, onCancel, showCancel }: {
  r: Reservation;
  statusConfig: Record<string, { bg: string; color: string; label: string }>;
  onCancel: (id: number) => void;
  showCancel: boolean;
}) {
  const start = new Date(r.start_at);
  const end = new Date(r.end_at);
  const cfg = statusConfig[r.status] || statusConfig.no_show;
  const canCancel = showCancel && r.status === 'confirmed' && (start.getTime() - Date.now()) > 30 * 60 * 1000;

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      {/* Date column */}
      <div style={{ background: '#eff6ff', borderRadius: 12, padding: '12px 16px', textAlign: 'center', minWidth: 60, flexShrink: 0 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#2563eb', lineHeight: 1 }}>{start.getDate()}</div>
        <div style={{ fontSize: 11, color: '#60a5fa', textTransform: 'uppercase', fontWeight: 600 }}>{start.toLocaleString('fr-FR', { month: 'short' })}</div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</h3>
          <span style={{ background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, flexShrink: 0 }}>{cfg.label}</span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
          🏢 {r.room_name} · {r.building}
          <span style={{ margin: '0 8px', color: '#cbd5e1' }}>·</span>
          🕐 {start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} → {end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {canCancel && (
        <button onClick={() => onCancel(r.id)} style={{
          fontSize: 12, fontWeight: 600, color: '#dc2626', background: '#fef2f2',
          border: '1px solid #fecaca', padding: '7px 14px', borderRadius: 8, cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit',
        }}>Annuler</button>
      )}
    </div>
  );
}
