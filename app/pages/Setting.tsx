"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import type { UserType } from "~/types/index";

// SHADCN UI COMPONENTS
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
import { Switch } from "~/components/ui/switch";

// HOOKS GLOBAL ZUSTAND
import { useTheme } from "~/components/theme-provider";
import { useAppStore } from "~/store/useAppStore"; // Pastikan path ini sesuai

// ICONS
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
  Check,
  ChevronsUpDown,
} from "lucide-react";

import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

import { cn } from "~/lib/utils";

export default function SettingPage() {
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openComboboxTema, setOpenComboboxTema] = useState(false);
  const [openComboboxMataUang, setOpenComboboxMataUang] = useState(false);

  // ==========================================
  // MENGAMBIL DATA & ACTION DARI ZUSTAND STORE
  // ==========================================
  const {
    profil: globalProfil,
    infoBisnis: globalBisnis,
    rekening: globalRekening,
    preferensi: globalPref,
    setProfil: setGlobalProfil,
    setInfoBisnis: setGlobalBisnis,
    setRekening: setGlobalRekening,
    setPreferensi: setGlobalPref,
  } = useAppStore();

  // ==========================================
  // STATE LOKAL UNTUK FORMULIR
  // ==========================================
  const [profil, setProfilLokal] = useState(globalProfil);
  const [infoBisnis, setInfoBisnisLokal] = useState(globalBisnis);
  const [rekening, setRekeningLokal] = useState(globalRekening);
  const [preferensi, setPreferensiLokal] = useState(globalPref);

  const [passwordForm, setPasswordForm] = useState({
    saatIni: "",
    baru: "",
    konfirmasi: "",
  });

  const [activeTab, setActiveTab] = useState("profil");

  // Sinkronisasi data global ke lokal saat pertama kali dimuat atau di-refresh
  useEffect(() => {
    setProfilLokal(globalProfil);
    setInfoBisnisLokal(globalBisnis);
    setRekeningLokal(globalRekening);
    setPreferensiLokal(globalPref);
  }, [globalProfil, globalBisnis, globalRekening, globalPref]);

  // ==========================================
  // LOGIKA UPLOAD FOTO PROFIL (Kompresi Base64)
  // ==========================================
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 256;
          const MAX_HEIGHT = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          setProfilLokal({ ...profil, avatar: compressedBase64 });

          toast.success("Foto profil berhasil dikompresi & dipilih!", {
            description: "Jangan lupa tekan 'Simpan Profil' untuk menerapkan.",
          });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // ==========================================
  // LOGIKA PENYIMPANAN DATA KE ZUSTAND
  // ==========================================
  const handleSimpan = (kategori: string, overrideData?: any) => {
    // 1. Simpan Profil Personal
    if (kategori === "Profil Personal") {
      setGlobalProfil(profil);

      // (Opsional) Update sesi lokal khusus autentikasi agar UI shell tidak perlu ditarik ulang semua
      const savedUserStr = localStorage.getItem("currentUser");
      if (savedUserStr) {
        const parsedUser = JSON.parse(savedUserStr);
        parsedUser.name = profil.nama;
        parsedUser.email = profil.email;
        parsedUser.avatar = profil.avatar;
        localStorage.setItem("currentUser", JSON.stringify(parsedUser));

        // Trigger event untuk NavUser dan Layout
        window.dispatchEvent(new Event("user-updated"));
      }
    }

    // 2. Simpan Entitas Bisnis
    if (kategori === "Detail Bisnis") setGlobalBisnis(infoBisnis);

    // 3. Simpan Rekening Bank
    if (kategori === "Rekening Bank") setGlobalRekening(rekening);

    // 4. Simpan Preferensi (Tema, Mata Uang, Notifikasi)
    if (
      kategori.includes("Tema") ||
      kategori.includes("Mata Uang") ||
      kategori.includes("Notifikasi")
    ) {
      setGlobalPref(overrideData?.preferensi || preferensi);
    }

    toast.success(`Pengaturan ${kategori} berhasil diperbarui.`, {
      description: "Perubahan telah disimpan otomatis oleh sistem.",
    });
  };

  // ==========================================
  // LOGIKA GANTI KATA SANDI
  // ==========================================
  const handleGantiPassword = () => {
    if (
      !passwordForm.saatIni ||
      !passwordForm.baru ||
      !passwordForm.konfirmasi
    ) {
      toast.error("Gagal! Harap isi seluruh kolom kata sandi.");
      return;
    }
    if (passwordForm.baru !== passwordForm.konfirmasi) {
      toast.error("Gagal! Konfirmasi kata sandi baru tidak cocok.");
      return;
    }
    if (passwordForm.baru.length < 8) {
      toast.error("Gagal! Kata sandi baru harus minimal 8 karakter.");
      return;
    }

    // Untuk autentikasi yang tersimpan di localStorage (jika Anda masih menggunakan users_db lokal)
    const activeUserStr = localStorage.getItem("currentUser");
    const usersDBStr = localStorage.getItem("users_db");

    if (activeUserStr && usersDBStr) {
      const activeUser = JSON.parse(activeUserStr);
      const usersDB: UserType[] = JSON.parse(usersDBStr);
      const userIndex = usersDB.findIndex((u) => u.id === activeUser.id);

      if (userIndex !== -1) {
        if (usersDB[userIndex].password !== passwordForm.saatIni) {
          toast.error(
            "Gagal! Kata sandi saat ini (lama) yang Anda masukkan salah.",
          );
          return;
        }
        usersDB[userIndex].password = passwordForm.baru;
        localStorage.setItem("users_db", JSON.stringify(usersDB));
        toast.success("Kata sandi berhasil diperbarui!");
        setPasswordForm({ saatIni: "", baru: "", konfirmasi: "" });
      }
    } else {
      toast.error("Data user tidak ditemukan. Silakan login kembali.");
    }
  };

  const menuItems = [
    { id: "profil", label: "Profil Personal", icon: UserCircle },
    { id: "bisnis", label: "Identitas Bisnis", icon: Building },
    { id: "rekening", label: "Rekening Bank", icon: Landmark },
    { id: "keamanan", label: "Keamanan Akun", icon: ShieldAlert },
    { id: "preferensi", label: "Sistem & Tema", icon: Palette },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 xl:px-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
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
          {/* TAB: PROFIL PERSONAL */}
          {activeTab === "profil" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <Card className="rounded-2xl shadow-sm border-border overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/50 pb-5">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <UserCircle className="w-5 h-5 text-primary" />
                    Informasi Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="relative shrink-0">
                      <div className="w-24 h-24 bg-gradient-to-tr from-primary/20 to-primary/5 text-primary rounded-3xl flex items-center justify-center text-4xl font-extrabold border-4 border-background ring-2 ring-primary/20 shadow-sm overflow-hidden">
                        {profil.avatar ? (
                          <img
                            src={profil.avatar}
                            alt="Foto Profil"
                            className="w-full h-full object-cover"
                          />
                        ) : profil.nama ? (
                          profil.nama.charAt(0).toUpperCase()
                        ) : (
                          "U"
                        )}
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/jpeg, image/png, image/webp"
                        className="hidden"
                      />
                      <button
                        onClick={triggerFileInput}
                        className="absolute -bottom-2 -right-2 p-2.5 bg-background border rounded-xl text-muted-foreground hover:text-primary shadow-md hover:shadow-lg transition-all cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <h3 className="font-semibold text-sm">Visual Pengguna</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                        Format didukung: JPG, PNG, atau WEBP. Maksimal 2MB.
                      </p>
                      {profil.avatar && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs text-rose-500 hover:bg-rose-50 mt-1"
                          onClick={() =>
                            setProfilLokal({ ...profil, avatar: "" })
                          }
                        >
                          Hapus Foto
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="nama" className="font-semibold">
                        Nama Lengkap
                      </Label>
                      <Input
                        id="nama"
                        placeholder="Masukkan nama lengkap Anda..."
                        value={profil.nama}
                        onChange={(e) =>
                          setProfilLokal({ ...profil, nama: e.target.value })
                        }
                        className="rounded-xl h-10 bg-background border-border/60"
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
                          placeholder="contoh@email.com"
                          value={profil.email}
                          onChange={(e) =>
                            setProfilLokal({ ...profil, email: e.target.value })
                          }
                          className="rounded-xl h-10 bg-background border-border/60"
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
                          placeholder="0812-XXXX-XXXX"
                          value={profil.telepon}
                          onChange={(e) =>
                            setProfilLokal({
                              ...profil,
                              telepon: e.target.value,
                            })
                          }
                          className="rounded-xl h-10 bg-background border-border/60"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/10 px-6 py-4 flex items-center justify-end">
                  <Button
                    onClick={() => handleSimpan("Profil Personal")}
                    className="gap-2 rounded-xl font-bold shadow-md h-10"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Simpan Profil
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* TAB: IDENTITAS BISNIS */}
          {activeTab === "bisnis" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <Card className="rounded-2xl shadow-sm border-border overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/50 pb-5">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Building className="w-5 h-5 text-amber-500" /> Detail
                    Perusahaan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="namaPerusahaan" className="font-semibold">
                        Nama Bisnis / Brand
                      </Label>
                      <Input
                        id="namaPerusahaan"
                        placeholder="PT. Nama Perusahaan Anda"
                        value={infoBisnis.nama}
                        onChange={(e) =>
                          setInfoBisnisLokal({
                            ...infoBisnis,
                            nama: e.target.value,
                          })
                        }
                        className="rounded-xl h-10 bg-background border-border/60 font-semibold"
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
                        placeholder="00.000.000.0-000.000"
                        value={infoBisnis.npwp}
                        onChange={(e) =>
                          setInfoBisnisLokal({
                            ...infoBisnis,
                            npwp: e.target.value,
                          })
                        }
                        className="rounded-xl h-10 bg-background border-border/60"
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
                        placeholder="https://www.websiteanda.com"
                        value={infoBisnis.website}
                        onChange={(e) =>
                          setInfoBisnisLokal({
                            ...infoBisnis,
                            website: e.target.value,
                          })
                        }
                        className="rounded-xl h-10 bg-background border-border/60"
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
                        placeholder="finance@perusahaan.com"
                        value={infoBisnis.email}
                        onChange={(e) =>
                          setInfoBisnisLokal({
                            ...infoBisnis,
                            email: e.target.value,
                          })
                        }
                        className="rounded-xl h-10 bg-background border-border/60"
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
                        placeholder="021-XXXXXXXX"
                        value={infoBisnis.telepon}
                        onChange={(e) =>
                          setInfoBisnisLokal({
                            ...infoBisnis,
                            telepon: e.target.value,
                          })
                        }
                        className="rounded-xl h-10 bg-background border-border/60"
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
                        rows={3}
                        placeholder="Masukkan alamat domisili operasional bisnis..."
                        value={infoBisnis.alamat}
                        onChange={(e) =>
                          setInfoBisnisLokal({
                            ...infoBisnis,
                            alamat: e.target.value,
                          })
                        }
                        className="rounded-xl resize-none bg-background border-border/60"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/10 px-6 py-4 flex items-center justify-end">
                  <Button
                    onClick={() => handleSimpan("Detail Bisnis")}
                    className="gap-2 rounded-xl font-bold shadow-md h-10"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Simpan Entitas
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* TAB: REKENING BANK */}
          {activeTab === "rekening" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <Card className="rounded-2xl shadow-sm border-border overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/50 pb-5">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-emerald-500" /> Rekening
                    Penagihan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-2 flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/20 rounded-xl shrink-0">
                      <CreditCard className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase text-emerald-700">
                        {rekening.namaBank || "NAMA BANK"}
                      </p>
                      <p className="text-xl text-emerald-800 font-mono mt-1 font-bold">
                        {rekening.nomor || "XXXX-XXXX-XXXX"}
                      </p>
                      <p className="text-xs font-semibold text-emerald-600/80 mt-1 uppercase">
                        A.N {rekening.pemilik || "NAMA PEMILIK"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                    <div className="space-y-2">
                      <Label htmlFor="namaBank" className="font-semibold">
                        Nama Bank / e-Wallet
                      </Label>
                      <Input
                        id="namaBank"
                        placeholder="BCA / Mandiri / GoPay..."
                        value={rekening.namaBank}
                        onChange={(e) =>
                          setRekeningLokal({
                            ...rekening,
                            namaBank: e.target.value,
                          })
                        }
                        className="rounded-xl h-10 bg-background border-border/60 uppercase"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nomorRekening" className="font-semibold">
                        Nomor Rekening
                      </Label>
                      <Input
                        id="nomorRekening"
                        placeholder="1234567890"
                        value={rekening.nomor}
                        onChange={(e) =>
                          setRekeningLokal({
                            ...rekening,
                            nomor: e.target.value,
                          })
                        }
                        className="rounded-xl h-10 bg-background border-border/60 font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 mt-5">
                    <Label htmlFor="pemilikRekening" className="font-semibold">
                      Nama Pemilik Rekening
                    </Label>
                    <Input
                      id="pemilikRekening"
                      placeholder="Atas Nama (A.N)..."
                      value={rekening.pemilik}
                      onChange={(e) =>
                        setRekeningLokal({
                          ...rekening,
                          pemilik: e.target.value,
                        })
                      }
                      className="rounded-xl h-10 bg-background border-border/60"
                    />
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/10 px-6 py-4 flex items-center justify-end">
                  <Button
                    onClick={() => handleSimpan("Rekening Bank")}
                    className="gap-2 rounded-xl font-bold shadow-md h-10"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Simpan Rekening
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* TAB: KEAMANAN AKUN */}
          {activeTab === "keamanan" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <Card className="rounded-2xl shadow-sm border-border overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/50 pb-5">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-500" /> Keamanan &
                    Kata Sandi
                  </CardTitle>
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
                      className="rounded-xl h-10 bg-background border-border/60"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-border/50">
                    <div className="space-y-2">
                      <Label htmlFor="passBaru" className="font-semibold">
                        Kata Sandi Baru
                      </Label>
                      <Input
                        id="passBaru"
                        type="password"
                        placeholder="••••••••"
                        value={passwordForm.baru}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            baru: e.target.value,
                          })
                        }
                        className="rounded-xl h-10 bg-background border-border/60"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passKonfirm" className="font-semibold">
                        Konfirmasi Kata Sandi Baru
                      </Label>
                      <Input
                        id="passKonfirm"
                        type="password"
                        placeholder="••••••••"
                        value={passwordForm.konfirmasi}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            konfirmasi: e.target.value,
                          })
                        }
                        className="rounded-xl h-10 bg-background border-border/60"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/10 px-6 py-4">
                  <Button
                    onClick={handleGantiPassword}
                    className="gap-2 rounded-xl w-full sm:w-auto font-bold shadow-md h-10 bg-foreground text-background hover:bg-foreground/90"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Perbarui Kata Sandi
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* TAB: PREFERENSI */}
          {activeTab === "preferensi" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <Card className="rounded-2xl shadow-sm border-border overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/50 pb-5">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Palette className="w-5 h-5 text-indigo-500" /> Antarmuka &
                    Regional
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Label className="text-base font-semibold">
                        Tema Aplikasi
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Pilih skema warna yang nyaman.
                      </p>
                    </div>
                    <Popover
                      open={openComboboxTema}
                      onOpenChange={setOpenComboboxTema}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openComboboxTema}
                          className="w-full sm:w-[220px] justify-between font-normal rounded-xl h-10 border-border/60 bg-background shadow-sm hover:border-primary/40 hover:bg-muted/20 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            {preferensi.tema === "light" && (
                              <>
                                <Sun className="w-4 h-4 text-amber-500" />{" "}
                                Terang
                              </>
                            )}
                            {preferensi.tema === "dark" && (
                              <>
                                <Moon className="w-4 h-4 text-blue-500" /> Gelap
                              </>
                            )}
                            {preferensi.tema === "system" && (
                              <>
                                <Monitor className="w-4 h-4 text-muted-foreground" />{" "}
                                Ikuti Sistem
                              </>
                            )}
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[220px] p-0 rounded-xl shadow-lg border-border/60"
                        align="end"
                      >
                        <Command>
                          <CommandList>
                            <CommandGroup>
                              {[
                                {
                                  value: "light",
                                  label: "Terang",
                                  icon: Sun,
                                  color: "text-amber-500",
                                },
                                {
                                  value: "dark",
                                  label: "Gelap",
                                  icon: Moon,
                                  color: "text-blue-500",
                                },
                                {
                                  value: "system",
                                  label: "Ikuti Sistem",
                                  icon: Monitor,
                                  color: "text-muted-foreground",
                                },
                              ].map((item) => (
                                <CommandItem
                                  key={item.value}
                                  onSelect={() => {
                                    const newPreferensi = {
                                      ...preferensi,
                                      tema: item.value,
                                    };
                                    setPreferensiLokal(newPreferensi);
                                    setTheme(
                                      item.value as "light" | "dark" | "system",
                                    );
                                    handleSimpan("Tema Antarmuka", {
                                      preferensi: newPreferensi,
                                    });
                                    setOpenComboboxTema(false);
                                  }}
                                  className="rounded-lg cursor-pointer my-0.5 font-medium"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4 text-primary shrink-0",
                                      preferensi.tema === item.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  <item.icon
                                    className={cn("mr-2 h-4 w-4", item.color)}
                                  />
                                  {item.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="shrink-0 bg-border/50 h-[1px] w-full" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Label className="text-base font-semibold">
                        Mata Uang Basis
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Format penulisan angka default.
                      </p>
                    </div>
                    <Popover
                      open={openComboboxMataUang}
                      onOpenChange={setOpenComboboxMataUang}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openComboboxMataUang}
                          className="w-full sm:w-[220px] justify-between font-normal rounded-xl h-10 border-border/60 bg-background shadow-sm hover:border-primary/40 hover:bg-muted/20 transition-all font-mono"
                        >
                          {preferensi.mataUang === "IDR"
                            ? "IDR - Rupiah"
                            : "USD - Dolar AS"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[220px] p-0 rounded-xl shadow-lg border-border/60"
                        align="end"
                      >
                        <Command>
                          <CommandList>
                            <CommandGroup>
                              {[
                                { value: "IDR", label: "IDR - Rupiah" },
                                { value: "USD", label: "USD - Dolar AS" },
                              ].map((item) => (
                                <CommandItem
                                  key={item.value}
                                  onSelect={() => {
                                    const newPreferensi = {
                                      ...preferensi,
                                      mataUang: item.value,
                                    };
                                    setPreferensiLokal(newPreferensi);
                                    handleSimpan("Mata Uang", {
                                      preferensi: newPreferensi,
                                    });
                                    setOpenComboboxMataUang(false);
                                  }}
                                  className="rounded-lg cursor-pointer my-0.5 font-medium font-mono"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4 text-primary shrink-0",
                                      preferensi.mataUang === item.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {item.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm border-border overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/50 pb-5">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Bell className="w-5 h-5 text-rose-500" /> Notifikasi Sistem
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-row items-center justify-between rounded-xl border border-border/50 p-5 bg-muted/10">
                    <div className="space-y-1 pr-4">
                      <Label
                        className="text-base font-semibold cursor-pointer"
                        htmlFor="email-notif"
                      >
                        Peringatan Status Lunas
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Terima pemberitahuan email otomatis ketika status
                        invoice diperbarui.
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
                        setPreferensiLokal(newPreferensi);
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
