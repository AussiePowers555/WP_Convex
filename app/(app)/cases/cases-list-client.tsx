"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, X, ArrowUpDown, ArrowUp, ArrowDown, Trash2, RefreshCw } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import NewCaseForm from "./new-case-form";

const statusOptions = ['New Matter', 'Customer Contacted', 'Awaiting Approval', 'Bike Delivered', 'Bike Returned', 'Demands Sent', 'Awaiting Settlement', 'Settlement Agreed', 'Paid', 'Closed'];

export default function CasesListClient() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'caseNumber' | 'nafName' | 'status'>('caseNumber');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Convex queries and mutations
  const cases = useQuery(api.cases.list, { 
    searchTerm: searchQuery || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter 
  });
  const deleteCase = useMutation(api.cases.remove);

  // Filter and sort cases
  const filteredAndSortedCases = useMemo(() => {
    if (!cases) return [];
    
    let filtered = cases;
    
    // Apply search filter
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      filtered = cases.filter((c) => 
        c.caseNumber.toLowerCase().includes(search) ||
        c.nafName.toLowerCase().includes(search) ||
        c.afName.toLowerCase().includes(search) ||
        c.nafVehicleRego?.toLowerCase().includes(search) ||
        c.afVehicleRego?.toLowerCase().includes(search)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    
    // Sort cases
    return filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortField) {
        case 'caseNumber':
          aVal = a.caseNumber;
          bVal = b.caseNumber;
          break;
        case 'nafName':
          aVal = a.nafName;
          bVal = b.nafName;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          aVal = a._creationTime;
          bVal = b._creationTime;
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [cases, searchQuery, statusFilter, sortField, sortDirection]);

  const handleSort = (field: typeof sortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: typeof sortField) => {
    if (field === sortField) {
      return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    }
    return <ArrowUpDown className="h-4 w-4" />;
  };

  const handleDelete = async (caseId: string) => {
    if (confirm('Are you sure you want to delete this case? This action cannot be undone.')) {
      try {
        await deleteCase({ id: caseId as any });
      } catch (error) {
        console.error('Error deleting case:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New Matter': return 'bg-blue-100 text-blue-800';
      case 'Customer Contacted': return 'bg-yellow-100 text-yellow-800';
      case 'Awaiting Approval': return 'bg-orange-100 text-orange-800';
      case 'Bike Delivered': return 'bg-purple-100 text-purple-800';
      case 'Bike Returned': return 'bg-indigo-100 text-indigo-800';
      case 'Demands Sent': return 'bg-pink-100 text-pink-800';
      case 'Awaiting Settlement': return 'bg-cyan-100 text-cyan-800';
      case 'Settlement Agreed': return 'bg-lime-100 text-lime-800';
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  };

  if (cases === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading cases...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Case Management</h1>
          <p className="text-muted-foreground">Manage motorbike rental cases and track their progress</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Case
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Case</DialogTitle>
              <DialogDescription>
                Add a new motorbike rental case to the system
              </DialogDescription>
            </DialogHeader>
            <NewCaseForm onClose={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search cases by case number, name, or registration..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cases ({filteredAndSortedCases.length})</CardTitle>
          <CardDescription>
            All registered motorbike rental cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort('caseNumber')}>
                  <div className="flex items-center gap-2">
                    Case Number
                    {getSortIcon('caseNumber')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('nafName')}>
                  <div className="flex items-center gap-2">
                    NAF Client
                    {getSortIcon('nafName')}
                  </div>
                </TableHead>
                <TableHead>AF Party</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-2">
                    Status
                    {getSortIcon('status')}
                  </div>
                </TableHead>
                <TableHead className="text-right">Invoiced</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedCases.map((case_) => (
                <TableRow key={case_._id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <Button
                      variant="link"
                      className="p-0 h-auto font-medium"
                      onClick={() => window.open(`/cases/${case_._id}`, '_blank')}
                    >
                      {case_.caseNumber}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{case_.nafName}</div>
                      <div className="text-sm text-muted-foreground">
                        {case_.nafVehicleRego && `${case_.nafVehicleRego} - `}
                        {case_.nafVehicleMake} {case_.nafVehicleModel}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{case_.afName}</div>
                      <div className="text-sm text-muted-foreground">
                        {case_.afVehicleRego && `${case_.afVehicleRego} - `}
                        {case_.afVehicleMake} {case_.afVehicleModel}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(case_.status)}>
                      {case_.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(case_.invoiced)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(case_.paid)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(case_.invoiced - case_.paid)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(case_._id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredAndSortedCases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {searchQuery || statusFilter !== 'all'
                        ? 'No cases match your search criteria'
                        : 'No cases found. Create your first case to get started.'}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}