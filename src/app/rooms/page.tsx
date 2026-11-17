'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Room {
  id: number; name: string; building: string; floor: string;
  capacity: number; equipments: string; description: string; status: string;
}

const EQUIPMENTS = ['Projecteur', 'Tableau blanc', 'Visio', 'TV 4K', 'Climatisation', 'Micro', 'Scène'];
const BUILDINGS = ['Bâtiment A', 'Bâtiment B', 'Bâtiment C'];

const ROOM_COLORS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
];

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ start_at: '', end_at: '', capacity: '', building: '', equipment: '' });

  const search = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    const res = await fetch(`/api/rooms?${params}`);
    const data = await res.json();
    setRooms(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [filters]);

  useEffect(() => { search(); }, [search]);

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 10,
    padding: '10px 14px', fontSize: 13, outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit', color: '#0f172a', background: '#fff',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Navbar />

      {/* Page header */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)', padding: '40px 24px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#ffffff', margin: '0 0 8px', letterSpacing: '-0.5px' }}>Trouver une salle</h1>
          <p style={{ fontSize: 15, color: '#94a3b8', margin: 0 }}>Recherchez parmi {rooms.length} salle{rooms.length !== 1 ? 's' : ''} disponible{rooms.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        {/* Filters */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '24px', marginBottom: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Début</label>
              <input type="datetime-local" value={filters.start_at} onChange={e => setFilters(f => ({ ...f, start_at: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fin</label>
              <input type="datetime-local" value={filters.end_at} onChange={e => setFilters(f => ({ ...f, end_at: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Capacité min.</label>
              <select value={filters.capacity} onChange={e => setFilters(f => ({ ...f, capacity: e.target.value }))} style={inputStyle}>
                <option value="">Toutes</option>
                {[2, 4, 6, 8, 10, 15, 20].map(n => <option key={n} value={n}>{n}+ personnes</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bâtiment</label>
              <select value={filters.building} onChange={e => setFilters(f => ({ ...f, building: e.target.value }))} style={inputStyle}>
                <option value="">Tous</option>
                {BUILDINGS.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Équipement</label>
              <select value={filters.equipment} onChange={e => setFilters(f => ({ ...f, equipment: e.target.value }))} style={inputStyle}>
                <option value="">Tous</option>
                {EQUIPMENTS.map(eq => <option key={eq}>{eq}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button onClick={() => setFilters({ start_at: '', end_at: '', capacity: '', building: '', equipment: '' })} style={{
                width: '100%', border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#64748b',
                borderRadius: 10, padding: '10px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
              }}>↺ Réinitialiser</button>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ height: 160, background: '#f1f5f9' }} />
                <div style={{ padding: 20 }}>
                  <div style={{ height: 20, background: '#f1f5f9', borderRadius: 6, marginBottom: 10, width: '70%' }} />
                  <div style={{ height: 14, background: '#f1f5f9', borderRadius: 6, marginBottom: 8 }} />
                  <div style={{ height: 14, background: '#f1f5f9', borderRadius: 6, width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>Aucune salle disponible</h3>
            <p style={{ color: '#64748b', fontSize: 15 }}>Essayez d'autres critères ou un créneau différent.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {rooms.map((room, idx) => {
              const equips: string[] = (() => { try { return JSON.parse(room.equipments); } catch { return []; } })();
              return (
                <div key={room.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                  {/* Room image placeholder */}
                  <div style={{ height: 160, background: ROOM_COLORS[idx % ROOM_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <span style={{ fontSize: 56 }}>🏛️</span>
                    <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 600, color: '#16a34a' }}>
                      ✓ Libre
                    </div>
                  </div>

                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.3 }}>{room.name}</h3>
                    </div>

                    <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                      <span style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                        📍 {room.building}
                      </span>
                      <span style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                        👥 {room.capacity} pers.
                      </span>
                    </div>

                    <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, margin: '0 0 14px', flex: 1 }}>{room.description}</p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                      {equips.slice(0, 3).map(eq => (
                        <span key={eq} style={{ fontSize: 11, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 20, padding: '3px 10px', fontWeight: 500 }}>{eq}</span>
                      ))}
                      {equips.length > 3 && <span style={{ fontSize: 11, color: '#94a3b8', padding: '3px 6px' }}>+{equips.length - 3}</span>}
                    </div>

                    <Link
                      href={`/rooms/${room.id}${filters.start_at ? `?start=${filters.start_at}&end=${filters.end_at}` : ''}`}
                      style={{
                        textDecoration: 'none', display: 'block', textAlign: 'center',
                        background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: '#fff',
                        padding: '11px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                      }}
                    >
                      Voir &amp; Réserver →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
