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

// Import ikon tambahan dari lucide-react
import {
  CheckCircle2,
  Code,
  LayoutDashboard,
  ArrowLeft,
  BarChart3,
  User,
} from "lucide-react";

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-8 font-sans flex flex-col gap-10">
      {/* ==========================================
          HEADER SECTION
      ========================================== */}
      <div className="flex flex-col items-center text-center space-y-4 mt-8">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Tentang Sistem Invoice
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Platform manajemen transaksi yang dirancang dengan pendekatan modern
          minimalis untuk mempermudah pencatatan, pelacakan, dan analisis
          tagihan.
        </p>
      </div>

      {/* ==========================================
          CONTENT SECTION (GRID CARDS)
      ========================================== */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Card 1: Fitur Utama (Diperbarui) */}
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
              <BarChart3 className="w-5 h-5 text-emerald-500 shrink-0" />
              <p>
                <strong>Dashboard Analitik:</strong> Ringkasan finansial
                interaktif yang dilengkapi dengan grafik visual dari Shadcn
                Chart.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <p>
                <strong>Manajemen Data:</strong> Pencatatan, pengeditan, dan
                penghapusan invoice dengan sistem konfirmasi yang aman.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <p>
                <strong>Indikator Visual:</strong> Pelacakan status pembayaran
                yang mudah dipindai menggunakan lencana warna otomatis.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <p>
                <strong>Navigasi Cerdas:</strong> Sistem <em>pagination</em>{" "}
                untuk menangani data berjumlah besar dengan mulus.
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

        {/* Card 3: Profil Pengembang */}
        <Card className="shadow-sm md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-primary" />
              <CardTitle>Dikembangkan Oleh</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xl font-bold shrink-0">
                R
              </div>
              <div className="text-center sm:text-left space-y-1">
                <h3 className="text-lg font-semibold">
                  Razan Muhammad Fauzan Sya'bani
                </h3>
                <p className="text-sm text-muted-foreground">
                  Proyek ini merupakan bentuk eksplorasi mendalam terhadap
                  ekosistem React modern, pengelolaan *state*, dan perancangan
                  antarmuka visual menggunakan standar Shadcn UI.
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
          className="gap-2 rounded-full px-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard Utama
        </Button>
      </div>
    </div>
  );
}
