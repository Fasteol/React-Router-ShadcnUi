import { useState, useMemo } from "react";
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
  CheckCircle2,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { toast } from "sonner";

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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

import { useAppStore } from "~/store/useAppStore";
import { ConfirmDeleteModal } from "~/components/ui/confirm-delete-modal";
import { CustomPagination } from "~/components/ui/custom-pagination";
import { cn } from "~/lib/utils";

// Import tipe data
import type { TeamMember } from "~/types/index";

export default function UserManagementPage() {
  // Mengambil state dan actions dari Global Store Zustand
  const { team, addTeamMember, updateTeamMember, deleteTeamMember } =
    useAppStore();

  const [kataKunci, setKataKunci] = useState("");
  const [halamanSaatIni, setHalamanSaatIni] = useState(1);
  const [itemPerHalaman, setItemPerHalaman] = useState(10);
  const [openComboboxRole, setOpenComboboxRole] = useState(false);
  const [openComboboxStatus, setOpenComboboxStatus] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"tambah" | "edit">("tambah");
  const [formData, setFormData] = useState<TeamMember>({
    id: "",
    nama: "",
    email: "",
    role: "Viewer",
    status: "Mengundang",
  });

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [idYangDihapus, setIdYangDihapus] = useState<string | null>(null);

  const { dataTersaring, totalAnggota, totalAdmin, totalFinance } =
    useMemo(() => {
      const tersaring = team.filter(
        (user) =>
          user.nama?.toLowerCase().includes(kataKunci.toLowerCase()) ||
          user.email.toLowerCase().includes(kataKunci.toLowerCase()),
      );
      return {
        dataTersaring: tersaring,
        totalAnggota: team.length,
        totalAdmin: team.filter((t) => t.role === "Admin").length,
        totalFinance: team.filter((t) => t.role === "Finance").length,
      };
    }, [team, kataKunci]);

  const totalHalaman = Math.ceil(dataTersaring.length / itemPerHalaman);
  const dataTampil = dataTersaring.slice(
    (halamanSaatIni - 1) * itemPerHalaman,
    halamanSaatIni * itemPerHalaman,
  );

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
    if (!formData.nama || !formData.email)
      return toast.error("Gagal! Nama dan email wajib diisi.");

    // Pastikan ID tidak undefined
    const targetId =
      formData.id || `USR-${String(team.length + 1).padStart(2, "0")}`;

    if (formMode === "tambah") {
      const payload: TeamMember = { ...formData, id: targetId };
      addTeamMember(payload);
      toast.success(`Undangan telah dikirim ke ${formData.email}`);
    } else {
      updateTeamMember(targetId, formData);
      toast.success("Akses berhasil diperbarui.");
    }
    setIsDialogOpen(false);
  };

  const eksekusiHapus = () => {
    if (idYangDihapus) {
      deleteTeamMember(idYangDihapus);
      if (dataTampil.length === 1 && halamanSaatIni > 1)
        setHalamanSaatIni(halamanSaatIni - 1);
      toast.success("Akses pengguna telah dicabut.");
    }
    setIsDeleteOpen(false);
    setIdYangDihapus(null);
  };

  return (
    <div className="max-w-6xl py-8 mx-auto font-sans flex flex-col gap-10 px-4 xl:px-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 p-5 border rounded-2xl bg-card shadow-sm">
          <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">{totalAnggota} Anggota</div>
            <div className="text-xs text-muted-foreground mt-0.5 font-medium">
              Terdaftar
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 border rounded-2xl bg-card shadow-sm">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">{totalAdmin} Administrator</div>
            <div className="text-xs text-muted-foreground mt-0.5 font-medium">
              Akses Penuh
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 border rounded-2xl bg-card shadow-sm">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">
              {totalFinance} Finansial Staf
            </div>
            <div className="text-xs text-muted-foreground mt-0.5 font-medium">
              Modul Transaksi
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row justify-between gap-3 p-4 border rounded-2xl bg-card shadow-sm">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau email tim..."
              value={kataKunci}
              onChange={(e) => {
                setKataKunci(e.target.value);
                setHalamanSaatIni(1);
              }}
              className="pl-9 rounded-xl w-full h-10 border-border/50"
            />
          </div>
          <Button
            onClick={bukaFormTambah}
            className="rounded-xl gap-2 shadow-sm cursor-pointer font-semibold h-10"
          >
            <Plus className="w-4 h-4" /> Undang Anggota
          </Button>
        </div>

        <div className="border rounded-2xl bg-card shadow-sm overflow-hidden overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Nama Pengguna</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center w-32">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataTampil.map((user) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-muted/40 transition-colors"
                >
                  <TableCell className="font-bold">
                    {user.nama || user.name}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="w-3.5 h-3.5" /> {user.email}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">
                      <Shield className="w-3 h-3" /> {user.role}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border",
                        user.status === "Aktif"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                          : user.status === "Mengundang"
                            ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                            : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
                      )}
                    >
                      {user.status}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => bukaFormEdit(user)}
                        className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (user.id) setIdYangDihapus(user.id);
                          setIsDeleteOpen(true);
                        }}
                        className="h-8 w-8 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <CustomPagination
          halamanSaatIni={halamanSaatIni}
          setHalamanSaatIni={setHalamanSaatIni}
          totalHalaman={totalHalaman}
          itemPerHalaman={itemPerHalaman}
          setItemPerHalaman={setItemPerHalaman}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] sm:rounded-[1.5rem] p-0 overflow-hidden border border-border/50 shadow-2xl flex flex-col max-h-[90vh]">
          <div className="h-2 w-full bg-gradient-to-r from-primary to-primary/60 shrink-0"></div>

          <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
            <DialogTitle className="text-2xl font-bold tracking-tight">
              {formMode === "tambah" ? "Undang Rekan Tim" : "Ubah Akses Tim"}
            </DialogTitle>
            <DialogDescription>
              Tentukan batasan informasi (Role) yang bisa diakses pengguna saat
              ia masuk.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4 overflow-y-auto custom-scrollbar flex flex-col gap-5">
            <div className="grid gap-2">
              <Label className="font-semibold">Nama Lengkap</Label>
              <Input
                placeholder="Masukkan nama pengguna..."
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                className="rounded-xl h-10 border-border/50"
              />
            </div>
            <div className="grid gap-2">
              <Label className="font-semibold">Email Kerja</Label>
              <Input
                type="email"
                placeholder="rekan@perusahaan.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="rounded-xl h-10 border-border/50"
                disabled={formMode === "edit"}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="grid gap-2">
                <Label className="font-semibold text-foreground/90">
                  Peran (Role)
                </Label>
                <Popover
                  open={openComboboxRole}
                  onOpenChange={setOpenComboboxRole}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openComboboxRole}
                      className="w-full justify-between font-normal rounded-xl h-10 border-border/60 bg-background shadow-sm hover:border-primary/40 hover:bg-muted/20 transition-all"
                    >
                      {formData.role || (
                        <span className="text-muted-foreground">
                          Pilih Peran
                        </span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl shadow-lg border-border/60"
                    align="start"
                  >
                    <Command>
                      <CommandList>
                        <CommandEmpty>Peran tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {["Admin", "Finance", "Viewer"].map((role) => (
                            <CommandItem
                              key={role}
                              onSelect={() => {
                                setFormData({ ...formData, role: role as any });
                                setOpenComboboxRole(false);
                              }}
                              className="rounded-lg cursor-pointer my-0.5 font-medium"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 text-primary",
                                  formData.role === role
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {role}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label className="font-semibold text-foreground/90">
                  Status Pengguna
                </Label>
                <Popover
                  open={openComboboxStatus}
                  onOpenChange={setOpenComboboxStatus}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      disabled={formMode === "tambah"}
                      aria-expanded={openComboboxStatus}
                      className="w-full justify-between font-normal rounded-xl h-10 border-border/60 bg-background shadow-sm hover:border-primary/40 hover:bg-muted/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {formData.status || (
                        <span className="text-muted-foreground">
                          Status Aktivasi
                        </span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl shadow-lg border-border/60"
                    align="start"
                  >
                    <Command>
                      <CommandList>
                        <CommandEmpty>Status tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {["Aktif", "Mengundang", "Ditangguhkan"].map(
                            (status) => (
                              <CommandItem
                                key={status}
                                onSelect={() => {
                                  setFormData({
                                    ...formData,
                                    status: status as any,
                                  });
                                  setOpenComboboxStatus(false);
                                }}
                                className="rounded-lg cursor-pointer my-0.5 font-medium"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4 text-primary",
                                    formData.status === status
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {status}
                              </CommandItem>
                            ),
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 pt-4 pb-8 border-t border-border/50 bg-muted/10 shrink-0">
            <Button
              variant="ghost"
              onClick={() => setIsDialogOpen(false)}
              className="rounded-xl font-medium h-10"
            >
              Batalkan
            </Button>
            <Button
              onClick={handleSimpan}
              className="rounded-xl shadow-md font-bold h-10"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Simpan Akses
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setIdYangDihapus(null);
        }}
        onConfirm={eksekusiHapus}
        title="Putus Akses Anggota Tim?"
        description="Tindakan ini akan mencabut seluruh hak akses pengguna. Sesi mereka akan segera berakhir dan tidak dapat lagi mengakses sistem."
      />
    </div>
  );
}
