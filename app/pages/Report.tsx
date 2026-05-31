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
    const klienUnik = new Set<string>();

    dataAwal.forEach((inv) => {
      const nominal = parseRupiah(inv.totalAmount);
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

      popularitasMetode[inv.paymentMethod] =
        (popularitasMetode[inv.paymentMethod] || 0) + 1;
    });

    const totalInvoices = dataAwal.length;

    const topKlien = Object.entries(pendapatanKlien)
      .map(([nama, total]) => ({ nama, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Menampilkan semua metode tanpa dibatasi (akan diatur via Grid UI)
    const topMetode = Object.entries(popularitasMetode)
      .map(([metode, count]) => ({ metode, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalPendapatan,
      totalTertunda,
      totalInvoices,
      totalKlienAktif: klienUnik.size,
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
    };
  }, []);

  const handleExport = () => {
    toast.success(`Laporan (${formatExport.toUpperCase()}) sedang diunduh...`);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-16">
      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Laporan Finansial</h1>
        <p className="text-muted-foreground">
          Tinjau ringkasan pendapatan, analisis klien teratas, dan ekspor data
          operasional.
        </p>
      </div>

      <div className="space-y-6">
        {/* ==========================================
            SECTION 1: IKHTISAR KEUANGAN
        ========================================== */}
        <section>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
            <Card className="rounded-lg shadow-sm border-border">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Pendapatan (Lunas)
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                  {formatRupiah(stats.totalPendapatan)}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-lg shadow-sm border-border">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">
                  Potensi & Tertunda
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                  {formatRupiah(stats.totalTertunda)}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-lg shadow-sm border-border">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Invoice
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight">
                  {stats.totalInvoices}{" "}
                  <span className="text-base font-normal text-muted-foreground">
                    Dokumen
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-lg shadow-sm border-border">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">
                  Klien Aktif
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight">
                  {stats.totalKlienAktif}{" "}
                  <span className="text-base font-normal text-muted-foreground">
                    Entitas
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ==========================================
            SECTION 2: BENTO GRID (LAYOUT BARU)
        ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* --- BARIS 1, KOLOM KIRI-TENGAH (SPAN 2) --- */}
          <Card className="lg:col-span-2 flex flex-col h-full rounded-lg shadow-sm border-border">
            <CardHeader>
              <CardTitle className="text-base">
                Klien Teratas Berdasarkan Pendapatan
              </CardTitle>
              <CardDescription>
                Lima penyumbang pendapatan terbesar (status lunas).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Klien</TableHead>
                    <TableHead className="text-right">
                      Total Pendapatan
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topKlien.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="text-center text-muted-foreground py-6"
                      >
                        Belum ada data pendapatan lunas.
                      </TableCell>
                    </TableRow>
                  ) : (
                    stats.topKlien.map((klien, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {klien.nama}
                        </TableCell>
                        <TableCell className="text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                          {formatRupiah(klien.total)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* --- BARIS 1, KOLOM KANAN (SPAN 1) --- */}
          <Card className="lg:col-span-1 flex flex-col h-full rounded-lg shadow-sm border-border">
            <CardHeader>
              <CardTitle className="text-base">Distribusi Status</CardTitle>
              <CardDescription>
                Persentase {stats.totalInvoices} invoice.
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
                  color: "bg-blue-500",
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
                    <span className="font-medium">
                      {item.label} ({item.count})
                    </span>
                    <span className="text-muted-foreground">
                      {item.pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full ${item.color}`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* --- BARIS 2, KOLOM KIRI-TENGAH (SPAN 2) --- */}
          <Card className="lg:col-span-2 flex flex-col h-full rounded-lg shadow-sm border-border">
            <CardHeader>
              <CardTitle className="text-base">
                Preferensi Metode Pembayaran
              </CardTitle>
              <CardDescription>
                Metode transaksi yang digunakan oleh klien.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Item metode dipecah jadi 2 kolom agar tidak kepanjangan ke bawah */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stats.topMetode.map((item, index) => (
                  <div
                    key={item.metode}
                    className="flex items-center justify-between p-3 border rounded-md bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                        {index + 1}
                      </span>
                      <span className="font-medium">{item.metode}</span>
                    </div>
                    <Badge variant="secondary" className="font-normal">
                      {item.count} Transaksi
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* --- BARIS 2, KOLOM KANAN (SPAN 1) --- */}
          <Card className="lg:col-span-1 flex flex-col h-full rounded-lg shadow-sm border-border">
            <CardHeader>
              <CardTitle className="text-base">Ekspor Data</CardTitle>
              <CardDescription>Unduh rekapitulasi audit.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
              <div className="space-y-2">
                <Label>Periode Data</Label>
                <Select value={periodeExport} onValueChange={setPeriodeExport}>
                  <SelectTrigger className="w-full rounded-md">
                    <SelectValue placeholder="Pilih Periode" />
                  </SelectTrigger>
                  <SelectContent>
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
                <Label>Format File</Label>
                <Select value={formatExport} onValueChange={setFormatExport}>
                  <SelectTrigger className="w-full rounded-md">
                    <SelectValue placeholder="Pilih Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                    <SelectItem value="pdf">PDF (Dokumen Cetak)</SelectItem>
                    <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>

            {/* mt-auto memastikan letak tombol konsisten di bawah */}
            <CardFooter className="mt-auto border-t bg-muted/40 px-6 py-4">
              <Button
                onClick={handleExport}
                className="w-full cursor-pointer rounded-md"
              >
                Proses & Unduh
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
