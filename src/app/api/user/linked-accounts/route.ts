import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { accounts: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const accounts = user.accounts.map((account) => ({
      provider: account.provider,
      linkedAt: account.createdAt || new Date(),
    }));

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error("Failed to fetch linked accounts:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
