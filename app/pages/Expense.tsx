import { useState, useMemo } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { cn } from "~/lib/utils";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  TrendingDown,
  Tag,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { toast } from "sonner";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "~/components/ui/command";

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

// IMPORT TIPE DATA DARI FOLDER TYPES YANG BARU
import { type Expense } from "~/types";

// IMPORT GLOBAL STORE & REUSABLE COMPONENTS
import { convertAndFormatCurrency } from "~/lib/currency";
import { useAppStore } from "~/store/useAppStore";
import { ConfirmDeleteModal } from "~/components/ui/confirm-delete-modal";
import { CustomPagination } from "~/components/ui/custom-pagination";

export default function ExpensePage() {
  // 1. AMBIL STATE DAN ACTIONS DARI GLOBAL STORE ZUSTAND
  const mataUang = useAppStore((state) => state.preferensi?.mataUang || "IDR");
  const { expenses, addExpense, updateExpense, deleteExpense } = useAppStore();

  const [kataKunci, setKataKunci] = useState("");
  const [filterKategori, setFilterKategori] = useState("Semua");
  const [halamanSaatIni, setHalamanSaatIni] = useState(1);
  const [itemPerHalaman, setItemPerHalaman] = useState(10);
  const [openComboboxKategori, setOpenComboboxKategori] = useState(false);
  const [openComboboxStatus, setOpenComboboxStatus] = useState(false);
  const [openFilterKategori, setOpenFilterKategori] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"tambah" | "edit">("tambah");
  const [formData, setFormData] = useState<Expense>({
    id: "",
    deskripsi: "",
    kategori: "Operasional",
    jumlah: 0,
    tanggal: new Date().toISOString().split("T")[0],
    status: "Dibayar", // Sesuai dengan UI Anda
  });

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [idYangDihapus, setIdYangDihapus] = useState<string | null>(null);

  // LOGIKA FILTER DAN KALKULASI MENGGUNAKAN DATA DARI ZUSTAND
  const { dataTersaring, totalPengeluaran, totalDibayar, totalPending } =
    useMemo(() => {
      const tersaring = expenses.filter((item) => {
        const cocokKataKunci = item.deskripsi
          .toLowerCase()
          .includes(kataKunci.toLowerCase());
        const cocokKategori =
          filterKategori === "Semua" || item.kategori === filterKategori;
        return cocokKataKunci && cocokKategori;
      });

      let pengeluaran = 0,
        dibayar = 0,
        pending = 0;

      // Jangan gunakan perbandingan yang bertabrakan
      expenses.forEach((e) => {
        const jumlahNum =
          typeof e.jumlah === "string" ? parseFloat(e.jumlah) : e.jumlah;
        pengeluaran += jumlahNum;

        // Gunakan kondisi yang menangani status yang benar
        if (e.status === "Dibayar" || e.status === "Lunas") {
          dibayar += jumlahNum;
        } else if (e.status === "Pending") {
          pending += jumlahNum;
        }
      });

      return {
        dataTersaring: tersaring,
        totalPengeluaran: pengeluaran,
        totalDibayar: dibayar,
        totalPending: pending,
      };
    }, [expenses, kataKunci, filterKategori]);

  const totalHalaman = Math.ceil(dataTersaring.length / itemPerHalaman);
  const indexAwal = (halamanSaatIni - 1) * itemPerHalaman;
  const dataTampil = dataTersaring.slice(indexAwal, indexAwal + itemPerHalaman);

  const bukaFormTambah = () => {
    setFormMode("tambah");
    setFormData({
      id: `EXP-${Date.now().toString().slice(-6)}`,
      deskripsi: "",
      kategori: "Operasional",
      jumlah: 0,
      tanggal: new Date().toISOString().split("T")[0],
      status: "Dibayar",
    });
    setIsDialogOpen(true);
  };

  const bukaFormEdit = (data: Expense) => {
    setFormMode("edit");
    setFormData(data);
    setIsDialogOpen(true);
  };

  // 2. FUNGSI SIMPAN MENGGUNAKAN ACTIONS ZUSTAND
  const handleSimpan = () => {
    if (
      !formData.deskripsi ||
      Number(formData.jumlah) <= 0 ||
      !formData.tanggal
    ) {
      toast.error("Mohon isi semua kolom formulir dengan benar!");
      return;
    }

    if (formMode === "tambah") {
      addExpense(formData);
      toast.success("Pengeluaran baru berhasil dicatat.");
    } else {
      updateExpense(formData.id, formData);
      toast.success("Catatan pengeluaran berhasil diperbarui.");
    }
    setIsDialogOpen(false);
  };

  // 3. FUNGSI HAPUS MENGGUNAKAN ACTIONS ZUSTAND
  const eksekusiHapus = () => {
    if (idYangDihapus) {
      deleteExpense(idYangDihapus);
      if (dataTampil.length === 1 && halamanSaatIni > 1) {
        setHalamanSaatIni(halamanSaatIni - 1);
      }
      toast.success("Catatan pengeluaran telah dihapus.");
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
          Modul Finansial Internal
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Expense Tracking
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Catat pengeluaran operasional dan biaya modal bisnis Anda untuk
          mendapatkan estimasi margin keuntungan bersih secara real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric Cards */}
        <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-xl w-fit mb-3">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold">
            {convertAndFormatCurrency(totalPengeluaran, mataUang)}
          </div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">
            Total Pengeluaran
          </div>
        </div>
        <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl w-fit mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold">
            {convertAndFormatCurrency(totalDibayar, mataUang)}
          </div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">
            Telah Terbayar
          </div>
        </div>
        <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl w-fit mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold">
            {convertAndFormatCurrency(totalPending, mataUang)}
          </div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">
            Tertunda (Pending)
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row justify-between gap-3 p-4 border rounded-2xl bg-card shadow-sm">
          <div className="flex flex-1 gap-3">
            <div className="relative md:max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari deskripsi pengeluaran..."
                value={kataKunci}
                onChange={(e) => {
                  setKataKunci(e.target.value);
                  setHalamanSaatIni(1);
                }}
                className="pl-9 rounded-xl w-full h-10"
              />
            </div>
            <Popover
              open={openFilterKategori}
              onOpenChange={setOpenFilterKategori}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openFilterKategori}
                  className="w-[180px] justify-between font-normal rounded-xl h-10 border-border/60 bg-background shadow-sm hover:border-primary/40 hover:bg-muted/20 transition-all"
                >
                  <span className="truncate">
                    {filterKategori === "Semua"
                      ? "Semua Kategori"
                      : filterKategori}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[180px] p-0 rounded-xl shadow-lg border-border/60"
                align="end"
              >
                <Command>
                  <CommandList>
                    <CommandEmpty>Kategori tidak ditemukan.</CommandEmpty>
                    <CommandGroup>
                      {[
                        { label: "Semua Kategori", value: "Semua" },
                        { label: "Operasional", value: "Operasional" },
                        { label: "Tools/Software", value: "Tools/Software" },
                        { label: "Pemasaran", value: "Pemasaran" },
                        { label: "Gaji/Upah", value: "Gaji/Upah" },
                      ].map((item) => (
                        <CommandItem
                          key={item.value}
                          onSelect={() => {
                            setFilterKategori(item.value);
                            setHalamanSaatIni(1);
                            setOpenFilterKategori(false);
                          }}
                          className="rounded-lg cursor-pointer my-0.5 font-medium"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 text-primary shrink-0",
                              filterKategori === item.value
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <span className="truncate">{item.label}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <Button
            onClick={bukaFormTambah}
            className="rounded-xl gap-2 shadow-sm cursor-pointer h-10 font-semibold"
          >
            <Plus className="w-4 h-4" /> Catat Pengeluaran
          </Button>
        </div>

        <div className="border rounded-2xl bg-card shadow-sm overflow-hidden overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>ID / Deskripsi</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">
                  Jumlah ({mataUang})
                </TableHead>
                <TableHead className="text-center w-32">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataTampil.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-muted-foreground"
                  >
                    Tidak ada data pengeluaran ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                dataTampil.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <TableCell>
                      <div>
                        <div className="font-bold">{item.deskripsi}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">
                        <Tag className="w-3 h-3" /> {item.kategori}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm flex items-center gap-1.5 text-muted-foreground">
                        <CalendarIcon className="w-3.5 h-3.5" /> {item.tanggal}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div
                        className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border",
                          item.status === "Dibayar" || item.status === "Dibayar"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                            : item.status === "Pending"
                              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                              : "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
                        )}
                      >
                        {item.status}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {convertAndFormatCurrency(Number(item.jumlah), mataUang)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => bukaFormEdit(item)}
                          className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setIdYangDihapus(item.id);
                            setIsDeleteOpen(true);
                          }}
                          className="h-8 w-8 text-red-600 hover:bg-red-50"
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
              {formMode === "tambah"
                ? "Catat Biaya Baru"
                : "Edit Catatan Biaya"}
            </DialogTitle>
            <DialogDescription>
              Isi formulir di bawah ini untuk mengelola riwayat pengeluaran kas
              operasional bisnis Anda.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4 overflow-y-auto custom-scrollbar flex flex-col gap-5">
            <div className="grid gap-2">
              <Label className="font-semibold">Deskripsi Pengeluaran</Label>
              <Input
                placeholder="Contoh: Pembelian lisensi software / Makan siang..."
                value={formData.deskripsi}
                onChange={(e) =>
                  setFormData({ ...formData, deskripsi: e.target.value })
                }
                className="rounded-xl h-10 border-border/50"
              />
            </div>

            {/* KATEGORI & STATUS PENGELUARAN */}
            <div className="grid md:grid-cols-2 gap-5">
              <div className="grid gap-2">
                <Label className="font-semibold text-foreground/90">
                  Kategori
                </Label>
                <Popover
                  open={openComboboxKategori}
                  onOpenChange={setOpenComboboxKategori}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openComboboxKategori}
                      className="w-full justify-between font-normal rounded-xl h-10 border-border/60 bg-background shadow-sm hover:border-primary/40 hover:bg-muted/20 transition-all"
                    >
                      {formData.kategori || (
                        <span className="text-muted-foreground">
                          Pilih kategori...
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
                        <CommandEmpty>Kategori tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {[
                            { label: "Operasional", value: "Operasional" },
                            { label: "Tools", value: "Tools/Software" },
                            { label: "Pemasaran", value: "Pemasaran" },
                            { label: "Gaji", value: "Gaji/Upah" },
                          ].map((item) => (
                            <CommandItem
                              key={item.value}
                              onSelect={() => {
                                setFormData({
                                  ...formData,
                                  kategori: item.value,
                                });
                                setOpenComboboxKategori(false);
                              }}
                              className="rounded-lg cursor-pointer my-0.5 font-medium"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 text-primary",
                                  formData.kategori === item.value
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

              <div className="grid gap-2">
                <Label className="font-semibold text-foreground/90">
                  Status
                </Label>
                <Popover
                  open={openComboboxStatus}
                  onOpenChange={setOpenComboboxStatus}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openComboboxStatus}
                      className="w-full justify-between font-normal rounded-xl h-10 border-border/60 bg-background shadow-sm hover:border-primary/40 hover:bg-muted/20 transition-all"
                    >
                      {formData.status || (
                        <span className="text-muted-foreground">
                          Pilih status...
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
                          {["Dibayar", "Pending"].map((status) => (
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
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="font-semibold">Jumlah Biaya</Label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-sm font-bold text-muted-foreground/70">
                  Rp
                </div>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.jumlah || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      jumlah: Number(e.target.value),
                    })
                  }
                  className="rounded-xl pl-10 h-10 font-bold font-mono text-base border-border/50"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="font-semibold">Tanggal</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal rounded-xl h-10 border-border/50",
                      !formData.tanggal && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.tanggal ? (
                      format(new Date(formData.tanggal), "PPP", { locale: id })
                    ) : (
                      <span>Pilih tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      formData.tanggal ? new Date(formData.tanggal) : undefined
                    }
                    onSelect={(d) => {
                      if (d) {
                        const y = d.getFullYear();
                        const m = String(d.getMonth() + 1).padStart(2, "0");
                        const day = String(d.getDate()).padStart(2, "0");
                        setFormData({
                          ...formData,
                          tanggal: `${y}-${m}-${day}`,
                        });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter className="px-6 pt-4 pb-8 border-t border-border/50 bg-muted/10 shrink-0">
            <Button
              variant="ghost"
              onClick={() => setIsDialogOpen(false)}
              className="rounded-xl font-medium h-10"
            >
              Batal
            </Button>
            <Button
              onClick={handleSimpan}
              className="rounded-xl shadow-md font-bold h-10"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* IMPLEMENTASI CONFIRM DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setIdYangDihapus(null);
        }}
        onConfirm={eksekusiHapus}
        title="Hapus Catatan Pengeluaran?"
        description="Tindakan ini permanen. Riwayat pengeluaran yang dihapus tidak akan dapat dihitung kembali dalam kalkulasi rugi-laba tahunan."
      />
    </div>
  );
}
