# CEF3D - A_LAST

Default CEF3D URL:

`https://hanluxury.github.io/holy-asset/139.99.52.216/cef3d/index.html`

API server-side yang kompatibel dengan client CEF3D RPC 113/114. Jika parameter URL dikosongkan, API menggunakan URL default di atas.

Contoh penggunaan dengan URL default:

```pawn
EagleCEF3D_CreateObject(playerid, 5001, 19174, 1480.0, -1730.0, 13.5, 1.0);
EagleCEF3D_SetTexture(playerid, 5001, "", "1");
```

Atau langsung tanpa URL karena default sudah ditetapkan:

```pawn
EagleCEF3D_SetTexture(playerid, 5001);
```

Contoh dengan URL eksplisit:

```pawn
EagleCEF3D_SetTexture(
    playerid,
    5001,
    "https://hanluxury.github.io/holy-asset/139.99.52.216/cef3d/index.html",
    "1"
);
```

API:
- `EagleCEF3D_CreateObject`
- `EagleCEF3D_CreateObjectAll`
- `EagleCEF3D_SetTexture`
- `EagleCEF3D_SetTextureAll`
- `EagleCEF3D_SetTextureIndex`
- `EagleCEF3D_SetTextureIndexAll`

Client CEF3D tetap wajib memakai handler RPC 113/114 dan JNI `nativeUploadBytes` seperti implementasi pada `masi_bug`.


## YouTube di CEF3D

`cef3d/index.html` membaca query `video=` dari URL default. Server-side helper yang sudah disediakan:

```pawn
EagleCEF3D_PlayYouTube(playerid, 5001, "M7lc1UVf-VE", "1");
```

Default autoplay memakai `mute=1` agar lebih kompatibel dengan kebijakan autoplay WebView. YouTube mendokumentasikan embed melalui format `https://www.youtube.com/embed/VIDEO_ID` serta parameter seperti `autoplay`, `controls`, `loop`, dan `playsinline`. 

Parameter API:
- `EagleCEF3D_PlayYouTube(playerid, objectid, videoId, texName, autoplay, controls, loop, mute)`
- `EagleCEF3D_PlayYouTubeAll(objectid, videoId, texName, autoplay, controls, loop, mute)`
- `EagleCEF3D_BuildYouTubeUrl(output, outputSize, videoId, autoplay, controls, loop, mute)`

Contoh tanpa kontrol, loop aktif, mute aktif:

```pawn
EagleCEF3D_PlayYouTube(playerid, 5001, "M7lc1UVf-VE", "1", true, false, true, true);
```
