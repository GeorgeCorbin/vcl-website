import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const availableLeagues = [
  { code: "MCLA", name: "Men's Collegiate Lacrosse Association", active: true },
  { code: "SMLL", name: "Southern Men's Lacrosse League", active: true },
  { code: "NCLL", name: "National College Lacrosse League", active: true },
  { code: "WCLL", name: "Western Collegiate Lacrosse League", active: true },
  { code: "OTHER", name: "Other Leagues", active: true },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your site settings and integrations.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>MCLA API Integration</CardTitle>
            <CardDescription>
              Connect to the MCLA API to automatically sync team and game data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-sm text-muted-foreground">
                  API integration not configured
                </p>
              </div>
              <Badge variant="secondary">Not Connected</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Site Information</CardTitle>
            <CardDescription>
              Basic information about your site.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Site Name</p>
              <p className="text-sm text-muted-foreground">VCL - Varsity Club Lacrosse</p>
            </div>
            <div>
              <p className="text-sm font-medium">Tagline</p>
              <p className="text-sm text-muted-foreground">Strictly Club. Strictly Business.</p>
            </div>
            <div>
              <p className="text-sm font-medium">Version</p>
              <p className="text-sm text-muted-foreground">1.0.0</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database</CardTitle>
            <CardDescription>
              Database connection and status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">PostgreSQL</p>
                <p className="text-sm text-muted-foreground">
                  Managed by Prisma ORM
                </p>
              </div>
              <Badge>Connected</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
