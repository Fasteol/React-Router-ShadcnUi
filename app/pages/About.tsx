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
  Lock,
  ArrowRightLeft,
  Users,
  Package,
  FileText,
  Settings,
  CreditCard,
  Globe,
  LogIn,
  DownloadCloud,
  Banknote,
  Palette,
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
          Versi 2.0.0 (Autentikasi, Ekspor, & Multi-Mata Uang)
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Tentang Sistem Invoice & Manajemen
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Platform manajemen bisnis terpadu yang dirancang dengan pendekatan
          antarmuka modern dan minimalis. Membantu Anda mengelola siklus
          transaksi, mulai dari pendataan klien, penawaran layanan, hingga
          analisis finansial secara komprehensif.
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
            Fungsionalitas berskala besar yang baru saja ditambahkan ke dalam
            sistem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: LogIn,
              title: "Autentikasi Lokal",
              desc: "Sistem Login & Register dengan Virtual Database terenkripsi secara lokal.",
              color: "text-violet-500",
              bg: "bg-violet-500/10",
              borderColor: "border-violet-500/20",
            },
            {
              icon: Banknote,
              title: "Multi-Mata Uang",
              desc: "Dukungan penuh konversi IDR ke USD secara real-time pada seluruh modul.",
              color: "text-emerald-500",
              bg: "bg-emerald-500/10",
              borderColor: "border-emerald-500/20",
            },
            {
              icon: DownloadCloud,
              title: "Ekspor Laporan",
              desc: "Pembuatan otomatis laporan finansial berformat PDF resmi & Excel (.xlsx).",
              color: "text-rose-500",
              bg: "bg-rose-500/10",
              borderColor: "border-rose-500/20",
            },
            {
              icon: Palette,
              title: "Kustomisasi Sistem",
              desc: "Pengaturan identitas bisnis, info rekening, dan preferensi tema Dark/Light.",
              color: "text-blue-500",
              bg: "bg-blue-500/10",
              borderColor: "border-blue-500/20",
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
            Enam pilar utama yang mendukung keseluruhan operasional bisnis Anda.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
              icon: Users,
              title: "Klien",
              desc: "Database Pelanggan",
              color: "text-violet-500",
              bg: "bg-violet-500/10",
            },
            {
              icon: Package,
              title: "Layanan",
              desc: "Katalog Produk",
              color: "text-amber-500",
              bg: "bg-amber-500/10",
            },
            {
              icon: FileText,
              title: "Laporan",
              desc: "Analitik Data",
              color: "text-rose-500",
              bg: "bg-rose-500/10",
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
              <LayoutDashboard className="w-5 h-5 text-emerald-500" />
              <CardTitle>Fitur Unggulan</CardTitle>
            </div>
            <CardDescription>
              Fungsionalitas inti yang dirancang untuk mempercepat alur kerja.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-sm flex-1">
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-foreground">
                  Sistem Invoice & Combobox Cerdas:
                </strong>{" "}
                Pembuatan tagihan super cepat dengan fitur penarikan data
                relasional. Cari klien dan sisipkan layanan dari katalog
                langsung dalam satu form.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-foreground">
                  Keamanan Sesi Personal:
                </strong>{" "}
                Sistem login terlindungi memastikan bahwa histori pengaturan
                identitas, bank, dan perusahaan Anda aman dalam isolasi lokal.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-foreground">
                  Fleksibilitas Skala Global:
                </strong>{" "}
                Pilihan mata uang (IDR & USD) yang secara otomatis menghitung
                ulang dan menyesuaikan rasio nilai tukar pada kalkulasi
                dashboard Anda.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <BarChart3 className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-foreground">Laporan Siap Cetak:</strong>{" "}
                Tarik rekapitulasi data berdasarkan periode waktu ke dalam
                format Vector PDF dengan kop surat profesional, atau export ke
                Excel untuk olah data lanjutan.
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
                Lucide Icons
              </Badge>
            </div>

            <div className="bg-muted/30 p-4 rounded-xl text-sm text-muted-foreground leading-relaxed mt-auto border border-border/50">
              <strong className="text-foreground flex items-center gap-2 mb-2">
                <Palette className="w-4 h-4" /> Tema Dinamis & UX
              </strong>
              Kini didukung dengan fitur integrasi{" "}
              <strong>Dark Mode / Light Mode</strong> yang terikat dengan
              pengaturan preferensi. Desain difokuskan pada keterbacaan data
              grid, penggunaan <em>whitespace</em>, serta meminimalisir input
              manual demi kenyamanan Anda mengelola angka.
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Roadmap Masa Depan (Update) */}
        <Card className="shadow-sm flex flex-col md:col-span-2 rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Milestone className="w-5 h-5 text-primary" />
              <CardTitle>Peta Jalan Pengembangan (Roadmap)</CardTitle>
            </div>
            <CardDescription>
              Langkah strategis evolusi sistem di masa mendatang.
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
                  Ekspor PDF & Excel, Modul Pengaturan Sistem, & Konversi Mata
                  Uang.
                </p>
              </div>

              <div className="p-4 border rounded-xl bg-card">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-0 shadow-none">
                    Fase 3
                  </Badge>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Selesai
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  Sistem Autentikasi Relasional, Relasi Data (Combobox), &
                  Keamanan LocalStorage.
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
                  Integrasi Backend Database (Supabase/Node.js) & Pengiriman
                  Invoice ke Email otomatis.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Profil Pengembang */}
        <Card className="shadow-sm md:col-span-2 rounded-2xl bg-gradient-to-br from-card to-muted/20 border-muted">
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
                  <div className="text-sm text-muted-foreground mt-1 flex items-center justify-center sm:justify-start gap-4">
                    <span>razan@fauzansyabani.dev</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                  Proyek aplikasi sistem manajemen ini merupakan bentuk dedikasi
                  dan eksplorasi mendalam terhadap ekosistem pengembangan web
                  modern. Berfokus pada arsitektur komponen yang dapat digunakan
                  ulang (<em>reusable</em>), manajemen *state* yang efisien, dan
                  memberikan pengalaman pengguna (UX) setara aplikasi skala
                  *enterprise*.
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
          className="gap-2 rounded-xl px-8 w-full sm:w-auto shadow-md"
        >
          Kelola Transaksi
          <ArrowRightLeft className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
