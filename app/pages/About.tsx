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
  HelpCircle,
  Milestone,
  Lock,
  Download,
  ArrowRightLeft,
} from "lucide-react";

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl py-8 mx-auto font-sans flex flex-col gap-12">
      {/* ==========================================
          HEADER SECTION
      ========================================== */}
      <div className="flex flex-col items-center text-center space-y-4">
        <Badge
          variant="secondary"
          className="px-3 py-1 text-xs font-medium dark:bg-muted"
        >
          Versi 1.2.0 (Ekspansi Dasbor)
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Tentang Sistem Invoice
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Platform manajemen transaksi yang dirancang dengan pendekatan modern
          minimalis. Fokus pada kemudahan pencatatan, pelacakan status
          pembayaran, dan analisis tagihan finansial secara *real-time*.
        </p>
      </div>

      {/* ==========================================
          SECTION: METRIK & STANDAR SISTEM
      ========================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-4 border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">Integritas Data</div>
            <div className="text-xs text-muted-foreground">
              Pencatatan akurat & terstruktur
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">Performa Tinggi</div>
            <div className="text-xs text-muted-foreground">
              Responsif & minim latensi
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
          <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">Privasi Lokal</div>
            <div className="text-xs text-muted-foreground">
              Kendali penuh di sisi klien
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          CONTENT SECTION (GRID CARDS)
      ========================================== */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Card 1: Fitur Utama */}
        <Card className="shadow-sm flex flex-col rounded-xl">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <LayoutDashboard className="w-5 h-5 text-primary" />
              <CardTitle>Fitur Utama Terkini</CardTitle>
            </div>
            <CardDescription>
              Fungsionalitas inti yang terus diperbarui untuk kebutuhan Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm flex-1">
            <div className="flex items-start gap-3">
              <BarChart3 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p>
                <strong>Dashboard Analitik:</strong> Ringkasan finansial
                interaktif yang dilengkapi dengan grafik metrik pendapatan
                berjalan secara visual.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <ArrowRightLeft className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p>
                <strong>Manajemen Transaksi Terpusat:</strong> Pembuatan invoice
                baru dan pelacakan riwayat transaksi kini disatukan dalam satu
                alur navigasi yang mulus.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p>
                <strong>Indikator Status Dinamis:</strong> Pelacakan pembayaran
                (Lunas, Pending, Belum Bayar) yang mudah dipindai menggunakan
                sistem lencana warna.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p>
                <strong>Ekspor & Pelaporan:</strong> <em>(Baru)</em> Akses cepat
                untuk mengunduh rekapitulasi data langsung dari halaman
                Overview.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Teknologi & Desain */}
        <Card className="shadow-sm flex flex-col rounded-xl">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Code className="w-5 h-5 text-primary" />
              <CardTitle>Teknologi & Ekosistem</CardTitle>
            </div>
            <CardDescription>
              Dibangun di atas tumpukan teknologi modern yang stabil dan
              terukur.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 flex-1">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default" className="shadow-none">
                React Router v7
              </Badge>
              <Badge variant="secondary">TypeScript</Badge>
              <Badge variant="secondary">Tailwind CSS</Badge>
              <Badge variant="outline">Shadcn UI</Badge>
              <Badge variant="outline">Recharts</Badge>
              <Badge variant="outline">Lucide Icons</Badge>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground leading-relaxed mt-auto border border-muted">
              <strong>Prinsip Desain:</strong> <br />
              Antarmuka ini difokuskan pada keterbacaan data, mempertahankan
              visual yang bersih (<em>clean look</em>), serta menjaga ruang
              kosong (<em>whitespace</em>) agar pengguna dapat memproses angka
              finansial tanpa distraksi visual.
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Roadmap Masa Depan */}
        <Card className="shadow-sm flex flex-col md:col-span-2 rounded-xl">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Milestone className="w-5 h-5 text-primary" />
              <CardTitle>Rencana Pengembangan Sistem</CardTitle>
            </div>
            <CardDescription>
              Langkah strategis penambahan fitur untuk skalabilitas platform di
              masa mendatang.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="p-4 border rounded-xl bg-muted/20">
                <div className="flex items-center justify-between mb-3">
                  <Badge
                    variant="outline"
                    className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-400"
                  >
                    Fase 1
                  </Badge>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
                    Selesai
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Struktur antarmuka dasar, integrasi grafik dasbor analitik,
                  navigasi manajemen transaksi, dan sistem filter data klien.
                </p>
              </div>

              <div className="p-4 border rounded-xl bg-muted/20 border-primary/20 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                <div className="flex items-center justify-between mb-3 pl-2">
                  <Badge
                    variant="outline"
                    className="text-primary border-primary/30 bg-primary/5"
                  >
                    Fase 2
                  </Badge>
                  <span className="font-semibold text-primary text-xs flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    Berjalan
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pl-2">
                  Menghidupkan fungsionalitas tombol "Unduh Laporan" untuk
                  ekspor PDF/CSV, serta validasi form pembuatan invoice.
                </p>
              </div>

              <div className="p-4 border border-dashed rounded-xl bg-transparent opacity-70">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="text-muted-foreground">
                    Fase 3
                  </Badge>
                  <span className="font-semibold text-muted-foreground text-xs">
                    Direncanakan
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Integrasi <em>Backend Database</em> (seperti
                  Supabase/Firebase) untuk sinkronisasi awan, multi-perangkat,
                  dan sistem otentikasi.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: FAQ */}
        <Card className="shadow-sm flex flex-col md:col-span-2 rounded-xl">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              <CardTitle>Pertanyaan Umum</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <div className="border-b pb-4 last:border-0 last:pb-0">
              <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                <span className="text-primary">Q:</span> Di mana data transaksi
                disimpan saat ini?
              </h4>
              <p className="text-muted-foreground pl-6 text-xs sm:text-sm leading-relaxed">
                Untuk menjaga kecepatan akses dan efisiensi pengujian antarmuka,
                seluruh data transaksi dikelola secara lokal{" "}
                <em>(client-side state)</em>. Integrasi database penuh
                direncanakan pada pembaruan mendatang.
              </p>
            </div>
            <div className="border-b pb-4 last:border-0 last:pb-0">
              <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                <span className="text-primary">Q:</span> Bagaimana cara
                mengunduh laporan bulanan?
              </h4>
              <p className="text-muted-foreground pl-6 text-xs sm:text-sm leading-relaxed">
                Anda dapat menuju halaman <strong>Dashboard</strong> utama dan
                mengklik tombol <em>"Unduh Laporan"</em> di sudut kanan atas.
                Fitur pemrosesan datanya (PDF/Excel) sedang dalam tahap
                penyempurnaan (Fase 2).
              </p>
            </div>
            <div className="border-b pb-4 last:border-0 last:pb-0">
              <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                <span className="text-primary">Q:</span> Apakah aplikasi ini
                mendukung mode gelap?
              </h4>
              <p className="text-muted-foreground pl-6 text-xs sm:text-sm leading-relaxed">
                Tentu. Sistem telah terintegrasi dengan <em>ThemeProvider</em>{" "}
                yang otomatis beradaptasi dengan preferensi tema sistem
                perangkat Anda (Terang / Gelap).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 5: Profil Pengembang */}
        <Card className="shadow-sm md:col-span-2 rounded-xl border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 text-primary rounded-full flex items-center justify-center text-3xl font-bold shrink-0 ring-4 ring-background shadow-sm">
                R
              </div>
              <div className="text-center sm:text-left space-y-2 flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground tracking-wider uppercase">
                    Pengembang Utama
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  Razan Muhammad Fauzan Sya'bani
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                  Proyek ini merupakan bentuk dedikasi dan eksplorasi mendalam
                  terhadap ekosistem React modern. Berfokus pada pengelolaan
                  alur data yang efisien, optimasi antarmuka yang responsif,
                  serta penerapan standar UI/UX terbaik menggunakan arsitektur
                  komponen Shadcn.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ==========================================
          FOOTER / CALL TO ACTION
      ========================================== */}
      <div className="flex flex-col sm:flex-row items-center justify-center mt-4 border-t pt-8 gap-4 pb-8">
        <Button
          onClick={() => navigate("/")}
          variant="outline"
          size="lg"
          className="gap-2 rounded-md px-6 w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Button>
        <Button
          onClick={() => navigate("/transaction")}
          size="lg"
          className="gap-2 rounded-md px-6 w-full sm:w-auto"
        >
          Kelola Transaksi
          <ArrowRightLeft className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
