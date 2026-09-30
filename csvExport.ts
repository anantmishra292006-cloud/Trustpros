import { Booking, ProviderProfile } from '../types';

export function exportProvidersToCSV(providers: ProviderProfile[], filename = 'providers_export.csv') {
  const headers = [
    'ID',
    'Business Name',
    'Contact Name',
    'Email',
    'Phone',
    'Category',
    'Service Area',
    'Hourly Rate',
    'Status',
    'Strikes',
    'Reliability Score (%)',
    'Completed Jobs',
    'Average Rating',
    'Review Count',
    'Joined Date',
  ];

  const rows = providers.map((p) => [
    p.id,
    escapeCSV(p.businessName),
    escapeCSV(p.contactName),
    escapeCSV(p.email),
    escapeCSV(p.phone),
    escapeCSV(p.category),
    escapeCSV(p.serviceArea),
    escapeCSV(p.hourlyRate),
    p.status,
    p.strikes,
    p.reliabilityScore,
    p.completedBookingsCount,
    p.averageRating,
    p.reviewCount,
    p.createdAt,
  ]);

  downloadCSV([headers, ...rows], filename);
}

export function exportBookingsToCSV(bookings: Booking[], filename = 'bookings_export.csv') {
  const headers = [
    'Booking ID',
    'Provider Name',
    'Customer Name',
    'Customer Email',
    'Customer Phone',
    'Service Category',
    'Appointment Date',
    'Appointment Time',
    'Service Address',
    'Status',
    'Deposit Paid',
    'Created At',
  ];

  const rows = bookings.map((b) => [
    b.id,
    escapeCSV(b.providerBusinessName),
    escapeCSV(b.customerName),
    escapeCSV(b.customerEmail),
    escapeCSV(b.customerPhone),
    escapeCSV(b.serviceCategory),
    b.appointmentDate,
    b.appointmentTime,
    escapeCSV(b.serviceAddress),
    b.status,
    b.depositPaid ? 'Yes' : 'No',
    b.createdAt,
  ]);

  downloadCSV([headers, ...rows], filename);
}

function escapeCSV(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

function downloadCSV(data: (string | number)[][], filename: string) {
  const csvContent = data.map((row) => row.join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
