"use client";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useDebounce } from "@/lib/use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Plus, RefreshCcw } from "lucide-react";
import UsersTable from "@/components/admin/users/UsersTable";
import AddUserDialog from "@/components/admin/users/AddUserDialog";
import LoaderOverlay from "@/components/ui/LoaderOverlay";
export default function UsersPage() {
    const [query, setQuery] = React.useState("");
    const [openAdd, setOpenAdd] = React.useState(false);
    const [refreshKey, setRefreshKey] = React.useState(0);
    const debounced = useDebounce(query);

    const [loading, setLoading] = React.useState(false);
    const [data, setData] = React.useState<any>({ items: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 }, sort: "createdAt:desc", q: "" });

    const fetchUsers = React.useCallback(async (page = 1, pageSize = data.pagination.pageSize, sort = data.sort, q = debounced) => {
        setLoading(true);
        try {
            const res = await api<any>(`/api/admin/users?page=${page}&pageSize=${pageSize}&sort=${encodeURIComponent(sort)}&q=${encodeURIComponent(q)}`);
            console.log("api respones", res)
            setData(res);
        } catch (e: any) {
            toast.error(e.message || "Failed to load users");
        } finally {
            setLoading(false);
        }
    }, [debounced, data.pagination.pageSize, data.sort]);

    React.useEffect(() => {
        fetchUsers(1);
    }, [debounced, refreshKey]);

    return (
        <div className="flex flex-col gap-4">
            {loading ? (<div><LoaderOverlay label="Fetching users..." /> </div>) : (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            <CardTitle>Users</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                            <Input placeholder="Search name, email, phone…" value={query} onChange={(e) => setQuery(e.target.value)} className="w-64" />
                            <Button variant="outline" onClick={() => setRefreshKey((k) => k + 1)} disabled={loading}>
                                <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
                            </Button>
                            <Button onClick={() => setOpenAdd(true)}>
                                <Plus className="h-4 w-4 mr-2" /> Add User
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <UsersTable
                            rows={data.items}
                            pagination={data.pagination}
                            sort={data.sort}
                            loading={loading}
                            onPageChange={(p: any) => fetchUsers(p)}
                            onPageSizeChange={(ps: any) => fetchUsers(1, ps)}
                            onSortChange={(s: any) => fetchUsers(1, data.pagination.pageSize, s)}
                            onChanged={() => setRefreshKey((k) => k + 1)}
                        />
                    </CardContent>
                </Card>
            )}
            <AddUserDialog open={openAdd} onOpenChange={setOpenAdd} onCreated={() => setRefreshKey((k) => k + 1)} />
        </div>
    );
}
