// Impor tipe data langsung dari root types Anda agar selalu sinkron
import type {
  Invoice,
  TeamMember,
  Expense,
  UserType, // menggunakan UserType sesuai types/index.ts
  Service,
  Client,
} from "~/types/index";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: string;
}

export type AdminSettings = {
  profil: {
    nama: string;
    email: string;
    telepon: string;
    avatar?: string;
  };
  perusahaan: {
    nama: string;
    alamat: string;
    telepon: string;
    email: string;
    npwp: string;
    website: string;
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
    avatar: "",
  },
  perusahaan: {
    nama: "Razan Web Studio",
    alamat: "Bandung, Jawa Barat",
    telepon: "(022) 1234567",
    email: "hello@fauzansyabani.dev",
    npwp: "00.000.000.0-000.000",
    website: "www.fauzansyabani.dev",
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

export const dataAwalTim: TeamMember[] = [
  {
    id: "USR-01",
    nama: "Razan Muhammad Fauzan Sya'bani",
    email: "razan@fauzansyabani.dev",
    role: "Admin",
    status: "Aktif",
  },
  {
    id: "USR-02",
    nama: "Riana Putri",
    email: "riana.p@billify.com",
    role: "Finance",
    status: "Aktif",
  },
  {
    id: "USR-03",
    nama: "Budi Pratama",
    email: "budi@sales.com",
    role: "Viewer",
    status: "Mengundang",
  },
  {
    id: "USR-04",
    nama: "Jessica Wong",
    email: "jess@ex-partner.com",
    role: "Finance",
    status: "Ditangguhkan",
  },
];

export const dataAwalExpense: Expense[] = [
  {
    id: "EXP-001",
    deskripsi: "Sewa Server AWS",
    kategori: "Operasional",
    jumlah: 2400000,
    tanggal: "2026-05-10",
    status: "Dibayar",
  },
  {
    id: "EXP-002",
    deskripsi: "Langganan Figma Pro",
    kategori: "Tools/Software",
    jumlah: 450000,
    tanggal: "2026-05-12",
    status: "Dibayar",
  },
  {
    id: "EXP-003",
    deskripsi: "Iklan Facebook & IG Ads",
    kategori: "Pemasaran",
    jumlah: 5000000,
    tanggal: "2026-05-15",
    status: "Pending",
  },
  {
    id: "EXP-004",
    deskripsi: "Gaji Staf Freelance",
    kategori: "Gaji/Upah",
    jumlah: 7500000,
    tanggal: "2026-05-25",
    status: "Dibayar",
  },
];

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

export const defaultUsers: UserType[] = [
  {
    id: "USR-001",
    name: "Razan Muhammad Fauzan Sya'bani",
    email: "razan@fauzansyabani.dev",
    password: "password123",
    avatar: "",
    role: "Admin",
  },
];

export const daftarKlien: Client[] = [
  {
    name: "Studio Ghibli Inc.",
    email: "finance@ghibli.jp",
    phone: "08111222333",
  },
  { name: "Tokopedia", email: "billing@tokopedia.com", phone: "08222333444" },
  {
    name: "PT. Mencari Cinta Sejati",
    email: "halo@mencaricinta.id",
    phone: "08333444555",
  },
  {
    name: "Razan Sya'bani Tech",
    email: "razan@fauzansyabani.dev",
    phone: "08444555666",
  },
  {
    name: "Reyna Juwita Design",
    email: "reyna@juwita.co",
    phone: "08555666777",
  },
  {
    name: "Bandung Creative Studio",
    email: "contact@bdgcreative.com",
    phone: "08666777888",
  },
  {
    name: "Anomali Coffee Roasters",
    email: "invoice@anomalicoffee.id",
    phone: "08777888999",
  },
];

export const dataLayanan: Service[] = [
  {
    id: "S001",
    nama: "Web Development",
    deskripsi: "Pembuatan website company profile",
    harga: 5000000,
  },
  {
    id: "S002",
    nama: "UI/UX Design",
    deskripsi: "Desain antarmuka aplikasi mobile",
    harga: 3000000,
  },
  {
    id: "S003",
    nama: "Maintenance",
    deskripsi: "Pemeliharaan server bulanan",
    harga: 500000,
  },
  {
    id: "S004",
    nama: "Graphic Design",
    deskripsi: "Pembuatan aset visual promosi",
    harga: 1500000,
  },
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

    const jumlahLayanan = Math.floor(Math.random() * 3) + 1;
    const layananTerpilih: Service[] = [];
    const salinanLayanan = [...dataLayanan].sort(() => 0.5 - Math.random());

    for (let i = 0; i < jumlahLayanan; i++) {
      if (salinanLayanan[i]) {
        layananTerpilih.push(salinanLayanan[i]);
      }
    }

    const nominalAngka = layananTerpilih.reduce(
      (acc, curr) => acc + curr.harga,
      0,
    );
    // Disimpan sebagai string berformat Rupiah sesuai dengan type Invoice
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
      services: layananTerpilih,
    };
  },
);
