import { useState } from "react";
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
import { dataAwal, type Invoice } from "~/data/invoices";
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
import { toast } from "sonner";

// 1. IMPORT KOMPONEN BADGE SHADCN
import { Badge } from "~/components/ui/badge";

export default function Home() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState(dataAwal);
  const [kataKunci, setKataKunci] = useState("");
  const [halamanSaatIni, setHalamanSaatIni] = useState(1);
  const itemPerHalaman = 10;

  // ==========================================
  // STATE UNTUK DIALOG & FORM
  // ==========================================
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"tambah" | "edit">("tambah");
  const [formData, setFormData] = useState<Invoice>({
    invoice: "",
    paymentStatus: "",
    paymentMethod: "",
    totalAmount: "",
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [idYangDihapus, setIdYangDihapus] = useState<string | null>(null);

  // ==========================================
  // LOGIKA MENGHITUNG CARD & PAGINATION
  // ==========================================
  const dataTersaring = invoices.filter((item) =>
    item.invoice.toLowerCase().includes(kataKunci.toLowerCase()),
  );
  const dataLunas = invoices.filter(
    (item) => item.paymentStatus === "Lunas",
  ).length;
  const dataBelumLunas = invoices.filter(
    (item) => item.paymentStatus !== "Lunas",
  ).length;

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
      invoice: "",
      paymentStatus: "Pending",
      paymentMethod: "Transfer Bank",
      totalAmount: "Rp ",
    });
    setIsDialogOpen(true);
  };

  const bukaFormEdit = (dataAsli: Invoice) => {
    setFormMode("edit");
    setFormData(dataAsli);
    setIsDialogOpen(true);
  };

  const handleSimpan = () => {
    if (
      !formData.invoice ||
      !formData.paymentStatus ||
      !formData.totalAmount ||
      formData.totalAmount === "Rp "
    ) {
      toast.error("Gagal! Semua kolom harus diisi dengan benar.");
      return;
    }

    if (formMode === "tambah") {
      const isExist = invoices.some(
        (item) => item.invoice === formData.invoice,
      );
      if (isExist) {
        toast.error(`Gagal! Invoice ${formData.invoice} sudah digunakan.`);
        return;
      }
      setInvoices([formData, ...invoices]);
      toast.success(`Berhasil menambahkan invoice ${formData.invoice}!`);
    } else {
      const dataBaru = invoices.map((item) =>
        item.invoice === formData.invoice ? formData : item,
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
      for (let i = 1; i <= totalHalaman; i++) {
        items.push(i);
      }
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
        <h1 className="text-3xl font-bold tracking-tight">Halaman Utama</h1>
        <p className="text-muted-foreground mt-1">Daftar transaksi terbaru.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
              Pembayaran telah diterima
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">
              Menunggu Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataBelumLunas}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Pending, Belum Bayar ataupun Gagal
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <Input
            placeholder="Cari nomor invoice..."
            value={kataKunci}
            onChange={(e) => {
              setKataKunci(e.target.value);
              setHalamanSaatIni(1);
            }}
            className="max-w-sm"
          />
          <Button onClick={bukaFormTambah}>+ Tambah Data</Button>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Invoice</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center w-[200px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataTampil.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center h-24 text-muted-foreground"
                  >
                    Tidak ada data ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                dataTampil.map((invoice) => (
                  <TableRow key={invoice.invoice}>
                    <TableCell className="font-medium">
                      {invoice.invoice}
                    </TableCell>

                    {/* 2. PENERAPAN BADGE SHADCN DENGAN CONDITIONAL CLASS */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          invoice.paymentStatus === "Lunas"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900"
                            : invoice.paymentStatus === "Pending"
                              ? "bg-amber-50 text-amber-700 border-amber-200 shadow-none dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900"
                              : invoice.paymentStatus === "Belum Bayar"
                                ? "bg-sky-50 text-sky-700 border-sky-200 shadow-none dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900"
                                : "bg-red-50 text-red-700 border-red-200 shadow-none dark:bg-red-950/40 dark:text-red-400 dark:border-red-900"
                        }
                      >
                        {invoice.paymentStatus}
                      </Badge>
                    </TableCell>

                    <TableCell>{invoice.paymentMethod}</TableCell>
                    <TableCell className="text-right">
                      {invoice.totalAmount}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => bukaFormEdit(invoice)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => konfirmasiHapus(invoice.invoice)}
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

        {totalHalaman > 0 && (
          <div className="py-4">
            <Pagination>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {formMode === "tambah"
                ? "Tambah Data Transaksi"
                : "Edit Data Transaksi"}
            </DialogTitle>
            <DialogDescription>
              {formMode === "tambah"
                ? "Masukkan detail transaksi baru."
                : "Ubah detail transaksi yang sudah ada."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="invoice" className="text-right">
                Invoice
              </Label>
              <Input
                id="invoice"
                placeholder="INVXXX"
                value={formData.invoice}
                onChange={(e) =>
                  setFormData({ ...formData, invoice: e.target.value })
                }
                className="col-span-3"
                disabled={formMode === "edit"}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 col-span-3"
                value={formData.paymentStatus}
                onChange={(e) =>
                  setFormData({ ...formData, paymentStatus: e.target.value })
                }
              >
                <option value="Lunas">Lunas</option>
                <option value="Pending">Pending</option>
                <option value="Belum Bayar">Belum Bayar</option>
                <option value="Gagal">Gagal</option>
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="metode" className="text-right">
                Metode
              </Label>
              <select
                id="metode"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 col-span-3"
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData({ ...formData, paymentMethod: e.target.value })
                }
              >
                <option value="Transfer Bank">Transfer Bank</option>
                <option value="GoPay">GoPay</option>
                <option value="Kartu Kredit">Kartu Kredit</option>
                <option value="OVO">OVO</option>
                <option value="Dana">Dana</option>
                <option value="ShopeePay">ShopeePay</option>
                <option value="QRIS">QRIS</option>
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nominal" className="text-right">
                Total
              </Label>
              <Input
                id="nominal"
                placeholder="Rp 0"
                value={formData.totalAmount}
                onChange={handleUbahNominal}
                className="col-span-3 font-medium"
              />
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

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah kamu yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak bisa dibatalkan. Data invoice{" "}
              <strong>{idYangDihapus}</strong> akan dihapus secara permanen dari
              sistem ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIdYangDihapus(null)}>
              Batal
            </AlertDialogCancel>
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
