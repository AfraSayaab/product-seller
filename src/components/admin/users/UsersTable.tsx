
// ==========================
// COMPONENTS – TABLE
// ==========================
// File: components/admin/users/UsersTable.tsx
"use client";
import * as React from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, ChevronLeft, ChevronRight, MoreHorizontal, ArrowUpDown } from "lucide-react";
import EditUserSheet from "@/components/admin/users/EditUserSheet";
import DeleteUserDialog from "@/components/admin/users/DeleteUserDialog";

export default function UsersTable({ rows, pagination, sort, loading, onPageChange, onPageSizeChange, onSortChange, onChanged }: any) {
    const [openEditId, setOpenEditId] = React.useState<number | null>(null);
    const [openDeleteId, setOpenDeleteId] = React.useState<number | null>(null);

    const [localSort, setLocalSort] = React.useState<string>(sort || "createdAt:desc");
    React.useEffect(() => setLocalSort(sort), [sort]);

    const toggleSort = (field: string) => {
        const [f, dir] = localSort.split(":");
        const next = f === field ? `${field}:${dir === "asc" ? "desc" : "asc"}` : `${field}:asc`;
        setLocalSort(next);
        onSortChange?.(next);
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead className="cursor-pointer" onClick={() => toggleSort("username")}>
                                Username <ArrowUpDown className="inline h-3 w-3 ml-1" />
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => toggleSort("email")}>
                                Email <ArrowUpDown className="inline h-3 w-3 ml-1" />
                            </TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead className="cursor-pointer" onClick={() => toggleSort("role")}>
                                Role <ArrowUpDown className="inline h-3 w-3 ml-1" />
                            </TableHead>
                            <TableHead>Verified</TableHead>
                            <TableHead className="cursor-pointer" onClick={() => toggleSort("createdAt")}>
                                Created <ArrowUpDown className="inline h-3 w-3 ml-1" />
                            </TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">No users found</TableCell>
                            </TableRow>
                        )}

                        {rows?.map((u: any) => (
                            <TableRow key={u.id}>
                                <TableCell>
                                    <Checkbox aria-label={`select user ${u.username}`} />
                                </TableCell>
                                <TableCell className="font-medium">{u.username}</TableCell>
                                <TableCell>{u.email}</TableCell>
                                <TableCell>{u.phone}</TableCell>
                                <TableCell>
                                    <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>{u.role}</Badge>
                                </TableCell>
                                <TableCell>{u.isVerified ? <Badge>Yes</Badge> : <Badge variant="outline">No</Badge>}</TableCell>
                                <TableCell>{new Date(u.createdAt).toLocaleString()}</TableCell>
                                <TableCell className="flex items-center gap-2">
                                    <Button size="icon" variant="ghost" onClick={() => setOpenEditId(u.id)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => setOpenDeleteId(u.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages} • {pagination.total} records
                </div>
                <div className="flex items-center gap-2">
                    <Select value={String(pagination.pageSize)} onValueChange={(v) => onPageSizeChange?.(parseInt(v))}>
                        <SelectTrigger className="w-24"><SelectValue placeholder="Page size" /></SelectTrigger>
                        <SelectContent>
                            {[10, 20, 50, 100].map((n) => (
                                <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" disabled={pagination.page <= 1} onClick={() => onPageChange?.(pagination.page - 1)}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" disabled={pagination.page >= pagination.totalPages} onClick={() => onPageChange?.(pagination.page + 1)}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <EditUserSheet id={openEditId} open={!!openEditId} onOpenChange={() => setOpenEditId(null)} onUpdated={() => {
                onChanged?.()
                setOpenEditId(null)
            }} />
            <DeleteUserDialog id={openDeleteId} open={!!openDeleteId} onOpenChange={() => setOpenDeleteId(null)} onDeleted={() => onChanged?.()} />
        </div>
    );
}
