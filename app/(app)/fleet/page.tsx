"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, X, ArrowUpDown, ArrowUp, ArrowDown, Trash2, RefreshCw, Bike } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import NewBikeForm from "./new-bike-form";

const statusOptions = ['Available', 'On Hire', 'Service', 'Repair', 'Unavailable'];

export default function FleetPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'registration' | 'make' | 'status'>('registration');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Convex queries and mutations
  const bikes = useQuery(api.bikes.list, { 
    searchTerm: searchQuery || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter 
  });
  const deleteBike = useMutation(api.bikes.remove);
  const fleetStats = useQuery(api.bikes.getStats);

  // Filter and sort bikes
  const filteredAndSortedBikes = useMemo(() => {
    if (!bikes) return [];
    
    let filtered = bikes;
    
    // Apply search filter
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      filtered = bikes.filter((b) => 
        b.registration.toLowerCase().includes(search) ||
        b.make.toLowerCase().includes(search) ||
        b.model.toLowerCase().includes(search) ||
        b.vin?.toLowerCase().includes(search)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }
    
    // Sort bikes
    return filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortField) {
        case 'registration':
          aVal = a.registration;
          bVal = b.registration;
          break;
        case 'make':
          aVal = a.make;
          bVal = b.make;
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
  }, [bikes, searchQuery, statusFilter, sortField, sortDirection]);

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

  const handleDelete = async (bikeId: string) => {
    if (confirm('Are you sure you want to delete this bike? This action cannot be undone.')) {
      try {
        await deleteBike({ id: bikeId as any });
      } catch (error) {
        console.error('Error deleting bike:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'On Hire': return 'bg-blue-100 text-blue-800';
      case 'Service': return 'bg-yellow-100 text-yellow-800';
      case 'Repair': return 'bg-red-100 text-red-800';
      case 'Unavailable': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  };

  if (bikes === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading fleet...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fleet Management</h1>
          <p className="text-muted-foreground">Manage your motorbike rental fleet</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Bike
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Bike</DialogTitle>
              <DialogDescription>
                Add a new bike to your rental fleet
              </DialogDescription>
            </DialogHeader>
            <NewBikeForm onClose={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Fleet Statistics */}
      {fleetStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bikes</CardTitle>
              <Bike className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fleetStats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <Badge className="bg-green-100 text-green-800">{fleetStats.available}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{fleetStats.available}</div>
              <p className="text-xs text-muted-foreground">
                {fleetStats.total > 0 ? Math.round((fleetStats.available / fleetStats.total) * 100) : 0}% of fleet
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On Hire</CardTitle>
              <Badge className="bg-blue-100 text-blue-800">{fleetStats.onHire}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{fleetStats.onHire}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round(fleetStats.utilizationRate)}% utilization
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fleet Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(fleetStats.totalValue)}</div>
              <p className="text-xs text-muted-foreground">
                Avg: {formatCurrency(fleetStats.averageValue)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bikes by registration, make, model, or VIN..."
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

      {/* Fleet Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fleet ({filteredAndSortedBikes.length})</CardTitle>
          <CardDescription>
            All bikes in your rental fleet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort('registration')}>
                  <div className="flex items-center gap-2">
                    Registration
                    {getSortIcon('registration')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('make')}>
                  <div className="flex items-center gap-2">
                    Make/Model
                    {getSortIcon('make')}
                  </div>
                </TableHead>
                <TableHead>Year</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-2">
                    Status
                    {getSortIcon('status')}
                  </div>
                </TableHead>
                <TableHead className="text-right">Daily Rate</TableHead>
                <TableHead className="text-right">Current Value</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedBikes.map((bike) => (
                <TableRow key={bike._id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {bike.registration}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{bike.make} {bike.model}</div>
                      {bike.color && (
                        <div className="text-sm text-muted-foreground">{bike.color}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{bike.year}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(bike.status)}>
                      {bike.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(bike.dailyRate)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {bike.currentValue ? formatCurrency(bike.currentValue) : '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(bike._id)}
                      className="text-destructive hover:text-destructive"
                      disabled={bike.status === 'On Hire'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredAndSortedBikes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {searchQuery || statusFilter !== 'all'
                        ? 'No bikes match your search criteria'
                        : 'No bikes in fleet. Add your first bike to get started.'}
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