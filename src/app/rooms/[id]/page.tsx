'use client';
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Room {
  id: number; name: string; building: string; floor: string;
  capacity: number; equipments: string; description: string; status: string;
}
interface Reservation { id: number; title: string; start_at: string; end_at: string; organizer_name: string; }

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [room, setRoom] = useState<Room | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [form, setForm] = useState({
    title: '',
    start_at: searchParams.get('start') || '',
    end_at: searchParams.get('end') || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/rooms/${id}`).then(r => r.json()).then(setRoom);
    fetch(`/api/reservations?room_id=${id}`).then(r => r.json()).then(d => setReservations(Array.isArray(d) ? d : []));
  }, [id]);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!session) { router.push('/login'); return; }
    setLoading(true); setError(''); setSuccess('');
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_id: Number(id), ...form }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Erreur lors de la réservation.');
    } else {
      setSuccess(`✅ Réservation confirmée ! Numéro #${data.id}`);
      fetch(`/api/reservations?room_id=${id}`).then(r => r.json()).then(d => setReservations(Array.isArray(d) ? d : []));
    }
    setLoading(false);
  }

  if (!room) return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-400">Chargement…</div>
    </>
  );

  const equips: string[] = (() => { try { return JSON.parse(room.equipments); } catch { return []; } })();

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/rooms" className="text-sm text-blue-600 hover:underline mb-4 inline-block">← Retour aux salles</Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left — room info */}
          <div className="lg:col-span-3 space-y-5">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl h-48 flex items-center justify-center text-7xl">🏛️</div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-3">
                <h1 className="text-xl font-bold text-gray-900">{room.name}</h1>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${room.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {room.status === 'active' ? 'Disponible' : 'Maintenance'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-1">📍 {room.building} · {room.floor}</p>
              <p className="text-sm text-gray-500 mb-3">👥 Jusqu'à {room.capacity} personnes</p>
              <p className="text-sm text-gray-600 mb-4">{room.description}</p>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Équipements</p>
                <div className="flex flex-wrap gap-2">
                  {equips.map(eq => (
                    <span key={eq} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-full">{eq}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Upcoming reservations */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Planning de la salle</h2>
              {reservations.length === 0 ? (
                <p className="text-sm text-gray-400">Aucune réservation à venir.</p>
              ) : (
                <div className="space-y-2">
                  {reservations.slice(0, 10).map(r => (
                    <div key={r.id} className="flex items-center gap-3 text-sm border border-gray-100 rounded-lg px-3 py-2 bg-gray-50">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                      <div className="flex-1">
                        <span className="font-medium text-gray-800">{r.title}</span>
                        <span className="text-gray-400 mx-2">·</span>
                        <span className="text-gray-500">{new Date(r.start_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })} → {new Date(r.end_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — booking form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-20">
              <h2 className="font-semibold text-gray-900 mb-5">Réserver cette salle</h2>
              {!session ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-3">Connectez-vous pour réserver</p>
                  <Link href="/login" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Se connecter</Link>
                </div>
              ) : success ? (
                <div className="text-center">
                  <p className="text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm mb-3">{success}</p>
                  <button onClick={() => { setSuccess(''); setForm({ title: '', start_at: '', end_at: '' }); }} className="text-sm text-blue-600 hover:underline">Faire une autre réservation</button>
                </div>
              ) : (
                <form onSubmit={handleBook} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Titre de la réunion</label>
                    <input
                      type="text" required
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Réunion équipe produit"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Début</label>
                    <input
                      type="datetime-local" required
                      value={form.start_at}
                      onChange={e => setForm(f => ({ ...f, start_at: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Fin</label>
                    <input
                      type="datetime-local" required
                      value={form.end_at}
                      onChange={e => setForm(f => ({ ...f, end_at: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading || room.status !== 'active'}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Réservation…' : 'Confirmer la réservation'}
                  </button>
                  <p className="text-xs text-gray-400 text-center">Durée : 15 min — 8 h · Annulation jusqu'à 30 min avant</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
