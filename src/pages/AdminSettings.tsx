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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin")}
              className="hover:bg-muted"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
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
            className="bg-gradient-to-r from-primary to-secondary w-full sm:w-auto"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* General Settings */}
          <Card className="shadow-md hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
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
                      setSettings({
                        ...settings,
                        opening_time: e.target.value,
                      })
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
                      setSettings({
                        ...settings,
                        closing_time: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Settings */}
          <Card className="shadow-md hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Attendance Settings
              </CardTitle>
              <CardDescription>Configure attendance tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  label: "QR Code Attendance",
                  desc: "Enable QR code scanning for attendance",
                  key: "qr_attendance_enabled",
                },
                {
                  label: "Auto Check-out",
                  desc: "Auto check-out at closing time",
                  key: "auto_checkout_enabled",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between flex-wrap gap-2"
                >
                  <div className="space-y-0.5">
                    <Label>{item.label}</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                  <Switch
                    checked={settings[item.key as keyof LibrarySettings] as boolean}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, [item.key]: checked })
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="shadow-md hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
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
          <Card className="shadow-md hover:shadow-lg transition-all sm:col-span-2">
            <CardHeader>
              <CardTitle>Notice Board</CardTitle>
              <CardDescription>
                Display a message on the student login screen
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
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;