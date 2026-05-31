import { useState, useEffect } from "react";

export const useSettings = () => {
  // 1. STATE PREFERENSI & MATA UANG
  const [mataUang, setMataUang] = useState("IDR");
  const [preferensi, setPreferensi] = useState({
    tema: "system",
    mataUang: "IDR",
    notifikasiEmail: true,
  });

  // 2. STATE INFO BISNIS (Diperluas untuk Invoice)
  const [infoBisnis, setInfoBisnis] = useState({
    nama: "Internal Sistem",
    alamat: "Semua Wilayah",
    telepon: "",
    email: "",
    npwp: "",
    website: "",
  });

  // 3. STATE PROFIL PERSONAL
  const [profil, setProfil] = useState({
    nama: "Admin",
    email: "",
    telepon: "",
    avatar: "",
  });

  // 4. STATE REKENING PEMBAYARAN
  const [rekening, setRekening] = useState({
    namaBank: "",
    nomor: "",
    pemilik: "",
  });

  useEffect(() => {
    // Fungsi untuk menarik dan mem-parsing data dari localStorage
    const loadSettings = () => {
      // Ambil pengaturan umum dari adminSettings
      const savedSettings = localStorage.getItem("adminSettings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);

        if (parsed?.preferensi) {
          setPreferensi((prev) => ({ ...prev, ...parsed.preferensi }));
          if (parsed.preferensi.mataUang) {
            setMataUang(parsed.preferensi.mataUang);
          }
        }

        if (parsed?.perusahaan) {
          setInfoBisnis((prev) => ({ ...prev, ...parsed.perusahaan }));
        }

        if (parsed?.profil) {
          setProfil((prev) => ({ ...prev, ...parsed.profil }));
        }

        if (parsed?.rekening) {
          setRekening((prev) => ({ ...prev, ...parsed.rekening }));
        }
      }

      // Ambil data profil dari sesi user yang sedang login agar lebih akurat
      const currentUser = localStorage.getItem("currentUser");
      if (currentUser) {
        const parsedUser = JSON.parse(currentUser);
        if (parsedUser) {
          setProfil((prev) => ({
            ...prev,
            nama: parsedUser.name || prev.nama,
            email: parsedUser.email || prev.email,
            telepon: parsedUser.phone || prev.telepon,
            avatar: parsedUser.avatar || prev.avatar,
          }));
        }
      }
    };

    // Jalankan pemuatan data saat komponen pertama kali di-render
    loadSettings();

    // Pasang "pendengar" (event listener) agar data langsung update
    // jika diubah dari halaman Setting tanpa perlu refresh page
    window.addEventListener("settings-updated", loadSettings);
    window.addEventListener("user-updated", loadSettings);

    // Bersihkan listener saat komponen di-unmount agar tidak memory leak
    return () => {
      window.removeEventListener("settings-updated", loadSettings);
      window.removeEventListener("user-updated", loadSettings);
    };
  }, []);

  // Kembalikan semua state yang dibutuhkan oleh halaman-halaman lain
  return {
    mataUang,
    setMataUang,
    preferensi,
    infoBisnis,
    profil,
    rekening,
  };
};
