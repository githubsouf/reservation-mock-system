import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const startAt = searchParams.get('start_at');
  const endAt = searchParams.get('end_at');
  const capacity = searchParams.get('capacity');
  const building = searchParams.get('building');
  const equipment = searchParams.get('equipment');

  const db = getDb();

  let query = `
    SELECT r.*
    FROM rooms r
    WHERE r.status = 'active'
  `;
  const params: (string | number)[] = [];

  if (capacity) {
    query += ` AND r.capacity >= ?`;
    params.push(Number(capacity));
  }
  if (building) {
    query += ` AND r.building = ?`;
    params.push(building);
  }
  if (equipment) {
    query += ` AND r.equipments LIKE ?`;
    params.push(`%${equipment}%`);
  }
  if (startAt && endAt) {
    query += `
      AND r.id NOT IN (
        SELECT res.room_id FROM reservations res
        WHERE res.status = 'confirmed'
          AND res.start_at < ? AND res.end_at > ?
      )
    `;
    params.push(endAt, startAt);
  }

  query += ` ORDER BY r.capacity ASC`;

  const rooms = db.prepare(query).all(...params);
  return NextResponse.json(rooms);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { name, building, floor, capacity, equipments, description, photo_url, status } = body;
    if (!name || !building || !floor || !capacity) {
      return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 });
    }
    const db = getDb();
    const result = db.prepare(`
      INSERT INTO rooms (name, building, floor, capacity, equipments, description, photo_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, building, floor, capacity, JSON.stringify(equipments || []), description || '', photo_url || null, status || 'active');
    return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
