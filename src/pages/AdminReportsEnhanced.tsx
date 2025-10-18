import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Download, FileText, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToExcel, exportToPDF, calculateDuration } from "@/utils/reportExport";

const AdminReportsEnhanced = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState("daily");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedStudent, setSelectedStudent] = useState("all");
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
    fetchStudents();
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
      .maybeSingle();

    if (roleError || !roleData || roleData.role !== "admin") {
      navigate("/student");
    }
  };

  const fetchStudents = async () => {
    try {
      const { data: studentRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "student");

      if (studentRoles && studentRoles.length > 0) {
        const userIds = studentRoles.map((r: any) => r.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .in("id", userIds);

        setStudents(profiles || []);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const generateReport = async (format: "excel" | "pdf") => {
    setLoading(true);
    try {
      let query = supabase
        .from("attendance")
        .select("*")
        .gte("check_in", `${startDate}T00:00:00`)
        .lte("check_in", `${endDate}T23:59:59`);

      if (selectedStudent !== "all") {
        query = query.eq("user_id", selectedStudent);
      }

      const { data: attendanceData, error } = await query.order("check_in", {
        ascending: false,
      });

      if (error) throw error;

      if (!attendanceData || attendanceData.length === 0) {
        toast({
          title: "No data found",
          description: "No attendance records found for the selected criteria.",
          variant: "destructive",
        });
        return;
      }

     const userIds = Array.from(
        new Set(attendanceData.map((r: any) => r.user_id).filter(Boolean))
      );

      let profileMap: Record<string, { full_name: string | null; student_id: string | null }> = {};
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, student_id")
          .in("id", userIds);
        if (profilesError) throw profilesError;
        profileMap = Object.fromEntries(
          (profilesData || []).map((p: any) => [p.id, { full_name: p.full_name, student_id: p.student_id }])
        );
      }

      const formattedData = (attendanceData || []).map((record: any) => {
        const prof = profileMap[record.user_id] || {};
        return {
          student_id: (prof as any).student_id || "N/A",
          student_name: (prof as any).full_name || "Unknown User",
          check_in: record.check_in,
          check_out: record.check_out,
          duration: calculateDuration(record.check_in, record.check_out),
          date: new Date(record.check_in).toLocaleDateString(),
        };
      });

      const filename = `attendance_report_${startDate}_to_${endDate}`;
      const title = `Attendance Report (${startDate} to ${endDate})`;

      if (format === "excel") {
        exportToExcel(formattedData, filename);
      } else {
        exportToPDF(formattedData, filename, title);
      }

      toast({
        title: "Report generated!",
        description: `Report has been downloaded as ${format.toUpperCase()}.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to generate report",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted mb-8">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/admin")}
              className="hover:bg-muted"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Reports & Analytics
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Generate and export attendance reports
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Report Configuration */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Report Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily Report</SelectItem>
                      <SelectItem value="weekly">Weekly Report</SelectItem>
                      <SelectItem value="monthly">Monthly Report</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Student Filter</Label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Students" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      {students.map((student: any) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.full_name} ({student.student_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 space-y-2">
                  <Button
                    onClick={() => generateReport("excel")}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary to-secondary"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export to Excel
                  </Button>
                  <Button
                    onClick={() => generateReport("pdf")}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export to PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Reports */}
          <div className="lg:col-span-2">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-border/50 shadow-medium hover:shadow-strong transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Today's Report
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Download attendance report for today
                  </p>
                  <Button
                    onClick={() => {
                      const today = new Date().toISOString().split("T")[0];
                      setStartDate(today);
                      setEndDate(today);
                      setSelectedStudent("all");
                      setTimeout(() => generateReport("excel"), 100);
                    }}
                    className="w-full bg-gradient-to-r from-primary to-primary-glow"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Today's Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-medium hover:shadow-strong transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-secondary" />
                    This Week
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Download attendance report for this week
                  </p>
                  <Button
                    onClick={() => {
                      const today = new Date();
                      const weekStart = new Date(today);
                      weekStart.setDate(today.getDate() - today.getDay());
                      setStartDate(weekStart.toISOString().split("T")[0]);
                      setEndDate(today.toISOString().split("T")[0]);
                      setSelectedStudent("all");
                      setTimeout(() => generateReport("excel"), 100);
                    }}
                    className="w-full bg-gradient-to-r from-secondary to-secondary"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Weekly Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-medium hover:shadow-strong transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-accent" />
                    This Month
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Download attendance report for this month
                  </p>
                  <Button
                    onClick={() => {
                      const today = new Date();
                      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                      setStartDate(monthStart.toISOString().split("T")[0]);
                      setEndDate(today.toISOString().split("T")[0]);
                      setSelectedStudent("all");
                      setTimeout(() => generateReport("excel"), 100);
                    }}
                    className="w-full bg-gradient-to-r from-accent to-accent"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Monthly Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-medium hover:shadow-strong transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    All Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Download complete attendance history
                  </p>
                  <Button
                    onClick={() => {
                      setStartDate("2020-01-01");
                      setEndDate(new Date().toISOString().split("T")[0]);
                      setSelectedStudent("all");
                      setTimeout(() => generateReport("excel"), 100);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download All Records
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminReportsEnhanced;