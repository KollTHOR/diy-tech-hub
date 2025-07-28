import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { accounts: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hasPassword = !!user.password;
    const oauthProviders = user.accounts.map((acc) => acc.provider);

    return NextResponse.json({
      email: user.email,
      hasPassword,
      oauthProviders,
    });
  } catch (error) {
    console.error("Check user auth methods error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
