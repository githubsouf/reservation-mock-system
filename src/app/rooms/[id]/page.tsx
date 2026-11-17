'use client';
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Room { id: number; name: string; building: string; floor: string; capacity: number; equipments: string; description: string; status: string; }
interface Reservation { id: number; title: string; start_at: string; end_at: string; organizer_name: string; }

const ROOM_COLORS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
];

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [room, setRoom] = useState<Room | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [form, setForm] = useState({ title: '', start_at: searchParams.get('start') || '', end_at: searchParams.get('end') || '' });
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
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_id: Number(id), ...form }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || 'Erreur.');
    else {
      setSuccess(`Réservation confirmée ! Numéro #${data.id}`);
      fetch(`/api/reservations?room_id=${id}`).then(r => r.json()).then(d => setReservations(Array.isArray(d) ? d : []));
    }
    setLoading(false);
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 10,
    padding: '11px 14px', fontSize: 14, outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit', color: '#0f172a',
  };

  const roomIdx = Number(id) % ROOM_COLORS.length;

  if (!room) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px', textAlign: 'center', color: '#94a3b8', fontSize: 16 }}>Chargement…</div>
    </div>
  );

  const equips: string[] = (() => { try { return JSON.parse(room.equipments); } catch { return []; } })();

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Navbar />

      {/* Hero banner */}
      <div style={{ height: 220, background: ROOM_COLORS[roomIdx], display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <span style={{ fontSize: 80 }}>🏛️</span>
        <Link href="/rooms" style={{
          position: 'absolute', top: 20, left: 24, textDecoration: 'none',
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
          color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
          padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500,
        }}>← Retour</Link>
        <div style={{
          position: 'absolute', bottom: 20, right: 24,
          background: room.status === 'active' ? 'rgba(22,163,74,0.9)' : 'rgba(234,88,12,0.9)',
          color: '#fff', borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 600,
        }}>
          {room.status === 'active' ? '✓ Disponible' : '⚠ Maintenance'}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28 }}>
        {/* Left column */}
        <div>
          {/* Room info card */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '28px', marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 12px', letterSpacing: '-0.5px' }}>{room.name}</h1>

            <div style={{ display: 'flex', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#64748b' }}>
                <span style={{ fontSize: 18 }}>📍</span>
                <span>{room.building} · {room.floor}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#64748b' }}>
                <span style={{ fontSize: 18 }}>👥</span>
                <span>Jusqu'à <strong style={{ color: '#0f172a' }}>{room.capacity}</strong> personnes</span>
              </div>
            </div>

            <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.7, margin: '0 0 20px' }}>{room.description}</p>

            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>Équipements</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {equips.map(eq => (
                  <span key={eq} style={{ fontSize: 13, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 20, padding: '5px 14px', fontWeight: 500 }}>
                    {eq}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>Planning de la salle</h2>
            {reservations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', fontSize: 14 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📅</div>
                Aucune réservation à venir — la salle est libre !
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {reservations.slice(0, 8).map(r => (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f8fafc', borderRadius: 10, padding: '12px 14px', border: '1px solid #f1f5f9' }}>
                    <div style={{ width: 10, height: 10, background: '#2563eb', borderRadius: '50%', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{r.title}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                        {new Date(r.start_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })} → {new Date(r.end_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column — booking */}
        <div>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '28px', position: 'sticky', top: 84, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 20px' }}>Réserver cette salle</h2>

            {!session ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
                <p style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>Connectez-vous pour réserver</p>
                <Link href="/login" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: '#fff', padding: '11px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, display: 'inline-block' }}>Se connecter</Link>
              </div>
            ) : success ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '14px', fontSize: 14, color: '#166534', marginBottom: 16 }}>
                  <strong>{success}</strong>
                </div>
                <button onClick={() => { setSuccess(''); setForm({ title: '', start_at: '', end_at: '' }); }} style={{ fontSize: 14, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>
                  Faire une autre réservation
                </button>
              </div>
            ) : (
              <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Titre de la réunion</label>
                  <input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Réunion équipe produit" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Début</label>
                  <input type="datetime-local" required value={form.start_at} onChange={e => setForm(f => ({ ...f, start_at: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Fin</label>
                  <input type="datetime-local" required value={form.end_at} onChange={e => setForm(f => ({ ...f, end_at: e.target.value }))} style={inputStyle} />
                </div>

                {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>{error}</div>}

                <button type="submit" disabled={loading || room.status !== 'active'} style={{
                  background: (loading || room.status !== 'active') ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  color: '#fff', border: 'none', borderRadius: 10, padding: '13px',
                  fontSize: 15, fontWeight: 700, cursor: (loading || room.status !== 'active') ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                }}>
                  {loading ? 'Réservation en cours…' : 'Confirmer la réservation'}
                </button>
                <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', margin: 0 }}>Durée 15 min — 8 h · Annulation jusqu'à 30 min avant</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
