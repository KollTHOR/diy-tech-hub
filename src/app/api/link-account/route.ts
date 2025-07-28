import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { provider, providerAccountId } = await req.json();

    // Link the OAuth account to the existing user
    await prisma.account.create({
      data: {
        userId: session.user.id,
        type: "oauth",
        provider,
        providerAccountId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Account linking error:", error);
    return NextResponse.json(
      { error: "Failed to link account" },
      { status: 500 }
    );
  }
}
