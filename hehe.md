# Panduan Dokumentasi API & Deployment GCP

Dokumen ini berisi contoh bagaimana Dokumentasi API untuk sistem backend dibuat, dan juga langkah-langkah untuk mendeploy aplikasi web (frontend) ke Google Cloud Platform (GCP) menggunakan `gsutil`.

---

## Bagian 1: Contoh Dokumentasi API (Sistem Manajemen Aset)

Berikut adalah contoh bagaimana kita mendokumentasikan endpoint API agar mudah dipahami oleh developer frontend.

### 1. Autentikasi User
Digunakan untuk login dan mendapatkan token akses.

- **Endpoint:** `POST /api/auth/login`
- **Tujuan:** Login pengguna ke dalam sistem.
- **Request Body (JSON):**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response Sukses (200 OK):**
  ```json
  {
    "message": "Login berhasil",
    "token": "eyJhbGciOiJIUzI1NiIsInR5c...",
    "user": {
      "id": 1,
      "name": "Budi",
      "role": "admin"
    }
  }
  ```

### 2. Manajemen Aset
- **Endpoint:** `GET /api/assets`
- **Tujuan:** Mengambil daftar semua aset perusahaan.
- **Headers:** 
  `Authorization: Bearer <token_dari_login>`
- **Response Sukses (200 OK):**
  ```json
  [
    {
      "id": 101,
      "name": "Laptop Lenovo Thinkpad",
      "category": "Elektronik",
      "status": "Tersedia"
    },
    {
      "id": 102,
      "name": "Proyektor Epson",
      "category": "Elektronik",
      "status": "Dipinjam"
    }
  ]
  ```

---

## Bagian 2: Panduan Deployment Web ke Google Cloud Storage (Menggunakan `gsutil`)

Karena aplikasi web kamu (`admin-web` & `user-app`) menggunakan **React + Vite**, aplikasi ini pada dasarnya adalah file *Static Web* (kumpulan HTML, CSS, dan JS) setelah di-build. Tempat paling murah dan efisien untuk mendeploy website statis di GCP adalah **Cloud Storage**, dan kamu bisa menguploadnya menggunakan command `gsutil`.

### Prasyarat
1. Pastikan kamu sudah menginstal **Google Cloud SDK** di komputermu (yang menyediakan command `gsutil` dan `gcloud`).
2. Sudah melakukan login akun GCP di terminal dengan perintah:
   ```bash
   gcloud auth login
   ```

### Langkah-langkah Deployment

**Langkah 1: Build Aplikasi React/Vite Kamu**
Masuk ke dalam folder frontend kamu (misalnya `admin-web`) dan buat versi *production* (file yang siap rilis).
```bash
cd admin-web
npm install
npm run build
```
*(Perintah ini akan menghasilkan sebuah folder bernama `dist` yang berisi file website kamu).*

**Langkah 2: Buat Bucket di Google Cloud Storage**
Kamu bisa membuat bucket baru (tempat menyimpan file) lewat terminal. Ganti `nama-bucket-website-kamu` dengan nama unik yang kamu inginkan.
```bash
gsutil mb gs://nama-bucket-website-kamu
```

**Langkah 3: Konfigurasi Bucket Menjadi Website Statis**
Atur agar bucket tersebut bertindak seperti web server, dan file `index.html` dari folder `dist` dijadikan sebagai halaman utama.
```bash
gsutil web set -m index.html -e index.html gs://nama-bucket-website-kamu
```

**Langkah 4: Jadikan Bucket Tersebut Publik**
Agar website bisa diakses oleh orang lain (bukan hanya kamu), berikan izin baca (read-only) kepada publik.
```bash
gsutil iam ch allUsers:objectViewer gs://nama-bucket-website-kamu
```

**Langkah 5: Upload Folder `dist` ke Bucket Menggunakan `gsutil`**
Ini adalah bagian terpenting. Perintah `rsync` akan mengunggah isi dari folder `dist` yang baru saja kamu build ke bucket GCP kamu.
```bash
gsutil rsync -R dist/ gs://nama-bucket-website-kamu
```

**Langkah 6: Akses Website Kamu**
Selamat! Website kamu sekarang sudah online. Kamu bisa mengaksesnya melalui URL berikut:
`https://storage.googleapis.com/nama-bucket-website-kamu/index.html`

> **Tips Update Website:** Jika suatu saat kamu mengubah kodingan di frontend, kamu cukup menjalankan **Langkah 1** (`npm run build`) dan **Langkah 5** (`gsutil rsync...`) lagi. File lama di GCP akan tertimpa otomatis dengan yang baru.
