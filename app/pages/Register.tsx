import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Mail, Lock, User, Loader2 } from "lucide-react"; // Hapus Receipt

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";

// Impor tipe dan data dummy dari invoices.ts
import { defaultUsers, type User as UserType } from "~/data/invoices";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Inisialisasi Database Virtual jika belum ada
  useEffect(() => {
    const existingUsers = localStorage.getItem("users_db");
    if (!existingUsers) {
      localStorage.setItem("users_db", JSON.stringify(defaultUsers));
    }
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      // 1. Ambil data dari Database Virtual
      const usersDB: UserType[] = JSON.parse(
        localStorage.getItem("users_db") || "[]",
      );

      // 2. Cek apakah email sudah terdaftar
      const isEmailExist = usersDB.some((u) => u.email === email);

      if (isEmailExist) {
        toast.error(
          "Gagal! Email ini sudah terdaftar. Silakan gunakan email lain.",
        );
        return;
      }

      // 3. Buat objek User baru dengan field lengkap agar konsisten dengan nav-user.tsx
      const newUser: UserType = {
        id: `USR-${Date.now().toString().slice(-4)}`, // Generate ID unik
        name: nama,
        email: email,
        password: password,
        avatar: "", // Default kosong, agar tidak error di nav-user
        role: "User", // Default role
      };

      // 4. Simpan ke Database Virtual
      usersDB.push(newUser);
      localStorage.setItem("users_db", JSON.stringify(usersDB));

      // 5. Langsung login-kan user setelah sukses mendaftar
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("currentUser", JSON.stringify(newUser));

      toast.success(`Selamat bergabung, ${nama}! Akun Anda berhasil dibuat.`);
      navigate("/");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4 font-sans animate-in fade-in duration-700">
      <div className="w-full max-w-[420px]">
        <Card className="rounded-3xl shadow-xl border-border/50 overflow-hidden bg-card/95 backdrop-blur-sm">
          {/* Mengubah warna gradient menjadi primary agar seragam dengan Login.tsx */}
          <div className="h-1.5 w-full bg-gradient-to-r from-primary to-primary/60"></div>

          <CardHeader className="pb-6 pt-8 text-center">
            <CardTitle className="text-xl">Buat Akun Baru</CardTitle>
            <CardDescription>Daftarkan diri Anda secara gratis</CardDescription>
          </CardHeader>

          <form onSubmit={handleRegister}>
            <CardContent className="space-y-5 pb-8">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-semibold">
                  Nama Lengkap
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Budi Santoso"
                    required
                    disabled={isLoading}
                    className="pl-10 rounded-xl h-11 bg-muted/30 focus-visible:bg-transparent transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold">
                  Alamat Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@perusahaan.com"
                    required
                    disabled={isLoading}
                    className="pl-10 rounded-xl h-11 bg-muted/30 focus-visible:bg-transparent transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-semibold">
                  Buat Kata Sandi
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    required
                    minLength={8}
                    disabled={isLoading}
                    className="pl-10 rounded-xl h-11 bg-muted/30 focus-visible:bg-transparent transition-colors"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-4 pb-8 pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl my-2 font-bold shadow-md gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Buat Akun Gratis"
                )}
              </Button>

              <div className="flex flex-col items-center gap-3 w-full mt-2">
                <p className="text-xs text-center text-muted-foreground leading-relaxed px-4">
                  Dengan mendaftar, Anda menyetujui{" "}
                  <a href="#" className="text-primary hover:underline">
                    Syarat
                  </a>{" "}
                  dan{" "}
                  <a href="#" className="text-primary hover:underline">
                    Ketentuan Layanan
                  </a>
                  .
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Sudah punya akun?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-primary font-bold hover:underline cursor-pointer"
                  >
                    Masuk di sini
                  </button>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
