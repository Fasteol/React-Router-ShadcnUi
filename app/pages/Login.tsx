import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Receipt,
  ShieldCheck,
} from "lucide-react";

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
import { defaultUsers, type User } from "~/data/invoices";

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Inisialisasi Database Virtual saat halaman dimuat
  useEffect(() => {
    const existingUsers = localStorage.getItem("users_db");
    if (!existingUsers) {
      localStorage.setItem("users_db", JSON.stringify(defaultUsers));
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      // 1. Ambil data user dari "Database"
      const usersDB: User[] = JSON.parse(
        localStorage.getItem("users_db") || "[]",
      );

      // 2. Cari apakah ada email dan password yang cocok
      const validUser = usersDB.find(
        (u) => u.email === email && u.password === password,
      );

      if (validUser) {
        toast.success(
          `Login berhasil! Selamat datang kembali, ${validUser.name}.`,
        );

        // Simpan sesi login & data user yang sedang aktif
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("currentUser", JSON.stringify(validUser));

        navigate("/");
      } else {
        toast.error("Gagal! Email atau kata sandi yang Anda masukkan salah.");
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4 font-sans animate-in fade-in duration-700">
      <div className="w-full max-w-[420px]">
        <Card className="rounded-3xl shadow-xl border-border/50 overflow-hidden bg-card/95 backdrop-blur-sm">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary to-primary/60"></div>

          <CardHeader className="pb-6 pt-8 text-center">
            <CardTitle className="text-xl">Masuk ke Akun</CardTitle>
            <CardDescription>
              Masukkan kredensial Anda untuk melanjutkan
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-5 pb-8">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="font-semibold">
                    Kata Sandi
                  </Label>
                  <a
                    href="#"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Lupa sandi?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
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
                  <>
                    Masuk Sistem <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <div className="flex flex-col items-center gap-3 w-full mt-2">
                <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Akses terenkripsi &
                  aman
                </p>
                <p className="text-sm text-muted-foreground">
                  Belum punya akun?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="text-primary font-bold hover:underline cursor-pointer"
                  >
                    Daftar di sini
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
