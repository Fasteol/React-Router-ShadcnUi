import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

// IMPORT DATA DARI INVOICES.TS
import { dataLayanan, type Service } from "~/data/invoices";

// IMPORT KOMPONEN UI SHADCN
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
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
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
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

  const [services, setServices] = useState<Service[]>(dataLayanan);
  const [kataKunci, setKataKunci] = useState("");
  const [halamanSaatIni, setHalamanSaatIni] = useState(1);
  const [itemPerHalaman, setItemPerHalaman] = useState(10);

  // STATE UNTUK DIALOG & FORM
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"tambah" | "edit">("tambah");

  // State khusus untuk visual input (menampilkan "Rp ...")
  const [inputHarga, setInputHarga] = useState("Rp ");
  const [formData, setFormData] = useState<Service>({
    id: "",
    nama: "",
    deskripsi: "",
    harga: 0, // Disimpan sebagai number sesuai tipe Service di invoices.ts
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
    setInputHarga("Rp "); // Reset input visual
    setIsDialogOpen(true);
  };

  const bukaFormEdit = (dataAsli: Service) => {
    setFormMode("edit");
    setFormData(dataAsli);
    // Format input visual menjadi Rp XXX.XXX saat mode edit
    setInputHarga(`Rp ${dataAsli.harga.toLocaleString("id-ID")}`);
    setIsDialogOpen(true);
  };

  const handleSimpan = () => {
    if (
      !formData.nama ||
      !formData.deskripsi ||
      formData.harga === 0 ||
      inputHarga === "Rp "
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
  // HANDLER FORMAT HARGA (Mirip Transaksi)
  // ==========================================
  const handleUbahHarga = (e: React.ChangeEvent<HTMLInputElement>) => {
    const angkaSaja = e.target.value.replace(/[^0-9]/g, "");

    if (angkaSaja === "") {
      setInputHarga("Rp ");
      setFormData({ ...formData, harga: 0 });
    } else {
      const parsedNumber = parseInt(angkaSaja, 10);
      const formatRupiah = parsedNumber.toLocaleString("id-ID");

      // Simpan format "Rp XXX.XXX" untuk visual di form
      setInputHarga(`Rp ${formatRupiah}`);
      // Simpan angka murni ke dalam state formData.harga
      setFormData({ ...formData, harga: parsedNumber });
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
          >
            {item}
          </PaginationLink>
        </PaginationItem>
      );
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Daftar Layanan</h1>
        <p className="text-muted-foreground mt-1">
          Kelola data layanan dan produk yang ditawarkan.
        </p>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Layanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLayanan}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Keseluruhan produk aktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Rata-rata Harga
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {rataRataHarga.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dari seluruh layanan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">
              Layanan Premium
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{layananPremium}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Harga di atas Rp 3.000.000
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FILTER BAR SECTION */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <Input
            placeholder="Cari ID, nama, atau deskripsi layanan..."
            value={kataKunci}
            onChange={(e) => {
              setKataKunci(e.target.value);
              setHalamanSaatIni(1);
            }}
            className="md:max-w-xs rounded-md"
          />

          <Button
            onClick={bukaFormTambah}
            className="cursor-pointer rounded-md shrink-0"
          >
            + Tambah Layanan
          </Button>
        </div>

        {/* TABEL DATA */}
        <div className="border rounded-md bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">ID</TableHead>
                <TableHead className="w-1/3">Nama Layanan</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="text-right">Harga (Rp)</TableHead>
                <TableHead className="text-center w-40">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataTampil.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center h-24 text-muted-foreground"
                  >
                    Tidak ada data layanan ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                dataTampil.map((layanan) => (
                  <TableRow key={layanan.id}>
                    <TableCell className="font-medium text-foreground">
                      {layanan.id}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {layanan.nama}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm truncate max-w-[200px]">
                      {layanan.deskripsi}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      Rp {layanan.harga.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => bukaFormEdit(layanan)}
                          className="cursor-pointer"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => konfirmasiHapus(layanan.id)}
                          className="cursor-pointer"
                        >
                          Hapus
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 border-t mt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Tampilkan</span>
              <Select
                value={itemPerHalaman.toString()}
                onValueChange={(val) => {
                  setItemPerHalaman(Number(val));
                  setHalamanSaatIni(1);
                }}
              >
                <SelectTrigger className="w-[75px] h-8 rounded-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span>baris per halaman</span>
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
                    className={
                      halamanSaatIni === 1
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
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
                    className={
                      halamanSaatIni >= totalHalaman
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* FORM DIALOG (TAMBAH / EDIT) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>
              {formMode === "tambah"
                ? "Tambah Layanan Baru"
                : "Edit Data Layanan"}
            </DialogTitle>
            <DialogDescription>
              {formMode === "tambah"
                ? "Masukkan detail layanan atau produk baru."
                : "Ubah detail layanan yang sudah ada."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* ID LAYANAN */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="id" className="text-right">
                ID
              </Label>
              <Input
                id="id"
                value={formData.id}
                disabled
                className="col-span-3 rounded-md bg-muted"
              />
            </div>

            {/* NAMA LAYANAN */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nama" className="text-right">
                Nama
              </Label>
              <Input
                id="nama"
                placeholder="Cth: Web Development"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                className="col-span-3 rounded-md"
              />
            </div>

            {/* DESKRIPSI LAYANAN */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="deskripsi" className="text-right mt-2">
                Deskripsi
              </Label>
              <Textarea
                id="deskripsi"
                placeholder="Jelaskan detail layanan..."
                value={formData.deskripsi}
                onChange={(e) =>
                  setFormData({ ...formData, deskripsi: e.target.value })
                }
                className="col-span-3 rounded-md min-h-[80px]"
              />
            </div>

            {/* HARGA LAYANAN */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="harga" className="text-right">
                Harga
              </Label>
              <Input
                id="harga"
                placeholder="Rp 0"
                value={inputHarga} // Menggunakan state khusus untuk visual
                onChange={handleUbahHarga} // Handler khusus format Rp
                className="col-span-3 font-medium rounded-md"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="rounded-md"
            >
              Batal
            </Button>
            <Button onClick={handleSimpan} className="rounded-md">
              Simpan Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ALERT DIALOG DELETE */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah kamu yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak bisa dibatalkan. Data layanan{" "}
              <strong>{idYangDihapus}</strong> akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setIdYangDihapus(null)}
              className="rounded-md"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={eksekusiHapus}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md"
            >
              Ya, Hapus Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
