import { useState, useMemo } from "react";
import {
  Package,
  TrendingUp,
  Star,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

import { convertAndFormatCurrency } from "~/lib/currency";
import { useAppStore } from "~/store/useAppStore";
import { ConfirmDeleteModal } from "~/components/ui/confirm-delete-modal";
import { CustomPagination } from "~/components/ui/custom-pagination";

// Import tipe data dari file types
import type { Service } from "~/types/index";

const generateServiceID = (dataServices: Service[]) => {
  const prefix = "S";
  if (dataServices.length === 0) return `${prefix}001`;
  const urutanTerakhir = dataServices.map(
    (item) => parseInt(item.id.replace(prefix, ""), 10) || 0,
  );
  return `${prefix}${String(Math.max(...urutanTerakhir) + 1).padStart(3, "0")}`;
};

export default function ServicePage() {
  const mataUang = useAppStore((state) => state.preferensi.mataUang);

  // Mengambil state dan actions dari Global Store Zustand
  const { services, addService, updateService, deleteService } = useAppStore();

  const [kataKunci, setKataKunci] = useState("");
  const [halamanSaatIni, setHalamanSaatIni] = useState(1);
  const [itemPerHalaman, setItemPerHalaman] = useState(10);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"tambah" | "edit">("tambah");
  const [formData, setFormData] = useState<Service>({
    id: "",
    nama: "",
    deskripsi: "",
    harga: 0,
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [idYangDihapus, setIdYangDihapus] = useState<string | null>(null);

  const { dataTersaring, totalLayanan, rataRataHarga, layananPremium } =
    useMemo(() => {
      const tersaring = services.filter(
        (item) =>
          item.nama.toLowerCase().includes(kataKunci.toLowerCase()) ||
          item.id.toLowerCase().includes(kataKunci.toLowerCase()),
      );
      const total = services.length;
      const rataRata =
        total > 0
          ? services.reduce((acc, curr) => acc + curr.harga, 0) / total
          : 0;
      const premium = services.filter((s) => s.harga >= 3000000).length;
      return {
        dataTersaring: tersaring,
        totalLayanan: total,
        rataRataHarga: rataRata,
        layananPremium: premium,
      };
    }, [services, kataKunci]);

  const totalHalaman = Math.ceil(dataTersaring.length / itemPerHalaman);
  const dataTampil = dataTersaring.slice(
    (halamanSaatIni - 1) * itemPerHalaman,
    halamanSaatIni * itemPerHalaman,
  );

  const bukaFormTambah = () => {
    setFormMode("tambah");
    setFormData({
      id: generateServiceID(services),
      nama: "",
      deskripsi: "",
      harga: 0,
    });
    setIsDialogOpen(true);
  };

  const bukaFormEdit = (dataAsli: Service) => {
    setFormMode("edit");
    setFormData(dataAsli);
    setIsDialogOpen(true);
  };

  const handleSimpan = () => {
    if (!formData.nama || !formData.deskripsi || formData.harga <= 0) {
      toast.error(
        "Gagal! Pastikan nama, deskripsi, dan harga diisi dengan benar.",
      );
      return;
    }
    if (formMode === "tambah") {
      if (services.some((item) => item.id === formData.id))
        return toast.error(`Gagal! ID Layanan ${formData.id} sudah digunakan.`);

      addService(formData);
      toast.success(`Berhasil menambahkan layanan ${formData.nama}!`);
    } else {
      updateService(formData.id, formData);
      toast.success(`Berhasil memperbarui layanan ${formData.nama}!`);
    }
    setIsDialogOpen(false);
  };

  const eksekusiHapus = () => {
    if (idYangDihapus) {
      deleteService(idYangDihapus);
      if (dataTampil.length === 1 && halamanSaatIni > 1)
        setHalamanSaatIni(halamanSaatIni - 1);
      toast.success(`Layanan berhasil dihapus.`);
    }
    setIsDeleteDialogOpen(false);
    setIdYangDihapus(null);
  };

  return (
    <div className="max-w-6xl py-8 mx-auto font-sans flex flex-col gap-10 px-4 xl:px-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm">
          <div className="p-3 bg-primary/10 text-primary rounded-xl w-fit mb-3">
            <Package className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold">{totalLayanan}</div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">
            Keseluruhan Layanan Aktif
          </div>
        </div>
        <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl w-fit mb-3">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="text-2xl font-bold">
            {convertAndFormatCurrency(rataRataHarga, mataUang)}
          </div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">
            Rata-rata Harga Pasar
          </div>
        </div>
        <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl w-fit mb-3">
            <Star className="w-6 h-6" />
          </div>
          <div className="text-2xl font-bold">{layananPremium}</div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">
            Layanan Premium
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row justify-between gap-3 p-4 border rounded-2xl bg-card shadow-sm">
          <div className="relative flex-1 md:max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari ID atau nama layanan..."
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
            className="rounded-xl gap-2 shadow-sm font-semibold h-10"
          >
            <Plus className="w-4 h-4" /> Tambah Layanan
          </Button>
        </div>

        <div className="border rounded-2xl bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-24">ID</TableHead>
                <TableHead className="w-1/3">Nama Layanan</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="text-right">Harga ({mataUang})</TableHead>
                <TableHead className="text-center w-32">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataTampil.map((layanan) => (
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
                    <p className="text-muted-foreground text-sm truncate max-w-[250px]">
                      {layanan.deskripsi}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-bold bg-muted/50 px-3 py-1 rounded-md w-fit ml-auto">
                      {convertAndFormatCurrency(layanan.harga, mataUang)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => bukaFormEdit(layanan)}
                        className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setIdYangDihapus(layanan.id);
                          setIsDeleteDialogOpen(true);
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
              {formMode === "tambah"
                ? "Tambah Layanan Baru"
                : "Ubah Data Layanan"}
            </DialogTitle>
            <DialogDescription>
              Tambahkan atau sesuaikan detail penawaran jasa maupun produk di
              bawah.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4 overflow-y-auto custom-scrollbar flex flex-col gap-5">
            <div className="grid gap-2">
              <Label className="font-semibold">ID Layanan</Label>
              <Input
                value={formData.id}
                disabled
                className="rounded-xl h-10 bg-muted/50 font-bold border-border/50"
              />
            </div>
            <div className="grid gap-2">
              <Label className="font-semibold">Nama Layanan / Produk</Label>
              <Input
                placeholder="Contoh: Pembuatan Website E-Commerce..."
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                className="rounded-xl h-10 border-border/50"
              />
            </div>
            <div className="grid gap-2">
              <Label className="font-semibold">Deskripsi</Label>
              <Textarea
                placeholder="Tuliskan spesifikasi detail mengenai paket layanan yang ditawarkan..."
                rows={3}
                value={formData.deskripsi}
                onChange={(e) =>
                  setFormData({ ...formData, deskripsi: e.target.value })
                }
                className="rounded-xl resize-none border-border/50"
              />
            </div>
            <div className="grid gap-2">
              <Label className="font-semibold">Harga Patokan</Label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-sm font-bold text-muted-foreground/70">
                  Rp
                </div>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.harga || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      harga: Number(e.target.value),
                    })
                  }
                  className="rounded-xl pl-10 h-10 font-bold font-mono text-base border-border/50"
                />
              </div>
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

      <ConfirmDeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setIdYangDihapus(null);
        }}
        onConfirm={eksekusiHapus}
        title="Hapus Data Layanan?"
        itemName={idYangDihapus || "layanan ini"}
      />
    </div>
  );
}
