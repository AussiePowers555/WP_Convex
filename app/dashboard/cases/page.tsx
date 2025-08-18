"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  DollarSign,
  Clock,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

const caseStatuses = [
  "All",
  "New Matter",
  "Customer Contacted",
  "Awaiting Approval",
  "Bike Delivered",
  "Bike Returned",
  "Demands Sent",
  "Awaiting Settlement",
  "Settlement Agreed",
  "Paid",
  "Closed"
];

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'New Matter': 'bg-blue-500',
    'Customer Contacted': 'bg-yellow-500',
    'Awaiting Approval': 'bg-orange-500',
    'Bike Delivered': 'bg-indigo-500',
    'Bike Returned': 'bg-purple-500',
    'Demands Sent': 'bg-pink-500',
    'Awaiting Settlement': 'bg-amber-500',
    'Settlement Agreed': 'bg-teal-500',
    'Paid': 'bg-green-500',
    'Closed': 'bg-gray-500',
  };
  return colors[status] || 'bg-gray-400';
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CasesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState<Id<"cases"> | null>(null);

  // Fetch cases from Convex
  const cases = useQuery(api.cases.list, {
    status: statusFilter === "All" ? undefined : statusFilter,
    searchTerm: searchTerm || undefined,
  });

  const deleteCase = useMutation(api.cases.remove);

  // Filter cases based on search and status
  const filteredCases = useMemo(() => {
    if (!cases) return [];
    return cases;
  }, [cases]);

  const handleDelete = async () => {
    if (!caseToDelete) return;
    
    try {
      await deleteCase({ id: caseToDelete });
      toast.success("Case deleted successfully");
      setDeleteDialogOpen(false);
      setCaseToDelete(null);
    } catch (error) {
      toast.error("Failed to delete case");
      console.error(error);
    }
  };

  const exportToCSV = () => {
    if (!filteredCases.length) return;

    const headers = [
      "Case Number",
      "NAF Client",
      "AF Party",
      "Status",
      "Invoiced",
      "Paid",
      "Outstanding",
      "Created Date"
    ];

    const rows = filteredCases.map(c => [
      c.caseNumber,
      c.nafName,
      c.afName,
      c.status,
      c.invoiced.toString(),
      c.paid.toString(),
      (c.invoiced - c.paid).toString(),
      new Date(c._creationTime).toLocaleDateString('en-AU')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cases-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cases</h2>
          <p className="text-muted-foreground">
            Manage and track all rental cases
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Link href="/dashboard/cases/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Case
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search cases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {caseStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredCases.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(filteredCases.reduce((sum, c) => sum + c.invoiced, 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(filteredCases.reduce((sum, c) => sum + c.paid, 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(filteredCases.reduce((sum, c) => sum + (c.invoiced - c.paid), 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cases Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case Number</TableHead>
                  <TableHead>NAF Client</TableHead>
                  <TableHead>AF Party</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Invoiced</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No cases found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCases.map((case_) => (
                    <TableRow key={case_._id}>
                      <TableCell className="font-medium">{case_.caseNumber}</TableCell>
                      <TableCell>{case_.nafName}</TableCell>
                      <TableCell>{case_.afName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1">
                          <span className={`w-2 h-2 rounded-full ${getStatusColor(case_.status)}`} />
                          {case_.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(case_.invoiced)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(case_.paid)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(case_.invoiced - case_.paid)}
                      </TableCell>
                      <TableCell>
                        {new Date(case_._creationTime).toLocaleDateString('en-AU')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/cases/${case_._id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/cases/${case_._id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setCaseToDelete(case_._id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Case</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this case? This action cannot be undone.
              All related documents, communications, and financial records will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Add missing import
import { FileText } from "lucide-react";