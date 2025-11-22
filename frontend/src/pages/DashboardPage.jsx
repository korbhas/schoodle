import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, BookOpen, MessageSquare } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    { name: 'Total Students', value: '0', icon: Users, color: 'text-blue-600' },
    { name: 'Active Courses', value: '0', icon: BookOpen, color: 'text-green-600' },
    { name: 'Messages', value: '0', icon: MessageSquare, color: 'text-purple-600' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.full_name || 'User'}!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">Last updated: Just now</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
              <h3 className="font-semibold mb-1">View Courses</h3>
              <p className="text-sm text-muted-foreground">Manage and view all courses</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
              <h3 className="font-semibold mb-1">Student Management</h3>
              <p className="text-sm text-muted-foreground">View and manage students</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

