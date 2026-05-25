# Dokumentasi Lengkap Proyek: Sistem Manajemen Aset

Dokumen ini memberikan panduan teknis dan arsitektur secara mendetail mengenai Sistem Manajemen Aset.

---

## 1. Arsitektur Sistem

Sistem Manajemen Aset ini dirancang menggunakan arsitektur **Client-Server** dengan basis **REST API**. Proyek ini merupakan sebuah *monorepo* yang menampung komponen Backend dan berbagai jenis Client (Web & Mobile).

### Komponen Utama:
1. **Backend API (`backend/`)**: Bertanggung jawab memproses logika bisnis, manajemen database (SQL & NoSQL), dan autentikasi. Dibangun dengan Node.js dan Express.
2. **Admin Web App (`admin-web/`)**: Panel kontrol bagi administrator untuk mengelola aset, menyetujui peminjaman, dan mengelola pengguna. Dibangun dengan React 19 & Vite.
3. **User Web App (`user-app/`)**: Portal bagi karyawan/pengguna biasa untuk melihat daftar aset dan mengajukan permohonan peminjaman. Dibangun dengan React 19 & Vite.
4. **User Mobile App (`flutter_user_app/`)**: Aplikasi mobile alternatif untuk karyawan agar dapat berinteraksi dengan sistem melalui perangkat mobile. Dibangun menggunakan Flutter.

---

## 2. Teknologi yang Digunakan (Tech Stack)

### Backend
- **Framework**: Node.js dengan Express.js
- **Database Relasional**: SQLite (melalui ORM Sequelize) untuk entitas utama.
- **Database NoSQL**: NeDB (`@seald-io/nedb`) untuk data tidak terstruktur (Log Kondisi dan Dokumen Serah Terima).
- **Lainnya**: Cors, Dotenv

### Frontend Web (Admin & User)
- **Library**: React 19
- **Build Tool**: Vite
- **Routing**: React Router
- **HTTP Client**: Axios

### Mobile Frontend
- **Framework**: Flutter
- **Bahasa**: Dart

---

## 3. Instalasi dan Persiapan Lokal (Setup)

### Prasyarat
- Node.js (v18+)
- npm / yarn
- Flutter SDK (untuk pengembangan aplikasi mobile)

### A. Menjalankan Backend API
1. Buka terminal dan arahkan ke folder backend: `cd backend`
2. Instal dependensi: `npm install`
3. Jalankan server: `npm start`
*Server akan berjalan di `http://localhost:3001` dan database akan disinkronisasi secara otomatis.*

### B. Menjalankan Admin Web
1. Buka terminal baru dan arahkan ke folder admin web: `cd admin-web`
2. Instal dependensi: `npm install`
3. Jalankan server development: `npm run dev`

### C. Menjalankan User Web
1. Buka terminal baru dan arahkan ke folder user web: `cd user-app`
2. Instal dependensi: `npm install`
3. Jalankan server development: `npm run dev`

### D. Menjalankan Flutter User App
1. Buka terminal baru dan arahkan ke folder flutter: `cd flutter_user_app`
2. Ambil semua paket: `flutter pub get`
3. Jalankan aplikasi (pastikan emulator/device terhubung): `flutter run`

---

## 4. Struktur Database

### Relasional (SQL via Sequelize)
- **User**: Menyimpan data pengguna, kredensial, dan peran (`role` = 'admin' / 'employee').
- **Category**: Mengelompokkan aset ke dalam berbagai kategori.
- **Asset**: Menyimpan data barang/aset, referensi ke `Category`, dan status (tersedia, dipinjam, dll).
- **BorrowingLog**: Menyimpan riwayat peminjaman aset, merelasikan `User` dengan `Asset`, beserta status (pending, active, returned).

### NoSQL (NeDB)
- **AssetCondition**: Menyimpan laporan kondisi aset beserta *timestamp* pelaporan.
- **HandoverDocument**: Menyimpan dokumen berita acara/serah terima ketika peminjaman atau pengembalian aset terjadi.

---

## 5. Referensi REST API

Base URL: `http://localhost:3001/api`

### 🔒 Autentikasi
| Endpoint | Method | Deskripsi | Payload / Request Body |
|----------|--------|-----------|------------------------|
| `/auth/login` | `POST` | Login pengguna | `{ email, password }` |
| `/auth/register`| `POST` | Mendaftarkan pengguna baru (default role: employee) | `{ name, email, password }` |

### 👥 Pengguna (User)
| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/users` | `GET` | Mengambil semua data pengguna |
| `/users/:id` | `PUT` | Mengubah data profil pengguna (name, email, password) |

### 📦 Kategori
| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/categories` | `GET` | Mengambil seluruh data kategori |
| `/categories` | `POST` | Menambahkan kategori baru |
| `/categories/:id`| `PUT` | Mengubah informasi kategori |

### 🖥️ Aset
| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/assets` | `GET` | Mengambil daftar aset beserta kategorinya |
| `/assets/:id` | `GET` | Mengambil detail aset tertentu |
| `/assets` | `POST` | Menambahkan aset baru |
| `/assets/:id` | `PUT` | Memperbarui data aset tertentu |
| `/assets/:id` | `DELETE`| Menghapus aset dari sistem |

### 📋 Peminjaman (Borrowing)
| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/borrowings` | `GET` | Mengambil seluruh log peminjaman (untuk admin) |
| `/borrowings/user/:id` | `GET` | Mengambil riwayat peminjaman milik pengguna tertentu |
| `/borrowings` | `POST` | Mengajukan peminjaman aset baru |
| `/borrowings/:id/status`| `PUT` | Memperbarui status peminjaman (contoh: 'active', 'returned') |

### 📄 Data NoSQL (Kondisi & Dokumen)
| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/assets/:id/conditions` | `GET` | Mengambil histori kondisi sebuah aset |
| `/assets/:id/conditions` | `POST` | Menambahkan laporan kondisi terbaru pada aset |
| `/borrowings/:id/handover` | `POST` | Menyimpan dokumen serah terima untuk peminjaman/pengembalian tertentu |

---

## 6. Akun Default

Saat backend dijalankan untuk pertama kalinya, sistem secara otomatis akan membuat akun **Administrator** default jika belum ada.

- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Role**: `admin`

Sebuah kategori default "General" juga akan terbuat secara otomatis.
