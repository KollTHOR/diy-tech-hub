import { prisma } from "@/lib/db";
import { ProgressPostCard } from "@/components/progress-post-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const revalidate = 60; // ISR every minute

export default async function HomePage() {
  /* --- Fetch --- */
  const [posts, tags, popular] = await Promise.all([
    prisma.progressPost.findMany({
      where: { project: { isPublished: true } },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, image: true } },
        project: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            progress: true,
            tags: { include: { tag: true } },
          },
        },
        // Include comment count
        _count: {
          select: { comments: true },
        },
      },
    }),

    prisma.tag.findMany({
      take: 15,
      orderBy: { projects: { _count: "desc" } },
    }),

    prisma.project.findMany({
      where: { isPublished: true },
      take: 5,
      orderBy: { progressPosts: { _count: "desc" } },
      select: { id: true, title: true },
    }),
  ]);

  /* --- Layout --- */
  return (
    <div className="container mx-auto flex flex-col lg:flex-row gap-8 py-8">
      {/* Feed */}
      <main className="flex-1 space-y-6">
        {posts.map((post) => (
          <ProgressPostCard key={post.id} post={post} />
        ))}
      </main>

      {/* Sidebar */}
      <aside className="w-full lg:w-72 space-y-6">
        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top Tags</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t.id}
                className="text-xs px-2 py-1 rounded-md border"
                style={{ background: t.color ?? undefined }}
              >
                {t.name}
              </span>
            ))}
          </CardContent>
        </Card>

        {/* Popular Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Popular Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {popular.map((p) => (
              <a
                key={p.id}
                href={`/projects/${p.id}`}
                className="block text-sm underline hover:no-underline"
              >
                {p.title}
              </a>
            ))}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
