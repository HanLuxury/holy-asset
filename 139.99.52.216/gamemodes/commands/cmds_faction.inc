/* Commands Factions Stuffs */
CMD:fhelp(playerid, params[])
{
	if(AccountData[playerid][pFaction] == FACTION_NONE) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda bukan bagian dari faction manapun!");
	switch(AccountData[playerid][pFaction])
	{
		case 1: // Polisi
		{
			ShowPlayerDialog(playerid, DIALOG_UNUSED, DIALOG_STYLE_TABLIST_HEADERS, ""ALTHF"EAGLE "WHITE"- Polisi Command", 
			"Perintah\tKeterangan\n\
			/invoice\tMemberikan tagihan/invoice untuk seseorang\n\
			/taser\tMenggunakan Pistol Taser untuk membuat efek kejut\n\
			"GRAY"/takektp\t"GRAY"Untuk menyita KTP seseorang secara paksa\n\
			/trace\tMelacak keberadaan seseorang melalui Plate, Akun Twitter, Ataupun Nomor Telepon\n\
			"GRAY"/makeskck\t"GRAY"Untuk membuat Surat Keterangan Catatan Kepolisian\n\
			/takeradio\tMengambil radio seseorang secara paksa\n\
			"GRAY"/togsiren\t"GRAY"Menyalakan sirine kendaraan kepolisian\n\
			/110\tChat Dispacth\n\
			"GRAY"/fa\t"GRAY"Faction Annoucement jika ingin memberitahukan sesuatu dipesan langit\n\
			/melt\tMembakar peleburan kepolisian\n\
			"GRAY"/pdm\t"GRAY"Membuka menu kepolisian\n\
			/takegunlic\tMengambil paksa Lisensi Senjata seseorang\n\
			"GRAY"/takesim\t"GRAY"Mengambil paksa Sim seseorang\n\
			/makegunlic\tMembuat Lisensi senjata\n\
			"GRAY"/givesim\t"GRAY"Membuat Sim untuk seseorang\n\
			/giveplate\tMemasang Plat Nomor kendaraan\n\
			"GRAY"/blacklist\t"GRAY"Memblacklist player dari layanan instansi", "Tutup", "");
		}
		case 2: // Pemerintah
		{
			ShowPlayerDialog(playerid, DIALOG_UNUSED, DIALOG_STYLE_TABLIST_HEADERS, ""ALTHF"EAGLE "WHITE"- Pemerintah Command",
			"Perintah\tKeterangan\n\
			/invoice\tMemberikan tagihan/invoice untuk seseorang\n\
			/ubahnamaktp\tMengubah nama KTP seseorang\n\
			"GRAY"/makehuntlic\t"GRAY"Membuat lisensi berburu kepada seseorang\n\
			/makektp\tMembuatkan KTP untuk seseorang\n\
			"GRAY"/takektp\t"GRAY"Mengambil paksa KTP seseorang\n\
			/blacklist\tMemblacklist player dari layanan instansi", "Tutup", "");
		}
		case 3: //ems
		{
			ShowPlayerDialog(playerid, DIALOG_UNUSED, DIALOG_STYLE_TABLIST_HEADERS, ""ALTHF"EAGLE "WHITE"- EMS Command",
			"Perintah\tKeterangan\n\
			/invoice\tMemberikan tagihan/invoice untuk seseorang\n\
			/makesks\tMembuat Surat Keterangan Sehat untuk seseorang\n\
			"GRAY"/makebpjs\t"GRAY"Membuat BPJS untuk seseorang\n\
			/togsiren\tUntuk Menyalakan Sirine pada kendaraan EMS\n\
			"GRAY"/blacklist\t"GRAY"Memblacklist player dari layanan instansi", "Tutup", "");
		}
		case 4: // Trans
		{
			ShowPlayerDialog(playerid, DIALOG_UNUSED, DIALOG_STYLE_TABLIST_HEADERS, ""ALTHF"EAGLE "WHITE"- Transportasi Command",
			"Perintah\tKeterangan\n\
			/invoice\tMemberikan tagihan/invoice untuk seseorang", "Tutup", "");
		}
		case 5: // Bengkel
		{
			ShowPlayerDialog(playerid, DIALOG_UNUSED, DIALOG_STYLE_TABLIST_HEADERS, ""ALTHF"EAGLE "WHITE"- Bengkel Command",
			"Perintah\tKeterangan\n\
			/invoice\tMemberikan tagihan/invoice untuk seseorang\n\
			/modif\tMemodifikasi kendaraan di modification point\n\
			"GRAY"/togsiren\t"GRAY"Menyalakan sirine pada kendaraan bengkel\n\
			/tow\tMenderek kendaraan\n\
			"GRAY"/untow\t"GRAY"Melepas derek pada kendaraan\n\
			/blacklist\tMemblacklist player dari layanan instansi", "Tutup", "");
		}
		case 6: // Pedagang
		{
			ShowPlayerDialog(playerid, DIALOG_UNUSED, DIALOG_STYLE_TABLIST_HEADERS, ""ALTHF"EAGLE "WHITE"- Restaurant Command",
			"Perintah\tKeterangan\n\
			/invoice\tMemberikan tagihan/invoice untuk seseorang", "Tutup", "");
		}
	}
	return 1;
}

CMD:ro(playerid, params[])
{
	new text[128];

	if (AccountData[playerid][pInjured])
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda sedang pingsan!");
	
	if (AccountData[playerid][pFaction] != FACTION_POLISI)
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda bukan anggota Kepolisian!");

	if (!AccountData[playerid][pDutyPD])
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Hanya dapat dilakukan ketika sedang On Duty!");

	if (sscanf(params, "s[128]", text))
		return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/ro [message]");
	
	if (strlen(text) > 128)
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Maximal characters pesan hanya 128 characters!");
	
	SendFactionMessage(FACTION_POLISI, 0x8D8DFFFF, "(( %s %s: %s ))", GetFactionRank(playerid), ReturnName(playerid), text);
	return 1;
}

CMD:flare(playerid, params[])
{
	if (!AccountData[playerid][IsLoggedIn] || !AccountData[playerid][pSpawned])
		return 0;
	
	if (AccountData[playerid][pFaction] != FACTION_POLISI)	
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda bukan anggota kepolisian!");
	
	if (!AccountData[playerid][pDutyPD])
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda harus duty kepolisian!");
	
	if (AccountData[playerid][pFlareActive])
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda sudah memasang Flare sebelumnya! '/destroyflare' terlebih dahulu");
		
	new Float:x, Float:y, Float:z, Float:ang;
	GetPlayerPos(playerid, x, y, z);
	GetPlayerFacingAngle(playerid, ang);

	if (IsValidDynamicObject(AccountData[playerid][pFlare]))
		DestroyDynamicObject(AccountData[playerid][pFlare]);
	
	for (new i; i < MAX_PLAYERS; i ++) {
		if (IsValidDynamicMapIcon(AccountData[playerid][pFlareIcon][i])) 
			DestroyDynamicMapIcon(AccountData[playerid][pFlareIcon][i]);
	}

	AccountData[playerid][pFlare] = CreateDynamicObject(18728, x, y, z-2.0, 0, 0, ang-90);
	AccountData[playerid][pFlareActive] = true;
	SendFactionMessage(FACTION_POLISI, -1, ""LIGHTBLUE"</>"WHITE"Player "YELLOW"%s %s(%d)"WHITE" telah meletakan flare di "BLUEJEGE"%s", GetFactionRank(playerid), AccountData[playerid][pName], playerid, GetLocation(x, y, z));

	foreach(new i : Player) if (IsPlayerConnected(i))
	{
		AccountData[playerid][pFlareIcon][i] = CreateDynamicMapIcon(x, y, z, 0, X11_YELLOW1, GetPlayerVirtualWorld(playerid), GetPlayerInterior(playerid), i, 5000.0, MAPICON_GLOBAL, -1, 0);
	}
	return 1;
}

alias:destroyflare("unflare")
CMD:destroyflare(playerid, params[])
{
	if (AccountData[playerid][pFaction] != FACTION_POLISI)	
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda bukan anggota Kepolisian!");
	
	if (!AccountData[playerid][pDutyPD])
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda harus duty kepolisian!");
	
	if (!AccountData[playerid][pFlareActive])
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak memasang Flare sebelumnya!");

	AccountData[playerid][pFlareActive] = false;
	if (IsValidDynamicObject(AccountData[playerid][pFlare])) DestroyDynamicObject(AccountData[playerid][pFlare]), AccountData[playerid][pFlare] = INVALID_STREAMER_ID;
	foreach(new i : Player) if (IsPlayerConnected(i) && AccountData[i][pFaction] == FACTION_POLISI && AccountData[i][pDutyPD]) 
	{
		if (IsValidDynamicMapIcon(AccountData[playerid][pFlareIcon][i])) DestroyDynamicMapIcon(AccountData[playerid][pFlareIcon][i]);
		AccountData[playerid][pFlareIcon][i] = INVALID_STREAMER_ID;	
	}
	SendFactionMessage(FACTION_POLISI, -1, ""LIGHTBLUE"</>"WHITE"Player "YELLOW"%s %s(%d)"WHITE" telah menghancurkan flarenya", GetFactionRank(playerid), AccountData[playerid][pName], playerid);
	return 1;
}

CMD:taser(playerid, params[])
{
	if(!SQL_IsCharacterLogged(playerid))
		return 0;
	
	if(AccountData[playerid][pFaction] != FACTION_POLISI) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda bukan anggota Kepolisian!");
	if(!AccountData[playerid][pDutyPD]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak sedang On Duty!");
	if(!PlayerTaserOn[playerid])
	{
		UpdateWeapons(playerid);
		GivePlayerWeapon(playerid, WEAPON_SILENCED, 10);
		GameTextForPlayer(playerid, "~w~TASER~n~~g~ON", 2500, 6);

		PlayerTaserOn[playerid] = true;
	}
	else 
	{
		SetWeapons(playerid);
		GameTextForPlayer(playerid, "~w~TASER~n~~r~OFF", 2500, 6);
		PlayerTaserOn[playerid] = false;
	}
	return 1;
}

CMD:makekta(playerid, params[])
{
	if(AccountData[playerid][pFaction] == FACTION_POLISI)
	{
		if(AccountData[playerid][pFactionRank] < 11) return ShowTDN(playerid, NOTIFICATION_ERROR, "Minimal rank KOMBES untuk mengakses ini!");
	}
	else if(AccountData[playerid][pFaction] == FACTION_PEMERINTAH)
	{
		if(AccountData[playerid][pFactionRank] < 7) return ShowTDN(playerid, NOTIFICATION_ERROR, "Minimal rank Wakil Gubernur untuk mengakses ini!");
	}
	else if(AccountData[playerid][pFaction] == FACTION_EMS)
	{
		if(AccountData[playerid][pFactionRank] < 7) return ShowTDN(playerid, NOTIFICATION_ERROR, "Minimal rank SEKBEN untuk mengakses ini!");
	}
	else return ShowTDN(playerid, NOTIFICATION_ERROR, "Hanya Khusus Polisi, EMS, Dan Pemerintah!");

	new otherid;
	if(sscanf(params, "u", otherid)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/makekta [name/playerid]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(!IsPlayerNearPlayer(playerid, otherid, 3.0)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak berada didekat pemain tersebut!");
	if(Inventory_Items(otherid) >= 20) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut sudah tidak memiliki slot inventory!");

	Inventory_Add(otherid, "KTA", 1581);
	ShowItemBox(otherid, "Received 1x", "KTA", 1581);
	ShowTDN(playerid, NOTIFICATION_SUKSES, "Berhasil membuat Kartu Tanda Anggota untuk seseorang");
	SendRPMeAboveHead(playerid, "Memberikan Kartu Tanda Anggota kepada seseorang", X11_PLUM1);
	return 1;
}

CMD:takektp(playerid, params[])
{
	if(!IsPlayerConnected(playerid)) return false;
	if(GetPlayerFaction(playerid) != FACTION_POLISI && GetPlayerFaction(playerid) != FACTION_PEMERINTAH) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda bukan kepolisian atau pemerintah!");
	new 
		otherid
	;
	if(sscanf(params, "u", otherid)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/takektp [playerid/Name]");
	if(otherid == INVALID_PLAYER_ID) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke dalam server!");
	if(!IsPlayerNearPlayer(playerid, otherid, 3.0)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak berada didekat pemain tersebut");
	if(!AccountData[otherid][Ktp]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak memiliki KTP!");
	if(otherid == playerid) return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat mengambil KTP diri sendiri!");

	AccountData[otherid][Ktp] = 0;
	SendRPMeAboveHead(playerid, "Mengambil paksa KTP orang didepan", X11_PLUM);
	ShowTDN(otherid, NOTIFICATION_WARNING, "KTP Anda telah diambil!");
	ShowTDN(playerid, NOTIFICATION_SUKSES, "Berhasil menyita KTP!");
	return 1;
}

CMD:trace(playerid, params[])
{
	if(!AccountData[playerid][pSpawned])
		return 0;
	
	if(AccountData[playerid][pFaction] != FACTION_POLISI)
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda bukan anggota Kepolisian!");
	
	if(AccountData[playerid][pTraceTime] > gettime())
		return ShowTDN(playerid, NOTIFICATION_WARNING, sprintf("Anda sudah melakukan pelacakan, tunggu %d detik untuk melacak kembali", AccountData[playerid][pTraceTime] - gettime()));
	
	new type, strings[128];
	if(sscanf(params, "ds[128]", type, strings)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/trace [1. NO HP | 2. Plat Kendaraan] [Nomor HP/Plat Kendaraan]");
	if(type < 1 || type > 2) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/trace [1. NO HP | 2. Plat Kendaraan] [Nomor HP/Plat Kendaraan]");
	switch(type)
	{
		case 1: // HP
		{
			static Float:x, Float:y, Float:z, bool: find;
			foreach(new i : Player)
			{
				if(IsPlayerConnected(i) && PlayerHasItem(i, "Smartphone"))
				{
					if(!strcmp(AccountData[i][pPhone], strings, false))
					{
						GetPlayerPos(i, x, y, z);

						SendClientMessageEx(playerid, -1, ""YELLOW"INFORMATION:"WHITE" Nama: "YELLOW"%s", ReturnName(i));
						SendClientMessageEx(playerid, -1, ""WHITE"- Nomor Telepon: "YELLOW"%s", strings);
						SendClientMessageEx(playerid, -1, ""WHITE"- Jenis Kelamin: "YELLOW"%s", (AccountData[i][pGender]) ? ("Laki-Laki") : ("Perempuan"));
						SendClientMessageEx(playerid, -1, ""WHITE"- Tanggal Lahir: "YELLOW"%s", AccountData[i][pAge]);
						SendClientMessageEx(playerid, -1, ""WHITE"- Lokasi Ponsel Sekarang: "YELLOW"%s", GetLocation(x, y, z));

						ShowTDN(playerid, NOTIFICATION_INFO, "Lokasi tertandai di map!");
						
						SetPlayerRaceCheckpoint(playerid, 1, x, y, z, x, y, z, 5.0);
						pMapCP[playerid] = true;
						AccountData[playerid][pTraceTime] = gettime() + 180;
						find = true;
					}
				}
			}
			if(!find) return ShowTDN(playerid, NOTIFICATION_ERROR, "Nomor telepon tidak aktif/salah!");
		}
		case 2: // Plat Kendaraan
		{
			static Float:x, Float:y, Float:z, bool: find;
			foreach(new iterid : PvtVehicles)
			{
				if(IsValidVehicle(PlayerVehicle[iterid][pVehPhysic]))
				{
					if(!strcmp(strings, PlayerVehicle[iterid][pVehPlate]))
					{
						GetVehiclePos(PlayerVehicle[iterid][pVehPhysic], x, y, z);
						SendClientMessageEx(playerid, -1, ""YELLOW"INFOMARTION:"WHITE" Jenis Kendaraan: "YELLOW"%s", GetVehicleModelName(PlayerVehicle[iterid][pVehModelID]));
						foreach(new pid : Player) if(PlayerVehicle[iterid][pVehOwnerID] == AccountData[pid][pID]){
							SendClientMessageEx(playerid, -1, ""WHITE"- Pemilik: "YELLOW"%s", ReturnName(pid));
						}
						SendClientMessageEx(playerid, -1, ""WHITE"- Plate Kendaraan: "YELLOW"%s"WHITE" - ("RED_E"Permanent"WHITE")", PlayerVehicle[iterid][pVehPlate]);
						SendClientMessageEx(playerid, -1, ""WHITE"- Lokasi Kendaraan Sekarang: "YELLOW"%s", GetLocation(x, y, z));
						ShowTDN(playerid, NOTIFICATION_INFO, "Ikuti tanda di map!");
						SetPlayerRaceCheckpoint(playerid, 1, x, y, z, x, y, z, 5.0);
						pMapCP[playerid] = true;
						AccountData[playerid][pTraceTime] = gettime() + 180;
						find = true;
					}
				}
			}
			if(!find) return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak ada plate tersebut di data kota!");
		}
	}
	return 1;
}

// CMD:trace(playerid, params[])
// {
// 	if(!IsPlayerConnected(playerid)) return 1;

// 	if(AccountData[playerid][pTraceTime] > gettime())
// 		return ShowTDN(playerid, NOTIFICATION_WARNING, sprintf("Anda sudah melakukan pelacakan, tunggu %d detik untuk melacak kembali", AccountData[playerid][pTraceTime] - gettime()));

// 	if(GetPlayerFaction(playerid) != FACTION_POLISI)
// 		return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda bukan bagian dari Kepolisian!");
	
// 	Dialog_Show(playerid, DialogTrace, DIALOG_STYLE_LIST, ""ALTHF"EAGLE "WHITE"- Tracking", ""WHITE"Lacak Nomor Telepon\n"GRAY"Lacak Plate Kendaraan\n"WHITE"Lacak Akun Twitter", "Pilih", "Batal");
// 	return 1;
// }

Dialog:DialogTrace(playerid, response, listitem, inputtext[])
{
	if(!response) return 1;
	switch(listitem)
	{
		case 0:// nomor hp
		{
			Dialog_Show(playerid, TrackNoPhone, DIALOG_STYLE_INPUT, ""ALTHF"EAGLE "WHITE"- Track Telepon", "Mohon masukkan nomor telepon valid\nContoh: 55261, 02521\n"YELLOW"(Mohon masukkan dikolom bawah sini):", "Track", "Batal");
		}
		case 1:// Plate Nomor
		{
			Dialog_Show(playerid, TrackPlateNomor, DIALOG_STYLE_INPUT, ""ALTHF"EAGLE "WHITE"- Track Plate", "Mohon masukkan nomor plate kendaraan valid\nContoh: VR 5233 BOS, VR 2122 DAN\n"YELLOW"(Mohon masukkan dikolom bawah sini):", "Track", "Batal");
		}
		case 2:// Akun Twitter
		{
			Dialog_Show(playerid, TrackAkunTwitter, DIALOG_STYLE_INPUT, ""ALTHF"EAGLE "WHITE"- Track Sosial Media", "Mohon memasukkan username akun media Twitter yang ingin dilacak\n"YELLOW"(Masukkan dibawah sini dengan Username yang Valid):", "Track", "Batal");
		}
	}
	return 1;
}
Dialog:TrackAkunTwitter(playerid, response, listitem, inputtext[])
{
	if(!response) return false;
	if(isnull(inputtext))
		return Dialog_Show(playerid, TrackAkunTwitter, DIALOG_STYLE_INPUT, ""ALTHF"EAGLE "WHITE"- Track Sosial Media", "ERROR: Tidak dapat Kosong!\nMohon memasukkan username akun media Twitter yang ingin dilacak\n"YELLOW"(Masukkan dibawah sini dengan Username yang Valid):", "Track", "Batal");

	static 
		Float:fX,
		Float:fY,
		Float:fZ;
	
	new bool: find;
	foreach(new pid : Player) {
		if(IsPlayerConnected(pid)) {
			if(PlayerHasItem(pid, "Smartphone")){
				if(!strcmp(inputtext, AccountData[pid][TwitterName])){
					GetPlayerPos(pid, fX, fY, fZ);

					SendClientMessageEx(playerid, -1, ""YELLOW"INFORMATION:"WHITE" Akun Twitter: "YELLOW"%s", AccountData[pid][TwitterName]);
					SendClientMessageEx(playerid, -1, ""WHITE"- Nomor Telepon: "YELLOW"%s", AccountData[pid][pPhone]);
					SendClientMessageEx(playerid, -1, ""WHITE"- Jenis Kelamin: "YELLOW"%s", (AccountData[pid][pGender]) ? ("Laki-Laki") : ("Perempuan"));
					SendClientMessageEx(playerid, -1, ""WHITE"- Tanggal Lahir: "YELLOW"%s", AccountData[pid][pAge]);
					SendClientMessageEx(playerid, -1, ""WHITE"- Lokasi Ponsel Sekarang: "YELLOW"%s", GetLocation(fX, fY, fZ));

					ShowTDN(playerid, NOTIFICATION_INFO, "Lokasi tertandai di map!");
					SetPlayerRaceCheckpoint(playerid, 1, fX, fY, fZ, fX, fY, fZ, 5.0);
					pMapCP[playerid] = true;
					AccountData[playerid][pTraceTime] = gettime() + 180;
					find = true;
				}
			}
		}
	}
	if(!find) return ShowTDN(playerid, NOTIFICATION_ERROR, "Akun twitter tidak ditemukan!");
	return 1;
}

Dialog:TrackNoPhone(playerid, response, listitem, inputtext[])
{
	if(!response) return 1;
	if(isnull(inputtext))
		return Dialog_Show(playerid, TrackNoPhone, DIALOG_STYLE_INPUT, ""ALTHF"EAGLE "WHITE"- Track Telepon", "Mohon masukkan nomor telepon valid\nContoh: 55261, 02521\n"YELLOW"(Mohon masukkan dikolom bawah sini):", "Track", "Batal");
	
	static 
		Float:fX,
		Float:fY,
		Float:fZ;
	
	new bool: find;
	foreach(new pid : Player) {
		if(IsPlayerConnected(pid)) {
			if(PlayerHasItem(pid, "Smartphone")){
				if(!strcmp(AccountData[pid][pPhone], inputtext, false)){
					GetPlayerPos(pid, fX, fY, fZ);

					SendClientMessageEx(playerid, -1, ""YELLOW"INFORMATION:"WHITE" Nama: "YELLOW"%s", ReturnName(pid));
					SendClientMessageEx(playerid, -1, ""WHITE"- Nomor Telepon: "YELLOW"%s", inputtext);
					SendClientMessageEx(playerid, -1, ""WHITE"- Jenis Kelamin: "YELLOW"%s", (AccountData[pid][pGender]) ? ("Laki-Laki") : ("Perempuan"));
					SendClientMessageEx(playerid, -1, ""WHITE"- Tanggal Lahir: "YELLOW"%s", AccountData[pid][pAge]);
					SendClientMessageEx(playerid, -1, ""WHITE"- Lokasi Ponsel Sekarang: "YELLOW"%s", GetLocation(fX, fY, fZ));

					ShowTDN(playerid, NOTIFICATION_INFO, "Lokasi tertandai di map!");
					SetPlayerRaceCheckpoint(playerid, 1, fX, fY, fZ, fX, fY, fZ, 5.0);
					pMapCP[playerid] = true;
					AccountData[playerid][pTraceTime] = gettime() + 180;
					find = true;
				}
			}
		}
	}
	if(!find) return ShowTDN(playerid, NOTIFICATION_ERROR, "Nomor telepon tidak aktif/salah!");
	return 1;
}

Dialog:TrackPlateNomor(playerid, response, listitem, inputtext[])
{
	if(!response) return 1;
	if(isnull(inputtext) || IsNumeric(inputtext))
		return Dialog_Show(playerid, TrackPlateNomor, DIALOG_STYLE_INPUT, ""ALTHF"EAGLE "WHITE"- Track Plate", "Mohon masukkan nomor plate kendaraan valid\nContoh: VR 5233 BOS, VR 2122 DAN\n"YELLOW"(Mohon masukkan dikolom bawah sini):", "Track", "Batal");
	
	static 
		Float:fX,
		Float:fY,
		Float:fZ;
	
	new bool: find;
	foreach(new iterid : PvtVehicles)
	{
		if(IsValidVehicle(PlayerVehicle[iterid][pVehPhysic]))
		{
			if(!strcmp(inputtext, PlayerVehicle[iterid][pVehPlate]))
			{
				GetVehiclePos(PlayerVehicle[iterid][pVehPhysic], fX, fY, fZ);

				SendClientMessageEx(playerid, -1, ""YELLOW"INFOMARTION:"WHITE" Jenis Kendaraan: "YELLOW"%s", GetVehicleModelName(PlayerVehicle[iterid][pVehModelID]));
				foreach(new pid : Player) if(PlayerVehicle[iterid][pVehOwnerID] == AccountData[pid][pID]){
					SendClientMessageEx(playerid, -1, ""WHITE"- Pemilik: "YELLOW"%s", ReturnName(pid));
				}
				SendClientMessageEx(playerid, -1, ""WHITE"- Plate Kendaraan: "YELLOW"%s"WHITE" - ("RED_E"Permanent"WHITE")", PlayerVehicle[iterid][pVehPlate]);
				SendClientMessageEx(playerid, -1, ""WHITE"- Lokasi Kendaraan Sekarang: "YELLOW"%s", GetLocation(fX, fY, fZ));
				ShowTDN(playerid, NOTIFICATION_INFO, "Ikuti tanda di map!");
				SetPlayerRaceCheckpoint(playerid, 1, fX, fY, fZ, fX, fY, fZ, 5.0);
				pMapCP[playerid] = true;
				AccountData[playerid][pTraceTime] = gettime() + 180;
				find = true;
			}
		}
	}
	if(!find) return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak ada plate tersebut di data kota!");
	return 1;
}
CMD:makesks(playerid, params[])
{
	if(AccountData[playerid][pFaction] != FACTION_EMS)
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda bukan bagian dari Mitra EMS EAGLE!");
	
	new otherid, reason[128];
	if(sscanf(params, "us[128]", otherid, reason)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/makesks [playerid/Name] [Keterangan]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(!IsPlayerNearPlayer(playerid, otherid, 3.0)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak didekat pemain tersebut!");
	
	format(AccountData[otherid][pSKSNameDoc], 32, GetRPName(playerid));
	format(AccountData[otherid][pSKSReason], 128, reason);
	format(AccountData[otherid][pSKSRankDoc], 128, GetFactionRank(playerid));
	AccountData[otherid][pSKS] = 1;
	AccountData[otherid][pSKSTime] = gettime() + (3600 * 24 * 7); // 1 Minggu

	ShowTDN(playerid, NOTIFICATION_SUKSES, sprintf("Berhasil Membuatkan %s Surat Keterangan Sehat", GetRPName(otherid)));
	ShowTDN(otherid, NOTIFICATION_INFO, sprintf("%s Membuatkan Anda Surat Keterangan Sehat", GetRPName(playerid)));
	return 1;
}

CMD:makebpjs(playerid, params[])
{
	if(AccountData[playerid][pFaction] != FACTION_EMS)
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda bukan bagian dari Mitra EMS EAGLE!");

	new otherid, level[128];
	if(sscanf(params, "us[128]", otherid, level)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/makesks [name/playerid] [faskes]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(!IsPlayerNearPlayer(playerid, otherid, 3.0)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak didekat pemain tersebut!");

	format(AccountData[otherid][pBPJSLevel], 128, level);
	AccountData[otherid][pBPJS] = 1;
	AccountData[otherid][pBPJSTime] = gettime() + (14 * 86400); // 2 Minggu

	ShowTDN(playerid, NOTIFICATION_SUKSES, sprintf("Berhasil Membuatkan %s Kartu BPJS", GetRPName(otherid)));
	ShowTDN(otherid, NOTIFICATION_INFO, sprintf("%s Membuatkan Anda Kartu BPJS", GetRPName(playerid)));
	return 1;
}

CMD:makeskck(playerid, params[])
{
	if(AccountData[playerid][pFaction] != FACTION_POLISI) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda bukan bagian dari Kepolisian EAGLE!");

	new otherid, reason[128];
	if(sscanf(params, "us[128]", otherid, reason)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/makeskck [playerid/Name] [Keterangan]");
	if(!IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi ke server!");
	if(!IsPlayerNearPlayer(playerid, otherid, 3.0)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak didekat pemain tersebut!");

	format(AccountData[otherid][pSKCKNamePol], 32, GetRPName(playerid));
	format(AccountData[otherid][pSKCKReason], 128, reason);
	format(AccountData[otherid][pSKCKRankPol], 128, GetFactionRank(playerid));
	AccountData[otherid][pSKCK] = 1;
	AccountData[otherid][pSKCKTime] = gettime() + (3600 * 24 * 5); // 5 Hari

	ShowTDN(playerid, NOTIFICATION_SUKSES, sprintf("Berhasil Membuatkan %s SKCK", GetRPName(otherid)));
	ShowTDN(otherid, NOTIFICATION_INFO, sprintf("%s Membuatkan Anda SKCK", GetRPName(playerid)));
	return 1;
}

/*CMD:takeradio(playerid, params[])
{
	if(!IsPlayerConnected(playerid) || !AccountData[playerid][IsLoggedIn]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda harus terkoneksi kedalam server!");
	if(AccountData[playerid][pFaction] != FACTION_POLISI) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda bukan bagian dari Kepolisian Kota EAGLE!");
	if(IsPlayerInjured(playerid) == 1) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda sedang pingsan!");

	new otherid;
	if(sscanf(params, "u", otherid))
		return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/takeradio [playerid/Name]");
	
	if(AccountData[otherid][pRadio] != 1) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak memiliki Radio!");
	if(otherid == INVALID_PLAYER_ID || !IsPlayerConnected(otherid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak terkoneksi kedalam server!");
	if(!IsPlayerNearPlayer(playerid, otherid, 5.0)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut tidak dekat dengan anda!");

	AccountData[otherid][pRadio] = 0;
	ShowTDN(playerid, NOTIFICATION_INFO, sprintf("Berhasil mengambil radio milik %s", ReturnName(otherid)));
	ShowTDN(otherid, NOTIFICATION_WARNING, sprintf("Petugas %s menyita radio anda", ReturnName(playerid)));
	
	new query[255];
	mysql_format(g_SQL, query, sizeof(query), "UPDATE `player_characters` SET `Char_Radio`=0 WHERE `pID`=%d", AccountData[otherid][pID]);
	mysql_tquery(g_SQL, query);
	return 1;
}*/

CMD:togsiren(playerid, params[]) 
{
	new 
		vehicle_index,
		vehicleid = GetPlayerVehicleID(playerid),
		action,
		nextParams[128];
	
	if(AccountData[playerid][pFaction] != FACTION_POLISI && AccountData[playerid][pFaction] != FACTION_EMS && AccountData[playerid][pFaction] != FACTION_BENGKEL)
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Hanya Polda, Bengkel Dan Mitra EMS Yang bisa menggunakan Sirine!");
	
	if(GetPlayerState(playerid) != PLAYER_STATE_DRIVER)
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Harus diposisi kemudi untuk menggunakan siren!");
	
	if((vehicle_index = Vehicle_ReturnID(vehicleid)) != RETURN_INVALID_VEHICLE_ID)
	{
		if(PlayerVehicle[vehicle_index][pVehFaction] != FACTION_POLISI && PlayerVehicle[vehicle_index][pVehFaction] != FACTION_EMS && PlayerVehicle[vehicle_index][pVehFaction] != FACTION_BENGKEL)
			return ShowTDN(playerid, NOTIFICATION_ERROR, "Ini bukan kendaraan yang dapat menggunakan siren!");
		
		if(PlayerVehicle[vehicle_index][pVehOwnerID] != AccountData[playerid][pID]) 
			return ShowTDN(playerid, NOTIFICATION_ERROR, "Kendaraan ini bukan milik anda!");
	}

	if(sscanf(params, "k<VehicleSiren>S()[128]", action, nextParams))
	{
		ShowTDN(playerid, NOTIFICATION_SYNTAX, "/togsiren [entity]~n~roof, dashboard, mid, off");
		return 1;
	}
	switch(action)
	{
		case 1: //roof
		{
			if(!PlayerVehicle[vehicle_index][vehSirenOn])
			{
				static
					Float:fSize[3],
					Float:fSeat[3];

				GetVehicleModelInfo(GetVehicleModel(vehicleid), VEHICLE_MODEL_INFO_SIZE, fSize[0], fSize[1], fSize[2]);
				GetVehicleModelInfo(GetVehicleModel(vehicleid), VEHICLE_MODEL_INFO_FRONTSEAT, fSeat[0], fSeat[1], fSeat[2]);

				PlayerVehicle[vehicle_index][vehSirenObject] = CreateDynamicObject(18646, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
				AttachDynamicObjectToVehicle(PlayerVehicle[vehicle_index][vehSirenObject], vehicleid, -fSeat[0], fSeat[1], fSize[2] / 2.0, 0.0, 0.0, 0.0);
				PlayerVehicle[vehicle_index][vehSirenOn] = true;
				SendClientMessageEx(playerid, X11_GREEN, "[SIREN]"WHITE" Portable Siren "GREEN"Enabled");
			}
			else ShowTDN(playerid, NOTIFICATION_ERROR, "Matikan siren terlebih dahulu!");
		}
		case 2: //dashboard
		{
			if(!PlayerVehicle[vehicle_index][vehSirenOn])
			{
				static
					Float:fSize[3],
					Float:fSeat[3];

				GetVehicleModelInfo(GetVehicleModel(vehicleid), VEHICLE_MODEL_INFO_SIZE, fSize[0], fSize[1], fSize[2]);
				GetVehicleModelInfo(GetVehicleModel(vehicleid), VEHICLE_MODEL_INFO_FRONTSEAT, fSeat[0], fSeat[1], fSeat[2]);

				PlayerVehicle[vehicle_index][vehSirenObject] = CreateDynamicObject(18646, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
				AttachDynamicObjectToVehicle(PlayerVehicle[vehicle_index][vehSirenObject], vehicleid, -fSeat[0] / 10.0, fSeat[1] + 0.7, fSize[2] / 4.0, 0.0, 0.0, 0.0);
				PlayerVehicle[vehicle_index][vehSirenOn] = true;
				SendClientMessageEx(playerid, X11_GREEN, "[SIREN]"WHITE" Portable Siren "GREEN"Enabled");
			}
			else ShowTDN(playerid, NOTIFICATION_ERROR, "Matikan siren terlebih dahulu!");
		}
		case 3: //mid
		{
			if(!PlayerVehicle[vehicle_index][vehSirenOn])
			{
				static
					Float:fSize[3],
					Float:fSeat[3];

				GetVehicleModelInfo(GetVehicleModel(vehicleid), VEHICLE_MODEL_INFO_SIZE, fSize[0], fSize[1], fSize[2]);
				GetVehicleModelInfo(GetVehicleModel(vehicleid), VEHICLE_MODEL_INFO_FRONTSEAT, fSeat[0], fSeat[1], fSeat[2]);

				PlayerVehicle[vehicle_index][vehSirenObject] = CreateDynamicObject(18646, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
				AttachDynamicObjectToVehicle(PlayerVehicle[vehicle_index][vehSirenObject], vehicleid, -fSeat[0] / 10.0, fSeat[1] / 7.0, fSize[2] / 2.0, 0.0, 0.0, 0.0);
				PlayerVehicle[vehicle_index][vehSirenOn] = true;
				SendClientMessageEx(playerid, X11_GREEN, "[Siren]"WHITE" Portable Siren "GREEN"Enabled");
			}
			else ShowTDN(playerid, NOTIFICATION_ERROR, "Matikan siren terlebih dahulu!");
		}
		case 4:
		{
			if(IsValidDynamicObject(PlayerVehicle[vehicle_index][vehSirenObject]))
				DestroyDynamicObject(PlayerVehicle[vehicle_index][vehSirenObject]);
			
			PlayerVehicle[vehicle_index][vehSirenObject] = INVALID_STREAMER_ID;
			PlayerVehicle[vehicle_index][vehSirenOn] = 0;
			SendClientMessageEx(playerid, X11_GREEN, "[SIREN]:"WHITE" Portable Siren "RED"Disabled");
		}
	}
	return 1;
}

CMD:111(playerid, params[])
{
	new minsty[512];
	if(AccountData[playerid][pFaction] != FACTION_EMS) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda bukan bagian dari EMS EAGLE!");
	new string[128];
	if(sscanf(params, "s[128]", string)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/111 [pesan]");
	
	format(minsty, sizeof(minsty), "{AED9DA}EMS | %s %s"WHITE": %s", GetFactionRank(playerid), ReturnName(playerid), params);
	SendFactionMessage(FACTION_EMS, -1, minsty);
	return 1;
}

CMD:110(playerid, params[])
{
	new minsty[512];
	if(!AccountData[playerid][IsLoggedIn]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda harus terkoneksi kedalam server!");
	if(AccountData[playerid][pFaction] != FACTION_POLISI) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda bukan bagian dari Kepolisian Kota EAGLE!");
	if(!AccountData[playerid][pDutyPD]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda belum On Duty kepolisian!");
	new string[128];
	if(sscanf(params, "s[128]", string)) return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/110 [pesan]");
	
	format(minsty, sizeof(minsty), "{201ee5}%s %s"WHITE": %s", GetFactionRank(playerid), ReturnName(playerid), params);
	SendFactionMessage(FACTION_POLISI, -1, minsty);
	return 1;
}

CMD:fa(playerid, params[])
{
	if(!AccountData[playerid][IsLoggedIn])
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda harus terkoneksi kedalam server!");

	if(AccountData[playerid][pFaction] == FACTION_NONE)
		return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak termasuk Factions!");
	
	if(isnull(params))
		return ShowTDN(playerid, NOTIFICATION_SYNTAX, "/fa [pesan]");

	if(AccountData[playerid][pFaction] == FACTION_POLISI)
	{
		static lstr[1024];
		format(lstr, sizeof(lstr), "{201ee5}POLDA | %s: "WHITE"%s", ReturnName(playerid), params);
		SendClientMessageToAllEx(-1, lstr);
	}
	if(AccountData[playerid][pFaction] == FACTION_PEMERINTAH)
	{
		static lstr[1024];
		format(lstr, sizeof(lstr), "{1cecca}PEMERINTAH | %s: "WHITE"%s", ReturnName(playerid), params);
		SendClientMessageToAllEx(-1, lstr);
	}
	if(AccountData[playerid][pFaction] == FACTION_EMS)
	{
		static lstr[1024];
		format(lstr, sizeof(lstr), "{ff0000}EMS | %s: "WHITE"%s", ReturnName(playerid), params);
		SendClientMessageToAllEx(-1, lstr);
	}
	if(AccountData[playerid][pFaction] == FACTION_TRANS)
	{
		static lstr[1024];
		format(lstr, sizeof(lstr), ""YELLOW"TRANS | %s: "WHITE"%s", ReturnName(playerid), params);
		SendClientMessageToAllEx(-1, lstr);
	}
	if(AccountData[playerid][pFaction] == FACTION_BENGKEL)
	{
		static lstr[1024];
		format(lstr, sizeof(lstr), "{f20f7e}BENGKEL | %s: "WHITE"%s", ReturnName(playerid), params);
		SendClientMessageToAllEx(-1, lstr);
	}
	if(AccountData[playerid][pFaction] == FACTION_PEDAGANG)
	{
		static lstr[1024];
		format(lstr, sizeof(lstr), "{f38b03}RESTO | %s: "WHITE"%s", ReturnName(playerid), params);
		SendClientMessageToAllEx(-1, lstr);
	}
	if(AccountData[playerid][pFaction] == FACTION_GOJEK)
	{
		static lstr[1024];
		format(lstr, sizeof(lstr), "TENTARA | %s: "WHITE"%s", ReturnName(playerid), params);
		SendClientMessageToAllEx(X11_DARKGREEN, lstr);
	}
	return 1;
}