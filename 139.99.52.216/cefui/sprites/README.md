# Sprite Icons (CEF)

Renderer memakai file di folder ini sebagai **CSS mask** lalu di-tint dengan
warna textdraw asli — jadi sprite monokrom tampil identik. Nama file:
huruf kecil, tanda `:` diganti `_`, mis. `LD_BEAT:cross` -> `ld_beat_cross.png`.

## Sudah disediakan (bentuk geometris, dibuat otomatis)
ld_spac_white, ld_dual_white, ld_bum_blkdot, ld_beat_chit, ld_spac_backgnd,
ld_bum_bum2, ld_spac_rockshp, ld_pool_ball, ld_beat_circle, ld_beat_cring,
ld_beat_cross, ld_beat_left, ld_beat_right, ld_beat_upl,
ld_chat_badchat, ld_chat_goodcha

## Perlu kamu tambahkan (ikon detail dari GTA TXD — tidak bisa dibuat otomatis)
Taruh PNG (putih/alpha di atas transparan) dengan nama sesuai lalu daftarkan
key-nya di objek `SPRITES` dalam `cefui/app.js`:

- HUD:radar_*  -> hud_radar_waypoint, hud_radar_gangy, hud_radar_gangb,
  hud_radar_impound, hud_radar_ammugun, hud_radar_diner, hud_radar_burgershot,
  hud_radar_datedisco, hud_radar_triadscasino, hud_radar_savegame,
  hud_radar_girlfriend, hud_radar_tshirt, hud_radar_enemyattack,
  hud_radar_locosyndicate
- LD_SLOT:*  (mesin slot)  -> ld_slot_cherry, ld_slot_grapes, ld_slot_bell,
  ld_slot_r_69, ld_slot_bar1_o, ld_slot_bar2_o
- LD_POKE:* / LD_CARD:*  (kartu remi) -> ld_poke_cd1c ... ld_poke_cd13s, dst
- LD_OTB2:ric3, LD_GRAV:beea, LD_POKE:cdback, LD_CARD:cdback, LOADSC13:loadsc13

> Sprite yang belum ada PNG-nya tetap tampil sebagai kotak ter-tint di posisi &
> ukuran yang benar (fallback aman) — tidak akan hilang.

Cara ekstrak TXD asli: buka `models/txd/ld_*.txd` / `hud.txd` dari GTA SA
pakai TXD Workshop / Magic.TXD, export sprite jadi PNG, lalu simpan di sini.
