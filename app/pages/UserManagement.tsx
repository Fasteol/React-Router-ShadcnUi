import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Shield,
  Mail,
  Users,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "~/lib/utils";
import { type TeamMember, dataAwalTim } from "~/data/invoices";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";

// ==========================================
// KOMPONEN UTAMA
// ==========================================
export default function UserManagementPage() {
  // STATE UTAMA
  const [team, setTeam] = useState<TeamMember[]>(dataAwalTim);
  const [kataKunci, setKataKunci] = useState("");

  // STATE PAGINASI
  const [halamanSaatIni, setHalamanSaatIni] = useState(1);
  const [itemPerHalaman, setItemPerHalaman] = useState(10);

  // STATE DIALOG & FORM
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"tambah" | "edit">("tambah");
  const [formData, setFormData] = useState<TeamMember>({
    id: "",
    nama: "",
    email: "",
    role: "Viewer",
    status: "Mengundang",
  });

  // STATE HAPUS DATA
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [idYangDihapus, setIdYangDihapus] = useState<string | null>(null);

  // ==========================================
  // PENGGUNAAN USEMEMO UNTUK OPTIMASI FILTER & METRIK
  // ==========================================
  const { dataTersaring, totalAnggota, totalAdmin, totalFinance } =
    useMemo(() => {
      const tersaring = team.filter(
        (user) =>
          user.nama.toLowerCase().includes(kataKunci.toLowerCase()) ||
          user.email.toLowerCase().includes(kataKunci.toLowerCase()),
      );

      return {
        dataTersaring: tersaring,
        totalAnggota: team.length,
        totalAdmin: team.filter((t) => t.role === "Admin").length,
        totalFinance: team.filter((t) => t.role === "Finance").length,
      };
    }, [team, kataKunci]);

  // LOGIKA PAGINASI
  const totalHalaman = Math.ceil(dataTersaring.length / itemPerHalaman);
  const indexAwal = (halamanSaatIni - 1) * itemPerHalaman;
  const indexAkhir = indexAwal + itemPerHalaman;
  const dataTampil = dataTersaring.slice(indexAwal, indexAkhir);

  // ==========================================
  // FUNGSI AKSI (TAMBAH, EDIT, HAPUS)
  // ==========================================
  const bukaFormTambah = () => {
    setFormMode("tambah");
    setFormData({
      id: `USR-${String(team.length + 1).padStart(2, "0")}`,
      nama: "",
      email: "",
      role: "Viewer",
      status: "Mengundang",
    });
    setIsDialogOpen(true);
  };

  const bukaFormEdit = (user: TeamMember) => {
    setFormMode("edit");
    setFormData(user);
    setIsDialogOpen(true);
  };

  const handleSimpan = () => {
    if (!formData.nama || !formData.email) {
      toast.error("Gagal! Nama lengkap dan email rekan tim wajib diisi.");
      return;
    }

    if (formMode === "tambah") {
      setTeam([formData, ...team]);
      toast.success(`Undangan akses telah dikirimkan ke ${formData.email}`);
    } else {
      setTeam(team.map((t) => (t.id === formData.id ? formData : t)));
      toast.success("Konfigurasi hak akses tim berhasil diperbarui.");
    }
    setIsDialogOpen(false);
  };

  const konfirmasiHapus = (id: string) => {
    setIdYangDihapus(id);
    setIsDeleteOpen(true);
  };

  const eksekusiHapus = () => {
    if (idYangDihapus) {
      const dataBaru = team.filter((t) => t.id !== idYangDihapus);
      setTeam(dataBaru);

      if (dataTampil.length === 1 && halamanSaatIni > 1) {
        setHalamanSaatIni(halamanSaatIni - 1);
      }
      toast.success("Akses pengguna telah dicabut dari sistem.");
    }
    setIsDeleteOpen(false);
    setIdYangDihapus(null);
  };

  const renderPaginationItems = () => {
    const items = [];
    const batasTampil = 5;

    if (totalHalaman <= batasTampil) {
      for (let i = 1; i <= totalHalaman; i++) items.push(i);
    } else {
      if (halamanSaatIni <= 3) {
        items.push(1, 2, 3, 4, "ellipsis", totalHalaman);
      } else if (halamanSaatIni >= totalHalaman - 2) {
        items.push(
          1,
          "ellipsis",
          totalHalaman - 3,
          totalHalaman - 2,
          totalHalaman - 1,
          totalHalaman,
        );
      } else {
        items.push(
          1,
          "ellipsis",
          halamanSaatIni - 1,
          halamanSaatIni,
          halamanSaatIni + 1,
          "ellipsis",
          totalHalaman,
        );
      }
    }

    return items.map((item, index) => {
      if (item === "ellipsis") {
        return (
          <PaginationItem key={`ellipsis-${index}`}>
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      return (
        <PaginationItem key={item}>
          <PaginationLink
            href="#"
            isActive={halamanSaatIni === item}
            onClick={(e) => {
              e.preventDefault();
              setHalamanSaatIni(item as number);
            }}
            className={
              halamanSaatIni === item
                ? "rounded-xl"
                : "rounded-xl hover:bg-muted"
            }
          >
            {item}
          </PaginationLink>
        </PaginationItem>
      );
    });
  };

  return (
    <div className="max-w-6xl py-8 mx-auto font-sans flex flex-col gap-10 px-4 xl:px-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col items-start space-y-3 mt-2">
        <Badge
          variant="secondary"
          className="px-3 py-1 text-xs font-medium dark:bg-muted/50 border shadow-sm rounded-md"
        >
          Kontrol Keamanan & Akses
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Manajemen Pengguna
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Atur siapa saja yang dapat mengelola sistem invoicing Anda. Berikan
          batasan akses yang aman sesuai dengan tanggung jawab divisi kerja.
        </p>
      </div>

      {/* OVERVIEW CARDS (METRIK) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 p-5 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">{totalAnggota} Anggota</div>
            <div className="text-xs text-muted-foreground mt-0.5 font-medium">
              Terdaftar di Ruang Kerja
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">{totalAdmin} Administrator</div>
            <div className="text-xs text-muted-foreground mt-0.5 font-medium">
              Hak Akses Konfigurasi Penuh
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">
              {totalFinance} Finansial Staf
            </div>
            <div className="text-xs text-muted-foreground mt-0.5 font-medium">
              Khusus Modul Transaksi & Billing
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 border rounded-2xl bg-card shadow-sm">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau email tim..."
              value={kataKunci}
              onChange={(e) => {
                setKataKunci(e.target.value);
                setHalamanSaatIni(1);
              }}
              className="pl-9 rounded-xl w-full"
            />
          </div>
          <Button
            onClick={bukaFormTambah}
            className="rounded-xl gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Undang Anggota
          </Button>
        </div>

        <div className="border rounded-2xl bg-card shadow-sm overflow-hidden overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-semibold">Nama Pengguna</TableHead>
                <TableHead className="font-semibold">Kontak Email</TableHead>
                <TableHead className="font-semibold">
                  Peran Hak Akses (Role)
                </TableHead>
                <TableHead className="font-semibold">Status Sistem</TableHead>
                <TableHead className="text-center w-32 font-semibold">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataTampil.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center h-32 text-muted-foreground"
                  >
                    Tidak ada data pengguna ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                dataTampil.map((user) => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <TableCell className="font-bold text-foreground">
                      {user.nama}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm flex items-center gap-1.5 text-muted-foreground">
                        <Mail className="w-3.5 h-3.5" /> {user.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm flex items-center gap-1.5 font-medium">
                        <Shield className="w-3.5 h-3.5 text-primary" />{" "}
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.status === "Aktif"
                            ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:text-emerald-400 border-0 font-semibold shadow-none"
                            : user.status === "Mengundang"
                              ? "bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 dark:text-amber-400 border-0 font-semibold shadow-none"
                              : "bg-red-500/15 text-red-700 hover:bg-red-500/25 dark:text-red-400 border-0 font-semibold shadow-none"
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => bukaFormEdit(user)}
                          className="h-8 w-8 text-blue-600 rounded-lg hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
                          title="Edit Akses"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => konfirmasiHapus(user.id)}
                          className="h-8 w-8 text-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                          title="Cabut Akses"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* BOTTOM PAGINATION CONTROLLER */}
        {totalHalaman > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card px-4 py-1.5 rounded-full border shadow-sm">
              <span>Tampilkan</span>
              <Select
                value={itemPerHalaman.toString()}
                onValueChange={(val) => {
                  setItemPerHalaman(Number(val));
                  setHalamanSaatIni(1);
                }}
              >
                <SelectTrigger className="w-[70px] h-7 rounded-md border-0 bg-transparent shadow-none focus:ring-0 px-1 font-semibold text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span>data</span>
            </div>

            <Pagination className="w-auto mx-0">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (halamanSaatIni > 1)
                        setHalamanSaatIni(halamanSaatIni - 1);
                    }}
                    className={cn(
                      "rounded-xl",
                      halamanSaatIni === 1
                        ? "pointer-events-none opacity-50"
                        : "hover:bg-muted",
                    )}
                  />
                </PaginationItem>
                {renderPaginationItems()}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (halamanSaatIni < totalHalaman)
                        setHalamanSaatIni(halamanSaatIni + 1);
                    }}
                    className={cn(
                      "rounded-xl",
                      halamanSaatIni >= totalHalaman
                        ? "pointer-events-none opacity-50"
                        : "hover:bg-muted",
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* ==========================================
          FORM DIALOG (TAMBAH / EDIT)
      ========================================== */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {/* Lebar Dialog dibuat konsisten 480px seperti file lainnya */}
        <DialogContent className="sm:max-w-[480px] sm:rounded-2xl p-0 overflow-hidden border-0 shadow-xl">
          <div className="h-2 w-full bg-gradient-to-r from-primary to-primary/60"></div>
          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-bold">
                {formMode === "tambah"
                  ? "Undang Rekan Kerja"
                  : "Ubah Konfigurasi Akses"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                Sistem akan menyelaraskan izin menu aplikasi berdasarkan peran
                yang Anda pilih di bawah ini.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 py-2">
              <div className="grid gap-2">
                <Label htmlFor="nama" className="font-semibold">
                  Nama Lengkap
                </Label>
                <Input
                  id="nama"
                  placeholder="Contoh: Muhammad Rafli"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  className="rounded-xl h-10"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email" className="font-semibold">
                  Alamat Email Kerja
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="rounded-xl h-10"
                  disabled={formMode === "edit"}
                />
              </div>

              {/* DIBUAT STACKING (VERTIKAL) AGAR LEGA DAN TIDAK TERPOTONG */}
              <div className="grid gap-2">
                <Label htmlFor="role" className="font-semibold">
                  Peran & Hak Akses
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(val: "Admin" | "Finance" | "Viewer") =>
                    setFormData({ ...formData, role: val })
                  }
                >
                  <SelectTrigger id="role" className="w-full rounded-xl h-10">
                    <SelectValue placeholder="Pilih Peran" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground/80 pl-1 leading-relaxed mt-0.5">
                  * Menentukan batasan izin akses modul dan manipulasi data.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status" className="font-semibold">
                  Status Akun
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(
                    val: "Aktif" | "Mengundang" | "Ditangguhkan",
                  ) => setFormData({ ...formData, status: val })}
                  disabled={formMode === "tambah"}
                >
                  <SelectTrigger
                    id="status"
                    className="w-full rounded-xl h-10 disabled:bg-muted/50 disabled:opacity-80"
                  >
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Aktif">Aktif</SelectItem>
                    <SelectItem value="Mengundang">Mengundang</SelectItem>
                    <SelectItem value="Ditangguhkan">Ditangguhkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="mt-6 border-t pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl w-full sm:w-auto font-medium"
              >
                Batalkan
              </Button>
              <Button
                onClick={handleSimpan}
                className="rounded-xl shadow-md w-full sm:w-auto font-bold"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                {formMode === "tambah" ? "Kirim Undangan" : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==========================================
          ALERT DIALOG DELETE
      ========================================== */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="sm:rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-500">
              <AlertCircle className="w-5 h-5" /> Putus Akses Anggota Tim?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm mt-2">
              Tindakan ini akan mencabut seluruh hak akses dari pengguna ini.
              Sesi masuk mereka akan langsung kedaluwarsa seketika dan mereka
              tidak dapat lagi mengakses ruang kerja ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <AlertDialogCancel
              onClick={() => setIdYangDihapus(null)}
              className="rounded-xl w-full sm:w-auto mt-0"
            >
              Kembali
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={eksekusiHapus}
              className="bg-red-600 text-white hover:bg-red-700 rounded-xl shadow-md w-full sm:w-auto font-semibold"
            >
              Ya, Putus Akses
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
