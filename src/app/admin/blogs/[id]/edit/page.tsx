"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogForm } from "@/components/blog/blog-form";
import { useGetSingleBlogAdminQuery } from "@/redux/api/blog/blogApi";

export default function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useGetSingleBlogAdminQuery(id);
  const blog = data?.data;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/blogs">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Blog Post</h2>
          <p className="text-sm text-muted-foreground">
            Update content, cover image, or publish status.
          </p>
        </div>
      </section>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading blog...
        </div>
      ) : blog ? (
        <BlogForm blog={blog} />
      ) : (
        <p className="text-sm text-muted-foreground">Blog not found.</p>
      )}
    </div>
  );
}
