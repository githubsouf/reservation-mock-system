import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
  }
  const db = getDb();
  const users = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC').all();
  return NextResponse.json(users);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
  }
  const { id, role } = await req.json();
  if (!id || !role) return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 });
  const db = getDb();
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
  return NextResponse.json({ ok: true });
}
