"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogForm } from "@/components/blog/blog-form";

export default function CreateBlogPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/blogs">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">New Blog Post</h2>
          <p className="text-sm text-muted-foreground">
            Write a new post for the public blog.
          </p>
        </div>
      </section>

      <BlogForm />
    </div>
  );
}
