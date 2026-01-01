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
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Site Content</p>
        <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
        <p className="text-muted-foreground">Manage static pages and site content.</p>
      </div>

      <div className="rounded-3xl border border-border/50 bg-card overflow-hidden">
        <div className="border-b border-border/50 px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <FileText className="h-5 w-5" />
            Static Pages
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border/50 bg-muted/40">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Page
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {allPages.map((page) => (
                <tr key={page.slug} className="hover:bg-muted/20">
                  <td className="px-6 py-4 text-sm font-medium">{page.title}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{page.description}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        page.exists && page.content
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {page.exists && page.content ? "Published" : "Not Set"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {page.updatedAt ? format(new Date(page.updatedAt), "MMM d, yyyy h:mm a") : "—"}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <Link
                      href={`/admin/content/${page.slug}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <Pencil className="mr-1 h-4 w-4" />
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 text-sm font-medium text-blue-800">Tips</h3>
        <ul className="space-y-1 text-sm text-blue-700">
          <li>• Use the editor to add formatted content including headings, lists, and links</li>
          <li>• Changes are published immediately after saving</li>
          <li>• Preview your changes by visiting the public page after saving</li>
        </ul>
      </div>
    </div>
  );
}
