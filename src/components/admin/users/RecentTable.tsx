"use client";
import * as React from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type UserRow = {
  id: number;
  username: string;
  email: string;
  role: "ADMIN" | "USER";
  createdAt: string;
};

type UsersApiData = {
  items: UserRow[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
  sort: string;
  q: string;
};

export default function RecentTable() {
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<UsersApiData>({
    items: [],
    pagination: { page: 1, pageSize: 3, total: 0, totalPages: 1 },
    sort: "createdAt:desc",
    q: "",
  });

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      // force pageSize=3 to only show three most recent
      const res = await api<UsersApiData>(`/api/admin/users?page=1&pageSize=3&sort=${encodeURIComponent("createdAt:desc")}&q=`);
      setData(res);
    } catch (e: any) {
      toast.error(e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <>
                  {[0, 1, 2].map((i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell>
                        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-44 animate-pulse rounded bg-muted" />
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}

              {!loading && data.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-sm text-muted-foreground text-center">
                    No recent users.
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                data.items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.username}</TableCell>
                    <TableCell className="text-muted-foreground">{row.email}</TableCell>
                    <TableCell>
                      <Badge variant={row.role === "ADMIN" ? "default" : "secondary"}>{row.role}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(row.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
