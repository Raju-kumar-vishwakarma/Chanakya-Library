import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ArrowLeft, UserPlus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  full_name: string;
  email: string;
  student_id: string;
  seat_number: string | null;
  phone: string | null;
  created_at: string;
}

interface Admin {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

const AdminStudents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [totalSeats, setTotalSeats] = useState(100);
  const [occupiedSeats, setOccupiedSeats] = useState(0);
  const [newStudent, setNewStudent] = useState({
    fullName: "",
    email: "",
    studentId: "",
    seatNumber: "",
    phone: "",
    password: "",
  });
  const [newAdmin, setNewAdmin] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [timeSlots, setTimeSlots] = useState<Array<{ start: string; end: string }>>([
    { start: "", end: "" },
  ]);

  useEffect(() => {
    checkAuth();
    fetchStudents();
    fetchAdmins();
    fetchSeatsInfo();
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

      const userIds = studentRoles?.map((r: any) => r.user_id) || [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds)
        .order("created_at", { ascending: false });

      setStudents(profiles || []);
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      const userIds = adminRoles?.map((r: any) => r.user_id) || [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds)
        .order("created_at", { ascending: false });

      setAdmins(profiles || []);
    } catch {
      setAdmins([]);
    }
  };

  const fetchSeatsInfo = async () => {
    try {
      const { data: settings } = await supabase
        .from("library_settings")
        .select("total_seats")
        .single();
      if (settings) setTotalSeats(settings.total_seats);

      const today = new Date().toISOString().split("T")[0];
      const { data: attendance } = await supabase
        .from("attendance")
        .select("id")
        .gte("check_in", `${today}T00:00:00`)
        .is("check_out", null);

      setOccupiedSeats(attendance?.length || 0);
    } catch {}
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      const { error } = await supabase.functions.invoke("delete-user", {
        body: { user_id: studentId },
      });
      if (error) throw error;
      toast({ title: "Student deleted", description: "Successfully removed." });
      fetchStudents();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin")}
              className="hover:bg-muted px-2 sm:px-3"
            >
              <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Student Management
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Add, edit, or remove students
              </p>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-right">
            <div className="font-semibold">
              Seats: {totalSeats - occupiedSeats}/{totalSeats}
            </div>
            <div className="text-muted-foreground">
              Occupied: {occupiedSeats}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6">
        {/* Admins Section */}
        <Card className="border-border/50 shadow-md">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">All Admins</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : admins.length === 0 ? (
              <p className="text-center text-muted-foreground py-6 text-sm">
                No admins found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-[600px] sm:min-w-full text-xs sm:text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell>{admin.full_name}</TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>
                          {new Date(admin.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Students Section */}
        <Card className="border-border/50 shadow-md">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-base sm:text-lg">All Students</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="text-xs sm:text-sm border-accent hover:bg-accent/10"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Admin
                    </Button>
                  </DialogTrigger>
                </Dialog>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="text-xs sm:text-sm bg-gradient-to-r from-primary to-secondary">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Student
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : students.length === 0 ? (
              <p className="text-center text-muted-foreground py-6 text-sm">
                No students found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-[700px] sm:min-w-full text-xs sm:text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Seat</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.student_id}</TableCell>
                        <TableCell>{student.full_name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.seat_number || "-"}</TableCell>
                        <TableCell>{student.phone || "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStudent(student.id)}
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

export default AdminStudents;