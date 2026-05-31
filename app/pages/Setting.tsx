import { useState, useEffect } from "react";
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
import { type User } from "~/data/invoices"; // Hanya import type User, hilangkan data dummy

// IMPORT USETHEME UNTUK MENGUBAH TEMA SECARA LANGSUNG
import { useTheme } from "~/components/theme-provider";

import {
  UserCircle,
  Building,
  Landmark,
  Palette,
  Save,
  Camera,
  Bell,
  Monitor,
  Moon,
  Sun,
  Mail,
  Phone,
  MapPin,
  CreditCard,
} from "lucide-react";

// Kerangka data kosong sebagai fallback jika user belum pernah menyimpan pengaturan
const emptySettings = {
  profil: { nama: "", email: "", telepon: "", avatar: "" },
  perusahaan: { nama: "", alamat: "" },
  rekening: { namaBank: "", nomor: "", pemilik: "" },
  preferensi: { tema: "system", mataUang: "IDR", notifikasiEmail: true },
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const [profil, setProfil] = useState(emptySettings.profil);
  const [perusahaan, setPerusahaan] = useState(emptySettings.perusahaan);
  const [rekening, setRekening] = useState(emptySettings.rekening);
  const [preferensi, setPreferensi] = useState(emptySettings.preferensi);

  const [activeTab, setActiveTab] = useState("profil");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Ambil pengaturan dari storage, atau gunakan template kosong jika belum ada
    const savedSettings = localStorage.getItem("adminSettings");
    const currentSettings = savedSettings
      ? JSON.parse(savedSettings)
      : JSON.parse(JSON.stringify(emptySettings)); // Deep copy agar tidak mereferensikan object asli

    // 2. Ambil data user yang sedang aktif (login)
    const activeUserStr = localStorage.getItem("currentUser");

    if (activeUserStr) {
      const activeUser = JSON.parse(activeUserStr);
      // Timpa data profil dengan data aktual dari akun (jika tersedia)
      currentSettings.profil.nama =
        activeUser.name || currentSettings.profil.nama;
      currentSettings.profil.email =
        activeUser.email || currentSettings.profil.email;
      currentSettings.profil.telepon =
        activeUser.phone || currentSettings.profil.telepon;
    }

    // 3. Sesuaikan preferensi tema dengan sistem/UI
    currentSettings.preferensi.tema = theme || currentSettings.preferensi.tema;

    // 4. Set ke state React
    setProfil(currentSettings.profil);
    setPerusahaan(currentSettings.perusahaan);
    setRekening(currentSettings.rekening);
    setPreferensi(currentSettings.preferensi);
    setIsLoaded(true);
  }, [theme]);

  const handleSimpan = (kategori: string, overrideData?: any) => {
    const updatedSettings = {
      profil,
      perusahaan,
      rekening,
      preferensi: overrideData?.preferensi || preferensi,
    };

    // Simpan seluruh konfigurasi pengaturan
    localStorage.setItem("adminSettings", JSON.stringify(updatedSettings));

    // Khusus untuk profil personal, kita juga harus update data user di sistem (Sesi & Database)
    if (kategori === "Profil Personal") {
      const savedUserStr = localStorage.getItem("currentUser");
      if (savedUserStr) {
        const parsedUser = JSON.parse(savedUserStr);

        // Update sesi saat ini
        parsedUser.name = profil.nama;
        parsedUser.email = profil.email;
        parsedUser.phone = profil.telepon;

        localStorage.setItem("currentUser", JSON.stringify(parsedUser));

        // Update juga ke Database Virtual (users_db) agar sinkron
        const usersDB: User[] = JSON.parse(
          localStorage.getItem("users_db") || "[]",
        );
        const updatedUsersDB = usersDB.map((user) => {
          if (user.id === parsedUser.id) {
            return {
              ...user,
              name: profil.nama,
              email: profil.email,
              phone: profil.telepon,
            };
          }
          return user;
        });
        localStorage.setItem("users_db", JSON.stringify(updatedUsersDB));

        // Trigger event agar komponen lain (seperti Header) dapat me-render ulang profil
        window.dispatchEvent(new Event("user-updated"));
      }
    }

    toast.success(`Pengaturan ${kategori} berhasil diperbarui.`, {
      description: "Perubahan telah disimpan ke dalam sistem.",
    });
  };

  const menuItems = [
    { id: "profil", label: "Profil Personal", icon: UserCircle },
    { id: "bisnis", label: "Informasi Bisnis", icon: Building },
    { id: "rekening", label: "Rekening & Bank", icon: Landmark },
    { id: "preferensi", label: "Sistem & Tampilan", icon: Palette },
  ];

  if (!isLoaded) return null;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 xl:px-0 space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2 pb-6 border-b border-border/50">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Pengaturan Sistem
        </h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Kelola identitas personal Anda, detail informasi bisnis untuk
          keperluan invoice, hingga preferensi tampilan antarmuka.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        <aside className="w-full md:w-56 lg:w-64 shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto pb-4 md:pb-0 scrollbar-none">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === item.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon
                  className={`w-4 h-4 ${
                    activeTab === item.id
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 max-w-3xl min-h-[500px]">
          {/* --- TAB: PROFIL --- */}
          {activeTab === "profil" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <Card className="rounded-xl shadow-sm border-border overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <UserCircle className="w-5 h-5 text-primary" />
                    Informasi Personal
                  </CardTitle>
                  <CardDescription>
                    Identitas utama Anda sebagai pengelola sistem.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-tr from-primary/20 to-primary/5 text-primary rounded-full flex items-center justify-center text-2xl font-bold border-2 border-background ring-2 ring-primary/20 shadow-sm">
                        {profil.nama
                          ? profil.nama.charAt(0).toUpperCase()
                          : "U"}
                      </div>
                      <button className="absolute bottom-0 right-0 p-1.5 bg-background border rounded-full text-muted-foreground hover:text-foreground shadow-sm transition-colors cursor-pointer">
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium text-sm">Foto Profil</h3>
                      <p className="text-xs text-muted-foreground">
                        Disarankan menggunakan format JPG atau PNG berukuran
                        1:1.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="nama"
                        className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        Nama Lengkap
                      </Label>
                      <Input
                        id="nama"
                        value={profil.nama}
                        onChange={(e) =>
                          setProfil({ ...profil, nama: e.target.value })
                        }
                        className="rounded-lg bg-muted/20"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
                        >
                          <Mail className="w-3.5 h-3.5" /> Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={profil.email}
                          onChange={(e) =>
                            setProfil({ ...profil, email: e.target.value })
                          }
                          className="rounded-lg bg-muted/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="telepon"
                          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5" /> No. Telepon
                        </Label>
                        <Input
                          id="telepon"
                          placeholder="Belum ditambahkan"
                          value={profil.telepon}
                          onChange={(e) =>
                            setProfil({ ...profil, telepon: e.target.value })
                          }
                          className="rounded-lg bg-muted/20"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/20 px-6 py-4 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Pastikan email aktif untuk keperluan pemulihan akun.
                  </p>
                  <Button
                    onClick={() => handleSimpan("Profil Personal")}
                    size="sm"
                    className="gap-2 rounded-lg ml-auto"
                  >
                    <Save className="w-4 h-4" /> Simpan Profil
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* --- TAB: BISNIS --- */}
          {activeTab === "bisnis" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <Card className="rounded-xl shadow-sm border-border overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Building className="w-5 h-5 text-amber-500" />
                    Detail Perusahaan
                  </CardTitle>
                  <CardDescription>
                    Informasi ini akan tercetak otomatis sebagai header pada
                    setiap invoice Anda.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="namaPerusahaan"
                      className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      Nama Bisnis / Brand
                    </Label>
                    <Input
                      id="namaPerusahaan"
                      placeholder="Cth: PT Inovasi Maju"
                      value={perusahaan.nama}
                      onChange={(e) =>
                        setPerusahaan({ ...perusahaan, nama: e.target.value })
                      }
                      className="rounded-lg bg-muted/20 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="alamat"
                      className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5" /> Alamat Lengkap
                    </Label>
                    <Textarea
                      id="alamat"
                      placeholder="Masukkan alamat bisnis Anda..."
                      rows={4}
                      value={perusahaan.alamat}
                      onChange={(e) =>
                        setPerusahaan({ ...perusahaan, alamat: e.target.value })
                      }
                      className="rounded-lg resize-none bg-muted/20"
                    />
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/20 px-6 py-4 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Perubahan nama bisnis akan memengaruhi invoice yang baru
                    dibuat.
                  </p>
                  <Button
                    onClick={() => handleSimpan("Detail Bisnis")}
                    size="sm"
                    className="gap-2 rounded-lg ml-auto"
                  >
                    <Save className="w-4 h-4" /> Simpan Entitas
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* --- TAB: REKENING --- */}
          {activeTab === "rekening" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <Card className="rounded-xl shadow-sm border-border overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-emerald-500" />
                    Rekening Penagihan
                  </CardTitle>
                  <CardDescription>
                    Tujuan transfer pembayaran yang ditujukan untuk klien Anda.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mb-2">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                          {rekening.namaBank || "NAMA BANK"}
                        </p>
                        <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 font-mono mt-0.5">
                          {rekening.nomor || "XXXX-XXXX-XXXX"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label
                        htmlFor="namaBank"
                        className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        Nama Bank / e-Wallet
                      </Label>
                      <Input
                        id="namaBank"
                        placeholder="Cth: BCA / GoPay"
                        value={rekening.namaBank}
                        onChange={(e) =>
                          setRekening({ ...rekening, namaBank: e.target.value })
                        }
                        className="rounded-lg bg-muted/20 uppercase"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="nomorRekening"
                        className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        Nomor Rekening
                      </Label>
                      <Input
                        id="nomorRekening"
                        placeholder="Masukkan nomor"
                        value={rekening.nomor}
                        onChange={(e) =>
                          setRekening({ ...rekening, nomor: e.target.value })
                        }
                        className="rounded-lg bg-muted/20 font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="pemilikRekening"
                      className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      Nama Pemilik Rekening
                    </Label>
                    <Input
                      id="pemilikRekening"
                      placeholder="Atas nama..."
                      value={rekening.pemilik}
                      onChange={(e) =>
                        setRekening({ ...rekening, pemilik: e.target.value })
                      }
                      className="rounded-lg bg-muted/20"
                    />
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/20 px-6 py-4 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Pastikan nama pemilik sesuai dengan buku tabungan.
                  </p>
                  <Button
                    onClick={() => handleSimpan("Rekening Bank")}
                    size="sm"
                    className="gap-2 rounded-lg ml-auto"
                  >
                    <Save className="w-4 h-4" /> Simpan Rekening
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* --- TAB: PREFERENSI --- */}
          {activeTab === "preferensi" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <Card className="rounded-xl shadow-sm border-border overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Palette className="w-5 h-5 text-indigo-500" />
                    Antarmuka & Regional
                  </CardTitle>
                  <CardDescription>
                    Sesuaikan lingkungan kerja aplikasi sesuai gaya Anda.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* Tema */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Label className="text-base">Tema Aplikasi</Label>
                      <p className="text-sm text-muted-foreground">
                        Pilih skema warna yang paling nyaman di mata.
                      </p>
                    </div>
                    <Select
                      value={preferensi.tema}
                      onValueChange={(val) => {
                        const newPreferensi = { ...preferensi, tema: val };
                        setPreferensi(newPreferensi);
                        setTheme(val as "light" | "dark" | "system");
                        handleSimpan("Tema Antarmuka", {
                          preferensi: newPreferensi,
                        });
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-[220px] rounded-lg">
                        <SelectValue placeholder="Pilih Tema" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="w-4 h-4" /> Terang
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="w-4 h-4" /> Gelap
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center gap-2">
                            <Monitor className="w-4 h-4" /> Ikuti Sistem
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="shrink-0 bg-border/50 h-[1px] w-full" />

                  {/* Mata Uang */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Label className="text-base">Mata Uang Basis</Label>
                      <p className="text-sm text-muted-foreground">
                        Format penulisan angka default (Rp / $).
                      </p>
                    </div>
                    <Select
                      value={preferensi.mataUang}
                      onValueChange={(val) => {
                        const newPreferensi = { ...preferensi, mataUang: val };
                        setPreferensi(newPreferensi);
                        handleSimpan("Mata Uang", {
                          preferensi: newPreferensi,
                        });
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-[220px] rounded-lg font-mono">
                        <SelectValue placeholder="Pilih Mata Uang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IDR">IDR - Rupiah</SelectItem>
                        <SelectItem value="USD">USD - Dolar AS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Card Notifikasi */}
              <Card className="rounded-xl shadow-sm border-border overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Bell className="w-5 h-5 text-rose-500" />
                    Notifikasi Sistem
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-row items-center justify-between rounded-xl border border-border/50 p-4 bg-muted/10 hover:bg-muted/20 transition-colors">
                    <div className="space-y-0.5 pr-4">
                      <Label
                        className="text-base cursor-pointer"
                        htmlFor="email-notif"
                      >
                        Peringatan Status Lunas
                      </Label>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Terima pemberitahuan email otomatis ketika status
                        invoice diperbarui menjadi lunas oleh klien.
                      </p>
                    </div>
                    <Switch
                      id="email-notif"
                      checked={preferensi.notifikasiEmail}
                      onCheckedChange={(checked) => {
                        const newPreferensi = {
                          ...preferensi,
                          notifikasiEmail: checked,
                        };
                        setPreferensi(newPreferensi);
                        handleSimpan(
                          checked
                            ? "Notifikasi Diaktifkan"
                            : "Notifikasi Dimatikan",
                          { preferensi: newPreferensi },
                        );
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
