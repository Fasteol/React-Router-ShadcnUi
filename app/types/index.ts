// file: src/types/index.ts

export type UserType = {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  role?: string;
};

export type Client = {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status?: string;
  totalSpent?: number;
  totalInvoices?: number;
};

export type Expense = {
  id: string;
  deskripsi: string;
  kategori: string;
  jumlah: number | string;
  tanggal: string;
  status: "Dibayar" | "Pending" | "Lunas" | string;
};

export type Service = {
  id: string;
  nama: string;
  deskripsi: string;
  harga: number;
};

export type Invoice = {
  id: string;
  invoice: string;
  clientName: string;
  clientEmail?: string; // Tambahan baru
  totalAmount: string;
  paymentStatus: "Lunas" | "Pending" | "Gagal" | string;
  paymentMethod?: string; // Tambahan baru
  date?: string; // Tambahan baru
  dueDate: string;
  services?: Service[]; // Tambahan baru: relasi ke layanan
};

export type NotificationItem = {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: "success" | "warning" | "error" | "info"; // Menentukan warna & ikon
  unread: boolean;
};

export type TeamMember = {
  id?: string;
  name?: string; // Dibuat opsional
  nama?: string; // Menampung jika data dummy menggunakan 'nama'
  email: string;
  role?: string;
  status?: "Aktif" | "Nonaktif" | string;
};
