import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  Check,
  ChevronsUpDown,
  X,
  ChevronDown,
  ChevronUp,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Plus,
  Search,
  Edit2,
  Trash2,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { toast } from "sonner";

// IMPORT DATA DARI INVOICES.TS
import {
  dataAwal,
  daftarKlien,
  dataLayanan,
  type Invoice,
  type Service,
} from "~/data/invoices";

// IMPORT KOMPONEN UI SHADCN
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

// ==========================================
// FUNGSI GENERATOR ID INVOICE OTOMATIS
// ==========================================
const generateInvoiceID = (dataInvoices: Invoice[]) => {
  const tanggalHariIni = new Date();
  const tahun = tanggalHariIni.getFullYear();
  const bulan = String(tanggalHariIni.getMonth() + 1).padStart(2, "0");
  const tanggal = String(tanggalHariIni.getDate()).padStart(2, "0");

  const prefix = `INV-${tahun}${bulan}${tanggal}-`;

  const invoiceHariIni = dataInvoices.filter((item) =>
    item.invoice.startsWith(prefix),
  );

  let nextUrutan = 1;
  if (invoiceHariIni.length > 0) {
    const urutanTerakhir = invoiceHariIni.map((item) => {
      const bagianAngka = item.invoice.split("-")[2];
      return parseInt(bagianAngka, 10) || 0;
    });
    nextUrutan = Math.max(...urutanTerakhir) + 1;
  }

  const formatUrutan = String(nextUrutan).padStart(3, "0");
  return `${prefix}${formatUrutan}`;
};

// ==========================================
// KOMPONEN UTAMA
// ==========================================
export default function TransactionPage() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState<Invoice[]>(dataAwal);
  const [kataKunci, setKataKunci] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [halamanSaatIni, setHalamanSaatIni] = useState(1);
  const [itemPerHalaman, setItemPerHalaman] = useState(10);

  // STATE UNTUK DIALOG & FORM
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [openComboboxKlien, setOpenComboboxKlien] = useState(false);
  const [openComboboxLayanan, setOpenComboboxLayanan] = useState(false);
  const [formMode, setFormMode] = useState<"tambah" | "edit">("tambah");

  // State Accordion Tabel (Baris mana yang sedang terbuka)
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // State untuk melacak layanan apa saja yang dipilih pada form saat ini
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);

  const [formData, setFormData] = useState<Invoice>({
    id: "",
    invoice: "",
    clientName: "",
    clientEmail: "",
    paymentStatus: "",
    paymentMethod: "",
    totalAmount: "",
    date: "",
    dueDate: "",
    services: [], // Pastikan data layanan disertakan di state awal
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [idYangDihapus, setIdYangDihapus] = useState<string | null>(null);

  // LOGIKA FILTER & CARD DATA
  const dataTersaring = invoices.filter((item) => {
    const cocokKataKunci =
      item.invoice.toLowerCase().includes(kataKunci.toLowerCase()) ||
      item.clientName.toLowerCase().includes(kataKunci.toLowerCase());

    const cocokStatus =
      filterStatus === "Semua" || item.paymentStatus === filterStatus;

    return cocokKataKunci && cocokStatus;
  });

  const dataLunas = invoices.filter(
    (item) => item.paymentStatus === "Lunas",
  ).length;
  const dataPending = invoices.filter(
    (item) => item.paymentStatus === "Pending",
  ).length;
  const dataBelumBayar = invoices.filter(
    (item) => item.paymentStatus === "Belum Bayar",
  ).length;
  const dataGagal = invoices.filter(
    (item) => item.paymentStatus === "Gagal",
  ).length;

  const totalHalaman = Math.ceil(dataTersaring.length / itemPerHalaman);
  const indexAwal = (halamanSaatIni - 1) * itemPerHalaman;
  const indexAkhir = indexAwal + itemPerHalaman;
  const dataTampil = dataTersaring.slice(indexAwal, indexAkhir);

  // ==========================================
  // FUNGSI AKSI (TAMBAH, EDIT, HAPUS, ACCORDION)
  // ==========================================
  const toggleRow = (invoiceId: string) => {
    setExpandedRow((prev) => (prev === invoiceId ? null : invoiceId));
  };

  const bukaFormTambah = () => {
    const tglDibuat = new Date().toISOString().split("T")[0];
    const dateObj = new Date(tglDibuat);
    dateObj.setDate(dateObj.getDate() + 14);
    const tglJatuhTempo = dateObj.toISOString().split("T")[0];

    const idOtomatis = generateInvoiceID(invoices);

    setFormMode("tambah");
    setSelectedServices([]); // Reset layanan terpilih
    setFormData({
      id: `id-${Date.now()}`,
      invoice: idOtomatis,
      clientName: "",
      clientEmail: "",
      paymentStatus: "Pending",
      paymentMethod: "Transfer Bank",
      totalAmount: "Rp ",
      date: tglDibuat,
      dueDate: tglJatuhTempo,
      services: [],
    });
    setIsDialogOpen(true);
  };

  const bukaFormEdit = (dataAsli: Invoice) => {
    setFormMode("edit");
    setSelectedServices(dataAsli.services || []);
    setFormData(dataAsli);
    setIsDialogOpen(true);
  };

  const handleSimpan = () => {
    if (
      !formData.invoice ||
      !formData.clientName ||
      !formData.paymentStatus ||
      !formData.totalAmount ||
      formData.totalAmount === "Rp "
    ) {
      toast.error("Gagal! Kolom utama wajib diisi dengan benar.");
      return;
    }

    // Sisipkan layanan terpilih ke dalam formData
    const finalData = { ...formData, services: selectedServices };

    if (formMode === "tambah") {
      const isExist = invoices.some(
        (item) => item.invoice === formData.invoice,
      );
      if (isExist) {
        toast.error(`Gagal! Invoice ${formData.invoice} sudah digunakan.`);
        return;
      }
      setInvoices([finalData, ...invoices]);
      toast.success(`Berhasil menambahkan invoice ${formData.invoice}!`);
    } else {
      const dataBaru = invoices.map((item) =>
        item.invoice === formData.invoice ? finalData : item,
      );
      setInvoices(dataBaru);
      toast.success(`Berhasil memperbarui invoice ${formData.invoice}!`);
    }

    setIsDialogOpen(false);
  };

  const konfirmasiHapus = (idInvoice: string) => {
    setIdYangDihapus(idInvoice);
    setIsDeleteDialogOpen(true);
  };

  const eksekusiHapus = () => {
    if (idYangDihapus) {
      const dataBaru = invoices.filter(
        (item) => item.invoice !== idYangDihapus,
      );
      setInvoices(dataBaru);

      if (dataTampil.length === 1 && halamanSaatIni > 1) {
        setHalamanSaatIni(halamanSaatIni - 1);
      }
      toast.success(`Invoice ${idYangDihapus} berhasil dihapus.`);
    }
    setIsDeleteDialogOpen(false);
    setIdYangDihapus(null);
  };

  // ==========================================
  // HANDLER LAYANAN & NOMINAL
  // ==========================================
  const hitungTotalLayanan = (layananSaatIni: Service[]) => {
    const total = layananSaatIni.reduce((acc, curr) => acc + curr.harga, 0);
    if (total === 0) {
      setFormData({ ...formData, totalAmount: "Rp " });
    } else {
      setFormData({
        ...formData,
        totalAmount: `Rp ${total.toLocaleString("id-ID")}`,
      });
    }
  };

  const tambahLayanan = (layanan: Service) => {
    const daftarBaru = [...selectedServices, layanan];
    setSelectedServices(daftarBaru);
    hitungTotalLayanan(daftarBaru);
  };

  const hapusLayanan = (indexDihapus: number) => {
    const daftarBaru = selectedServices.filter(
      (_, idx) => idx !== indexDihapus,
    );
    setSelectedServices(daftarBaru);
    hitungTotalLayanan(daftarBaru);
  };

  const handleUbahNominal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const angkaSaja = e.target.value.replace(/[^0-9]/g, "");
    if (angkaSaja === "") {
      setFormData({ ...formData, totalAmount: "Rp " });
    } else {
      const formatRupiah = parseInt(angkaSaja, 10).toLocaleString("id-ID");
      setFormData({ ...formData, totalAmount: `Rp ${formatRupiah}` });
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
          Modul Transaksi Bisnis
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Daftar Transaksi
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Kelola siklus tagihan klien Anda. Pantau pembayaran yang masuk, buat
          penawaran baru, dan analisis status piutang usaha secara terpusat.
        </p>
      </div>

      {/* ==========================================
          OVERVIEW CARDS (METRIK)
      ========================================== */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Card: Total */}
        <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-1 col-span-2 md:col-span-1">
          <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0 w-fit mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold text-foreground">
            {invoices.length}
          </div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">
            Total Transaksi
          </div>
        </div>

        {/* Card: Lunas */}
        <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0 w-fit mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="text-2xl font-bold text-foreground">{dataLunas}</div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">
            Berhasil Lunas
          </div>
        </div>

        {/* Card: Pending */}
        <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl shrink-0 w-fit mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {dataPending}
          </div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">
            Pending
          </div>
        </div>

        {/* Card: Belum Bayar */}
        <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="p-3 bg-sky-500/10 text-sky-500 rounded-xl shrink-0 w-fit mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {dataBelumBayar}
          </div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">
            Belum Bayar
          </div>
        </div>

        {/* Card: Gagal */}
        <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-xl shrink-0 w-fit mb-3">
            <XCircle className="w-6 h-6" />
          </div>
          <div className="text-2xl font-bold text-foreground">{dataGagal}</div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">
            Gagal Transaksi
          </div>
        </div>
      </div>

      {/* ==========================================
          MAIN CONTENT AREA (FILTER & TABEL)
      ========================================== */}
      <div className="flex flex-col gap-5">
        {/* FILTER BAR SECTION */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 border rounded-2xl bg-card shadow-sm">
          <div className="flex flex-1 flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative md:max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari nomor invoice / klien..."
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
              <SelectTrigger className="w-full sm:w-[180px] rounded-xl">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="Semua">Semua Status</SelectItem>
                <SelectItem value="Lunas">Lunas</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Belum Bayar">Belum Bayar</SelectItem>
                <SelectItem value="Gagal">Gagal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={bukaFormTambah}
            className="cursor-pointer rounded-xl shrink-0 gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Tambah Data
          </Button>
        </div>

        {/* TABEL DATA */}
        <div className="border rounded-2xl bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-56 font-semibold">
                  Invoice / Klien
                </TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Metode</TableHead>
                <TableHead className="font-semibold">Tanggal / Batas</TableHead>
                <TableHead className="text-right font-semibold">
                  Total
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
                    colSpan={6}
                    className="text-center h-32 text-muted-foreground"
                  >
                    Tidak ada data ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                dataTampil.map((invoice) => (
                  <React.Fragment key={invoice.invoice}>
                    {/* BARIS UTAMA (CLICKABLE) */}
                    <TableRow
                      className="cursor-pointer hover:bg-muted/40 transition-colors group"
                      onClick={() => toggleRow(invoice.invoice)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-1.5 rounded-md shrink-0 transition-colors ${expandedRow === invoice.invoice ? "bg-primary/10 text-primary" : "bg-transparent text-muted-foreground group-hover:bg-muted"}`}
                          >
                            {expandedRow === invoice.invoice ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-foreground">
                              {invoice.invoice}
                            </div>
                            <div className="text-xs text-muted-foreground max-w-[150px] truncate mt-0.5">
                              {invoice.clientName}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            invoice.paymentStatus === "Lunas"
                              ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:text-emerald-400 border-0 shadow-none font-semibold"
                              : invoice.paymentStatus === "Pending"
                                ? "bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 dark:text-amber-400 border-0 shadow-none font-semibold"
                                : invoice.paymentStatus === "Belum Bayar"
                                  ? "bg-sky-500/15 text-sky-700 hover:bg-sky-500/25 dark:text-sky-400 border-0 shadow-none font-semibold"
                                  : "bg-red-500/15 text-red-700 hover:bg-red-500/25 dark:text-red-400 border-0 shadow-none font-semibold"
                          }
                        >
                          {invoice.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{invoice.paymentMethod}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {invoice.date}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Batas: {invoice.dueDate}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-foreground">
                        {invoice.totalAmount}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              bukaFormEdit(invoice);
                            }}
                            className="h-8 w-8 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-950"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              konfirmasiHapus(invoice.invoice);
                            }}
                            className="h-8 w-8 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-950"
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* BARIS ACCORDION (DETAIL LAYANAN) */}
                    {expandedRow === invoice.invoice && (
                      <TableRow className="bg-muted/10 hover:bg-muted/10">
                        <TableCell colSpan={6} className="p-0 border-b">
                          <div className="p-5 pl-12 border-l-4 border-l-primary mx-4 my-3 bg-card rounded-r-xl shadow-sm border border-border/50">
                            <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                              <Receipt className="w-4 h-4 text-primary" />{" "}
                              Rincian Layanan Tertagih
                            </h4>
                            {invoice.services && invoice.services.length > 0 ? (
                              <div className="flex flex-col gap-3 max-w-3xl">
                                {invoice.services.map((svc, idx) => (
                                  <div
                                    key={idx}
                                    className="flex justify-between items-center bg-muted/30 border border-border/50 rounded-xl p-3.5 text-sm"
                                  >
                                    <div>
                                      <p className="font-semibold text-foreground">
                                        {svc.nama}
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {svc.deskripsi}
                                      </p>
                                    </div>
                                    <p className="font-bold shrink-0 bg-background px-3 py-1.5 rounded-lg border shadow-sm">
                                      Rp {svc.harga.toLocaleString("id-ID")}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="bg-muted/30 border border-dashed rounded-xl p-4 text-center">
                                <p className="text-sm text-muted-foreground italic">
                                  Tidak ada data rincian layanan yang
                                  dilampirkan pada invoice ini.
                                </p>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
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
        <DialogContent className="sm:max-w-[500px] sm:rounded-2xl p-0 overflow-hidden border-0 shadow-xl">
          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-bold">
                {formMode === "tambah"
                  ? "Buat Invoice Baru"
                  : "Ubah Data Invoice"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {formMode === "tambah"
                  ? "Lengkapi formulir di bawah. Total nominal akan dihitung otomatis saat layanan ditambahkan."
                  : "Sesuaikan kembali rincian data transaksi yang sudah ada."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 py-2 max-h-[60vh] overflow-y-auto px-1 custom-scrollbar">
              {/* KODE INVOICE */}
              <div className="grid gap-2">
                <Label htmlFor="invoice" className="font-semibold">
                  Nomor Invoice
                </Label>
                <Input
                  id="invoice"
                  placeholder="INV-YYYYMMDD-XXX"
                  value={formData.invoice}
                  onChange={(e) =>
                    setFormData({ ...formData, invoice: e.target.value })
                  }
                  className="rounded-xl uppercase bg-muted/50 font-medium"
                  disabled={formMode === "edit"}
                />
              </div>

              {/* KLIEN (COMBOBOX) */}
              <div className="grid gap-2">
                <Label className="font-semibold">Klien Tujuan</Label>
                <Popover
                  open={openComboboxKlien}
                  onOpenChange={setOpenComboboxKlien}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openComboboxKlien}
                      className="w-full justify-between font-normal rounded-xl"
                    >
                      {formData.clientName
                        ? formData.clientName
                        : "Pilih atau cari dari database..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[450px] p-0 rounded-xl"
                    align="start"
                  >
                    <Command>
                      <CommandInput
                        placeholder="Cari nama klien..."
                        className="rounded-t-xl"
                      />
                      <CommandList>
                        <CommandEmpty>
                          Database klien tidak ditemukan.
                        </CommandEmpty>
                        <CommandGroup>
                          {daftarKlien.map((klien, index) => (
                            <CommandItem
                              key={index}
                              value={klien.name}
                              onSelect={(currentValue) => {
                                const dataTerpilih = daftarKlien.find(
                                  (k) => k.name.toLowerCase() === currentValue,
                                );

                                setFormData({
                                  ...formData,
                                  clientName: dataTerpilih
                                    ? dataTerpilih.name
                                    : currentValue,
                                  clientEmail: dataTerpilih
                                    ? dataTerpilih.email
                                    : "",
                                });

                                setOpenComboboxKlien(false);
                              }}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 text-primary",
                                  formData.clientName === klien.name
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {klien.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {klien.email}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {/* EMAIL KLIEN (READ ONLY TEXT) */}
                {formData.clientEmail && (
                  <p className="text-xs text-muted-foreground mt-0.5 ml-1">
                    Email: {formData.clientEmail}
                  </p>
                )}
              </div>

              {/* LAYANAN (COMBOBOX & LIST) */}
              <div className="grid gap-2 p-4 rounded-xl border bg-muted/10 border-dashed">
                <Label className="font-semibold text-primary flex items-center gap-2">
                  <Receipt className="w-4 h-4" /> Daftar Layanan Tertagih
                </Label>
                <Popover
                  open={openComboboxLayanan}
                  onOpenChange={setOpenComboboxLayanan}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openComboboxLayanan}
                      className="w-full justify-between font-normal text-muted-foreground rounded-xl mt-2 bg-background hover:bg-background/80"
                    >
                      <span className="flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Sisipkan layanan dari
                        katalog...
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[415px] p-0 rounded-xl"
                    align="start"
                  >
                    <Command>
                      <CommandInput
                        placeholder="Cari katalog layanan..."
                        className="rounded-t-xl"
                      />
                      <CommandList>
                        <CommandEmpty>Layanan tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {dataLayanan.map((layanan) => (
                            <CommandItem
                              key={layanan.id}
                              onSelect={() => {
                                tambahLayanan(layanan);
                                setOpenComboboxLayanan(false);
                              }}
                              className="cursor-pointer"
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className="font-medium">
                                  {layanan.nama}
                                </span>
                                <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md">
                                  Rp {layanan.harga.toLocaleString("id-ID")}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* DAFTAR LAYANAN TERPILIH */}
                {selectedServices.length > 0 && (
                  <div className="flex flex-col gap-2 mt-3">
                    {selectedServices.map((layanan, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-background p-3 rounded-xl text-sm border shadow-sm group"
                      >
                        <span className="truncate pr-2 font-medium">
                          {layanan.nama}
                        </span>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-bold text-xs bg-muted/50 px-2 py-1 rounded-md">
                            Rp {layanan.harga.toLocaleString("id-ID")}
                          </span>
                          <button
                            type="button"
                            onClick={() => hapusLayanan(idx)}
                            className="text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="Hapus layanan"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ROW: STATUS & METODE */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status" className="font-semibold">
                    Status
                  </Label>
                  <Select
                    value={formData.paymentStatus}
                    onValueChange={(val) =>
                      setFormData({ ...formData, paymentStatus: val })
                    }
                  >
                    <SelectTrigger id="status" className="w-full rounded-xl">
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Lunas">Lunas</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Belum Bayar">Belum Bayar</SelectItem>
                      <SelectItem value="Gagal">Gagal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="metode" className="font-semibold">
                    Metode Transaksi
                  </Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(val) =>
                      setFormData({ ...formData, paymentMethod: val })
                    }
                  >
                    <SelectTrigger id="metode" className="w-full rounded-xl">
                      <SelectValue placeholder="Pilih Metode" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Transfer Bank">
                        Transfer Bank
                      </SelectItem>
                      <SelectItem value="GoPay">GoPay</SelectItem>
                      <SelectItem value="Kartu Kredit">Kartu Kredit</SelectItem>
                      <SelectItem value="OVO">OVO</SelectItem>
                      <SelectItem value="Dana">Dana</SelectItem>
                      <SelectItem value="ShopeePay">ShopeePay</SelectItem>
                      <SelectItem value="QRIS">QRIS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* NOMINAL TOTAL */}
              <div className="grid gap-2 pt-2">
                <Label htmlFor="nominal" className="font-semibold">
                  Nominal Penagihan Akhir (Rp)
                </Label>
                <div className="relative">
                  <Input
                    id="nominal"
                    placeholder="Rp 0"
                    value={formData.totalAmount}
                    onChange={handleUbahNominal}
                    className="w-full font-bold rounded-xl text-lg h-12 bg-primary/5 border-primary/20 text-primary focus-visible:ring-primary/30"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3 h-3" /> Nominal terkalkulasi dari
                  layanan terpilih. Anda dapat menyesuaikannya secara manual.
                </p>
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
                <Check className="w-4 h-4 mr-2" /> Simpan Data
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==========================================
          ALERT DIALOG (HAPUS DATA)
      ========================================== */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="sm:rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-500">
              <AlertCircle className="w-5 h-5" />
              Hapus Data Transaksi?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm mt-2">
              Tindakan ini tidak dapat dibatalkan. Menghapus invoice{" "}
              <strong className="text-foreground">{idYangDihapus}</strong> akan
              menghilangkan riwayat transaksi ini dari database sistem
              selamanya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={eksekusiHapus}
              className="bg-red-600 text-white hover:bg-red-700 rounded-xl shadow-md"
            >
              Ya, Hapus Permanen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
