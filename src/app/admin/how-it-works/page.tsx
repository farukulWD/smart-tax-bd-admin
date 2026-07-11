"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ReactSortable } from "react-sortablejs";
import {
  Briefcase,
  Copy,
  Download,
  Edit,
  FileText,
  GripVertical,
  ListChecks,
  Plus,
  Trash2,
  Upload,
  type LucideIcon,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  IHowItWork,
  useCreateHowItWorkMutation,
  useDeleteHowItWorkMutation,
  useGetAllHowItWorksAdminQuery,
  useGetHowItWorkSectionQuery,
  useReorderHowItWorksMutation,
  useUpdateHowItWorkMutation,
  useUpdateHowItWorkSectionMutation,
} from "@/redux/api/how-it-work/howItWorkApi";

const iconOptions: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "file-text", label: "File", icon: FileText },
  { value: "briefcase", label: "Briefcase", icon: Briefcase },
  { value: "upload", label: "Upload", icon: Upload },
  { value: "copy", label: "Copy", icon: Copy },
  { value: "download", label: "Download", icon: Download },
];

const iconMap: Record<string, LucideIcon> = Object.fromEntries(
  iconOptions.map((option) => [option.value, option.icon]),
);

interface SortableHowItWork extends IHowItWork {
  id: string;
}

export default function HowItWorksPage() {
  const { data, isLoading } = useGetAllHowItWorksAdminQuery();

  const [createHowItWork, { isLoading: isCreating }] = useCreateHowItWorkMutation();
  const [updateHowItWork, { isLoading: isUpdating }] = useUpdateHowItWorkMutation();
  const [reorderHowItWorks] = useReorderHowItWorksMutation();
  const [deleteHowItWork, { isLoading: isDeleting }] = useDeleteHowItWorkMutation();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [steps, setSteps] = useState<SortableHowItWork[]>([]);
  const [syncedData, setSyncedData] = useState(data);

  if (data !== syncedData) {
    setSyncedData(data);
    setSteps((data?.data ?? []).map((item) => ({ ...item, id: item._id })));
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<IHowItWork | null>(null);
  const [formData, setFormData] = useState({
    icon: "",
    title: "",
    description: "",
    isActive: true,
  });

  const handleOpenModal = (item: IHowItWork | null = null) => {
    setEditingStep(item);
    setFormData(
      item
        ? {
            icon: item.icon,
            title: item.title,
            description: item.description,
            isActive: item.isActive,
          }
        : { icon: "", title: "", description: "", isActive: true },
    );
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingStep) {
        await updateHowItWork({ id: editingStep._id, data: formData }).unwrap();
        toast.success("Step updated successfully");
      } else {
        await createHowItWork(formData).unwrap();
        toast.success("Step created successfully");
      }
      setIsModalOpen(false);
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleToggleActive = async (item: IHowItWork) => {
    try {
      await updateHowItWork({ id: item._id, data: { isActive: !item.isActive } }).unwrap();
      toast.success(item.isActive ? "Step hidden" : "Step made visible");
    } catch {
      toast.error("Failed to update step status");
    }
  };

  const handleSortChange = async (newList: SortableHowItWork[]) => {
    setSteps(newList);
    try {
      await reorderHowItWorks({
        items: newList.map((item, index) => ({ id: item._id, order: index })),
      }).unwrap();
    } catch {
      toast.error("Failed to save new order");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteHowItWork(deleteId).unwrap();
      toast.success("Step deleted successfully");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete step");
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">How It Works</h2>
          <p className="text-sm text-muted-foreground">
            Manage the &quot;How Online Tax Filing Works&quot; section shown on the public home
            page.
          </p>
        </div>
      </section>

      <SectionHeadingCard />

      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Steps</h3>
          <p className="text-sm text-muted-foreground">Drag rows to reorder.</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="mr-2 h-4 w-4" /> Add Step
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingStep ? "Edit Step" : "Add Step"}</DialogTitle>
                <DialogDescription>
                  A single step in the tax filing process, shown to visitors on the public site.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                    required
                  >
                    <SelectTrigger id="icon" className="w-full">
                      <SelectValue placeholder="Select an icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <option.icon className="h-4 w-4" />
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Register with BDTax"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Write the step description here..."
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
                  {editingStep ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-base">All Steps</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto" style={{ maxHeight: "60vh" }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead className="w-12">Icon</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              {isLoading ? (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Loading steps...
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : steps.length === 0 ? (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={5} className="h-28 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <ListChecks className="h-5 w-5" />
                        No steps found.
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : (
                <ReactSortable
                  tag="tbody"
                  list={steps}
                  setList={handleSortChange}
                  handle=".drag-handle"
                  className="[&_tr:last-child]:border-0"
                >
                  {steps.map((item) => {
                    const Icon = iconMap[item.icon] ?? ListChecks;
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <GripVertical className="drag-handle h-4 w-4 cursor-grab text-muted-foreground active:cursor-grabbing" />
                        </TableCell>
                        <TableCell>
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </TableCell>
                        <TableCell>
                          <span className="block max-w-md truncate font-medium">
                            {item.title}
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
                    );
                  })}
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
        title="Delete Step"
        description="This step will be permanently deleted. This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}

function SectionHeadingCard() {
  const { data, isLoading } = useGetHowItWorkSectionQuery();
  const [updateSection, { isLoading: isSaving }] = useUpdateHowItWorkSectionMutation();

  const [form, setForm] = useState({
    badge: "",
    titlePrefix: "",
    titleHighlight: "",
    description: "",
  });
  const [synced, setSynced] = useState(data);

  if (data !== synced) {
    setSynced(data);
    if (data?.data) {
      setForm({
        badge: data.data.badge ?? "",
        titlePrefix: data.data.titlePrefix,
        titleHighlight: data.data.titleHighlight,
        description: data.data.description,
      });
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSection(form).unwrap();
      toast.success("Section heading updated successfully");
    } catch {
      toast.error("Failed to update section heading");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Section Heading</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="badge">Badge (optional)</Label>
            <Input
              id="badge"
              value={form.badge}
              onChange={(e) => setForm({ ...form, badge: e.target.value })}
              placeholder="e.g. Process"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="titlePrefix">Title</Label>
              <Input
                id="titlePrefix"
                value={form.titlePrefix}
                onChange={(e) => setForm({ ...form, titlePrefix: e.target.value })}
                placeholder="e.g. How Online Tax Filing Works with"
                disabled={isLoading}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="titleHighlight">Highlighted word</Label>
              <Input
                id="titleHighlight"
                value={form.titleHighlight}
                onChange={(e) => setForm({ ...form, titleHighlight: e.target.value })}
                placeholder="e.g. BDTax"
                disabled={isLoading}
                required
              />
              <p className="text-xs text-muted-foreground">Rendered in green after the title.</p>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sectionDescription">Description</Label>
            <Textarea
              id="sectionDescription"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Short supporting text shown under the title..."
              disabled={isLoading}
              required
            />
          </div>
          <div>
            <Button disabled={isLoading || isSaving} type="submit">
              Save Heading
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
