import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, BarChart3, ArrowLeftRight, Users } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/db";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // Fetch stats in parallel
  const [articlesCount, publishedPollsCount, confirmedTransfersCount, activeTeamsCount] = await Promise.all([
    prisma.article.count(),
    prisma.pollWeek.count({ where: { status: "PUBLISHED" } }),
    prisma.transfer.count({ where: { confirmed: true } }),
    prisma.team.count({ where: { active: true } }),
  ]);

  // Fetch recent activity
  const [recentArticles, recentPolls, recentTransfers] = await Promise.all([
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
    prisma.pollWeek.findMany({
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
    }),
    prisma.transfer.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        playerName: true,
        fromTeam: true,
        toTeam: true,
        confirmed: true,
        createdAt: true,
      },
    }),
  ]);

  // Combine and sort all activities by date
  const allActivities = [
    ...recentArticles.map(a => ({ type: "article" as const, data: a, date: a.createdAt })),
    ...recentPolls.map(p => ({ type: "poll" as const, data: p, date: p.createdAt })),
    ...recentTransfers.map(t => ({ type: "transfer" as const, data: t, date: t.createdAt })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  const stats = [
    {
      title: "Articles",
      value: articlesCount.toString(),
      description: "Total articles",
      icon: FileText,
      href: "/admin/articles",
    },
    {
      title: "Media Polls",
      value: publishedPollsCount.toString(),
      description: "Published polls",
      icon: BarChart3,
      href: "/admin/polls",
    },
    {
      title: "Transfers",
      value: confirmedTransfersCount.toString(),
      description: "Confirmed transfers",
      icon: ArrowLeftRight,
      href: "/admin/transfers",
    },
    {
      title: "Teams",
      value: activeTeamsCount.toString(),
      description: "Active teams",
      icon: Users,
      href: "/admin/teams",
    },
  ];
  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Welcome to the VCL admin panel.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 auto-rows-fr">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2 auto-rows-fr">
        <Card className="h-full">
          <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 space-y-3">
            <Link
              href="/admin/articles/new"
              className="block p-3 rounded-lg border border-border/50 hover:bg-accent hover:border-vcl-gold/50 transition-colors"
            >
              <div className="font-medium text-sm md:text-base">Create New Article</div>
              <div className="text-xs md:text-sm text-muted-foreground">
                Write and publish a new article
              </div>
            </Link>
            <Link
              href="/admin/polls/new"
              className="block p-3 rounded-lg border border-border/50 hover:bg-accent hover:border-vcl-gold/50 transition-colors"
            >
              <div className="font-medium text-sm md:text-base">Create New Poll</div>
              <div className="text-xs md:text-sm text-muted-foreground">
                Set up a new weekly media poll
              </div>
            </Link>
            <Link
              href="/admin/transfers/new"
              className="block p-3 rounded-lg border border-border/50 hover:bg-accent hover:border-vcl-gold/50 transition-colors"
            >
              <div className="font-medium text-sm md:text-base">Add Transfer</div>
              <div className="text-xs md:text-sm text-muted-foreground">
                Record a new player transfer
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            {allActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent activity to display.
              </p>
            ) : (
              <div className="space-y-3">
                {allActivities.map((activity, index) => (
                  <div key={`${activity.type}-${index}`} className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5">
                      {activity.type === "article" && <FileText className="h-4 w-4 text-muted-foreground" />}
                      {activity.type === "poll" && <BarChart3 className="h-4 w-4 text-muted-foreground" />}
                      {activity.type === "transfer" && <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      {activity.type === "article" && (
                        <>
                          <Link href={`/admin/articles/${activity.data.id}`} className="font-medium hover:underline line-clamp-1">
                            {activity.data.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{activity.data.league}</Badge>
                            <Badge variant={activity.data.status === "PUBLISHED" ? "default" : "secondary"} className="text-xs">
                              {activity.data.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(activity.data.createdAt, { addSuffix: true })}
                            </span>
                          </div>
                        </>
                      )}
                      {activity.type === "poll" && (
                        <>
                          <Link href={`/admin/polls/${activity.data.id}`} className="font-medium hover:underline">
                            {activity.data.league} Week {activity.data.weekNumber} - {activity.data.season}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={activity.data.status === "PUBLISHED" ? "default" : "secondary"} className="text-xs">
                              {activity.data.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(activity.data.createdAt, { addSuffix: true })}
                            </span>
                          </div>
                        </>
                      )}
                      {activity.type === "transfer" && (
                        <>
                          <Link href={`/admin/transfers`} className="font-medium hover:underline line-clamp-1">
                            {activity.data.playerName}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {activity.data.fromTeam?.name ?? "Free Agent"} → {activity.data.toTeam?.name ?? "TBD"}
                            </span>
                            {activity.data.confirmed && (
                              <Badge variant="default" className="text-xs">Confirmed</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
