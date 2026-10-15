# Struktur Modular (v2 — tertata)

Semua modul dikelompokkan ke kategori jelas di bawah `SERVER/`.
Compile: **0 error** (`Main.amx` sudah dibuat).

```
gamemodes/
├── Main.pwn                 # entry point
├── commands/                # command (admin/faction/player/hooks/…)
└── SERVER/
    ├── core/                # inti engine
    │   ├── utils/           #   defines, enums, variable, warna, textdraw
    │   ├── systems/         #   bank, spawn, anticheat, dialog, optimize, native, …
    │   ├── events/          #   callback/command/dialog global + event
    │   ├── timers/          #   task berkala
    │   ├── database/        #   ★ auto-create tabel (db_install.inc + install.sql)
    │   └── cef/             #   ★ CEF: cef_bridge.inc (auto-hook) + cef_ui.inc
    │
    ├── player/              # fitur pemain
    │   ├── stuff/           #   login, character select, kompas, AFK, …
    │   ├── inventory/       #   inventory + drop
    │   ├── smartphone/  smartphone_new/
    │   ├── crafting/  gym/  clothes/  toys/
    │
    ├── jobs/                # semua pekerjaan (farmer, miner, mixer, bus, …)
    ├── factions/            # Police, EMS, Bengkel, Gojek, Pedagang, Pemerintah, Trans, families
    ├── dynamic/             # objek dinamis berbasis DB (rumah, gate, ATM, bisnis, garasi, …)
    ├── vehicle/             # vehicles/ + vehiclemod/
    ├── ui/                  # HUD/UI textdraw + notifikasi
    ├── world/               # area, streamer, fuel, toll, showroom, voucher, tags,
    │                        #   playermarker, carsteal, sport_store, invoices, damages,
    │                        #   reports, blacklist, chat, voice, weapons
    └── addons/              # althaf/ (gacha, paycheck, ox-target) + drone/
```

## Perubahan nama (dirapikan)
- `[Althaf]` → `addons/althaf`     (hapus kurung siku)
- `[AlthafDrone]` → `addons/drone`
- `toko-olahraga` → `world/sport_store`
- `Dynamic` → `dynamic`, `FractionPlayer` → `factions`, `user-interface` → `ui`
- `PlayerStuff` → `player/stuff`, dst (dikelompokkan ke `player/`)
- `utils/systems/events/timers/database/cef` → dikelompokkan ke `core/`

Semua path `#include` di `Main.pwn` sudah diperbarui otomatis mengikuti struktur ini.
```
# compile:
pawncc gamemodes/Main.pwn -ogamemodes/Main.amx -igamemodes -ipawno/include -d3
```
