import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('user_id');
  const roomId = searchParams.get('room_id');

  const db = getDb();
  const user = session.user as { id: string; role?: string };

  if (userId) {
    if (user.role !== 'admin' && user.id !== userId) {
      return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
    }
    const rows = db.prepare(`
      SELECT res.*, r.name as room_name, r.building, r.floor
      FROM reservations res
      JOIN rooms r ON r.id = res.room_id
      WHERE res.organizer_id = ?
      ORDER BY res.start_at DESC
    `).all(userId);
    return NextResponse.json(rows);
  }

  if (roomId) {
    const rows = db.prepare(`
      SELECT res.*, u.name as organizer_name
      FROM reservations res
      JOIN users u ON u.id = res.organizer_id
      WHERE res.room_id = ? AND res.status = 'confirmed'
      ORDER BY res.start_at ASC
    `).all(roomId);
    return NextResponse.json(rows);
  }

  if (user.role === 'admin') {
    const rows = db.prepare(`
      SELECT res.*, r.name as room_name, u.name as organizer_name
      FROM reservations res
      JOIN rooms r ON r.id = res.room_id
      JOIN users u ON u.id = res.organizer_id
      ORDER BY res.start_at DESC
    `).all();
    return NextResponse.json(rows);
  }

  return NextResponse.json({ error: 'Paramètre manquant.' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });

  try {
    const body = await req.json();
    const { room_id, title, start_at, end_at } = body;
    const user = session.user as { id: string };

    if (!room_id || !title || !start_at || !end_at) {
      return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 });
    }

    const start = new Date(start_at);
    const end = new Date(end_at);
    if (end <= start) return NextResponse.json({ error: 'La fin doit être après le début.' }, { status: 400 });
    const durationMin = (end.getTime() - start.getTime()) / 60000;
    if (durationMin < 15) return NextResponse.json({ error: 'Durée minimale : 15 minutes.' }, { status: 400 });
    if (durationMin > 480) return NextResponse.json({ error: 'Durée maximale : 8 heures.' }, { status: 400 });

    const db = getDb();

    // Check room exists and is active
    const room = db.prepare(`SELECT * FROM rooms WHERE id = ? AND status = 'active'`).get(room_id);
    if (!room) return NextResponse.json({ error: 'Salle non disponible.' }, { status: 400 });

    // Check for conflicts (transactional)
    const conflict = db.prepare(`
      SELECT id FROM reservations
      WHERE room_id = ? AND status = 'confirmed' AND start_at < ? AND end_at > ?
    `).get(room_id, end_at, start_at);
    if (conflict) return NextResponse.json({ error: 'Cette salle est déjà réservée sur ce créneau.' }, { status: 409 });

    const result = db.prepare(`
      INSERT INTO reservations (room_id, organizer_id, title, start_at, end_at, status)
      VALUES (?, ?, ?, ?, ?, 'confirmed')
    `).run(room_id, user.id, title, start_at, end_at);

    return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
