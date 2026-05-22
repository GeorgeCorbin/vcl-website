import { FileText, BarChart3, Users } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/db";
import { formatDistanceToNow } from "date-fns";
import { FEATURES } from "@/lib/feature-flags";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const showMediaPolls = FEATURES.MEDIA_POLLS;

  // Fetch stats in parallel
  const [articlesCount, publishedPollsCount, activeTeamsCount] = await Promise.all([
    prisma.article.count(),
    showMediaPolls ? prisma.pollWeek.count({ where: { status: "PUBLISHED" } }) : Promise.resolve(0),
    prisma.team.count({ where: { active: true } }),
  ]);

  // Fetch recent activity
  const [recentArticles, recentPolls] = await Promise.all([
    prisma.article.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        league: true,
      },
    }),
    showMediaPolls
      ? prisma.pollWeek.findMany({
          take: 3,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            weekNumber: true,
            season: true,
            league: true,
            status: true,
            createdAt: true,
          },
        })
      : Promise.resolve([]),
  ]);

  // Combine and sort all activities by date
  const allActivities = [
    ...recentArticles.map(a => ({ type: "article" as const, data: a, date: a.createdAt })),
    ...(showMediaPolls ? recentPolls.map(p => ({ type: "poll" as const, data: p, date: p.createdAt })) : []),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  const stats = [
    {
      title: "Articles",
      value: articlesCount.toString(),
      description: "Total articles",
      icon: FileText,
      href: "/admin/articles",
    },
    ...(showMediaPolls
      ? [{
          title: "Media Polls",
          value: publishedPollsCount.toString(),
          description: "Published polls",
          icon: BarChart3,
          href: "/admin/polls",
        }]
      : []),
    {
      title: "Teams",
      value: activeTeamsCount.toString(),
      description: "Active teams",
      icon: Users,
      href: "/admin/teams",
    },
  ];
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="border-b border-border pb-6">
        <h1 className="font-heading text-4xl tracking-wide text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome to the VCL admin panel.</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <div className="rounded-sm border border-border bg-card p-5 hover:border-vcl-gold/40 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">{stat.title}</span>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="font-heading text-4xl text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions + Recent activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <div className="rounded-sm border border-border bg-card p-6">
          <h2 className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase mb-5">Quick Actions</h2>
          <div className="flex flex-col gap-3">
            <Link
              href="/admin/articles/new"
              className="flex flex-col gap-1 rounded-sm border border-border p-4 hover:border-vcl-gold/40 hover:bg-accent transition-colors"
            >
              <span className="text-sm font-semibold text-foreground">Create New Article</span>
              <span className="text-xs text-muted-foreground">Write and publish a new article</span>
            </Link>
            {showMediaPolls && (
              <Link
                href="/admin/polls/new"
                className="flex flex-col gap-1 rounded-sm border border-border p-4 hover:border-vcl-gold/40 hover:bg-accent transition-colors"
              >
                <span className="text-sm font-semibold text-foreground">Create New Poll</span>
                <span className="text-xs text-muted-foreground">Set up a new weekly media poll</span>
              </Link>
            )}
            <Link
              href="/admin/ads"
              className="flex flex-col gap-1 rounded-sm border border-border p-4 hover:border-vcl-gold/40 hover:bg-accent transition-colors"
            >
              <span className="text-sm font-semibold text-foreground">Manage Ad Units</span>
              <span className="text-xs text-muted-foreground">Configure ad placements across the site</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-sm border border-border bg-card p-6">
          <h2 className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase mb-5">Recent Activity</h2>
          {allActivities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity to display.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {allActivities.map((activity, index) => (
                <div key={`${activity.type}-${index}`} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="mt-0.5 h-7 w-7 rounded-sm bg-accent flex items-center justify-center shrink-0">
                    {activity.type === "article" && <FileText className="h-3.5 w-3.5 text-muted-foreground" />}
                    {activity.type === "poll" && <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    {activity.type === "article" && (
                      <>
                        <Link href={`/admin/articles/${activity.data.id}`} className="text-sm font-medium text-foreground hover:text-vcl-gold transition-colors line-clamp-1">
                          {activity.data.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          {activity.data.league && (
                            <span className="rounded-sm bg-accent px-1.5 py-0.5 text-[10px] text-muted-foreground">{activity.data.league}</span>
                          )}
                          <span className={`rounded-sm px-1.5 py-0.5 text-[10px] font-semibold ${activity.data.status === "PUBLISHED" ? "bg-vcl-gold text-vcl-gold-foreground" : "bg-accent text-muted-foreground"}`}>
                            {activity.data.status}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {formatDistanceToNow(activity.data.createdAt, { addSuffix: true })}
                          </span>
                        </div>
                      </>
                    )}
                    {activity.type === "poll" && (
                      <>
                        <Link href={`/admin/polls/${activity.data.id}`} className="text-sm font-medium text-foreground hover:text-vcl-gold transition-colors">
                          {activity.data.league} · Week {activity.data.weekNumber} · {activity.data.season}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`rounded-sm px-1.5 py-0.5 text-[10px] font-semibold ${activity.data.status === "PUBLISHED" ? "bg-vcl-gold text-vcl-gold-foreground" : "bg-accent text-muted-foreground"}`}>
                            {activity.data.status}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {formatDistanceToNow(activity.data.createdAt, { addSuffix: true })}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
