import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Users,
  UserCheck,
  UserMinus,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Wallet,
  Check,
  ChevronsUpDown,
} from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { toast } from "sonner";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

import { useAppStore } from "~/store/useAppStore";
import { ConfirmDeleteModal } from "~/components/ui/confirm-delete-modal";
import { convertAndFormatCurrency } from "~/lib/currency";
import { CustomPagination } from "~/components/ui/custom-pagination";
import { cn } from "~/lib/utils";

import type { Client } from "~/types/index";

export default function ClientsPage() {
  const navigate = useNavigate();
  const mataUang = useAppStore((state) => state.preferensi.mataUang);

  // MENGAMBIL DATA CLIENT DAN INVOICE SEKALIGUS
  const { clients, invoices, addClient, updateClient, deleteClient } =
    useAppStore();

  const [openComboboxStatus, setOpenComboboxStatus] = useState(false);
  const [openFilterStatus, setOpenFilterStatus] = useState(false);

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

  // ======================================================================
  // LOGIKA BARU: MENGHITUNG STATISTIK CLIENT SECARA DINAMIS DARI INVOICE
  // ======================================================================
  const clientsWithStats = useMemo(() => {
    return clients.map((client) => {
      const riwayatInvoice = invoices.filter(
        (inv) =>
          inv.clientEmail === client.email || inv.clientName === client.name,
      );

      const hitungTotal = riwayatInvoice.length;
      const hitungPengeluaran = riwayatInvoice.reduce((sum, inv) => {
        // Mengubah "Rp 5.000.000" -> "5000000" lalu di-convert ke Number
        const bersihkanString = inv.totalAmount
          ? inv.totalAmount.replace(/[^0-9]/g, "")
          : "0";
        const angka = Number(bersihkanString) || 0;

        return sum + angka;
      }, 0);

      return {
        ...client,
        totalinvoices: hitungTotal, // (Sesuai dengan properti 'totalinvoices' di type)
        totalSpent: hitungPengeluaran,
      };
    });
  }, [clients, invoices]);

  // Gunakan clientsWithStats (Bukan clients biasa) untuk pencarian dan metrik
  const { dataTersaring, dataAktif, dataNonAktif, totalNilaiTransaksi } =
    useMemo(() => {
      const tersaring = clientsWithStats.filter((item) => {
        const cocokKataKunci =
          item.name?.toLowerCase().includes(kataKunci.toLowerCase()) ||
          item.email?.toLowerCase().includes(kataKunci.toLowerCase());
        const cocokStatus =
          filterStatus === "Semua" || item.status === filterStatus;
        return cocokKataKunci && cocokStatus;
      });

      let aktif = 0,
        nonAktif = 0,
        totalNilai = 0;

      tersaring.forEach((item) => {
        if (item.status === "Aktif") aktif++;
        else if (item.status === "Non-aktif") nonAktif++;
        totalNilai += item.totalSpent || 0;
      });

      return {
        dataTersaring: tersaring,
        dataAktif: aktif,
        dataNonAktif: nonAktif,
        totalNilaiTransaksi: totalNilai,
      };
    }, [clientsWithStats, kataKunci, filterStatus]);

  const totalHalaman = Math.ceil(dataTersaring.length / itemPerHalaman);
  const dataTampil = dataTersaring.slice(
    (halamanSaatIni - 1) * itemPerHalaman,
    halamanSaatIni * itemPerHalaman,
  );

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

    const targetId = formData.id || `CL-${Date.now()}`;

    // Cek duplikasi email (baik untuk tambah maupun edit)
    const isEmailTerpakai = clients.some(
      (item) => item.email === formData.email && item.id !== targetId,
    );

    if (isEmailTerpakai) {
      toast.error(`Gagal! Email ${formData.email} sudah terdaftar.`);
      return;
    }

    if (formMode === "tambah") {
      const payload: Client = { ...formData, id: targetId };
      addClient(payload);
      toast.success(`Berhasil menambahkan klien ${formData.name}!`);
    } else {
      updateClient(targetId, formData);
      toast.success(`Berhasil memperbarui klien ${formData.name}!`);
    }
    setIsDialogOpen(false);
  };

  const eksekusiHapus = () => {
    if (idYangDihapus) {
      const klienTerhapus = clients.find((c) => c.id === idYangDihapus);
      deleteClient(idYangDihapus);
      if (dataTampil.length === 1 && halamanSaatIni > 1)
        setHalamanSaatIni(halamanSaatIni - 1);
      toast.success(`Klien ${klienTerhapus?.name} berhasil dihapus.`);
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

      <div className="grid md:grid-cols-2 gap-4">
        {/* Metric Cards */}
        <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm">
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
        <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0 w-fit mb-3">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="text-2xl font-bold text-foreground">{dataAktif}</div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">
            Pelanggan Aktif
          </div>
        </div>
        <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm">
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
        <div className="flex flex-col p-5 border rounded-2xl bg-card shadow-sm">
          <div className="p-3 bg-sky-500/10 text-sky-500 rounded-xl shrink-0 w-fit mb-3">
            <Wallet className="w-6 h-6" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-foreground truncate">
            {convertAndFormatCurrency(totalNilaiTransaksi, mataUang)}
          </div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">
            Total Nilai Transaksi Klien
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row justify-between gap-3 p-4 border rounded-2xl bg-card shadow-sm">
          <div className="flex flex-1 gap-3">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau email klien..."
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
                      {["Semua", "Aktif", "Non-aktif"].map((status) => (
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
            <Plus className="w-4 h-4" /> Tambah Klien
          </Button>
        </div>

        <div className="border rounded-2xl bg-card shadow-sm overflow-hidden overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Informasi Klien</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead className="text-center">Invoice</TableHead>
                <TableHead>Nilai Transaksi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
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
                      <div className="font-bold">{client.name}</div>
                      <div className="text-xs text-muted-foreground">
                        ID: {client.id}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{client.email}</div>
                      <div className="text-xs text-muted-foreground">
                        {client.phone}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="font-bold mx-auto bg-muted/50 px-3 py-1 rounded-md w-fit">
                        {client.totalinvoices || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold">
                        {convertAndFormatCurrency(
                          client.totalSpent || 0,
                          mataUang,
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border",
                          client.status === "Aktif"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                            : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
                        )}
                      >
                        {client.status || "Non-aktif"}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => bukaFormEdit(client)}
                          className="h-8 w-8 text-blue-600 hover:bg-blue-100"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (client.id) setIdYangDihapus(client.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="h-8 w-8 text-red-600 hover:bg-red-100"
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
              {formMode === "tambah" ? "Tambah Klien Baru" : "Edit Data Klien"}
            </DialogTitle>
            <DialogDescription>
              Lengkapi informasi kontak dan status dari mitra bisnis Anda di
              sini.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4 overflow-y-auto custom-scrollbar flex flex-col gap-5">
            <div className="grid gap-2">
              <Label className="font-semibold">Nama Lengkap</Label>
              <Input
                placeholder="Contoh: Budi Santoso atau PT Maju Mundur"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="rounded-xl h-10 border-border/50"
              />
            </div>
            <div className="grid gap-2">
              <Label className="font-semibold">Email Klien</Label>
              <Input
                type="email"
                placeholder="contoh@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="rounded-xl h-10 border-border/50"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="grid gap-2">
                <Label className="font-semibold text-foreground/90">
                  No. Telepon
                </Label>
                <Input
                  placeholder="08123456789"
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="rounded-xl h-10 border-border/60 bg-background shadow-sm hover:border-primary/40 transition-colors"
                />
              </div>

              <div className="grid gap-2">
                <Label className="font-semibold text-foreground/90">
                  Status Kemitraan
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
                          Pilih Status...
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
                          {["Aktif", "Non-aktif"].map((status) => (
                            <CommandItem
                              key={status}
                              onSelect={() => {
                                setFormData({
                                  ...formData,
                                  status: status,
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
        title="Hapus Data Klien?"
        description={
          <>
            Data klien ini akan dihapus permanen dari daftar.{" "}
            <strong className="text-foreground block mt-1">
              Perhatian: Transaksi (Invoice) yang terkait dengan klien ini
              mungkin akan kehilangan referensi data kontaknya.
            </strong>
          </>
        }
      />
    </div>
  );
}
