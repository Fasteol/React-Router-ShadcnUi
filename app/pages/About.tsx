import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

// Import ikon tambahan untuk konten baru
import {
  CheckCircle2,
  Code,
  LayoutDashboard,
  ArrowLeft,
  BarChart3,
  User,
  ShieldCheck,
  Zap,
  Milestone,
  ArrowRightLeft,
  Users,
  Package,
  Settings,
  CreditCard,
  Globe,
  DownloadCloud,
  Banknote,
  Palette,
  Wallet,
  UserCog,
  MapPin,
  Cpu,
} from "lucide-react";

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl py-8 mx-auto font-sans flex flex-col gap-12 px-4 xl:px-0 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* ==========================================
          HEADER SECTION
      ========================================== */}
      <div className="flex flex-col items-center text-center space-y-4 mt-4">
        <Badge
          variant="secondary"
          className="px-3 py-1 text-xs font-medium dark:bg-muted/50 border shadow-sm text-primary"
        >
          Versi 3.0.0 (Standarisasi UI & Optimasi Performa)
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Tentang Sistem Invoice & Manajemen
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Platform manajemen bisnis terpadu yang dirancang dengan pendekatan
          antarmuka modern dan minimalis. Membantu Anda mengelola siklus
          transaksi, pelacakan biaya operasional, hingga analisis finansial
          secara komprehensif tanpa hambatan visual.
        </p>
      </div>

      {/* ==========================================
          SECTION: PEMBARUAN TERBARU (CHANGELOG)
      ========================================== */}
      <div className="space-y-6">
        <div className="text-center space-y-2 mb-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Sorotan Pembaruan Terbaru
          </h2>
          <p className="text-muted-foreground text-sm">
            Fungsionalitas dan peningkatan arsitektur berskala besar pada
            sistem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: Zap,
              title: "Optimasi Render (useMemo)",
              desc: "Kalkulasi data dan sistem filter kini dibungkus dengan useMemo, mencegah re-render dan meningkatkan performa sistem secara drastis.",
              color: "text-amber-500",
              bg: "bg-amber-500/10",
              borderColor: "border-amber-500/20",
            },
            {
              icon: Palette,
              title: "Standarisasi UI/UX",
              desc: "Penyelarasan layout grid, proporsi input form (h-10), dan konsistensi tombol responsif di seluruh modul aplikasi.",
              color: "text-indigo-500",
              bg: "bg-indigo-500/10",
              borderColor: "border-indigo-500/20",
            },
            {
              icon: UserCog,
              title: "Manajemen Hak Akses",
              desc: "Kontrol keamanan ganda dengan pembagian Role (Admin, Finance, Viewer) yang terstruktur rapi.",
              color: "text-blue-500",
              bg: "bg-blue-500/10",
              borderColor: "border-blue-500/20",
            },
            {
              icon: Wallet,
              title: "Expense Tracking",
              desc: "Pelacakan biaya operasional terintegrasi untuk kalkulasi rasio margin dan profit bersih secara riil.",
              color: "text-rose-500",
              bg: "bg-rose-500/10",
              borderColor: "border-rose-500/20",
            },
            {
              icon: Banknote,
              title: "Sistem Multi-Mata Uang",
              desc: "Dukungan penuh konversi IDR ke USD secara real-time pada seluruh modul dengan input absolut yang bersih.",
              color: "text-emerald-500",
              bg: "bg-emerald-500/10",
              borderColor: "border-emerald-500/20",
            },
            {
              icon: DownloadCloud,
              title: "Ekspor Laporan PDF & Excel",
              desc: "Pembuatan otomatis laporan finansial berformat PDF resmi (dengan kop surat) & Spreadsheet.",
              color: "text-violet-500",
              bg: "bg-violet-500/10",
              borderColor: "border-violet-500/20",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`flex flex-col p-5 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-1 ${item.borderColor}`}
            >
              <div
                className={`p-3 rounded-xl w-fit ${item.bg} ${item.color} mb-4`}
              >
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-foreground text-sm mb-1">
                {item.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ==========================================
          SECTION: MODUL SISTEM (Berdasarkan Sidebar)
      ========================================== */}
      <div className="space-y-4 border-t pt-10">
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Ekosistem Manajemen
          </h2>
          <p className="text-muted-foreground text-sm">
            Delapan pilar utama yang mendukung keseluruhan operasional bisnis
            Anda.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: LayoutDashboard,
              title: "Dashboard",
              desc: "Ringkasan Finansial",
              color: "text-blue-500",
              bg: "bg-blue-500/10",
            },
            {
              icon: ArrowRightLeft,
              title: "Transaksi",
              desc: "Kelola Invoice",
              color: "text-emerald-500",
              bg: "bg-emerald-500/10",
            },
            {
              icon: Wallet,
              title: "Pengeluaran",
              desc: "Catat Biaya",
              color: "text-amber-500",
              bg: "bg-amber-500/10",
            },
            {
              icon: User,
              title: "Klien",
              desc: "Database Pelanggan",
              color: "text-violet-500",
              bg: "bg-violet-500/10",
            },
            {
              icon: Package,
              title: "Layanan",
              desc: "Katalog Produk",
              color: "text-orange-500",
              bg: "bg-orange-500/10",
            },
            {
              icon: BarChart3,
              title: "Laporan",
              desc: "Analitik Data",
              color: "text-rose-500",
              bg: "bg-rose-500/10",
            },
            {
              icon: Users,
              title: "Manajemen Tim",
              desc: "Kontrol Hak Akses",
              color: "text-indigo-500",
              bg: "bg-indigo-500/10",
            },
            {
              icon: Settings,
              title: "Pengaturan",
              desc: "Konfigurasi Sistem",
              color: "text-slate-500",
              bg: "bg-slate-500/10",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center p-4 border rounded-2xl bg-card text-center hover:border-primary/50 transition-colors shadow-sm hover:shadow-md"
            >
              <div className={`p-3 rounded-full ${item.bg} ${item.color} mb-3`}>
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-sm">{item.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ==========================================
          CONTENT SECTION (GRID CARDS)
      ========================================== */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Card 1: Fitur Utama */}
        <Card className="shadow-sm flex flex-col rounded-2xl overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="w-5 h-5 text-emerald-500" />
              <CardTitle>Fitur & Kapabilitas Inti</CardTitle>
            </div>
            <CardDescription>
              Mekanisme yang dirancang untuk mempercepat alur kerja harian.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-sm flex-1">
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-foreground">
                  Sistem Invoice & Relasi Data Cerdas:
                </strong>{" "}
                Pembuatan tagihan super cepat dengan fitur penarikan data klien
                dan penyisipan layanan dari katalog yang saling terintegrasi
                dalam satu form.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-foreground">
                  Keamanan & Otorisasi Ketat:
                </strong>{" "}
                Sistem login terlindungi serta manajemen peran berbasis{" "}
                <i>tier</i> yang memastikan histori pengaturan dan akses data
                sensitif terkontrol dengan baik.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-foreground">
                  Skala Finansial Global:
                </strong>{" "}
                Pilihan mata uang ganda yang menyesuaikan rasio nilai tukar
                secara otomatis, dipadukan dengan kalkulasi pengeluaran
                (Expense) untuk menghitung profit aktual.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Teknologi & Desain */}
        <Card className="shadow-sm flex flex-col rounded-2xl overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-blue-400 to-indigo-600"></div>
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Code className="w-5 h-5 text-indigo-500" />
              <CardTitle>Teknologi & Ekosistem</CardTitle>
            </div>
            <CardDescription>
              Dibangun dengan <em>tech-stack</em> modern untuk skalabilitas
              maksimal.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 flex-1">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default" className="shadow-none rounded-md">
                React Router v7
              </Badge>
              <Badge variant="secondary" className="rounded-md">
                TypeScript
              </Badge>
              <Badge variant="secondary" className="rounded-md">
                Tailwind CSS
              </Badge>
              <Badge variant="outline" className="rounded-md">
                Shadcn UI
              </Badge>
              <Badge variant="outline" className="rounded-md">
                Recharts & XLSX
              </Badge>
              <Badge variant="outline" className="rounded-md">
                React Hooks (useMemo)
              </Badge>
            </div>

            <div className="bg-muted/30 p-4 rounded-xl text-sm text-muted-foreground leading-relaxed mt-auto border border-border/50">
              <strong className="text-foreground flex items-center gap-2 mb-2">
                <Palette className="w-4 h-4" /> Tema Dinamis & UX
              </strong>
              Didukung integrasi <strong>Dark Mode / Light Mode</strong> yang
              terikat dengan preferensi browser. Desain antarmuka difokuskan
              pada keterbacaan data grid, presisi komponen form, penggunaan{" "}
              <em>whitespace</em> yang lega, serta meminimalisir input manual
              demi akurasi pengolahan angka.
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Roadmap Masa Depan */}
        <Card className="shadow-sm flex flex-col md:col-span-2 rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Milestone className="w-5 h-5 text-primary" />
              <CardTitle>Peta Jalan Pengembangan (Roadmap)</CardTitle>
            </div>
            <CardDescription>
              Langkah strategis pencapaian evolusi sistem.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-4 gap-4 text-sm">
              <div className="p-4 border rounded-xl bg-card">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-0 shadow-none">
                    Fase 1
                  </Badge>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Selesai
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  Struktur UI dasar, modul CRUD Transaksi, Klien, Layanan, &
                  Dashboard awal.
                </p>
              </div>

              <div className="p-4 border rounded-xl bg-card">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-0 shadow-none">
                    Fase 2
                  </Badge>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Selesai
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  Ekspor PDF & Excel, Modul Pengaturan Sistem, Konversi Mata
                  Uang, dan Autentikasi.
                </p>
              </div>

              <div className="p-4 border rounded-xl bg-card relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                <div className="flex items-center justify-between mb-3 pl-2">
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-0 shadow-none">
                    Fase 3
                  </Badge>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Selesai
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium pl-2">
                  Pencatatan Expense, Manajemen Hak Akses Tim, dan Optimasi
                  Rendering (useMemo) secara menyeluruh.
                </p>
              </div>

              <div className="p-4 border border-dashed rounded-xl bg-muted/10 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary transition-all group-hover:w-1.5"></div>
                <div className="flex items-center justify-between mb-3 pl-2">
                  <Badge
                    variant="outline"
                    className="border-primary/50 text-primary"
                  >
                    Fase 4
                  </Badge>
                  <span className="font-bold text-primary text-xs flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    Proses
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium pl-2">
                  Integrasi Backend Database Publik (Supabase) & API Pengiriman
                  Invoice via Email otomatis.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Profil Pengembang */}
        <Card className="shadow-sm md:col-span-2 rounded-2xl bg-gradient-to-br from-card to-muted/30 border-muted">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
              <div className="w-24 h-24 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center text-4xl font-extrabold shrink-0 shadow-lg rotate-3 hover:rotate-0 transition-transform">
                R
              </div>
              <div className="text-center sm:text-left space-y-3 flex-1">
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold tracking-widest uppercase text-primary">
                      Lead Developer & UI/UX
                    </span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                    Razan Muhammad Fauzan Sya'bani
                  </h3>
                  <div className="text-sm text-muted-foreground mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" /> razan@fauzansyabani.dev
                    </span>
                    <span className="hidden sm:inline-block text-muted-foreground/30">
                      •
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> Bandung, Indonesia
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl mt-2">
                  Dikembangkan sebagai bentuk dedikasi dan eksplorasi mendalam
                  terhadap ekosistem pemrograman web modern. Mengusung estetika{" "}
                  <b>modern minimalis</b> dengan tampilan <i>clean look</i> yang
                  terstruktur rapi, proyek ini difokuskan pada arsitektur
                  komponen yang <i>reusable</i>, manajemen <b>state</b> yang
                  sangat efisien, serta menghadirkan pengalaman pengguna (UX)
                  yang setara dengan instrumen aplikasi skala <b>enterprise</b>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ==========================================
          FOOTER / CALL TO ACTION
      ========================================== */}
      <div className="flex flex-col sm:flex-row items-center justify-center mt-4 border-t pt-8 gap-4">
        <Button
          onClick={() => navigate("/")}
          variant="ghost"
          size="lg"
          className="gap-2 rounded-xl px-6 w-full sm:w-auto hover:bg-muted"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Button>
        <Button
          onClick={() => navigate("/transaction")}
          size="lg"
          className="gap-2 rounded-xl px-8 w-full sm:w-auto shadow-md font-bold"
        >
          Kelola Transaksi
          <ArrowRightLeft className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
