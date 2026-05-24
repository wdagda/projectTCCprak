# Sistem Manajemen Aset

Sebuah Sistem Manajemen Aset full-stack yang dirancang untuk menangani pelacakan aset, alur peminjaman, dan pemantauan kondisi. Sistem ini dibagi menjadi backend Node.js yang tangguh dan dua aplikasi web berbasis React untuk administrator dan pengguna biasa.

## 🚀 Fitur

- **Manajemen Aset**: Operasi CRUD lengkap untuk mengelola aset perusahaan beserta kategorinya.
- **Autentikasi & Manajemen Pengguna**: Kontrol akses berbasis peran (role-based), memungkinkan karyawan untuk mendaftar, masuk, dan mengelola profil mereka.
- **Sistem Peminjaman**: Alur kerja lengkap bagi pengguna untuk meminta peminjaman aset, dan bagi administrator untuk menyetujui, menolak, atau menandainya sebagai dikembalikan.
- **Pelacakan Kondisi Aset**: Mencatat kondisi aset dari waktu ke waktu.
- **Dokumen Serah Terima**: Menghasilkan dan menyimpan catatan serah terima ketika aset berpindah tangan.

## 💻 Teknologi yang Digunakan (Tech Stack)

### Backend
- **Node.js** dengan **Express.js** untuk pembuatan API RESTful.
- **Sequelize** ORM untuk manajemen data SQL (dikonfigurasi untuk SQLite secara default, mudah diadaptasi ke MySQL).
- **NeDB** (@seald-io/nedb) sebagai database NoSQL ringan untuk struktur data yang fleksibel seperti log kondisi aset dan dokumen serah terima.
- **Cors** & **Dotenv** untuk keamanan dan konfigurasi lingkungan (environment).

### Frontend (`admin-web` & `user-app`)
- **React 19** untuk membangun antarmuka pengguna (User Interface).
- **Vite** untuk proses development dan build yang sangat cepat.
- **React Router** untuk navigasi halaman (routing).
- **Axios** untuk menangani permintaan HTTP ke backend API.

## 📂 Struktur Proyek

Ini adalah *monorepo* yang terdiri dari tiga modul utama:

```
.
├── admin-web/      # Aplikasi React untuk administrator (Manajemen Aset & Pengguna, Persetujuan Peminjaman)
├── backend/        # Server API Node.js/Express dan model database
└── user-app/       # Aplikasi React untuk karyawan (Melihat aset, mengajukan peminjaman)
```

## 🛠️ Instalasi & Setup

### Prasyarat
- [Node.js](https://nodejs.org/) (disarankan v18 atau lebih baru)
- npm atau yarn

### 1. Setup Backend

```bash
cd backend
npm install
npm start
```
Server backend akan berjalan di `http://localhost:3001`. Database SQLite akan otomatis disinkronkan (*sync*) saat aplikasi dijalankan.

### 2. Setup Aplikasi Web Admin

Buka jendela terminal baru:

```bash
cd admin-web
npm install
npm run dev
```
Aplikasi admin akan berjalan pada server Vite lokal. Periksa terminal Anda untuk melihat URL localhost pastinya.

### 3. Setup Aplikasi Pengguna

Buka jendela terminal baru lagi:

```bash
cd user-app
npm install
npm run dev
```
Aplikasi pengguna akan berjalan pada server Vite lokal. Periksa terminal Anda untuk melihat URL localhost pastinya.

## 📡 Ringkasan API

Backend mengekspos beberapa endpoint di bawah awalan (prefix) `/api`:

- **Aset:** `GET`, `POST`, `PUT`, `DELETE` pada `/api/assets`
- **Kategori:** `GET`, `POST`, `PUT` pada `/api/categories`
- **Kondisi Aset (NoSQL):** `GET`, `POST` pada `/api/assets/:id/conditions`
- **Pengguna & Autentikasi:** `/api/auth/login`, `/api/auth/register`, `/api/users`
- **Log Peminjaman:** `GET`, `POST`, `PUT` pada `/api/borrowings` dan `/api/borrowings/user/:id`
- **Dokumen Serah Terima (NoSQL):** `POST` pada `/api/borrowings/:id/handover`

## 📝 Lisensi

Proyek ini dilisensikan di bawah ISC License.
