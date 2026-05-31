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
  Briefcase,
  PieChart as PieIcon,
  CheckCircle2,
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

// ==========================================
// IMPORT DATA
// ==========================================
import { dataAwal, type Invoice } from "~/data/invoices";

const chartConfig = {
  pendapatan: {
    label: "Pendapatan",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

// Warna untuk Donut Chart: Lunas (Emerald), Pending (Amber), Belum Bayar (Sky), Gagal (Rose)
const STATUS_COLORS: Record<string, string> = {
  Lunas: "#10b981",
  Pending: "#f59e0b",
  "Belum Bayar": "#0ea5e9",
  Gagal: "#e11d48",
};

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

const formatYAxis = (tickItem: number) => {
  if (tickItem >= 1000000000) return (tickItem / 1000000000).toFixed(1) + " M";
  if (tickItem >= 1000000) return (tickItem / 1000000).toFixed(0) + " Jt";
  if (tickItem >= 1000) return (tickItem / 1000).toFixed(0) + " Rb";
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
    statusData,
    aktivitasTerbaru,
    tagihanMendesak,
    topClients,
  } = useMemo(() => {
    let pendapatan = 0;
    let lunas = 0;
    let pending = 0;
    let belumBayar = 0;
    let gagal = 0;

    const monthlyData = [
      { bulan: "Jan", pendapatan: 0 },
      { bulan: "Feb", pendapatan: 0 },
      { bulan: "Mar", pendapatan: 0 },
      { bulan: "Apr", pendapatan: 0 },
      { bulan: "Mei", pendapatan: 0 },
    ];

    const belumLunas: Invoice[] = [];
    const clientRevenue: Record<string, number> = {};

    dataAwal.forEach((invoice) => {
      const nominal = parseRupiahToNumber(invoice.totalAmount);

      // Hitung pendapatan per klien
      if (!clientRevenue[invoice.clientName]) {
        clientRevenue[invoice.clientName] = 0;
      }

      if (invoice.paymentStatus === "Lunas") {
        lunas += 1;
        pendapatan += nominal;
        clientRevenue[invoice.clientName] += nominal;

        const monthIndex = new Date(invoice.date).getMonth();
        if (monthIndex >= 0 && monthIndex < 5) {
          monthlyData[monthIndex].pendapatan += nominal;
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

    const tingkatSukses =
      dataAwal.length > 0 ? ((lunas / dataAwal.length) * 100).toFixed(1) : "0";

    // Data untuk Donut Chart (filter agar yg bernilai 0 tidak muncul di chart)
    const statusChartData = [
      { name: "Lunas", value: lunas },
      { name: "Pending", value: pending },
      { name: "Belum Bayar", value: belumBayar },
      { name: "Gagal", value: gagal },
    ].filter((data) => data.value > 0);

    // Hitung Top Klien
    const sortedClients = Object.entries(clientRevenue)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 4);

    const terbaru = dataAwal.slice(0, 5);
    const mendesak = belumLunas
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      )
      .slice(0, 5);

    return {
      totalPendapatan: pendapatan,
      totalLunas: lunas,
      totalMenunggu: pending + belumBayar,
      tingkatKesuksesan: tingkatSukses,
      chartData: monthlyData,
      statusData: statusChartData,
      aktivitasTerbaru: terbaru,
      tagihanMendesak: mendesak,
      topClients: sortedClients,
    };
  }, []);

  const tanggalHariIni = format(new Date(), "EEEE, dd MMMM yyyy", {
    locale: id,
  });

  // Fungsi Helper untuk warna Badge Status
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

  return (
    <div className="flex flex-col gap-8 pb-10 animate-in fade-in duration-500 max-w-7xl mx-auto px-4 xl:px-0 mt-4">
      {/* === HEADER DASHBOARD === */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <Badge
            variant="secondary"
            className="mb-2 bg-primary/10 text-primary hover:bg-primary/20 border-none font-medium"
          >
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            {tanggalHariIni}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Kembali bekerja, Razan 👋
          </h1>
          <p className="text-muted-foreground">
            Berikut adalah ringkasan performa finansial bisnis Anda hari ini.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="w-full sm:w-auto gap-2 rounded-lg"
            onClick={() => alert("Mempersiapkan unduhan PDF...")}
          >
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button
            onClick={() => navigate("/transaction")}
            className="w-full sm:w-auto gap-2 rounded-lg shadow-md"
          >
            Semua Transaksi <ArrowUpRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* === METRIK UTAMA === */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm rounded-xl border-border/60 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Total Pendapatan
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {formatRupiah(totalPendapatan)}
            </div>
            <p className="text-xs font-medium mt-2 flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" /> +20.1%{" "}
              <span className="text-muted-foreground font-normal">
                vs bulan lalu
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-xl border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Invoice Lunas
            </CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {totalLunas}{" "}
              <span className="text-base font-medium text-muted-foreground">
                tagihan
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Berhasil dicairkan bulan ini
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-xl border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Menunggu Pembayaran
            </CardTitle>
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Activity className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {totalMenunggu}{" "}
              <span className="text-base font-medium text-muted-foreground">
                tagihan
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Butuh tindak lanjut segera
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-xl border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Sukses Rate
            </CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <PieIcon className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {tingkatKesuksesan}%
            </div>
            <p className="text-xs font-medium mt-2 flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" /> +1.2%{" "}
              <span className="text-muted-foreground font-normal">
                peningkatan konversi
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* === BAGIAN TENGAH: CHARTS === */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7 items-start">
        {/* GRAFIK BAR PENDAPATAN */}
        <Card className="shadow-sm rounded-xl border-border/60 lg:col-span-5 h-full flex flex-col">
          <CardHeader>
            <CardTitle>Arus Kas Pendapatan</CardTitle>
            <CardDescription>
              Akumulasi pembayaran lunas dari Januari hingga Mei tahun ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-4 px-2 sm:px-6">
            <ChartContainer config={chartConfig} className="h-full w-full">
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
                  width={50}
                  className="text-[11px] text-muted-foreground font-medium"
                />
                <ChartTooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.2 }}
                  content={
                    <ChartTooltipContent
                      hideLabel={false}
                      formatter={(value) => formatRupiah(value as number)}
                    />
                  }
                />
                <Bar
                  dataKey="pendapatan"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                  className="fill-primary"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        {/* GRAFIK DONUT & TOP KLIEN */}
        <div className="lg:col-span-2 space-y-6 flex flex-col h-full">
          {/* Donut Chart Status */}
          <Card className="shadow-sm rounded-xl border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Distribusi Status</CardTitle>
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

          {/* Top Clients */}
          <Card className="shadow-sm rounded-xl border-border/60 flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Klien Teratas
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
                    {/* truncate di sini untuk memastikan nama kepotong menjadi ... jika terlalu panjang */}
                    <span
                      className="text-sm font-medium truncate min-w-0"
                      title={client.name}
                    >
                      {client.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold shrink-0">
                    {formatRupiah(client.total)}
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
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="terbaru">Aktivitas Terbaru</TabsTrigger>
                <TabsTrigger value="mendesak" className="relative">
                  Jatuh Tempo
                  {tagihanMendesak.length > 0 && (
                    <span className="absolute top-2 right-3 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              {/* TAB CONTENT: TERBARU */}
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
                        {item.totalAmount}
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

              {/* TAB CONTENT: JATUH TEMPO */}
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
                      <div className="flex items-center gap-4 mt-3 sm:mt-0 ml-14 sm:ml-0 shrink-0">
                        <div className="font-bold text-sm">
                          {item.totalAmount}
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 text-xs font-semibold rounded-md"
                          onClick={() => navigate("/transaction")}
                        >
                          Tindak Lanjuti
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
