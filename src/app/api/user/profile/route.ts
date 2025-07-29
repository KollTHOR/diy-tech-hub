import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET - Fetch user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      // ✅ Remove 'include' and use only 'select'
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        website: true,
        location: true,
        password: true,
        createdAt: true,
        accounts: {
          select: {
            provider: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profile = {
      name: user.name,
      email: user.email,
      bio: user.bio,
      website: user.website,
      location: user.location,
      hasPassword: !!user.password,
      oauthProviders: user.accounts.map((acc) => acc.provider),
      createdAt: user.createdAt.toISOString(),
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { name, bio, website, location } = await req.json();

    // Validation
    if (name && name.length > 50) {
      return NextResponse.json(
        { error: "Name must be 50 characters or less" },
        { status: 400 }
      );
    }

    if (bio && bio.length > 500) {
      return NextResponse.json(
        { error: "Bio must be 500 characters or less" },
        { status: 400 }
      );
    }

    if (website && website.length > 200) {
      return NextResponse.json(
        { error: "Website must be 200 characters or less" },
        { status: 400 }
      );
    }

    if (location && location.length > 100) {
      return NextResponse.json(
        { error: "Location must be 100 characters or less" },
        { status: 400 }
      );
    }

    // URL validation for website
    if (website && website.trim()) {
      try {
        new URL(website);
      } catch {
        return NextResponse.json(
          { error: "Please enter a valid website URL" },
          { status: 400 }
        );
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name?.trim() || null,
        bio: bio?.trim() || null,
        website: website?.trim() || null,
        location: location?.trim() || null,
      },
      // ✅ Remove 'include' and use only 'select'
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        website: true,
        location: true,
        password: true,
        createdAt: true,
        accounts: {
          select: {
            provider: true,
          },
        },
      },
    });

    const profile = {
      name: updatedUser.name,
      email: updatedUser.email,
      bio: updatedUser.bio,
      website: updatedUser.website,
      location: updatedUser.location,
      hasPassword: !!updatedUser.password,
      oauthProviders: updatedUser.accounts.map((acc) => acc.provider),
      createdAt: updatedUser.createdAt.toISOString(),
    };

    return NextResponse.json({
      message: "Profile updated successfully",
      user: profile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
