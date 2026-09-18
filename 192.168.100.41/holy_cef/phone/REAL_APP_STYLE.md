# Real-App CEF Phone UI

This package keeps the PlayerSmartphoneNew server event/logic contract and changes the presentation layer only.

## Visuals
- Bundled PNG application icons, no external CDN.
- WhatsApp, Twitter and Spotify use brand-style logo assets.
- Phone, Contacts, Bank, Vehicles, Maps/GPS, AirDrop, Games and Settings use native mobile-app style iconography.
- Each app has its own visual shell:
  - WhatsApp: green chat list and chat room with bubbles.
  - Twitter: X/Twitter-style black feed with composer and post actions.
  - Bank: banking dashboard/card and transfer form.
  - Maps/GPS: map-style panel plus saved locations.
  - Vehicles: garage cards and fuel bars.
  - Transport: ride-request screen.
  - Spotify: now-playing layout.
  - Settings: grouped mobile settings rows.
  - Contacts/Phone/Yellow Pages/AirDrop/Games: native mobile list, dialer, listing, sharing and game layouts.

## Logic compatibility
Existing CEF event names under `phone.*` are retained. No server feature is intentionally removed by the visual redesign.
