import { NextResponse } from "next/server";

import { getAuthenticatedAdmin } from "@/lib/auth/admin-session";

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    mustChangePassword: admin.mustChangePassword,
    user: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
}
