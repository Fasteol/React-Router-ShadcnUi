import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { toast } from "sonner";

// IMPORT ICONS
import {
  Wallet,
  Clock,
  Trophy,
  CreditCard,
  Download,
  PackageCheck,
  FileSpreadsheet,
  FileText,
  Calendar,
  Activity,
  TrendingDown,
} from "lucide-react";

// IMPORT UTILITIES & HOOK GLOBAL
import {
  convertAndFormatCurrency,
  parseCurrencyToNumber,
} from "~/lib/currency";
import { useAppStore } from "~/store/useAppStore";

export default function ReportsPage() {
  const [periodeExport, setPeriodeExport] = useState("all");
  const [formatExport, setFormatExport] = useState("pdf");

  // AMBIL DATA DARI ZUSTAND GLOBAL STORE
  const { preferensi, infoBisnis, invoices, expenses } = useAppStore();
  const mataUang = preferensi.mataUang;

  const getPeriodeLabel = (val: string) => {
    switch (val) {
      case "last_30":
        return "30 Hari Terakhir";
      case "q1_2026":
        return "Kuartal I (Q1) 2026";
      case "q2_2026":
        return "Kuartal II (Q2) 2026";
      default:
        return "Semua Periode Histori";
    }
  };

  // ==========================================
  // KALKULASI & FILTER DATA STATISTIK (DINAMIS)
  // ==========================================
  const stats = useMemo(() => {
    let totalPendapatan = 0;
    let totalTertunda = 0;
    let totalPengeluaran = 0;

    let countLunas = 0;
    let countPending = 0;
    let countBelumBayar = 0;
    let countGagal = 0;

    const pendapatanKlien: Record<string, number> = {};
    const popularitasMetode: Record<string, number> = {};
    const popularitasLayanan: Record<
      string,
      { count: number; revenue: number }
    > = {};
    const klienUnik = new Set<string>();

    // 1. FILTER INVOICES (PENDAPATAN)
    const dataTerfilter = invoices.filter((inv) => {
      if (periodeExport === "all") return true;

      // Ambil tanggal invoice
      const tglString =
        inv.date || (inv as any).invoiceDate || (inv as any).tanggal;
      if (!tglString) return false;

      const invDate = new Date(tglString);
      const sekarang = new Date();

      switch (periodeExport) {
        case "last_30": {
          const batas30Hari = new Date();
          batas30Hari.setDate(sekarang.getDate() - 30);
          return invDate >= batas30Hari && invDate <= sekarang;
        }
        case "q1_2026": {
          return (
            invDate.getFullYear() === 2026 &&
            invDate.getMonth() >= 0 &&
            invDate.getMonth() <= 2
          );
        }
        case "q2_2026": {
          return (
            invDate.getFullYear() === 2026 &&
            invDate.getMonth() >= 3 &&
            invDate.getMonth() <= 5
          );
        }
        default:
          return true;
      }
    });

    dataTerfilter.forEach((inv) => {
      const nominal = parseCurrencyToNumber(inv.totalAmount);
      klienUnik.add(inv.clientName);

      switch (inv.paymentStatus) {
        case "Lunas":
          totalPendapatan += nominal;
          countLunas++;
          pendapatanKlien[inv.clientName] =
            (pendapatanKlien[inv.clientName] || 0) + nominal;
          break;
        case "Pending":
          totalTertunda += nominal;
          countPending++;
          break;
        case "Belum Bayar":
          totalTertunda += nominal;
          countBelumBayar++;
          break;
        case "Gagal":
          countGagal++;
          break;
      }

      if (inv.paymentMethod) {
        popularitasMetode[inv.paymentMethod] =
          (popularitasMetode[inv.paymentMethod] || 0) + 1;
      }

      if (inv.services && Array.isArray(inv.services)) {
        inv.services.forEach((svc) => {
          if (!popularitasLayanan[svc.nama]) {
            popularitasLayanan[svc.nama] = { count: 0, revenue: 0 };
          }
          popularitasLayanan[svc.nama].count += 1;
          popularitasLayanan[svc.nama].revenue += svc.harga;
        });
      }
    });

    // 2. FILTER PENGELUARAN (EXPENSES)
    const dataPengeluaranTerfilter = expenses.filter((exp) => {
      if (periodeExport === "all") return true;
      if (!exp.tanggal) return false;

      const expDate = new Date(exp.tanggal);
      const sekarang = new Date();

      switch (periodeExport) {
        case "last_30": {
          const batas30Hari = new Date();
          batas30Hari.setDate(sekarang.getDate() - 30);
          return expDate >= batas30Hari && expDate <= sekarang;
        }
        case "q1_2026": {
          return (
            expDate.getFullYear() === 2026 &&
            expDate.getMonth() >= 0 &&
            expDate.getMonth() <= 2
          );
        }
        case "q2_2026": {
          return (
            expDate.getFullYear() === 2026 &&
            expDate.getMonth() >= 3 &&
            expDate.getMonth() <= 5
          );
        }
        default:
          return true;
      }
    });

    dataPengeluaranTerfilter.forEach((exp) => {
      if (exp.status === "Dibayar") {
        totalPengeluaran += Number(exp.jumlah);
      }
    });

    const totalInvoices = dataTerfilter.length || 1;
    const rataRataTransaksi = countLunas > 0 ? totalPendapatan / countLunas : 0;
    const totalTagihanBerjalan = countLunas + countPending + countBelumBayar;
    const collectionRate =
      totalTagihanBerjalan > 0 ? (countLunas / totalTagihanBerjalan) * 100 : 0;
    const labaBersih = totalPendapatan - totalPengeluaran;

    const topKlien = Object.entries(pendapatanKlien)
      .map(([nama, total]) => ({ nama, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const topMetode = Object.entries(popularitasMetode)
      .map(([metode, count]) => ({ metode, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    const topLayanan = Object.entries(popularitasLayanan)
      .map(([nama, data]) => ({
        nama,
        count: data.count,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    return {
      totalPendapatan,
      totalTertunda,
      totalPengeluaran,
      labaBersih,
      totalInvoices: dataTerfilter.length,
      totalKlienAktif: klienUnik.size,
      rataRataTransaksi,
      collectionRate,
      distribusi: {
        lunas: (countLunas / totalInvoices) * 100,
        pending: (countPending / totalInvoices) * 100,
        belumBayar: (countBelumBayar / totalInvoices) * 100,
        gagal: (countGagal / totalInvoices) * 100,
      },
      counts: {
        lunas: countLunas,
        pending: countPending,
        belumBayar: countBelumBayar,
        gagal: countGagal,
      },
      topKlien,
      topMetode,
      topLayanan,
      rawDataTerfilter: dataTerfilter,
      rawPengeluaranTerfilter: dataPengeluaranTerfilter,
    };
  }, [periodeExport, invoices, expenses]); // Ditambahkan ke dependency array

  // ==========================================
  // HANDLER EKSPOR DATA (EXCEL & PDF VECTOR)
  // ==========================================
  const handleExport = () => {
    if (formatExport === "excel") {
      toast.info("Menyiapkan dokumen Excel...");
      const workbook = XLSX.utils.book_new();

      // SHEET 1: INVOICES
      const excelRows = stats.rawDataTerfilter.map((inv, idx) => ({
        No: idx + 1,
        "ID Invoice": inv.id || "-",
        "Nama Klien": inv.clientName,
        Tanggal: inv.date || "-",
        "Tenggat Waktu": inv.dueDate || "-",
        "Metode Pembayaran": inv.paymentMethod || "-",
        Status: inv.paymentStatus,
        "Total Penagihan (Angka)": parseCurrencyToNumber(inv.totalAmount),
      }));
      const worksheet = XLSX.utils.json_to_sheet(excelRows);
      worksheet["!cols"] = [
        { wch: 5 },
        { wch: 18 },
        { wch: 25 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
        { wch: 15 },
        { wch: 22 },
      ];
      XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Transaksi");

      // SHEET 2: EXPENSES
      const excelRowsExp = stats.rawPengeluaranTerfilter.map((exp, idx) => ({
        No: idx + 1,
        "ID Pengeluaran": exp.id || "-",
        Kategori: exp.kategori,
        Tanggal: exp.tanggal,
        Status: exp.status,
        "Total Biaya (Angka)": Number(exp.jumlah),
      }));
      const worksheetExp = XLSX.utils.json_to_sheet(excelRowsExp);
      worksheetExp["!cols"] = [
        { wch: 5 },
        { wch: 15 },
        { wch: 20 },
        { wch: 35 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
      ];
      XLSX.utils.book_append_sheet(
        workbook,
        worksheetExp,
        "Laporan Pengeluaran",
      );

      XLSX.writeFile(workbook, `Laporan_Finansial_${periodeExport}.xlsx`);
      toast.success(`Laporan Excel multi-sheet berhasil diunduh!`);
    } else if (formatExport === "pdf") {
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

      const barisTabelHtml = stats.rawDataTerfilter
        .map((inv, idx) => {
          let badgeStyle = "background: #f1f5f9; color: #475569;";
          if (inv.paymentStatus === "Lunas")
            badgeStyle = "background: #d1fae5; color: #065f46;";
          else if (inv.paymentStatus === "Pending")
            badgeStyle = "background: #fef3c7; color: #b45309;";
          else if (inv.paymentStatus === "Belum Bayar")
            badgeStyle = "background: #e0f2fe; color: #0369a1;";
          else if (inv.paymentStatus === "Gagal")
            badgeStyle = "background: #ffe4e6; color: #be123c;";

          return `
            <tr>
              <td class="text-center text-muted">${idx + 1}</td>
              <td class="font-mono text-bold">${inv.id || inv.invoice || "-"}</td>
              <td class="font-semibold">${inv.clientName}</td>
              <td class="text-muted">${inv.paymentMethod || "-"}</td>
              <td class="text-center"><span class="badge" style="${badgeStyle}">${inv.paymentStatus}</span></td>
              <td class="text-right font-bold">${convertAndFormatCurrency(parseCurrencyToNumber(inv.totalAmount), mataUang)}</td>
            </tr>
          `;
        })
        .join("");

      const barisTabelExpHtml = stats.rawPengeluaranTerfilter
        .map((exp, idx) => {
          let badgeStyle =
            exp.status === "Dibayar"
              ? "background: #d1fae5; color: #065f46;"
              : "background: #f1f5f9; color: #475569;";
          return `
            <tr>
              <td class="text-center text-muted">${idx + 1}</td>
              <td class="font-mono text-bold">${exp.id}</td>
              <td class="font-semibold">${exp.kategori}</td>
              <td class="font-semibold">${exp.deskripsi}</td>
              <td class="text-center"><span class="badge" style="${badgeStyle}">${exp.status}</span></td>
              <td class="text-right font-bold" style="color: #be123c;">${convertAndFormatCurrency(Number(exp.jumlah), mataUang)}</td>
            </tr>
          `;
        })
        .join("");

      const content = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Laporan Keuangan - ${infoBisnis?.nama || "Perusahaan"}</title>
            <style>
              @page { size: A4; margin: 20mm; }
              * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 0; line-height: 1.5; background: #ffffff; }
              .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 2px solid #e2e8f0; margin-bottom: 32px; }
              .brand-name { font-size: 24px; font-weight: 800; color: #2563eb; letter-spacing: -0.5px; margin: 0 0 4px 0; text-transform: uppercase; }
              .brand-address { font-size: 11px; color: #64748b; max-width: 250px; line-height: 1.4; }
              .report-title { font-size: 20px; font-weight: 800; color: #0f172a; text-align: right; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: -0.5px;}
              .report-meta { font-size: 11px; color: #64748b; text-align: right; margin: 2px 0; }
              .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 40px; }
              .metric-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; border-top: 4px solid #cbd5e1; }
              .metric-card.success { border-top-color: #10b981; }
              .metric-card.danger { border-top-color: #f43f5e; }
              .metric-card.primary { border-top-color: #3b82f6; }
              .metric-card.warning { border-top-color: #f59e0b; }
              .metric-title { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
              .metric-value { font-size: 14px; font-weight: 800; color: #0f172a; }
              .section-title { font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 16px; border-left: 4px solid #2563eb; padding-left: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 40px; }
              .table-modern { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
              .table-modern th { background: #f8fafc; color: #475569; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 14px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
              .table-modern td { padding: 14px 12px; font-size: 11px; border-bottom: 1px solid #f1f5f9; color: #334155; }
              .table-modern tr:last-child td { border-bottom: none; }
              .table-modern tr:nth-child(even) td { background: #fafaf9; }
              .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
              .font-bold { font-weight: 700; color: #0f172a; }
              .font-semibold { font-weight: 600; color: #1e293b; }
              .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
              .text-right { text-align: right !important; }
              .text-center { text-align: center !important; }
              .text-muted { color: #64748b; }
              .footer { margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; page-break-inside: avoid; }
              .signature-block { width: 200px; }
              .signature-title { font-size: 11px; color: #64748b; margin-bottom: 60px; }
              .signature-line { border-top: 1px solid #94a3b8; padding-top: 8px; font-size: 12px; font-weight: 700; color: #0f172a; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1 class="brand-name">${infoBisnis?.nama || "Perusahaan Anonim"}</h1>
                <div class="brand-address">${infoBisnis?.alamat || "Alamat belum diatur"}</div>
              </div>
              <div>
                <h2 class="report-title">Laporan Finansial Resmi</h2>
                <div class="report-meta">Periode: <b>${getPeriodeLabel(periodeExport)}</b></div>
                <div class="report-meta">Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
              </div>
            </div>

            <div class="metrics-grid">
              <div class="metric-card success">
                <div class="metric-title">Total Pendapatan (In)</div>
                <div class="metric-value">${convertAndFormatCurrency(stats.totalPendapatan, mataUang)}</div>
              </div>
              <div class="metric-card danger">
                <div class="metric-title">Total Beban (Out)</div>
                <div class="metric-value">${convertAndFormatCurrency(stats.totalPengeluaran, mataUang)}</div>
              </div>
              <div class="metric-card primary">
                <div class="metric-title">Laba Bersih (P&L)</div>
                <div class="metric-value" style="color: ${stats.labaBersih >= 0 ? "#0f172a" : "#be123c"}">${convertAndFormatCurrency(stats.labaBersih, mataUang)}</div>
              </div>
              <div class="metric-card warning">
                <div class="metric-title">Piutang Tertunda</div>
                <div class="metric-value">${convertAndFormatCurrency(stats.totalTertunda, mataUang)}</div>
              </div>
            </div>

            <div class="section-title" style="margin-top: 10px;">Buku Besar Pendapatan (Invoices)</div>
            <table class="table-modern">
              <thead>
                <tr>
                  <th class="text-center" style="width: 5%;">No</th>
                  <th style="width: 15%;">ID Invoice</th>
                  <th style="width: 30%;">Klien / Entitas</th>
                  <th style="width: 15%;">Metode</th>
                  <th class="text-center" style="width: 15%;">Status</th>
                  <th class="text-right" style="width: 20%;">Nominal</th>
                </tr>
              </thead>
              <tbody>
                ${barisTabelHtml || '<tr><td colspan="6" class="text-center text-muted" style="padding: 30px;">Tidak ada transaksi yang tercatat pada periode ini.</td></tr>'}
              </tbody>
            </table>

            <div class="section-title">Buku Besar Pengeluaran (Expenses)</div>
            <table class="table-modern">
              <thead>
                <tr>
                  <th class="text-center" style="width: 5%;">No</th>
                  <th style="width: 15%;">ID Biaya</th>
                  <th style="width: 20%;">Kategori</th>
                  <th style="width: 25%;">Deskripsi</th>
                  <th class="text-center" style="width: 15%;">Status</th>
                  <th class="text-right" style="width: 20%;">Nominal</th>
                </tr>
              </thead>
              <tbody>
                ${barisTabelExpHtml || '<tr><td colspan="6" class="text-center text-muted" style="padding: 30px;">Tidak ada pengeluaran yang tercatat pada periode ini.</td></tr>'}
              </tbody>
            </table>

            <div class="footer">
              <div class="signature-block">
                <div class="signature-title">Dibuat Otomatis Oleh Sistem,</div>
                <div class="signature-line">Invoice Automator Bot</div>
              </div>
              <div class="signature-block text-right">
                <div class="signature-title text-right">Disetujui Oleh Admin,</div>
                <div class="signature-line text-right">${infoBisnis?.nama || "Perusahaan Anonim"}</div>
              </div>
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
          toast.success(
            "Dokumen PDF berhasil diproses dan dikirim ke penampil cetak!",
          );
        }, 600);
      };
    }
  };

  return (
    <div className="max-w-6xl py-8 mx-auto font-sans flex flex-col gap-10 px-4 xl:px-0 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* HEADER */}
      <div className="flex flex-col items-start space-y-3 mt-2">
        <Badge
          variant="secondary"
          className="px-3 py-1 text-xs font-medium dark:bg-muted/50 border shadow-sm rounded-md"
        >
          Modul Analitik & Pelaporan
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Laporan Finansial
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Tinjau ringkasan pendapatan, pengeluaran operasional, laba bersih,
          serta ekspor data secara komprehensif.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* PANEL KIRI: PREVIEW STATS */}
        <div className="lg:col-span-2 space-y-6">
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {/* KARTU 1: PENDAPATAN */}
              <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0 w-fit mb-3">
                  <Wallet className="w-6 h-6" />
                </div>
                <div
                  className="text-xl sm:text-2xl font-bold text-foreground truncate"
                  title={convertAndFormatCurrency(
                    stats.totalPendapatan,
                    mataUang,
                  )}
                >
                  {convertAndFormatCurrency(stats.totalPendapatan, mataUang)}
                </div>
                <div className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">
                  Pendapatan Lunas
                </div>
              </div>

              {/* KARTU 2: PENGELUARAN */}
              <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl shrink-0 w-fit mb-3">
                  <TrendingDown className="w-6 h-6" />
                </div>
                <div
                  className="text-xl sm:text-2xl font-bold text-foreground truncate"
                  title={convertAndFormatCurrency(
                    stats.totalPengeluaran,
                    mataUang,
                  )}
                >
                  {convertAndFormatCurrency(stats.totalPengeluaran, mataUang)}
                </div>
                <div className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">
                  Total Pengeluaran
                </div>
              </div>

              {/* KARTU 3: LABA BERSIH */}
              <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl shrink-0 w-fit mb-3">
                  <Activity className="w-6 h-6" />
                </div>
                <div
                  className="text-xl sm:text-2xl font-bold text-foreground truncate"
                  title={convertAndFormatCurrency(stats.labaBersih, mataUang)}
                >
                  {convertAndFormatCurrency(stats.labaBersih, mataUang)}
                </div>
                <div className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">
                  Laba Bersih
                </div>
              </div>

              {/* KARTU 4: PIUTANG TERTUNDA */}
              <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl shrink-0 w-fit mb-3">
                  <Clock className="w-6 h-6" />
                </div>
                <div
                  className="text-xl sm:text-2xl font-bold text-foreground truncate"
                  title={convertAndFormatCurrency(
                    stats.totalTertunda,
                    mataUang,
                  )}
                >
                  {convertAndFormatCurrency(stats.totalTertunda, mataUang)}
                </div>
                <div className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">
                  Piutang Tertunda
                </div>
              </div>
            </div>
          </section>

          {/* KONTRIBUTOR KLIEN */}
          <Card className="rounded-2xl shadow-sm border-border overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" /> Klien Kontributor
                Utama
              </CardTitle>
              <CardDescription>
                Peringkat 5 klien teratas dengan total akumulasi nilai transaksi
                yang telah lunas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border bg-card overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="w-16 text-center">
                        Peringkat
                      </TableHead>
                      <TableHead>Nama Klien / Entitas</TableHead>
                      <TableHead className="text-right">
                        Total Pendapatan
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.topKlien.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-muted-foreground py-8"
                        >
                          Belum ada data pendapatan lunas pada periode ini.
                        </TableCell>
                      </TableRow>
                    ) : (
                      stats.topKlien.map((klien, index) => (
                        <TableRow
                          key={index}
                          className="hover:bg-muted/40 transition-colors"
                        >
                          <TableCell className="text-center font-bold text-muted-foreground">
                            #{index + 1}
                          </TableCell>
                          <TableCell className="font-semibold text-foreground">
                            {klien.nama}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-md font-bold text-sm inline-block">
                              {convertAndFormatCurrency(klien.total, mataUang)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* LAYANAN DAN METODE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="rounded-2xl shadow-sm border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-indigo-500" /> Katalog
                  Layanan Terlaris
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {stats.topLayanan.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      Tidak ada layanan tercatat.
                    </p>
                  ) : (
                    stats.topLayanan.map((item) => (
                      <div
                        key={item.nama}
                        className="flex items-center justify-between p-3 border rounded-xl bg-card"
                      >
                        <div className="space-y-0.5 truncate max-w-[70%]">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {item.nama}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {convertAndFormatCurrency(item.revenue, mataUang)}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="font-bold shrink-0"
                        >
                          {item.count}x
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-500" /> Metode
                  Pembayaran Terfavorit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {stats.topMetode.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      Belum ada transaksi.
                    </p>
                  ) : (
                    stats.topMetode.map((item) => (
                      <div
                        key={item.metode}
                        className="flex items-center justify-between p-3 border rounded-xl bg-card"
                      >
                        <span className="text-sm font-medium text-foreground">
                          {item.metode}
                        </span>
                        <Badge
                          variant="outline"
                          className="font-bold bg-blue-500/5 text-blue-600 border-blue-500/20"
                        >
                          {item.count} Invoice
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* TABEL RIWAYAT PENGELUARAN */}
          <Card className="rounded-2xl shadow-sm border-border overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-rose-500" /> Sorotan
                Pengeluaran Terbaru
              </CardTitle>
              <CardDescription>
                5 riwayat pengeluaran operasional terakhir pada periode yang
                dipilih.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border bg-card overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Kategori Biaya</TableHead>
                      <TableHead className="text-right">Nominal</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.rawPengeluaranTerfilter.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground py-8"
                        >
                          Belum ada pengeluaran yang tercatat pada periode ini.
                        </TableCell>
                      </TableRow>
                    ) : (
                      stats.rawPengeluaranTerfilter
                        .slice(0, 5)
                        .map((exp, index) => (
                          <TableRow
                            key={index}
                            className="hover:bg-muted/50 transition-colors border-b border-muted/50"
                          >
                            <TableCell className="text-muted-foreground text-sm">
                              {exp.tanggal}
                            </TableCell>
                            <TableCell className="font-medium text-foreground">
                              {exp.deskripsi}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className="rounded-full bg-muted text-muted-foreground hover:bg-muted/80 border-transparent font-medium"
                              >
                                {exp.kategori}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono font-semibold text-right">
                              {convertAndFormatCurrency(
                                parseCurrencyToNumber(exp.jumlah),
                                mataUang,
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant={
                                  exp.status === "Dibayar"
                                    ? "default"
                                    : "outline"
                                }
                                className={
                                  exp.status === "Dibayar"
                                    ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20"
                                    : "text-amber-600 border-amber-600/20 bg-amber-500/10"
                                }
                              >
                                {exp.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PANEL KANAN: KONTROL KONFIGURASI EKSPOR */}
        <div className="lg:col-span-1 lg:sticky lg:top-6">
          <Card className="rounded-2xl shadow-md border-primary/20 overflow-hidden flex flex-col h-full bg-gradient-to-b from-card to-muted/20">
            <div className="h-2 w-full bg-gradient-to-r from-primary via-indigo-500 to-emerald-500" />
            <CardHeader className="pb-5">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> Pengaturan
                Kompilasi
              </CardTitle>
              <CardDescription>
                Tentukan parameter cakupan data laporan berkas di bawah ini.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> Jangkauan
                  Waktu
                </Label>
                <Select value={periodeExport} onValueChange={setPeriodeExport}>
                  <SelectTrigger className="w-full h-11 rounded-xl shadow-none bg-background">
                    <SelectValue placeholder="Pilih Cakupan" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">Semua Histori Data</SelectItem>
                    <SelectItem value="last_30">30 Hari Terakhir</SelectItem>
                    <SelectItem value="q1_2026">
                      Kuartal 1 (Q1) — 2026
                    </SelectItem>
                    <SelectItem value="q2_2026">
                      Kuartal 2 (Q2) — 2026
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-primary" /> Format
                  Output Dokumen
                </Label>
                <Select value={formatExport} onValueChange={setFormatExport}>
                  <SelectTrigger className="w-full h-11 rounded-xl shadow-none bg-background">
                    <SelectValue placeholder="Pilih Format Ekspor" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="pdf">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-red-500" /> PDF
                        (Dokumen Cetak Resmi)
                      </div>
                    </SelectItem>
                    <SelectItem value="excel">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-500" />{" "}
                        Excel (Lembar Data .xlsx)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground/80 leading-relaxed pt-1">
                  * Laporan PDF menyertakan metrik laba rugi dan tabel
                  pengeluaran. File Excel akan memiliki lembar sheet (tab) ganda
                  otomatis.
                </p>
              </div>
            </CardContent>

            <CardFooter className="mt-auto border-t bg-muted/30 px-6 py-5">
              <Button
                onClick={handleExport}
                className="w-full h-11 cursor-pointer rounded-xl font-bold gap-2 shadow-md hover:opacity-90 active:scale-[0.98] transition-all bg-primary text-primary-foreground"
              >
                <Download className="w-4 h-4" /> Proses & Unduh Dokumen
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
