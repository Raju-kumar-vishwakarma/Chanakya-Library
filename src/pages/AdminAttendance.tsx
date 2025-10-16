import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Download } from "lucide-react";
import { format } from "date-fns";

interface AttendanceRecord {
  id: string;
  check_in: string;
  check_out: string | null;
  purpose: string | null;
  profiles: {
    full_name: string;
    student_id: string;
  };
}

const AdminAttendance = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    checkAuth();
    fetchAttendance();
  }, [selectedDate]);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
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

  const fetchAttendance = async () => {
    try {
      const { data: attendanceData, error: attendanceError } = await supabase
        .from("attendance")
        .select("*")
        .gte("check_in", `${selectedDate}T00:00:00`)
        .lte("check_in", `${selectedDate}T23:59:59`)
        .order("check_in", { ascending: false });

      if (attendanceError || !attendanceData) {
        setRecords([]);
        return;
      }

      const userIds = attendanceData.map((a: any) => a.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, student_id")
        .in("id", userIds);

      if (profilesError || !profilesData) {
        setRecords([]);
        return;
      }

      const recordsWithProfiles = attendanceData.map((attendance: any) => {
        const profile = profilesData.find(
          (p: any) => p.id === attendance.user_id
        );
        return {
          ...attendance,
          profiles: {
            full_name: profile?.full_name || "Unknown",
            student_id: profile?.student_id || "N/A",
          },
        };
      });

      setRecords(recordsWithProfiles);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (checkIn: string, checkOut: string | null) => {
    if (!checkOut) return "In Progress";
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.abs(end.getTime() - start.getTime());
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted mt-8">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin")}
              className="hover:bg-muted text-sm sm:text-base"
            >
              <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Attendance Records
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                View and manage attendance
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <Card className="border-border/50 shadow-medium">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                Attendance for {format(new Date(selectedDate), "MMMM dd, yyyy")}
              </CardTitle>

              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground w-full sm:w-auto"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto hover:border-primary hover:text-primary"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : records.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm sm:text-base">
                No attendance records found for this date.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.profiles.student_id}
                        </TableCell>
                        <TableCell>{record.profiles.full_name}</TableCell>
                        <TableCell>
                          {format(new Date(record.check_in), "hh:mm a")}
                        </TableCell>
                        <TableCell>
                          {record.check_out
                            ? format(new Date(record.check_out), "hh:mm a")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {calculateDuration(record.check_in, record.check_out)}
                        </TableCell>
                        <TableCell>{record.purpose || "Study"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              record.check_out ? "secondary" : "default"
                            }
                          >
                            {record.check_out
                              ? "Completed"
                              : "In Progress"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminAttendance;