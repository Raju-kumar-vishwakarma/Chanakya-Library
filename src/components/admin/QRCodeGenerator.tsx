import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface QRCodeGeneratorProps {
  studentId: string;
  studentName: string;
}

const QRCodeGenerator = ({ studentId, studentName }: QRCodeGeneratorProps) => {
  const qrData = JSON.stringify({
    student_id: studentId,
    timestamp: Date.now(),
  });

  const downloadQR = () => {
    const canvas = document.createElement("canvas");
    const svg = document.getElementById(`qr-${studentId}`) as any;
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      
      const downloadLink = document.createElement("a");
      downloadLink.download = `${studentName}-QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Student QR Code</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="bg-white p-4 rounded-lg">
          <QRCodeSVG
            id={`qr-${studentId}`}
            value={qrData}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          {studentName} ({studentId})
        </p>
        <Button
          onClick={downloadQR}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <Download className="mr-2 h-4 w-4" />
          Download QR Code
        </Button>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
