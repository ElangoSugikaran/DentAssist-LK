import { useGetAppointments, useUpdateAppointmentStatus } from "@/hooks/use-appointments";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Calendar } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { AppointmentStatus } from "@prisma/client";

function RecentAppointments() {
  const { data: appointments = [] } = useGetAppointments();
  const updateAppointmentMutation = useUpdateAppointmentStatus();

// Use Prisma enum values directly
const DB_STATUS = {
  CONFIRMED: "CONFIRMED" as AppointmentStatus,
  COMPLETED: "COMPLETED" as AppointmentStatus,
} as const;

// map DB values to pretty display strings
const DISPLAY_STATUS: Record<AppointmentStatus, string> = {
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
};

// optional: helper that returns a safe display string
const getDisplayStatus = (status?: string) => {
  if (!status) return "Unknown";
  return DISPLAY_STATUS[status as AppointmentStatus] ?? status;
};

// toggle: still send DB values to backend
const handleToggleAppointmentStatus = (appointmentId: string) => {
  const appointment = appointments.find((apt) => apt.id === appointmentId);
  if (!appointment) return;

  const newStatus: AppointmentStatus =
    appointment.status === DB_STATUS.CONFIRMED
      ? DB_STATUS.COMPLETED
      : DB_STATUS.CONFIRMED;

  updateAppointmentMutation.mutate({ id: appointmentId, status: newStatus });
};

// badge renderer: match DB values and show pretty text
const getStatusBadge = (status: string) => {
  const label = getDisplayStatus(status);

  switch (status) {
    case DB_STATUS.CONFIRMED:
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          {label}
        </Badge>
      );
    case DB_STATUS.COMPLETED:
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          {label}
        </Badge>
      );
    default:
      return <Badge variant="secondary">{label}</Badge>;
  }
};

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Recent Appointments
        </CardTitle>
        <CardDescription>Monitor and manage all patient appointments</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{appointment.patientName}</div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.patientEmail}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{appointment.doctorName}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {new Date(appointment.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-muted-foreground">{appointment.time}</div>
                    </div>
                  </TableCell>
                  <TableCell>{appointment.reason}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleAppointmentStatus(appointment.id)}
                      className="h-6 px-2"
                    >
                      {getStatusBadge(appointment.status)}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="text-xs text-muted-foreground">Click status to toggle</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default RecentAppointments;