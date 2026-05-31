import { useState, useMemo } from "react";
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
import { dataAwal } from "~/data/invoices";

// IMPORT ICONS
import {
  BarChart3,
  Wallet,
  Clock,
  TrendingUp,
  Activity,
  Trophy,
  CreditCard,
  Download,
  PieChart,
  PackageCheck,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

// ==========================================
// UTILITY: Parsing & Formatting Mata Uang
// ==========================================
const parseRupiah = (rupiahString: string) => {
  return parseInt(rupiahString.replace(/[^0-9]/g, ""), 10) || 0;
};

const formatRupiah = (angka: number) => {
  return "Rp " + angka.toLocaleString("id-ID");
};

export default function ReportsPage() {
  const [periodeExport, setPeriodeExport] = useState("all");
  const [formatExport, setFormatExport] = useState("csv");

  // ==========================================
  // KALKULASI DATA STATISTIK DARI dataAwal
  // ==========================================
  const stats = useMemo(() => {
    let totalPendapatan = 0;
    let totalTertunda = 0;
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

    dataAwal.forEach((inv) => {
      const nominal = parseRupiah(inv.totalAmount);
      klienUnik.add(inv.clientName);

      // Hitung Status
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

      // Hitung Metode Pembayaran
      popularitasMetode[inv.paymentMethod] =
        (popularitasMetode[inv.paymentMethod] || 0) + 1;

      // Hitung Layanan Terpopuler (Berdasarkan rincian services)
      if (inv.services && Array.isArray(inv.services)) {
        inv.services.forEach((svc) => {
          if (!popularitasLayanan[svc.nama]) {
            popularitasLayanan[svc.nama] = { count: 0, revenue: 0 };
          }
          popularitasLayanan[svc.nama].count += 1;
          // Hitung revenue layanan hanya jika invoice statusnya Lunas (opsional, disini dihitung semua potensinya)
          popularitasLayanan[svc.nama].revenue += svc.harga;
        });
      }
    });

    const totalInvoices = dataAwal.length;

    // Metrik Tambahan
    const rataRataTransaksi = countLunas > 0 ? totalPendapatan / countLunas : 0;
    const totalTagihanBerjalan = countLunas + countPending + countBelumBayar;
    const collectionRate =
      totalTagihanBerjalan > 0 ? (countLunas / totalTagihanBerjalan) * 100 : 0;

    // Sort Klien Top 5
    const topKlien = Object.entries(pendapatanKlien)
      .map(([nama, total]) => ({ nama, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Sort Metode Top 4
    const topMetode = Object.entries(popularitasMetode)
      .map(([metode, count]) => ({ metode, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    // Sort Layanan Top 4
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
      totalInvoices,
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
    };
  }, []);

  const handleExport = () => {
    toast.success(`Laporan (${formatExport.toUpperCase()}) sedang diunduh...`);
  };

  return (
    <div className="max-w-6xl py-8 mx-auto font-sans flex flex-col gap-10 px-4 xl:px-0 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* ==========================================
          HEADER SECTION
      ========================================== */}
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
          Tinjau ringkasan pendapatan, analisis performa klien, tren layanan
          terpopuler, dan ekspor data operasional secara komprehensif.
        </p>
      </div>

      <div className="space-y-6">
        {/* ==========================================
            SECTION 1: IKHTISAR KEUANGAN (METRIK UTAMA)
        ========================================== */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Card 1: Total Pendapatan */}
            <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0 w-fit mb-3">
                <Wallet className="w-6 h-6" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground truncate">
                {formatRupiah(stats.totalPendapatan)}
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">
                Total Pendapatan (Lunas)
              </div>
            </div>

            {/* Card 2: Potensi Tertunda */}
            <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl shrink-0 w-fit mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground truncate">
                {formatRupiah(stats.totalTertunda)}
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">
                Piutang & Tertunda
              </div>
            </div>

            {/* Card 3: Rata-Rata Transaksi */}
            <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl shrink-0 w-fit mb-3">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground truncate">
                {formatRupiah(stats.rataRataTransaksi)}
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">
                Nilai Rata-rata Transaksi
              </div>
            </div>

            {/* Card 4: Collection Rate */}
            <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl shrink-0 w-fit mb-3">
                <Activity className="w-6 h-6" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground truncate">
                {stats.collectionRate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">
                Tingkat Kolektibilitas (Success Rate)
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            SECTION 2: BENTO GRID (ANALITIK MENDALAM)
        ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* --- BARIS 1, KOLOM KIRI (SPAN 2) --- */}
          <Card className="lg:col-span-2 flex flex-col h-full rounded-2xl shadow-sm border-border overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-emerald-500" />
                Klien Teratas Berdasarkan Omzet
              </CardTitle>
              <CardDescription>
                Lima entitas penyumbang pendapatan terbesar dari transaksi yang
                telah lunas.
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
                          Belum ada data pendapatan lunas.
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
                              {formatRupiah(klien.total)}
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

          {/* --- BARIS 1, KOLOM KANAN (SPAN 1) --- */}
          <Card className="lg:col-span-1 flex flex-col h-full rounded-2xl shadow-sm border-border overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-primary to-primary/60"></div>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                Distribusi Status Tagihan
              </CardTitle>
              <CardDescription>
                Persentase dari total {stats.totalInvoices} dokumen invoice.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  label: "Lunas",
                  count: stats.counts.lunas,
                  pct: stats.distribusi.lunas,
                  color: "bg-emerald-500",
                },
                {
                  label: "Pending",
                  count: stats.counts.pending,
                  pct: stats.distribusi.pending,
                  color: "bg-amber-500",
                },
                {
                  label: "Belum Bayar",
                  count: stats.counts.belumBayar,
                  pct: stats.distribusi.belumBayar,
                  color: "bg-sky-500",
                },
                {
                  label: "Gagal",
                  count: stats.counts.gagal,
                  pct: stats.distribusi.gagal,
                  color: "bg-red-500",
                },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold flex items-center gap-2">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${item.color}`}
                      ></div>
                      {item.label}{" "}
                      <span className="text-muted-foreground font-normal">
                        ({item.count})
                      </span>
                    </span>
                    <span className="font-semibold text-muted-foreground">
                      {item.pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/50 border border-border/50">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${item.color}`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* --- BARIS 2, KOLOM KIRI (SPAN 1) --- */}
          <Card className="flex flex-col h-full rounded-2xl shadow-sm border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-indigo-500" />
                Layanan Terpopuler
              </CardTitle>
              <CardDescription>
                Produk/layanan paling sering ditagihkan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {stats.topLayanan.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-4 italic">
                    Belum ada data rincian layanan.
                  </div>
                ) : (
                  stats.topLayanan.map((item, index) => (
                    <div
                      key={item.nama}
                      className="flex items-center justify-between p-3 border rounded-xl bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="flex shrink-0 items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                          #{index + 1}
                        </span>
                        <div className="truncate">
                          <p className="font-semibold text-sm truncate">
                            {item.nama}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatRupiah(item.revenue)}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="font-bold shrink-0 shadow-none"
                      >
                        {item.count}x
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* --- BARIS 2, KOLOM TENGAH (SPAN 1) --- */}
          <Card className="flex flex-col h-full rounded-2xl shadow-sm border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-500" />
                Metode Pembayaran
              </CardTitle>
              <CardDescription>
                Preferensi transaksi pembayaran klien.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {stats.topMetode.map((item, index) => (
                  <div
                    key={item.metode}
                    className="flex items-center justify-between p-3.5 border rounded-xl bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex shrink-0 items-center justify-center w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="font-semibold text-sm">
                        {item.metode}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-md">
                      {item.count}{" "}
                      <span className="font-normal text-xs">Trx</span>
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* --- BARIS 2, KOLOM KANAN (SPAN 1) --- */}
          <Card className="flex flex-col h-full rounded-2xl shadow-sm border-border overflow-hidden">
            <div className="h-1.5 w-full bg-muted/60"></div>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="w-5 h-5 text-foreground" />
                Ekspor Laporan
              </CardTitle>
              <CardDescription>
                Unduh rekapitulasi audit dan transaksi.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-5">
              <div className="space-y-2">
                <Label className="font-semibold">Periode Data</Label>
                <Select value={periodeExport} onValueChange={setPeriodeExport}>
                  <SelectTrigger className="w-full rounded-xl bg-muted/30">
                    <SelectValue placeholder="Pilih Periode" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">Semua Waktu</SelectItem>
                    <SelectItem value="q1_2026">
                      Kuartal 1 (Jan - Mar 2026)
                    </SelectItem>
                    <SelectItem value="q2_2026">
                      Kuartal 2 (Apr - Jun 2026)
                    </SelectItem>
                    <SelectItem value="last_30">30 Hari Terakhir</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Format File Output</Label>
                <Select value={formatExport} onValueChange={setFormatExport}>
                  <SelectTrigger className="w-full rounded-xl bg-muted/30">
                    <SelectValue placeholder="Pilih Format" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="csv">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-500" />{" "}
                        CSV (Spreadsheet)
                      </div>
                    </SelectItem>
                    <SelectItem value="pdf">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-red-500" /> PDF
                        (Dokumen Cetak)
                      </div>
                    </SelectItem>
                    <SelectItem value="xlsx">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-emerald-600" /> Excel
                        (.xlsx)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>

            <CardFooter className="mt-auto border-t bg-muted/10 px-6 py-5">
              <Button
                onClick={handleExport}
                className="w-full cursor-pointer rounded-xl font-bold gap-2 shadow-sm"
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
