import {
    getAllEmployees,
    getDocumentCountByStatus,
    getRecentDocuments,
} from "@/lib/db";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    FileText,
    Users,
    CheckCircle,
    Clock,
    BarChart3,
    PieChart,
    TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DocumentStatusChart } from "@/components/dashboard/document-status-chart";
import { EmployeePositionChart } from "@/components/dashboard/employee-position-chart";
import { DocumentCategoryChart } from "@/components/dashboard/document-category-chart";
import { RecentActivityList } from "@/components/dashboard/recent-activity-list";
import { DocumentExpiryTimeline } from "@/components/dashboard/document-expiry-timeline";
import { EmployeeTable } from "@/components/dashboard/employee-table";
import { DashboardFilter } from "@/components/dashboard/dashboard-filter";

export default async function DashboardPage() {
    // Fetch data for dashboard using Drizzle
    const employees = await getAllEmployees();

    // Get document statistics using Drizzle
    const {
        active: activeDocuments,
        expiringSoon: expiringDocuments,
        expired: expiredDocuments,
    } = await getDocumentCountByStatus();

    const totalDocuments =
        activeDocuments + expiringDocuments + expiredDocuments;

    // Get recent activities (10 most recent documents)
    const recentActivities = await getRecentDocuments(10);

    return (
        <div className="container mx-auto py-8 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <DashboardFilter />
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <DashboardStats
                    title="Total Employees"
                    value={employees.length}
                    icon={<Users className="h-5 w-5 text-blue-500" />}
                    description="Registered employees"
                    trend={{ value: 12, isPositive: true }}
                />
                <DashboardStats
                    title="Total Documents"
                    value={totalDocuments}
                    icon={<FileText className="h-5 w-5 text-gray-500" />}
                    description="Uploaded documents"
                    trend={{ value: 8, isPositive: true }}
                />
                <DashboardStats
                    title="Expiring Soon"
                    value={expiringDocuments}
                    icon={<Clock className="h-5 w-5 text-yellow-500" />}
                    description="Documents expiring soon"
                    trend={{ value: 5, isPositive: false }}
                />
                <DashboardStats
                    title="Active Documents"
                    value={activeDocuments}
                    icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                    description="Valid documents"
                    trend={{ value: 3, isPositive: true }}
                />
            </div>

            {/* Charts and Activity */}
            <Tabs defaultValue="overview" className="mb-8">
                <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="employees">Employees</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Document Status Chart */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg">
                                        Document Status
                                    </CardTitle>
                                    <CardDescription>
                                        Overview of document statuses
                                    </CardDescription>
                                </div>
                                <PieChart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <DocumentStatusChart
                                    active={activeDocuments}
                                    expiringSoon={expiringDocuments}
                                    expired={expiredDocuments}
                                />
                            </CardContent>
                        </Card>

                        {/* Employee Position Chart */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg">
                                        Employees by Academic Rank
                                    </CardTitle>
                                    <CardDescription>
                                        Distribution across positions
                                    </CardDescription>
                                </div>
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <EmployeePositionChart employees={employees} />
                            </CardContent>
                        </Card>

                        {/* Document Category Chart */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg">
                                        Documents by Category
                                    </CardTitle>
                                    <CardDescription>
                                        Distribution of document types
                                    </CardDescription>
                                </div>
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <DocumentCategoryChart
                                    documents={recentActivities}
                                />
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg">
                                        Recent Activity
                                    </CardTitle>
                                    <CardDescription>
                                        Latest document uploads
                                    </CardDescription>
                                </div>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <RecentActivityList
                                    activities={recentActivities}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="documents">
                    <Card>
                        <CardHeader>
                            <CardTitle>Document Expiry Timeline</CardTitle>
                            <CardDescription>
                                Upcoming document expirations
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DocumentExpiryTimeline
                                documents={recentActivities}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="employees">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Employee Directory</CardTitle>
                                <CardDescription>
                                    Quick access to employee information
                                </CardDescription>
                            </div>
                            <Link href="/employees">
                                <Button variant="outline" size="sm">
                                    View All
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <EmployeeTable employees={employees.slice(0, 5)} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="activity">
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity Log</CardTitle>
                            <CardDescription>
                                Recent system activities
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RecentActivityList
                                activities={recentActivities}
                                extended={true}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Document Management</CardTitle>
                        <CardDescription>
                            Manage all your organization's documents in one
                            place
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">
                            Upload, categorize, and track documents with
                            expiration dates. Keep your important files
                            organized and accessible.
                        </p>
                        <Link href="/documents">
                            <Button className="gap-2">
                                <FileText className="h-4 w-4" />
                                Manage Documents
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Employee Records</CardTitle>
                        <CardDescription>
                            Maintain comprehensive employee information
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">
                            Store and manage employee details including academic
                            ranks, educational attainment, and profile pictures.
                        </p>
                        <Link href="/employees">
                            <Button className="gap-2">
                                <Users className="h-4 w-4" />
                                Manage Employees
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
