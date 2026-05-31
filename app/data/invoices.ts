export type Invoice = {
  id: string;
  invoice: string;
  clientName: string;
  clientEmail: string;
  paymentStatus: string;
  totalAmount: string;
  paymentMethod: string;
  date: string;
  dueDate: string;
};

// ==========================================
// DATA PENGATURAN ADMIN (USER)
// ==========================================
export type AdminSettings = {
  profil: {
    nama: string;
    email: string;
    telepon: string;
  };
  perusahaan: {
    nama: string;
    alamat: string;
  };
  rekening: {
    namaBank: string;
    nomor: string;
    pemilik: string;
  };
  preferensi: {
    tema: string;
    mataUang: string;
    notifikasiEmail: boolean;
  };
};

export const defaultAdminSettings: AdminSettings = {
  profil: {
    nama: "Razan Muhammad Fauzan Sya'bani",
    email: "razan@fauzansyabani.dev",
    telepon: "081234567890",
  },
  perusahaan: {
    nama: "Razan Web Studio",
    alamat: "Bandung, Jawa Barat",
  },
  rekening: {
    namaBank: "Bank Mandiri",
    nomor: "13000XXXXXXXX",
    pemilik: "Razan Muhammad Fauzan Sya'bani",
  },
  preferensi: {
    tema: "light",
    mataUang: "IDR",
    notifikasiEmail: true,
  },
};

// ==========================================
// GENERATOR DATA INVOICE
// ==========================================
const pilihanStatus = ["Lunas", "Pending", "Belum Bayar", "Gagal"];
const pilihanMetode = [
  "Transfer Bank",
  "GoPay",
  "Kartu Kredit",
  "OVO",
  "Dana",
  "ShopeePay",
  "QRIS",
];

const daftarKlien = [
  { name: "Studio Ghibli Inc.", email: "finance@ghibli.jp" },
  { name: "Tokopedia", email: "billing@tokopedia.com" },
  { name: "PT. Mencari Cinta Sejati", email: "halo@mencaricinta.id" },
  { name: "Razan Sya'bani Tech", email: "razan@fauzansyabani.dev" },
  { name: "Reyna Juwita Design", email: "reyna@juwita.co" },
  { name: "Bandung Creative Studio", email: "contact@bdgcreative.com" },
  { name: "Anomali Coffee Roasters", email: "invoice@anomalicoffee.id" },
];

function generateRandomDate(startMonth: number, endMonth: number) {
  const year = 2026;
  const month =
    Math.floor(Math.random() * (endMonth - startMonth + 1)) + startMonth;
  const day = Math.floor(Math.random() * 28) + 1;
  return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

export const dataAwal: Invoice[] = Array.from({ length: 100 }).map(
  (_, index) => {
    const nomorUrut = (index + 1).toString().padStart(3, "0");
    const statusAcak =
      pilihanStatus[Math.floor(Math.random() * pilihanStatus.length)];
    const metodeAcak =
      pilihanMetode[Math.floor(Math.random() * pilihanMetode.length)];
    const klienAcak =
      daftarKlien[Math.floor(Math.random() * daftarKlien.length)];

    const nominalAngka = Math.floor(Math.random() * 100 + 1) * 50000;
    const nominalString = "Rp " + nominalAngka.toLocaleString("id-ID");

    const tglDibuat = generateRandomDate(1, 5);
    const dateObj = new Date(tglDibuat);
    dateObj.setDate(dateObj.getDate() + 14);
    const tglJatuhTempo = dateObj.toISOString().split("T")[0];

    return {
      id: `id-${nomorUrut}`,
      invoice: `INV${nomorUrut}`,
      clientName: klienAcak.name,
      clientEmail: klienAcak.email,
      paymentStatus: statusAcak,
      totalAmount: nominalString,
      paymentMethod: metodeAcak,
      date: tglDibuat,
      dueDate: tglJatuhTempo,
    };
  },
);
