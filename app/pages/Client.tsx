import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Users,
  UserCheck,
  UserMinus,
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Wallet,
} from "lucide-react";
import { cn } from "~/lib/utils";
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
import { dataAwal } from "~/data/invoices";
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
import { Badge } from "~/components/ui/badge";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "Aktif" | "Non-aktif";
  totalInvoices: number;
  totalSpent: number;
};

// ==========================================
// KONFIGURASI KONVERSI MATA UANG
// ==========================================
const EXCHANGE_RATE_USD = 16000;

const parseCurrencyToNumber = (currencyString: string) => {
  return parseInt(currencyString.replace(/[^0-9]/g, ""), 10) || 0;
};

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
// FUNGSI EKSTRAKSI DATA AWAL KLIEN
// ==========================================
const extractInitialClients = (): Client[] => {
  const clientMap = new Map<string, Client>();
  dataAwal.forEach((inv) => {
    const amount = parseCurrencyToNumber(inv.totalAmount);

    if (!clientMap.has(inv.clientEmail)) {
      clientMap.set(inv.clientEmail, {
        id: `CL-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
        name: inv.clientName,
        email: inv.clientEmail,
        phone: "-",
        status: "Aktif",
        totalInvoices: 1,
        totalSpent: amount,
      });
    } else {
      const existingClient = clientMap.get(inv.clientEmail)!;
      existingClient.totalInvoices += 1;
      existingClient.totalSpent += amount;
    }
  });
  return Array.from(clientMap.values());
};

// ==========================================
// KOMPONEN UTAMA
// ==========================================
export default function ClientsPage() {
  const navigate = useNavigate();
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

  const convertAndFormat = (rawIdr: number) => {
    const finalValue = mataUang === "USD" ? rawIdr / EXCHANGE_RATE_USD : rawIdr;
    return formatCurrency(finalValue, mataUang);
  };

  const [clients, setClients] = useState<Client[]>(extractInitialClients());
  const [kataKunci, setKataKunci] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [halamanSaatIni, setHalamanSaatIni] = useState(1);
  const [itemPerHalaman, setItemPerHalaman] = useState(10);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"tambah" | "edit">("tambah");
  const [formData, setFormData] = useState<Client>({
    id: "",
    name: "",
    email: "",
    phone: "",
    status: "Aktif",
    totalInvoices: 0,
    totalSpent: 0,
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [idYangDihapus, setIdYangDihapus] = useState<string | null>(null);

  // ==========================================
  // PENGGUNAAN USEMEMO UNTUK OPTIMASI FILTER & METRIK
  // ==========================================
  const { dataTersaring, dataAktif, dataNonAktif, totalNilaiTransaksi } =
    useMemo(() => {
      const tersaring = clients.filter((item) => {
        const cocokKataKunci =
          item.name.toLowerCase().includes(kataKunci.toLowerCase()) ||
          item.email.toLowerCase().includes(kataKunci.toLowerCase());

        const cocokStatus =
          filterStatus === "Semua" || item.status === filterStatus;

        return cocokKataKunci && cocokStatus;
      });

      let aktif = 0,
        nonAktif = 0,
        totalNilai = 0;

      clients.forEach((item) => {
        if (item.status === "Aktif") aktif++;
        else if (item.status === "Non-aktif") nonAktif++;
        totalNilai += item.totalSpent;
      });

      return {
        dataTersaring: tersaring,
        dataAktif: aktif,
        dataNonAktif: nonAktif,
        totalNilaiTransaksi: totalNilai,
      };
    }, [clients, kataKunci, filterStatus]);

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
      id: `CL-${Date.now()}`,
      name: "",
      email: "",
      phone: "",
      status: "Aktif",
      totalInvoices: 0,
      totalSpent: 0,
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
          Modul Manajemen Klien
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Daftar Klien
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Kelola database pelanggan dan perusahaan Anda. Pantau status keaktifan
          dan akumulasi nilai transaksi yang terikat dengan setiap klien secara
          real-time.
        </p>
      </div>

      {/* OVERVIEW CARDS (METRIK) */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0 w-fit mb-3">
            <Users className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold text-foreground">
            {clients.length}
          </div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">
            Semua Klien Terdaftar
          </div>
        </div>

        <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0 w-fit mb-3">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="text-2xl font-bold text-foreground">{dataAktif}</div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">
            Pelanggan Aktif Bertransaksi
          </div>
        </div>

        <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="p-3 bg-muted text-muted-foreground rounded-xl shrink-0 w-fit mb-3">
            <UserMinus className="w-6 h-6" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {dataNonAktif}
          </div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">
            Tidak Ada Aktivitas
          </div>
        </div>

        <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="p-3 bg-sky-500/10 text-sky-500 rounded-xl shrink-0 w-fit mb-3">
            <Wallet className="w-6 h-6" />
          </div>
          <div
            className="text-xl sm:text-2xl font-bold text-foreground truncate"
            title={convertAndFormat(totalNilaiTransaksi)}
          >
            {convertAndFormat(totalNilaiTransaksi)}
          </div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">
            Total Nilai Transaksi Klien
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 border rounded-2xl bg-card shadow-sm">
          <div className="flex flex-1 flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative md:max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama klien atau email..."
                value={kataKunci}
                onChange={(e) => {
                  setKataKunci(e.target.value);
                  setHalamanSaatIni(1);
                }}
                className="pl-9 rounded-xl w-full"
              />
            </div>

            <Select
              value={filterStatus}
              onValueChange={(val) => {
                setFilterStatus(val);
                setHalamanSaatIni(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px] rounded-xl h-10">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="Semua">Semua Status</SelectItem>
                <SelectItem value="Aktif">Aktif</SelectItem>
                <SelectItem value="Non-aktif">Non-aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={bukaFormTambah}
            className="cursor-pointer rounded-xl shrink-0 gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Tambah Klien
          </Button>
        </div>

        <div className="border rounded-2xl bg-card shadow-sm overflow-hidden overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[250px] font-semibold">
                  Informasi Klien
                </TableHead>
                <TableHead className="font-semibold w-[200px]">
                  Kontak
                </TableHead>
                <TableHead className="font-semibold text-center w-[100px]">
                  Invoice
                </TableHead>
                <TableHead className="font-semibold">Nilai Transaksi</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-center w-32 font-semibold">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataTampil.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center h-32 text-muted-foreground"
                  >
                    Tidak ada data klien ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                dataTampil.map((client) => (
                  <TableRow
                    key={client.id}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <TableCell>
                      <div className="font-bold text-foreground">
                        {client.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        ID: {client.id}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{client.email}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {client.phone}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="font-bold text-foreground mx-auto bg-muted/50 px-3 py-1 rounded-md w-fit">
                        {client.totalInvoices}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-foreground">
                        {convertAndFormat(client.totalSpent)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          client.status === "Aktif"
                            ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:text-emerald-400 border-0 shadow-none font-semibold"
                            : "bg-muted text-muted-foreground border-0 shadow-none font-semibold hover:bg-muted"
                        }
                      >
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => bukaFormEdit(client)}
                          className="h-8 w-8 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-950"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => konfirmasiHapus(client.id)}
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
          FORM DIALOG (TAMBAH / EDIT) - DISEJAJARKAN DGN EXPENSE.TSX
      ========================================== */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px] sm:rounded-2xl p-0 overflow-hidden border-0 shadow-xl">
          <div className="h-2 w-full bg-gradient-to-r from-primary to-primary/60"></div>
          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-bold">
                {formMode === "tambah"
                  ? "Tambah Klien Baru"
                  : "Edit Data Klien"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {formMode === "tambah"
                  ? "Lengkapi detail informasi klien di bawah ini."
                  : "Ubah detail informasi kontak klien yang sudah ada."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 py-2">
              <div className="grid gap-2">
                <Label htmlFor="name" className="font-semibold">
                  Nama Lengkap / Perusahaan
                </Label>
                <Input
                  id="name"
                  placeholder="Contoh: PT. Inovasi Bangsa"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="rounded-xl h-10"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email" className="font-semibold">
                  Alamat Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@perusahaan.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="rounded-xl h-10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="font-semibold">
                    No. Telepon
                  </Label>
                  <Input
                    id="phone"
                    placeholder="08123456789"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="rounded-xl h-10"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="statusKlien" className="font-semibold">
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val: "Aktif" | "Non-aktif") =>
                      setFormData({ ...formData, status: val })
                    }
                  >
                    <SelectTrigger
                      id="statusKlien"
                      className="w-full rounded-xl h-10"
                    >
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Aktif">Aktif</SelectItem>
                      <SelectItem value="Non-aktif">Non-aktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Simpan Data
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
              Hapus Data Klien?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm mt-2">
              Data klien ini akan dihapus permanen dari daftar.
              <strong className="text-foreground block mt-1">
                Perhatian: Transaksi (Invoice) yang terkait dengan klien ini
                mungkin akan kehilangan referensi data kontaknya.
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <AlertDialogCancel
              onClick={() => setIdYangDihapus(null)}
              className="rounded-xl w-full sm:w-auto mt-0"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={eksekusiHapus}
              className="bg-red-600 text-white hover:bg-red-700 rounded-xl shadow-md w-full sm:w-auto font-semibold"
            >
              Ya, Hapus Klien
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
