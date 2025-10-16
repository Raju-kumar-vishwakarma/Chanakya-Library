import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Bell, Clock, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LibrarySettings {
  library_name: string;
  opening_time: string;
  closing_time: string;
  qr_attendance_enabled: boolean;
  auto_checkout_enabled: boolean;
  notice_text: string;
  email_notifications: boolean;
}

const AdminSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<LibrarySettings>({
    library_name: "Chanakya Library",
    opening_time: "09:00",
    closing_time: "18:00",
    qr_attendance_enabled: true,
    auto_checkout_enabled: false,
    notice_text: "",
    email_notifications: false,
  });

  useEffect(() => {
    checkAuth();
    loadSettings();
  }, []);

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

  const loadSettings = () => {
    const saved = localStorage.getItem("library_settings");
    if (saved) setSettings(JSON.parse(saved));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem("library_settings", JSON.stringify(settings));
      toast({
        title: "Settings saved!",
        description: "Library settings have been updated successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to save settings",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted mt-8">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin")}
              className="hover:bg-muted"
            >
              <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                System Settings
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Configure library system preferences
              </p>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={loading}
            size="sm"
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
          {/* General Settings */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Clock className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>Basic library configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="library_name">Library Name</Label>
                <Input
                  id="library_name"
                  value={settings.library_name}
                  onChange={(e) =>
                    setSettings({ ...settings, library_name: e.target.value })
                  }
                  className="text-sm sm:text-base"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="opening_time">Opening Time</Label>
                  <Input
                    id="opening_time"
                    type="time"
                    value={settings.opening_time}
                    onChange={(e) =>
                      setSettings({ ...settings, opening_time: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closing_time">Closing Time</Label>
                  <Input
                    id="closing_time"
                    type="time"
                    value={settings.closing_time}
                    onChange={(e) =>
                      setSettings({ ...settings, closing_time: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Settings */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <QrCode className="h-5 w-5" />
                Attendance Settings
              </CardTitle>
              <CardDescription>Configure attendance tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <Label>QR Code Attendance</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable QR code scanning for attendance
                  </p>
                </div>
                <Switch
                  checked={settings.qr_attendance_enabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, qr_attendance_enabled: checked })
                  }
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <Label>Auto Check-out</Label>
                  <p className="text-sm text-muted-foreground">
                    Auto check-out at closing time
                  </p>
                </div>
                <Switch
                  checked={settings.auto_checkout_enabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, auto_checkout_enabled: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email alerts to students
                  </p>
                </div>
                <Switch
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, email_notifications: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Notice Board */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">
                Notice Board
              </CardTitle>
              <CardDescription>
                Display message on login screen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter notice or instructions for students..."
                value={settings.notice_text}
                onChange={(e) =>
                  setSettings({ ...settings, notice_text: e.target.value })
                }
                rows={5}
                className="text-sm sm:text-base"
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;