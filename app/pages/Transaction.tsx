import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Check, ChevronsUpDown, X, ChevronDown, ChevronUp } from "lucide-react";
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
export default function Home() {
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
        <h1 className="text-3xl font-bold tracking-tight">Daftar Transaksi</h1>
        <p className="text-muted-foreground mt-1">Daftar transaksi terbaru.</p>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Keseluruhan invoice
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Berhasil Lunas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataLunas}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Pembayaran diterima
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataPending}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Menunggu konfirmasi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-sky-700 dark:text-sky-400">
              Belum Bayar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataBelumBayar}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Belum ada transaksi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">
              Gagal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataGagal}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Gagal transaksi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FILTER BAR SECTION */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-1 flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <Input
              placeholder="Cari nomor invoice atau nama klien..."
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
                <SelectItem value="Lunas">Lunas</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Belum Bayar">Belum Bayar</SelectItem>
                <SelectItem value="Gagal">Gagal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={bukaFormTambah}
            className="cursor-pointer rounded-md shrink-0"
          >
            + Tambah Data
          </Button>
        </div>

        {/* TABEL DATA */}
        <div className="border rounded-md bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-56">Invoice / Klien</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Tanggal / Batas</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center w-40">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataTampil.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center h-24 text-muted-foreground"
                  >
                    Tidak ada data ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                dataTampil.map((invoice) => (
                  <React.Fragment key={invoice.invoice}>
                    {/* BARIS UTAMA (CLICKABLE) */}
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => toggleRow(invoice.invoice)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {expandedRow === invoice.invoice ? (
                            <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                          )}
                          <div>
                            <div className="font-semibold text-foreground">
                              {invoice.invoice}
                            </div>
                            <div className="text-xs text-muted-foreground max-w-[150px] truncate">
                              {invoice.clientName}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            invoice.paymentStatus === "Lunas"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900 shadow-none"
                              : invoice.paymentStatus === "Pending"
                                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900 shadow-none"
                                : invoice.paymentStatus === "Belum Bayar"
                                  ? "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900 shadow-none"
                                  : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900 shadow-none"
                          }
                        >
                          {invoice.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>{invoice.paymentMethod}</TableCell>
                      <TableCell>
                        <div className="text-xs font-medium">
                          {invoice.date}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Hingga: {invoice.dueDate}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {invoice.totalAmount}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation(); // Mencegah baris Accordion terbuka saat klik tombol ini
                              bukaFormEdit(invoice);
                            }}
                            className="cursor-pointer"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              konfirmasiHapus(invoice.invoice);
                            }}
                            className="cursor-pointer"
                          >
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* BARIS ACCORDION (DETAIL LAYANAN) */}
                    {expandedRow === invoice.invoice && (
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableCell colSpan={6} className="p-0 border-b">
                          <div className="p-4 pl-10 border-l-2 border-l-primary ml-2 my-2">
                            <h4 className="font-semibold text-sm mb-3">
                              Rincian Layanan:
                            </h4>
                            {invoice.services && invoice.services.length > 0 ? (
                              <div className="flex flex-col gap-2 max-w-2xl">
                                {invoice.services.map((svc, idx) => (
                                  <div
                                    key={idx}
                                    className="flex justify-between items-center bg-background border rounded-md p-3 text-sm shadow-sm"
                                  >
                                    <div>
                                      <p className="font-medium text-foreground">
                                        {svc.nama}
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        {svc.deskripsi}
                                      </p>
                                    </div>
                                    <p className="font-medium shrink-0">
                                      Rp {svc.harga.toLocaleString("id-ID")}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">
                                Tidak ada data rincian layanan tersimpan.
                              </p>
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

      {/* FORM DIALOG (TAMBAH / EDIT) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>
              {formMode === "tambah"
                ? "Tambah Data Transaksi"
                : "Edit Data Transaksi"}
            </DialogTitle>
            <DialogDescription>
              {formMode === "tambah"
                ? "Masukkan detail transaksi baru. Pilih layanan untuk mengkalkulasi nominal secara otomatis."
                : "Ubah detail transaksi yang sudah ada."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
            {/* KODE INVOICE */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="invoice" className="text-right">
                Invoice
              </Label>
              <Input
                id="invoice"
                placeholder="INV-YYYYMMDD-XXX"
                value={formData.invoice}
                onChange={(e) =>
                  setFormData({ ...formData, invoice: e.target.value })
                }
                className="col-span-3 rounded-md uppercase"
                disabled={formMode === "edit"}
              />
            </div>

            {/* KLIEN (COMBOBOX) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Nama Klien</Label>
              <div className="col-span-3">
                <Popover
                  open={openComboboxKlien}
                  onOpenChange={setOpenComboboxKlien}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openComboboxKlien}
                      className="w-full justify-between font-normal"
                    >
                      {formData.clientName
                        ? formData.clientName
                        : "Pilih atau cari klien..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Cari nama klien..." />
                      <CommandList>
                        <CommandEmpty>Klien tidak ditemukan.</CommandEmpty>
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
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.clientName === klien.name
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {klien.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* EMAIL KLIEN (READ ONLY) */}
            {formData.clientEmail && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-muted-foreground">
                  Email
                </Label>
                <div className="col-span-3 text-sm text-muted-foreground">
                  {formData.clientEmail}
                </div>
              </div>
            )}

            {/* LAYANAN (COMBOBOX) */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2">Layanan</Label>
              <div className="col-span-3 flex flex-col gap-2">
                <Popover
                  open={openComboboxLayanan}
                  onOpenChange={setOpenComboboxLayanan}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openComboboxLayanan}
                      className="w-full justify-between font-normal text-muted-foreground"
                    >
                      + Tambah item layanan...
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Cari layanan..." />
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
                            >
                              <div className="flex flex-col w-full">
                                <span className="font-medium">
                                  {layanan.nama}
                                </span>
                                <span className="text-xs text-muted-foreground">
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
                  <div className="flex flex-col gap-2 mt-2">
                    {selectedServices.map((layanan, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-muted/50 p-2 rounded-md text-sm border"
                      >
                        <span className="truncate pr-2">{layanan.nama}</span>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-medium text-xs">
                            Rp {layanan.harga.toLocaleString("id-ID")}
                          </span>
                          <button
                            type="button"
                            onClick={() => hapusLayanan(idx)}
                            className="text-muted-foreground hover:text-destructive cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* NOMINAL TOTAL */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nominal" className="text-right">
                Total (Rp)
              </Label>
              <div className="col-span-3">
                <Input
                  id="nominal"
                  placeholder="Rp 0"
                  value={formData.totalAmount}
                  onChange={handleUbahNominal}
                  className="w-full font-semibold rounded-md text-primary"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  *Nominal dikalkulasi otomatis dari layanan terpilih, atau ubah
                  secara manual.
                </p>
              </div>
            </div>

            {/* STATUS PEMBAYARAN */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(val) =>
                    setFormData({ ...formData, paymentStatus: val })
                  }
                >
                  <SelectTrigger id="status" className="w-full rounded-md">
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lunas">Lunas</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Belum Bayar">Belum Bayar</SelectItem>
                    <SelectItem value="Gagal">Gagal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* METODE PEMBAYARAN */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="metode" className="text-right">
                Metode
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(val) =>
                    setFormData({ ...formData, paymentMethod: val })
                  }
                >
                  <SelectTrigger id="metode" className="w-full rounded-md">
                    <SelectValue placeholder="Pilih Metode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Transfer Bank">Transfer Bank</SelectItem>
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSimpan}>Simpan Data</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ALERT DIALOG (HAPUS DATA) */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Invoice{" "}
              <strong>{idYangDihapus}</strong> akan dihapus secara permanen dari
              sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={eksekusiHapus}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ya, Hapus Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
