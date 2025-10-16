import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ArrowLeft, UserPlus, Trash2, Edit } from "lucide-react";
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
      .single();

    if (roleError || !roleData || roleData.role !== "admin") {
      navigate("/student");
    }
  };

  const fetchStudents = async () => {
    try {
      const { data: studentRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "student");

      if (rolesError || !studentRoles) {
        setStudents([]);
        setLoading(false);
        return;
      }

      const userIds = studentRoles.map((r: any) => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds)
        .order("created_at", { ascending: false });

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        setStudents([]);
      } else {
        setStudents(profiles || []);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const { data: adminRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      if (rolesError || !adminRoles) {
        setAdmins([]);
        return;
      }

      const userIds = adminRoles.map((r: any) => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds)
        .order("created_at", { ascending: false });

      if (profilesError) {
        console.error("Error fetching admin profiles:", profilesError);
        setAdmins([]);
      } else {
        setAdmins(profiles || []);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      setAdmins([]);
    }
  };

  const fetchSeatsInfo = async () => {
    try {
      // Get total seats from settings
      const { data: settings } = await supabase
        .from("library_settings")
        .select("total_seats")
        .single();
      
      if (settings) {
        setTotalSeats(settings.total_seats);
      }

      // Count currently checked-in students (occupied seats)
      const today = new Date().toISOString().split("T")[0];
      const { data: attendance } = await supabase
        .from("attendance")
        .select("id")
        .gte("check_in", `${today}T00:00:00`)
        .is("check_out", null);

      setOccupiedSeats(attendance?.length || 0);
    } catch (error) {
      console.error("Error fetching seats info:", error);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: newStudent.email,
        password: newStudent.password,
        options: {
          data: {
            full_name: newStudent.fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      if (data.user) {
        await supabase
          .from("profiles")
          .update({
            student_id: newStudent.studentId,
            seat_number: newStudent.seatNumber || null,
            phone: newStudent.phone || null,
          })
          .eq("id", data.user.id);

        await supabase
          .from("user_roles")
          .insert({
            user_id: data.user.id,
            role: "student",
          });

        toast({
          title: "Student added!",
          description: "New student has been successfully registered.",
        });

        setIsDialogOpen(false);
        setNewStudent({
          fullName: "",
          email: "",
          studentId: "",
          seatNumber: "",
          phone: "",
          password: "",
        });
        fetchStudents();
        fetchSeatsInfo();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to add student",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: newAdmin.email,
        password: newAdmin.password,
        options: {
          data: {
            full_name: newAdmin.fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      if (data.user) {
        await supabase
          .from("user_roles")
          .insert({
            user_id: data.user.id,
            role: "admin",
          });

        toast({
          title: "Admin added!",
          description: "New admin has been successfully created.",
        });

        setIsAdminDialogOpen(false);
        setNewAdmin({
          fullName: "",
          email: "",
          password: "",
        });
        fetchAdmins();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to add admin",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      const { error } = await supabase.auth.admin.deleteUser(studentId);
      if (error) throw error;

      toast({
        title: "Student deleted",
        description: "Student has been successfully removed.",
      });

      fetchStudents();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete student",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin")}
              className="hover:bg-muted sm:w-auto sm:h-auto sm:px-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Back</span>
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Student Management
              </h1>
              <p className="text-sm text-muted-foreground">
                Add, edit, or remove students
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-md w-full sm:w-auto justify-center">
            <div className="text-sm text-center sm:text-left">
              <div className="font-semibold">Available Seats: {totalSeats - occupiedSeats}/{totalSeats}</div>
              <div className="text-muted-foreground">Currently occupied: {occupiedSeats}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Admins Section */}
        <Card className="border-border/50 shadow-medium">
          <CardHeader>
            <CardTitle>All Admins</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : admins.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No admins found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">{admin.full_name}</TableCell>
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
        <Card className="border-border/50 shadow-medium">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle>All Students</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-accent hover:bg-accent/10 w-full sm:w-auto">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Admin
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[90vw] sm:max-w-md rounded-lg">
                    <DialogHeader>
                      <DialogTitle>Add New Admin</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddAdmin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="adminFullName">Full Name</Label>
                        <Input
                          id="adminFullName"
                          value={newAdmin.fullName}
                          onChange={(e) =>
                            setNewAdmin({ ...newAdmin, fullName: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adminEmail">Email</Label>
                        <Input
                          id="adminEmail"
                          type="email"
                          value={newAdmin.email}
                          onChange={(e) =>
                            setNewAdmin({ ...newAdmin, email: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adminPassword">Password</Label>
                        <Input
                          id="adminPassword"
                          type="password"
                          value={newAdmin.password}
                          onChange={(e) =>
                            setNewAdmin({ ...newAdmin, password: e.target.value })
                          }
                          required
                          minLength={6}
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-accent to-accent/80"
                      >
                        Add Admin
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 w-full sm:w-auto">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[90vw] sm:max-w-md rounded-lg">
                    <DialogHeader>
                      <DialogTitle>Add New Student</DialogTitle>
                    </DialogHeader>
                  <form onSubmit={handleAddStudent} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={newStudent.fullName}
                        onChange={(e) =>
                          setNewStudent({ ...newStudent, fullName: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newStudent.email}
                        onChange={(e) =>
                          setNewStudent({ ...newStudent, email: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="studentId">Student ID</Label>
                      <Input
                        id="studentId"
                        value={newStudent.studentId}
                        onChange={(e) =>
                          setNewStudent({ ...newStudent, studentId: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="seatNumber">Seat Number (Optional)</Label>
                      <Input
                        id="seatNumber"
                        value={newStudent.seatNumber}
                        onChange={(e) =>
                          setNewStudent({ ...newStudent, seatNumber: e.target.value })
                        }
                        placeholder="e.g., A-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (Optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={newStudent.phone}
                        onChange={(e) =>
                          setNewStudent({ ...newStudent, phone: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newStudent.password}
                        onChange={(e) =>
                          setNewStudent({ ...newStudent, password: e.target.value })
                        }
                        required
                        minLength={6}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-primary to-secondary"
                    >
                      Add Student
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : students.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No students found. Add your first student to get started.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Seat No.</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.student_id}
                        </TableCell>
                        <TableCell>{student.full_name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell className="font-medium text-primary">
                          {student.seat_number || "-"}
                        </TableCell>
                        <TableCell>{student.phone || "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
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
