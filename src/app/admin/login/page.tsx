"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import Image from "next/image";

const DEV_ADMIN_EMAIL = "a@a";
const DEV_ADMIN_PASSWORD = "a";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // TODO: Replace with actual authentication
    // For now, using a simple check - replace with NextAuth or similar
    if (email === DEV_ADMIN_EMAIL && password === DEV_ADMIN_PASSWORD) {
      // Set a simple session cookie (replace with proper auth)
      document.cookie = "vcl_admin_session=authenticated; path=/; max-age=86400";
      router.push("/admin");
    } else {
      setError("Invalid email or password");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-muted/30 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/vcl_logo3.png"
              alt="Varsity Club Lacrosse"
              width={64}
              height={64}
              className="h-16 w-auto"
            />
          </div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Sign in to access the VCL admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@vcl.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="button" variant="outline" className="flex-1" asChild>
                <Link href="/">Back to Site</Link>
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  "Signing in..."
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </div>
          </form>
          <p className="mt-4 text-xs text-center text-muted-foreground">
            Contact an administrator if you need access.
          </p>
        </CardContent>
      </Card>

      {process.env.NODE_ENV === "development" && (
        <div className="w-full max-w-md rounded-lg border border-dashed border-amber-500/50 bg-amber-500/5 px-4 py-3 text-sm">
          <p className="font-semibold text-amber-700 dark:text-amber-400">Test admin (dev only)</p>
          <dl className="mt-2 space-y-1 text-muted-foreground">
            <div className="flex gap-2">
              <dt className="shrink-0 font-medium text-foreground">Email:</dt>
              <dd>
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{DEV_ADMIN_EMAIL}</code>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0 font-medium text-foreground">Password:</dt>
              <dd>
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{DEV_ADMIN_PASSWORD}</code>
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-muted-foreground">Remove before production.</p>
        </div>
      )}
    </div>
  );
}
