import { useMemo } from "react";
import { useNavigate } from "react-router";
import { format } from "date-fns";
import { id } from "date-fns/locale";

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
import {
  Activity,
  CreditCard,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Download,
  Plus,
  Users,
  Settings,
  Clock,
} from "lucide-react";

// TAMBAHKAN YAxis PADA IMPORT RECHARTS
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";

// ==========================================
// IMPORT DATA DARI INVOICE.TS
// ==========================================
import { dataAwal, type Invoice } from "~/data/invoices";

const chartConfig = {
  pendapatan: {
    label: "Pendapatan",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
const parseRupiahToNumber = (rupiahString: string) => {
  return parseInt(rupiahString.replace(/[^0-9]/g, ""), 10) || 0;
};

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
};

// Formatter khusus untuk Sumbu Y di Grafik (Miliar/Juta)
const formatYAxis = (tickItem: number) => {
  if (tickItem >= 1000000000) {
    return (tickItem / 1000000000).toFixed(1) + " M";
  }
  if (tickItem >= 1000000) {
    return (tickItem / 1000000).toFixed(0) + " Jt";
  }
  if (tickItem >= 1000) {
    return (tickItem / 1000).toFixed(0) + " Rb";
  }
  return tickItem.toString();
};

export default function DashboardPage() {
  const navigate = useNavigate();

  const {
    totalPendapatan,
    totalLunas,
    totalMenunggu,
    tingkatKesuksesan,
    chartData,
    aktivitasTerbaru,
    tagihanMendesak,
  } = useMemo(() => {
    let pendapatan = 0;
    let lunas = 0;
    let menunggu = 0;

    // Menghapus Juni & Juli karena data generator hanya sampai Mei (Bulan 1-5)
    const monthlyData = [
      { bulan: "Januari", pendapatan: 0 },
      { bulan: "Februari", pendapatan: 0 },
      { bulan: "Maret", pendapatan: 0 },
      { bulan: "April", pendapatan: 0 },
      { bulan: "Mei", pendapatan: 0 },
    ];

    const belumLunas: Invoice[] = [];

    dataAwal.forEach((invoice) => {
      if (invoice.paymentStatus === "Lunas") {
        lunas += 1;
        const nominal = parseRupiahToNumber(invoice.totalAmount);
        pendapatan += nominal;

        const monthIndex = new Date(invoice.date).getMonth();
        // Hanya memproses bulan Januari (0) hingga Mei (4)
        if (monthIndex >= 0 && monthIndex < 5) {
          monthlyData[monthIndex].pendapatan += nominal;
        }
      } else if (
        invoice.paymentStatus === "Pending" ||
        invoice.paymentStatus === "Belum Bayar"
      ) {
        menunggu += 1;
        belumLunas.push(invoice);
      }
    });

    const tingkatSukses =
      dataAwal.length > 0 ? ((lunas / dataAwal.length) * 100).toFixed(1) : "0";

    const terbaru = dataAwal.slice(0, 5);

    const mendesak = belumLunas
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      )
      .slice(0, 5);

    return {
      totalPendapatan: pendapatan,
      totalLunas: lunas,
      totalMenunggu: menunggu,
      tingkatKesuksesan: tingkatSukses,
      chartData: monthlyData,
      aktivitasTerbaru: terbaru,
      tagihanMendesak: mendesak,
    };
  }, []);

  const tanggalHariIni = format(new Date(), "EEEE, dd MMMM yyyy", {
    locale: id,
  });

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* === HEADER DASHBOARD === */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Selamat datang kembali, Razan 👋
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {tanggalHariIni} • Ringkasan performa finansial hari ini.
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="w-full sm:w-auto gap-2 cursor-pointer rounded-md"
            onClick={() => alert("Fitur unduh laporan sedang dikembangkan!")}
          >
            <Download className="w-4 h-4" />
            Unduh Laporan
          </Button>

          <Button
            onClick={() => navigate("/transaction")}
            className="w-full sm:w-auto gap-2 cursor-pointer rounded-md"
          >
            Semua Transaksi
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* === QUICK ACTIONS === */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button
          variant="outline"
          className="h-auto py-5 flex flex-col gap-3 items-center justify-center rounded-xl cursor-pointer bg-card border-border shadow-sm transition-all hover:bg-accent hover:text-accent-foreground dark:bg-card/40 dark:hover:bg-accent/60"
          onClick={() => navigate("/transaction")}
        >
          <Plus className="h-6 w-6 text-primary" />
          <span className="text-sm font-medium">Buat Invoice</span>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-5 flex flex-col gap-3 items-center justify-center rounded-xl cursor-pointer bg-card border-border shadow-sm transition-all hover:bg-accent hover:text-accent-foreground dark:bg-card/40 dark:hover:bg-accent/60"
          onClick={() => navigate("/clients")}
        >
          {/* Tambahan dark:text-blue-400 agar tetap terang di Dark Mode */}
          <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium">Tambah Klien</span>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-5 flex flex-col gap-3 items-center justify-center rounded-xl cursor-pointer bg-card border-border shadow-sm transition-all hover:bg-accent hover:text-accent-foreground dark:bg-card/40 dark:hover:bg-accent/60"
          onClick={() => navigate("/report")}
        >
          {/* Tambahan dark:text-emerald-400 */}
          <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-medium">Lihat Analitik</span>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-5 flex flex-col gap-3 items-center justify-center rounded-xl cursor-pointer bg-card border-border shadow-sm transition-all hover:bg-accent hover:text-accent-foreground dark:bg-card/40 dark:hover:bg-accent/60"
          onClick={() => navigate("/setting")}
        >
          {/* text-muted-foreground sudah otomatis menyesuaikan dengan tema bawaan Shadcn */}
          <Settings className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm font-medium">Pengaturan</span>
        </Button>
      </div>

      {/* === METRIK UTAMA === */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm rounded-lg border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pendapatan
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatRupiah(totalPendapatan)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-600 dark:text-emerald-400">
                +20.1%
              </span>{" "}
              dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-lg border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoice Lunas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalLunas}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Transaksi berhasil bulan ini
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-lg border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Menunggu Pembayaran
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMenunggu}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Butuh tindak lanjut segera
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-lg border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tingkat Kesuksesan
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tingkatKesuksesan}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-emerald-600 dark:text-emerald-400">
                +1.2%
              </span>{" "}
              peningkatan performa{" "}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* === KONTEN BAWAH === */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-7 items-start">
        {/* GRAFIK PENDAPATAN */}
        <Card className="shadow-sm flex flex-col rounded-lg border-border lg:col-span-4 h-full">
          <CardHeader>
            <CardTitle>Overview Pendapatan</CardTitle>
            <CardDescription>
              Data pendapatan berjalan dari Januari hingga Mei.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            <ChartContainer config={chartConfig} className="h-full w-full">
              {/* Tambahkan margin agar label sumbu Y tidak terpotong */}
              <BarChart
                accessibilityLayer
                data={chartData}
                margin={{ left: 0, right: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  className="stroke-muted"
                />
                <XAxis
                  dataKey="bulan"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  className="text-xs text-muted-foreground"
                />

                {/* Y-AXIS DITAMBAHKAN DI SINI */}
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatYAxis}
                  width={60}
                  className="text-xs text-muted-foreground"
                />

                <ChartTooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                  content={
                    <ChartTooltipContent
                      hideLabel={false}
                      formatter={(value) => formatRupiah(value as number)}
                    />
                  }
                />

                {/* Penyesuaian Bar agar lebih konsisten dengan tema Shadcn */}
                <Bar
                  dataKey="pendapatan"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50} // Membatasi ketebalan maksimum batang
                  className="fill-primary" // Mengikuti tema light/dark otomatis
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* TABS AKTIVITAS & JATUH TEMPO */}
        <Card className="shadow-sm rounded-lg border-border lg:col-span-3 h-full">
          <CardHeader className="pb-3">
            <CardTitle>Manajemen Transaksi</CardTitle>
            <CardDescription>Pantau pergerakan tagihan Anda.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="terbaru" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="terbaru">Terbaru</TabsTrigger>
                <TabsTrigger value="mendesak" className="relative">
                  Jatuh Tempo
                  {tagihanMendesak.length > 0 && (
                    <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                </TabsTrigger>
              </TabsList>

              {/* TAB CONTENT: TERBARU */}
              <TabsContent value="terbaru" className="space-y-6 mt-0">
                {aktivitasTerbaru.map((item: Invoice, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold leading-none text-foreground">
                        {item.invoice}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground">
                        {item.clientName}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="font-semibold text-sm">
                        {item.totalAmount}
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          item.paymentStatus === "Lunas"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900"
                            : item.paymentStatus === "Pending"
                              ? "bg-amber-50 text-amber-700 border-amber-200 shadow-none dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900"
                              : item.paymentStatus === "Belum Bayar"
                                ? "bg-sky-50 text-sky-700 border-sky-200 shadow-none dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900"
                                : "bg-red-50 text-red-700 border-red-200 shadow-none dark:bg-red-950/40 dark:text-red-400 dark:border-red-900"
                        }
                      >
                        {item.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </TabsContent>

              {/* TAB CONTENT: JATUH TEMPO */}
              <TabsContent value="mendesak" className="space-y-6 mt-0">
                {tagihanMendesak.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    Tidak ada tagihan yang mendesak.
                  </div>
                ) : (
                  tagihanMendesak.map((item: Invoice, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-semibold leading-none text-foreground">
                          {item.invoice}
                        </p>
                        <p className="text-xs font-medium text-muted-foreground">
                          {item.clientName}
                        </p>
                        <div className="flex items-center gap-1 text-[11px] font-medium text-red-500 mt-1">
                          <Clock className="w-3 h-3" />
                          Tempo: {item.dueDate}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="font-semibold text-sm">
                          {item.totalAmount}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => navigate("/transaction")}
                        >
                          Tinjau
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
