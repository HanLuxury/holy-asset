# GAMEMODE EAGLE — Struktur Modular

Gamemode roleplay SA-MP (basis HOPE INDO RP) yang disusun secara modular.
Entry point tunggal: **`Main.pwn`** — meng-`#include` seluruh modul di folder `SERVER/`
dan `commands/`.

## Ringkasan perubahan (versi ini)

| Perubahan | Detail |
|-----------|--------|
| ✅ Database auto-create | Tabel dibuat otomatis saat start via `SERVER/database/db_install.inc` (`CREATE TABLE IF NOT EXISTS`, 79 tabel). Idempotent — DB yang sudah ada tidak berubah. |
| ✅ Hapus RemoveBuilding | 6 `RemoveBuildingForPlayer` di job *mixer* dihapus; map kembali ke default GTA:SA. |
| ✅ Bersih junk | `SERVER/inventory.zip`, `SERVER/jobs.zip`, dan file `.lnk` (shortcut Windows) dihapus. |
| ⚠️ Mapping bertekstur | Tidak ada mapping dekoratif bertekstur yang bisa dihapus — `LoadMap()` sudah nonaktif dan seluruh objek bertekstur bersifat fungsional (plat kendaraan, layar ATM, papan bus, sistem tag, objek job). Lihat catatan di bawah. |

## Struktur Folder

```
gamemodes/
├── Main.pwn                     # Entry point — mengatur semua #include & callback inti
├── README.md                    # Dokumen ini
│
├── commands/                    # Semua command (Pawn.CMD)
│   ├── cmds_admin.inc           #   command admin
│   ├── cmds_faction.inc         #   command faksi
│   ├── cmds_player.inc          #   command pemain
│   ├── cmds_hooks.inc           #   hook command
│   ├── management.inc / pengurus.inc / DISCORD.inc / NoClip.inc / ...
│
└── SERVER/                      # Seluruh sistem gamemode (modular)
    ├── database/                # ★ BARU — auto-create tabel
    │   ├── db_install.inc       #   Database_Install() dipanggil di OnGameModeInit
    │   └── install.sql          #   referensi SQL yang setara (untuk import manual)
    │
    ├── utils/                   # Fondasi: defines, enums, variable, warna, textdraw
    ├── systems/                 # Sistem inti: bank, spawn, anticheat, dialog, emote, fade, race
    ├── events/                  # Enum/callback/command/dialog global + event (TDM, xmas)
    ├── timers/                  # Task timer berkala (update, jail, anticheat)
    │
    ├── Dynamic/                 # Objek dinamis berbasis DB (rumah, gate, pintu, ATM, bisnis,
    │                            #   garasi, pasar, warung, gudang, robbery, workshop, dll)
    ├── FractionPlayer/          # Faksi: Police, EMS, Bengkel, Gojek, Pedagang, Pemerintah,
    │                            #   Trans, families, goodside
    ├── jobs/                    # Pekerjaan: farmer, fisherman, miner, bus, delivery, tailor,
    │                            #   hauling, mixer, oilman, lumberjack, dll
    ├── vehicles/                # Sistem kendaraan pemain & faksi
    ├── vehiclemod/              # Modifikasi kendaraan (modshop)
    ├── inventory/               # Sistem inventory + drop
    ├── weapons/                 # Senjata & senjata faksi
    ├── clothes/ · toys/         # Pakaian & aksesoris
    ├── user-interface/          # HUD/UI: notifikasi, textdraw, emote, spawn, dll
    ├── PlayerStuff/             # Fitur pemain: login, character select, kompas, AFK, dll
    ├── PlayerSmartphone(New)/   # Smartphone & kontak
    ├── PlayerCrafting/ · Gym/   # Crafting & gym
    ├── chat/ · voice/           # Chat & voice (sampvoice radio)
    ├── reports/ · blacklist/    # Report, warning, blacklist
    ├── damages/ · invoices/     # Log damage & invoice
    ├── fuel_system/ · toll/     # BBM & tol
    ├── showroom/ · voucher/     # Showroom & voucher
    ├── streamer/ · area/        # Streamer & area/zona
    ├── tags/ · playermarker/    # Tag objek & marker pemain
    ├── carsteal/ · toko-olahraga/
    ├── [Althaf]/ · [AlthafDrone]/  # Modul tambahan (gacha, paycheck, drone, ox-target)
    └── FractionPlayer/, dll     # (lihat isi folder untuk daftar lengkap)
```

## Database Auto-Create

Saat server start, `OnGameModeInit()` memanggil:

```pawn
DatabaseConnection();   // konek MySQL
Database_Install();     // buat semua tabel bila belum ada
```

`Database_Install()` menjalankan `CREATE TABLE IF NOT EXISTS` untuk 79 tabel.
Karena `IF NOT EXISTS`, perintah ini **aman dijalankan berulang**: pada server
yang tabelnya sudah lengkap, tidak ada yang berubah; pada database kosong/baru,
seluruh tabel dibuat sehingga gamemode bisa langsung jalan.

> **Catatan:** tipe kolom pada installer diturunkan otomatis dari pola query
> gamemode (`%d`→INT, `%f`→FLOAT, `'%s'`→VARCHAR/TEXT; kolom uang→BIGINT).
> Ini sudah akurat untuk mayoritas kasus, namun tetap disarankan meninjau
> `install.sql` bila ada kolom khusus yang butuh index/ukuran tertentu.

## Catatan "Hapus Mapping"

Permintaan menghapus mapping bertekstur tidak menghapus objek apa pun karena:

1. `LoadMap()` di `Main.pwn` sudah dinonaktifkan (dan tidak terdefinisi) — mapping
   dekoratif memang sudah tidak dimuat.
2. Seluruh pemanggilan `SetDynamicObjectMaterial`/`...MaterialText` yang tersisa
   menempel pada **objek fungsional**, bukan hiasan:
   - `vehicles/` → plat nomor & tulisan kendaraan
   - `Dynamic/Dynamic_Atm/` → layar/tekstur ATM
   - `jobs/bus/` → papan tujuan bus
   - `tags/` → sistem tag pemain
   - `Dynamic/Dynamic_Label/`, `objecttext/` → label teks
   Menghapusnya akan merusak sistem-sistem tersebut, sehingga sengaja dipertahankan.

Bila ada koordinat/objek mapping spesifik yang ingin dihapus, cukup tunjukkan
lokasinya dan objek itu bisa dibuang secara tepat sasaran.

## Kompilasi

Gamemode ini **sudah dikompilasi** menjadi `gamemodes/Main.amx` (siap dijalankan).

Untuk kompilasi ulang sendiri:

```
# Windows (pawno):
pawno\pawncc.exe gamemodes\Main.pwn -ogamemodes\Main.amx -igamemodes -ipawno\include -d3

# Linux / Android (Termux) - pakai pawncc versi linux:
pawncc gamemodes/Main.pwn -ogamemodes/Main.amx -igamemodes -ipawno/include -d3
```

Hasil: **0 error, 0 warning** (selain notice bawaan YSI soal semicolon — normal & aman).

> **Portabilitas Linux/Android:** semua path `#include` sudah diseragamkan ke
> garis miring `/` (bukan `\`) dan case folder disamakan dengan disk, supaya
> bisa dikompilasi di server Linux/Termux (Android) yang bersifat
> case-sensitive. Forward-slash tetap valid di Windows.

## Optimasi Ringan untuk SA-MP Android

Ditambahkan `SERVER/systems/systems_optimize.inc` → `Optimize_ForAndroid()`
(dipanggil di `OnGameModeInit`) yang menyetel **Streamer** agar ringan di HP:

| Setelan | Nilai | Efek |
|---------|-------|------|
| `Streamer_SetTickRate` | 150 ms | Hemat CPU server (default 50 ms) |
| `Streamer_ToggleChunkStream` | on | Sebar beban streaming → kurangi lag spike di HP |
| `Streamer_SetChunkSize` | 100 | Objek/label/pickup dimuat bertahap |
| `Streamer_SetVisibleItems` | objek 700, label 700, dll | Batas render wajar untuk mobile |
| `Streamer_SetCellSize` | 200.0 | Lebih sedikit perhitungan sel |

Nilai-nilai ini mudah disetel di file tersebut sesuai spesifikasi HP target.

### Catatan penting soal "berat/ringan"

- **Kelancaran di HP pemain** ditentukan oleh jumlah objek/label/textdraw yang
  di-stream — inilah yang dioptimasi di atas.
- **Ukuran `Main.amx` (~67 MB)** adalah pemakaian **RAM di sisi server**, bukan
  beban HP pemain. Besar karena gamemode ini sangat kaya fitur (banyak array
  global). Ini tidak memengaruhi FPS HP.
- Bila server (mis. VPS/Android host) RAM-nya terbatas, cara paling efektif
  menurunkan RAM adalah mengecilkan `MAX_PLAYERS` di `Main.pwn`
  (saat ini `100`). Semua array `[MAX_PLAYERS]` ikут mengecil linier —
  mis. `50` bisa memangkas RAM cukup banyak. (Konsekuensi: slot pemain berkurang.)
