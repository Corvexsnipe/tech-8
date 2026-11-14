import { randomBytes } from "node:crypto";
import { AppError, db } from "@/lib/db";
import { assertSameOrigin, owner, rateLimit } from "@/lib/security";
import { limitedBody } from "@/lib/validation";
import { MAX_UPLOAD, sanitizeImage } from "@/lib/uploads";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const business = await db().business.findUnique({ where: { id: (await context.params).id }, select: { disabledAt: true, logoData: true } });
    if (!business || business.disabledAt || !business.logoData) throw new AppError("Logo unavailable.", 404);
    return new Response(new Uint8Array(business.logoData), { headers: { "Content-Type": "image/webp", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
  } catch (error) {
    return Response.json({ error: "Logo unavailable." }, { status: error instanceof AppError ? error.status : 404 });
  }
}
export async function POST(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    const { user, business } = await owner((await context.params).id);
    await rateLimit("logo", user.id, 10, 3600);
    const image = await sanitizeImage(await limitedBody(request, MAX_UPLOAD));
    const storageKey = `${randomBytes(24).toString("hex")}.webp`;
    await db().$transaction(async tx => {
      await tx.business.update({ where: { id: business.id }, data: { logoKey: storageKey, logoSize: image.length, logoData: new Uint8Array(image) } });
      await tx.auditLog.create({ data: { actorId: user.id, action: "business-logo", targetId: business.id, detail: "Logo replaced with sanitized image." } });
    });
    return Response.json({ message: "Business logo updated." });
  } catch (error) {
    return Response.json({ error: error instanceof AppError ? error.message : "Logo could not be uploaded." }, { status: error instanceof AppError ? error.status : 500 });
  }
}
export async function DELETE(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    const { user, business } = await owner((await context.params).id);
    await db().$transaction(async tx => {
      await tx.business.update({ where: { id: business.id }, data: { logoKey: null, logoSize: null, logoData: null } });
      await tx.auditLog.create({ data: { actorId: user.id, action: "business-logo-remove", targetId: business.id, detail: "Logo removed." } });
    });
    return Response.json({ message: "Logo removed." });
  } catch (error) {
    return Response.json({ error: error instanceof AppError ? error.message : "Logo could not be removed." }, { status: error instanceof AppError ? error.status : 500 });
  }
}
