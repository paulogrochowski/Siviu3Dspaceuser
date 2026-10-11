import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { TripoAPIError, TripoClient, TripoTaskError } from '@vastai/tripo-sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

export async function POST(request: Request) {
  const apiKey = process.env.TRIPO_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          'TRIPO_API_KEY não configurada. Configure a chave do Tripo no ambiente do servidor para ativar a reconstrução real.',
        code: 'TRIPO_NOT_CONFIGURED',
      },
      { status: 503 },
    );
  }

  const origin = request.headers.get('origin');
  if (origin) {
    const requestUrl = new URL(request.url);
    // Next.js may use an internal hostname in request.url; Host is the address used by the browser.
    const expectedOrigin = `${requestUrl.protocol}//${request.headers.get('host') || requestUrl.host}`;
    let allowed = false;
    try {
      allowed = new URL(origin).origin === new URL(expectedOrigin).origin;
    } catch {
      allowed = false;
    }
    if (!allowed) {
      return NextResponse.json({ error: 'Origem não permitida.' }, { status: 403 });
    }
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Envie uma foto válida.' }, { status: 400 });
  }
  const file = formData.get('image');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Envie uma foto do ambiente.' }, { status: 400 });
  }

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return NextResponse.json(
      { error: 'Formato não suportado. Use JPG, PNG ou WebP.' },
      { status: 400 },
    );
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: 'A foto precisa ter no máximo 20 MB.' },
      { status: 400 },
    );
  }

  const geometryOnly = formData.get('geometryOnly') === 'true';
  const requiredCredits = geometryOnly ? 20 : 30;

  const client = new TripoClient({
    apiKey,
    baseUrl: 'https://openapi.tripo3d.ai/v3',
    timeoutMs: 60_000,
    retries: 2,
  });

  try {
    // Prevent creating a billable task that is known to exceed the available credits.
    const balanceInfo = await client.getBalance();
    const availableCredits = Number(balanceInfo.balance);
    if (Number.isFinite(availableCredits) && availableCredits < requiredCredits) {
      return NextResponse.json({
        error: `O Tripo tem ${availableCredits} créditos disponíveis, mas esta geração precisa de ${requiredCredits}. ${geometryOnly ? 'Créditos insuficientes até para o modo sem textura.' : 'Ative o modo de teste sem textura (20 créditos) ou recarregue a conta para gerar com textura.'}`,
        code: 'INSUFFICIENT_TRIPO_CREDITS',
        availableCredits,
        requiredCredits,
      }, { status: 402 });
    }

    const inputBuffer = await file.arrayBuffer();

    const uploaded = await client.uploadFile(inputBuffer, {
      filename: file.name || 'ambiente.png',
      contentType: file.type,
    });

    const taskId = await client.imageToModel({
      input: uploaded.file_token,
      model: 'v3.1-20260211',
      enable_image_autofix: true,
      texture: !geometryOnly,
      pbr: !geometryOnly,
      ...(geometryOnly ? {} : { texture_quality: 'standard' as const }),
      geometry_quality: 'standard',
      texture_alignment: 'original_image',
      auto_size: true,
      orientation: 'align_image',
    });

    const task = await client.waitForTask(taskId, {
      pollingIntervalMs: 2_000,
      timeoutMs: 5 * 60_000,
      throwOnFailure: true,
    });

    if (!task.output?.model_url) {
      return NextResponse.json(
        { error: 'O Tripo terminou a geração, mas não devolveu o modelo 3D.', taskId },
        { status: 424 },
      );
    }

    const downloaded = await client.downloadModel(task);

    if (!downloaded?.data) {
      return NextResponse.json(
        { error: 'O modelo 3D foi gerado, mas não foi possível baixá-lo.', taskId },
        { status: 424 },
      );
    }

    const modelBytes = Buffer.from(downloaded.data);
    if (modelBytes.length < 12 || modelBytes.toString('ascii', 0, 4) !== 'glTF' ||
        modelBytes.readUInt32LE(4) !== 2 || modelBytes.readUInt32LE(8) !== modelBytes.length) {
      return NextResponse.json({ error: 'O serviço devolveu um modelo 3D inválido.', taskId }, { status: 424 });
    }

    const outputDir = path.join(process.cwd(), 'public', 'generated', 'environments');
    await mkdir(outputDir, { recursive: true });

    const filename = `environment-${randomUUID()}.glb`;
    const outputPath = path.join(outputDir, filename);
    await writeFile(outputPath, Buffer.from(downloaded.data));

    return NextResponse.json({
      ok: true,
      taskId,
      status: task.status,
      progress: task.progress ?? 100,
      modelUrl: `/generated/environments/${filename}`,
      previewUrl: task.output.rendered_image_url ?? null,
      creditsConsumed: task.credits_consumed ?? null,
    });
  } catch (error) {
    if (error instanceof TripoAPIError && error.code === 2010) {
      return NextResponse.json({ error: 'Créditos insuficientes na conta Tripo. Tente o modo sem textura (20 créditos) ou consulte o saldo.', code: 'INSUFFICIENT_TRIPO_CREDITS' }, { status: 402 });
    }
    if (error instanceof TripoTaskError) {
      return NextResponse.json(
        {
          error: 'O Tripo não conseguiu reconstruir esse ambiente.',
          code: error.errorCode ?? 'TRIPO_TASK_FAILED',
          taskId: error.task?.task_id,
        },
        { status: 424 },
      );
    }

    return NextResponse.json({ error: 'Não foi possível concluir a reconstrução. Tente novamente mais tarde.', code: 'TRIPO_REQUEST_FAILED' }, { status: 424 });
  }
}
