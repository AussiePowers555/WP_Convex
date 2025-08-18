"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Bike,
  Users,
  Building2,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  loading = false 
}: { 
  title: string;
  value: string | number;
  description?: string;
  icon: any;
  trend?: { value: number; isPositive: boolean };
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24" />
          {description && <Skeleton className="h-4 w-32 mt-2" />}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
            )}
            <span className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

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

export default function DashboardPage() {
  // Fetch data from Convex
  const caseStats = useQuery(api.cases.getStats, {});
  const bikeStats = useQuery(api.bikes.getStats);
  const contactStats = useQuery(api.contacts.getStats);
  const recentCases = useQuery(api.cases.list, { limit: 5 });
  const availableBikes = useQuery(api.bikes.getAvailable);

  // Loading state
  const isLoading = !caseStats || !bikeStats || !contactStats;

  // Calculate collection rate
  const collectionRate = caseStats && caseStats.totalInvoiced > 0 
    ? Math.round((caseStats.totalPaid / caseStats.totalInvoiced) * 100)
    : 0;

  // Prepare chart data for case status distribution
  const statusChartData = caseStats?.statusCounts 
    ? Object.entries(caseStats.statusCounts).map(([status, count]) => ({
        status: status.replace(/([A-Z])/g, ' $1').trim(),
        count: count as number,
      }))
    : [];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {new Date().toLocaleDateString('en-AU', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Invoiced"
          value={formatCurrency(caseStats?.totalInvoiced || 0)}
          description={`${caseStats?.totalCases || 0} active cases`}
          icon={DollarSign}
          loading={isLoading}
        />
        <StatCard
          title="Total Paid"
          value={formatCurrency(caseStats?.totalPaid || 0)}
          description={`${collectionRate}% collection rate`}
          icon={TrendingUp}
          trend={{ value: collectionRate, isPositive: collectionRate > 70 }}
          loading={isLoading}
        />
        <StatCard
          title="Outstanding"
          value={formatCurrency(caseStats?.totalOutstanding || 0)}
          description="Pending collection"
          icon={AlertCircle}
          loading={isLoading}
        />
        <StatCard
          title="Available Bikes"
          value={`${bikeStats?.available || 0}/${bikeStats?.total || 0}`}
          description={`${bikeStats?.utilizationRate?.toFixed(1) || 0}% utilization`}
          icon={Bike}
          loading={isLoading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Case Status Distribution */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Case Status Distribution</CardTitle>
            <CardDescription>Current status of all cases</CardDescription>
          </CardHeader>
          <CardContent>
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="status" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No case data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fleet Overview */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Fleet Status</CardTitle>
            <CardDescription>Current bike availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Available</span>
                <span className="text-sm font-bold">{bikeStats?.available || 0}</span>
              </div>
              <Progress value={(bikeStats?.available || 0) / (bikeStats?.total || 1) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">On Hire</span>
                <span className="text-sm font-bold">{bikeStats?.onHire || 0}</span>
              </div>
              <Progress value={(bikeStats?.onHire || 0) / (bikeStats?.total || 1) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Service/Repair</span>
                <span className="text-sm font-bold">{(bikeStats?.inService || 0) + (bikeStats?.inRepair || 0)}</span>
              </div>
              <Progress value={((bikeStats?.inService || 0) + (bikeStats?.inRepair || 0)) / (bikeStats?.total || 1) * 100} className="h-2" />
            </div>
            {bikeStats?.upcomingServiceCount && bikeStats.upcomingServiceCount > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  {bikeStats.upcomingServiceCount} bike{bikeStats.upcomingServiceCount !== 1 ? 's' : ''} due for service
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Cases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Cases</CardTitle>
          <CardDescription>Latest case activities</CardDescription>
        </CardHeader>
        <CardContent>
          {recentCases && recentCases.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case Number</TableHead>
                  <TableHead>NAF Client</TableHead>
                  <TableHead>AF Party</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Invoiced</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCases.map((case_) => (
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
                      {formatCurrency(case_.invoiced - case_.paid)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No cases found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactStats?.total || 0}</div>
            <div className="text-xs text-muted-foreground space-y-1 mt-2">
              <div>{contactStats?.lawyers || 0} Lawyers</div>
              <div>{contactStats?.rentalCompanies || 0} Rental Companies</div>
              <div>{contactStats?.insurers || 0} Insurers</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Fleet Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(bikeStats?.totalValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Avg: {formatCurrency(bikeStats?.averageValue || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Average Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(caseStats?.averageInvoiced || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Per case
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{caseStats?.totalCases || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Total in system
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}