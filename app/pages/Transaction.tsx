import React, { useState, useMemo } from "react";
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
  Calendar as CalendarIcon,
  Wallet,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar } from "~/components/ui/calendar";

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
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

import {
  convertAndFormatCurrency,
  parseCurrencyToNumber,
} from "~/lib/currency";
import { useAppStore } from "~/store/useAppStore";
import { ConfirmDeleteModal } from "~/components/ui/confirm-delete-modal";
import { CustomPagination } from "~/components/ui/custom-pagination";

// Import tipe data dari file types
import type { Invoice, Service } from "~/types/index";

// Tipe ekstensi khusus agar sesuai dengan kebutuhan form antarmuka
type TransactionFormData = Invoice & {
  clientEmail?: string;
  paymentMethod?: string;
  date?: string;
  services?: Service[];
};

const generateInvoiceID = (dataInvoices: Invoice[]) => {
  const tgl = new Date();
  const prefix = `INV-${tgl.getFullYear()}${String(tgl.getMonth() + 1).padStart(2, "0")}${String(tgl.getDate()).padStart(2, "0")}-`;
  const invoiceHariIni = dataInvoices.filter((item) =>
    item.invoice.startsWith(prefix),
  );
  let next = 1;
  if (invoiceHariIni.length > 0) {
    next =
      Math.max(
        ...invoiceHariIni.map(
          (item) => parseInt(item.invoice.split("-")[2], 10) || 0,
        ),
      ) + 1;
  }
  return `${prefix}${String(next).padStart(3, "0")}`;
};

export default function TransactionPage() {
  const mataUang = useAppStore((state) => state.preferensi.mataUang);

  // Mengambil data klien dan layanan dari store untuk combobox
  const { clients: daftarKlien, services: dataLayanan } = useAppStore();

  // Mengambil state dan actions invoices dari Global Store Zustand
  const { invoices, addInvoice, updateInvoice, deleteInvoice } = useAppStore();

  const [kataKunci, setKataKunci] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [halamanSaatIni, setHalamanSaatIni] = useState(1);
  const [itemPerHalaman, setItemPerHalaman] = useState(10);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [openComboboxKlien, setOpenComboboxKlien] = useState(false);
  const [openComboboxLayanan, setOpenComboboxLayanan] = useState(false);
  const [formMode, setFormMode] = useState<"tambah" | "edit">("tambah");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [bulanTanggalDibuat, setBulanTanggalDibuat] = useState<Date>(
    new Date(),
  );
  const [bulanJatuhTempo, setBulanJatuhTempo] = useState<Date>(new Date());
  const [openComboboxStatus, setOpenComboboxStatus] = useState(false);
  const [openComboboxMetode, setOpenComboboxMetode] = useState(false);
  const [openFilterStatus, setOpenFilterStatus] = useState(false);

  const [formData, setFormData] = useState<TransactionFormData>({
    id: "",
    invoice: "",
    clientName: "",
    clientEmail: "",
    paymentStatus: "",
    paymentMethod: "",
    totalAmount: "0",
    date: "",
    dueDate: "",
    services: [],
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [idYangDihapus, setIdYangDihapus] = useState<string | null>(null);

  const handleTanggalDibuatChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const tanggalBaru = e.target.value;
    if (tanggalBaru) {
      const [year, month, day] = tanggalBaru.split("-").map(Number);
      const dateObj = new Date(year, month - 1, day);
      dateObj.setDate(dateObj.getDate() + 14);
      const y = dateObj.getFullYear(),
        m = String(dateObj.getMonth() + 1).padStart(2, "0"),
        d = String(dateObj.getDate()).padStart(2, "0");
      setFormData({
        ...formData,
        date: tanggalBaru,
        dueDate: `${y}-${m}-${d}`,
      });
    } else {
      setFormData({ ...formData, date: "", dueDate: "" });
    }
  };

  const { dataTersaring, dataLunas, dataPending, dataBelumBayar, dataGagal } =
    useMemo(() => {
      const tersaring = invoices.filter((item) => {
        const cocokKataKunci =
          item.invoice.toLowerCase().includes(kataKunci.toLowerCase()) ||
          item.clientName.toLowerCase().includes(kataKunci.toLowerCase());
        const cocokStatus =
          filterStatus === "Semua" || item.paymentStatus === filterStatus;
        return cocokKataKunci && cocokStatus;
      });

      let lunas = 0,
        pending = 0,
        belumBayar = 0,
        gagal = 0;
      invoices.forEach((item) => {
        if (item.paymentStatus === "Lunas") lunas++;
        else if (item.paymentStatus === "Pending") pending++;
        else if (item.paymentStatus === "Belum Bayar") belumBayar++;
        else if (item.paymentStatus === "Gagal") gagal++;
      });

      return {
        dataTersaring: tersaring,
        dataLunas: lunas,
        dataPending: pending,
        dataBelumBayar: belumBayar,
        dataGagal: gagal,
      };
    }, [invoices, kataKunci, filterStatus]);

  const totalHalaman = Math.ceil(dataTersaring.length / itemPerHalaman);
  const dataTampil = dataTersaring.slice(
    (halamanSaatIni - 1) * itemPerHalaman,
    halamanSaatIni * itemPerHalaman,
  );

  const toggleRow = (invoiceId: string) =>
    setExpandedRow((prev) => (prev === invoiceId ? null : invoiceId));

  const bukaFormTambah = () => {
    const dateObj = new Date();
    const tglDibuat = dateObj.toISOString().split("T")[0];
    dateObj.setDate(dateObj.getDate() + 14);
    const tglJatuhTempo = dateObj.toISOString().split("T")[0];

    setFormMode("tambah");
    setSelectedServices([]);
    setFormData({
      id: `id-${Date.now()}`,
      invoice: generateInvoiceID(invoices),
      clientName: "",
      clientEmail: "",
      paymentStatus: "Pending",
      paymentMethod: "Transfer Bank",
      totalAmount: "0",
      date: tglDibuat,
      dueDate: tglJatuhTempo,
      services: [],
    });
    setIsDialogOpen(true);
  };

  const bukaFormEdit = (dataAsli: TransactionFormData) => {
    setFormMode("edit");
    setSelectedServices(dataAsli.services || []);
    setFormData(dataAsli);
    setIsDialogOpen(true);
  };

  const handleSimpan = () => {
    const nominalAkhir = parseCurrencyToNumber(formData.totalAmount);
    if (
      !formData.invoice ||
      !formData.clientName ||
      !formData.paymentStatus ||
      nominalAkhir <= 0
    ) {
      toast.error(
        "Gagal! Pastikan data klien, status, dan nominal diisi dengan benar.",
      );
      return;
    }
    const finalData: Invoice = {
      ...formData,
      services: selectedServices, // Terkait di ekstensi type
      totalAmount: nominalAkhir.toString(),
    };

    if (formMode === "tambah") {
      addInvoice(finalData);
      toast.success(`Berhasil menambahkan invoice ${formData.invoice}!`);
    } else {
      updateInvoice(formData.id, finalData);
      toast.success(`Berhasil memperbarui invoice ${formData.invoice}!`);
    }
    setIsDialogOpen(false);
  };

  const eksekusiHapus = () => {
    if (idYangDihapus) {
      deleteInvoice(idYangDihapus);
      if (dataTampil.length === 1 && halamanSaatIni > 1)
        setHalamanSaatIni(halamanSaatIni - 1);
      toast.success(`Invoice berhasil dihapus dari sistem.`);
    }
    setIsDeleteDialogOpen(false);
    setIdYangDihapus(null);
  };

  const hitungTotalLayanan = (layananSaatIni: Service[]) =>
    setFormData({
      ...formData,
      totalAmount: layananSaatIni
        .reduce((acc, curr) => acc + curr.harga, 0)
        .toString(),
    });

  const tambahLayanan = (layanan: Service) => {
    const baru = [...selectedServices, layanan];
    setSelectedServices(baru);
    hitungTotalLayanan(baru);
  };

  const hapusLayanan = (index: number) => {
    const baru = selectedServices.filter((_, idx) => idx !== index);
    setSelectedServices(baru);
    hitungTotalLayanan(baru);
  };

  return (
    <div className="max-w-6xl py-8 mx-auto font-sans flex flex-col gap-10 px-4 xl:px-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm col-span-2 md:col-span-1">
          <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0 w-fit mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold">{invoices.length}</div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">
            Total Transaksi
          </div>
        </div>
        <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0 w-fit mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="text-2xl font-bold">{dataLunas}</div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">
            Lunas
          </div>
        </div>
        <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl shrink-0 w-fit mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <div className="text-2xl font-bold">{dataPending}</div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">
            Pending
          </div>
        </div>
        <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm">
          <div className="p-3 bg-sky-500/10 text-sky-500 rounded-xl shrink-0 w-fit mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="text-2xl font-bold">{dataBelumBayar}</div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">
            Belum Bayar
          </div>
        </div>
        <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-xl shrink-0 w-fit mb-3">
            <XCircle className="w-6 h-6" />
          </div>
          <div className="text-2xl font-bold">{dataGagal}</div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">
            Gagal
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row justify-between gap-3 p-4 border rounded-2xl bg-card shadow-sm">
          <div className="flex flex-1 gap-3">
            <div className="relative md:max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari ID invoice atau klien..."
                value={kataKunci}
                onChange={(e) => {
                  setKataKunci(e.target.value);
                  setHalamanSaatIni(1);
                }}
                className="pl-9 rounded-xl w-full h-10 border-border/50"
              />
            </div>
            <Popover open={openFilterStatus} onOpenChange={setOpenFilterStatus}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openFilterStatus}
                  className="w-[180px] justify-between font-normal rounded-xl h-10 border-border/60 bg-background shadow-sm hover:border-primary/40 hover:bg-muted/20 transition-all"
                >
                  <span className="truncate">{filterStatus}</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[180px] p-0 rounded-xl shadow-lg border-border/60"
                align="end"
              >
                <Command>
                  <CommandList>
                    <CommandEmpty>Status tidak ditemukan.</CommandEmpty>
                    <CommandGroup>
                      {[
                        "Semua",
                        "Lunas",
                        "Pending",
                        "Belum Bayar",
                        "Gagal",
                      ].map((status) => (
                        <CommandItem
                          key={status}
                          onSelect={() => {
                            setFilterStatus(status);
                            setHalamanSaatIni(1);
                            setOpenFilterStatus(false);
                          }}
                          className="rounded-lg cursor-pointer my-0.5 font-medium"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 text-primary shrink-0",
                              filterStatus === status
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <span className="truncate">{status}</span>
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
            className="rounded-xl gap-2 shadow-sm font-semibold h-10"
          >
            <Plus className="w-4 h-4" /> Tambah Transaksi
          </Button>
        </div>

        <div className="border rounded-2xl bg-card shadow-sm overflow-hidden overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Invoice / Klien</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataTampil.map((invoice: any) => (
                <React.Fragment key={invoice.invoice}>
                  <TableRow
                    className="cursor-pointer hover:bg-muted/40 transition-colors group"
                    onClick={() => toggleRow(invoice.invoice)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-1.5 rounded-md ${expandedRow === invoice.invoice ? "bg-primary/10 text-primary" : "text-muted-foreground group-hover:bg-muted"}`}
                        >
                          {expandedRow === invoice.invoice ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold">{invoice.invoice}</div>
                          <div className="text-xs text-muted-foreground">
                            {invoice.clientName}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border",
                          invoice.paymentStatus === "Lunas"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                            : invoice.paymentStatus === "Pending"
                              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                              : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
                        )}
                      >
                        {invoice.paymentStatus}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                        <Wallet className="w-3 h-3" />{" "}
                        {invoice.paymentMethod || "Transfer"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{invoice.date}</div>
                      <div className="text-xs text-muted-foreground">
                        Batas: {invoice.dueDate}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {convertAndFormatCurrency(
                        parseCurrencyToNumber(invoice.totalAmount),
                        mataUang,
                      )}
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
                          className="h-8 w-8 text-blue-600 hover:bg-blue-100"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIdYangDihapus(invoice.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="h-8 w-8 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedRow === invoice.invoice && (
                    <TableRow className="bg-muted/10 border-b-0">
                      <TableCell colSpan={6} className="p-0 border-b">
                        <div className="p-5 pl-12 border-l-4 border-l-primary mx-4 my-3 bg-card rounded-r-xl shadow-sm border border-border/50">
                          <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-primary" /> Rincian
                            Layanan Tertagih
                          </h4>
                          {invoice.services?.length ? (
                            <div className="flex flex-col gap-3 max-w-3xl">
                              {invoice.services.map(
                                (svc: Service, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex justify-between items-center bg-muted/30 border border-border/50 rounded-xl p-3.5 text-sm"
                                  >
                                    <div>
                                      <p className="font-semibold">
                                        {svc.nama}
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {svc.deskripsi}
                                      </p>
                                    </div>
                                    <p className="font-bold bg-background px-3 py-1.5 rounded-lg border shadow-sm">
                                      {convertAndFormatCurrency(
                                        svc.harga,
                                        mataUang,
                                      )}
                                    </p>
                                  </div>
                                ),
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">
                              Tidak ada rincian layanan.
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
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
        <DialogContent className="sm:max-w-[650px] sm:rounded-[1.5rem] p-0 overflow-hidden border border-border/50 shadow-2xl flex flex-col max-h-[90vh]">
          <div className="h-2 w-full bg-gradient-to-r from-primary to-primary/60 shrink-0"></div>

          <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
            <DialogTitle className="text-2xl font-bold tracking-tight">
              {formMode === "tambah"
                ? "Buat Invoice Baru"
                : "Ubah Data Invoice"}
            </DialogTitle>
            <DialogDescription>
              Isi parameter transaksi dan detail penagihan untuk dicatat ke
              dalam sistem.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4 overflow-y-auto custom-scrollbar flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="grid gap-2">
                <Label className="font-semibold">Nomor Invoice</Label>
                <Input
                  placeholder="Contoh: INV-..."
                  value={formData.invoice}
                  onChange={(e) =>
                    setFormData({ ...formData, invoice: e.target.value })
                  }
                  className="rounded-xl uppercase bg-muted/20 font-medium h-10 border-border/50"
                  disabled={formMode === "edit"}
                />
              </div>

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
                      className="w-full justify-between font-normal rounded-xl h-10 border-border/50"
                    >
                      {formData.clientName || (
                        <span className="text-muted-foreground">
                          Pilih klien...
                        </span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl"
                    align="start"
                  >
                    <Command>
                      <CommandInput placeholder="Cari klien yang terdaftar..." />
                      <CommandList>
                        <CommandEmpty>Klien tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {daftarKlien.map((klien, i) => (
                            <CommandItem
                              key={i}
                              onSelect={(val) => {
                                const dat = daftarKlien.find(
                                  (k) => k.name.toLowerCase() === val,
                                );
                                setFormData({
                                  ...formData,
                                  clientName: dat?.name || val,
                                  clientEmail: dat?.email || "",
                                });
                                setOpenComboboxKlien(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 text-primary",
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="grid gap-2">
                <Label className="font-semibold">Tanggal Dibuat</Label>
                <Popover
                  onOpenChange={(open) => {
                    if (open && formData.date)
                      setBulanTanggalDibuat(
                        new Date(formData.date.replace(/-/g, "/")),
                      );
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal rounded-xl h-10 border-border/50",
                        !formData.date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? (
                        format(new Date(formData.date), "PPP", { locale: id })
                      ) : (
                        <span>Pilih tanggal</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-xl">
                    <Calendar
                      mode="single"
                      selected={
                        formData.date ? new Date(formData.date) : undefined
                      }
                      month={bulanTanggalDibuat}
                      onMonthChange={setBulanTanggalDibuat}
                      onSelect={(date) => {
                        if (date) {
                          const y = date.getFullYear(),
                            m = String(date.getMonth() + 1).padStart(2, "0"),
                            d = String(date.getDate()).padStart(2, "0");
                          handleTanggalDibuatChange({
                            target: { value: `${y}-${m}-${d}` },
                          } as any);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-rose-500">
                  Jatuh Tempo (Net 14)
                </Label>
                <Popover
                  onOpenChange={(open) => {
                    if (open && formData.dueDate)
                      setBulanJatuhTempo(
                        new Date(formData.dueDate.replace(/-/g, "/")),
                      );
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal rounded-xl h-10 bg-rose-500/5 border-rose-500/30",
                        !formData.dueDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-rose-500" />
                      {formData.dueDate ? (
                        <span className="text-rose-600 font-medium">
                          {format(new Date(formData.dueDate), "PPP", {
                            locale: id,
                          })}
                        </span>
                      ) : (
                        <span>Pilih tanggal</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-xl">
                    <Calendar
                      mode="single"
                      selected={
                        formData.dueDate
                          ? new Date(formData.dueDate)
                          : undefined
                      }
                      month={bulanJatuhTempo}
                      onMonthChange={setBulanJatuhTempo}
                      onSelect={(date) => {
                        if (date) {
                          const y = date.getFullYear(),
                            m = String(date.getMonth() + 1).padStart(2, "0"),
                            d = String(date.getDate()).padStart(2, "0");
                          handleTanggalDibuatChange({
                            target: { value: `${y}-${m}-${d}` },
                          } as any);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* DAFTAR LAYANAN - Improved UI */}
            <div className="grid gap-4 p-5 rounded-2xl border border-border/60 bg-muted/5">
              <Label className="font-bold text-primary flex items-center gap-2">
                <Receipt className="w-4 h-4" /> Item / Layanan Tertagih
              </Label>
              <Popover
                open={openComboboxLayanan}
                onOpenChange={setOpenComboboxLayanan}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between font-normal text-muted-foreground rounded-xl h-10 bg-background border-dashed border-border/80 hover:border-primary/50"
                  >
                    <span className="flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Sisipkan layanan dari
                      katalog...
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl"
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder="Cari nama layanan..." />
                    <CommandList>
                      <CommandEmpty>
                        Katalog layanan tidak ditemukan.
                      </CommandEmpty>
                      <CommandGroup>
                        {dataLayanan.map((lay) => (
                          <CommandItem
                            key={lay.id}
                            onSelect={() => {
                              tambahLayanan(lay);
                              setOpenComboboxLayanan(false);
                            }}
                          >
                            <div className="flex justify-between w-full">
                              <span className="font-medium">{lay.nama}</span>
                              <span className="text-xs bg-muted px-2 py-1 rounded-md font-bold">
                                {convertAndFormatCurrency(lay.harga, mataUang)}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {selectedServices.length > 0 && (
                <div className="flex flex-col gap-2.5 mt-2">
                  {selectedServices.map((lay, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-background px-4 py-3 rounded-xl border border-border/50 shadow-sm"
                    >
                      <span className="font-semibold text-sm">{lay.nama}</span>
                      <div className="flex gap-4 items-center">
                        <span className="font-bold text-sm text-muted-foreground">
                          {convertAndFormatCurrency(lay.harga, mataUang)}
                        </span>
                        <button
                          onClick={() => hapusLayanan(idx)}
                          className="text-muted-foreground/50 hover:text-red-500 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* STATUS & METODE */}
            <div className="grid md:grid-cols-2 gap-5">
              <div className="grid gap-2">
                <Label className="font-semibold text-foreground/90">
                  Status Pembayaran
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
                      {formData.paymentStatus || (
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
                          {["Lunas", "Pending", "Belum Bayar", "Gagal"].map(
                            (status) => (
                              <CommandItem
                                key={status}
                                onSelect={() => {
                                  setFormData({
                                    ...formData,
                                    paymentStatus: status,
                                  });
                                  setOpenComboboxStatus(false);
                                }}
                                className="rounded-lg cursor-pointer my-0.5 font-medium"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4 text-primary",
                                    formData.paymentStatus === status
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

              <div className="grid gap-2">
                <Label className="font-semibold text-foreground/90">
                  Metode Transaksi
                </Label>
                <Popover
                  open={openComboboxMetode}
                  onOpenChange={setOpenComboboxMetode}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openComboboxMetode}
                      className="w-full justify-between font-normal rounded-xl h-10 border-border/60 bg-background shadow-sm hover:border-primary/40 hover:bg-muted/20 transition-all"
                    >
                      {formData.paymentMethod || (
                        <span className="text-muted-foreground">
                          Pilih metode...
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
                        <CommandEmpty>Metode tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {["Transfer Bank", "GoPay", "QRIS"].map((metode) => (
                            <CommandItem
                              key={metode}
                              onSelect={() => {
                                setFormData({
                                  ...formData,
                                  paymentMethod: metode,
                                });
                                setOpenComboboxMetode(false);
                              }}
                              className="rounded-lg cursor-pointer my-0.5 font-medium"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 text-primary",
                                  formData.paymentMethod === metode
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {metode}
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
              <Label className="font-semibold text-base">
                Nominal Penagihan Akhir
              </Label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-sm font-bold text-muted-foreground/70">
                  {mataUang === "USD" ? "$" : "Rp"}
                </div>
                <Input
                  type="number"
                  placeholder="0"
                  value={parseCurrencyToNumber(formData.totalAmount) || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, totalAmount: e.target.value })
                  }
                  className="rounded-xl pl-11 h-12 font-bold font-mono text-lg border-border/60 shadow-sm"
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
              Batalkan
            </Button>
            <Button
              onClick={handleSimpan}
              className="rounded-xl shadow-md font-bold h-10"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Simpan Transaksi
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
        title="Hapus Data Transaksi?"
        description={
          <>
            Tindakan ini tidak dapat dibatalkan. Transaksi ini akan
            menghilangkan riwayatnya dari sistem selamanya.
          </>
        }
      />
    </div>
  );
}
