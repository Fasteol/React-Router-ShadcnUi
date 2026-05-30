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
  RefreshCw,
} from "lucide-react";

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl pb-12 mx-auto font-sans flex flex-col gap-12">
      {/* ==========================================
          HEADER SECTION
      ========================================== */}
      <div className="flex flex-col items-center text-center space-y-4 mt-8">
        {/*<Badge variant="secondary" className="px-3 py-1 text-xs font-medium">
          Versi 1.2.0 (Stabil)
        </Badge>*/}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Tentang Sistem Invoice
        </h1>
        <p className="text-base sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Platform manajemen transaksi yang dirancang dengan pendekatan modern
          minimalis untuk mempermudah pencatatan, pelacakan, dan analisis
          tagihan finansial secara berkala.
        </p>
      </div>

      {/* ==========================================
          SECTION: METRIK & STANDAR SISTEM (BARU)
      ========================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-4 border rounded-xl bg-card shadow-sm">
          <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">Keamanan Data</div>
            <div className="text-xs text-muted-foreground">
              Arsitektur Terenkripsi
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 border rounded-xl bg-card shadow-sm">
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">Performa Tinggi</div>
            <div className="text-xs text-muted-foreground">
              Responsif & Ringan
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 border rounded-xl bg-card shadow-sm">
          <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">Privasi Penuh</div>
            <div className="text-xs text-muted-foreground">
              Kendali Akses Lokal
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          CONTENT SECTION (GRID CARDS)
      ========================================== */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Card 1: Fitur Utama */}
        <Card className="shadow-sm flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <LayoutDashboard className="w-5 h-5 text-primary" />
              <CardTitle>Fitur Utama</CardTitle>
            </div>
            <CardDescription>
              Fungsionalitas inti yang ditawarkan oleh aplikasi ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm flex-1">
            <div className="flex items-start gap-3">
              <BarChart3 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p>
                <strong>Dashboard Analitik:</strong> Ringkasan finansial
                interaktif yang dilengkapi dengan grafik visual dari Shadcn
                Chart secara real-time.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p>
                <strong>Manajemen Data:</strong> Pencatatan, pengeditan, dan
                penghapusan invoice dengan sistem konfirmasi terstruktur yang
                aman.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p>
                <strong>Indikator Visual:</strong> Pelacakan status pembayaran
                yang mudah dipindai menggunakan lencana warna dinamis otomatis.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p>
                <strong>Navigasi Cerdas:</strong> Sistem navigasi terpadu untuk
                menangani perpindahan halaman data berjumlah besar dengan mulus.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Teknologi & Desain */}
        <Card className="shadow-sm flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Code className="w-5 h-5 text-primary" />
              <CardTitle>Teknologi & Ekosistem</CardTitle>
            </div>
            <CardDescription>
              Dibangun di atas tumpukan teknologi modern dan terukur.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 flex-1">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">React Router v7</Badge>
              <Badge variant="secondary">TypeScript</Badge>
              <Badge variant="secondary">Tailwind CSS</Badge>
              <Badge variant="outline">Shadcn UI</Badge>
              <Badge variant="outline">Recharts</Badge>
              <Badge variant="outline">Lucide Icons</Badge>
            </div>

            <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground leading-relaxed mt-auto">
              <strong>Prinsip Desain:</strong> <br />
              Antarmuka ini difokuskan pada keterbacaan data, mempertahankan
              visual yang bersih (<em>clean look</em>), serta menjaga ruang
              kosong (<em>whitespace</em>) agar terhindar dari kesan berlebihan
              dan tetap terlihat profesional.
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Roadmap Masa Depan (BARU) */}
        <Card className="shadow-sm flex flex-col md:col-span-2">
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
              <div className="p-3 border border-dashed rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="outline"
                    className="text-emerald-500 border-emerald-500/30 bg-emerald-500/5"
                  >
                    Fase 1
                  </Badge>
                  <span className="font-semibold">Selesai</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Integrasi struktur data dasar, layout global responsif, dan
                  dasbor analitik utama.
                </p>
              </div>

              <div className="p-3 border border-dashed rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="outline"
                    className="text-amber-500 border-amber-500/30 bg-amber-500/5"
                  >
                    Fase 2
                  </Badge>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    Sedang Berjalan
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Optimalisasi komponen sidebar navigasi mobile dan
                  penyempurnaan UI modular.
                </p>
              </div>

              <div className="p-3 border border-dashed rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-muted-foreground">
                    Fase 3
                  </Badge>
                  <span className="font-semibold text-muted-foreground">
                    Direncanakan
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Sistem ekspor laporan berkala ke format PDF/CSV serta fitur
                  multi-mata uang otomatis.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: FAQ (BARU) */}
        <Card className="shadow-sm flex flex-col md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              <CardTitle>Pertanyaan Umum</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="border-b pb-3 last:border-0 last:pb-0">
              <h4 className="font-semibold text-foreground flex items-center gap-2 mb-1">
                <span>•</span> Di mana data transaksi disimpan?
              </h4>
              <p className="text-muted-foreground pl-3 text-xs sm:text-sm">
                Untuk saat ini, seluruh data transaksi dikelola di sisi klien
                (*client-side state*) untuk menjaga kecepatan akses operasional
                serta fleksibilitas pengujian tanpa latensi basis data
                eksternal.
              </p>
            </div>
            <div className="border-b pb-3 last:border-0 last:pb-0">
              <h4 className="font-semibold text-foreground flex items-center gap-2 mb-1">
                <span>•</span> Apakah aplikasi ini mendukung mode gelap?
              </h4>
              <p className="text-muted-foreground pl-3 text-xs sm:text-sm">
                Ya, sistem telah terintegrasi penuh dengan `ThemeProvider`
                bawaan yang mendukung adaptasi otomatis terhadap konfigurasi
                tema sistem perangkat pengguna.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 5: Profil Pengembang */}
        <Card className="shadow-sm md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-primary" />
              <CardTitle>Dikembangkan Oleh</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xl font-bold shrink-0 shadow-inner">
                R
              </div>
              <div className="text-center sm:text-left space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Razan Muhammad Fauzan Sya'bani
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Proyek ini merupakan bentuk eksplorasi mendalam terhadap
                  ekosistem React modern, pengelolaan *state*, optimasi tata
                  letak responsif, dan perancangan antarmuka visual menggunakan
                  standar Shadcn UI komponen.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ==========================================
          FOOTER / CALL TO ACTION
      ========================================== */}
      <div className="flex flex-col items-center mt-4 border-t pt-8 space-y-4">
        <Button
          onClick={() => navigate("/")}
          size="lg"
          className="gap-2 rounded-md px-8 cursor-pointer w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard Utama
        </Button>
      </div>
    </div>
  );
}
