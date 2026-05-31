import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { dataAwal } from "~/data/invoices"; // Pastikan path ini sesuai
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
import { Badge } from "~/components/ui/badge";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

// ==========================================
// TIPE DATA KLIEN
// ==========================================
export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "Aktif" | "Non-aktif";
  totalInvoices: number;
};

// ==========================================
// LOGIKA EKSTRAKSI AWAL (DARI INVOICE)
// ==========================================
const extractInitialClients = (): Client[] => {
  const clientMap = new Map<string, Client>();
  dataAwal.forEach((inv) => {
    if (!clientMap.has(inv.clientEmail)) {
      clientMap.set(inv.clientEmail, {
        id: `CL-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
        name: inv.clientName,
        email: inv.clientEmail,
        phone: "-",
        status: "Aktif",
        totalInvoices: 1,
      });
    } else {
      const existingClient = clientMap.get(inv.clientEmail)!;
      existingClient.totalInvoices += 1;
    }
  });
  return Array.from(clientMap.values());
};

export default function ClientsPage() {
  const navigate = useNavigate();

  // ==========================================
  // STATE UTAMA (MENIRU HOME.TSX)
  // ==========================================
  const [clients, setClients] = useState<Client[]>(extractInitialClients());
  const [kataKunci, setKataKunci] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [halamanSaatIni, setHalamanSaatIni] = useState(1);
  const [itemPerHalaman, setItemPerHalaman] = useState(10);

  // ==========================================
  // STATE UNTUK DIALOG & FORM
  // ==========================================
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"tambah" | "edit">("tambah");
  const [formData, setFormData] = useState<Client>({
    id: "",
    name: "",
    email: "",
    phone: "",
    status: "Aktif",
    totalInvoices: 0,
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [idYangDihapus, setIdYangDihapus] = useState<string | null>(null);

  // ==========================================
  // LOGIKA MENGHITUNG CARD & FILTER DATA
  // ==========================================
  const dataTersaring = clients.filter((item) => {
    const cocokKataKunci =
      item.name.toLowerCase().includes(kataKunci.toLowerCase()) ||
      item.email.toLowerCase().includes(kataKunci.toLowerCase());

    const cocokStatus =
      filterStatus === "Semua" || item.status === filterStatus;

    return cocokKataKunci && cocokStatus;
  });

  const dataAktif = clients.filter((item) => item.status === "Aktif").length;
  const dataNonAktif = clients.filter(
    (item) => item.status === "Non-aktif",
  ).length;
  const totalTransaksi = clients.reduce(
    (acc, curr) => acc + curr.totalInvoices,
    0,
  );

  // LOGIKA PAGINATION
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
      id: `CL-${Date.now()}`,
      name: "",
      email: "",
      phone: "",
      status: "Aktif",
      totalInvoices: 0,
    });
    setIsDialogOpen(true);
  };

  const bukaFormEdit = (dataAsli: Client) => {
    setFormMode("edit");
    setFormData(dataAsli);
    setIsDialogOpen(true);
  };

  const handleSimpan = () => {
    if (!formData.name || !formData.email) {
      toast.error("Gagal! Nama dan Email klien wajib diisi.");
      return;
    }

    if (formMode === "tambah") {
      const isExist = clients.some((item) => item.email === formData.email);
      if (isExist) {
        toast.error(`Gagal! Email ${formData.email} sudah terdaftar.`);
        return;
      }
      setClients([formData, ...clients]);
      toast.success(`Berhasil menambahkan klien ${formData.name}!`);
    } else {
      const dataBaru = clients.map((item) =>
        item.id === formData.id ? formData : item,
      );
      setClients(dataBaru);
      toast.success(`Berhasil memperbarui klien ${formData.name}!`);
    }

    setIsDialogOpen(false);
  };

  const konfirmasiHapus = (idKlien: string) => {
    setIdYangDihapus(idKlien);
    setIsDeleteDialogOpen(true);
  };

  const eksekusiHapus = () => {
    if (idYangDihapus) {
      const klienTerhapus = clients.find((c) => c.id === idYangDihapus);
      const dataBaru = clients.filter((item) => item.id !== idYangDihapus);
      setClients(dataBaru);

      if (dataTampil.length === 1 && halamanSaatIni > 1) {
        setHalamanSaatIni(halamanSaatIni - 1);
      }
      toast.success(`Klien ${klienTerhapus?.name} berhasil dihapus.`);
    }
    setIsDeleteDialogOpen(false);
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
        <h1 className="text-3xl font-bold tracking-tight">Daftar Klien</h1>
        <p className="text-muted-foreground mt-1">
          Kelola data pelanggan dan perusahaan.
        </p>
      </div>

      {/* Tampilan Grid Atas (Menyesuaikan dengan konteks Klien) */}
      <div className="grid gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Klien</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Semua klien terdaftar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Klien Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataAktif}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Pelanggan aktif bertransaksi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Non-aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataNonAktif}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tidak ada aktivitas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-sky-700 dark:text-sky-400">
              Total Invoice Terikat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransaksi}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Dari seluruh riwayat klien
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FILTER BAR SECTION */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-1 flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <Input
              placeholder="Cari nama klien atau email..."
              value={kataKunci}
              onChange={(e) => {
                setKataKunci(e.target.value);
                setHalamanSaatIni(1);
              }}
              className="md:max-w-2xs rounded-md"
            />

            <Select
              value={filterStatus}
              onValueChange={(val) => {
                setFilterStatus(val);
                setHalamanSaatIni(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px] rounded-md">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Semua">Semua Status</SelectItem>
                <SelectItem value="Aktif">Aktif</SelectItem>
                <SelectItem value="Non-aktif">Non-aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={bukaFormTambah}
            className="cursor-pointer rounded-md shrink-0"
          >
            + Tambah Klien
          </Button>
        </div>

        {/* Tabel Data */}
        <div className="border rounded-md bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Informasi Klien</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Total Invoice</TableHead>
                <TableHead>Status</TableHead>
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
                    Tidak ada data klien ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                dataTampil.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="font-semibold text-foreground">
                        {client.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{client.email}</div>
                      <div className="text-xs text-muted-foreground">
                        {client.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{client.totalInvoices}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          client.status === "Aktif"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900 shadow-none"
                            : "bg-muted text-muted-foreground shadow-none"
                        }
                      >
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => bukaFormEdit(client)}
                          className="cursor-pointer"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => konfirmasiHapus(client.id)}
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

        {/* BOTTOM PAGINATION */}
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
              <span>baris data per halaman</span>
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

      {/* FORM DIALOG (TAMBAH / EDIT KLIEN) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>
              {formMode === "tambah" ? "Tambah Klien Baru" : "Edit Data Klien"}
            </DialogTitle>
            <DialogDescription>
              {formMode === "tambah"
                ? "Masukkan detail informasi klien baru."
                : "Ubah detail informasi klien yang sudah ada."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nama
              </Label>
              <Input
                id="name"
                placeholder="Nama Lengkap / Perusahaan"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-3 rounded-md"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@perusahaan.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="col-span-3 rounded-md"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                No. Telepon
              </Label>
              <Input
                id="phone"
                placeholder="08123456789"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="col-span-3 rounded-md"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="statusKlien" className="text-right">
                Status
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.status}
                  onValueChange={(val: "Aktif" | "Non-aktif") =>
                    setFormData({ ...formData, status: val })
                  }
                >
                  <SelectTrigger id="statusKlien" className="w-full rounded-md">
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aktif">Aktif</SelectItem>
                    <SelectItem value="Non-aktif">Non-aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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

      {/* ALERT DIALOG DELETE KLIEN */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah kamu yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Data klien ini akan dihapus dari daftar. Transaksi yang terkait
              dengan klien ini mungkin akan kehilangan referensi nama.
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
              Ya, Hapus Klien
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
