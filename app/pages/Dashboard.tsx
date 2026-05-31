import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";

// ==========================================
// SHADCN UI COMPONENTS
// ==========================================
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";

// ==========================================
// ICONS
// ==========================================
import {
  Activity,
  ArrowUpRight,
  Download,
  Clock,
  Briefcase,
  CheckCircle2,
  Calendar as CalendarIcon,
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  SlidersHorizontal,
  Loader2,
  Wallet,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import {
  ResponsiveContainer,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";

import * as XLSX from "xlsx";
import type { DateRange } from "react-day-picker";

// ==========================================
// IMPORT DATA GLOBAL & UTILITIES
// ==========================================
import { useAppStore } from "~/store/useAppStore";
import type { Invoice } from "~/types/index";
import {
  parseCurrencyToNumber,
  formatCurrency,
  convertAndFormatCurrency,
  EXCHANGE_RATE_USD,
} from "~/lib/currency";

const chartConfig = {
  pendapatan: {
    label: "Pendapatan",
    color: "hsl(var(--emerald-500, 150 84% 39%))",
  },
  pengeluaran: {
    label: "Pengeluaran",
    color: "hsl(var(--rose-500, 346 87% 60%))",
  },
} satisfies ChartConfig;

const STATUS_COLORS: Record<string, string> = {
  Lunas: "#10b981",
  Pending: "#f59e0b",
  "Belum Bayar": "#0ea5e9",
  Gagal: "#e11d48",
};

export default function DashboardPage() {
  const navigate = useNavigate();

  // AMBIL DATA DARI ZUSTAND GLOBAL STORE
  const { preferensi, infoBisnis, profil, invoices, expenses } = useAppStore();
  const mataUang = preferensi.mataUang;

  // State Date Range Picker
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2026, 0, 1),
    to: new Date(2026, 4, 31),
  });

  // State UI Modal Export
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [fileFormat, setFileFormat] = useState("pdf");
  const [includeSections, setIncludeSections] = useState({
    metrics: true,
    charts: true,
    recentTransactions: true,
  });

  const formatYAxis = (tickItem: number) => {
    return new Intl.NumberFormat(mataUang === "USD" ? "en-US" : "id-ID", {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
    }).format(tickItem);
  };

  // ==========================================
  // KALKULASI METRIK & GRAFIK (DINAMIS DARI STORE)
  // ==========================================
  const {
    totalPendapatan,
    totalPengeluaran,
    labaBersih,
    totalMenunggu,
    chartData,
    statusData,
    aktivitasTerbaru,
    tagihanMendesak,
    topClients,
  } = useMemo(() => {
    let pendapatan = 0;
    let pengeluaran = 0;
    let lunas = 0;
    let pending = 0;
    let belumBayar = 0;
    let gagal = 0;

    const monthlyData = [
      { bulan: "Jan", pendapatan: 0, pengeluaran: 0 },
      { bulan: "Feb", pendapatan: 0, pengeluaran: 0 },
      { bulan: "Mar", pendapatan: 0, pengeluaran: 0 },
      { bulan: "Apr", pendapatan: 0, pengeluaran: 0 },
      { bulan: "Mei", pendapatan: 0, pengeluaran: 0 },
      { bulan: "Jun", pendapatan: 0, pengeluaran: 0 },
      { bulan: "Jul", pendapatan: 0, pengeluaran: 0 },
      { bulan: "Ags", pendapatan: 0, pengeluaran: 0 },
      { bulan: "Sep", pendapatan: 0, pengeluaran: 0 },
      { bulan: "Okt", pendapatan: 0, pengeluaran: 0 },
      { bulan: "Nov", pendapatan: 0, pengeluaran: 0 },
      { bulan: "Des", pendapatan: 0, pengeluaran: 0 },
    ];

    const belumLunas: Invoice[] = [];
    const clientRevenue: Record<string, number> = {};

    // 1. Kalkulasi Data Invoice (Pendapatan)
    invoices.forEach((invoice) => {
      // Abaikan jika tidak punya tanggal
      if (!invoice.date) return;

      if (dateRange?.from) {
        const invDate = new Date(invoice.date).getTime();
        const start = new Date(dateRange.from).setHours(0, 0, 0, 0);
        const end = new Date(dateRange.to || dateRange.from).setHours(
          23,
          59,
          59,
          999,
        );
        if (invDate < start || invDate > end) return;
      }

      const rawIdr = parseCurrencyToNumber(invoice.totalAmount);
      const nominalChart =
        mataUang === "USD" ? rawIdr / EXCHANGE_RATE_USD : rawIdr;

      if (!clientRevenue[invoice.clientName]) {
        clientRevenue[invoice.clientName] = 0;
      }

      if (invoice.paymentStatus === "Lunas") {
        lunas += 1;
        pendapatan += rawIdr;
        clientRevenue[invoice.clientName] += rawIdr;

        const monthIndex = new Date(invoice.date).getMonth();
        if (monthIndex >= 0 && monthIndex < 12) {
          monthlyData[monthIndex].pendapatan += nominalChart;
        }
      } else if (invoice.paymentStatus === "Pending") {
        pending += 1;
        belumLunas.push(invoice);
      } else if (invoice.paymentStatus === "Belum Bayar") {
        belumBayar += 1;
        belumLunas.push(invoice);
      } else if (invoice.paymentStatus === "Gagal") {
        gagal += 1;
      }
    });

    // 2. Kalkulasi Data Pengeluaran (Expense)
    expenses.forEach((expense) => {
      if (dateRange?.from) {
        const expDate = new Date(expense.tanggal).getTime();
        const start = new Date(dateRange.from).setHours(0, 0, 0, 0);
        const end = new Date(dateRange.to || dateRange.from).setHours(
          23,
          59,
          59,
          999,
        );
        if (expDate < start || expDate > end) return;
      }

      if (expense.status === "Dibayar") {
        const rawIdrExp = Number(expense.jumlah);
        const nominalChartExp =
          mataUang === "USD" ? rawIdrExp / EXCHANGE_RATE_USD : rawIdrExp;
        pengeluaran += rawIdrExp;

        const monthIndex = new Date(expense.tanggal).getMonth();
        if (monthIndex >= 0 && monthIndex < 12) {
          monthlyData[monthIndex].pengeluaran += nominalChartExp;
        }
      }
    });

    const labaBersihVal = pendapatan - pengeluaran;

    const statusChartData = [
      { name: "Lunas", value: lunas },
      { name: "Pending", value: pending },
      { name: "Belum Bayar", value: belumBayar },
      { name: "Gagal", value: gagal },
    ].filter((data) => data.value > 0);

    const sortedClients = Object.entries(clientRevenue)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 4);

    const terbaru = invoices
      .filter((inv) => {
        if (!inv.date) return false;
        if (!dateRange?.from) return true;
        const d = new Date(inv.date).getTime();
        return (
          d >= new Date(dateRange.from).setHours(0, 0, 0, 0) &&
          d <=
            new Date(dateRange.to || dateRange.from).setHours(23, 59, 59, 999)
        );
      })
      .slice(0, 5);

    const mendesak = belumLunas
      .filter((inv) => inv.dueDate)
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      )
      .slice(0, 5);

    // Potong bulan yang ditampilkan di chart hingga bulan saat ini (atau statis 5 bulan jika Anda preferensi desain lama)
    const currentMonth = new Date().getMonth();
    const activeMonthlyData = monthlyData.slice(
      0,
      Math.max(5, currentMonth + 1),
    );

    return {
      totalPendapatan: pendapatan,
      totalPengeluaran: pengeluaran,
      labaBersih: labaBersihVal,
      totalMenunggu: pending + belumBayar,
      chartData: activeMonthlyData,
      statusData: statusChartData,
      aktivitasTerbaru: terbaru,
      tagihanMendesak: mendesak,
      topClients: sortedClients,
    };
  }, [mataUang, dateRange, invoices, expenses]);

  const tanggalHariIni = format(new Date(), "EEEE, dd MMMM yyyy", {
    locale: id,
  });

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Lunas":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
      case "Belum Bayar":
        return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20";
      case "Gagal":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20";
    }
  };

  const handleExportExcel = () => {
    const dataTerfilter = invoices.filter((invoice) => {
      if (!invoice.date) return false;
      if (!dateRange?.from) return true;
      const invDate = new Date(invoice.date).getTime();
      const start = new Date(dateRange.from).setHours(0, 0, 0, 0);
      const end = new Date(dateRange.to || dateRange.from).setHours(
        23,
        59,
        59,
        999,
      );
      return invDate >= start && invDate <= end;
    });

    if (dataTerfilter.length === 0) {
      toast.error(
        "Tidak ada data transaksi pada rentang tanggal ini untuk diekspor!",
      );
      return;
    }

    const excelRows = dataTerfilter.map((inv, idx) => ({
      No: idx + 1,
      "No. Invoice": inv.invoice,
      "Nama Klien": inv.clientName,
      "Tanggal Pembuatan": inv.date,
      "Tanggal Jatuh Tempo": inv.dueDate,
      "Status Pembayaran": inv.paymentStatus,
      "Total Nominal (IDR)": parseCurrencyToNumber(inv.totalAmount),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ringkasan Finansial");
    worksheet["!cols"] = [
      { wch: 6 },
      { wch: 15 },
      { wch: 25 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 22 },
    ];
    const fileDate = format(new Date(), "yyyyMMdd");
    XLSX.writeFile(workbook, `Laporan_Dashboard_${fileDate}.xlsx`);
    toast.success("Laporan Excel (.xlsx) berhasil diunduh!");
  };

  const handleExportDashboard = () => {
    const printIframe = document.createElement("iframe");
    printIframe.style.position = "fixed";
    printIframe.style.right = "0";
    printIframe.style.bottom = "0";
    printIframe.style.width = "0";
    printIframe.style.height = "0";
    printIframe.style.border = "0";
    document.body.appendChild(printIframe);

    const printDocument = printIframe.contentWindow?.document;
    if (!printDocument) return;

    const topKlienHtml = topClients
      .map(
        (k, i) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">${i + 1}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: bold;">${k.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; text-align: right; color: #059669; font-weight: bold;">${convertAndFormatCurrency(k.total, mataUang)}</td>
      </tr>
    `,
      )
      .join("");

    const aktivitasHtml = aktivitasTerbaru
      .map(
        (inv) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-family: monospace;">${inv.invoice}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">${inv.clientName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; text-align: center;">${inv.date}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; text-align: center;">
          <span style="font-weight: bold; ${
            inv.paymentStatus === "Lunas"
              ? "color: #065f46;"
              : inv.paymentStatus === "Pending"
                ? "color: #92400e;"
                : "color: #991b1b;"
          }">${inv.paymentStatus}</span>
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; text-align: right; font-weight: bold;">${convertAndFormatCurrency(parseCurrencyToNumber(inv.totalAmount), mataUang)}</td>
      </tr>
    `,
      )
      .join("");

    const mendesakHtml =
      tagihanMendesak.length > 0
        ? tagihanMendesak
            .map(
              (inv) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-family: monospace;">${inv.invoice}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">${inv.clientName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; text-align: center; color: #dc2626; font-weight: bold;">${inv.dueDate}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; text-align: right; font-weight: bold;">${convertAndFormatCurrency(parseCurrencyToNumber(inv.totalAmount), mataUang)}</td>
      </tr>
    `,
            )
            .join("")
        : '<tr><td colspan="4" style="padding: 15px; text-align: center; font-size: 11px; color: #6b7280;">Tidak ada tagihan mendesak.</td></tr>';

    const content = `
      <html>
        <head>
          <title>Snapshot Dashboard - ${infoBisnis.nama}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a202c; margin: 0; padding: 0; line-height: 1.5; }
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; border-bottom: 3px double #cbd5e1; padding-bottom: 15px; }
            .title-report { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase; margin: 0; color: #111827; }
            .meta-text { font-size: 11px; color: #4b5563; margin-top: 4px; }
            .grid-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }
            .card-metric { border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; background-color: #f9fafb; }
            .metric-title { font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
            .metric-value { font-size: 18px; font-weight: 800; color: #111827; }
            .section-title { font-size: 13px; font-weight: 700; border-left: 3px solid #3b82f6; padding-left: 8px; margin-bottom: 12px; text-transform: uppercase; color: #1f2937; margin-top: 25px;}
            table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
            table.data-table th { background-color: #f3f4f6; padding: 8px; font-size: 10px; font-weight: 700; border-bottom: 2px solid #e5e7eb; color: #374151; text-transform: uppercase; text-align: left;}
            .footer-signature { margin-top: 50px; display: flex; justify-content: space-between; font-size: 11px; }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td>
                <h1 class="title-report">Ringkasan Dashboard</h1>
                <div class="meta-text">Dicetak Oleh: <b>${profil.nama}</b></div>
                <div class="meta-text">Waktu Cetak: ${new Date().toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}</div>
              </td>
              <td style="text-align: right; vertical-align: top;">
                <div style="font-weight: bold; font-size: 14px; color: #3b82f6;">${infoBisnis.nama}</div>
                <div style="font-size: 10px; color: #6b7280; max-width: 220px; margin-left: auto; line-height: 1.3;">${infoBisnis.alamat}</div>
              </td>
            </tr>
          </table>
          <div class="grid-metrics">
            <div class="card-metric" style="border-top: 3px solid #10b981;">
              <div class="metric-title">Total Pendapatan</div>
              <div class="metric-value">${convertAndFormatCurrency(totalPendapatan, mataUang)}</div>
            </div>
            <div class="card-metric" style="border-top: 3px solid #f43f5e;">
              <div class="metric-title">Total Pengeluaran</div>
              <div class="metric-value">${convertAndFormatCurrency(totalPengeluaran, mataUang)}</div>
            </div>
            <div class="card-metric" style="border-top: 3px solid #3b82f6;">
              <div class="metric-title">Laba Bersih</div>
              <div class="metric-value">${convertAndFormatCurrency(labaBersih, mataUang)}</div>
            </div>
            <div class="card-metric" style="border-top: 3px solid #f59e0b;">
              <div class="metric-title">Menunggu / Piutang</div>
              <div class="metric-value">${totalMenunggu} <span style="font-size:12px; color:#6b7280; font-weight:normal;">Tagihan</span></div>
            </div>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 48%; vertical-align: top; padding-right: 15px;">
                <div class="section-title">Klien Teratas</div>
                <table class="data-table">
                  <thead><tr><th style="width:10%;">No</th><th>Nama Klien</th><th style="text-align: right;">Total Nilai</th></tr></thead>
                  <tbody>${topKlienHtml || '<tr><td colspan="3" style="padding: 10px; text-align: center; font-size: 11px;">Belum ada data klien.</td></tr>'}</tbody>
                </table>
              </td>
              <td style="width: 4%;">&nbsp;</td>
              <td style="width: 48%; vertical-align: top;">
                <div class="section-title" style="border-left-color: #ef4444;">Tagihan Mendesak (Jatuh Tempo)</div>
                <table class="data-table">
                  <thead><tr><th>Invoice</th><th>Klien</th><th style="text-align: center;">Tgl Tempo</th><th style="text-align: right;">Nominal</th></tr></thead>
                  <tbody>${mendesakHtml}</tbody>
                </table>
              </td>
            </tr>
          </table>
          <div class="section-title">Aktivitas Transaksi Terbaru</div>
          <table class="data-table">
            <thead>
              <tr><th style="width: 15%;">ID Invoice</th><th style="width: 35%;">Nama Klien</th><th style="width: 15%; text-align: center;">Tanggal</th><th style="width: 15%; text-align: center;">Status</th><th style="width: 20%; text-align: right;">Total Tagihan</th></tr>
            </thead>
            <tbody>${aktivitasHtml || '<tr><td colspan="5" style="padding: 15px; text-align: center; font-size: 11px;">Belum ada riwayat transaksi.</td></tr>'}</tbody>
          </table>
          <div class="footer-signature">
            <div><p style="margin-bottom: 40px; color: #6b7280;">Dibuat Otomatis Oleh Sistem,</p><p style="font-weight: bold; border-top: 1px solid #9ca3af; padding-top: 4px; width: 160px;">Dashboard Reporting</p></div>
            <div style="text-align: right;"><p style="margin-bottom: 40px; color: #6b7280;">Disetujui Oleh,</p><p style="font-weight: bold; border-top: 1px solid #9ca3af; padding-top: 4px; width: 160px; margin-left: auto;">${profil.nama}</p></div>
          </div>
        </body>
      </html>
    `;

    printDocument.open();
    printDocument.write(content);
    printDocument.close();

    printIframe.onload = () => {
      setTimeout(() => {
        printIframe.contentWindow?.focus();
        printIframe.contentWindow?.print();
        document.body.removeChild(printIframe);
        toast.success("Ringkasan Dashboard berhasil diproses ke PDF!");
      }, 500);
    };
  };

  const handleKirimEmailReminder = (item: Invoice) => {
    const namaPerusahaan = infoBisnis.nama;
    const nominalTerformat = convertAndFormatCurrency(
      parseCurrencyToNumber(item.totalAmount),
      mataUang,
    );
    const subject = encodeURIComponent(
      `[URGENT] Pengingat Batas Jatuh Tempo Pembayaran - ${item.invoice}`,
    );
    const body = encodeURIComponent(
      `Halo ${item.clientName},\n\nKami dari ${namaPerusahaan} ingin menginformasikan mengenai tagihan penagihan dengan nomor Invoice ${item.invoice} sebesar ${nominalTerformat} yang jatuh tempo pada tanggal ${item.dueDate}.\n\nMohon untuk segera melakukan penyelesaian pembayaran sebelum atau tepat pada tanggal jatuh tempo tersebut.\n\nJika Anda telah melakukan pembayaran, mohon abaikan pesan pengingat ini otomatis.\n\nTerima kasih atas perhatian dan kerja samanya.\n\nSalam hangat,\n${namaPerusahaan}`,
    );
    const emailKlien =
      "finance@" +
      item.clientName.toLowerCase().replace(/[^a-z0-9]/g, "") +
      ".com";
    window.open(
      `mailto:${emailKlien}?subject=${subject}&body=${body}`,
      "_blank",
    );
    toast.success("Berhasil membuat draf pengingat di aplikasi email Anda!");
  };

  const handleProcessExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setIsExportModalOpen(false);

      if (fileFormat === "pdf") {
        handleExportDashboard();
      } else {
        handleExportExcel();
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-8 pb-10 animate-in fade-in duration-500 max-w-7xl mx-auto px-4 xl:px-0 mt-4">
      {/* === HEADER DASHBOARD === */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <Badge
            variant="secondary"
            className="mb-2 bg-primary/10 text-primary hover:bg-primary/20 border-none font-medium"
          >
            <Clock className="w-3.5 h-3.5 mr-1.5" /> {tanggalHariIni}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Kembali bekerja, {profil.nama} 👋
          </h1>
          <p className="text-muted-foreground">
            Berikut adalah ringkasan performa finansial bisnis Anda hari ini.
          </p>
        </div>

        {/* CONTROLS BAR: FILTER & ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full sm:w-[260px] justify-start text-left font-normal rounded-lg shadow-sm ${!dateRange ? "text-muted-foreground" : ""}`}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd LLL yyyy", { locale: id })} -{" "}
                      {format(dateRange.to, "dd LLL yyyy", { locale: id })}
                    </>
                  ) : (
                    format(dateRange.from, "dd LLL yyyy", { locale: id })
                  )
                ) : (
                  <span>Pilih rentang tanggal</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-lg" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {/* === MODAL EXPORT DASHBOARD === */}
          <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto gap-2 font-semibold shadow-sm rounded-lg cursor-pointer bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all">
                <Download className="w-4 h-4" /> Export
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[480px] sm:rounded-2xl p-0 overflow-hidden border-0 shadow-xl">
              <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />
              <div className="p-6">
                <DialogHeader className="mb-5">
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-primary" /> Hub
                    Ekspor Dashboard
                  </DialogTitle>
                  <DialogDescription className="text-sm">
                    Kompilasi widget operasional dan metrik ringkasan menjadi
                    dokumen siap cetak.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-5 py-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Format Output Berkas
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        onClick={() => !isExporting && setFileFormat("pdf")}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          fileFormat === "pdf"
                            ? "border-blue-500 bg-blue-500/5 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "border-border hover:bg-muted/50 text-muted-foreground"
                        }`}
                      >
                        <FileText className="w-8 h-8 mb-2" />
                        <span className="text-sm font-bold">Executive PDF</span>
                        <span className="text-[10px] opacity-80 text-center mt-0.5">
                          Kop resmi & chart ringkas
                        </span>
                      </div>

                      <div
                        onClick={() => !isExporting && setFileFormat("excel")}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          fileFormat === "excel"
                            ? "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "border-border hover:bg-muted/50 text-muted-foreground"
                        }`}
                      >
                        <FileSpreadsheet className="w-8 h-8 mb-2" />
                        <span className="text-sm font-bold">
                          Excel Worksheet
                        </span>
                        <span className="text-[10px] opacity-80 text-center mt-0.5">
                          Data mentah tabular (.xlsx)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5" /> Batasan
                      Cakupan Komponen
                    </Label>

                    <div className="border rounded-xl p-3.5 bg-muted/20 space-y-3.5">
                      <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                          <Label
                            htmlFor="sec-metrics"
                            className="text-sm font-semibold cursor-pointer"
                          >
                            Metrik Utama (Kas & Piutang)
                          </Label>
                          <p className="text-[11px] text-muted-foreground">
                            Angka akumulasi performa pada widget atas
                          </p>
                        </div>
                        <Checkbox
                          id="sec-metrics"
                          checked={includeSections.metrics}
                          onCheckedChange={(checked) =>
                            setIncludeSections((prev) => ({
                              ...prev,
                              metrics: !!checked,
                            }))
                          }
                          disabled={isExporting}
                        />
                      </div>

                      <div className="h-[1px] bg-border" />

                      <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                          <Label
                            htmlFor="sec-charts"
                            className="text-sm font-semibold cursor-pointer"
                          >
                            Analisis Tren & Grafik
                          </Label>
                          <p className="text-[11px] text-muted-foreground">
                            Katalog layanan terlaris & metode terfavorit
                          </p>
                        </div>
                        <Checkbox
                          id="sec-charts"
                          checked={includeSections.charts}
                          onCheckedChange={(checked) =>
                            setIncludeSections((prev) => ({
                              ...prev,
                              charts: !!checked,
                            }))
                          }
                          disabled={isExporting || fileFormat === "excel"}
                        />
                      </div>

                      <div className="h-[1px] bg-border" />

                      <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                          <Label
                            htmlFor="sec-tx"
                            className="text-sm font-semibold cursor-pointer"
                          >
                            Log Transaksi Terbaru
                          </Label>
                          <p className="text-[11px] text-muted-foreground">
                            Daftar baris tabel invoice terfilter
                          </p>
                        </div>
                        <Checkbox
                          id="sec-tx"
                          checked={includeSections.recentTransactions}
                          onCheckedChange={(checked) =>
                            setIncludeSections((prev) => ({
                              ...prev,
                              recentTransactions: !!checked,
                            }))
                          }
                          disabled={isExporting}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter className="mt-6 border-t pt-4 flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3 sm:space-x-0">
                  <p className="text-[11px] text-muted-foreground hidden sm:block flex-1 pr-4">
                    * Pemrosesan disesuaikan dengan rentang tanggal.
                  </p>

                  <div className="flex flex-col-reverse sm:flex-row w-full sm:w-auto gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      onClick={() => setIsExportModalOpen(false)}
                      disabled={isExporting}
                      className="rounded-xl font-semibold h-10 w-full sm:w-auto"
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={handleProcessExport}
                      disabled={isExporting}
                      className={`rounded-xl font-bold h-10 w-full sm:w-auto gap-2 shadow-md ${
                        fileFormat === "pdf"
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
                    >
                      {isExporting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />{" "}
                          Mengekstrak...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Unduh Dokumen
                        </>
                      )}
                    </Button>
                  </div>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            onClick={() => navigate("/transaction")}
            className="w-full sm:w-auto gap-2 rounded-lg shadow-md"
          >
            Semua Transaksi <ArrowUpRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* === METRIK UTAMA === */}
      <div className="grid gap-4 lg:grid-cols-4 sm:grid-cols-2 grid-cols-1">
        <Card className="shadow-sm rounded-xl border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Total Pendapatan
            </CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400">
              {convertAndFormatCurrency(totalPendapatan, mataUang)}
            </div>
            <p className="text-xs font-medium mt-2 text-muted-foreground">
              Akumulasi invoice lunas
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-xl border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Total Pengeluaran
            </CardTitle>
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <TrendingDown className="h-4 w-4 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-rose-700 dark:text-rose-400">
              {convertAndFormatCurrency(totalPengeluaran, mataUang)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Beban operasional (Dibayar)
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-xl border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Laba Bersih
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-primary">
              {convertAndFormatCurrency(labaBersih, mataUang)}
            </div>
            <p className="text-xs font-medium mt-2 text-muted-foreground">
              Margin keuntungan riil
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-xl border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Menunggu Pembayaran
            </CardTitle>
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Activity className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-amber-700 dark:text-amber-400">
              {totalMenunggu}{" "}
              <span className="text-base font-medium text-muted-foreground">
                tagihan
              </span>
            </div>
            <p className="text-xs font-medium mt-2 text-muted-foreground">
              Piutang butuh tindak lanjut
            </p>
          </CardContent>
        </Card>
      </div>

      {/* === BAGIAN TENGAH: CHARTS === */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7 items-start">
        <Card className="shadow-sm rounded-xl border-border/60 lg:col-span-5 h-full flex flex-col">
          <CardHeader>
            <CardTitle>Arus Kas (Pendapatan vs Pengeluaran)</CardTitle>
            <CardDescription>
              Komparasi pembayaran lunas dan beban biaya yang dikeluarkan pada
              tahun ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-4 px-2 sm:px-6">
            <ChartContainer
              config={chartConfig}
              className="h-full w-full min-h-[300px]"
            >
              <BarChart
                data={chartData}
                margin={{ left: 0, right: 0, top: 20 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  className="stroke-muted/50"
                />
                <XAxis
                  dataKey="bulan"
                  tickLine={false}
                  tickMargin={12}
                  axisLine={false}
                  className="text-xs font-medium"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatYAxis}
                  width={60}
                  className="text-[11px] text-muted-foreground font-medium"
                />
                <ChartTooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.2 }}
                  content={
                    <ChartTooltipContent
                      hideLabel={false}
                      formatter={(value) =>
                        formatCurrency(value as number, mataUang)
                      }
                    />
                  }
                />
                <Bar
                  dataKey="pendapatan"
                  name="Pendapatan"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                  className="fill-emerald-500"
                />
                <Bar
                  dataKey="pengeluaran"
                  name="Pengeluaran"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                  className="fill-rose-500"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6 flex flex-col h-full">
          <Card className="shadow-sm rounded-xl border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Distribusi Status Tagihan
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart width={200} height={200}>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.name] || "#94a3b8"}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value) => [`${value} Invoice`, "Jumlah"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm rounded-xl border-border/60 flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Klien Teratas (Revenue)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topClients.map((client, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 overflow-hidden min-w-0">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                      {client.name.charAt(0)}
                    </div>
                    <span
                      className="text-sm font-medium truncate min-w-0"
                      title={client.name}
                    >
                      {client.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold shrink-0">
                    {convertAndFormatCurrency(client.total, mataUang)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* === BAGIAN BAWAH: TAB TRANSAKSI === */}
      <Card className="shadow-sm rounded-xl border-border/60">
        <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Manajemen Transaksi</CardTitle>
              <CardDescription className="mt-1">
                Pantau pergerakan tagihan terbaru dan yang membutuhkan
                perhatian.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/transaction")}
              className="hidden sm:flex rounded-lg"
            >
              Lihat Semua
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="terbaru" className="w-full">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full max-w-full md:max-w-md grid-cols-2">
                <TabsTrigger value="terbaru">Invoice Terbaru</TabsTrigger>
                <TabsTrigger value="mendesak" className="relative">
                  Jatuh Tempo
                  {tagihanMendesak.length > 0 && (
                    <span className="absolute top-2 right-3 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="terbaru" className="space-y-0 mt-0">
                {aktivitasTerbaru.map((item: Invoice, index: number) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-muted/30 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-sm font-bold text-foreground border shadow-sm">
                        {item.clientName.charAt(0)}
                      </div>
                      <div className="space-y-1 overflow-hidden">
                        <p className="text-sm font-semibold truncate">
                          {item.clientName}
                        </p>
                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 truncate">
                          <span className="font-mono">{item.invoice}</span> •{" "}
                          {item.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 mt-3 sm:mt-0 shrink-0">
                      <div className="font-bold text-sm">
                        {convertAndFormatCurrency(
                          parseCurrencyToNumber(item.totalAmount),
                          mataUang,
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={getStatusBadgeStyle(item.paymentStatus)}
                      >
                        {item.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="mendesak" className="space-y-0 mt-0">
                {tagihanMendesak.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3 opacity-20" />
                    <p className="text-sm font-medium">
                      Bagus! Tidak ada tagihan yang mendesak.
                    </p>
                  </div>
                ) : (
                  tagihanMendesak.map((item: Invoice, index: number) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-muted/30 rounded-lg transition-colors border border-transparent hover:border-border"
                    >
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="w-10 h-10 shrink-0 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-800 shadow-sm">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="space-y-1 overflow-hidden">
                          <p className="text-sm font-semibold truncate">
                            {item.clientName}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] font-medium mt-1 shrink-0">
                            <span className="text-muted-foreground font-mono">
                              {item.invoice}
                            </span>
                            <span className="text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.5 rounded">
                              Tempo: {item.dueDate}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center sm:gap-4 gap-1 mt-3 sm:mt-0 ml-14 sm:ml-0 shrink-0">
                        <div className="font-bold text-sm">
                          {convertAndFormatCurrency(
                            parseCurrencyToNumber(item.totalAmount),
                            mataUang,
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 text-xs font-semibold rounded-md gap-1.5 flex items-center cursor-pointer"
                          onClick={() => handleKirimEmailReminder(item)}
                        >
                          <span className="hidden sm:flex">Tindak Lanjuti</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
