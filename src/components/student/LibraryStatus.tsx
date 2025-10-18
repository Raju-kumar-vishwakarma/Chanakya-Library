import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

interface Status {
  current_occupied: number;
  total_seats: number;
  available: number;
}

export default function LibraryStatus() {
  const [status, setStatus] = useState<Status>({ current_occupied: 0, total_seats: 0, available: 0 });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data, error } = await supabase.rpc("get_library_status");
      if (error) throw error;
      if (data && Array.isArray(data) && data.length > 0) {
        setStatus(data[0] as Status);
      } else if (data && !Array.isArray(data)) {
        setStatus(data as Status);
      }
    } catch (e) {
      console.error("Failed to load library status", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  const percent = status.total_seats > 0 ? Math.min(100, Math.round((status.current_occupied / status.total_seats) * 100)) : 0;

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Library Occupancy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Occupied</span>
          <span>{loading ? "--" : status.current_occupied}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Total Seats</span>
          <span>{loading ? "--" : status.total_seats}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>Available</span>
          <span className="font-medium">{loading ? "--" : status.available}</span>
        </div>
        <Progress value={percent} />
        <p className="text-xs text-muted-foreground">{percent}% capacity</p>
      </CardContent>
    </Card>
  );
}
