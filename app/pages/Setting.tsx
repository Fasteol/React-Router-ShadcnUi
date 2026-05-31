import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
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
import { Switch } from "~/components/ui/switch";
import { toast } from "sonner";
import { defaultAdminSettings } from "~/data/invoices"; // Import data admin

export default function SettingsPage() {
  // ==========================================
  // STATE PENGATURAN (DIAMBIL DARI INVOICES.TS)
  // ==========================================
  const [profil, setProfil] = useState(defaultAdminSettings.profil);
  const [perusahaan, setPerusahaan] = useState(defaultAdminSettings.perusahaan);
  const [rekening, setRekening] = useState(defaultAdminSettings.rekening);
  const [preferensi, setPreferensi] = useState(defaultAdminSettings.preferensi);

  // ==========================================
  // HANDLER SIMPAN
  // ==========================================
  const handleSimpan = (kategori: string) => {
    // Di aplikasi nyata, Anda mungkin akan melakukan request API (PATCH/PUT) di sini
    toast.success(`Pengaturan ${kategori} berhasil diperbarui.`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-16">
      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan Sistem</h1>
        <p className="text-muted-foreground">
          Kelola profil personal, detail bisnis, dan preferensi antarmuka.
        </p>
      </div>

      <div className="space-y-8">
        {/* ==========================================
            SECTION 1: PROFIL PENGGUNA
        ========================================== */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Profil Pengguna
          </h2>

          <Card className="rounded-lg shadow-sm border-border">
            <CardHeader>
              <CardTitle className="text-base">Informasi Personal</CardTitle>
              <CardDescription>
                Identitas utama Anda sebagai pengelola sistem.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-w-xl">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input
                  id="nama"
                  value={profil.nama}
                  onChange={(e) =>
                    setProfil({ ...profil, nama: e.target.value })
                  }
                  className="rounded-md"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profil.email}
                    onChange={(e) =>
                      setProfil({ ...profil, email: e.target.value })
                    }
                    className="rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telepon">No. Telepon</Label>
                  <Input
                    id="telepon"
                    value={profil.telepon}
                    onChange={(e) =>
                      setProfil({ ...profil, telepon: e.target.value })
                    }
                    className="rounded-md"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/40 px-6 py-4 flex items-center justify-between rounded-b-lg">
              <p className="text-sm text-muted-foreground hidden sm:block">
                Gunakan alamat email aktif untuk menerima notifikasi.
              </p>
              <Button
                onClick={() => handleSimpan("Profil Personal")}
                size="sm"
                className="rounded-md w-full sm:w-auto cursor-pointer"
              >
                Simpan Profil
              </Button>
            </CardFooter>
          </Card>
        </section>

        {/* ==========================================
            SECTION 2: INFORMASI BISNIS
        ========================================== */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Informasi Bisnis
          </h2>

          <Card className="rounded-lg shadow-sm border-border">
            <CardHeader>
              <CardTitle className="text-base">Detail Entitas</CardTitle>
              <CardDescription>
                Nama dan alamat yang akan tercetak otomatis pada setiap invoice.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-2xl">
              <div className="space-y-2">
                <Label htmlFor="namaPerusahaan">Nama Perusahaan / Bisnis</Label>
                <Input
                  id="namaPerusahaan"
                  value={perusahaan.nama}
                  onChange={(e) =>
                    setPerusahaan({ ...perusahaan, nama: e.target.value })
                  }
                  className="rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alamat">Alamat Lengkap</Label>
                <Textarea
                  id="alamat"
                  rows={3}
                  value={perusahaan.alamat}
                  onChange={(e) =>
                    setPerusahaan({ ...perusahaan, alamat: e.target.value })
                  }
                  className="rounded-md resize-none"
                />
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/40 px-6 py-4 flex items-center justify-between rounded-b-lg">
              <p className="text-sm text-muted-foreground hidden sm:block">
                Maksimal 150 karakter untuk alamat.
              </p>
              <Button
                onClick={() => handleSimpan("Detail Bisnis")}
                size="sm"
                className="rounded-md w-full sm:w-auto cursor-pointer"
              >
                Simpan Bisnis
              </Button>
            </CardFooter>
          </Card>

          <Card className="rounded-lg shadow-sm border-border">
            <CardHeader>
              <CardTitle className="text-base">Rekening Penagihan</CardTitle>
              <CardDescription>
                Tujuan transfer pembayaran yang ditujukan untuk klien Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="namaBank">Nama Bank</Label>
                  <Input
                    id="namaBank"
                    value={rekening.namaBank}
                    onChange={(e) =>
                      setRekening({ ...rekening, namaBank: e.target.value })
                    }
                    className="rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nomorRekening">Nomor Rekening</Label>
                  <Input
                    id="nomorRekening"
                    value={rekening.nomor}
                    onChange={(e) =>
                      setRekening({ ...rekening, nomor: e.target.value })
                    }
                    className="rounded-md"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pemilikRekening">Nama Pemilik Rekening</Label>
                <Input
                  id="pemilikRekening"
                  value={rekening.pemilik}
                  onChange={(e) =>
                    setRekening({ ...rekening, pemilik: e.target.value })
                  }
                  className="rounded-md"
                />
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/40 px-6 py-4 flex items-center justify-between rounded-b-lg">
              <p className="text-sm text-muted-foreground hidden sm:block">
                Pastikan nomor rekening valid sebelum menerbitkan invoice.
              </p>
              <Button
                onClick={() => handleSimpan("Rekening Bank")}
                size="sm"
                className="rounded-md w-full sm:w-auto cursor-pointer"
              >
                Simpan Rekening
              </Button>
            </CardFooter>
          </Card>
        </section>

        {/* ==========================================
            SECTION 3: PREFERENSI SISTEM
        ========================================== */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Preferensi Sistem
          </h2>

          <Card className="rounded-lg shadow-sm border-border">
            <CardHeader>
              <CardTitle className="text-base">Antarmuka & Regional</CardTitle>
              <CardDescription>
                Sesuaikan tampilan sistem dan standar mata uang Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 max-w-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label>Tema Aplikasi</Label>
                  <p className="text-sm text-muted-foreground">
                    Pilih skema warna yang paling nyaman.
                  </p>
                </div>
                <Select
                  value={preferensi.tema}
                  onValueChange={(val) =>
                    setPreferensi({ ...preferensi, tema: val })
                  }
                >
                  <SelectTrigger className="w-full sm:w-[200px] rounded-md">
                    <SelectValue placeholder="Pilih Tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Terang</SelectItem>
                    <SelectItem value="dark">Gelap</SelectItem>
                    <SelectItem value="system">Ikuti Sistem</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="shrink-0 bg-border h-[1px] w-full" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label>Mata Uang Basis</Label>
                  <p className="text-sm text-muted-foreground">
                    Format penulisan default untuk kalkulasi.
                  </p>
                </div>
                <Select
                  value={preferensi.mataUang}
                  onValueChange={(val) =>
                    setPreferensi({ ...preferensi, mataUang: val })
                  }
                >
                  <SelectTrigger className="w-full sm:w-[200px] rounded-md">
                    <SelectValue placeholder="Pilih Mata Uang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IDR">IDR - Rupiah</SelectItem>
                    <SelectItem value="USD">USD - Dolar AS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/40 px-6 py-4 flex items-center justify-end rounded-b-lg">
              <Button
                onClick={() => handleSimpan("Antarmuka")}
                size="sm"
                className="rounded-md w-full sm:w-auto cursor-pointer"
              >
                Simpan Konfigurasi
              </Button>
            </CardFooter>
          </Card>

          <Card className="rounded-lg shadow-sm border-border">
            <CardHeader>
              <CardTitle className="text-base">Notifikasi Lanjutan</CardTitle>
              <CardDescription>
                Atur bagaimana Anda menerima peringatan dari sistem.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Peringatan Status Lunas</Label>
                  <p className="text-sm text-muted-foreground">
                    Terima pemberitahuan email otomatis ketika status invoice
                    diperbarui menjadi lunas.
                  </p>
                </div>
                <Switch
                  checked={preferensi.notifikasiEmail}
                  onCheckedChange={(checked) => {
                    setPreferensi({ ...preferensi, notifikasiEmail: checked });
                    handleSimpan(
                      checked
                        ? "Notifikasi Diaktifkan"
                        : "Notifikasi Dimatikan",
                    );
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
