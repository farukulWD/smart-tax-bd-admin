"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ReactSortable } from "react-sortablejs";
import { Edit, GripVertical, HelpCircle, Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
  IFaq,
  useCreateFaqMutation,
  useDeleteFaqMutation,
  useGetAllFaqsAdminQuery,
  useReorderFaqsMutation,
  useUpdateFaqMutation,
} from "@/redux/api/faq/faqApi";

interface SortableFaq extends IFaq {
  id: string;
}

export default function FaqsPage() {
  const { data, isLoading } = useGetAllFaqsAdminQuery();

  const [createFaq, { isLoading: isCreating }] = useCreateFaqMutation();
  const [updateFaq, { isLoading: isUpdating }] = useUpdateFaqMutation();
  const [reorderFaqs] = useReorderFaqsMutation();
  const [deleteFaq, { isLoading: isDeleting }] = useDeleteFaqMutation();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [faqs, setFaqs] = useState<SortableFaq[]>([]);
  const [syncedData, setSyncedData] = useState(data);

  if (data !== syncedData) {
    setSyncedData(data);
    setFaqs((data?.data ?? []).map((item) => ({ ...item, id: item._id })));
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<IFaq | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    isActive: true,
  });

  const handleOpenModal = (item: IFaq | null = null) => {
    setEditingFaq(item);
    setFormData(
      item
        ? { question: item.question, answer: item.answer, isActive: item.isActive }
        : { question: "", answer: "", isActive: true },
    );
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingFaq) {
        await updateFaq({ id: editingFaq._id, data: formData }).unwrap();
        toast.success("FAQ updated successfully");
      } else {
        await createFaq(formData).unwrap();
        toast.success("FAQ created successfully");
      }
      setIsModalOpen(false);
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleToggleActive = async (item: IFaq) => {
    try {
      await updateFaq({ id: item._id, data: { isActive: !item.isActive } }).unwrap();
      toast.success(item.isActive ? "FAQ hidden" : "FAQ made visible");
    } catch {
      toast.error("Failed to update FAQ status");
    }
  };

  const handleSortChange = async (newList: SortableFaq[]) => {
    setFaqs(newList);
    try {
      await reorderFaqs({
        items: newList.map((item, index) => ({ id: item._id, order: index })),
      }).unwrap();
    } catch {
      toast.error("Failed to save new order");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteFaq(deleteId).unwrap();
      toast.success("FAQ deleted successfully");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete FAQ");
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">FAQs</h2>
          <p className="text-sm text-muted-foreground">
            Manage the frequently asked questions shown on the public home page. Drag rows to
            reorder.
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="mr-2 h-4 w-4" /> Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingFaq ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
                <DialogDescription>
                  Question and answer shown to visitors on the public site.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="question">Question</Label>
                  <Input
                    id="question"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    placeholder="e.g. How do I file my tax return?"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="answer">Answer</Label>
                  <Textarea
                    id="answer"
                    rows={4}
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    placeholder="Write the answer here..."
                    required
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="isActive">Visible on home page</Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button disabled={isCreating || isUpdating} type="submit">
                  {editingFaq ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-base">All FAQs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto" style={{ maxHeight: "60vh" }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Question</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              {isLoading ? (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      Loading FAQs...
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : faqs.length === 0 ? (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={4} className="h-28 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <HelpCircle className="h-5 w-5" />
                        No FAQs found.
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : (
                <ReactSortable
                  tag="tbody"
                  list={faqs}
                  setList={handleSortChange}
                  handle=".drag-handle"
                  className="[&_tr:last-child]:border-0"
                >
                  {faqs.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <GripVertical className="drag-handle h-4 w-4 cursor-grab text-muted-foreground active:cursor-grabbing" />
                      </TableCell>
                      <TableCell>
                        <span className="block max-w-md truncate font-medium">
                          {item.question}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={item.isActive}
                          onCheckedChange={() => handleToggleActive(item)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
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
                      </TableCell>
                    </TableRow>
                  ))}
                </ReactSortable>
              )}
            </Table>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
        variant="destructive"
        title="Delete FAQ"
        description="This FAQ will be permanently deleted. This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
