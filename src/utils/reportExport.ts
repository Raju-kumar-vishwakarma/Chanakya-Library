import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface AttendanceRecord {
  student_id: string;
  student_name: string;
  check_in: string;
  check_out: string | null;
  duration: string;
  date: string;
}

export const exportToExcel = (data: AttendanceRecord[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
  
  // Add column widths
  const maxWidth = data.reduce((w, r) => Math.max(w, r.student_name.length), 10);
  worksheet["!cols"] = [
    { wch: 15 }, // student_id
    { wch: maxWidth }, // student_name
    { wch: 20 }, // check_in
    { wch: 20 }, // check_out
    { wch: 15 }, // duration
    { wch: 12 }, // date
  ];

  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToPDF = (data: AttendanceRecord[], filename: string, title: string) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Add date
  doc.setFontSize(11);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32);
  
  // Add table
  autoTable(doc, {
    startY: 40,
    head: [["Student ID", "Name", "Check In", "Check Out", "Duration", "Date"]],
    body: data.map((record) => [
      record.student_id,
      record.student_name,
      new Date(record.check_in).toLocaleTimeString(),
      record.check_out ? new Date(record.check_out).toLocaleTimeString() : "Still In",
      record.duration,
      record.date,
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [79, 70, 229] }, // primary color
  });
  
  doc.save(`${filename}.pdf`);
};

export const calculateDuration = (checkIn: string, checkOut: string | null): string => {
  if (!checkOut) return "In Progress";
  
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
};
