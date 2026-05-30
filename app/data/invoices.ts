export type Invoice = {
  invoice: string;
  paymentStatus: string;
  totalAmount: string;
  paymentMethod: string;
};

// 1. Siapkan pilihan status dan metode pembayaran untuk diacak
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

// 2. Buat fungsi generator untuk 100 data
export const dataAwal: Invoice[] = Array.from({ length: 100 }).map(
  (_, index) => {
    // Membuat nomor urut dari 001 sampai 100
    const nomorUrut = (index + 1).toString().padStart(3, "0");

    // Memilih status dan metode secara acak dari array di atas
    const statusAcak =
      pilihanStatus[Math.floor(Math.random() * pilihanStatus.length)];
    const metodeAcak =
      pilihanMetode[Math.floor(Math.random() * pilihanMetode.length)];

    // Membuat nominal uang acak antara 50.000 sampai 5.000.000 (dalam kelipatan 50 ribu)
    const nominalAngka = Math.floor(Math.random() * 100 + 1) * 50000;
    // Mengubah format angka menjadi string seperti "Rp 250.000"
    const nominalString = "Rp " + nominalAngka.toLocaleString("id-ID");

    // Kembalikan objek data yang sudah dirakit
    return {
      invoice: `INV${nomorUrut}`,
      paymentStatus: statusAcak,
      totalAmount: nominalString,
      paymentMethod: metodeAcak,
    };
  },
);
