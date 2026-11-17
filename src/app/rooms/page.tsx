'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Room {
  id: number; name: string; building: string; floor: string;
  capacity: number; equipments: string; description: string; status: string;
}

const EQUIPMENTS = ['Projecteur', 'Tableau blanc', 'Visio', 'TV 4K', 'Climatisation', 'Micro', 'Scène'];

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    start_at: '', end_at: '', capacity: '', building: '', equipment: '',
  });

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

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Trouver une salle</h1>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date &amp; heure de début</label>
              <input
                type="datetime-local"
                value={filters.start_at}
                onChange={e => setFilters(f => ({ ...f, start_at: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date &amp; heure de fin</label>
              <input
                type="datetime-local"
                value={filters.end_at}
                onChange={e => setFilters(f => ({ ...f, end_at: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Capacité minimale</label>
              <select
                value={filters.capacity}
                onChange={e => setFilters(f => ({ ...f, capacity: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes</option>
                {[2, 4, 6, 8, 10, 15, 20].map(n => <option key={n} value={n}>{n}+ personnes</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Bâtiment</label>
              <select
                value={filters.building}
                onChange={e => setFilters(f => ({ ...f, building: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les bâtiments</option>
                {['Bâtiment A', 'Bâtiment B', 'Bâtiment C'].map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Équipement</label>
              <select
                value={filters.equipment}
                onChange={e => setFilters(f => ({ ...f, equipment: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous</option>
                {EQUIPMENTS.map(eq => <option key={eq}>{eq}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ start_at: '', end_at: '', capacity: '', building: '', equipment: '' })}
                className="w-full border border-gray-300 text-gray-600 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Chargement…</div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-gray-500">Aucune salle disponible pour ces critères.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rooms.map(room => {
              const equips: string[] = (() => { try { return JSON.parse(room.equipments); } catch { return []; } })();
              return (
                <div key={room.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 h-32 flex items-center justify-center text-5xl">🏛️</div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{room.name}</h3>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Disponible</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">📍 {room.building} · {room.floor}</p>
                    <p className="text-xs text-gray-500 mb-3">👥 {room.capacity} personnes</p>
                    <p className="text-xs text-gray-400 mb-3 flex-1">{room.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {equips.slice(0, 3).map(eq => (
                        <span key={eq} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{eq}</span>
                      ))}
                      {equips.length > 3 && <span className="text-xs text-gray-400">+{equips.length - 3}</span>}
                    </div>
                    <Link
                      href={`/rooms/${room.id}${filters.start_at ? `?start=${filters.start_at}&end=${filters.end_at}` : ''}`}
                      className="block text-center bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Voir &amp; Réserver
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
