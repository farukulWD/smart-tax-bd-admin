"use client";

import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, FileSearch } from "lucide-react";

export interface Column<T> {
  header: string | ReactNode;
  cell: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  maxHeight?: string;
  rowKey?: (item: T) => string | number;
}

export function DataTable<T>({
  data,
  columns,
  isLoading = false,
  loadingMessage = "Loading data...",
  emptyMessage = "No results found.",
  emptyIcon = <FileSearch className="h-5 w-5" />,
  maxHeight = "60vh",
  rowKey,
}: DataTableProps<T>) {
  return (
    <div className="overflow-auto" style={{ maxHeight }}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {loadingMessage}
                </div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-28 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  {emptyIcon}
                  {emptyMessage}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, rowIndex) => (
              <TableRow key={rowKey ? rowKey(item) : rowIndex}>
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex} className={column.className}>
                    {column.cell(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
