import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Activity,
  CreditCard,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router";

// 1. IMPORT KOMPONEN RECHARTS & SHADCN CHART
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";

// 2. DATA DUMMY UNTUK GRAFIK
const chartData = [
  { bulan: "Januari", pendapatan: 18600000 },
  { bulan: "Februari", pendapatan: 30500000 },
  { bulan: "Maret", pendapatan: 23700000 },
  { bulan: "April", pendapatan: 43000000 },
  { bulan: "Mei", pendapatan: 20900000 },
  { bulan: "Juni", pendapatan: 28400000 },
  { bulan: "Juli", pendapatan: 45231000 },
];

// 3. KONFIGURASI WARNA GRAFIK
const chartConfig = {
  pendapatan: {
    label: "Pendapatan (Rp)",
    color: "hsl(var(--primary))", // Menggunakan warna utama (primary) bawaan tema kamu
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-8">
      {/* HEADER DASHBOARD */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Ringkasan performa finansial dan aktivitas invoice terbaru.
          </p>
        </div>
        <Button onClick={() => navigate("/transaction")} className="gap-2">
          Lihat Semua Transaksi
          <ArrowUpRight className="w-4 h-4" />
        </Button>
      </div>

      {/* METRIK UTAMA (4 KOLOM) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pendapatan
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 45.231.000</div>
            <p className="text-xs text-muted-foreground mt-1 text-emerald-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +20.1% dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoice Lunas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+234</div>
            <p className="text-xs text-muted-foreground mt-1">
              Transaksi berhasil bulan ini
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Menunggu Pembayaran
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">
              Butuh tindak lanjut segera
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
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
            <div className="text-2xl font-bold">94.5%</div>
            <p className="text-xs text-muted-foreground mt-1">
              +1.2% peningkatan performa
            </p>
          </CardContent>
        </Card>
      </div>

      {/* KONTEN BAWAH (2 KOLOM: GRAFIK & AKTIVITAS) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* GRAFIK MENGGUNAKAN SHADCN CHART (Kiri - Lebar 4 Kolom) */}
        <Card className="col-span-4 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle>Overview Pendapatan</CardTitle>
            <CardDescription>
              Data pendapatan berjalan dari Januari hingga Juli.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            {/* Implementasi Komponen ChartContainer */}
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                {/* Garis Horizontal Latar Belakang */}
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  className="stroke-muted"
                />

                {/* Sumbu X (Nama Bulan) */}
                <XAxis
                  dataKey="bulan"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)} // Menyingkat Januari jadi Jan
                />

                {/* Tooltip Interaktif saat di-hover */}
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel={false} />}
                />

                {/* Balok Grafik (Bar) */}
                <Bar
                  dataKey="pendapatan"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]} // Melengkungkan sudut atas balok
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Aktivitas Terbaru (Kanan - Lebar 3 Kolom) */}
        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>
              5 transaksi terakhir yang masuk ke sistem.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    INV001 - Studio Ghibli
                  </p>
                  <p className="text-sm text-muted-foreground">Transfer Bank</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="font-medium">+Rp 1.500.000</div>
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none"
                  >
                    Lunas
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    INV002 - Tokopedia
                  </p>
                  <p className="text-sm text-muted-foreground">GoPay</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="font-medium">+Rp 450.000</div>
                  <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-700 border-amber-200 shadow-none"
                  >
                    Pending
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    INV003 - Pt. Mencari Cinta Sejati
                  </p>
                  <p className="text-sm text-muted-foreground">Kartu Kredit</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="font-medium">+Rp 3.200.000</div>
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none"
                  >
                    Lunas
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    INV004 - Razan Sya'bani
                  </p>
                  <p className="text-sm text-muted-foreground">QRIS</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="font-medium">+Rp 120.000</div>
                  <Badge
                    variant="outline"
                    className="bg-sky-50 text-sky-700 border-sky-200 shadow-none"
                  >
                    Belum Bayar
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
