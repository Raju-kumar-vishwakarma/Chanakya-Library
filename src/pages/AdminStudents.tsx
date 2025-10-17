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
      // Validate time slots
      const invalidSlot = timeSlots.some((s) => !s.start || !s.end || s.start >= s.end);
      if (invalidSlot) {
        toast({ variant: "destructive", title: "Invalid time slot", description: "Please ensure each slot has a start time earlier than end time." });
        setLoading(false);
        return;
      }

      // Create student securely via backend function
      const { data, error } = await supabase.functions.invoke("create-student", {
        body: {
          email: newStudent.email,
          password: newStudent.password,
          full_name: newStudent.fullName,
        },
      });

      if (error) throw error;
      const createdUser = (data as any)?.user;
      if (!createdUser?.id) throw new Error("User creation failed");

      // Upsert profile for the new user
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: createdUser.id,
        full_name: newStudent.fullName,
        email: newStudent.email,
        student_id: newStudent.studentId,
        seat_number: newStudent.seatNumber || null,
        phone: newStudent.phone || null,
      }, { onConflict: "id" });
      if (profileError) throw profileError;

      // Insert time slots if provided
      const cleanSlots = timeSlots.filter((s) => s.start && s.end).map((s) => ({
        user_id: createdUser.id,
        start_time: s.start,
        end_time: s.end,
      }));
      if (cleanSlots.length > 0) {
        const { error: slotsError } = await supabase.from("student_time_slots").insert(cleanSlots);
        if (slotsError) throw slotsError;
      }

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
      setTimeSlots([{ start: "", end: "" }]);
      fetchStudents();
      fetchSeatsInfo();
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
      // Create admin securely via backend function
      const { data, error } = await supabase.functions.invoke("create-admin", {
        body: {
          email: newAdmin.email,
          password: newAdmin.password,
          full_name: newAdmin.fullName,
        },
      });

      if (error) throw error;
      const createdUser = (data as any)?.user;
      if (!createdUser?.id) throw new Error("Admin creation failed");

      // Ensure a profile exists for admin so they appear in lists
      await supabase.from("profiles").upsert({
        id: createdUser.id,
        full_name: newAdmin.fullName,
        email: newAdmin.email,
      }, { onConflict: "id" });

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
      const { error } = await supabase.functions.invoke("delete-user", {
        body: { user_id: studentId },
      });
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted mb-8">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
  <div className="container mx-auto px-3 sm:px-6 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
    {/* Left Section: Back + Title */}
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        onClick={() => navigate("/admin")}
        className="hover:bg-muted text-sm sm:text-base"
      >
        <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
        Back
      </Button>

      <div>
        <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-500 to-green-500 text-transparent bg-clip-text">
          Student Management
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Add, edit, or remove students
        </p>
      </div>
    </div>

    {/* Seats Info */}
    <div className="text-center sm:text-right mt-1 sm:mt-0">
      <div className="text-sm sm:text-base font-semibold text-gray-900">
        Available Seats:{" "}
        <span className="text-blue-600 font-bold">
          {totalSeats - occupiedSeats}/{totalSeats}
        </span>{" "}
        <span className="text-gray-500 font-normal">Occupied: {occupiedSeats}</span>
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
            )}
          </CardContent>
        </Card>

        {/* Students Section */}
        <Card className="border-border/50 shadow-medium">
  <CardHeader>
    {/* Flex container is now responsive */}
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <CardTitle>All Students</CardTitle>
      {/* Button container is also responsive */}
      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
        <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-accent hover:bg-accent/10 justify-center">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Admin</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              {/* --- Admin form fields go here --- */}
              <div className="space-y-2">
                <Label htmlFor="adminFullName">Full Name</Label>
                <Input id="adminFullName" value={newAdmin.fullName} onChange={(e) => setNewAdmin({ ...newAdmin, fullName: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Email</Label>
                <Input id="adminEmail" type="email" value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminPassword">Password</Label>
                <Input id="adminPassword" type="password" value={newAdmin.password} onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} required minLength={6} />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-accent to-accent/80">
                Add Admin
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 justify-center">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddStudent} className="space-y-4">
              {/* --- Student form fields go here --- */}
               <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={newStudent.fullName} onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input id="studentId" value={newStudent.studentId} onChange={(e) => setNewStudent({ ...newStudent, studentId: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seatNumber">Seat Number (Optional)</Label>
                <Input id="seatNumber" value={newStudent.seatNumber} onChange={(e) => setNewStudent({ ...newStudent, seatNumber: e.target.value })} placeholder="e.g., A-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input id="phone" type="tel" value={newStudent.phone} onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Library Time Slots</Label>
                <div className="space-y-3">
                  {timeSlots.map((slot, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input type="time" value={slot.start} onChange={(e) => setTimeSlots((prev) => prev.map((s, i) => (i === idx ? { ...s, start: e.target.value } : s)))} required />
                      <span className="text-muted-foreground">to</span>
                      <Input type="time" value={slot.end} onChange={(e) => setTimeSlots((prev) => prev.map((s, i) => (i === idx ? { ...s, end: e.target.value } : s)))} required />
                      {timeSlots.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => setTimeSlots((prev) => prev.filter((_, i) => i !== idx))} className="hover:text-destructive p-2">Remove</Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={() => setTimeSlots((prev) => [...prev, { start: "", end: "" }])}>Add Slot</Button>
                </div>
                <p className="text-xs text-muted-foreground">Example: 01:00 - 04:00</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={newStudent.password} onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })} required minLength={6} />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-primary to-secondary">
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
      <>
        {/* Desktop View: Table (Hidden on mobile) */}
        <div className="hidden md:block">
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
                  <TableCell className="font-medium">{student.student_id}</TableCell>
                  <TableCell>{student.full_name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell className="font-medium text-primary">{student.seat_number || "-"}</TableCell>
                  <TableCell>{student.phone || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteStudent(student.id)} className="hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View: Card List (Hidden on desktop) */}
        <div className="block md:hidden space-y-4">
          {students.map((student) => (
            <div key={student.id} className="p-4 border rounded-lg bg-background shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-lg">{student.full_name}</p>
                  <p className="text-sm text-muted-foreground">{student.email}</p>
                  <p className="text-sm text-muted-foreground">ID: {student.student_id}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteStudent(student.id)} className="hover:bg-destructive/10 hover:text-destructive -mr-2 -mt-2 shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4 pt-4 border-t text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-muted-foreground">Seat:</span>
                  <span className="font-medium text-primary">{student.seat_number || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-muted-foreground">Phone:</span>
                  <span>{student.phone || "N/A"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    )}
  </CardContent>
</Card>
      </main>
    </div>
  );
};

export default AdminStudents;