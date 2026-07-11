"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StarRating } from "@/components/ui/star-rating";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IReview,
  useCreateReviewMutation,
  useDeleteReviewMutation,
  useGetAllReviewsAdminQuery,
  useUpdateReviewMutation,
  useUpdateReviewStatusMutation,
} from "@/redux/api/review/reviewApi";

const PAGE_LIMIT = 10;

const statusVariant: Record<IReview["status"], "default" | "outline" | "destructive"> = {
  approved: "default",
  pending: "outline",
  rejected: "destructive",
};

export default function ReviewsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isFetching } = useGetAllReviewsAdminQuery({
    page,
    limit: PAGE_LIMIT,
    ...(search ? { search } : {}),
    ...(status !== "all" ? { status } : {}),
  });

  const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();
  const [updateReviewStatus] = useUpdateReviewStatusMutation();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<IReview | null>(null);
  const [formData, setFormData] = useState({
    reviewerName: "",
    rating: 5,
    comment: "",
    status: "approved" as IReview["status"],
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reviews = useMemo<IReview[]>(() => data?.data ?? [], [data]);
  const meta = data?.meta;
  const totalPage = meta?.totalPage ?? 1;

  const handleOpenModal = (item: IReview | null = null) => {
    setEditingReview(item);
    setFormData(
      item
        ? {
            reviewerName: item.reviewerName,
            rating: item.rating,
            comment: item.comment,
            status: item.status,
          }
        : { reviewerName: "", rating: 5, comment: "", status: "approved" },
    );
    setPhotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("data", JSON.stringify(formData));
    if (photoFile) {
      fd.append("photo", photoFile);
    }

    try {
      if (editingReview) {
        await updateReview({ id: editingReview._id, data: fd }).unwrap();
        toast.success("Review updated successfully");
      } else {
        await createReview(fd).unwrap();
        toast.success("Review created successfully");
      }
      setIsModalOpen(false);
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleStatusChange = async (id: string, next: "approved" | "rejected") => {
    try {
      await updateReviewStatus({ id, status: next }).unwrap();
      toast.success(next === "approved" ? "Review approved" : "Review rejected");
    } catch {
      toast.error("Failed to update review status");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteReview(deleteId).unwrap();
      toast.success("Review deleted successfully");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete review");
    }
  };

  const columns: Column<IReview>[] = [
    {
      header: "Reviewer",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={item.reviewerPhoto} alt={item.reviewerName} />
            <AvatarFallback>{item.reviewerName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="max-w-[160px] truncate font-medium">{item.reviewerName}</span>
        </div>
      ),
    },
    {
      header: "Rating",
      cell: (item) => <StarRating value={item.rating} readOnly size="sm" />,
    },
    {
      header: "Comment",
      cell: (item) => (
        <span className="block max-w-sm truncate text-muted-foreground">{item.comment}</span>
      ),
    },
    {
      header: "Status",
      cell: (item) => (
        <Badge variant={statusVariant[item.status]} className="capitalize">
          {item.status}
        </Badge>
      ),
    },
    {
      header: "Date",
      cell: (item) => (
        <span className="text-xs text-muted-foreground">
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      header: <span className="flex justify-end">Actions</span>,
      className: "text-right",
      cell: (item) => (
        <div className="flex justify-end gap-2">
          {item.status === "pending" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                onClick={() => handleStatusChange(item._id, "approved")}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => handleStatusChange(item._id, "rejected")}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" onClick={() => handleOpenModal(item)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setDeleteId(item._id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reviews</h2>
          <p className="text-sm text-muted-foreground">
            Moderate client-submitted reviews and add reviews shown on the public site.
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="mr-2 h-4 w-4" /> Add Review
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingReview ? "Edit Review" : "Add Review"}</DialogTitle>
                <DialogDescription>
                  Reviews added here are not linked to a user account and are shown directly
                  on the public site.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="reviewerName">Reviewer Name</Label>
                  <Input
                    id="reviewerName"
                    value={formData.reviewerName}
                    onChange={(e) =>
                      setFormData({ ...formData, reviewerName: e.target.value })
                    }
                    placeholder="e.g. Priyanka Saha"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="photo">Photo (optional)</Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                  />
                  {editingReview?.reviewerPhoto && !photoFile && (
                    <p className="text-xs text-muted-foreground">
                      Existing photo will be kept unless replaced.
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label>Rating</Label>
                  <StarRating
                    value={formData.rating}
                    onChange={(rating) => setFormData({ ...formData, rating })}
                    size="lg"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="comment">Review</Label>
                  <Textarea
                    id="comment"
                    rows={4}
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    placeholder="Write the review content here..."
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value as IReview["status"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button disabled={isCreating || isUpdating} type="submit">
                  {editingReview ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-bold">{meta?.total ?? reviews.length}</span>
            <Star className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {reviews.filter((r) => r.status === "pending").length}
            </span>
            <Star className="h-5 w-5 text-amber-500" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {reviews.filter((r) => r.status === "approved").length}
            </span>
            <Star className="h-5 w-5 text-emerald-600" />
          </CardContent>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-3 border-b border-border md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base">All Reviews</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search name or comment..."
                className="w-full pl-8 sm:w-64"
              />
            </div>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={reviews}
            columns={columns}
            isLoading={isLoading || isFetching}
            loadingMessage="Loading reviews..."
            emptyMessage="No reviews found."
            rowKey={(item) => item._id}
          />
        </CardContent>
      </Card>

      {totalPage > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {meta?.page ?? page} of {totalPage} · {meta?.total ?? 0} reviews
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
        variant="destructive"
        title="Delete review"
        description="This review will be permanently deleted. This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
