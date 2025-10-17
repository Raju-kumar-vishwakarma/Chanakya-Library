import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/admin/StatsCard";
import {
  Users,
  UserCheck,
  Clock,
  TrendingUp,
  LogOut,
  Settings,
  BookOpen,
  Menu,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    avgDuration: "0h",
    weeklyGrowth: "+0%",
  });

  useEffect(() => {
    checkAuth();
    fetchStats();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }

    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (roleError || !roleData || roleData.role !== "admin") {
      navigate("/student");
    }
  };

  const fetchStats = async () => {
    try {
      const { count: studentCount } = await supabase
        .from("user_roles" as any)
        .select("*", { count: "exact", head: true })
        .eq("role", "student");

      const today = new Date().toISOString().split("T")[0];
      const { count: todayCount } = await supabase
        .from("attendance" as any)
        .select("*", { count: "exact", head: true })
        .gte("check_in", `${today}T00:00:00`)
        .lte("check_in", `${today}T23:59:59`);

      setStats({
        totalStudents: studentCount || 0,
        presentToday: todayCount || 0,
        avgDuration: "2h 30m",
        weeklyGrowth: "+12%",
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <BookOpen className="h-7 w-7 text-primary" />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Chanakya Library
              </h1>
              <p className="text-xs text-muted-foreground">Admin Dashboard</p>
            </div>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/admin/students")}
            >
              <Users className="h-4 w-4 mr-2" /> Students
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/attendance")}
            >
              <UserCheck className="h-4 w-4 mr-2" /> Attendance
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/settings")}
            >
              <Settings className="h-4 w-4 mr-2" /> Settings
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowMenu(!showMenu)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {showMenu && (
          <div className="md:hidden border-t border-border/40 bg-card py-2 space-y-2 px-4">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/admin/students")}
            >
              <Users className="h-4 w-4 mr-2" /> Manage Students
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/admin/attendance")}
            >
              <UserCheck className="h-4 w-4 mr-2" /> Attendance
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/admin/settings")}
            >
              <Settings className="h-4 w-4 mr-2" /> Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        )}
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-6">
        {/* Title */}
        <div className="mb-6 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
            Welcome back, Admin
          </h2>
          <p className="text-sm text-muted-foreground">
            Here's what's happening in your library today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Total Students" value={stats.totalStudents} icon={Users} trend="Active" />
          <StatsCard title="Present Today" value={stats.presentToday} icon={UserCheck} trend="In library" trendUp />
          <StatsCard title="Avg. Duration" value={stats.avgDuration} icon={Clock} trend="Per visit" />
          <StatsCard title="Weekly Growth" value={stats.weeklyGrowth} icon={TrendingUp} trend="vs last week" trendUp />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            onClick={() => navigate("/admin/students")}
            className="h-28 text-sm sm:text-base flex flex-col items-center justify-center bg-gradient-to-br from-primary to-primary-glow hover:opacity-90"
          >
            <Users className="h-6 w-6 mb-1" />
            Student Management
          </Button>

          <Button
            onClick={() => navigate("/admin/attendance")}
            className="h-28 text-sm sm:text-base flex flex-col items-center justify-center bg-gradient-to-br from-secondary to-secondary hover:opacity-90"
          >
            <UserCheck className="h-6 w-6 mb-1" />
            Attendance Records
          </Button>

          <Button
            onClick={() => navigate("/admin/reports-enhanced")}
            className="h-28 text-sm sm:text-base flex flex-col items-center justify-center bg-gradient-to-br from-accent to-accent hover:opacity-90"
          >
            <TrendingUp className="h-6 w-6 mb-1" />
            Reports & Analytics
          </Button>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;