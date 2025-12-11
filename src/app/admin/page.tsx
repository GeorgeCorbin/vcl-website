import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, BarChart3, ArrowLeftRight, Users } from "lucide-react";
import Link from "next/link";

const stats = [
  {
    title: "Articles",
    value: "—",
    description: "Total articles",
    icon: FileText,
    href: "/admin/articles",
  },
  {
    title: "Media Polls",
    value: "—",
    description: "Published polls",
    icon: BarChart3,
    href: "/admin/polls",
  },
  {
    title: "Transfers",
    value: "—",
    description: "Confirmed transfers",
    icon: ArrowLeftRight,
    href: "/admin/transfers",
  },
  {
    title: "Teams",
    value: "—",
    description: "Active teams",
    icon: Users,
    href: "/admin/teams",
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Welcome to the VCL admin panel.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
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

      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <Card>
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

        <Card>
          <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <p className="text-sm text-muted-foreground">
              No recent activity to display.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
