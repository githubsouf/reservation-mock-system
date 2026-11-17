import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
  }
  const db = getDb();
  const totalRooms = (db.prepare('SELECT COUNT(*) as c FROM rooms').get() as { c: number }).c;
  const activeRooms = (db.prepare(`SELECT COUNT(*) as c FROM rooms WHERE status = 'active'`).get() as { c: number }).c;
  const totalReservations = (db.prepare('SELECT COUNT(*) as c FROM reservations').get() as { c: number }).c;
  const confirmedToday = (db.prepare(`
    SELECT COUNT(*) as c FROM reservations
    WHERE status = 'confirmed' AND date(start_at) = date('now')
  `).get() as { c: number }).c;
  const cancelled = (db.prepare(`SELECT COUNT(*) as c FROM reservations WHERE status = 'cancelled'`).get() as { c: number }).c;
  const totalUsers = (db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }).c;

  const topRooms = db.prepare(`
    SELECT r.name, COUNT(res.id) as count
    FROM rooms r
    LEFT JOIN reservations res ON res.room_id = r.id AND res.status = 'confirmed'
    GROUP BY r.id ORDER BY count DESC LIMIT 5
  `).all();

  return NextResponse.json({ totalRooms, activeRooms, totalReservations, confirmedToday, cancelled, totalUsers, topRooms });
}
