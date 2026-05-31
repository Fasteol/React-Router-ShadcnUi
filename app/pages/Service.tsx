import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Package,
  TrendingUp,
  Star,
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Check,
} from "lucide-react";
import { cn } from "~/lib/utils";

// IMPORT DATA DARI INVOICES.TS
import { dataLayanan, type Service } from "~/data/invoices";

// IMPORT KOMPONEN UI SHADCN
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
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

// ==========================================
// FUNGSI GENERATOR ID LAYANAN OTOMATIS
// ==========================================
const generateServiceID = (dataServices: Service[]) => {
  const prefix = "S";

  if (dataServices.length === 0) return `${prefix}001`;

  const urutanTerakhir = dataServices.map((item) => {
    const bagianAngka = item.id.replace(prefix, "");
    return parseInt(bagianAngka, 10) || 0;
  });

  const nextUrutan = Math.max(...urutanTerakhir) + 1;
  const formatUrutan = String(nextUrutan).padStart(3, "0");

  return `${prefix}${formatUrutan}`;
};

// ==========================================
// KOMPONEN UTAMA
// ==========================================
export default function ServicesPage() {
  const navigate = useNavigate();

  // ==========================================
  // STATE MATA UANG (DINAMIS DARI SETTING)
  // ==========================================
  const [mataUang, setMataUang] = useState("IDR");

  useEffect(() => {
    const savedSettings = localStorage.getItem("adminSettings");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      if (parsed?.preferensi?.mataUang) {
        setMataUang(parsed.preferensi.mataUang);
      }
    }
  }, []);

  // Fungsi utilitas untuk konversi format sesuai mata uang yang aktif
  const convertAndFormat = (rawIdr: number) => {
    const finalValue = mataUang === "USD" ? rawIdr / EXCHANGE_RATE_USD : rawIdr;
    return formatCurrency(finalValue, mataUang);
  };

  const [services, setServices] = useState<Service[]>(dataLayanan);
  const [kataKunci, setKataKunci] = useState("");
  const [halamanSaatIni, setHalamanSaatIni] = useState(1);
  const [itemPerHalaman, setItemPerHalaman] = useState(10);

  // STATE UNTUK DIALOG & FORM
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"tambah" | "edit">("tambah");

  // State khusus untuk visual input ("Rp ..." atau "$ ...")
  const [inputHarga, setInputHarga] = useState("Rp ");
  const [formData, setFormData] = useState<Service>({
    id: "",
    nama: "",
    deskripsi: "",
    harga: 0, // Disimpan sebagai nilai raw IDR
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [idYangDihapus, setIdYangDihapus] = useState<string | null>(null);

  // LOGIKA FILTER & PENCARIAN DATA
  const dataTersaring = services.filter((item) => {
    return (
      item.nama.toLowerCase().includes(kataKunci.toLowerCase()) ||
      item.deskripsi.toLowerCase().includes(kataKunci.toLowerCase()) ||
      item.id.toLowerCase().includes(kataKunci.toLowerCase())
    );
  });

  // STATISTIK OVERVIEW
  const totalLayanan = services.length;
  const rataRataHarga =
    totalLayanan > 0
      ? services.reduce((acc, curr) => acc + curr.harga, 0) / totalLayanan
      : 0;
  const layananPremium = services.filter((s) => s.harga >= 3000000).length;

  // LOGIKA PAGINASI
  const totalHalaman = Math.ceil(dataTersaring.length / itemPerHalaman);
  const indexAwal = (halamanSaatIni - 1) * itemPerHalaman;
  const indexAkhir = indexAwal + itemPerHalaman;
  const dataTampil = dataTersaring.slice(indexAwal, indexAkhir);

  // ==========================================
  // FUNGSI AKSI (TAMBAH, EDIT, HAPUS)
  // ==========================================
  const bukaFormTambah = () => {
    const idOtomatis = generateServiceID(services);

    setFormMode("tambah");
    setFormData({
      id: idOtomatis,
      nama: "",
      deskripsi: "",
      harga: 0,
    });
    // Set prefix dinamis
    setInputHarga(mataUang === "USD" ? "$ " : "Rp ");
    setIsDialogOpen(true);
  };

  const bukaFormEdit = (dataAsli: Service) => {
    setFormMode("edit");
    setFormData(dataAsli);

    // Format input visual menyesuaikan mata uang
    if (mataUang === "USD") {
      const usdValue = dataAsli.harga / EXCHANGE_RATE_USD;
      setInputHarga(`$ ${usdValue}`);
    } else {
      setInputHarga(`Rp ${dataAsli.harga.toLocaleString("id-ID")}`);
    }

    setIsDialogOpen(true);
  };

  const handleSimpan = () => {
    if (
      !formData.nama ||
      !formData.deskripsi ||
      formData.harga === 0 ||
      inputHarga.trim() === "$" ||
      inputHarga.trim() === "Rp"
    ) {
      toast.error(
        "Gagal! Pastikan nama, deskripsi, dan harga diisi dengan benar.",
      );
      return;
    }

    if (formMode === "tambah") {
      const isExist = services.some((item) => item.id === formData.id);
      if (isExist) {
        toast.error(`Gagal! ID Layanan ${formData.id} sudah digunakan.`);
        return;
      }
      setServices([formData, ...services]);
      toast.success(`Berhasil menambahkan layanan ${formData.nama}!`);
    } else {
      const dataBaru = services.map((item) =>
        item.id === formData.id ? formData : item,
      );
      setServices(dataBaru);
      toast.success(`Berhasil memperbarui layanan ${formData.nama}!`);
    }

    setIsDialogOpen(false);
  };

  const konfirmasiHapus = (idLayanan: string) => {
    setIdYangDihapus(idLayanan);
    setIsDeleteDialogOpen(true);
  };

  const eksekusiHapus = () => {
    if (idYangDihapus) {
      const dataBaru = services.filter((item) => item.id !== idYangDihapus);
      setServices(dataBaru);

      if (dataTampil.length === 1 && halamanSaatIni > 1) {
        setHalamanSaatIni(halamanSaatIni - 1);
      }
      toast.success(`Layanan ${idYangDihapus} berhasil dihapus.`);
    }
    setIsDeleteDialogOpen(false);
    setIdYangDihapus(null);
  };

  // ==========================================
  // HANDLER FORMAT HARGA DINAMIS (IDR / USD)
  // ==========================================
  const handleUbahHarga = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawString = e.target.value;

    if (mataUang === "USD") {
      // Mengizinkan angka dan satu titik desimal untuk USD
      let sanitized = rawString.replace(/[^0-9.]/g, "");
      const parts = sanitized.split(".");
      if (parts.length > 2) {
        sanitized = parts[0] + "." + parts.slice(1).join("");
      }

      if (sanitized === "") {
        setInputHarga("$ ");
        setFormData({ ...formData, harga: 0 });
      } else {
        setInputHarga(`$ ${sanitized}`);
        const parsedUsd = parseFloat(sanitized) || 0;
        // Konversi input USD kembali ke base IDR untuk disimpan
        setFormData({ ...formData, harga: parsedUsd * EXCHANGE_RATE_USD });
      }
    } else {
      // Hanya mengizinkan angka bulat untuk IDR
      const angkaSaja = rawString.replace(/[^0-9]/g, "");

      if (angkaSaja === "") {
        setInputHarga("Rp ");
        setFormData({ ...formData, harga: 0 });
      } else {
        const parsedNumber = parseInt(angkaSaja, 10);
        const formatRupiah = parsedNumber.toLocaleString("id-ID");
        setInputHarga(`Rp ${formatRupiah}`);
        setFormData({ ...formData, harga: parsedNumber });
      }
    }
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
      {/* ==========================================
          HEADER SECTION
      ========================================== */}
      <div className="flex flex-col items-start space-y-3 mt-2">
        <Badge
          variant="secondary"
          className="px-3 py-1 text-xs font-medium dark:bg-muted/50 border shadow-sm rounded-md"
        >
          Katalog Layanan & Produk
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Daftar Layanan
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Kelola inventaris dan katalog layanan yang ditawarkan ke klien Anda.
          Data ini akan terintegrasi langsung saat pembuatan invoice baru.
        </p>
      </div>

      {/* ==========================================
          OVERVIEW CARDS (METRIK)
      ========================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card: Total Layanan */}
        <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0 w-fit mb-3">
            <Package className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold text-foreground">
            {totalLayanan}
          </div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">
            Keseluruhan Layanan Aktif
          </div>
        </div>

        {/* Card: Rata-rata Harga (Dinamis) */}
        <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0 w-fit mb-3">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div
            className="text-2xl font-bold text-foreground truncate"
            title={convertAndFormat(rataRataHarga)}
          >
            {convertAndFormat(rataRataHarga)}
          </div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">
            Rata-rata Harga Pasar
          </div>
        </div>

        {/* Card: Layanan Premium (Dinamis) */}
        <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl shrink-0 w-fit mb-3">
            <Star className="w-6 h-6" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {layananPremium}
          </div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">
            Layanan Premium (≥ {convertAndFormat(3000000)})
          </div>
        </div>
      </div>

      {/* ==========================================
          MAIN CONTENT AREA (FILTER & TABEL)
      ========================================== */}
      <div className="flex flex-col gap-5">
        {/* FILTER BAR SECTION */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 border rounded-2xl bg-card shadow-sm">
          <div className="relative flex-1 md:max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari ID, nama, atau deskripsi layanan..."
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
            className="cursor-pointer rounded-xl shrink-0 gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Tambah Layanan
          </Button>
        </div>

        {/* TABEL DATA */}
        <div className="border rounded-2xl bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-24 font-semibold">ID</TableHead>
                <TableHead className="w-1/3 font-semibold">
                  Nama Layanan
                </TableHead>
                <TableHead className="font-semibold">Deskripsi</TableHead>
                <TableHead className="text-right font-semibold">
                  Harga ({mataUang})
                </TableHead>
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
                    Tidak ada data layanan ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                dataTampil.map((layanan) => (
                  <TableRow
                    key={layanan.id}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <TableCell className="font-semibold text-muted-foreground">
                      {layanan.id}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-foreground">
                        {layanan.nama}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p
                        className="text-muted-foreground text-sm truncate max-w-[250px]"
                        title={layanan.deskripsi}
                      >
                        {layanan.deskripsi}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* Tampilan nilai uang format dinamis di Tabel */}
                      <div className="font-bold text-foreground bg-muted/50 px-3 py-1 rounded-md w-fit ml-auto">
                        {convertAndFormat(layanan.harga)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => bukaFormEdit(layanan)}
                          className="h-8 w-8 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-950"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => konfirmasiHapus(layanan.id)}
                          className="h-8 w-8 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-950"
                          title="Hapus"
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

        {/* BOTTOM PAGINATION & LIMIT DATA CONTROLLER */}
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
        <DialogContent className="sm:max-w-[480px] sm:rounded-2xl p-0 overflow-hidden border-0 shadow-xl">
          <div className="h-2 w-full bg-gradient-to-r from-primary to-primary/60"></div>
          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-bold">
                {formMode === "tambah"
                  ? "Tambah Layanan Baru"
                  : "Ubah Data Layanan"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {formMode === "tambah"
                  ? "Masukkan detail informasi untuk layanan atau produk baru."
                  : "Sesuaikan kembali informasi detail layanan yang sudah ada."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 py-2">
              {/* ID LAYANAN */}
              <div className="grid gap-2">
                <Label
                  htmlFor="id"
                  className="font-semibold text-muted-foreground"
                >
                  ID Layanan
                </Label>
                <Input
                  id="id"
                  value={formData.id}
                  disabled
                  className="rounded-xl bg-muted/50 font-bold"
                />
              </div>

              {/* NAMA LAYANAN */}
              <div className="grid gap-2">
                <Label htmlFor="nama" className="font-semibold">
                  Nama Layanan / Produk
                </Label>
                <Input
                  id="nama"
                  placeholder="Cth: Jasa Desain UI/UX"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>

              {/* DESKRIPSI LAYANAN */}
              <div className="grid gap-2">
                <Label htmlFor="deskripsi" className="font-semibold">
                  Deskripsi Lengkap
                </Label>
                <Textarea
                  id="deskripsi"
                  placeholder="Jelaskan spesifikasi detail mengenai layanan yang ditawarkan..."
                  value={formData.deskripsi}
                  onChange={(e) =>
                    setFormData({ ...formData, deskripsi: e.target.value })
                  }
                  className="rounded-xl min-h-[100px] resize-none"
                />
              </div>

              {/* HARGA LAYANAN (Dinamis Berdasarkan Mata Uang) */}
              <div className="grid gap-2">
                <Label htmlFor="harga" className="font-semibold">
                  Harga Patokan ({mataUang})
                </Label>
                <Input
                  id="harga"
                  placeholder={mataUang === "USD" ? "$ 0" : "Rp 0"}
                  value={inputHarga}
                  onChange={handleUbahHarga}
                  className="font-bold rounded-xl text-lg h-12 bg-primary/5 border-primary/20 text-primary focus-visible:ring-primary/30"
                />
              </div>
            </div>

            <DialogFooter className="mt-6 border-t pt-4">
              <Button
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl"
              >
                Batalkan
              </Button>
              <Button onClick={handleSimpan} className="rounded-xl shadow-md">
                <Check className="w-4 h-4 mr-2" /> Simpan Katalog
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==========================================
          ALERT DIALOG DELETE
      ========================================== */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="sm:rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-500">
              <AlertCircle className="w-5 h-5" />
              Hapus Data Layanan?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm mt-2">
              Tindakan ini tidak bisa dibatalkan. Layanan dengan ID{" "}
              <strong className="text-foreground">{idYangDihapus}</strong> akan
              dihapus permanen dari daftar katalog produk.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel
              onClick={() => setIdYangDihapus(null)}
              className="rounded-xl"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={eksekusiHapus}
              className="bg-red-600 text-white hover:bg-red-700 rounded-xl shadow-md"
            >
              Ya, Hapus Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
