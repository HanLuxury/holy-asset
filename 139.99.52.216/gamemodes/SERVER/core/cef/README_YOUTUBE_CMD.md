# CEF3D YouTube

Command: `/youtube [youtube_video_id]`

Example: `/youtube M7lc1UVf-VE`

The command creates client-side CEF3D object id `30000 + playerid` using model `19174` and sets the CEF3D page URL to the configured GitHub Pages endpoint with YouTube query parameters.

Replace `pawno/include/cef.inc` with the included patched `cef.inc`, and keep the `cef_youtube_cmd` include in `Main.pwn`.
