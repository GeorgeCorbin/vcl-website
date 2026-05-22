
const availableLeagues = [
  { code: "MCLA", name: "Men's Collegiate Lacrosse Association", active: true },
  { code: "SMLL", name: "Southern Men's Lacrosse League", active: true },
  { code: "NCLL", name: "National College Lacrosse League", active: true },
  { code: "WCLL", name: "Western Collegiate Lacrosse League", active: true },
  { code: "OTHER", name: "Other Leagues", active: true },
];

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-6">
        <h1 className="font-heading text-4xl tracking-wide text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your site settings and integrations.</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* MCLA API */}
        <div className="rounded-sm border border-border bg-card p-6">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">MCLA API Integration</h2>
            <p className="text-xs text-muted-foreground mt-1">Connect to the MCLA API to automatically sync team and game data.</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Status</p>
              <p className="text-xs text-muted-foreground">API integration not configured</p>
            </div>
            <span className="rounded-sm border border-border px-2 py-0.5 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Not Connected</span>
          </div>
        </div>

        {/* Site Info */}
        <div className="rounded-sm border border-border bg-card p-6">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">Site Information</h2>
            <p className="text-xs text-muted-foreground mt-1">Basic information about your site.</p>
          </div>
          <div className="flex flex-col divide-y divide-border">
            {[
              { label: "Site Name", value: "VCL — Varsity Club Lacrosse" },
              { label: "Tagline", value: "Strictly Club. Strictly Business." },
              { label: "Version", value: "1.0.0" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <span className="text-xs text-muted-foreground">{row.label}</span>
                <span className="text-sm text-foreground">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Database */}
        <div className="rounded-sm border border-border bg-card p-6">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">Database</h2>
            <p className="text-xs text-muted-foreground mt-1">Database connection and status.</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">PostgreSQL</p>
              <p className="text-xs text-muted-foreground">Managed by Prisma ORM</p>
            </div>
            <span className="rounded-sm bg-vcl-gold px-2 py-0.5 text-[10px] font-bold tracking-widest text-vcl-gold-foreground uppercase">Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
