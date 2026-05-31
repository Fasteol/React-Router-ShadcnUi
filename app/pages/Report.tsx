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
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { toast } from "sonner";
import { dataAwal } from "~/data/invoices"; // Mengambil data invoice yang sudah kita buat

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

    dataAwal.forEach((inv) => {
      const nominal = parseRupiah(inv.totalAmount);

      switch (inv.paymentStatus) {
        case "Lunas":
          totalPendapatan += nominal;
          countLunas++;
          break;
        case "Pending":
          totalTertunda += nominal;
          countPending++;
          break;
        case "Belum Bayar":
          totalTertunda += nominal; // Kita anggap Belum Bayar sebagai potensi tertunda
          countBelumBayar++;
          break;
        case "Gagal":
          countGagal++;
          break;
      }
    });

    const totalInvoices = dataAwal.length;

    return {
      totalPendapatan,
      totalTertunda,
      totalInvoices,
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
    };
  }, []);

  // ==========================================
  // HANDLER EXPORT
  // ==========================================
  const handleExport = () => {
    toast.success(`Laporan (${formatExport.toUpperCase()}) sedang diunduh...`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-16">
      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Laporan Finansial</h1>
        <p className="text-muted-foreground">
          Tinjau ringkasan pendapatan, analisis status tagihan, dan ekspor data
          operasional.
        </p>
      </div>

      <div className="space-y-8">
        {/* ==========================================
            SECTION 1: IKHTISAR KEUANGAN
        ========================================== */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Ikhtisar Pendapatan
          </h2>

          <Card className="rounded-lg shadow-sm border-border">
            <CardHeader>
              <CardTitle className="text-base">Performa Keseluruhan</CardTitle>
              <CardDescription>
                Kalkulasi otomatis berdasarkan seluruh data tagihan yang
                tercatat di sistem.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {/* Metrik 1 */}
                <div className="space-y-2 rounded-lg border p-4 shadow-sm">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Pendapatan (Lunas)
                  </p>
                  <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(stats.totalPendapatan)}
                  </p>
                </div>

                {/* Metrik 2 */}
                <div className="space-y-2 rounded-lg border p-4 shadow-sm">
                  <p className="text-sm font-medium text-muted-foreground">
                    Potensi & Tertunda
                  </p>
                  <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                    {formatRupiah(stats.totalTertunda)}
                  </p>
                </div>

                {/* Metrik 3 */}
                <div className="space-y-2 rounded-lg border p-4 shadow-sm">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Dokumen Tagihan
                  </p>
                  <p className="text-2xl font-bold tracking-tight">
                    {stats.totalInvoices}{" "}
                    <span className="text-base font-normal text-muted-foreground">
                      Invoice
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ==========================================
            SECTION 2: ANALISIS STATUS
        ========================================== */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Analisis Tagihan
          </h2>

          <Card className="rounded-lg shadow-sm border-border">
            <CardHeader>
              <CardTitle className="text-base">
                Distribusi Status Pembayaran
              </CardTitle>
              <CardDescription>
                Persentase keberhasilan dan status dari {stats.totalInvoices}{" "}
                invoice yang diterbitkan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Item: Lunas */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    Lunas ({stats.counts.lunas})
                  </span>
                  <span className="text-muted-foreground">
                    {stats.distribusi.lunas.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${stats.distribusi.lunas}%` }}
                  />
                </div>
              </div>

              {/* Item: Pending */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    Pending ({stats.counts.pending})
                  </span>
                  <span className="text-muted-foreground">
                    {stats.distribusi.pending.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${stats.distribusi.pending}%` }}
                  />
                </div>
              </div>

              {/* Item: Belum Bayar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    Belum Bayar ({stats.counts.belumBayar})
                  </span>
                  <span className="text-muted-foreground">
                    {stats.distribusi.belumBayar.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${stats.distribusi.belumBayar}%` }}
                  />
                </div>
              </div>

              {/* Item: Gagal */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    Gagal ({stats.counts.gagal})
                  </span>
                  <span className="text-muted-foreground">
                    {stats.distribusi.gagal.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-red-500"
                    style={{ width: `${stats.distribusi.gagal}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ==========================================
            SECTION 3: EKSPOR DATA
        ========================================== */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Manajemen Laporan
          </h2>

          <Card className="rounded-lg shadow-sm border-border">
            <CardHeader>
              <CardTitle className="text-base">Ekspor Data Invoice</CardTitle>
              <CardDescription>
                Unduh rekapitulasi data tagihan Anda untuk keperluan audit atau
                pembukuan eksternal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 max-w-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label>Periode Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Cakupan waktu laporan yang ingin diunduh.
                  </p>
                </div>
                <Select value={periodeExport} onValueChange={setPeriodeExport}>
                  <SelectTrigger className="w-full sm:w-[250px] rounded-md">
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

              <div className="shrink-0 bg-border h-[1px] w-full" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label>Format File</Label>
                  <p className="text-sm text-muted-foreground">
                    Pilih ekstensi file sesuai kebutuhan sistem Anda.
                  </p>
                </div>
                <Select value={formatExport} onValueChange={setFormatExport}>
                  <SelectTrigger className="w-full sm:w-[250px] rounded-md">
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
            <CardFooter className="border-t bg-muted/40 px-6 py-4 flex items-center justify-between rounded-b-lg">
              <p className="text-sm text-muted-foreground hidden sm:block">
                Sistem akan memproses dokumen secara otomatis.
              </p>
              <Button
                onClick={handleExport}
                size="sm"
                className="rounded-md w-full sm:w-auto cursor-pointer"
              >
                Unduh Laporan
              </Button>
            </CardFooter>
          </Card>
        </section>
      </div>
    </div>
  );
}
