# Penampilan pemain (look/)

Karakter kustom dari resource MTA "Clothes" (`Clothes_1.zip`): model laki-laki dan perempuan (juga versi polisi)
yang bajunya dipasang per bagian, dengan tekstur PNG/JPEG. Bukan CJ lagi. Terhubung ke gamemode
(`SERVER/player/look/`) dan database (tabel `player_look`).

## Isi

| Bagian | Laki-laki | Perempuan | Polisi L / P |
|---|---|---|---|
| Warna kulit | 6 | 6 | 6 / 6 |
| Bentuk wajah | 5 | 5 | 5 / 5 |
| Rambut (gaya x warna, atau botak) | 4 gaya, 22 | 5 gaya, 31 | sama |
| Jenggot / riasan | 26 jenggot | 10 riasan | sama |
| Alis | 23 | 23 | sama |
| Baju & jaket | 140 | 143 | 24 / 23 |
| Celana | 194 | 117 | 13 / 13 |
| Sepatu & sandal | 191 | 176 | 5 / 13 |
| Topi | 20 | - | 12 / 9 |
| Kacamata, topeng, kalung, jam, anting, tas | 17, 37, 20, 10, 15, 73 | -, 37, -, 10, 11, 69 | - |
| Rompi (polisi) | - | - | 11 / 13 |
| Tato (lengan, bahu, dada, punggung, kaki) | 8 tempat, 127 | 6 tempat, 134 | sama |
| Badan | tinggi 151-199 cm, berat 41-94 kg | | |

Tinggi dan berat badan = data karakter (`Char_BodyHeight`, `Char_BodyWeight`, diisi saat buat karakter). Jadi semua
pemain langsung tampil sesuai tinggi/beratnya (juga yang memakai skin biasa).

## File yang harus ada di HP

Dari paket aset (`aset_penampilan_TESTLIT.zip`), salin isinya ke `TESTLIT/`:

- `TESTLIT/clothes/` : tekstur (1588 file). Gambar lebih besar dari 512 atau bukan pangkat dua sudah dikecilkan.
- `TESTLIT/modloader/Penampilan/` : `male01.dff/txd` (skin 7, laki-laki), `bfori.dff/txd` (skin 9, perempuan).
- `TESTLIT/modloader/Penampilan Polisi/` : `ryder.dff/txd` (skin 271), `forelli.dff/txd` (skin 272). Hapus folder ini
  dan set `LOOK_POLICE (false)` di gamemode kalau skin 271/272 tidak mau diganti.

Tanpa folder `clothes/` model tetap tampil, tapi tiap bagian hanya diberi warna rata-rata teksturnya.

## Cara pakai di game

- `/penampilan`: buka editor (jalan kaki, tanpa seragam). Bisa juga di toko baju (warung tipe 3): pilih "Penampilan".
- Tab **Karakter**: Model (skin biasa / kustom / polisi untuk anggota polisi), warna kulit, bentuk wajah, rambut
  (gaya lalu warna, atau "Botak"), jenggot atau riasan, alis.
- Tab **Pakaian**, **Aksesoris**, **Tato**: tiap bagian punya baris "Jenis" (Kaos, Kaos LV, Sweater, ...) dan baris
  nomor item di jenis itu. Bagian opsional punya pilihan "Tidak ada".
- Tab **Badan**: tinggi dan berat.
- Tombol bawah: **Acak**, **Putar** (45°), **Kamera** (badan / wajah / kaki), **Reset**, **Batal**, **Simpan**.
- Perubahan langsung terlihat di karakter sendiri. Pemain lain melihatnya setelah **Simpan**.
- Admin (level 3+): `/resetlook [id]` mengembalikan penampilan pemain ke bawaan.
- Pindah model polisi <-> biasa: warna kulit, wajah, rambut, alis, jenggot/riasan dan tato tetap; baju kembali ke
  bawaan model itu.

Pengaturan di atas `look_system.inc`:

    #define LOOK_EDIT_ANYWHERE   (true)    // false: hanya di toko baju
    #define LOOK_PRICE           (0)       // harga sekali simpan, 0 = gratis
    #define LOOK_POLICE          (true)    // anggota FACTION_POLISI boleh pilih model polisi

## Cara kerja

**Server (gamemode)**
- Menyimpan model (skin), warna kulit, wajah, item tiap bagian (`player_look.Look`, hex 114 karakter), skin biasa
  sebelum model kustom (`PrevSkin`), tinggi/berat dan skin (di `player_characters`).
- Penampilan dikirim ke client lewat packet 251 + RPC `"LOOK"` versi 2: ke pemain itu sendiri saat login, ke pemain
  lain saat ter-stream (`OnPlayerStreamIn`), ke semua yang melihatnya setelah disimpan.
- Simpan dari editor datang sebagai event CEF `"look"`. Server memeriksa sesi editor, item dalam katalog, bagian wajib
  (alis, celana; baju untuk perempuan), gender model, model polisi hanya untuk polisi, ukuran badan.

**Client**
- Satu model dipakai bersama semua ped yang memakai skin itu (geometry dan material sama). Tekstur bawaan model
  1x1 transparan. Saat model pertama terlihat, semua materialnya dibuat tidak digambar (alpha material 0: render
  callback OpenGL GTA melewati mesh seperti itu, tidak menulis depth).
- `CPed::Render` di-hook (`LookGame.cpp`): selama SATU ped digambar, material yang ditampilkan penampilannya diberi
  tekstur dan alpha 255, lalu dikembalikan. Jadi tiap pemain punya bajunya sendiri (bug lama BRL: tekstur dipasang
  permanen di material bersama, semua pemain jadi sama). Semua jalur gambar ped (dunia, penumpang kendaraan, daftar
  alpha, pantulan mobil) lewat `CPed::Render`.
- Hook `CPed::Render` yang sama juga menjaga SEMUA ped: kalau matriks tulang rusak (NaN, sumbu raksasa, jauh dari
  ped) ped tidak digambar untuk frame itu (glitch turun kendaraan, lihat `PERBAIKAN_GLITCH_TURUN_KENDARAAN.md`).
- `LookDress.cpp`: dari penampilan ke daftar material yang digambar (aturan `removeParts` / `applyParts` / tato
  tertutup dari config.lua). Dites di host dengan nama material keempat model asli.
- Tekstur dibaca di thread sendiri (stb_image), dijadikan tekstur game 2 per frame, dipakai bersama. Selama belum
  siap, bagian itu diberi warna rata-rata teksturnya. Tekstur yang 90 detik tidak dipakai dibuang.
- Badan: matriks frame clump ped diskala tiap frame, setelah `PreRender` dan sebelum tulang & objek tempel dihitung
  (`CWorld::ProcessPedsAfterPreRender`). Di dalam kendaraan ukuran normal.
- Ped yang bukan pemain (aktor) dengan model kustom memakai penampilan bawaan model itu.
- `LookEditor.cpp`: editor ImGui. Selama editor terbuka, semua sentuhan dipakai editor.

## File yang diubah di luar look/

| File | Perubahan |
|---|---|
| `game/hooks.cpp` | `look::InstallHooks()` (hook `CPed::Render`) |
| `net/netgame.cpp` | RPC `look::kRpc`, `look::Process()` tiap frame |
| `game/World.cpp` | `look::ApplyBody()` sebelum `ProcessAttach` |
| `net/playerpool.cpp` | `look::Forget()` saat pemain keluar |
| `java_systems/cef/CEF.cpp` | `look::Reset()` saat koneksi putus |
| `gui/gui.cpp` | gambar editor, sentuhan untuk editor |
| `Android.mk`, `CMakeLists.txt` | `look/tests/` dan `look/tools/` tidak ikut di-build |

## Tes host

    sh look/tests/run.sh        # katalog, format, hex, badan, pesan, aturan baju di 4 model: 10066 cek

Katalog dibuat ulang (dan paket aset) dengan:

    python3 look/tools/look_catalog.py --mta <folder resource MTA Clothes> --gm <folder gamemodes> --assets <keluaran>

Perintah ini menulis `look/LookCatalog.gen.cpp` dan `SERVER/player/look/look_catalog.inc` sekaligus. Keduanya harus
selalu sama (item dikirim sebagai nomor urut).

## Batasan yang diketahui

- Belum dites di HP. Hanya dicek: compile arm64 semua file yang diubah, simbol, tes host, compile gamemode.
- Model ini berat untuk HP: sekitar 64 ribu vertex dan 90 material per ped (mesh yang disembunyikan tidak digambar).
- Skin 7, 9, 271, 272 berubah jadi model kustom untuk semua yang memakainya (juga yang membeli skin itu di toko).
- Nama file modloader polisi (`ryder`, `forelli`) mengikuti `SAMP/peds.ide` standar SA-MP untuk ID 271/272. Kalau
  peds.ide server berbeda, ganti nama file sesuai nama model ID itu.
