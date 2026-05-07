import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { Order, Service, Transaction, DashboardStats } from '@/types';

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(amount);
};

// Helper to get current date string
const getDateString = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Export Financial Report as PDF
 */
export const exportFinancialPDF = async (
  stats: DashboardStats | null,
  transactions: Transaction[]
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Laporan Keuangan CleanStride', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tanggal: ${getDateString()}`, pageWidth / 2, 28, { align: 'center' });
  
  // Summary section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Ringkasan', 14, 45);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const summaryData = [
    ['Revenue Hari Ini', formatCurrency(stats?.today.revenue ?? 0)],
    ['Orders Hari Ini', String(stats?.today.orders ?? 0)],
    ['Orders Dalam Proses', String(stats?.processing_orders ?? 0)],
    ['Customer Aktif', String(stats?.active_customers ?? 0)],
  ];
  
  autoTable(doc, {
    startY: 50,
    head: [['Metrik', 'Nilai']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
  });
  
  // Transactions table
  const finalY = (doc as any).lastAutoTable.finalY || 50;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Transaksi Terbaru', 14, finalY + 15);
  
  const transactionData = transactions.map(t => [
    t.transaction_number || '-',
    t.order?.order_number || '-',
    t.amount_formatted || formatCurrency(t.amount),
    t.method_label || t.method,
    t.status,
    t.created_at || '-',
  ]);
  
  autoTable(doc, {
    startY: finalY + 20,
    head: [['No. Transaksi', 'Order', 'Jumlah', 'Metode', 'Status', 'Tanggal']],
    body: transactionData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 8 },
  });
  
  doc.save(`laporan-keuangan-${getDateString()}.pdf`);
};

/**
 * Export Transactions as Excel
 */
export const exportTransactionsExcel = async (transactions: Transaction[]) => {
  const data = transactions.map(t => ({
    'No. Transaksi': t.transaction_number || '-',
    'No. Order': t.order?.order_number || '-',
    'Customer': t.order?.customer_name || '-',
    'Jumlah': t.amount,
    'Metode': t.method_label || t.method,
    'Status': t.status,
    'Tanggal': t.created_at || '-',
  }));
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transaksi');
  
  // Set column widths
  ws['!cols'] = [
    { wch: 15 }, // No. Transaksi
    { wch: 20 }, // No. Order
    { wch: 20 }, // Customer
    { wch: 15 }, // Jumlah
    { wch: 15 }, // Metode
    { wch: 10 }, // Status
    { wch: 15 }, // Tanggal
  ];
  
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `transaksi-${getDateString()}.xlsx`);
};

/**
 * Export Orders as CSV
 */
export const exportOrdersCSV = async (orders: Order[]) => {
  const headers = ['No. Order', 'Customer', 'Telepon', 'Layanan', 'Quantity', 'Total', 'Status', 'Tanggal'];
  
  const rows = orders.map(o => [
    o.order_number || '-',
    o.customer?.name || '-',
    o.customer?.phone || '-',
    o.service?.name || '-',
    String(o.quantity),
    String(o.total),
    o.status,
    o.created_at || '-',
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `orders-${getDateString()}.csv`);
};

/**
 * Export Services as CSV
 */
export const exportServicesCSV = async (services: Service[]) => {
  const headers = ['ID', 'Nama', 'Deskripsi', 'Harga', 'Durasi', 'Status'];
  
  const rows = services.map(s => [
    String(s.id),
    s.name,
    s.description,
    String(s.price),
    s.duration,
    s.is_active ? 'Aktif' : 'Nonaktif',
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `services-${getDateString()}.csv`);
};
