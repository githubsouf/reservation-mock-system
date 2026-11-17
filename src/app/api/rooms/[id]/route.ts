import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(id);
  if (!room) return NextResponse.json({ error: 'Salle introuvable.' }, { status: 404 });
  return NextResponse.json(room);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  const db = getDb();
  const fields = Object.keys(body).filter(k => ['name','building','floor','capacity','equipments','description','photo_url','status'].includes(k));
  if (fields.length === 0) return NextResponse.json({ error: 'Rien à mettre à jour.' }, { status: 400 });
  const setClause = fields.map(f => `${f} = ?`).join(', ');
  const values = fields.map(f => f === 'equipments' ? JSON.stringify(body[f]) : body[f]);
  db.prepare(`UPDATE rooms SET ${setClause} WHERE id = ?`).run(...values, id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
  }
  const { id } = await params;
  const db = getDb();
  db.prepare('DELETE FROM rooms WHERE id = ?').run(id);
  return NextResponse.json({ ok: true });
}
