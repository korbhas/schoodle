import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  MessageSquare,
  Map,
  ShoppingBag,
  Bell,
  LogOut,
  Menu,
  User,
  GraduationCap,
  Calendar,
  FileText,
  Users as UsersIcon,
  Calendar as CalendarIcon,
  MessageSquare as MessageSquareIcon,
  Bot,
  BarChart3
} from 'lucide-react';
import { useState } from 'react';

const adminNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Students', href: '/students', icon: Users },
  { name: 'Courses', href: '/courses', icon: BookOpen },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Map', href: '/map', icon: Map },
  { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
  { name: 'Notifications', href: '/notifications', icon: Bell }
];

const studentNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Profile', href: '/student/profile', icon: User },
  { name: 'Courses', href: '/courses', icon: BookOpen },
  { name: 'Chat', href: '/student/chat', icon: Bot },
  { name: 'Grades', href: '/student/grades', icon: GraduationCap },
  { name: 'Attendance', href: '/student/attendance', icon: Calendar },
  { name: 'Assignments', href: '/student/assignments', icon: FileText },
  { name: 'Clubs', href: '/student/clubs', icon: UsersIcon },
  { name: 'Events', href: '/student/events', icon: CalendarIcon },
  { name: 'Forum', href: '/student/forum', icon: MessageSquareIcon }
];

const teacherNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Courses', href: '/courses', icon: BookOpen },
  { name: 'Analytics', href: '/teacher/analytics', icon: BarChart3 },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Notifications', href: '/notifications', icon: Bell }
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';
  const navigation = isStudent ? studentNavigation : (isTeacher ? teacherNavigation : adminNavigation);

  return (
    <div className="flex h-screen bg-background">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } border-r bg-card transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-xl font-bold text-primary">Schoodle</h1>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || 
              (item.href !== '/' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.full_name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.role || ''}</p>
              </div>
            )}
          </div>
          <Button variant="outline" className="w-full" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            {sidebarOpen && 'Logout'}
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

