"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ReactSortable } from "react-sortablejs";
import { Edit, FileStack, GripVertical, Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  IFileName,
  useCreateFileNameMutation,
  useDeleteFileNameMutation,
  useGetAllFileNamesAdminQuery,
  useReorderFileNamesMutation,
  useUpdateFileNameMutation,
} from "@/redux/api/file-name/fileNameApi";

interface SortableFileName extends IFileName {
  id: string;
}

const emptyForm = {
  name: "",
  labelEn: "",
  labelBn: "",
  isCommon: false,
  isActive: true,
};

const errorMessage = (error: unknown, fallback: string) =>
  (error as { data?: { message?: string } })?.data?.message || fallback;

export default function FileNamesPage() {
  const { data, isLoading } = useGetAllFileNamesAdminQuery();

  const [createFileName, { isLoading: isCreating }] =
    useCreateFileNameMutation();
  const [updateFileName, { isLoading: isUpdating }] =
    useUpdateFileNameMutation();
  const [reorderFileNames] = useReorderFileNamesMutation();
  const [deleteFileName, { isLoading: isDeleting }] =
    useDeleteFileNameMutation();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [fileNames, setFileNames] = useState<SortableFileName[]>([]);
  const [syncedData, setSyncedData] = useState(data);

  if (data !== syncedData) {
    setSyncedData(data);
    setFileNames((data?.data ?? []).map((item) => ({ ...item, id: item._id })));
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFileName, setEditingFileName] = useState<IFileName | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const handleOpenModal = (item: IFileName | null = null) => {
    setEditingFileName(item);
    setFormData(
      item
        ? {
            name: item.name,
            labelEn: item.label?.en ?? item.name,
            labelBn: item.label?.bn ?? item.name,
            isCommon: item.isCommon,
            isActive: item.isActive,
          }
        : emptyForm,
    );
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name.trim(),
      label: {
        en: formData.labelEn.trim() || formData.name.trim(),
        bn: formData.labelBn.trim() || formData.name.trim(),
      },
      isCommon: formData.isCommon,
      isActive: formData.isActive,
    };

    try {
      if (editingFileName) {
        await updateFileName({ id: editingFileName._id, data: payload }).unwrap();
        toast.success("File name updated successfully");
      } else {
        await createFileName(payload).unwrap();
        toast.success("File name created successfully");
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(errorMessage(error, "Operation failed"));
    }
  };

  const handleToggleActive = async (item: IFileName) => {
    try {
      await updateFileName({
        id: item._id,
        data: { isActive: !item.isActive },
      }).unwrap();
      toast.success(item.isActive ? "File name disabled" : "File name enabled");
    } catch (error) {
      toast.error(errorMessage(error, "Failed to update file name status"));
    }
  };

  const handleSortChange = async (newList: SortableFileName[]) => {
    setFileNames(newList);
    try {
      await reorderFileNames({
        items: newList.map((item, index) => ({ id: item._id, order: index })),
      }).unwrap();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to save new order"));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteFileName(deleteId).unwrap();
      toast.success("File name deleted successfully");
      setDeleteId(null);
    } catch (error) {
      // The server refuses with 409 while a tax type still requires this name.
      toast.error(errorMessage(error, "Failed to delete file name"));
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">File Names</h2>
          <p className="text-sm text-muted-foreground">
            The documents users can be asked to upload. Attach them to a tax
            type or an income source from those pages, or mark one required for
            every order here. Drag rows to reorder.
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="mr-2 h-4 w-4" /> Add File Name
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingFileName ? "Edit File Name" : "Add File Name"}
                </DialogTitle>
                <DialogDescription>
                  The name is what users see as an upload slot and what their
                  uploaded files are matched against.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. TIN Certificate"
                    required
                  />
                  {editingFileName && (
                    <p className="text-xs text-muted-foreground">
                      Renaming this detaches files users already uploaded under
                      the old name — they will show as missing again.
                    </p>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="labelEn">Label (English)</Label>
                    <Input
                      id="labelEn"
                      value={formData.labelEn}
                      onChange={(e) =>
                        setFormData({ ...formData, labelEn: e.target.value })
                      }
                      placeholder="Defaults to the name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="labelBn">Label (বাংলা)</Label>
                    <Input
                      id="labelBn"
                      value={formData.labelBn}
                      onChange={(e) =>
                        setFormData({ ...formData, labelBn: e.target.value })
                      }
                      placeholder="যেমন টিআইএন সনদ"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-md border p-3">
                  <div>
                    <Label htmlFor="isCommon">Required for every order</Label>
                    <p className="text-xs text-muted-foreground">
                      Asked for regardless of tax type or income source.
                    </p>
                  </div>
                  <Switch
                    id="isCommon"
                    checked={formData.isCommon}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isCommon: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="isActive">Active</Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button disabled={isCreating || isUpdating} type="submit">
                  {editingFileName ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-base">All File Names</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto" style={{ maxHeight: "60vh" }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Name</TableHead>
                  <TableHead>বাংলা</TableHead>
                  <TableHead>Required for</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              {isLoading ? (
                <TableBody>
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Loading file names...
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : fileNames.length === 0 ? (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={6} className="h-28 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <FileStack className="h-5 w-5" />
                        No file names found.
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : (
                <ReactSortable
                  tag="tbody"
                  list={fileNames}
                  setList={handleSortChange}
                  handle=".drag-handle"
                  className="[&_tr:last-child]:border-0"
                >
                  {fileNames.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <GripVertical className="drag-handle h-4 w-4 cursor-grab text-muted-foreground active:cursor-grabbing" />
                      </TableCell>
                      <TableCell>
                        <span className="block max-w-xs truncate font-medium">
                          {item.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="block max-w-xs truncate text-muted-foreground">
                          {item.label?.bn || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {item.isCommon ? (
                          <Badge>Every order</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Where attached
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={item.isActive}
                          onCheckedChange={() => handleToggleActive(item)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenModal(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(item._id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
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
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete this file name?"
        description="Users will no longer be asked to upload it. Files already uploaded under this name are kept."
        confirmText="Delete"
        loading={isDeleting}
        variant="destructive"
      />
    </div>
  );
}
