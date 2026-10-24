# EAGLE Vice City implementation status

## [FOUND]
- `CITY_LOS_SANTOS` / `CITY_VICE_CITY` and persisted `Char_LastCity` already exist.
- LS <-> Vice flight system exists in `SERVER/world/vice_city/vice_city.inc`.
- CEF phone Maps/GPS uses `PH_SetGps()` and saved pins (`eph_pins`).
- Existing coordinate-driven systems include Dynamic ATM, Garage, House, Business/Warung, Workshop, fuel, showroom/vehicle ownership, faction and job frameworks.

## [IMPLEMENTED]
- Added one shared verified coordinate source: `SERVER/world/vice_city/vice_locations.inc`.
- Flight now consumes airport/bounds constants from that shared source.
- CEF Maps category `Vice City` added; it is ordered first while `pCity == CITY_VICE_CITY`.
- Verified destination: Vice City International Airport `(4563.418945, 168.347625, 15.361562)`.
- CEF GPS validation now accepts the known Vice City bounds instead of rejecting all `x > 3500` coordinates.
- Legacy GPS menu now exposes a Vice City submenu using the same `PH_SetGps()` system.
- Global `GetLocation()` now resolves coordinates inside the verified VC bounds as `Vice City` rather than falling through to `San Andreas`.
- No new MySQL connection/schema was introduced. Existing `Char_LastCity` remains the city persistence field.

## [NEEDS VC LOCATION]
These systems should receive Vice records/locations through their existing framework after coordinates are verified:
- Police / EMS / Government / Mechanic / Transport faction branches
- Showroom/dealer, rental, fuel, bank/ATM, public garage
- Business/Warung (24/7, clothing, electronics, food), house/property
- Delivery, taxi/transport, trucking/hauling, garbage and other geographically appropriate jobs

## [NEEDS MAPPING] / [NEEDS POSITION VERIFICATION]
- VCPD
- Vice City hospital
- City Hall
- Bank
- Dealer
- Mechanic/workshop
- Gas stations
- 7-Eleven-style convenience store
- Clothing / restaurant / electronics / pharmacy / furniture / parts stores
- Taxi / trucking / delivery / garbage depots
- Rental / parking / garage

The uploaded `lastttt.zip` does not contain `vice_city_037.pwn` or the client placement/terrain files for the documented ~7,498 Vice objects. Therefore no unverified XYZ/Z/rotation was invented. Supply the actual Vice placement source/client map data to safely add these mappings and synchronize their gameplay points.
