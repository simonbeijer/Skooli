/**
 * Inloggningskontroll för Grej of the Days API, samma som lektionsplanerarens:
 * JWT i cookien "token", kontrollerad med verifyAuth.
 */

import { NextResponse, type NextRequest } from "next/server";
import { verifyAuth } from "@/lib/auth";

/** Ger ett 401-svar om läraren inte är inloggad, annars null. */
export async function requireLogin(request: NextRequest): Promise<NextResponse | null> {
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Autentisering krävs för att använda denna tjänst" }, { status: 401 });
  }
  try {
    await verifyAuth(token);
    return null;
  } catch {
    return NextResponse.json({ error: "Ogiltig autentisering - logga in igen" }, { status: 401 });
  }
}
