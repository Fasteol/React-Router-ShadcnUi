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
import { type User } from "~/data/invoices";

// IMPORT USETHEME UNTUK MENGUBAH TEMA SECARA LANGSUNG
import { useTheme } from "~/components/theme-provider";

import {
  UserCircle,
  Building,
  Landmark,
  Palette,
  Camera,
  Bell,
  Monitor,
  Moon,
  Sun,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  CheckCircle2,
  ShieldAlert,
  Globe,
  FileDigit,
  Lock,
} from "lucide-react";

const emptySettings = {
  profil: { nama: "", email: "", telepon: "", avatar: "" },
  perusahaan: {
    nama: "",
    alamat: "",
    telepon: "",
    email: "",
    npwp: "",
    website: "",
  },
  rekening: { namaBank: "", nomor: "", pemilik: "" },
  preferensi: { tema: "system", mataUang: "IDR", notifikasiEmail: true },
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const [profil, setProfil] = useState(emptySettings.profil);
  const [perusahaan, setPerusahaan] = useState(emptySettings.perusahaan);
  const [rekening, setRekening] = useState(emptySettings.rekening);
  const [preferensi, setPreferensi] = useState(emptySettings.preferensi);

  const [passwordForm, setPasswordForm] = useState({
    saatIni: "",
    baru: "",
    konfirmasi: "",
  });

  const [activeTab, setActiveTab] = useState("profil");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem("adminSettings");
    const currentSettings = savedSettings
      ? JSON.parse(savedSettings)
      : JSON.parse(JSON.stringify(emptySettings));

    const activeUserStr = localStorage.getItem("currentUser");

    if (activeUserStr) {
      const activeUser = JSON.parse(activeUserStr);
      currentSettings.profil.nama =
        activeUser.name || currentSettings.profil.nama;
      currentSettings.profil.email =
        activeUser.email || currentSettings.profil.email;
      currentSettings.profil.telepon =
        activeUser.phone || currentSettings.profil.telepon;
    }

    currentSettings.preferensi.tema = theme || currentSettings.preferensi.tema;

    setProfil(currentSettings.profil);
    setPerusahaan({
      ...emptySettings.perusahaan,
      ...currentSettings.perusahaan,
    });
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

    localStorage.setItem("adminSettings", JSON.stringify(updatedSettings));

    if (kategori === "Profil Personal") {
      const savedUserStr = localStorage.getItem("currentUser");
      if (savedUserStr) {
        const parsedUser = JSON.parse(savedUserStr);
        parsedUser.name = profil.nama;
        parsedUser.email = profil.email;
        parsedUser.phone = profil.telepon;

        localStorage.setItem("currentUser", JSON.stringify(parsedUser));

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
        window.dispatchEvent(new Event("user-updated"));
      }
    }

    toast.success(`Pengaturan ${kategori} berhasil diperbarui.`, {
      description: "Perubahan telah disimpan ke dalam sistem.",
    });
  };

  // ==========================================
  // LOGIKA GANTI PASSWORD YANG BERFUNGSI AKTIF
  // ==========================================
  const handleGantiPassword = () => {
    // 1. Validasi Input Kosong
    if (
      !passwordForm.saatIni ||
      !passwordForm.baru ||
      !passwordForm.konfirmasi
    ) {
      toast.error("Gagal! Harap isi seluruh kolom kata sandi.");
      return;
    }

    // 2. Validasi Konfirmasi Sandi Baru
    if (passwordForm.baru !== passwordForm.konfirmasi) {
      toast.error("Gagal! Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    // 3. Validasi Panjang Karakter Minimum
    if (passwordForm.baru.length < 8) {
      toast.error("Gagal! Kata sandi baru harus minimal 8 karakter.");
      return;
    }

    // 4. Ambil data sesi & database virtual
    const activeUserStr = localStorage.getItem("currentUser");
    const usersDBStr = localStorage.getItem("users_db");

    if (activeUserStr && usersDBStr) {
      const activeUser = JSON.parse(activeUserStr);
      const usersDB: User[] = JSON.parse(usersDBStr);

      // Cari indeks akun yang sedang login di database
      const userIndex = usersDB.findIndex((u) => u.id === activeUser.id);

      if (userIndex !== -1) {
        // 5. Validasi: Cek apakah input kata sandi lama SESUAI dengan database
        // (Asumsi tipe User memiliki properti 'password', bisa di-cast sbg 'any' jika error TS)
        if ((usersDB[userIndex] as any).password !== passwordForm.saatIni) {
          toast.error(
            "Gagal! Kata sandi saat ini (lama) yang Anda masukkan salah.",
          );
          return;
        }

        // 6. Eksekusi: Timpa dengan kata sandi baru dan simpan ke database
        (usersDB[userIndex] as any).password = passwordForm.baru;
        localStorage.setItem("users_db", JSON.stringify(usersDB));

        toast.success("Kata sandi berhasil diperbarui!", {
          description: "Gunakan kata sandi baru Anda untuk login selanjutnya.",
        });

        // Kosongkan form setelah sukses
        setPasswordForm({ saatIni: "", baru: "", konfirmasi: "" });
      } else {
        toast.error("Gagal! Akun Anda tidak ditemukan di database.");
      }
    } else {
      toast.error("Sesi tidak valid, silakan login ulang.");
    }
  };

  const menuItems = [
    { id: "profil", label: "Profil Personal", icon: UserCircle },
    { id: "bisnis", label: "Identitas Bisnis", icon: Building },
    { id: "rekening", label: "Rekening Bank", icon: Landmark },
    { id: "keamanan", label: "Keamanan Akun", icon: ShieldAlert },
    { id: "preferensi", label: "Sistem & Tema", icon: Palette },
  ];

  if (!isLoaded) return null;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 xl:px-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 pb-6 border-b border-border/50 mt-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Pengaturan Sistem
        </h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Kelola identitas personal Anda, detail informasi bisnis untuk
          keperluan invoice, keamanan akun, hingga preferensi tampilan
          antarmuka.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-10">
        <aside className="w-full md:w-56 shrink-0">
          <nav className="flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 custom-scrollbar">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === item.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon
                  className={`w-4 h-4 ${
                    activeTab === item.id
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 max-w-3xl min-h-[500px]">
          {/* ==========================================
              TAB: PROFIL PERSONAL
          ========================================== */}
          {activeTab === "profil" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <Card className="rounded-2xl shadow-sm border-border overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/50 pb-5">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
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
                      <div className="w-20 h-20 bg-gradient-to-tr from-primary/20 to-primary/5 text-primary rounded-2xl flex items-center justify-center text-3xl font-bold border-2 border-background ring-2 ring-primary/20 shadow-sm">
                        {profil.nama
                          ? profil.nama.charAt(0).toUpperCase()
                          : "U"}
                      </div>
                      <button className="absolute -bottom-2 -right-2 p-2 bg-background border rounded-xl text-muted-foreground hover:text-primary shadow-sm transition-colors cursor-pointer">
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm">Foto Profil</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Disarankan menggunakan format JPG atau PNG berukuran
                        1:1.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nama" className="font-semibold">
                        Nama Lengkap
                      </Label>
                      <Input
                        id="nama"
                        value={profil.nama}
                        onChange={(e) =>
                          setProfil({ ...profil, nama: e.target.value })
                        }
                        className="rounded-xl h-10 bg-muted/20"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="font-semibold flex items-center gap-1.5"
                        >
                          <Mail className="w-3.5 h-3.5 text-muted-foreground" />{" "}
                          Email Akses
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={profil.email}
                          onChange={(e) =>
                            setProfil({ ...profil, email: e.target.value })
                          }
                          className="rounded-xl h-10 bg-muted/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="telepon"
                          className="font-semibold flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5 text-muted-foreground" />{" "}
                          No. Telepon Pribadi
                        </Label>
                        <Input
                          id="telepon"
                          placeholder="Belum ditambahkan"
                          value={profil.telepon}
                          onChange={(e) =>
                            setProfil({ ...profil, telepon: e.target.value })
                          }
                          className="rounded-xl h-10 bg-muted/20"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/10 px-6 py-4 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Pastikan email aktif untuk keperluan pemulihan akun.
                  </p>
                  <Button
                    onClick={() => handleSimpan("Profil Personal")}
                    className="gap-2 rounded-xl ml-auto font-bold shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Simpan Profil
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* ==========================================
              TAB: IDENTITAS BISNIS
          ========================================== */}
          {activeTab === "bisnis" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <Card className="rounded-2xl shadow-sm border-border overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/50 pb-5">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Building className="w-5 h-5 text-amber-500" />
                    Detail Perusahaan
                  </CardTitle>
                  <CardDescription>
                    Informasi ini akan tercetak otomatis sebagai header dan
                    footer pada PDF invoice Anda.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="namaPerusahaan" className="font-semibold">
                        Nama Bisnis / Brand
                      </Label>
                      <Input
                        id="namaPerusahaan"
                        placeholder="Cth: PT Inovasi Maju"
                        value={perusahaan.nama}
                        onChange={(e) =>
                          setPerusahaan({ ...perusahaan, nama: e.target.value })
                        }
                        className="rounded-xl h-10 bg-muted/20 font-semibold"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="npwp"
                        className="font-semibold flex items-center gap-1.5"
                      >
                        <FileDigit className="w-3.5 h-3.5 text-muted-foreground" />{" "}
                        NPWP / Tax ID
                      </Label>
                      <Input
                        id="npwp"
                        placeholder="Format: 12.345.678.9-012.000"
                        value={perusahaan.npwp}
                        onChange={(e) =>
                          setPerusahaan({ ...perusahaan, npwp: e.target.value })
                        }
                        className="rounded-xl h-10 bg-muted/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="webBisnis"
                        className="font-semibold flex items-center gap-1.5"
                      >
                        <Globe className="w-3.5 h-3.5 text-muted-foreground" />{" "}
                        Website
                      </Label>
                      <Input
                        id="webBisnis"
                        placeholder="www.domainanda.com"
                        value={perusahaan.website}
                        onChange={(e) =>
                          setPerusahaan({
                            ...perusahaan,
                            website: e.target.value,
                          })
                        }
                        className="rounded-xl h-10 bg-muted/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="emailBisnis"
                        className="font-semibold flex items-center gap-1.5"
                      >
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />{" "}
                        Email Perusahaan
                      </Label>
                      <Input
                        id="emailBisnis"
                        type="email"
                        placeholder="hello@domainanda.com"
                        value={perusahaan.email}
                        onChange={(e) =>
                          setPerusahaan({
                            ...perusahaan,
                            email: e.target.value,
                          })
                        }
                        className="rounded-xl h-10 bg-muted/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="telpBisnis"
                        className="font-semibold flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />{" "}
                        Telepon Kantor
                      </Label>
                      <Input
                        id="telpBisnis"
                        placeholder="(021) 1234567"
                        value={perusahaan.telepon}
                        onChange={(e) =>
                          setPerusahaan({
                            ...perusahaan,
                            telepon: e.target.value,
                          })
                        }
                        className="rounded-xl h-10 bg-muted/20"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label
                        htmlFor="alamat"
                        className="font-semibold flex items-center gap-1.5"
                      >
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />{" "}
                        Alamat Lengkap
                      </Label>
                      <Textarea
                        id="alamat"
                        placeholder="Masukkan alamat fisik kantor pusat operasi bisnis Anda..."
                        rows={3}
                        value={perusahaan.alamat}
                        onChange={(e) =>
                          setPerusahaan({
                            ...perusahaan,
                            alamat: e.target.value,
                          })
                        }
                        className="rounded-xl resize-none bg-muted/20"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/10 px-6 py-4 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Kelengkapan data ini dapat meningkatkan tingkat kepercayaan
                    klien.
                  </p>
                  <Button
                    onClick={() => handleSimpan("Detail Bisnis")}
                    className="gap-2 rounded-xl ml-auto font-bold shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Simpan Entitas
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* ==========================================
              TAB: REKENING BANK
          ========================================== */}
          {activeTab === "rekening" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <Card className="rounded-2xl shadow-sm border-border overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/50 pb-5">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-emerald-500" />
                    Rekening Penagihan
                  </CardTitle>
                  <CardDescription>
                    Tujuan transfer pembayaran yang ditujukan untuk klien Anda.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-2">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-500/20 rounded-xl shrink-0">
                        <CreditCard className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                          {rekening.namaBank || "NAMA BANK"}
                        </p>
                        <p className="text-xl text-emerald-800 dark:text-emerald-400 font-mono mt-1 font-bold">
                          {rekening.nomor || "XXXX-XXXX-XXXX"}
                        </p>
                        <p className="text-xs font-semibold text-emerald-600/80 dark:text-emerald-400/80 mt-1 uppercase">
                          A.N {rekening.pemilik || "NAMA PEMILIK"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                    <div className="space-y-2">
                      <Label htmlFor="namaBank" className="font-semibold">
                        Nama Bank / e-Wallet
                      </Label>
                      <Input
                        id="namaBank"
                        placeholder="Cth: BCA / Mandiri / GoPay"
                        value={rekening.namaBank}
                        onChange={(e) =>
                          setRekening({ ...rekening, namaBank: e.target.value })
                        }
                        className="rounded-xl h-10 bg-muted/20 uppercase"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nomorRekening" className="font-semibold">
                        Nomor Rekening
                      </Label>
                      <Input
                        id="nomorRekening"
                        placeholder="Masukkan digit nomor"
                        value={rekening.nomor}
                        onChange={(e) =>
                          setRekening({ ...rekening, nomor: e.target.value })
                        }
                        className="rounded-xl h-10 bg-muted/20 font-mono text-base"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pemilikRekening" className="font-semibold">
                      Nama Pemilik Rekening
                    </Label>
                    <Input
                      id="pemilikRekening"
                      placeholder="Atas nama sesuai buku tabungan..."
                      value={rekening.pemilik}
                      onChange={(e) =>
                        setRekening({ ...rekening, pemilik: e.target.value })
                      }
                      className="rounded-xl h-10 bg-muted/20"
                    />
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/10 px-6 py-4 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Pastikan nomor rekening valid sebelum membuat invoice.
                  </p>
                  <Button
                    onClick={() => handleSimpan("Rekening Bank")}
                    className="gap-2 rounded-xl ml-auto font-bold shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Simpan Rekening
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* ==========================================
              TAB: KEAMANAN AKUN
          ========================================== */}
          {activeTab === "keamanan" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <Card className="rounded-2xl shadow-sm border-border overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/50 pb-5">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                    Keamanan & Kata Sandi
                  </CardTitle>
                  <CardDescription>
                    Perbarui kredensial Anda untuk menjaga keamanan akses.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="passLama"
                      className="font-semibold flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5 text-muted-foreground" />{" "}
                      Kata Sandi Saat Ini
                    </Label>
                    <Input
                      id="passLama"
                      type="password"
                      placeholder="••••••••"
                      value={passwordForm.saatIni}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          saatIni: e.target.value,
                        })
                      }
                      className="rounded-xl h-10 bg-muted/20"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="passBaru" className="font-semibold">
                        Kata Sandi Baru
                      </Label>
                      <Input
                        id="passBaru"
                        type="password"
                        placeholder="Minimal 8 karakter"
                        value={passwordForm.baru}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            baru: e.target.value,
                          })
                        }
                        className="rounded-xl h-10 bg-muted/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passKonfirm" className="font-semibold">
                        Konfirmasi Kata Sandi Baru
                      </Label>
                      <Input
                        id="passKonfirm"
                        type="password"
                        placeholder="Ulangi kata sandi baru"
                        value={passwordForm.konfirmasi}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            konfirmasi: e.target.value,
                          })
                        }
                        className="rounded-xl h-10 bg-muted/20"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/10 px-6 py-4">
                  <Button
                    onClick={handleGantiPassword}
                    className="gap-2 rounded-xl w-full sm:w-auto font-bold shadow-md bg-foreground text-background hover:bg-foreground/90"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Perbarui Kata Sandi
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* ==========================================
              TAB: PREFERENSI
          ========================================== */}
          {activeTab === "preferensi" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <Card className="rounded-2xl shadow-sm border-border overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/50 pb-5">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
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
                      <Label className="text-base font-semibold">
                        Tema Aplikasi
                      </Label>
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
                      <SelectTrigger className="w-full sm:w-[220px] rounded-xl h-10">
                        <SelectValue placeholder="Pilih Tema" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
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
                      <Label className="text-base font-semibold">
                        Mata Uang Basis
                      </Label>
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
                      <SelectTrigger className="w-full sm:w-[220px] rounded-xl h-10 font-mono font-medium">
                        <SelectValue placeholder="Pilih Mata Uang" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="IDR">IDR - Rupiah</SelectItem>
                        <SelectItem value="USD">USD - Dolar AS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Card Notifikasi */}
              <Card className="rounded-2xl shadow-sm border-border overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/50 pb-5">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Bell className="w-5 h-5 text-rose-500" />
                    Notifikasi Sistem
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-row items-center justify-between rounded-xl border border-border/50 p-5 bg-muted/10 hover:bg-muted/20 transition-colors">
                    <div className="space-y-1 pr-4">
                      <Label
                        className="text-base font-semibold cursor-pointer"
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
