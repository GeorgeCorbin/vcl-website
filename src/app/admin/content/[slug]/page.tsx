import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { updatePageContent } from "../actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

const pageMetadata: Record<string, { title: string; description: string }> = {
  about: { title: "About VCL", description: "Information about Varsity Club Lacrosse" },
  privacy: { title: "Privacy Policy", description: "Privacy policy and data handling" },
  terms: { title: "Terms of Service", description: "Terms and conditions for using the site" },
};

export default async function EditContentPage({ params }: PageProps) {
  const { slug } = await params;
  
  if (!pageMetadata[slug]) {
    return notFound();
  }

  const page = await prisma.page.findUnique({
    where: { slug },
    select: { id: true, slug: true, title: true, content: true },
  });

  const defaultTitle = pageMetadata[slug].title;
  const defaultContent = "";

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Edit Content</p>
        <h1 className="text-3xl font-bold tracking-tight">{pageMetadata[slug].title}</h1>
        <p className="text-muted-foreground">{pageMetadata[slug].description}</p>
      </div>

      <form action={updatePageContent} className="space-y-6">
        <input type="hidden" name="slug" value={slug} />

        <div className="space-y-2">
          <Label htmlFor="title">Page Title</Label>
          <Input
            id="title"
            name="title"
            defaultValue={page?.title || defaultTitle}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content (HTML supported)</Label>
          <Textarea
            id="content"
            name="content"
            defaultValue={page?.content || defaultContent}
            rows={20}
            className="font-mono text-sm"
            placeholder="Enter HTML content here..."
          />
          <p className="text-xs text-muted-foreground">
            You can use HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;a&gt;, etc.
          </p>
        </div>

        <div className="flex gap-4">
          <Button type="submit">Save Changes</Button>
          <Button type="button" variant="outline" asChild>
            <a href={`/${slug}`} target="_blank" rel="noopener noreferrer">
              Preview Page
            </a>
          </Button>
        </div>
      </form>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 text-sm font-medium text-blue-800">HTML Tips</h3>
        <ul className="space-y-1 text-sm text-blue-700">
          <li>• Use &lt;h2&gt; and &lt;h3&gt; for section headings</li>
          <li>• Use &lt;p&gt; for paragraphs</li>
          <li>• Use &lt;ul&gt; and &lt;li&gt; for bullet lists</li>
          <li>• Use &lt;a href="url"&gt; for links</li>
          <li>• Use &lt;strong&gt; for bold text</li>
        </ul>
      </div>
    </div>
  );
}
