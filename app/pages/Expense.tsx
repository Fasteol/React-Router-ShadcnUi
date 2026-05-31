import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  TrendingDown,
  Tag,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

// IMPORT DATA DARI INVOICES.TS
import { type Expense, dataAwalExpense } from "~/data/invoices";

// IMPORT SHADCN UI
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

// ==========================================
// KONFIGURASI KONVERSI MATA UANG
// ==========================================
const EXCHANGE_RATE_USD = 16000;

const formatCurrency = (angka: number, currencyCode: string) => {
  const locale = currencyCode === "USD" ? "en-US" : "id-ID";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: currencyCode === "USD" ? 2 : 0,
    maximumFractionDigits: currencyCode === "USD" ? 2 : 0,
  }).format(angka);
};

export default function ExpensePage() {
  const [expenses, setExpenses] = useState<Expense[]>(dataAwalExpense);
  const [kataKunci, setKataKunci] = useState("");
  const [filterKategori, setFilterKategori] = useState("Semua");
  const [mataUang, setMataUang] = useState("IDR");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"tambah" | "edit">("tambah");
  const [formData, setFormData] = useState<Expense>({
    id: "",
    deskripsi: "",
    kategori: "Operasional",
    jumlah: 0,
    tanggal: new Date().toISOString().split("T")[0],
    status: "Dibayar",
  });

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [idYangDihapus, setIdYangDihapus] = useState<string | null>(null);

  // MENGAMBIL PREFERENSI MATA UANG
  useEffect(() => {
    const savedSettings = localStorage.getItem("adminSettings");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      if (parsed?.preferensi?.mataUang) {
        setMataUang(parsed.preferensi.mataUang);
      }
    }
  }, []);

  // FUNGSI KONVERSI DINAMIS
  const convertAndFormat = (rawIdr: number) => {
    const finalValue = mataUang === "USD" ? rawIdr / EXCHANGE_RATE_USD : rawIdr;
    return formatCurrency(finalValue, mataUang);
  };

  // FILTERING DATA
  const dataTersaring = useMemo(() => {
    return expenses.filter((item) => {
      const cocokKataKunci = item.deskripsi
        .toLowerCase()
        .includes(kataKunci.toLowerCase());
      const cocokKategori =
        filterKategori === "Semua" || item.kategori === filterKategori;
      return cocokKataKunci && cocokKategori;
    });
  }, [expenses, kataKunci, filterKategori]);

  // HITUNG TOTAL METRIK
  const totalPengeluaran = expenses.reduce((acc, curr) => acc + curr.jumlah, 0);
  const totalDibayar = expenses
    .filter((e) => e.status === "Dibayar")
    .reduce((acc, curr) => acc + curr.jumlah, 0);
  const totalPending = expenses
    .filter((e) => e.status === "Pending")
    .reduce((acc, curr) => acc + curr.jumlah, 0);

  const bukaFormTambah = () => {
    setFormMode("tambah");
    setFormData({
      id: `EXP-${String(expenses.length + 1).padStart(3, "0")}`,
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

  const handleSimpan = () => {
    if (!formData.deskripsi || formData.jumlah <= 0 || !formData.tanggal) {
      toast.error("Mohon isi semua kolom formulir dengan benar!");
      return;
    }

    if (formMode === "tambah") {
      setExpenses([formData, ...expenses]);
      toast.success("Pengeluaran baru berhasil dicatat.");
    } else {
      setExpenses(expenses.map((e) => (e.id === formData.id ? formData : e)));
      toast.success("Catatan pengeluaran berhasil diperbarui.");
    }
    setIsDialogOpen(false);
  };

  const konfirmasiHapus = (id: string) => {
    setIdYangDihapus(id);
    setIsDeleteOpen(true);
  };

  const eksekusiHapus = () => {
    if (idYangDihapus) {
      setExpenses(expenses.filter((e) => e.id !== idYangDihapus));
      toast.success("Catatan pengeluaran telah dihapus.");
    }
    setIsDeleteOpen(false);
  };

  return (
    <div className="max-w-6xl py-8 mx-auto font-sans flex flex-col gap-10 px-4 xl:px-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER SECTION */}
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

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-xl w-fit mb-3">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold text-foreground">
            {convertAndFormat(totalPengeluaran)}
          </div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">
            Total Akumulasi Pengeluaran
          </div>
        </div>
        <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl w-fit mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold text-foreground">
            {convertAndFormat(totalDibayar)}
          </div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">
            Telah Terbayar (Lunas)
          </div>
        </div>
        <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl w-fit mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold text-foreground">
            {convertAndFormat(totalPending)}
          </div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">
            Tagihan Tertunda (Pending)
          </div>
        </div>
      </div>

      {/* FILTERS AND TABLE */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 border rounded-2xl bg-card shadow-sm">
          <div className="flex flex-1 flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative md:max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari deskripsi pengeluaran..."
                value={kataKunci}
                onChange={(e) => setKataKunci(e.target.value)}
                className="pl-9 rounded-xl w-full"
              />
            </div>
            <Select value={filterKategori} onValueChange={setFilterKategori}>
              <SelectTrigger className="w-full sm:w-[180px] rounded-xl">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="Semua">Semua Kategori</SelectItem>
                <SelectItem value="Operasional">Operasional</SelectItem>
                <SelectItem value="Tools/Software">Tools/Software</SelectItem>
                <SelectItem value="Pemasaran">Pemasaran</SelectItem>
                <SelectItem value="Gaji/Upah">Gaji/Upah</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={bukaFormTambah}
            className="rounded-xl shrink-0 gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Catat Pengeluaran
          </Button>
        </div>

        {/* DATA TABLE WRAPPER */}
        <div className="border rounded-2xl bg-card shadow-sm overflow-hidden overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-semibold">ID / Deskripsi</TableHead>
                <TableHead className="font-semibold">Kategori</TableHead>
                <TableHead className="font-semibold">Tanggal</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">
                  Jumlah ({mataUang})
                </TableHead>
                <TableHead className="text-center w-32 font-semibold">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataTersaring.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center h-32 text-muted-foreground"
                  >
                    Belum ada pengeluaran yang tercatat.
                  </TableCell>
                </TableRow>
              ) : (
                dataTersaring.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <TableCell>
                      <div>
                        <div className="font-bold text-foreground">
                          {item.deskripsi}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {item.id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
                        <Tag className="w-3.5 h-3.5 text-primary" />{" "}
                        {item.kategori}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" /> {item.tanggal}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          item.status === "Dibayar"
                            ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:text-emerald-400 border-0 font-semibold shadow-none"
                            : "bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 dark:text-amber-400 border-0 font-semibold shadow-none"
                        }
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-foreground">
                      {convertAndFormat(item.jumlah)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => bukaFormEdit(item)}
                          className="h-8 w-8 text-blue-600 rounded-lg hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => konfirmasiHapus(item.id)}
                          className="h-8 w-8 text-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
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
      </div>

      {/* DIALOG FORM */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px] sm:rounded-2xl p-0 overflow-hidden border-0 shadow-xl">
          <div className="h-2 w-full bg-gradient-to-r from-primary to-primary/60"></div>
          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-bold">
                {formMode === "tambah"
                  ? "Catat Biaya Baru"
                  : "Edit Catatan Biaya"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                Pastikan data pengeluaran diisi secara akurat untuk integrasi
                laporan keuangan.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 py-2">
              <div className="grid gap-2">
                <Label htmlFor="deskripsi" className="font-semibold">
                  Deskripsi Pengeluaran
                </Label>
                <Input
                  id="deskripsi"
                  placeholder="Contoh: Langganan Server Hosting"
                  value={formData.deskripsi}
                  onChange={(e) =>
                    setFormData({ ...formData, deskripsi: e.target.value })
                  }
                  className="rounded-xl h-10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="kategori" className="font-semibold">
                    Kategori
                  </Label>
                  <Select
                    value={formData.kategori}
                    onValueChange={(val) =>
                      setFormData({ ...formData, kategori: val })
                    }
                  >
                    <SelectTrigger id="kategori" className="rounded-xl h-10">
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Operasional">Operasional</SelectItem>
                      <SelectItem value="Tools/Software">
                        Tools/Software
                      </SelectItem>
                      <SelectItem value="Pemasaran">Pemasaran</SelectItem>
                      <SelectItem value="Gaji/Upah">Gaji/Upah</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status" className="font-semibold">
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) =>
                      setFormData({
                        ...formData,
                        status: val as "Dibayar" | "Pending",
                      })
                    }
                  >
                    <SelectTrigger id="status" className="rounded-xl h-10">
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Dibayar">Dibayar</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="jumlah" className="font-semibold">
                  Jumlah Biaya (Mata Uang Dasar: IDR)
                </Label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-sm font-bold text-muted-foreground/70 pointer-events-none select-none">
                    Rp
                  </div>
                  <Input
                    id="jumlah"
                    type="number"
                    placeholder="0"
                    value={formData.jumlah || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        jumlah: Number(e.target.value),
                      })
                    }
                    className="rounded-xl pl-10 pr-4 h-10 font-bold font-mono text-base"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground/80 pl-1 leading-relaxed mt-0.5">
                  * Masukkan angka murni tanpa pemisah. Nilai akan otomatis
                  terkonversi menjadi{" "}
                  <span className="font-bold text-foreground">{mataUang}</span>{" "}
                  di tabel berdasarkan pengaturan Anda.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tanggal" className="font-semibold">
                  Tanggal
                </Label>
                <Input
                  id="tanggal"
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) =>
                    setFormData({ ...formData, tanggal: e.target.value })
                  }
                  className="rounded-xl h-10"
                />
              </div>
            </div>

            <DialogFooter className="mt-6 border-t pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl w-full sm:w-auto font-medium"
              >
                Batal
              </Button>
              <Button
                onClick={handleSimpan}
                className="rounded-xl shadow-md w-full sm:w-auto font-bold"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Simpan Catatan
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ALERT DELETE */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="sm:rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" /> Hapus Catatan Pengeluaran?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini permanen. Riwayat pengeluaran yang dihapus tidak akan
              dapat dihitung kembali dalam kalkulasi rugi-laba tahunan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <AlertDialogCancel className="rounded-xl w-full sm:w-auto mt-0">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={eksekusiHapus}
              className="bg-red-600 text-white hover:bg-red-700 rounded-xl w-full sm:w-auto"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
