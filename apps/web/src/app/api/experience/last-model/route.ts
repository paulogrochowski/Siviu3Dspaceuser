import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FILENAME = /^environment-[0-9a-f-]{36}\.glb$/i;

export async function GET() {
  const folder = path.join(process.cwd(), 'public', 'generated', 'environments');
  try {
    const names = (await readdir(folder)).filter((filename) => FILENAME.test(filename));
    const entries = await Promise.all(names.map(async (name) => {
      const info = await stat(path.join(folder, name));
      return { name, size: info.size, modifiedAt: info.mtimeMs, isFile: info.isFile() };
    }));
    const latest = entries
      .filter((entry) => entry.isFile && entry.size > 12)
      .sort((a, b) => b.modifiedAt - a.modifiedAt)[0];
    if (!latest) {
      return NextResponse.json({ error: 'Ainda não existe um modelo GLB anterior para visualizar.' }, { status: 404 });
    }
    return NextResponse.json({
      modelUrl: '/generated/environments/' + latest.name,
      bytes: latest.size,
      savedAt: new Date(latest.modifiedAt).toISOString(),
      demo: true,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Não foi possível localizar um modelo GLB salvo.' }, { status: 404 });
  }
}
