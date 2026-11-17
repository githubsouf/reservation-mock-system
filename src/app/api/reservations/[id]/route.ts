import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const { id } = await params;
  const db = getDb();
  const res = db.prepare(`
    SELECT res.*, r.name as room_name, r.building, r.floor, u.name as organizer_name
    FROM reservations res
    JOIN rooms r ON r.id = res.room_id
    JOIN users u ON u.id = res.organizer_id
    WHERE res.id = ?
  `).get(id);
  if (!res) return NextResponse.json({ error: 'Réservation introuvable.' }, { status: 404 });
  return NextResponse.json(res);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const { id } = await params;
  const db = getDb();
  const user = session.user as { id: string; role?: string };

  const existing = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id) as {
    organizer_id: number; status: string; start_at: string;
  } | undefined;
  if (!existing) return NextResponse.json({ error: 'Réservation introuvable.' }, { status: 404 });
  if (existing.organizer_id !== Number(user.id) && user.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
  }

  const body = await req.json();

  // Cancellation
  if (body.status === 'cancelled') {
    db.prepare(`UPDATE reservations SET status = 'cancelled' WHERE id = ?`).run(id);
    return NextResponse.json({ ok: true });
  }

  // Modification — check deadline (30 min before)
  const start = new Date(existing.start_at);
  const now = new Date();
  if ((start.getTime() - now.getTime()) < 30 * 60 * 1000) {
    return NextResponse.json({ error: 'Modification impossible moins de 30 min avant la réunion.' }, { status: 400 });
  }

  const { title, start_at, end_at, room_id } = body;
  const newStart = start_at || existing.start_at;
  const newEnd = end_at || (db.prepare('SELECT end_at FROM reservations WHERE id = ?').get(id) as { end_at: string }).end_at;
  const newRoom = room_id || (db.prepare('SELECT room_id FROM reservations WHERE id = ?').get(id) as { room_id: number }).room_id;

  const conflict = db.prepare(`
    SELECT id FROM reservations
    WHERE room_id = ? AND status = 'confirmed' AND start_at < ? AND end_at > ? AND id != ?
  `).get(newRoom, newEnd, newStart, id);
  if (conflict) return NextResponse.json({ error: 'Créneau non disponible.' }, { status: 409 });

  db.prepare(`
    UPDATE reservations SET title = COALESCE(?, title), start_at = ?, end_at = ?, room_id = ? WHERE id = ?
  `).run(title || null, newStart, newEnd, newRoom, id);
  return NextResponse.json({ ok: true });
}
