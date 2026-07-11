"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { RichTextEditor } from "@/components/blog/rich-text-editor";
import {
  IBlog,
  useCreateBlogMutation,
  useUpdateBlogMutation,
} from "@/redux/api/blog/blogApi";

interface BlogFormProps {
  blog?: IBlog;
}

export function BlogForm({ blog }: BlogFormProps) {
  const router = useRouter();
  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
  const isSaving = isCreating || isUpdating;

  const [formData, setFormData] = useState({
    title: blog?.title ?? "",
    content: blog?.content ?? "",
    excerpt: blog?.excerpt ?? "",
    category: blog?.category ?? "",
    tags: blog?.tags?.join(", ") ?? "",
    authorName: blog?.authorName ?? "",
    status: blog?.status ?? "draft",
  });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    blog?.coverImage ?? null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setCoverImageFile(file);
    setCoverPreview(file ? URL.createObjectURL(file) : blog?.coverImage ?? null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.content.trim()) {
      toast.error("Content is required");
      return;
    }

    const payload = {
      title: formData.title,
      content: formData.content,
      excerpt: formData.excerpt || undefined,
      category: formData.category || undefined,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      authorName: formData.authorName || undefined,
      status: formData.status,
    };

    const fd = new FormData();
    fd.append("data", JSON.stringify(payload));
    if (coverImageFile) {
      fd.append("coverImage", coverImageFile);
    }

    try {
      if (blog) {
        await updateBlog({ id: blog._id, data: fd }).unwrap();
        toast.success("Blog updated successfully");
      } else {
        await createBlog(fd).unwrap();
        toast.success("Blog created successfully");
      }
      router.push("/admin/blogs");
    } catch {
      toast.error("Operation failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="grid gap-5 pt-6">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g. How to file your income tax return online"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Content</Label>
            <RichTextEditor
              value={formData.content}
              onChange={(html) => setFormData((prev) => ({ ...prev, content: html }))}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="excerpt">Excerpt (optional)</Label>
            <Textarea
              id="excerpt"
              rows={2}
              value={formData.excerpt}
              onChange={(e) =>
                setFormData({ ...formData, excerpt: e.target.value })
              }
              placeholder="Short summary shown on blog cards. Auto-generated from content if left empty."
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="e.g. Tax Guide"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                placeholder="income-tax, nbr, e-return"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="authorName">Author name</Label>
              <Input
                id="authorName"
                value={formData.authorName}
                onChange={(e) =>
                  setFormData({ ...formData, authorName: e.target.value })
                }
                placeholder="Smart Tax BD"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as "draft" | "published",
                  })
                }
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="coverImage">Cover image (optional)</Label>
            <Input
              id="coverImage"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleCoverChange}
            />
            {coverPreview ? (
              <div className="relative mt-1 h-40 w-full max-w-sm overflow-hidden rounded-md border border-border">
                <Image
                  src={coverPreview}
                  alt="Cover preview"
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            ) : (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <ImageIcon className="h-3 w-3" />
                Recommended: landscape image, at least 1200×630.
              </p>
            )}
            {blog?.coverImage && !coverImageFile && (
              <p className="text-xs text-muted-foreground">
                Existing cover image will be kept unless replaced.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {blog ? "Update Blog" : "Create Blog"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/blogs")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
