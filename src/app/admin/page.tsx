'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface Stats {
  totalRooms: number; activeRooms: number; totalReservations: number;
  confirmedToday: number; cancelled: number; totalUsers: number;
  topRooms: { name: string; count: number }[];
}
interface Room { id: number; name: string; building: string; floor: string; capacity: number; equipments: string; status: string; }
interface User { id: number; name: string; email: string; role: string; created_at: string; }

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<'stats' | 'rooms' | 'users'>('stats');
  const [stats, setStats] = useState<Stats | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', building: '', floor: '', capacity: '', description: '', status: 'active' });
  const [msg, setMsg] = useState('');

  const user = session?.user as { role?: string } | undefined;

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated' && user?.role !== 'admin') { router.push('/rooms'); return; }
    if (status === 'authenticated') {
      fetch('/api/stats').then(r => r.json()).then(setStats);
      fetch('/api/rooms').then(r => r.json()).then(d => setRooms(Array.isArray(d) ? d : []));
      fetch('/api/users').then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : []));
    }
  }, [status, user?.role, router]);

  async function toggleRoom(id: number, status: string) {
    await fetch(`/api/rooms/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: status === 'active' ? 'maintenance' : 'active' }),
    });
    setRooms(prev => prev.map(r => r.id === id ? { ...r, status: status === 'active' ? 'maintenance' : 'active' } : r));
  }

  async function changeRole(id: number, role: string) {
    await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role }),
    });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
  }

  async function addRoom(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newRoom, capacity: Number(newRoom.capacity), equipments: [] }),
    });
    if (res.ok) {
      setMsg('Salle ajoutée avec succès !');
      setShowAddRoom(false);
      setNewRoom({ name: '', building: '', floor: '', capacity: '', description: '', status: 'active' });
      fetch('/api/rooms').then(r => r.json()).then(d => setRooms(Array.isArray(d) ? d : []));
    }
  }

  if (status === 'loading') return (<><Navbar /><div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-400">Chargement…</div></>);

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Administration</h1>

        {msg && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2 text-sm">{msg}</div>}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {[['stats', '📊 Statistiques'], ['rooms', '🏛️ Salles'], ['users', '👤 Utilisateurs']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key as 'stats' | 'rooms' | 'users')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Stats Tab */}
        {tab === 'stats' && stats && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Total salles', value: stats.totalRooms, icon: '🏛️' },
                { label: 'Salles actives', value: stats.activeRooms, icon: '✅' },
                { label: 'Total réservations', value: stats.totalReservations, icon: '📅' },
                { label: "Réunions aujourd'hui", value: stats.confirmedToday, icon: '⏰' },
                { label: 'Annulations', value: stats.cancelled, icon: '❌' },
                { label: 'Utilisateurs', value: stats.totalUsers, icon: '👥' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Top 5 salles les plus réservées</h2>
              <div className="space-y-2">
                {stats.topRooms.map((r, i) => (
                  <div key={r.name} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-400 w-5">{i + 1}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${stats.topRooms[0]?.count ? (r.count / stats.topRooms[0].count) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-700 w-36 truncate">{r.name}</span>
                    <span className="text-sm font-semibold text-gray-500 w-10 text-right">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Rooms Tab */}
        {tab === 'rooms' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">{rooms.length} salle(s)</p>
              <button
                onClick={() => setShowAddRoom(!showAddRoom)}
                className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Ajouter une salle
              </button>
            </div>

            {showAddRoom && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-5">
                <h3 className="font-semibold text-gray-900 mb-4">Nouvelle salle</h3>
                <form onSubmit={addRoom} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    ['name', 'Nom', 'text', 'Salle Saturne'],
                    ['building', 'Bâtiment', 'text', 'Bâtiment A'],
                    ['floor', 'Étage', 'text', 'RDC'],
                    ['capacity', 'Capacité', 'number', '8'],
                    ['description', 'Description', 'text', 'Description…'],
                  ].map(([key, label, type, placeholder]) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                      <input
                        type={type}
                        required
                        placeholder={placeholder}
                        value={newRoom[key as keyof typeof newRoom]}
                        onChange={e => setNewRoom(f => ({ ...f, [key]: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                  <div className="sm:col-span-2 flex gap-2 mt-1">
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">Créer</button>
                    <button type="button" onClick={() => setShowAddRoom(false)} className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Annuler</button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-3">
              {rooms.map(room => (
                <div key={room.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                  <div className="text-2xl">🏛️</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{room.name}</p>
                    <p className="text-sm text-gray-500">{room.building} · {room.floor} · {room.capacity} pers.</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${room.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {room.status === 'active' ? 'Active' : 'Maintenance'}
                  </span>
                  <button
                    onClick={() => toggleRoom(room.id, room.status)}
                    className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {room.status === 'active' ? 'Mettre en maintenance' : 'Réactiver'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                <div className="text-2xl">👤</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{u.name}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                </div>
                <select
                  value={u.role}
                  onChange={e => changeRole(u.id, e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="employee">Employé</option>
                  <option value="organizer">Organisateur</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
