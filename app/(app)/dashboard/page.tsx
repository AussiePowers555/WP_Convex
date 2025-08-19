"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RefreshCw, Briefcase, Bike, Contact, DollarSign, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  // Convex queries for dashboard data
  const caseStats = useQuery(api.cases.getStats);
  const fleetStats = useQuery(api.bikes.getStats);
  const contactStats = useQuery(api.contacts.getStats);
  const recentCases = useQuery(api.cases.list, { limit: 5 });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
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

  if (!caseStats || !fleetStats || !contactStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your motorbike rental management system</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{caseStats.totalCases}</div>
            <p className="text-xs text-muted-foreground">
              Active rental cases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fleet Size</CardTitle>
            <Bike className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fleetStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {fleetStats.available} available, {fleetStats.onHire} on hire
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Contact className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactStats.total}</div>
            <p className="text-xs text-muted-foreground">
              Business partners
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fleet Utilization</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(fleetStats.utilizationRate)}%</div>
            <p className="text-xs text-muted-foreground">
              Current utilization rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(caseStats.totalInvoiced)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(caseStats.averageInvoiced)} per case
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(caseStats.totalPaid)}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(caseStats.collectionRate)}% collection rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(caseStats.totalOutstanding)}</div>
            <p className="text-xs text-muted-foreground">
              Pending collections
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Cases and Fleet Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cases */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCases && recentCases.length > 0 ? (
                recentCases.slice(0, 5).map((case_) => (
                  <div key={case_._id} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                    <div className="flex-1">
                      <div className="font-medium">{case_.caseNumber}</div>
                      <div className="text-sm text-muted-foreground">{case_.nafName}</div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(case_.status)}>{case_.status}</Badge>
                      <div className="text-sm text-muted-foreground mt-1">
                        {formatCurrency(case_.invoiced - case_.paid)} outstanding
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No cases found. Create your first case to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fleet Status */}
        <Card>
          <CardHeader>
            <CardTitle>Fleet Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Available Bikes</span>
                <Badge className="bg-green-100 text-green-800">{fleetStats.available}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">On Hire</span>
                <Badge className="bg-blue-100 text-blue-800">{fleetStats.onHire}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">In Service</span>
                <Badge className="bg-yellow-100 text-yellow-800">{fleetStats.inService}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">In Repair</span>
                <Badge className="bg-red-100 text-red-800">{fleetStats.inRepair}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Unavailable</span>
                <Badge className="bg-gray-100 text-gray-800">{fleetStats.unavailable}</Badge>
              </div>
              
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Fleet Value</span>
                  <span className="text-sm font-bold">{formatCurrency(fleetStats.totalValue)}</span>
                </div>
                
                {fleetStats.upcomingServiceCount > 0 && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded-lg">
                    <div className="text-sm text-yellow-800">
                      ⚠️ {fleetStats.upcomingServiceCount} bike(s) due for service in the next 30 days
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Case Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Case Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(caseStats.statusCounts).map(([status, count]) => (
              <div key={status} className="text-center">
                <div className="text-2xl font-bold">{count}</div>
                <Badge className={getStatusColor(status)} variant="secondary">
                  {status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}