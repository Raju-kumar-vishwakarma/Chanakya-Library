import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, FileText, BarChart3, TrendingUp } from "lucide-react";

const AdminReports = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted mb-8">
      {/* Header */}
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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Reports & Analytics
              </h1>
              <p className="text-sm text-muted-foreground">
                Generate and download reports
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Daily Report */}
          <Card className="border-border/50 shadow-medium hover:shadow-strong transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Daily Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Download attendance report for a specific day
              </p>
              <Button className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90">
                <Download className="mr-2 h-4 w-4" />
                Export Daily Report
              </Button>
            </CardContent>
          </Card>

          {/* Weekly Report */}
          <Card className="border-border/50 shadow-medium hover:shadow-strong transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-secondary" />
                Weekly Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Download weekly attendance summary and statistics
              </p>
              <Button className="w-full bg-gradient-to-r from-secondary to-secondary hover:opacity-90">
                <Download className="mr-2 h-4 w-4" />
                Export Weekly Report
              </Button>
            </CardContent>
          </Card>

          {/* Monthly Report */}
          <Card className="border-border/50 shadow-medium hover:shadow-strong transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                Monthly Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Download comprehensive monthly analytics
              </p>
              <Button className="w-full bg-gradient-to-r from-accent to-accent hover:opacity-90">
                <Download className="mr-2 h-4 w-4" />
                Export Monthly Report
              </Button>
            </CardContent>
          </Card>

          {/* Student Summary */}
          <Card className="border-border/50 shadow-medium hover:shadow-strong transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Student Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Individual student attendance history and stats
              </p>
              <Button variant="outline" className="w-full hover:border-primary hover:text-primary">
                <Download className="mr-2 h-4 w-4" />
                Export Student Data
              </Button>
            </CardContent>
          </Card>

          {/* Custom Report */}
          <Card className="border-border/50 shadow-medium hover:shadow-strong transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-secondary" />
                Custom Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create custom reports with date range filters
              </p>
              <Button variant="outline" className="w-full hover:border-secondary hover:text-secondary">
                <Download className="mr-2 h-4 w-4" />
                Generate Custom
              </Button>
            </CardContent>
          </Card>

          {/* Analytics Dashboard */}
          <Card className="border-border/50 shadow-medium hover:shadow-strong transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                Analytics Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                View visual charts and trends
              </p>
              <Button variant="outline" className="w-full hover:border-accent hover:text-accent">
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminReports;