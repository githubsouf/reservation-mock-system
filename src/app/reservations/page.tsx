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
    await fetch(`/api/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    });
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));
  }

  const upcoming = reservations.filter(r => r.status === 'confirmed' && new Date(r.start_at) > new Date());
  const past = reservations.filter(r => r.status !== 'confirmed' || new Date(r.start_at) <= new Date());

  const statusBadge = (s: string) => {
    if (s === 'confirmed') return 'bg-green-100 text-green-700';
    if (s === 'cancelled') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-600';
  };
  const statusLabel = (s: string) => ({ confirmed: 'Confirmée', cancelled: 'Annulée', no_show: 'No-show' }[s] || s);

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes réservations</h1>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Chargement…</div>
        ) : (
          <>
            <Section title={`À venir (${upcoming.length})`}>
              {upcoming.length === 0 ? (
                <EmptyState msg="Aucune réservation à venir." cta />
              ) : upcoming.map(r => (
                <ReservationCard key={r.id} r={r} statusBadge={statusBadge} statusLabel={statusLabel} onCancel={cancel} showCancel />
              ))}
            </Section>

            <Section title={`Historique (${past.length})`}>
              {past.length === 0 ? (
                <EmptyState msg="Aucune réservation passée." />
              ) : past.map(r => (
                <ReservationCard key={r.id} r={r} statusBadge={statusBadge} statusLabel={statusLabel} onCancel={cancel} showCancel={false} />
              ))}
            </Section>
          </>
        )}
      </main>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function EmptyState({ msg, cta }: { msg: string; cta?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
      <p className="text-gray-400 text-sm mb-3">{msg}</p>
      {cta && <Link href="/rooms" className="text-blue-600 text-sm hover:underline">Réserver une salle →</Link>}
    </div>
  );
}

function ReservationCard({
  r, statusBadge, statusLabel, onCancel, showCancel,
}: {
  r: Reservation;
  statusBadge: (s: string) => string;
  statusLabel: (s: string) => string;
  onCancel: (id: number) => void;
  showCancel: boolean;
}) {
  const start = new Date(r.start_at);
  const end = new Date(r.end_at);
  const canCancel = showCancel && r.status === 'confirmed' && (start.getTime() - Date.now()) > 30 * 60 * 1000;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
      <div className="bg-blue-50 text-blue-600 rounded-lg p-3 text-xl flex-shrink-0">🏛️</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 truncate">{r.title}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusBadge(r.status)}`}>{statusLabel(r.status)}</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">🏢 {r.room_name} · {r.building} · {r.floor}</p>
        <p className="text-sm text-gray-500">
          📅 {start.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })} → {end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {canCancel && (
        <button
          onClick={() => onCancel(r.id)}
          className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
        >
          Annuler
        </button>
      )}
    </div>
  );
}
