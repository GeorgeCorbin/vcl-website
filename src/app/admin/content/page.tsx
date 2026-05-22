import Link from "next/link";
import { format } from "date-fns";
import { FileText, Pencil } from "lucide-react";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const defaultPages = [
  { slug: "about", title: "About VCL", description: "Information about Varsity Club Lacrosse" },
  { slug: "privacy", title: "Privacy Policy", description: "Privacy policy and data handling" },
  { slug: "terms", title: "Terms of Service", description: "Terms and conditions for using the site" },
] as const;

export default async function ContentManagementPage() {
  const pages = await prisma.page.findMany({
    orderBy: { slug: "asc" },
    select: { id: true, slug: true, title: true, content: true, updatedAt: true },
  });

  const allPages = defaultPages.map((defaultPage) => {
    const existingPage = pages.find((page) => page.slug === defaultPage.slug);
    return {
      ...defaultPage,
      id: existingPage?.id,
      content: existingPage?.content,
      updatedAt: existingPage?.updatedAt,
      exists: !!existingPage,
    };
  });

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-6">
        <h1 className="font-heading text-4xl tracking-wide text-foreground">Content Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage static pages and site content.</p>
      </div>

      <div className="rounded-sm border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-6 py-4 bg-secondary">
          <h2 className="flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">
            <FileText className="h-4 w-4" />
            Static Pages
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  Page
                </th>
                <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allPages.map((page) => (
                <tr key={page.slug} className="hover:bg-accent transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{page.title}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{page.description}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-sm px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase ${
                        page.exists && page.content
                          ? "bg-vcl-gold text-vcl-gold-foreground"
                          : "bg-accent text-muted-foreground"
                      }`}
                    >
                      {page.exists && page.content ? "Published" : "Not Set"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {page.updatedAt ? format(new Date(page.updatedAt), "MMM d, yyyy h:mm a") : "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/content/${page.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-vcl-gold/40 hover:text-vcl-gold transition-colors"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-sm border border-border bg-card p-4">
        <h3 className="mb-2 text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">Tips</h3>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Use the editor to add formatted content including headings, lists, and links</li>
          <li>• Changes are published immediately after saving</li>
          <li>• Preview your changes by visiting the public page after saving</li>
        </ul>
      </div>
    </div>
  );
}
