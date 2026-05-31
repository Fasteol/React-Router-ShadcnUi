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
import {
  Activity,
  CreditCard,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Download,
} from "lucide-react";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";

// ==========================================
// IMPORT DATA DARI INVOICE.TS
// Sesuaikan path import di bawah ini dengan lokasi file invoice.ts kamu
// ==========================================
import { dataAwal, type Invoice } from "~/data/invoices";

const chartConfig = {
  pendapatan: {
    label: "Pendapatan (Rp)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

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

export default function DashboardPage() {
  const navigate = useNavigate();

  const {
    totalPendapatan,
    totalLunas,
    totalMenunggu,
    tingkatKesuksesan,
    chartData,
    aktivitasTerbaru,
  } = useMemo(() => {
    let pendapatan = 0;
    let lunas = 0;
    let menunggu = 0;

    const monthlyData = [
      { bulan: "Januari", pendapatan: 0 },
      { bulan: "Februari", pendapatan: 0 },
      { bulan: "Maret", pendapatan: 0 },
      { bulan: "April", pendapatan: 0 },
      { bulan: "Mei", pendapatan: 0 },
      { bulan: "Juni", pendapatan: 0 },
      { bulan: "Juli", pendapatan: 0 },
    ];

    dataAwal.forEach((invoice) => {
      if (invoice.paymentStatus === "Lunas") {
        lunas += 1;
        const nominal = parseRupiahToNumber(invoice.totalAmount);
        pendapatan += nominal;

        const monthIndex = new Date(invoice.date).getMonth();
        if (monthIndex >= 0 && monthIndex < 7) {
          monthlyData[monthIndex].pendapatan += nominal;
        }
      } else if (
        invoice.paymentStatus === "Pending" ||
        invoice.paymentStatus === "Belum Bayar"
      ) {
        menunggu += 1;
      }
    });

    const tingkatSukses =
      dataAwal.length > 0 ? ((lunas / dataAwal.length) * 100).toFixed(1) : "0";

    const terbaru = dataAwal.slice(0, 4);

    return {
      totalPendapatan: pendapatan,
      totalLunas: lunas,
      totalMenunggu: menunggu,
      tingkatKesuksesan: tingkatSukses,
      chartData: monthlyData,
      aktivitasTerbaru: terbaru,
    };
  }, []);

  return (
    <div className="flex flex-col gap-8">
      {/* === HEADER DASHBOARD === */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Ringkasan performa finansial dan aktivitas invoice terbaru.
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
            Lihat Semua Transaksi
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* METRIK UTAMA (4 KOLOM) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm rounded-lg">
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

        <Card className="shadow-sm rounded-lg">
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

        <Card className="shadow-sm rounded-lg">
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

        <Card className="shadow-sm rounded-lg">
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

      {/* KONTEN BAWAH (2 KOLOM: GRAFIK & AKTIVITAS) */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-sm flex flex-col rounded-lg">
          <CardHeader>
            <CardTitle>Overview Pendapatan</CardTitle>
            <CardDescription>
              Data pendapatan berjalan dari Januari hingga Juli.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            <ChartContainer config={chartConfig} className="h-75 w-full">
              <BarChart accessibilityLayer data={chartData}>
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
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel={false} />}
                />
                <Bar
                  dataKey="pendapatan"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-lg">
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>
              Transaksi terakhir yang masuk ke sistem.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
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
                    <p className="text-[11px] text-muted-foreground/80 mt-1">
                      {item.paymentMethod}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
