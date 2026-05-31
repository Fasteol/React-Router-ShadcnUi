import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Expense,
  Client,
  Service,
  Invoice,
  TeamMember,
  NotificationItem, // Impor tipe notifikasi
} from "~/types/index";

// Import inisialisasi data (pastikan path disesuaikan jika perlu)
import {
  dataAwal,
  dataAwalExpense,
  dataLayanan,
  daftarKlien,
  dataAwalTim,
} from "~/data/invoices";

interface AppState {
  // ==========================================
  // 1. STATE PENGATURAN (SETTINGS)
  // ==========================================
  profil: { nama: string; email: string; telepon: string; avatar: string };
  infoBisnis: {
    nama: string;
    alamat: string;
    telepon: string;
    email: string;
    npwp: string;
    website: string;
  };
  preferensi: { tema: string; mataUang: string; notifikasiEmail: boolean };
  rekening: { namaBank: string; nomor: string; pemilik: string };

  setProfil: (data: Partial<AppState["profil"]>) => void;
  setInfoBisnis: (data: Partial<AppState["infoBisnis"]>) => void;
  setPreferensi: (data: Partial<AppState["preferensi"]>) => void;
  setRekening: (data: Partial<AppState["rekening"]>) => void;

  // ==========================================
  // 2. STATE ENTITAS DATA (CRUD) & NOTIFIKASI
  // ==========================================
  expenses: Expense[];
  clients: Client[];
  services: Service[];
  invoices: Invoice[];
  team: TeamMember[];
  notifications: NotificationItem[];

  // Actions Expense
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, updatedExpense: Expense) => void;
  deleteExpense: (id: string) => void;

  // Actions Client
  addClient: (client: Client) => void;
  updateClient: (id: string, updatedClient: Client) => void;
  deleteClient: (id: string) => void;

  // Actions Service
  addService: (service: Service) => void;
  updateService: (id: string, updatedService: Service) => void;
  deleteService: (id: string) => void;

  // Actions Invoice
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, updatedInvoice: Invoice) => void;
  deleteInvoice: (id: string) => void;

  // Actions Team Member
  addTeamMember: (member: TeamMember) => void;
  updateTeamMember: (id: string, updatedMember: TeamMember) => void;
  deleteTeamMember: (id: string) => void;

  // Actions Notifications
  addNotification: (notif: {
    title: string;
    desc: string;
    type: NotificationItem["type"];
  }) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // --- INISIALISASI SETTINGS ---
      profil: { nama: "Admin", email: "", telepon: "", avatar: "" },
      infoBisnis: {
        nama: "Internal Sistem",
        alamat: "Semua Wilayah",
        telepon: "",
        email: "",
        npwp: "",
        website: "",
      },
      preferensi: { tema: "system", mataUang: "IDR", notifikasiEmail: true },
      rekening: { namaBank: "", nomor: "", pemilik: "" },

      // --- ACTIONS SETTINGS ---
      setProfil: (data) =>
        set((state) => ({ profil: { ...state.profil, ...data } })),
      setInfoBisnis: (data) =>
        set((state) => ({ infoBisnis: { ...state.infoBisnis, ...data } })),
      setPreferensi: (data) =>
        set((state) => ({ preferensi: { ...state.preferensi, ...data } })),
      setRekening: (data) =>
        set((state) => ({ rekening: { ...state.rekening, ...data } })),

      // --- INISIALISASI ENTITAS ---
      expenses: dataAwalExpense || [],
      clients: daftarKlien || [],
      services: dataLayanan || [],
      invoices: dataAwal || [],
      team: dataAwalTim || [],
      notifications: [],

      // --- ACTIONS EXPENSE ---
      addExpense: (expense) =>
        set((state) => {
          const newNotif: NotificationItem = {
            id: Date.now().toString(),
            title: "Pengeluaran Ditambahkan",
            desc: `Pengeluaran "${expense.deskripsi}" berhasil dicatat.`,
            time: new Date().toISOString(),
            type: "success",
            unread: true,
          };
          return {
            expenses: [expense, ...state.expenses],
            notifications: [newNotif, ...state.notifications].slice(0, 50),
          };
        }),
      updateExpense: (id, updatedExpense) =>
        set((state) => {
          const newNotif: NotificationItem = {
            id: Date.now().toString(),
            title: "Pengeluaran Diperbarui",
            desc: `Data pengeluaran "${updatedExpense.deskripsi}" telah diperbarui.`,
            time: new Date().toISOString(),
            type: "info",
            unread: true,
          };
          return {
            expenses: state.expenses.map((exp) =>
              exp.id === id ? { ...exp, ...updatedExpense } : exp,
            ),
            notifications: [newNotif, ...state.notifications].slice(0, 50),
          };
        }),
      deleteExpense: (id) =>
        set((state) => {
          const newNotif: NotificationItem = {
            id: Date.now().toString(),
            title: "Pengeluaran Dihapus",
            desc: `Satu catatan pengeluaran telah dihapus dari sistem.`,
            time: new Date().toISOString(),
            type: "warning",
            unread: true,
          };
          return {
            expenses: state.expenses.filter((exp) => exp.id !== id),
            notifications: [newNotif, ...state.notifications].slice(0, 50),
          };
        }),

      // --- ACTIONS CLIENT ---
      addClient: (client) =>
        set((state) => {
          const newNotif: NotificationItem = {
            id: Date.now().toString(),
            title: "Klien Baru Disimpan",
            desc: `Klien ${client.name} berhasil ditambahkan ke database.`,
            time: new Date().toISOString(),
            type: "success",
            unread: true,
          };
          return {
            clients: [client, ...state.clients],
            notifications: [newNotif, ...state.notifications].slice(0, 50),
          };
        }),
      updateClient: (id, updatedClient) =>
        set((state) => {
          const newNotif: NotificationItem = {
            id: Date.now().toString(),
            title: "Data Klien Diperbarui",
            desc: `Informasi klien ${updatedClient.name} telah diubah.`,
            time: new Date().toISOString(),
            type: "info",
            unread: true,
          };
          return {
            clients: state.clients.map((c) =>
              c.id === id ? { ...c, ...updatedClient } : c,
            ),
            notifications: [newNotif, ...state.notifications].slice(0, 50),
          };
        }),
      deleteClient: (id) =>
        set((state) => {
          const newNotif: NotificationItem = {
            id: Date.now().toString(),
            title: "Klien Dihapus",
            desc: `Satu data klien telah dihapus dari sistem.`,
            time: new Date().toISOString(),
            type: "warning",
            unread: true,
          };
          return {
            clients: state.clients.filter((c) => c.id !== id),
            notifications: [newNotif, ...state.notifications].slice(0, 50),
          };
        }),

      // --- ACTIONS SERVICE ---
      addService: (service) =>
        set((state) => {
          const newNotif: NotificationItem = {
            id: Date.now().toString(),
            title: "Layanan Baru Ditambahkan",
            desc: `Layanan "${service.nama}" berhasil masuk ke katalog.`,
            time: new Date().toISOString(),
            type: "success",
            unread: true,
          };
          return {
            services: [service, ...state.services],
            notifications: [newNotif, ...state.notifications].slice(0, 50),
          };
        }),
      updateService: (id, updatedService) =>
        set((state) => {
          const newNotif: NotificationItem = {
            id: Date.now().toString(),
            title: "Layanan Diperbarui",
            desc: `Detail layanan "${updatedService.nama}" telah diubah.`,
            time: new Date().toISOString(),
            type: "info",
            unread: true,
          };
          return {
            services: state.services.map((s) =>
              s.id === id ? { ...s, ...updatedService } : s,
            ),
            notifications: [newNotif, ...state.notifications].slice(0, 50),
          };
        }),
      deleteService: (id) =>
        set((state) => {
          const newNotif: NotificationItem = {
            id: Date.now().toString(),
            title: "Layanan Dihapus",
            desc: `Satu layanan telah dihapus dari katalog.`,
            time: new Date().toISOString(),
            type: "warning",
            unread: true,
          };
          return {
            services: state.services.filter((s) => s.id !== id),
            notifications: [newNotif, ...state.notifications].slice(0, 50),
          };
        }),

      // --- ACTIONS INVOICE ---
      addInvoice: (invoice) =>
        set((state) => {
          const newNotif: NotificationItem = {
            id: Date.now().toString(),
            title: "Invoice Dibuat",
            desc: `Invoice ${invoice.invoice} untuk ${invoice.clientName} berhasil dibuat.`,
            time: new Date().toISOString(),
            type: "success",
            unread: true,
          };
          return {
            invoices: [invoice, ...state.invoices],
            notifications: [newNotif, ...state.notifications].slice(0, 50),
          };
        }),
      updateInvoice: (id, updatedInvoice) =>
        set((state) => {
          const oldInvoice = state.invoices.find((i) => i.id === id);
          let newNotif: NotificationItem;

          // Deteksi perubahan status pembayaran menjadi Lunas
          if (
            oldInvoice &&
            oldInvoice.paymentStatus !== "Lunas" &&
            updatedInvoice.paymentStatus === "Lunas"
          ) {
            newNotif = {
              id: Date.now().toString(),
              title: "Pembayaran Diterima!",
              desc: `Invoice ${updatedInvoice.invoice} dari ${updatedInvoice.clientName} telah dilunasi.`,
              time: new Date().toISOString(),
              type: "success",
              unread: true,
            };
          } else {
            newNotif = {
              id: Date.now().toString(),
              title: "Invoice Diperbarui",
              desc: `Detail invoice ${updatedInvoice.invoice} berhasil diubah.`,
              time: new Date().toISOString(),
              type: "info",
              unread: true,
            };
          }

          return {
            invoices: state.invoices.map((inv) =>
              inv.id === id ? { ...inv, ...updatedInvoice } : inv,
            ),
            notifications: [newNotif, ...state.notifications].slice(0, 50),
          };
        }),
      deleteInvoice: (id) =>
        set((state) => {
          const newNotif: NotificationItem = {
            id: Date.now().toString(),
            title: "Invoice Dihapus",
            desc: `Data invoice telah ditarik dan dihapus dari sistem.`,
            time: new Date().toISOString(),
            type: "warning",
            unread: true,
          };
          return {
            invoices: state.invoices.filter((inv) => inv.id !== id),
            notifications: [newNotif, ...state.notifications].slice(0, 50),
          };
        }),

      // --- ACTIONS TEAM MEMBER ---
      addTeamMember: (member) =>
        set((state) => {
          const newNotif: NotificationItem = {
            id: Date.now().toString(),
            title: "Anggota Tim Baru",
            desc: `Anggota ${member.name || member.nama} berhasil ditambahkan.`,
            time: new Date().toISOString(),
            type: "success",
            unread: true,
          };
          return {
            team: [member, ...state.team],
            notifications: [newNotif, ...state.notifications].slice(0, 50),
          };
        }),
      updateTeamMember: (id, updatedMember) =>
        set((state) => {
          const newNotif: NotificationItem = {
            id: Date.now().toString(),
            title: "Data Tim Diperbarui",
            desc: `Informasi anggota tim telah diubah.`,
            time: new Date().toISOString(),
            type: "info",
            unread: true,
          };
          return {
            team: state.team.map((t) =>
              t.id === id ? { ...t, ...updatedMember } : t,
            ),
            notifications: [newNotif, ...state.notifications].slice(0, 50),
          };
        }),
      deleteTeamMember: (id) =>
        set((state) => {
          const newNotif: NotificationItem = {
            id: Date.now().toString(),
            title: "Anggota Tim Dihapus",
            desc: `Satu anggota tim telah dihapus dari akses sistem.`,
            time: new Date().toISOString(),
            type: "warning",
            unread: true,
          };
          return {
            team: state.team.filter((t) => t.id !== id),
            notifications: [newNotif, ...state.notifications].slice(0, 50),
          };
        }),

      // --- ACTIONS NOTIFICATIONS ---
      addNotification: (notif) =>
        set((state) => ({
          notifications: [
            {
              id: Date.now().toString(),
              title: notif.title,
              desc: notif.desc,
              time: new Date().toISOString(),
              type: notif.type,
              unread: true,
            },
            ...state.notifications,
          ].slice(0, 50), // Batasi riwayat 50 notifikasi
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            unread: false,
          })),
        })),

      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: "billify-storage",
    },
  ),
);
