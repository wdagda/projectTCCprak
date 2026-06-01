# Dokumentasi Lengkap Proyek: Sistem Manajemen Aset

Dokumen ini memberikan panduan teknis, arsitektur, cara implementasi dalam kode, hingga panduan *deployment* secara mendetail mengenai Sistem Manajemen Aset.

---

## 1. Arsitektur Sistem

Sistem Manajemen Aset ini dirancang menggunakan arsitektur **Client-Server** berbasis **REST API**. Proyek ini merupakan sebuah *monorepo* yang menampung komponen Backend dan berbagai jenis Client (Web & Mobile).

### Komponen Utama:
1. **Backend API (`backend/`)**: Memproses logika bisnis, manajemen database (SQL & NoSQL), dan autentikasi. Dibangun dengan Node.js dan Express.
2. **Admin Web App (`admin-web/`)**: Panel kontrol bagi administrator untuk mengelola aset, menyetujui peminjaman, dan mengelola pengguna. Dibangun dengan React 19 & Vite.
3. **User Web App (`user-app/`)**: Portal bagi karyawan/pengguna biasa.
4. **User Mobile App (`flutter_user_app/`)**: Aplikasi mobile alternatif untuk karyawan.

---

## 2. Teknologi yang Digunakan (Tech Stack)

### Backend
- **Framework**: Node.js dengan Express.js
- **Database Relasional**: SQLite (via ORM Sequelize) untuk data utama terstruktur.
- **Database NoSQL**: NeDB (`@seald-io/nedb`) untuk data log yang tidak terstruktur/berubah-ubah.

### Frontend (Web & Mobile)
- **Web**: React 19, Vite, Axios untuk pemanggilan API.
- **Mobile**: Flutter (Dart).

---

## 3. Struktur Database & Relasi (RAT)

Proyek ini memadukan **dua paradigma database** di dalam satu backend.

### A. Database Relasional (SQLite - `database.sqlite`)
Menyimpan entitas inti yang saling terkait. Tabel-tabel ini terhubung satu sama lain menggunakan konsep *Foreign Key* (`REFERENCES`).
- **Users**: Menyimpan pengguna. Memiliki kolom `DepartmentId` yang merujuk (`REFERENCES`) ke tabel `Departments`.
- **Assets**: Menyimpan data barang. Memiliki kolom `CategoryId` yang merujuk ke tabel `Categories`.
- **BorrowingLogs**: Tabel transaksi peminjaman. Memiliki `user_id` (merujuk ke `Users`) dan `asset_id` (merujuk ke `Assets`).

> **Catatan Relasi (Join vs References)**: Struktur tabel secara *default* hanya menyimpan jalur hubungannya (`REFERENCES`). Untuk menampilkan gabungan data yang utuh ke Frontend (misal: nama peminjam dan nama barang sekaligus), backend menggunakan fitur `include` pada Sequelize, yang otomatis menjalankan kueri `JOIN` SQL di belakang layar.

### B. Database NoSQL (NeDB - `data_*.db`)
Data ini disimpan dalam file teks biasa berekstensi `.db` dengan format JSON per baris. Sangat cepat dan ringan untuk logging/histori karena tidak memerlukan skema relasi yang kaku.
- **AssetCondition**: Log kondisi aset.
- **ActivityLog**: Log aktivitas sistem (misal: histori login user).
- **MaintenanceRecord**: Log perbaikan barang.

---

## 4. Cara Implementasi Kode (Code Implementation)

### A. Backend (Routing & Database)
- **Membuat Endpoint**: Endpoint dideklarasikan di `server.js` (contoh: `app.get('/api/assets', ...)`).
- **Interaksi SQL (Sequelize)**: Backend tidak menulis query SQL manual (`SELECT * FROM...`). Sebagai gantinya, digunakan sintaks ORM seperti `models.Asset.findAll({ include: [models.Category] })` untuk mengambil data barang sekaligus nama kategorinya secara instan.
- **Penyisipan NoSQL**: Log aktivitas langsung dimasukkan ke file `*.db` menggunakan *callback*. Contoh:
  ```javascript
  ActivityLog.insert({ action: 'login', user_email: user.email, timestamp: new Date() });
  ```

### B. Frontend (Pemanggilan API)
Frontend berkomunikasi dengan Backend menggunakan HTTP request (via `axios`).
- **Contoh Implementasi**:
  ```javascript
  import axios from 'axios';
  
  // Mengambil daftar asset dari backend
  const fetchAssets = async () => {
    const response = await axios.get(`http://<IP_BACKEND>:3001/api/assets`);
    setAssets(response.data);
  };
  ```

---

## 5. Panduan Deployment (Lingkungan Production Google Cloud)

Aplikasi ini telah disiapkan dan sukses di-deploy ke infrastruktur Google Cloud Platform (GCP).

### A. Deployment Backend (GCP Compute Engine / VM)
Backend diletakkan di dalam Virtual Machine (VM) Debian/Linux.
1. **Persistensi Data**: Berbeda dengan *Serverless* (seperti Vercel) yang menghapus file secara berkala, penggunaan VM membuat file `database.sqlite` dan `.db` aman tersimpan secara permanen (*persistent*) di disk server.
2. **Akses Remote (VS Code)**: Developer dapat mengatur backend secara remote tanpa perlu memakai terminal murni. Cukup atur koneksi menggunakan `gcloud`:
   ```bash
   gcloud compute config-ssh --project="<PROJECT_ID>"
   ```
   Lalu sambungkan VS Code (Remote-SSH) ke Host: `backend-praktcc.asia-southeast2-a.<PROJECT_ID>`.
3. **Konfigurasi Firewall GCP**: Agar API bisa ditembak oleh Admin Web/Postman, Port backend (misal: `3001`) wajib dibuka aksesnya melalui menu **VPC Network > Firewall**. Tambahkan *Ingress Rule* untuk `tcp:3001`.

### B. Deployment Admin Web (GCP Cloud Storage)
Admin Web di-deploy sebagai *Static Website* ke dalam bucket Google Cloud Storage, sehingga sangat hemat biaya dan cepat.
1. Build aplikasi React lokal: `npm run build` (menghasilkan folder `dist/`).
2. Sinkronisasikan ke GCP Storage menggunakan `gsutil`:
   ```bash
   gsutil rsync -R dist/ gs://praktcc-admin-web
   ```
3. **Link Akses Admin Web:**
   🌐 [http://praktcc-admin-web.storage.googleapis.com/index.html#/](http://praktcc-admin-web.storage.googleapis.com/index.html#/)

---

## 6. Referensi REST API

> **Base URL Lokal**: `http://localhost:3001/api`
> **Base URL Cloud (Postman)**: `http://<IP_PUBLIC_VM_GCP>:3001/api`

### Endpoint Utama:
- **`POST /api/auth/login`**: Login user (Body JSON: `{ email, password }`).
- **`POST /api/auth/register`**: Registrasi user baru.
- **`GET /api/assets`**: Mengambil daftar aset.
- **`POST /api/borrowings`**: Mengajukan peminjaman aset.

---

## 7. Akun Default

Saat backend dijalankan pertama kali dengan database kosong, sistem akan secara otomatis membuatkan satu akun Administrator default:
- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Role**: `admin`
