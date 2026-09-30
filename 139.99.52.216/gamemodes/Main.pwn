#if defined ALTHF
      
██████╗ ███████╗███╗   ███╗ █████╗ ██╗  ██╗███████╗   ██████╗ ██╗   ██╗   █████╗ ██╗     ████████╗██╗  ██╗ █████╗ ███████╗
██╔══██╗██╔════╝████╗ ████║██╔══██╗██║ ██╔╝██╔════╝   ██╔══██╗╚██╗ ██╔╝  ██╔══██╗██║     ╚══██╔══╝██║  ██║██╔══██╗██╔════╝
██████╔╝█████╗  ██╔████╔██║███████║█████╔╝ █████╗     ██████╔╝ ╚████╔╝   ███████║██║        ██║   ███████║███████║█████╗  
██╔══██╗██╔══╝  ██║╚██╔╝██║██╔══██║██╔═██╗ ██╔══╝     ██╔══██╗  ╚██╔╝    ██╔══██║██║        ██║   ██╔══██║██╔══██║██╔══╝  
██║  ██║███████╗██║ ╚═╝ ██║██║  ██║██║  ██╗███████╗   ██████╔╝   ██║     ██║  ██║███████╗   ██║   ██║  ██║██║  ██║██║
╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝   ╚═════╝    ╚═╝     ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝

/* 

	Remake By Althaf Abraham
	listupdate3.0.html

*/

 /*PROJECT BY BOTAK
 DEVELOPER BOTAK
 OWNER SIZE X BOTAK*/
 
/* 

	ReyGmg Community & Store
    -> Fix 13 Warning 

*/

#endif
#pragma compress 0
#pragma warning disable 239
#pragma warning disable 214
#pragma warning disable 203
#pragma warning disable 219
#pragma semicolon 1
#pragma dynamic	 1000000

#define CGEN_MEMORY 100000
#define YSI_NO_HEAP_MALLOC

/* Includes */
#include <a_samp>

#undef MAX_PLAYERS
#define MAX_PLAYERS 100

#include <memory>
#include <map-zones>

/* Android CEF transport must be visible before YSI/sscanf helpers. */
#include <Pawn.RakNet>
#include <cef>
#include "eagle_cef_compat"
#pragma warning push
#pragma warning disable 217
#include "SERVER/core/cef/cef_feature_ui"
#pragma warning pop

#include <a_mysql>
#include <a_zones>
#include <streamer>
#include <sscanf2> 
#include <gvar>
#include <crashdetect>

#include <YSI_Coding/y_timers>      		//by Y_Less from YSI
#include <YSI_Server/y_colours/x11def>      //by Y_Less from YSI
#pragma warning push
#pragma warning disable 201
#include <YSI_Storage/y_ini>				//by Y_Less from YSI
#pragma warning pop
#include <easyDialog> 
#include <screen-colour-fader>
#include <Pawn.CMD>
#include <FiTimestamp>
#define ENABLE_3D_TRYG_YSI_SUPPORT
#include <3DTryg>
#include <EVF2>

#include <nex-ac>                   //BY Nexus
#include <nex-ac_id.lang> 

#include <strlib>                   //by Slice
#include <garageblock>
#include <cb>
#include "SERVER/core/cef/cef_ui"      // helper UI CEF per-sistem (notify, itembox, dst)
#include "SERVER/core/cef/cef3d_gameplay"   // EAGLE - CEF3D world-texture bridge

// #define DiscordMode
#define Production
// #define Local

// #define DebugLoad

#if defined DiscordMode
	#define DCMD_PREFIX '!'	
	#include <discord-connector>
	#include <discord-cmd>
#endif

//#define MAKE_PELER
#if defined MAKE_PELER
    #include <profiler>
#endif
// #include <ndialog-pages>

/* Includes */
/* Legacy duplicate includes retained as comments.
#include <a_samp>
#include <streamer>					//by Incognito
#include <sscanf2>					//by Y_Less fixed by maddinat0r & Emmet_
#include <a_mysql>
#include <map-zones>

#include <crashdetect>				//by Southclaws
#include <gvar>						//by Incognito

#include <Pawn.CMD> 				//
#include <FiTimestamp>

#include <EVF2>
#include <YSI/y_timers>      		//by Y_Less from YSI
#include <YSI/y_colours>            //by Y_Less from YSI
#include <YSI/y_ini>				//by Y_Less from YSI

#define ENABLE_3D_TRYG_YSI_SUPPORT
#include <3DTryg>

#include <nex-ac>					//
#include <strlib>					//
#include <easyDialog>				//
#include <garageblock>
#include <cb>						//by Emmet
// #include <Circulo>
// #include <noclass>
*/

new Count = -1;
new countTimer;
new showCD[MAX_PLAYERS];
new CountText[5][5] =
{
	"~r~1",
	"~y~2",
	"~y~3",
	"~y~4",
	"~y~5"
};

new 
	WorldWeather = 1;

new MySQL: g_SQL;

enum
{
	NOTIFICATION_ERROR,
	NOTIFICATION_SUKSES,
	NOTIFICATION_WARNING,
	NOTIFICATION_INFO,
	NOTIFICATION_SYNTAX
};

enum 
{
	DEFAULT_XP = 5
};

/* Player Enums*/
enum E_PLAYERS
{
	pID,
	pUCP[22],
	pExtraChar,
	pChar,
	pName[MAX_PLAYER_NAME],
	pAdminname[MAX_PLAYER_NAME],
	pIP[16],
	pVerifyCode,
	pPassword[65],
	pSalt[17],
	pAdmin,
	pLevel,
	pLevelUp,
	pVip,
	pVehicleExtraSlots,
	pVehicleExtraSlotTime,
	pVipNameCustom[256],
	pVipNameTime,
	pVipTime,
	pRegDate[50],
	pLastLogin[50],
	pLastSpawn,
	pMoney,
	pRedMoney,
	STREAMER_TAG_3D_TEXT_LABEL:pMaskLabel,
	STREAMER_TAG_3D_TEXT_LABEL:pLabelDuty,
	pBankMoney,
	pSaldoGopay,
	pTargetGopay,
	pJumlahGopay,
	pBankRek,
	Smartphone,
	pPhone[32],
	pContact,
	pCall,
	pHours,
	pMinutes,
	pSeconds,
	pPaycheck,
	pSkin,
	pFacSkin,
	pGender,
	pUniform,
	pUsingUniform,
	pAge[50],
	pOrigin[32],
	pTinggiBadan,
	pBeratBadan,
	pInDoor,
	pInHouse,
	pInRusun,
	pInBiz,
	pInFamily,
	Float: pPosX,
	Float: pPosY,
	Float: pPosZ,
	Float: pPosA,
	pInt,
	pWorld,
	Float:pHealth,
    Float:pArmour,
	pHunger,
	pThirst,
	pHungerTime,
	pThirstTime,
	pStress,
	pStressTime,
	pInjured,
	pInjuredTime,
	pOnDuty,
	pFaction,
	pFactionRank,
	pTazer,
	pTaserGun,
	pLastShot,
	pShotTime,
	pStunned,
	pFamily,
	pFamilyRank,
	pJail,
	pJailTime,
	pJailReason[126],
	pJailBy[MAX_PLAYER_NAME],
	pArrest,
	pArrestTime,
	pWarn,
	pJob,
	pMask,
	pMaskID,
	pMaskOn,
	pHelmet,
	pGuns[13],
    pAmmo[13],
	pWeapon,
	Cache:Cache_ID,
	bool: IsLoggedIn,
	LoginAttempts,
	pSpawned,
	pAdminDuty,
	pAdminHide,

	//the star
	pTheStars,
	pTheStarsTime,

	pFreezeTimer,
	pFreeze,
	pSPY,
	pTogPM,
	pTogGlobal,
	pTogWT,
	Text3D:pAdoTag,
	bool:pAdoActive,

	//FPS
	pFPSDisplay,
	
	pFlare,
	bool:pFlareActive,
	pFlareIcon[MAX_PLAYERS],

	pTrackCar,
	pTrackHoused,
	pCuffed,
	toySelected,
	bool:PurchasedToy,
	pEditingItem,
	pEditingAmmount,
	pProductModify,
	pCurrSeconds,
	pCurrMinutes,
	pCurrHours,
	pSpec,
	playerSpectated,
	pFriskOffer,
	pDragged,
	pDraggedBy,
	pDragTimer,
	pHelmetOn,
	pSeatBelt,
	pReportTime,
	pAskTime,
	pActivity,
	pActivityStatus,
	pActivityTime,
	Float: ActivityTime,
	Float: NotifyTime,
	pLoadingBar,
	pTimerLoading,
	pDiPesawat,
	//Jobs
	pSideJob,
	pSideJobTime,
	pSweeperTime,
	pBusTime,
	pMowerTime,
	pVehicleFaction,
	pMechVeh,
	pMechColor1,
	pMechColor2,
	EditingSAMPAHID,
	EditingPOMID,
	EditingATMID,
	EditingROBERID,
	EditingLADANGID,
	EditingUraniumID,
	EditingDeerID,
	bool: pOnBusJob,
	pTransfer,
	pTransferRek,
	pTransferName[128],
	pAtmInputAmount,
	gEditID,
	gEdit,
	pHead,
 	pPerut,
 	pLHand,
 	pRHand,
 	pLFoot,
 	pRFoot,
 	pDutyTimer,
	pPark,
	pACWarns,
	pACTime,
	pJetpack,
	pArmorTime,
	pLastUpdate,
	pBus,
	pSweeper,
	pMower,
	pSpeedTime,
	pLoopAnim,
	SelectBandara,
	SelectPelabuhan,
	SelectRusun,
	SelectRumah,
	SelectLastExit,
	pMainXo,
	pSelectItem,
    pSelectItem2,
	pSelectItem3,
	pSelectItem4,
	pSelectItem5,
	pListItem,
	pListItemGudang,
	pBagasiTake,
	pVehListItem,
	pStorageGudang,
	pGiveInv,
	pAmountInv,
	pPmin,
	pPsec,
	pBsec,
	pCSmin,
	pCSsec,
	pDipanggilan,
	pTargetAirdrop[10],
	pNamaAirdrop[32],
	pNomorAirdrop[32],
	pNominal,
	pRekening,
	pTargetFamily[10],
	pOnBadai,
	pGSec,
	pDutyPD,
	pDutyPemerintah,
	pDutyEms,
	pDutyBengkel,
	pDutyPedagang,
	pDutyGojek,
	pDutyTrans,
	pDutyKargo,
	pRespawnVehJob,
	pTimerRespawn,
	pTimerSpawnKanabis,
	pEditingPenumpang,
	pSignalTime,
	pEarphone,
	pRadio,
	pAsapRokok,
	pHisapRokok,
	pMancing,
	Float: pBeratItem,
	Float: pRusunCapacity,
	Float: pGudangCapacity,
	pJerigenUse,
	bool:pActionActive,
	pHasGudangID,
	pGudangRentTime,
	pOwnedRusun,
	Ktp,
	LastSpawn,
	Spawned,
	pRobSec,
	pRobMin,
	pPaycheckTime,
	pSimA,
	pSimB,
	pSimC,
	pSimATime,
	pSimBTime,
	pSimCTime,
	pGunLic,
	pGunLicTime,
	pHuntingLic,
	pHuntingLicTime,
	pStorageSelect,
	DownloadWhatsapp,
	DownloadSpotify,
	DownloadGojek,
	DownloadTwitter,
	EngineOn,
	pSpeedLimit,
	GarkotVehList,
	ClickSpawn,
	pInviteRusun,
	pInviteHouse,
	pInviteAccept,
	pKompensasi,
	pGoodMood,
	pOwnedHouse,
	pOpenBackpackTimer,
	bool:pStarterpack,
	pDealerVeh,
	pTempName[MAX_PLAYER_NAME],
	pTempValue,
	pTempVehID,
	pTempVehJobID,
	pTempSQLFactMemberID,
	pTempSQLFactRank,
	pTempSQLFamMemberID,
	pTempSQLFamRank,
	pTempText[320],
	pTempPlayerID,
	pTempCallNumber,
	pSKS,
	pSKSTime,
	pSKSNameDoc[128],
	pSKSRankDoc[128],
	pSKSReason[128],
	pSKCK,
	pSKCKTime,
	pSKCKNamePol[128],
	pSKCKRankPol[128],
	pSKCKReason[128],
	pBPJS,
	pBPJSTime,
	pBPJSLevel[128],
	pSKWB,
	pSKWBTime,
	pCarSeller,
    pCarOffered,
    pCarValue,
	pTogAutoEngine,
	phoneShown,
	pCaller,
	pDurringKarung,
	pTarget,
	pVehAudioPlay,
	hsAudioPlay,
	pHotlineTime,
	pTraceTime,
	TwitterName[128],
	TwitterPassword[128],
	Twitter,
	bool: pTurningEngine,
	bool: UsingDoor,
	bool: CurrentlyReadWA,
	bool: CurrentlyReadYellow,
	bool: CurrentlyReadTwitter,

	bool: EMSDuringReviving,

	pTrashmaster,
	pTrashmasterDelay,
	pLastVehicle,
	pDeliveryTime,
	pForkliftTime,

	/* Dragging */
	pDragOffer,
	pFriendHouseID,

	pFixmeTime,
	pTempOlah,
	pClaimStarterpack,

	bEditID,
	bEdit,

	pEditSlotID,

	/* Taxi Stuffs */
	pTaxiDuty,
	pTaxiOrder,
	pTaxiPlayer,
	pTaxiFee,
	pTaxiRunDistance,
	pArgoTaxi,
	Float:tPos[3],
	
	//saving
	aReceivedReports,
	aDutyTimer,
	pFashionItem,

	//notsave
	bool: AirdropPermission,
	bool:phoneAirplaneMode,
	bool:phoneDurringConversation,
	bool:phoneIncomingCall,
	phoneCallingWithPlayerID,
	phoneCallingTime,
	phoneCallRingtone[128],

	pFactDutyTimer,
	Float:pMapSettings,
	pMapRender,
	pSuspectTimer,
	bool: menuShowed,
	playerClickSpawn,
	pTogSpy,
	OnlineTimer,
	bool: ToggleFPS,
	DokterLokalTimer,

	pCheckpoint,
	pXmasTime,
	pTogAC,
	pStyleNotif,
	
	pShowFooter,
	pFooterTimer,

	//Afk System
	Float:pAFKPos[6],
	pAFK,
	pAFKTime,
	pAFKCode,

	pEditTextObject,
	pHUDMode,
	bool: pInfoPlayerShown,
	bool: pNameTagShown,
	bool: pNtagShown,

	bool: pFlashShown,
	bool: pFlashOn,

	pJobVehicle,

	//whatsapp
	pWAMessage,

	//garkot td
	pUseGarage,
	pGarage[4],
	pGetPARKID,
	pTakeVehicle,

	pPage,
	pEditing,
	pEditingStr[64],

	pTweetType,

	pWorkshop,
	pWorkshopRank,
	pWsInvite,
	pWsOffer,

	bool:newCitizen,
    newCitizenTimer,
	pShowNotifBox,

	pSawit,
	pStockSawit,

	pBetulNama,
    pBetulGender,
	pBetulAge,
	pBetulHeight,
	pBetulWeight,
	pBetulOrigin,
	bool:pIsSmoking,
	bool:pIsSmokeBlowing,
	pSmokedTimes,
	bool:pMuted
};
new AccountData[MAX_PLAYERS][E_PLAYERS];

enum
{
	DIALOG_MAKE_CHAR,
	DIALOG_CHARLIST,
	DIALOG_CHARCONFIRM,
	DIALOG_CHARCREATE_CONFIRM,
	DIALOG_VERIFYCODE,
	DIALOG_UNUSED,
    DIALOG_LOGIN,
    DIALOG_REGISTER,
    DIALOG_AGE,
	DIALOG_ORIGIN,
	DIALOG_TINGGIBADAN,
	DIALOG_BERATBADAN,
	DIALOG_GENDER,
	DIALOG_TOY,
	DIALOG_TOYBUY,
	DIALOG_TOYEDIT,
	DIALOG_TOYEDIT_ANDROID,
	DIALOG_TOYPOSISI,
	DIALOG_TOYPOSISIBUY,
	DIALOG_TOYVIP,
	DIALOG_TOYPOSX,
	DIALOG_TOYPOSY,
	DIALOG_TOYPOSZ,
	DIALOG_TOYPOSRX,
	DIALOG_TOYPOSRY,
	DIALOG_TOYPOSRZ,
	DIALOG_TOYPOSSX,
	DIALOG_TOYPOSSY,
	DIALOG_TOYPOSSZ,
	DIALOG_HELP,
	DIALOG_EDITBONE,
	DIALOG_REPORTS,
	DIALOG_REPORTSREPLY,
	DIALOG_ASKS,
	DIALOG_ASKSREPLY,
	DIALOG_HEALTH,
	DIALOG_TDM,
	DIALOG_DISNAKER,
	DIALOG_MEMBERI,
	DIALOG_SETAMOUNT,
	DIALOG_PAYCHECK_WITHDRAW,
	DIALOG_MODIF,
	DIALOG_MODIF_VELG,
	DIALOG_MODIF_SPOILER,
	DIALOG_MODIF_HOODS,
	DIALOG_MODIF_VENTS,
	DIALOG_MODIF_LIGHTS,
	DIALOG_MODIF_EXHAUSTS,
	DIALOG_MODIF_FRONT_BUMPERS,
	DIALOG_MODIF_REAR_BUMPERS,
	DIALOG_MODIF_ROOFS,
	DIALOG_MODIF_SIDE_SKIRTS,
	DIALOG_MODIF_BULLBARS,
	DIALOG_MODIF_NEON,
	
	DIALOG_STREAMER_CONFIG,
	DANN_RENTAL,
	DANN_UNRENT,
	DANN_ASURANSI,
	DANN_BUYALATSTEAL,
	DANN_PILIHSPAWN,
	DANN_PICKUPVEH,
	DANN_DYNHELP,

	DIALOG_RUSUN,
	DIALOG_RUSUN_OWNED,
	DIALOG_RUSUN_BRANKAS,
	DIALOG_RUSUN_INVITE,
	DIALOG_RUSUN_INVITECONF,
	DIALOG_RUSUN_BROPTION,
	DIALOG_RUSUN_MENU,
	DIALOG_RUSUNOWNED,
	DIALOG_RUSUNOPENSTORAGE,
	DIALOG_RUSUNITEM,

	DIALOG_RUSUNVAULT_DEPOSIT,
	DIALOG_RUSUNVAULT_WITHDRAW,
	DIALOG_RUSUNVAULT_IN,
	DIALOG_RUSUNVAULT_OUT,
	
	DIALOG_KAYU_START,
	DIALOG_SUSU_START,
	DIALOG_MINYAK_START,
	DIALOG_AYAM_START,
	DIALOG_MOWER_START,
	DIALOG_STEAL_SHOP,
	DIALOG_IKEA_MENU,
	DIALOG_IKEA_BESI,
	DIALOG_IKEA_BERLIAN,
	DIALOG_IKEA_EMAS,
	DIALOG_IKEA_TEMBAGA,
	DIALOG_IKEA_AYAMKEMAS,
	DIALOG_IKEA_KAYUKEMAS,
	DIALOG_IKEA_GAS,
	DIALOG_IKEA_PAKAIAN,

	DIALOG_FARMER_OLAH,
	DIALOG_LOUNGES_MASAK,
	DIALOG_HUNTING_SELL,
	DIALOG_BAGASISTORAGE,

	DIALOG_GUDANG,
	DIALOG_GUDANGSTOP,
	DIALOG_GUDANGOPTION,
	DIALOG_GUDANGOWNED,
	DIALOG_GUDANGITEM,
	DIALOG_GUDANGDEPOSIT,
	DIALOG_GUDANGWITHDRAW,

	LokasiGps,
	LokasiUmum,
	LokasiPekerjaan,
	LokasiHobi,
	LokasiPertokoan,
	DialogWarung,
	BeliNasduk,
	BeliAqua,
	BeliUmpan,
	DialogGadget,
	DANN_BOOMBOX,
	DANN_BOOMBOX1,
	DialogSpotify,
	DialogSpotify1,
	DialogFish,
	DialogCargo,
	DialogSpawn,
	DialogDropItem,
	DialogTransfer,
	DialogTransfer1,
	DialogBankConfirm,
	DialogElist,
	// -----------
	DialogShowroom,
	DialogAsuransi,
	// -------------
	DialogKontak,
	DialogOpenContact,
	DialogContact,
	DialogTelepon,
	DialogContactMenu,
	DialogContactMenus,
	DialogGarasiKota,
	DialogMyVeh,
	DialogTrackMyVeh,
	DialogBagasi,
	// -----------
	DialogToyEdit,

	DIALOG_CRAFTING,
	DIALOG_CRAFTINGCONF,
	DIALOG_FAMILY_PANEL,
	DIALOG_FAMSTAKE_REDMONEY,
	DIALOG_FAMSTAKE_MONEY,
	DIALOG_FAMGARAGE_OUT,
	DIALOG_BLACKMARKET,
	
	DIALOG_DEPOSIT_POLICE,
	DIALOG_WITHDRAW_POLICE,

	DIALOG_POLVAULT,
	DIALOG_POLVAULT_DEPOSIT,
	DIALOG_POLVAULT_WITHDRAW,
	DIALOG_POLVAULT_IN,
	DIALOG_POLVAULT_OUT,

	DIALOG_POLICE_PANEL,
	DIALOG_POLICE_BOSDESK,
	DIALOG_POLICESETRANK,
	DIALOG_POLICEKICKMEMBER,
	DIALOG_RANK_SET_POLISI,
	DIALOG_POLICE_INVITE,
	DIALOG_POLICE_GARAGE,
	DIALOG_POLICE_GARAGE_BUY,
	DIALOG_POLICE_GARAGE_DEL,
	DIALOG_POLICE_HELI_GARAGE,
	DIALOG_POLICE_HELI_BUY,
	DIALOG_POLICE_HELI_GARAGE_OUT,
	DIALOG_POLICE_GARAGE_OUT,
	DIALOG_POLICE_IMPOUND,
	DIALOG_POLICE_TAKE_IMPOUND,
	DIALOG_FEDERAL_GARAGE,
	DIALOG_FEDERAL_GARAGE_BUY,
	DIALOG_FEDERAL_GARAGE_OUT,
	DIALOG_PDM,
	DIALOG_PDM_VEHICLE,
	DIALOG_PDM_VEHICLE_IMPOUND,
	DIALOG_PDM_OBJECT,
	DIALOG_ADD_HKRIMINAL,
	DIALOG_REMOVE_HKRIMINAL,
	
	DIALOG_EMS_PANEL,
	DIALOG_EMS_GARAGE,
	DIALOG_EMS_GARAGE_BUY,
	DIALOG_EMS_GARAGE_TAKEOUT,
	DIALOG_EMS_GARAGE_DELETE,
	DIALOG_EMSBRANKAS,
	DIALOG_EMSBKCONFIRM,
	DIALOG_EMS_BOSDESK,
	DIALOG_EMS_INVITE,
	DIALOG_EMS_LOCKER,
	DIALOG_EMS_CLOTHES,
	DIALOG_EMSSETRANK,
	DIALOG_EMSKICKMEMBER,
	DIALOG_RANK_SET_EMS,
	DIALOG_DEPOSIT_EMS,
	DIALOG_WITHDRAW_EMS,

	DIALOG_EMSVAULT,
	DIALOG_EMSVAULT_DEPOSIT,
	DIALOG_EMSVAULT_WITHDRAW,
	DIALOG_EMSVAULT_IN,
	DIALOG_EMSVAULT_OUT,
	// ------------------ PEMERINTAH
	DIALOG_PEMERINTAH_LOCKER,
	DIALOG_PEMERINTAH_LOCKERMALE,
	DIALOG_PEMERINTAH_LOCKERFEMALE,
	DIALOG_PEMERINTAH_PANEL,
	DIALOG_PEMERINTAH_BOSDESK,
	DIALOG_PEMERSETRANK,
	DIALOG_PEMERKICKMEMBER,
	DIALOG_RANK_SET_PEMERINTAH,
	DIALOG_PEMERINTAH_INVITE,
	DIALOG_PEMERINTAH_DEPOSIT,
	DIALOG_PEMERINTAH_WITHDRAW,
	DIALOG_PEMER_GARAGE,
	DIALOG_PEMER_GARAGE_BUY,
	DIALOG_PEMER_GARAGE_TAKEOUT,
	DIALOG_PEMER_GARAGE_DELETE,
	
	DIALOG_PEMERVAULT,
	DIALOG_PEMERVAULT_DEPOSIT,
	DIALOG_PEMERVAULT_WITHDRAW,
	DIALOG_PEMERVAULT_IN,
	DIALOG_PEMERVAULT_OUT,

	DIALOG_PEDSETRANK,
	DIALOG_PEDKICKMEMBER,
	DIALOG_RANK_SET_PEDAGANG,
	DIALOG_LOCKERPEDAGANG,
	DIALOG_PEDAGANG_GARAGE,
	DIALOG_PEDAGANG_GARAGE_BUY,
	DIALOG_PEDAGANG_GARAGE_TAKEOUT,
	DIALOG_PEDAGANG_GARAGE_DELETE,

	DIALOG_BENGKEL_PANEL,
	DIALOG_BENGKEL_LOCKER,
	DIALOG_BENGKEL_CLOTHES,
	DIALOG_BENGKEL_GARAGE,
	DIALOG_MODIF_COLOROPTION,
	DIALOG_MODIF_WARNA1,
	DIALOG_MODIF_WARNA2,
	DIALOG_MODIF_PAINTJOB,
	DIALOG_BENGKELBUYVEH,
	DIALOG_BENGKELTAKEVEH,
	DIALOG_BENGKEL_BRANKASOPTION,
	DIALOG_BENGKEL_BRANKASITEM,
	DIALOG_BENGKEL_BRANKASCONF,
	DIALOG_BENGKEL_BRANKASREPAIRKIT,
	DIALOG_BENGKEL_BRANKASTOOLSKIT,
	DIALOG_BENGKEL_BOSDESK,
	DIALOG_BENGKEL_INVITE,
	DIALOG_BENGKELSETRANK,
	DIALOG_BENGKELKICKMEMBER,
	DIALOG_RANK_SET_BENGKEL,
	DIALOG_BENGKELDELCAR,
	DIALOG_DEPOSIT_BENGKEL,
	DIALOG_WITHDRAW_BENGKEL,

	DIALOG_BENGVAULT,
	DIALOG_BENGVAULT_DEPOSIT,
	DIALOG_BENGVAULT_WITHDRAW,
	DIALOG_BENGVAULT_IN,
	DIALOG_BENGVAULT_OUT,

	DIALOG_BOSDESK_GOJEK,
	DIALOG_DEPOSIT_GOJEK,
	DIALOG_WITHDRAW_GOJEK,
	DIALOG_RANK_SET_GOJEK,
	DIALOG_GOJEK_INVITECONF,
	DIALOG_GOJEK_LOCKER,

	DIALOG_GOJEK_GARAGE,
	DIALOG_GOJEK_GARAGE_BUY,
	DIALOG_GOJEK_GARAGE_TAKEOUT,
	DIALOG_GOJEK_GARAGE_DELETE,

	DIALOG_GOJVAULT,
	DIALOG_GOJVAULT_DEPOSIT,
	DIALOG_GOJVAULT_WITHDRAW,		
	DIALOG_GOJVAULT_IN,	
	DIALOG_GOJVAULT_OUT,

	DIALOG_PAYGOJEK,
	DIALOG_PAYGOJEKAMOUNT,
	DIALOG_TOPUPGOJEK,
	DIALOG_PESANGORIDE,
	DIALOG_PESANGORIDECONF,
	DIALOG_PESANGOCAR,
	DIALOG_PESANGOCARPENUMPANG,
	DIALOG_PESANGOCARCONF,
	DIALOG_GOPAYWITHDRAW,
	
	DIALOG_GOFOOD_PESAN,
	DIALOG_PESAN_NASIGORENG,
	DIALOG_PESAN_BAKSO,
	DIALOG_PESAN_NASIPECEL,
	DIALOG_PESAN_BUBUR,
	DIALOG_PESAN_SUSU,
	DIALOG_PESAN_ESTEH,
	DIALOG_PESAN_KOPI,
	DIALOG_PESAN_CHOCOMATCH,
	DIALOG_PESAN_NOTES,
	
	DIALOG_ITEM_PICKUP,

	DIALOG_FAMSVAULT,
	DIALOG_FAMSVAULT_DEPOSIT,
	DIALOG_FAMSVAULT_WITHDRAW,
	DIALOG_FAMSRM_VAULT,
	DIALOG_FAMSRM_DEPOSIT,
	DIALOG_FAMSRM_WITHDRAW,
	DIALOG_FAMSVAULT_IN,
	DIALOG_FAMSVAULT_OUT,
	DIALOG_FAMSBRANKAS,
	DIALOG_FAMS_WEAPON,
	DIALOG_FAMILIESSETRANK,
	DIALOG_FAMILIESKICKMEMBER,
	DIALOG_RANK_SET_FAMILIES,

	DIALOG_VEHICLE_MENU,
	DIALOG_VHOLSTER,
	DIALOG_VHOLSTER_WITHDRAW,

	DIALOG_SPORTSTORE,

	/* Trans Dialog */
	DIALOG_TRANSORDER,
	DIALOG_TRANS_LOCKER,
	DIALOG_TRANS_DESK,
	DIALOG_TRANSSETRANK,
	DIALOG_TRANSKICKMEMBER,
	DIALOG_RANK_SET_TRANS,
	DIALOG_TRANS_INVITECONF,
	DIALOG_DEPOSIT_TRANS,
	DIALOG_WITHDRAW_TRANS,
	DIALOG_TRANS_GARAGE,
	DIALOG_TRANS_GARAGE_TAKEOUT,
	DIALOG_TRANS_GARAGE_BUY,
	DIALOG_TRANS_GARAGE_DELETE,

	DIALOG_TRANSVAULT,
	DIALOG_TRANSVAULT_DEPOSIT,
	DIALOG_TRANSVAULT_WITHDRAW,
	DIALOG_TRANSVAULT_IN,
	DIALOG_TRANSVAULT_OUT,

	/*Bagasi Dialog*/
	DIALOG_BAGASI,
	DIALOG_BAGASI_DEPOSIT,
	DIALOG_BAGASI_IN,
	DIALOG_BAGASI_WITHDRAW,
	DIALOG_BAGASI_OUT,

	/*Event Dialog*/
	DIALOG_EVENT_SETTING,
	DIALOG_EVENT_REDSKIN,
	DIALOG_EVENT_REDWEAP1,
	DIALOG_EVENT_REDWEAP2,
	DIALOG_EVENT_REDWEAP3,

	DIALOG_EVENT_BLUESKIN,
	DIALOG_EVENT_BLUEWEAP1,
	DIALOG_EVENT_BLUEWEAP2,
	DIALOG_EVENT_BLUEWEAP3,

	DIALOG_EVENT_WWID,
	DIALOG_EVENT_INTID,
	DIALOG_EVENT_TIME,
	DIALOG_EVENT_TARGETSCORE,
	DIALOG_EVENT_PARTICIPRIZE,
	DIALOG_EVENT_PRIZE,
	DIALOG_EVENT_HEALTH,
	DIALOG_EVENT_ARMOUR,

	/* Dialog Aridrop */
	DIALOG_AIRDROP,
	DIALOG_AIRDROPDISPLAY,
	DIALOG_AIRDROP_CONF,
	DIALOG_ADD_CONTACT,
	DIALOG_ADD_CONTACTNUMB,
	DIALOG_EDIT_CONTACTNAME,
	DIALOG_EDIT_CONTACTNUMBER,

	/* Dialog Garasi Umum */
	DIALOG_GARKOT_OUT,

	/* Dialog Gudang */
	DIALOG_GUDANG_BUY,
	DIALOG_GUDANG_OPTION,
	DIALOG_GUDANGVAULT,
	DIALOG_GUDANGVAULT_DEPOSIT,
	DIALOG_GUDANGVAULT_WITHDRAW,
	DIALOG_GUDANGVAULT_IN,
	DIALOG_GUDANGVAULT_OUT,

	/* Score Board Admin Menu */
	DIALOG_CLICKPLAYER,
	DIALOG_BANNEDTIME,
	DIALOG_BANNEDREASON,

	/* Dialog Asuransi */
	DIALOG_ASURANSI_LS,
	DIALOG_ASURANSI_LV,

	/* Dialog Fact Garage */
	DIALOG_FACTION_GARAGE_MENU,
	DIALOG_FACTION_GARAGE1,
	DIALOG_FACTION_GARAGE2,
	DIALOG_FACTION_GARAGE3,
	DIALOG_FACTION_GARAGE4,
	DIALOG_FACTION_GARAGE5,
	DIALOG_FACTION_GARAGE6,

	/* Dialog warung */
	DIALOG_WARUNG,
	DIALOG_WARUNG_ELEKTRONIK, 
	DIALOG_BUY_NASIUDUK,
	DIALOG_BUY_AIRMINERAL, 
	DIALOG_BUY_UMPAN,

	/* Petani Dialog */
	DIALOG_BUY_SEEDS,
	DIALOG_BIBIT_PADI,
	DIALOG_BIBIT_TEBU,
	DIALOG_BIBIT_CABE,

	/* Dialog House Keys */
	DIALOG_HKEYS, 
	DIALOG_HKEYS_ADD,
	DIALOG_HKEYS_REMOVE,
	DIALOG_HOUSEGARAGE_OUT,
	DIALOG_HOUSEHELIPAD_OUT,
	DIALOG_HOUSE_BRANKAS,
	DIALOG_HOUSE_INVITE,
	DIALOG_HOUSE_INVITECONF,
	DIALOG_HOUSEVAULT,
	DIALOG_HOUSEVAULT_DEPOSIT,
	DIALOG_HOUSEVAULT_WITHDRAW,
	DIALOG_HOUSEVAULT_IN,
	DIALOG_HOUSEVAULT_OUT,
	DIALOG_WEAPON_CHEST,

	DIALOG_FIXMEACC,
	DIALOG_ADMIN_HELP,
	DIALOG_DYNAMIC_HELP,

	DIALOG_SWEEPER_START,
	DIALOG_DELIVERY_START,
	DIALOG_FORKLIFT_START,
	DIALOG_RECYCLER_START,
	DIALOG_TRASHMASTER_START,

	/* Dialog Clothes */
	DIALOG_CLOTHES,
	DIALOG_CLOTHES_DELETE,

	/* Atms Dialog */
	DIALOG_ATM_WITHDRAW,
	DIALOG_ATM_DEPOSIT,
	DIALOG_ATM_TRANSFER,
	DIALOG_ATM_TRANSFER1,
	DIALOG_BANKREKENING,
	DIALOG_WITHDEPO,

	/* Carsteal Dialog */
	DIALOG_CARSTEAL_SHOP,

	/*Whatsapp Dialog*/
	DIALOG_WHATSAPP_CHAT,
	DIALOG_WHATSAPP_CHAT_EMPTY,
	DIALOG_WHATSAPP_SEND,

	/*Yellow Pages*/
	DIALOG_YELLOW_PAGE,
	DIALOG_YELLOW_PAGE_MENU,
	DIALOG_YELLOW_PAGE_EMPTY,
	DIALOG_YELLOW_PAGE_SEND,
	DIALOG_YELLOW_CALL,

	/*Tweets Dialog*/
	DIALOG_TWITTER_SIGN,
	DIALOG_TWITTER_SIGNPASSWORD,
	DIALOG_TWITTER_LOGIN,
	DIALOG_TWITTER_LOGINPASSWORD,
	DIALOG_TWITTER_POST,
	DIALOG_TWITTER_POST_EMPTY,
	DIALOG_TWITTER_POST_SEND,

	/*Invoice Dialog*/
	DIALOG_INVOICE_NAME,
    DIALOG_INVOICE_COST,
    DIALOG_PAY_INVOICE,

	/*Player dialog*/
	DIALOG_PLAYER_MENU,
	DIALOG_PLAYER_DOKUMENT,

	/*Job Mixer Dialog*/
	DIALOG_MIXER,
	
	DIALOG_LIST_XO,
    DIALOG_ID_XO,
    DIALOG_INV_XO,
    DIALOG_UWR_XO,
    DIALOG_MONEY_XO,

	DIALOG_SELECT_SPAWN,
	DIALOG_SELECT_SPAWNEXPIRED,

	DIALOG_SHOWROOM_MENU,
	DIALOG_SHOWROOM_SELL,

	DIALOG_WEAPONSHOP,
	DIALOG_VIP_NAME,
	DIALOG_SELLFISH_ILEGAL,
	DIALOG_DISPLAYBANNED,
	DIALOG_RADIO_FREQ,
	DIALOG_VOICEMODE,
	DIALOG_VOICEKEYS,
	DIALOG_INVENTORY,
	DIALOG_CHANGE_PASSWORD,
	DIALOG_MYV_MENU,
	DIALOG_VEHICLE_DETAIL,
	DIALOG_UPGRADE,
	DIALOG_MODSHOP,
	DIALOG_TWEET_CREATE_INPUT,

	/* workshop */
	WORKSHOP_MENU,
	WORKSHOP_NAME,
	WORKSHOP_INFO,
	WORKSHOP_MONEY,
	WORKSHOP_WITHDRAWMONEY,
	WORKSHOP_DEPOSITMONEY,
	WORKSHOP_COMPONENT,
	WORKSHOP_WITHDRAWCOMPONENT,
	WORKSHOP_DEPOSITCOMPONENT,
	WORKSHOP_SERVICE,

	/* race system */
	DIALOG_LOAD_RACE
}
#include <matheval>     //By Sreyas-Sreelal
stock const Float: SpawnPelabuhan[][] = {
	{2744.2397,-2449.5349,13.6950,271.9706},
	{2744.3171,-2457.2017,13.6950,268.3150},
	{2738.2039,-2454.5254,13.6950,269.7540}
};

stock const Float: SpawnBandara[][] = {
	{1694.7468, -2332.3428, 13.5469, 0.0377},
	{1698.4928, -2329.6863, 13.5469, 49.2119}
};

stock const Float: SpawnVenturas[][] = {
	{1677.6498, 1447.7649, 10.7757, 271.1616},
	{1674.8794, 1444.2119, 10.7890, 270.9187}
};

#include "SERVER/core/utils/utils_defines"
#include "SERVER/core/utils/utils_vehiclevars"
#include "SERVER/core/utils/utils_enums"
#include "SERVER/core/utils/utils_variable"
#include "SERVER/core/utils/utils_colours"
#include "SERVER/core/utils/utils_ui"
#include "SERVER/core/systems/model_selection_compat"
#include "SERVER/world/voucher/voucher_functions"

#include "commands/DISCORD"

#include "SERVER/core/systems/Pickup"
#include "SERVER/core/systems/JobVehicles"
#include "SERVER/core/systems/systems_race"

/*Clothes System*/
#include "SERVER/player/toys/toys"
#include "SERVER/player/toys/toys_helmet"
#include "SERVER/player/clothes/clothes_functions"

#include "SERVER/world/fuel_system/fuel_functions"
#include "SERVER/player/stuff/player_slot"
#include "SERVER/player/stuff/player_compass"
#include "SERVER/player/stuff/FpsDisplay"
#include "SERVER/player/gym/gym_functions"

// ================= ALTHAF OX-TARGET =================
#include "SERVER/addons/althaf/ox-target/ox_target"

// ================= ALTHAF ABRAHAM =================
#include "SERVER/addons/althaf/Area_Santai/Area_Functions"
#include "SERVER/addons/althaf/Dokterlokal/dokterlokal_functions"
#include "SERVER/addons/althaf/Payheck_System/Paycheck_Functions"

// ================= ALTHAF DRONE =================
#include "SERVER/addons/drone/Header"
#include "SERVER/addons/drone/UI"
#include "SERVER/addons/drone/Functions"
#include "SERVER/addons/drone/Commands"

#include "SERVER/dynamic/Dynamic_SpeedCam/core"
#include "SERVER/dynamic/Dynamic_SpeedCam/funcs"
#include "SERVER/dynamic/Dynamic_SpeedCam/cmd"
#include "SERVER/dynamic/Dynamic_Button/button_functions"
#include "SERVER/dynamic/Dynamic_Actor/ui_dynactor"
#include "SERVER/dynamic/Dynamic_Warung/warung_functions"
#include "SERVER/dynamic/Dynamic_Pasar/dyn_pasar"
#include "SERVER/dynamic/Dynamic_Robbery/robbery_functions"
#include "SERVER/world/area/area"
#include "SERVER/dynamic/Dynamic_Hunting/hunting_functions"
#include "SERVER/dynamic/Dynamic_Ladang/ui_dynkanabis"
#include "SERVER/dynamic/Dynamic_Ladang/kanabis_olah"
#include "SERVER/dynamic/Dynamic_Object/object_funcs"

#include "SERVER/dynamic/Dynamic_GarasiKota/Header"
#include "SERVER/dynamic/Dynamic_GarasiKota/Function"
#include "SERVER/dynamic/Dynamic_GarasiKota/Commands"

#include "SERVER/dynamic/Dynamic_GarasiPribadi/Header"
#include "SERVER/dynamic/Dynamic_GarasiPribadi/Function"
#include "SERVER/dynamic/Dynamic_GarasiPribadi/Commands"

#include "SERVER/dynamic/Dynamic_Atm/ui_atm"
#include "SERVER/dynamic/Dynamic_Garbage/dynamic_garbage"
#include "SERVER/dynamic/Dynamic_Door/dynamic_doors"
#include "SERVER/dynamic/Dynamic_Gate/dynamic_gatev2"
#include "SERVER/dynamic/Dynamic_Gudang/gudang_functions"
#include "SERVER/dynamic/Dynamic_Label/label_functions"

// Map Icon
#include "SERVER/dynamic/Dynamic_IconMap/Header"
#include "SERVER/dynamic/Dynamic_IconMap/Function"
#include "SERVER/dynamic/Dynamic_IconMap/Commands"

#include "SERVER/dynamic/Dynamic_Machine/dynamic_slot"
#include "SERVER/dynamic/Dynamic_ObjectText/objecttext"
#include "SERVER/dynamic/Dynamic_Uranium/uranium_funcs"
// #include "SERVER/dynamic/Dynamic_FactionStuffs/dynamic_factiongarage.inc"

#include "SERVER/dynamic/Dynamic_Workshop/workshop_funcs"
#include "SERVER/dynamic/Dynamic_Workshop/workshop_cmds"

#include "SERVER/jobs/farmer/petani_functions"

#include "SERVER/player/inventory/inventory_functions"
#include "SERVER/player/inventory/inventory_cmds"
#include "SERVER/player/inventory/inventory_drop"

#include "SERVER/world/voice/radiosystem"

// ------------------------------------------
#include "SERVER/ui/ui_animations"
#include "SERVER/ui/notifikasi/Header"
#include "SERVER/ui/notifikasi/Function"
#include "SERVER/ui/notifikasi/box_func"
// #include "SERVER/ui/ui_shortkeys"
#include "SERVER/ui/ui_shortkeysnew"

// ================= GACHA SISTEM BY ALTHAF ABRAHAM =================
#include "SERVER/addons/althaf/Gacha_System/gacha_functions"
#include "SERVER/addons/althaf/Gacha_System/coins_shop"
#include "SERVER/addons/althaf/Akses_Gov/Akses_Functions"

#include "SERVER/ui/ui_names"

#include "SERVER/ui/ui_smoking"
#include "SERVER/ui/ui_garage"
// #include "SERVER/ui/ui_spawn"
#include "SERVER/ui/ui_spawnnew"
// #include "SERVER/ui/ui_emotes"

#include "SERVER/ui/ui_clothes_selector"
#include "SERVER/player/stuff/player_clothes_selector"

#include "SERVER/core/systems/systems_emote"

#include "SERVER/ui/ui_emotesnew"

// ================= ALTHAF UPDATE SYSTEM =================
#include "SERVER/core/systems/systems_update"

#include "SERVER/dynamic/Dynamic_Rusun/rusun_functions"
#include "SERVER/dynamic/Dynamic_House/dyn_house"

#include "SERVER/player/stuff/PlayerAFK"
#include "SERVER/player/stuff/IdleAnimation"
#include "SERVER/player/stuff/NameTag"
#include "SERVER/player/stuff/player_login"
#include "SERVER/player/stuff/gamexo.pwn"
#include "SERVER/player/stuff/gameslotpoker.pwn"
//// #include "SERVER/player/stuff/RadialMenu"

/*PhoneSystem*/
#include "SERVER/factions/families/families_functions"
// #include "SERVER/factions/families/families_garage"

#include "SERVER/jobs/miner/minerv2_functions"
#include "SERVER/jobs/lumberjack/lumber_functions"
#include "SERVER/jobs/bus/bus_funcs"
#include "SERVER/jobs/chicken factory/butcher_functions"
#include "SERVER/jobs/milker/milker_functions"
#include "SERVER/jobs/oilman/oilman_function"
#include "SERVER/jobs/fisherman/nelayan_funcs"
#include "SERVER/jobs/delivery/deliveryside_functions"
#include "SERVER/jobs/mowingjob/mowerside_functions"
#include "SERVER/jobs/sweeper/sweeper_functions"
#include "SERVER/jobs/forklift/forkliftside_functions"
#include "SERVER/jobs/tailor/tailorv2_functions"
#include "SERVER/jobs/tailor/tailor_forward"
#include "SERVER/jobs/hauling/kargo_func"
#include "SERVER/jobs/RicycleJob/recycler_functions"
#include "SERVER/jobs/trashmaster/trashmaster_functions"
#include "SERVER/jobs/electrican/electric_funcs"
#include "SERVER/jobs/mixer/callback"
#include "SERVER/jobs/sawit/functions_sawit"

#include "SERVER/dynamic/Dynamic_Garbage/rongsokan_functions"

#include "SERVER/factions/stuff_goodside"

// NEW PHONE
// #include "SERVER/player/smartphone/smartphone_contacts_new.pwn"
// #include "SERVER/player/smartphone/phone_funcs_new.pwn"

#include "SERVER/player/smartphone_new/smartphone_contacts.pwn"
#include "SERVER/player/smartphone_new/phone_funcs.pwn"

/*#include "SERVER/player/smartphone/smartphone_contacts.pwn"
#include "SERVER/player/smartphone/phone_funcs.pwn"
#include "SERVER/player/smartphone/callfivem_func.pwn"
#include "SERVER/player/smartphone/tweet_funcs.pwn"*/


#include "SERVER/vehicle/vehiclemod/modshop"
#include "SERVER/vehicle/vehicles/vehicles_functions"
#include "SERVER/vehicle/vehicles/vehicles_cmds"
#include "SERVER/player/smartphone_new/smartphone_cef"

#include "SERVER/world/weapons/weapons_functions"

#include "SERVER/dynamic/Dynamic_Rental/dyn_rental"

#include "SERVER/world/sport_store/business_olahraga"

/* Factions */
#include "SERVER/factions/FactionMenu"
#include "SERVER/factions/Pemerintah/pemerintah_functions"
#include "SERVER/factions/Bengkel/bengkel_brankas"
#include "SERVER/factions/Bengkel/bengkel_functions"
#include "SERVER/factions/Pedagang/lounges_brankas"
#include "SERVER/factions/Pedagang/lounges_vars"
#include "SERVER/factions/Pedagang/lounges_functions"
#include "SERVER/factions/EMS/ems_brankas"
#include "SERVER/factions/EMS/ems"
// #include "SERVER/factions/EMS/medic_funcs"
#include "SERVER/factions/Police/sapd_functions"
// #include "SERVER/factions/Police/sapd_taser"
// #include "SERVER/factions/Police/sapd_spike"
#include "SERVER/factions/Trans/trans_functions"
#include "SERVER/factions/Trans/trans_stuffs"
// #include "SERVER/factions/Gojek/cmds_gojek"
// #include "SERVER/factions/Gojek/gojek_functions"

#include "SERVER/world/reports/systems_ask"
#include "SERVER/world/reports/systems_reports"

#include "SERVER/core/events/admin_events.inc"
#include "commands/cmds_hooks"
#include "SERVER/core/systems/systems_dialogs"
// #include "SERVER/core/systems/systems_spawn.inc" Dimatikan sementara
#include "SERVER/core/systems/systems_functions"
#include "SERVER/player/stuff/player_character_select"
#include "SERVER/core/systems/systems_native"
#include "SERVER/world/chat/chat_functions"
// #include "SERVER/core/systems/systems_anticheat.inc"
#include "SERVER/core/systems/systems_anticheatv2"
#include "SERVER/core/systems/systems_bank"
#include "SERVER/core/systems/systems_fade"
// #include "SERVER/core/systems/antiremcs_dan.inc"

#include "SERVER/world/toll/toll_functions"

// #include "SERVER/PlayerSpawn/spawn_functions.inc" Dimatikan sementara
#include "SERVER/jobs/Disnaker/disnaker_functions"

// #include "commands/boxing_funcs.inc"
#include "commands/management"
#include "commands/pengurus"
#include "commands/cmds_faction"
#include "commands/cmds_player"
#include "commands/cmds_admin"
#include "commands/earthquake"
#include "commands/NoClip"
#include "SERVER/core/systems/systems_cmdlist"   // EAGLE - /help & /ahelp lengkap (auto-generated)
#include "SERVER/core/cef/cef_interact"          // EAGLE - tombol interaksi CEF (pengganti tombol F)

#include "SERVER/world/carsteal/carsteal_functions"
#include "SERVER/player/stuff/player_toystd"

// #include "SERVER/core/events/xmas.inc"
//#include "SERVER/core/events/events.inc"

#include "SERVER/world/showroom/showroom_functions"
#include "SERVER/player/stuff/player_actions"
#include "SERVER/player/stuff/player_asuransi"
#include "SERVER/player/stuff/player_sataterpack"
#include "SERVER/world/damages/damagelog_functions"

#include "SERVER/world/tags/core"
#include "SERVER/world/tags/cmd"
#include "SERVER/world/tags/funcs"
#include "SERVER/world/tags/impl"

#include "SERVER/player/crafting/crafting_functions.inc"
// ----------------------------------------
#include "SERVER/world/streamer/streamer"
#include "SERVER/world/invoices/invoices"
#include "SERVER/world/blacklist/blacklist_functions"
#include "SERVER/core/timers/timer_task"
// #include "SERVER/core/timers/timer_ptask_anticheat.inc"
#include "SERVER/core/timers/timer_ptask_jail"
#include "SERVER/core/timers/timer_ptask_update"
#include "SERVER/world/playermarker/playermark"

#include "SERVER/core/database/db_install"      // GAMEMODE EAGLE - Auto Create Database
#include "SERVER/core/systems/systems_optimize"  // GAMEMODE EAGLE - Optimasi ringan Android
#include "SERVER/core/cef/cef_gameplay_bridge"   // EAGLE - unified CEF <-> gamemode bridge

forward OnGameModeInitEx();
forward OnGameModeExitEx();

main() 
{

}

stock DatabaseConnection()
{
	g_SQL = mysql_connect(MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE);
	if (g_SQL == MYSQL_INVALID_HANDLE || mysql_errno(g_SQL) != 0)
	{
		print("EAGLE ROLEPLAY: Connection To MYSQL Failed! Server Shutting Down!");
		SendRconCommand("exit");
	}
	else
	{
		print("EAGLE ROLEPLAY: Database successfully connected to MySQL.");
	}
	return 1;
}

public OnGameModeInit()
{
	#if defined MAKE_PELER
	Profiler_Start();
	#endif

	DatabaseConnection();
	Database_Install();		// GAMEMODE EAGLE - buat semua tabel otomatis (CREATE TABLE IF NOT EXISTS)
	Optimize_ForAndroid();	// GAMEMODE EAGLE - tuning streamer hemat CPU untuk SA-MP Mobile

	#if defined DiscordMode
		DiscordInit();
		SendServerOnline();
	#endif
	
	ShowNameTags(false);
	EnableTirePopping(0);
	CreateStaticUI();
	// StreamerConfig();
	// LoadMap();
	LoadWarungArea();
	LoadArea();
	LoadGangZone();
	LoadServerPickup();	
	ManualVehicleEngineAndLights();
	EnableStuntBonusForAll(0);
	AllowInteriorWeapons(1);
	DisableInteriorEnterExits();
	LimitPlayerMarkerRadius(15.0);
	ShowPlayerMarkers(PLAYER_MARKERS_MODE_OFF);

	healingarea = CreateDynamicSphere(2344.14, 544.70, 10.88, 70.0, 0, 0);

	SetGameModeText(sprintf("%s", TEXT_GAMEMODE));
	SendRconCommand(sprintf("weburl %s", TEXT_WEBURL));
	SendRconCommand(sprintf("language %s", TEXT_LANGUAGE));
	// SendRconCommand("hostname EAGLE ROLEPLAY | SA-MP Indonesia");
	SendRconCommand("mapname San Andreas");
	BlockGarages(.text="Tutup");

	/* Load From Database */
	mysql_tquery(g_SQL, "SELECT * FROM `brankas_ems`", "LoadBrankasEms");
	mysql_tquery(g_SQL, "SELECT * FROM `brankas_bengkel`", "LoadBrankasBengkel");
	mysql_tquery(g_SQL, "SELECT * FROM `brankas_lounges`", "LoadBrankasLounges");
	mysql_tquery(g_SQL, "SELECT * FROM `buttons`", "LoadButtons");
	mysql_tquery(g_SQL, "SELECT * FROM `doors`", "LoadDoors");
	mysql_tquery(g_SQL, "SELECT * FROM `families`", "Families_Load");
	// mysql_tquery(g_SQL, "SELECT * FROM `families_garage`", "LoadFamiliesGarkot");
	mysql_tquery(g_SQL, "SELECT * FROM `house`", "LoadRumah");
	mysql_tquery(g_SQL, "SELECT * FROM `gate`", "LoadGate");
	mysql_tquery(g_SQL, "SELECT * FROM `actors`", "Actor_Load");
	mysql_tquery(g_SQL, "SELECT * FROM `bike_rentals`", "Rental_Load");
	mysql_tquery(g_SQL, "SELECT * FROM `public_garage`", "LoadPublicGarage");
	mysql_tquery(g_SQL, "SELECT * FROM `private_garage`", "LoadPrivateGarage");
	mysql_tquery(g_SQL, "SELECT * FROM `gudang`", "LoadGudang");
	mysql_tquery(g_SQL, "SELECT * FROM `warung`", "LoadWarung");
	mysql_tquery(g_SQL, "SELECT * FROM `pasar`", "LoadPasar");
	mysql_tquery(g_SQL, "SELECT * FROM `robbery`", "LoadDynamicRobbery");
	mysql_tquery(g_SQL, "SELECT * FROM `atms`", "LoadATM");
	mysql_tquery(g_SQL, "SELECT * FROM `trash`", "LoadTrash");
	mysql_tquery(g_SQL, "SELECT * FROM `stuffs`", "LoadBrankasGoodside");
	mysql_tquery(g_SQL, "SELECT * FROM `ladang`", "LoadKanabis");
	mysql_tquery(g_SQL, "SELECT * FROM `icons`", "Icons_Load", "");
	mysql_tquery(g_SQL, "SELECT * FROM `label_fivem`", "LoadLabel");
	mysql_tquery(g_SQL, "SELECT * FROM `dynamic_rusun`", "Rusun_Load");
	mysql_tquery(g_SQL, "SELECT * FROM `hunting`", "LoadDeer");
	mysql_tquery(g_SQL, "SELECT * FROM `weeds`", "Weed_Load");
	mysql_tquery(g_SQL, "SELECT * FROM `voucher`", "LoadVoucher");
	mysql_tquery(g_SQL, "SELECT * FROM `objects`", "LoadDynamicObject");
	mysql_tquery(g_SQL, "SELECT * FROM `slotmachine`", "LoadSlotMachine");
	mysql_tquery(g_SQL, "SELECT * FROM `objecttext`", "ObjectText_Load");
	mysql_tquery(g_SQL, "SELECT * FROM `uranium`", "Load_Uranium");
	mysql_tquery(g_SQL, "SELECT * FROM `workshop`", "LoadWorkshop");
	mysql_tquery(g_SQL, "SELECT * FROM `tags` ORDER BY `tagId` ASC LIMIT "#MAX_DYNAMIC_TAGS";", "Tags_Load");

	for (new i; i < sizeof(ColorList); i++) {
        format(color_string, sizeof(color_string), "%s{%06x}%03d %s", color_string, ColorList[i] >>> 8, i, ((i+1) % 16 == 0) ? ("\n") : (""));
    }

    for (new i; i < sizeof(FontNames); i++) {
        format(object_font, sizeof(object_font), "%s%s\n", object_font, FontNames[i]);
    }
	
	for(new i = 0; i < sizeof(BarrierInfo);i ++)
	{
		new
		Float:X = BarrierInfo[i][brPos_X],
		Float:Y = BarrierInfo[i][brPos_Y];

		ShiftCords(0, X, Y, BarrierInfo[i][brPos_A]+90.0, 3.5);
		CreateDynamicObject(966,BarrierInfo[i][brPos_X],BarrierInfo[i][brPos_Y],BarrierInfo[i][brPos_Z],0.00000000,0.00000000,BarrierInfo[i][brPos_A]);
		if(!BarrierInfo[i][brOpen])
		{
			gBarrier[i] = CreateDynamicObject(968,BarrierInfo[i][brPos_X],BarrierInfo[i][brPos_Y],BarrierInfo[i][brPos_Z]+0.8,0.00000000,90.00000000,BarrierInfo[i][brPos_A]+180);
			MoveObject(gBarrier[i],BarrierInfo[i][brPos_X],BarrierInfo[i][brPos_Y],BarrierInfo[i][brPos_Z]+0.7,BARRIER_SPEED,0.0,0.0,BarrierInfo[i][brPos_A]+180);
			MoveObject(gBarrier[i],BarrierInfo[i][brPos_X],BarrierInfo[i][brPos_Y],BarrierInfo[i][brPos_Z]+0.75,BARRIER_SPEED,0.0,90.0,BarrierInfo[i][brPos_A]+180);
		}
		else gBarrier[i] = CreateDynamicObject(968,BarrierInfo[i][brPos_X],BarrierInfo[i][brPos_Y],BarrierInfo[i][brPos_Z]+0.8,0.00000000,20.00000000,BarrierInfo[i][brPos_A]+180);
	}

	/* Mprice Stuffs*/
	OldTembagaPrice = TembagaPrice;
	OldBesiPrice = BesiPrice;
	OldEmasPrice = EmasPrice;
	OldBerlianPrice = BerlianPrice;
	OldMaterialPrice = MaterialPrice;
	OldAlumuniumPrice = AlumuniumPrice;
	OldKaretPrice = KaretPrice;
	OldKacaPrice = KacaPrice;
	OldBajaPrice = BajaPrice;
	OldAyamKemasPrice = AyamKemasPrice;
	OldSusuOlahPrice = SusuOlahPrice;
	OldPakaianPrice = PakaianPrice;
	OldKayuKemasPrice = KayuKemasPrice;
	OldGasPrice = GasPrice;
	
	SetTimer("WeatherRotator", 1800000, true);
	CallLocalFunction("OnGameModeInitEx", "");
	print("[OX-TARGET] System initialized - System loaded successfully!");

	OpenVote = 0;
    VoteYes = 0;
    VoteNo = 0;
    VoteTime = 0;
    VoteText[0] = EOS;
	return 1;
} 

public OnPlayerInteriorChange(playerid, newinteriorid, oldinteriorid)
{
	#if defined DEBUG_MODE
	    printf("[debug] OnPlayerInteriorChange(PID : %d New-Int : %d Old-Int : %d)", playerid, newinteriorid, oldinteriorid);
	#endif

	CancelEdit(playerid);

	foreach(new i : Player) if (AccountData[i][pSpec] != INVALID_PLAYER_ID && AccountData[i][pSpec] == playerid)
	{
		SetPlayerInterior(i, GetPlayerInterior(playerid));
		SetPlayerVirtualWorld(i, GetPlayerVirtualWorld(playerid));
	}

	return 1;
}

public OnPlayerRequestSpawn(playerid)
{
    if (!AccountData[playerid][IsLoggedIn])
    {
		EagleUI_GameTextForPlayer(playerid, "~r~Stay in your world bastard!", 2000, 4);
		SendClientMessageEx(playerid, X11_RED, "[AntiCheat]:"LIGHTGREY" Anda ditendang karena diduga Fake Spawn!");
        KickEx(playerid);
    }
    return 1;
}

public OnPlayerClickPlayer(playerid, clickedplayerid, source)
{
	if(SQL_IsCharacterLogged(playerid) && AccountData[playerid][pAdmin] > 0)
	{
		if(!IsPlayerConnected(clickedplayerid)) return 0;
		if(clickedplayerid == playerid) return 0;

		new title[127];
		format(title, sizeof(title), ""ALTHF"EAGLE Roleplay "WHITE"- %s(%d)", ReturnName(clickedplayerid), clickedplayerid);
		ShowPlayerDialog(playerid, DIALOG_CLICKPLAYER, DIALOG_STYLE_LIST, title, 
		""ALTHF"Menu Admin\n\
		\nSpectator Pemain\
		\n"GRAY"Tarik Pemain\
		\nTeleport Ke Pemain\
		\n"GRAY"Banned Pemain\
		\nKick Pemain\
		\n"GRAY"Stats Pemain", "Pilih", "Batal");
		ClickPlayerID[playerid] = clickedplayerid;
	}
	return 1;
}

public OnPlayerRequestClass(playerid, classid)
{
	SetCameraData(playerid);
	if(!AccountData[playerid][IsLoggedIn])
	{
		if(GetPVarInt(playerid, "AuthCheckStarted")) return 1;
		SetPVarInt(playerid, "AuthCheckStarted", 1);

		new query[268];
		mysql_format(g_SQL, query, sizeof(query), "SELECT * FROM `playerucp` WHERE `ucp` = '%s' LIMIT 1", AccountData[playerid][pUCP]);
		mysql_pquery(g_SQL, query, "CheckPlayerUCP", "id", playerid, g_RaceCheck[playerid]);
		SetPlayerColor(playerid, X11_GRAY);
	}
	return 1;
}

public OnGameModeExit()
{
	#if defined DiscordMode
		SendServerOffline();
	#endif

	#if defined DEBUG_MODE
	    printf("[debug] OnGameModeExit()");
	#endif

    SaveAll();
	print("-------------- [ AUTO RESTART ] --------------");
	SendClientMessageToAll(COLOR_RED, "[!]"YELLOW_E" Maaf server dalam pemeliharaan/Restart.{00FFFF} ~EAGLE BOT");
	
	foreach(new playerid : Player)
		TerminateConnection(playerid);

	CallLocalFunction("OnGameModeExitEx", "");
	mysql_close(g_SQL);
	#if defined MAKE_PELER
	Profiler_Dump();
	Profiler_Stop();
	#endif
	return 1;
}

forward OnPlayerCarJacking(playerid);
public OnPlayerCarJacking(playerid)
{
	new Float:playerPos[3];
	GetPlayerPos(playerid, playerPos[0], playerPos[1], playerPos[2]);
	AccountData[playerid][pWorld] = GetPlayerVirtualWorld(playerid);
	
	SetPlayerPos(playerid, playerPos[0], playerPos[1], playerPos[2] + 9.0);
	TogglePlayerControllable(playerid, false);
	EagleUI_GameTextForPlayer(playerid, "No Jacking!", 5500, 4);
	SetPlayerVirtualWorld(playerid, (playerid+1));
	SetTimerEx("OnPlayerCarJackingUpdate", 5500, false, "d", playerid);
	return 1;	
}

forward OnPlayerCarJackingUpdate(playerid);
public OnPlayerCarJackingUpdate(playerid)
{
	TogglePlayerControllable(playerid, true);
	SetPlayerVirtualWorld(playerid, AccountData[playerid][pWorld]);
	return 1;
}

public OnPlayerEnterVehicle(playerid, vehicleid, ispassenger)
{
	if(!ispassenger)
	{
		new driverid = GetVehicleDriver(vehicleid);
		if(driverid != INVALID_PLAYER_ID && IsPlayerInVehicle(driverid, vehicleid) && !IsVehicleEmpty(vehicleid) && IsPlayerChangeSeat[playerid] == false)
		{
			SetTimerEx("OnPlayerCarJacking", 250, false, "d", playerid);
		}
		new vehicle_near = GetNearestVehicle(playerid);
		if((vehicle_near = Vehicle_ReturnID(vehicleid)) != RETURN_INVALID_VEHICLE_ID)
		{
			if(PlayerVehicle[vehicle_near][pVehFaction] == FACTION_POLISI)
			{
				if(AccountData[playerid][pFaction] != FACTION_POLISI && AccountData[playerid][pFaction] != FACTION_BENGKEL)
				{
					RemovePlayerFromVehicle(playerid);
					new Float:slx, Float:sly, Float:slz;
					GetPlayerPos(playerid, slx, sly, slz);
					SetPlayerPos(playerid, slx, sly, slz);
					ShowTDN(playerid, NOTIFICATION_ERROR, "Kendaraan ini milik faction Polisi!");
				}
			}
			else if(PlayerVehicle[vehicle_near][pVehFaction] == FACTION_PEMERINTAH)
			{
				if(AccountData[playerid][pFaction] != FACTION_PEMERINTAH && AccountData[playerid][pFaction] != FACTION_BENGKEL)
				{
					RemovePlayerFromVehicle(playerid);
					new Float:slx, Float:sly, Float:slz;
					GetPlayerPos(playerid, slx, sly, slz);
					SetPlayerPos(playerid, slx, sly, slz);
					ShowTDN(playerid, NOTIFICATION_ERROR, "Kendaraan ini milik faction Pemerintah!");
				}
			}
			else if(PlayerVehicle[vehicle_near][pVehFaction] == FACTION_EMS)
			{
				if(AccountData[playerid][pFaction] != FACTION_EMS && AccountData[playerid][pFaction] != FACTION_BENGKEL)
				{
					RemovePlayerFromVehicle(playerid);
					new Float:slx, Float:sly, Float:slz;
					GetPlayerPos(playerid, slx, sly, slz);
					SetPlayerPos(playerid, slx, sly, slz);
					ShowTDN(playerid, NOTIFICATION_ERROR, "Kendaraan ini milik faction EMS!");
				}
			}
			else if(PlayerVehicle[vehicle_near][pVehFaction] == FACTION_TRANS)
			{
				if(AccountData[playerid][pFaction] != FACTION_TRANS && AccountData[playerid][pFaction] != FACTION_BENGKEL && AccountData[playerid][pFaction] != FACTION_POLISI)
				{
					RemovePlayerFromVehicle(playerid);
					new Float:slx, Float:sly, Float:slz;
					GetPlayerPos(playerid, slx, sly, slz);
					SetPlayerPos(playerid, slx, sly, slz);
					ShowTDN(playerid, NOTIFICATION_ERROR, "Kendaraan ini milik faction Transportasi!");
				}
			}
			else if(PlayerVehicle[vehicle_near][pVehFaction] == FACTION_BENGKEL)
			{
				if(AccountData[playerid][pFaction] != FACTION_POLISI && AccountData[playerid][pFaction] != FACTION_BENGKEL)
				{
					RemovePlayerFromVehicle(playerid);
					new Float:slx, Float:sly, Float:slz;
					GetPlayerPos(playerid, slx, sly, slz);
					SetPlayerPos(playerid, slx, sly, slz);
					ShowTDN(playerid, NOTIFICATION_ERROR, "Kendaraan ini milik faction Bengkel!");
				}
			}
			else if(PlayerVehicle[vehicle_near][pVehFaction] == FACTION_PEDAGANG)
			{
				if(AccountData[playerid][pFaction] != FACTION_PEDAGANG && AccountData[playerid][pFaction] != FACTION_BENGKEL)
				{
					RemovePlayerFromVehicle(playerid);
					new Float:slx, Float:sly, Float:slz;
					GetPlayerPos(playerid, slx, sly, slz);
					SetPlayerPos(playerid, slx, sly, slz);
					ShowTDN(playerid, NOTIFICATION_ERROR, "Kendaraan ini milik faction Restaurant EAGLE!");
				}
			}
		}
	}
	return 1;
}

forward TrackSuspect(suspectid, policeid);
public TrackSuspect(suspectid, policeid)
{
	new Float:x, Float:y, Float:z;
	GetPlayerPos(suspectid, x, y, z);

	SetPlayerRaceCheckpoint(policeid, 1, x, y, z, 0.0, 0.0, 0.0, 5.0);
	Info(policeid, "Tracking Suspect Updated!");
	pMapCP[policeid] = true;
	return 1;
}

public OnPlayerText(playerid, text[])
{
	if(!AccountData[playerid][IsLoggedIn] || !AccountData[playerid][pSpawned])
		return 0;

	if(AccountData[playerid][pAdmin] > 0 && AccountData[playerid][pAdminDuty])
	{
		if(strlen(text) > 64)
		{
			SendNearbyMessage(playerid, 15.0, -1, "Admin "RED"%s"WHITE": (( %.64s...", AccountData[playerid][pAdminname], text);
			SendNearbyMessage(playerid, 15.0, -1, "...%s ))", text[64]);
		}
		else 
		{
			SendNearbyMessage(playerid, 15.0, -1, "Admin "RED"%s"WHITE": (( %s ))", AccountData[playerid][pAdminname], text);
		}
	}
	return 0;
}

public OnPlayerCommandPerformed(playerid, cmd[], params[], result, flags)
{
	if (result != -1 && !AccountData[playerid][IsLoggedIn])
	{
		SendClientMessage(playerid, -1, ""RED"[AntiCheat]"ARWIN1" Anda ditendang dari server karena menggunakan CMD dalam keadaan tidak login!");
		return KickEx(playerid);
	}
	
    if (result == -1)
    {
		if(AccountData[playerid][pStyleNotif] == 1) //TD
		{
			ShowTDN(playerid, NOTIFICATION_ERROR, sprintf("Perintah ~r~'/%s'~y~ tidak diketahui, ~r~'/help'~y~ untuk info lanjut!", cmd));
		}
		else
		{
			ShowTDN(playerid, NOTIFICATION_ERROR, sprintf("Perintah "YELLOW"'/%s'"WHITE" tidak diketahui, "YELLOW"'/help'"WHITE" untuk info lanjut!", cmd));
		}
		return 0;
    }
	return 1;
}

public OnPlayerCommandReceived(playerid, cmd[], params[], flags)
{
	return 1;
}

public OnPlayerConnect(playerid)
{
	EagleUI_InitPlayer(playerid);
	DokterData[playerid][dlBusy]   = false;
    DokterData[playerid][dlActive] = false;
    DokterData[playerid][dlStage]  = 0;

    DokterData[playerid][dlNPC]        = INVALID_ACTOR_ID;
    DokterData[playerid][dlAmbulance]  = INVALID_VEHICLE_ID;

    DokterTimers[playerid] = 0;
    DokterAutoRPTimer[playerid] = 0;

    DokterRPLabel[playerid] = Text3D:INVALID_3DTEXT_ID;
	#if defined DiscordMode
		new DCC_Embed:embed = DCC_CreateEmbed();
		DCC_SetEmbedTitle(embed, "JOIN LOGS");
		DCC_SetEmbedColor(embed, 0xFF0000); // merah
		
		new dContent[256];
		format(dContent, sizeof(dContent),
			"```\n\
			ID : %d\n\
			Name UCP : %s\n\
			```",
			playerid,
			ReturnName(playerid)   // ubah sesuai variabel UCP di GM lu
		);

		DCC_SetEmbedDescription(embed, dContent);
		DCC_SendChannelEmbedMessage(JoinLeaveLog, embed);
	#endif

	Player_Count ++;
	g_RaceCheck[playerid] ++;
	AccountData[playerid][pMainXo] = 0;
	ResetVariables(playerid);
    DeletePVar(playerid, "ShowWhatsapp");
	format(AccountData[playerid][pEditingStr], 12, "");
    ReturnIP(playerid);
	SlotMachineStarted[playerid]=0;
    SlotTimert[playerid]=0;
    SlotRunde[playerid]=0;
    rechiPhoneCall[playerid] = "";
	rrechnungPhoneCall[playerid] = 0;
	zahPhonelCall[playerid] = "";
	azahPhonelCall[playerid] = "";
	// CreateAdutyTD(playerid);
	CreatePlayerUIS(playerid);
	OnLoadMixerProperty(playerid);
	Player_ToggleTelportAntiCheat(playerid, false);
	Player_ToggleAntiHealthHack(playerid, false);
	Player_ToggleDisableAntiCheat(playerid, false);
	EnableAntiCheatForPlayer(playerid, 11, true);
	EnableAntiCheatForPlayer(playerid, 19, true);
	EnableAntiCheatForPlayer(playerid, 4, true);
	PlayAudioStreamForPlayer(playerid, "https://files.catbox.moe/jdydhc.mp3", 0.0, 0.0, 0.0, 50.0, 0);
	
	if(g_RestartServer || g_AsuransiTime) {
		for(new i = 0; i < 10; i++) {
			EAGLEUI_ShowGlobalForPlayer(playerid, Althf_BadaiInfo[i]);
		}
	}
	if (g_AsuransiTime)
    {
        for (new txd = 0; txd < 11; txd++)
        {
            EAGLEUI_ShowGlobalForPlayer(playerid, Textdraw_Asuransi[txd]);
        }
    }

	GetPlayerName(playerid, AccountData[playerid][pUCP], MAX_PLAYER_NAME + 1);

    if(AccountData[playerid][pHead] < 0) return AccountData[playerid][pHead] = 20;
    if(AccountData[playerid][pPerut] < 0) return AccountData[playerid][pPerut] = 20;
    if(AccountData[playerid][pRFoot] < 0) return AccountData[playerid][pRFoot] = 20;
    if(AccountData[playerid][pLFoot] < 0) return AccountData[playerid][pLFoot] = 20;
    if(AccountData[playerid][pLHand] < 0) return AccountData[playerid][pLHand] = 20;
    if(AccountData[playerid][pRHand] < 0) return AccountData[playerid][pRHand] = 20;
	
	PantaiArea[playerid] = CreateDynamicRectangle(345.3125, -2094.787811279297, 415.3125, -2007.7878112792969);
	return 1;
}

forward TDN_OnPlayerDisconnect(playerid, reason);

public OnPlayerDisconnect(playerid, reason)
{
	ALTHF_Cleanup(playerid);
	if(DokterAutoRPTimer[playerid] != 0)
    {
        KillTimer(DokterAutoRPTimer[playerid]);
        DokterAutoRPTimer[playerid] = 0;
    }

    if(DokterRPLabel[playerid] != Text3D:INVALID_3DTEXT_ID)
    {
        DestroyDynamic3DTextLabel(DokterRPLabel[playerid]);
        DokterRPLabel[playerid] = Text3D:INVALID_3DTEXT_ID;
    }
	for(new x = 0; x < 12; x++)
    {
        EAGLEUI_DestroyPlayer(playerid, FishingTD[playerid][x]);
    }
	#if defined DiscordMode
		new DCC_Embed:embed = DCC_CreateEmbed();
		DCC_SetEmbedTitle(embed, "LEAVE LOGS");
		DCC_SetEmbedColor(embed, 0xFF0000); // merah

		new dContent[256];
		format(dContent, sizeof(dContent),
			"```\n\
			ID : %d\n\
			Name UCP : %s\n\
			```",
			playerid,
			AccountData[playerid][pUCP]   // ubah sesuai variabel UCP di GM lu
		);

		DCC_SetEmbedDescription(embed, dContent);
		DCC_SendChannelEmbedMessage(JoinLeaveLog, embed);
	#endif
	
	if(IsPlayerInAnyVehicle(playerid))
	{
		RemovePlayerFromVehicle(playerid);
	}

	SlotMachineStarted[playerid]=0;
    AccountData[playerid][pMainXo] = 0;
	SlotTimert[playerid]=0;
	KillTimer(AccountData[playerid][DokterLokalTimer]);
	KillTimer(AccountData[playerid][pDutyTimer]);
	RemoveDrag(playerid);
	CheckDrag(playerid);
	Report_Clear(playerid);
	Ask_Clear(playerid);

	g_RaceCheck[playerid] ++;

	Player_Count --;

	for(new i = 0; i < 55; i++) EAGLEUI_DestroyPlayer(playerid, Hope_Injured[playerid][i]);
	
	if (AccountData[playerid][IsLoggedIn])
	{
		UpdatePlayerData(playerid);
		UnloadPlayerVehicle(playerid);

		if (AccountData[playerid][pJobVehicle] != 0)
		{
			DestroyJobVehicle(playerid);
			AccountData[playerid][pJobVehicle] = 0;
		}
	}

	if(IsValidDynamic3DTextLabel(AccountData[playerid][pAdoTag])) DestroyDynamic3DTextLabel(AccountData[playerid][pAdoTag]);
	if(IsValidDynamic3DTextLabel(AccountData[playerid][pMaskLabel])) DestroyDynamic3DTextLabel(AccountData[playerid][pMaskLabel]);

    if(AccountData[playerid][pAdminDuty] == 1)
	if(IsValidDynamic3DTextLabel(AccountData[playerid][pLabelDuty]))
		DestroyDynamic3DTextLabel(AccountData[playerid][pLabelDuty]);

	new reasontext[526], frmxt[255], Float:pX, Float:pY, Float:pZ;
	GetPlayerPos(playerid, pX, pY, pZ);

	switch(reason)
	{
	    case 0: format(reasontext, sizeof(reasontext), "Timeout/Crash");
	    case 1: format(reasontext, sizeof(reasontext), "Quit");
		case 2: format(reasontext, sizeof(reasontext), "Kicked/Banned");
	}

	if(DestroyDynamic3DTextLabel(labelDisconnect[playerid])) 
		labelDisconnect[playerid] = STREAMER_TAG_3D_TEXT_LABEL: INVALID_STREAMER_ID;

	format(frmxt, sizeof(frmxt), "Player ["YELLOW"%d"WHITE"]"YELLOW" %s | %s"WHITE" Telah keluar dari server.\nReason: "RED"%s", playerid, AccountData[playerid][pName], AccountData[playerid][pUCP], reasontext);
	labelDisconnect[playerid] = CreateDynamic3DTextLabel(frmxt, -1, pX, pY, pZ, 15.0, INVALID_PLAYER_ID, INVALID_VEHICLE_ID, 1, GetPlayerVirtualWorld(playerid), GetPlayerInterior(playerid), -1, 15.0, -1, 0);
	labelDisconnectTimer[playerid] = SetTimerEx("DestroyLabelOut", 30000, false, "i", playerid);
	
	if(AccountData[playerid][phoneDurringConversation])
	{
		CutCallingLine(playerid);
	}
	TerminateConnection(playerid);
	EagleUI_CleanupPlayer(playerid);
	EagleCEF3D_ResetPlayer(playerid);
	return 1;
}	

public OnPlayerSpawn(playerid)
{
	ALTHF_Cleanup(playerid);
    AccountData[playerid][ActivityTime] = 0;

	if(CharacterState[playerid] == false)
	{
		StopStream(playerid);
		StopAudioStreamForPlayer(playerid);

		if(AccountData[playerid][pGender] == 0)
		{
			TogglePlayerControllable(playerid,0);
			SetPlayerHealth(playerid, 100.0);
			SetPlayerArmour(playerid, 0.0);
			SetPlayerCameraPos(playerid, 584.769, -2183.039, 131.617);
			SetPlayerCameraLookAt(playerid, 582.755, -2178.958, 129.546);
			InterpolateCameraPos(playerid, 584.769, -2183.039, 131.617, 584.769, -2183.039, 131.617, 20000, CAMERA_MOVE);
			SetPlayerVirtualWorld(playerid, 3);
			ShowPlayerDialog(playerid, DIALOG_AGE, DIALOG_STYLE_INPUT, ""ALTHF"EAGLE Roleplay "WHITE"- Tanggal Lahir", "Mohon masukkan tanggal lahir sesuai format hh/bb/tttt cth: (25/09/2001)", "Input", "");
		}
		else
		{
			if(!AccountData[playerid][pSpawned])
			{
				AccountData[playerid][pSpawned] = 1;
				SetCameraBehindPlayer(playerid);
				Streamer_ToggleIdleUpdate(playerid, true);
				StopAudioStreamForPlayer(playerid);
				
				GivePlayerMoney(playerid, AccountData[playerid][pMoney]);
				SetPlayerScore(playerid, AccountData[playerid][pLevel]);
				SetPlayerHealth(playerid, AccountData[playerid][pHealth]);
				SetPlayerArmour(playerid, AccountData[playerid][pArmour]);
				SetPlayerInterior(playerid, AccountData[playerid][pInt]);
				SetPlayerVirtualWorld(playerid, AccountData[playerid][pWorld]);
				PreloadAnimations(playerid);

				SetPlayerSkillLevel(playerid, WEAPONSKILL_SHOTGUN, 999);
				SetPlayerSkillLevel(playerid, WEAPONSKILL_SAWNOFF_SHOTGUN, 999);
				SetPlayerSkillLevel(playerid, WEAPONSKILL_SPAS12_SHOTGUN, 999);
				SetPlayerSkillLevel(playerid, WEAPONSKILL_MP5, 999);
				SetPlayerSkillLevel(playerid, WEAPONSKILL_AK47, 999);
				SetPlayerSkillLevel(playerid, WEAPONSKILL_M4, 999);
				SetPlayerSkillLevel(playerid, WEAPONSKILL_SNIPERRIFLE, 999);

				SetPlayerSkillLevel(playerid, WEAPONSKILL_PISTOL, 0);
				SetPlayerSkillLevel(playerid, WEAPONSKILL_MICRO_UZI, 0);
				SetPlayerSkillLevel(playerid, WEAPONSKILL_PISTOL_SILENCED, 0);

				SendClientMessageEx(playerid, -1, ""GRAY"</>: "WHITE"Selamat datang "YELLOW"%s.", ReturnName(playerid));
				SendClientMessageEx(playerid, -1, ""GRAY"</>: "WHITE"Today is "YELLOW"%s", ReturnTime());
				SendClientMessageEx(playerid, -1, ""GRAY"</>: "WHITE"Server memerlukan waktu "YELLOW"%d milisecond"WHITE" untuk memuat char anda.", GetPlayerPing(playerid));
				SendClientMessage(playerid, -1, ""GRAY"</>:"WHITE" Jika anda punya pertanyaan gunakan "ALTHF"/ask"WHITE", untuk keperluan lainnya anda dapat menggunakan "ALTHF"/help");
				SendClientMessage(playerid, -1, ""GRAY"</>:"WHITE" Discord kita yaitu: "ALTHF""TEXT_WEBURL"");
				// if(!AccountData[playerid][pStarterpack])
				// {
				// 	SendClientMessageEx(playerid, COLOR_RED, "[Server] {FFFF00}Anda belum claim starterpack gunakan {0DBAFF}'/claimsp' {FFFF00}untuk mengambilnya!.");
				// }

				// for(new i; i < 7; i++){
				// 	EAGLEUI_ShowGlobalForPlayer(playerid, UI_Names[i]);
				// }
				ShowUiNames(playerid, true);
				if(AccountData[playerid][pLevel] == 1) {
					if(!AccountData[playerid][newCitizen]) {
						AccountData[playerid][newCitizen] = true;
						AccountData[playerid][newCitizenTimer] = 172800;
						ShowUiSegel(playerid);
					}

					if(AccountData[playerid][newCitizen] && AccountData[playerid][newCitizenTimer] > 0) {
						ShowUiSegel(playerid);
					}
				}

				new vQuery[300];
				mysql_format(g_SQL, vQuery, sizeof(vQuery), "SELECT * FROM `player_vehicles` WHERE `PVeh_OwnerID` = '%d' ORDER BY `id` ASC", AccountData[playerid][pID]);
				mysql_tquery(g_SQL, vQuery, "Vehicle_Load", "d", playerid);

				if(VoucherData[0][voucherExists] && AccountData[playerid][pKompensasi] < 1)
				{
					SendClientMessageEx(playerid, -1, "[i] Anda memiliki kompensasi yang belum di claim! gunakan "YELLOW"'/klaimkompensasi'"WHITE" untuk mengambil kompensasi");
				}
				if(AccountData[playerid][pDutyPD] || AccountData[playerid][pDutyPemerintah] || AccountData[playerid][pDutyEms] 
					|| AccountData[playerid][pDutyBengkel] || AccountData[playerid][pDutyTrans] || AccountData[playerid][pDutyPedagang])
				{
					AccountData[playerid][pDutyTimer] = SetTimerEx("FactDutyHour", 1000, true, "d", playerid);
				}
			}

			// EAGLEUI_ShowPlayer(playerid, UI_Time[playerid]);

			if(IsPlayerInEvent(playerid))
				return 0;
			
			Streamer_ToggleIdleUpdate(playerid, true);
			PreloadAnimations(playerid);
			if(AccountData[playerid][pUsingUniform])
			{
				SetPlayerSkin(playerid, AccountData[playerid][pUniform]);
			}
			else
			{
				SetPlayerSkin(playerid, AccountData[playerid][pSkin]);
			}

			if(AccountData[playerid][pInjured] == 1 && AccountData[playerid][pInjuredTime] != 0)
			{
				TogglePlayerControllable(playerid, false);
				SetPlayerPos(playerid, AccountData[playerid][pPosX], AccountData[playerid][pPosY], AccountData[playerid][pPosZ]);
				SetPlayerFacingAngle(playerid, AccountData[playerid][pPosA]);
				SetPlayerInterior(playerid, AccountData[playerid][pInt]);
				SetPlayerVirtualWorld(playerid, AccountData[playerid][pWorld]);
			}

			if(AccountData[playerid][pAdminDuty] > 0)
			{
				SetPlayerColor(playerid, X11_DARKRED);
				// forex(R12, 4) EAGLEUI_ShowPlayer(playerid, AdutyTD[playerid][R12]);
			}
			SetTimerEx("TimersSpawn", 5000, false, "d", playerid);
		}
	}
	return 1;
}

forward TimersSpawn(playerid);
public TimersSpawn(playerid)
{
	if(!AccountData[playerid][pSpawned])
		return 0;

	if(AccountData[playerid][pJail] > 0)
	{
		SpawnPlayerInJail(playerid);
	}
	if(AccountData[playerid][pArrestTime] > 0)
	{
		SetPlayerArrest(playerid, AccountData[playerid][pArrest]);
	}
	//GangZoneShowForPlayer(playerid, GangZoneData[gzSafezone], 0xFFB6C1EE);
	TogglePlayerControllable(playerid, 1);
	SetPlayerInterior(playerid, AccountData[playerid][pInt]);
	SetPlayerVirtualWorld(playerid, AccountData[playerid][pWorld]);
	AttachPlayerToys(playerid);
	SetWeapons(playerid);
	return 1;
}

public OnPlayerDeath(playerid, killerid, reason)
{
	if(!AccountData[playerid][pSpawned])
		return 0;

	foreach(new i : Player) if (IsPlayerConnected(i))
	{
		if(AccountData[i][pAdmin] > 0 && AccountData[i][pTheStars] > 0)
		{
			SendDeathMessageToPlayer(i, killerid, playerid, reason);
			return 1;
		}
	}
	ALTHF_Cleanup(playerid);
	new reasontext[596];
	switch(reason)
	{
		case 0: reasontext = "Tangan Kosong";
		case 1: reasontext = "Brass Knuckles";
		case 2: reasontext = "Golf Club";
		case 3: reasontext = "Nite Stick";
		case 4: reasontext = "Knife";
		case 5: reasontext = "Basebal Bat";
		case 6: reasontext = "Shovel";
		case 7: reasontext = "Pool Cue";
		case 8: reasontext = "Katana";
		case 9: reasontext = "Chain Shaw";
		case 14: reasontext = "Cane";
		case 18: reasontext = "Molotov";
		case 22: reasontext = "Colt 45";
		case 23: reasontext = "SLC";
		case 24: reasontext = "Desert Eagle";
		case 25: reasontext = "Shotgun";
		case 26: reasontext = "Sawnoff Shotgun";
		case 27: reasontext = "Combat Shotgun";
		case 28: reasontext = "Micro SMG/Uzi";
		case 29: reasontext = "MP5";
		case 30: reasontext = "AK-47";
		case 31: reasontext = "M4";
		case 32: reasontext = "Tec-9";
		case 33: reasontext = "Coutry Rifle";
		case 38: reasontext = "Mini Gun";
		case 49: reasontext = "Tertabrak Kendaraan";
		case 50: reasontext = "Helicopter Blades";
		case 51: reasontext = "Explode";
		case 53: reasontext = "Drowned";
		case 54: reasontext = "Splat";
		case 255: reasontext = "Suicide";
	}

	SendDeathLog(playerid, killerid, reason);

	AccountData[playerid][pMainXo] = 0;
    SlotMachineStarted[playerid]=0;
    SlotTimert[playerid]=0;
    SlotRunde[playerid]=0;
	SetPlayerArmedWeapon(playerid, 0);
	return 1;
}

public OnPlayerEditAttachedObject(playerid, response, index, modelid, boneid, Float:fOffsetX, Float:fOffsetY, Float:fOffsetZ, Float:fRotX, Float:fRotY, Float:fRotZ, Float:fScaleX, Float:fScaleY, Float:fScaleZ )
{
	new weaponid = EditingWeapon[playerid];
	if(response)
	{
		if(weaponid)
		{
			new enum_index = weaponid - 22, weaponname[18], string[340];
 
            GetWeaponName(weaponid, weaponname, sizeof(weaponname));
           
            WeaponSettings[playerid][enum_index][Position][0] = fOffsetX;
            WeaponSettings[playerid][enum_index][Position][1] = fOffsetY;
            WeaponSettings[playerid][enum_index][Position][2] = fOffsetZ;
            WeaponSettings[playerid][enum_index][Position][3] = fRotX;
            WeaponSettings[playerid][enum_index][Position][4] = fRotY;
            WeaponSettings[playerid][enum_index][Position][5] = fRotZ;
 
            RemovePlayerAttachedObject(playerid, GetWeaponObjectSlot(weaponid));
            SetPlayerAttachedObject(playerid, GetWeaponObjectSlot(weaponid), GetWeaponModel(weaponid), WeaponSettings[playerid][enum_index][Bone], fOffsetX, fOffsetY, fOffsetZ, fRotX, fRotY, fRotZ, 1.0, 1.0, 1.0);
 
			ShowTDN(playerid, NOTIFICATION_SUKSES, sprintf("Berhasil merubah posisi letak %s", weaponname));
           
			EditingWeapon[playerid] = 0;
            mysql_format(g_SQL, string, sizeof(string), "INSERT INTO weaponsettings (Owner, WeaponID, PosX, PosY, PosZ, RotX, RotY, RotZ) VALUES ('%d', %d, %.3f, %.3f, %.3f, %.3f, %.3f, %.3f) ON DUPLICATE KEY UPDATE PosX = VALUES(PosX), PosY = VALUES(PosY), PosZ = VALUES(PosZ), RotX = VALUES(RotX), RotY = VALUES(RotY), RotZ = VALUES(RotZ)", AccountData[playerid][pID], weaponid, fOffsetX, fOffsetY, fOffsetZ, fRotX, fRotY, fRotZ);
            mysql_tquery(g_SQL, string);
		}

		if(AccountData[playerid][toySelected] != -1)
		{
			new id = AccountData[playerid][toySelected];
			pToys[playerid][id][toy_x] = fOffsetX;
			pToys[playerid][id][toy_y] = fOffsetY;
			pToys[playerid][id][toy_z] = fOffsetZ;
			pToys[playerid][id][toy_rx] = fRotX;
			pToys[playerid][id][toy_ry] = fRotY;
			pToys[playerid][id][toy_rz] = fRotZ;
			pToys[playerid][id][toy_sx] = fScaleX;
			pToys[playerid][id][toy_sy] = fScaleY;
			pToys[playerid][id][toy_sz] = fScaleZ;
			
			MySQL_SavePlayerToys(playerid);
			ShowTDN(playerid, NOTIFICATION_SUKSES, "Berhasil menyimpan kordinat baru.");
			AccountData[playerid][toySelected] = -1;
		}
	}
	else
	{
		if(EditingWeapon[playerid])
		{
			new enum_index = weaponid - 22;
			SetPlayerAttachedObject(playerid, GetWeaponObjectSlot(weaponid), GetWeaponModel(weaponid), WeaponSettings[playerid][enum_index][Bone], fOffsetX, fOffsetY, fOffsetZ, fRotX, fRotY, fRotZ, 1.0, 1.0, 1.0);
			EditingWeapon[playerid] = 0;
		}

		if(AccountData[playerid][toySelected] != -1)
		{
			new id = AccountData[playerid][toySelected];
			SetPlayerAttachedObject(playerid,
				id,
				modelid,
				boneid,
				pToys[playerid][id][toy_x],
				pToys[playerid][id][toy_y],
				pToys[playerid][id][toy_z],
				pToys[playerid][id][toy_rx],
				pToys[playerid][id][toy_ry],
				pToys[playerid][id][toy_rz],
				pToys[playerid][id][toy_sx],
				pToys[playerid][id][toy_sy],
				pToys[playerid][id][toy_sz]);
			AccountData[playerid][toySelected] = -1;
		}
	}
	SetPVarInt(playerid, "UpdatedToy", 1);
	return 1;
}


public OnPlayerEditDynamicObject(playerid, STREAMER_TAG_OBJECT: objectid, response, Float:x, Float:y, Float:z, Float:rx, Float:ry, Float:rz)
{
	if(AccountData[playerid][EditingDeerID] != -1 && Iter_Contains(Hunt, AccountData[playerid][EditingDeerID]))
	{
		if(response == EDIT_RESPONSE_FINAL)
	    {
	        new etid = AccountData[playerid][EditingDeerID];
	        HuntData[etid][DeerPOS][0] = x;
	        HuntData[etid][DeerPOS][1] = y;
	        HuntData[etid][DeerPOS][2] = z;
	        HuntData[etid][DeerROT][0] = rx;
	        HuntData[etid][DeerROT][1] = ry;
	        HuntData[etid][DeerROT][2] = rz;

	        SetDynamicObjectPos(objectid, HuntData[etid][DeerPOS][0], HuntData[etid][DeerPOS][1], HuntData[etid][DeerPOS][2]);
	        SetDynamicObjectRot(objectid, HuntData[etid][DeerROT][0], HuntData[etid][DeerROT][1], HuntData[etid][DeerROT][2]);

			Streamer_SetFloatData(STREAMER_TYPE_3D_TEXT_LABEL, HuntData[etid][DeerLabel], E_STREAMER_X, HuntData[etid][DeerPOS][0]);
			Streamer_SetFloatData(STREAMER_TYPE_3D_TEXT_LABEL, HuntData[etid][DeerLabel], E_STREAMER_Y, HuntData[etid][DeerPOS][1]);
			Streamer_SetFloatData(STREAMER_TYPE_3D_TEXT_LABEL, HuntData[etid][DeerLabel], E_STREAMER_Z, HuntData[etid][DeerPOS][2] + 1.1);

		    HuntSave(etid);
	        AccountData[playerid][EditingDeerID] = -1;
	    }
	    if(response == EDIT_RESPONSE_CANCEL)
	    {
	        new etid = AccountData[playerid][EditingDeerID];
	        SetDynamicObjectPos(objectid, HuntData[etid][DeerPOS][0], HuntData[etid][DeerPOS][1], HuntData[etid][DeerPOS][2]);
	        SetDynamicObjectRot(objectid, HuntData[etid][DeerROT][0], HuntData[etid][DeerROT][1], HuntData[etid][DeerROT][2]);
	        AccountData[playerid][EditingDeerID] = -1;
	    }
	}
	else if(AccountData[playerid][EditingLADANGID] != -1 && Iter_Contains(Ladang, AccountData[playerid][EditingLADANGID]))
	{
		if(response == EDIT_RESPONSE_FINAL)
	    {
	        new etid = AccountData[playerid][EditingLADANGID];
	        LadangData[etid][kanabisX] = x;
	        LadangData[etid][kanabisY] = y;
	        LadangData[etid][kanabisZ] = z;
	        LadangData[etid][kanabisRX] = rx;
	        LadangData[etid][kanabisRY] = ry;
	        LadangData[etid][kanabisRZ] = rz;

	        SetDynamicObjectPos(objectid, LadangData[etid][kanabisX], LadangData[etid][kanabisY], LadangData[etid][kanabisZ]);
	        SetDynamicObjectRot(objectid, LadangData[etid][kanabisRX], LadangData[etid][kanabisRY], LadangData[etid][kanabisRZ]);

		    Ladang_Save(etid);
	        AccountData[playerid][EditingLADANGID] = -1;
	    }

	    if(response == EDIT_RESPONSE_CANCEL)
	    {
	        new etid = AccountData[playerid][EditingLADANGID];
	        SetDynamicObjectPos(objectid, LadangData[etid][kanabisX], LadangData[etid][kanabisY], LadangData[etid][kanabisZ]);
	        SetDynamicObjectRot(objectid, LadangData[etid][kanabisRX], LadangData[etid][kanabisRY], LadangData[etid][kanabisRZ]);
	        AccountData[playerid][EditingLADANGID] = -1;
	    }
	}
	else if(AccountData[playerid][EditingATMID] != -1 && Iter_Contains(ATMS, AccountData[playerid][EditingATMID]))
	{
		if(response == EDIT_RESPONSE_FINAL)
	    {
	        new etid = AccountData[playerid][EditingATMID];
	        AtmData[etid][atmX] = x;
	        AtmData[etid][atmY] = y;
	        AtmData[etid][atmZ] = z;
	        AtmData[etid][atmRX] = rx;
	        AtmData[etid][atmRY] = ry;
	        AtmData[etid][atmRZ] = rz;

	        SetDynamicObjectPos(objectid, AtmData[etid][atmX], AtmData[etid][atmY], AtmData[etid][atmZ]);
	        SetDynamicObjectRot(objectid, AtmData[etid][atmRX], AtmData[etid][atmRY], AtmData[etid][atmRZ]);

		  	Atm_Refresh(etid);
		    Atm_Save(etid);
	        AccountData[playerid][EditingATMID] = -1;
	    }

	    if(response == EDIT_RESPONSE_CANCEL)
	    {
	        new etid = AccountData[playerid][EditingATMID];
	        SetDynamicObjectPos(objectid, AtmData[etid][atmX], AtmData[etid][atmY], AtmData[etid][atmZ]);
	        SetDynamicObjectRot(objectid, AtmData[etid][atmRX], AtmData[etid][atmRY], AtmData[etid][atmRZ]);
	        AccountData[playerid][EditingATMID] = -1;
	    }
	}
	return 1;
}

public OnPlayerEnterRaceCheckpoint(playerid)
{
	if(pMapCP[playerid])
	{
		ShowTDN(playerid, NOTIFICATION_INFO, "Anda berhasil sampai ke lokasi tujuan");
		DisablePlayerRaceCheckpoint(playerid);
		pMapCP[playerid] = false;
	}
	if(AccountData[playerid][pTrackCar] == 1)
	{
		ShowTDN(playerid, NOTIFICATION_INFO, "Anda berhasil sampai ke lokasi tujuan");
		AccountData[playerid][pTrackCar] = 0;
		DisablePlayerRaceCheckpoint(playerid);
	}
	if(AccountData[playerid][pTrackHoused] == 1)
	{
		ShowTDN(playerid, NOTIFICATION_INFO, "Anda berhasil sampai ke lokasi tujuan");
		AccountData[playerid][pTrackHoused] = 0;
		DisablePlayerRaceCheckpoint(playerid);
	}
	if(AccountData[playerid][pDiPesawat])
	{
		DisablePlayerCheckpoint(playerid);
		AccountData[playerid][pDiPesawat] = false;
		AccountData[playerid][pPosX] = 1750.4976;
		AccountData[playerid][pPosY] = -2516.3225;
		AccountData[playerid][pPosZ] = 13.5969;
		AccountData[playerid][pPosA] = 90.1848;
		AccountData[playerid][pInDoor] = 7;
		SetPlayerVirtualWorldEx(playerid, 0);
		SetPlayerInteriorEx(playerid, 0);
		SetPlayerPositionEx(playerid, AccountData[playerid][pPosX], AccountData[playerid][pPosY], AccountData[playerid][pPosZ], AccountData[playerid][pPosA], 6000);
	}
	if(jobs::mixer[playerid][mixerDuty][1])
    {
        DisablePlayerCheckpoint(playerid);
        CEF_ProgressLabel(playerid, "MENUMPAHKAN");
        ShowProgressBar(playerid);
        jobs::mixer[playerid][mixerDuty][1] = false;
        jobs::mixer[playerid][mixerTimer] = SetTimerEx("CorLokasi", 1000, true, "i", playerid);
    }
    if(jobs::mixer[playerid][mixerDuty][2])
    {
        if(IsPlayerInAnyVehicle(playerid))
        {
            RemovePlayerFromVehicle(playerid);
            DestroyVehicle(GetPlayerVehicleID(playerid));
            GiveMoney(playerid, 150);
            jobs::mixer[playerid][mixerDuty][2] = false;
            jobs::mixer_reset_enum(playerid);
        }
        
    }
	return 1;
}

Dialog:DeathRespawnConf(playerid, response, listitem, inputtext[])
{
	if(!response) return 1;
	if(!IsPlayerInjured(playerid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak sedang Pingsan!");

	SetPlayerHealthEx(playerid, 100.0);
	AccountData[playerid][pHunger] = 100;
	AccountData[playerid][pThirst] = 100;
	AccountData[playerid][pStress] = 0;
	AccountData[playerid][pInjured] = 0;
	AccountData[playerid][pInjuredTime] = 0;
	Inventory_Clear(playerid);
	ResetPlayerWeaponsEx(playerid);
	
	ShowTDN(playerid, NOTIFICATION_INFO, "Kamu koma dan dilarikan ke Rumah Sakit");

	SetPlayerPositionEx(playerid, 907.8289, 711.1892, 5010.3184, 358.7794, 5000);
	SetPlayerVirtualWorldEx(playerid, 5);
	SetPlayerInteriorEx(playerid, 5);

	foreach(new pid : Player) {
		if(AccountData[pid][pFaction] == FACTION_EMS && AccountData[pid][pDutyEms]) {
			SendClientMessageEx(pid, -1, ""YELLOW"[Koma]"WHITE_E" %s telah terbangun di ruang koma", ReturnName(playerid));
		}
	}

	AddPMoneyLog(AccountData[playerid][pName], AccountData[playerid][pUCP], "KOMA", 0);
	return 1;
}

public OnPlayerKeyStateChange(playerid, newkeys, oldkeys)
{
	/* Job Mixer */
	if(PRESSED(KEY_WALK) && IsPlayerInRangeOfPoint(playerid, 2.0, 641.2187,1238.3390,11.6796))
    {
		if(jobs::mixer[playerid][mixerDuty][0]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda sudah memulai pekerjaan");
        if(GetPlayerJob(playerid) != JOB_DRIVER_MIXERS) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda bukan pekerja supir mixer");
        jobs::mixer[playerid][mixerVehicle] = CreateVehicle(524, 639.8187,1250.2065,11.6333,306.5278, 5, 5, 60000, false);
		if(IsValidVehicle(jobs::mixer[playerid][mixerVehicle]))
		{
			VehicleCore[jobs::mixer[playerid][mixerVehicle]][vCoreFuel]=MAX_FUEL_FULL;
		    PutPlayerInVehicle(playerid, jobs::mixer[playerid][mixerVehicle], 0);
			jobs::mixer[playerid][mixerDuty][0] = true;
		}
        ShowPlayerFooter(playerid, "~w~~h~Isi kendaraan dengan ~g~beton ~w~di~n~belakang", 3000, 1);
    }
    if(PRESSED(KEY_CROUCH) && GetPlayerState(playerid) == PLAYER_STATE_DRIVER && IsPlayerInRangeOfPoint(playerid, 3.0, 590.0992,1243.8767,11.7188))
    {
        if(GetPlayerJob(playerid) != JOB_DRIVER_MIXERS) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda bukan pekerja supir mixer");
        ShowMixTD(playerid);
    }
	/* Senter */
	if(PRESSED(KEY_CTRL_BACK) && AccountData[playerid][pFlashShown] && !IsPlayerInAnyVehicle(playerid))
	{
		switch(AccountData[playerid][pFlashOn])
		{
			case false:
            {
				if (!IsPlayerPlayingAnimation(playerid, "ped", "phone_talk"))
				{
					ApplyAnimationEx(playerid, "ped", "phone_talk", 1.1, 1, 1, 1, 1, 1, 1);
				}
				
                AccountData[playerid][pFlashOn] = true;
                SetPlayerAttachedObject(playerid, 5, 19295, 1,  0.068000, 0.606000, 0.000000,  0.000000, -4.500000, 12.299996,  1.000000, 1.000000, 1.020000); // Light Objects
                ShowPlayerFooter(playerid, "~w~Senter ~g~Nyala", 3000);
            }
            case true:
            {
                AccountData[playerid][pFlashOn] = false;
                RemovePlayerAttachedObject(playerid, 5);
                ShowPlayerFooter(playerid, "~w~Senter ~r~Mati", 3000);
            }
		}
	}

	/* Greenzone */
	if(newkeys & KEY_FIRE && GetPlayerState(playerid) == PLAYER_STATE_ONFOOT && IsPlayerInDynamicArea(playerid, AreaData[BandaraGreenZone]))
	{
		ClearAnimations(playerid, 1);
        SetPlayerArmedWeapon(playerid, 0);

        SetPVarInt(playerid, "GreenzoneWarning", GetPVarInt(playerid, "GreenzoneWarning")+1);
		Info(playerid, "Anda tidak dapat memukul / menembak di Area Greenzone. "RED"%d/5"WHITE" anda akan ditendang dari server.", GetPVarInt(playerid, "GreenzoneWarning"));

        if(GetPVarInt(playerid, "GreenzoneWarning") == 5) {
			Warning(playerid, "Anda telah ditendang dari server karena mendapatkan "RED"5"WHITE" peringatan Greenzone!");
			DeletePVar(playerid, "GreenzoneWarning");
            KickEx(playerid);
        }
	}

	if((newkeys & KEY_JUMP) && !IsPlayerInAnyVehicle(playerid) && GetPlayerState(playerid) == PLAYER_STATE_ONFOOT && !IsPlayerInEvent(playerid) && !DurringHunting[playerid] && !AccountData[playerid][pAdminDuty])
	{
		PlayerPressedJump[playerid] ++;
		SetTimerEx("PressJumpReset", 3000, false, "d", playerid); // Makes it where if they dont spam the jump key, they wont fall

		if(PlayerPressedJump[playerid] >= 3)
		{
			new Float: POS[3];
			GetPlayerPos(playerid, POS[0], POS[1], POS[2]);
			SetPlayerPos(playerid, POS[0], POS[1], POS[2] - 0.2);
			ApplyAnimationEx(playerid, "PED", "FALL_collapse", 4.1, 0, 1, 0, 0, 0, 1); // applies the fallover animation
			PlayerPlayNearbySound(playerid, 1163);
			PlayerPressedJump[playerid] = 0;
		}
	}

	/* Voting Systemm */
	if(newkeys & KEY_JUMP && !(oldkeys & KEY_JUMP) && !AccountData[playerid][pInjured])
	{
		if(AccountData[playerid][pRFoot] < 50 || AccountData[playerid][pLFoot] < 50)
		{
			ApplyAnimation(playerid, "GYMNASIUM", "gym_jog_falloff", 4.1, 0, 1, 1, 0, 0);
		}
	}

	if(newkeys & KEY_YES && OpenVote == 1 && !PlayerVoting[playerid] && !AccountData[playerid][ActivityTime])
	{

		ShowTDN(playerid, NOTIFICATION_SUKSES, "Anda Setuju untuk Voting yang sedang berjalan");

		PlayerVoting[playerid] = true;
		VoteYes += 1;
		SendClientMessageToAllEx(-1, ""YELLOW"VOTE:"WHITE" %s // Yes: "GREEN"%d"WHITE" // No: "RED"%d", VoteText, VoteYes, VoteNo);
		SendClientMessageToAllEx(-1, "~> Gunakan "GREEN"Y"WHITE" untuk Yes & "RED"N"WHITE" untuk Tidak");
	}

	if(newkeys & KEY_NO && OpenVote == 1 && !PlayerVoting[playerid] && !AccountData[playerid][ActivityTime])
	{

		ShowTDN(playerid, NOTIFICATION_SUKSES, "Anda Tidak Setuju untuk Voting yang sedang berjalan");

		PlayerVoting[playerid] = true;
		VoteNo += 1;
		SendClientMessageToAllEx(-1, ""YELLOW"VOTE:"WHITE" %s // Yes: "GREEN"%d"WHITE" // No: "RED"%d", VoteText, VoteYes, VoteNo);
		SendClientMessageToAllEx(-1, "~> Gunakan "GREEN"Y"WHITE" untuk Yes & "RED"N"WHITE" untuk Tidak");
	}

	/* Anti Bike Hopping */
	if(PRESSED(KEY_ACTION))
	{
		static vehicleid;

		if(IsPlayerInAnyVehicle(playerid) && ((vehicleid = GetPlayerVehicleID(playerid)) != INVALID_VEHICLE_ID))
		{
			if(GetVehicleModel(vehicleid) == 509 || GetVehicleModel(vehicleid) == 481 || GetVehicleModel(vehicleid) == 510)
			{
				new Float:x, Float:y, Float:z;
				GetPlayerPos(playerid, x, y, z);
				SetPlayerPos(playerid, x, y, z);

				ApplyAnimationEx(playerid, "PED", "BIKE_fall_off", 4.1, 0, 1, 1, 1, 0, 1);
			}
		}
	}

	if(newkeys & KEY_JUMP && !(oldkeys & KEY_JUMP) && GetPlayerSpecialAction(playerid) == SPECIAL_ACTION_CUFFED && !AccountData[playerid][pInjured])
	{
		ApplyAnimation(playerid, "GYMNASIUM", "gym_jog_falloff", 4.1, 0, 1, 1, 0, 0);
	}
	if(newkeys & KEY_WALK)
	{
		if(AccountData[playerid][pInjured] && AccountData[playerid][pInjuredTime] <= 300)
		{
		    Dialog_Show(playerid, DeathRespawnConf, DIALOG_STYLE_MSGBOX, ""ALTHF"EAGLE Roleplay "WHITE"- Konfirmasi Koma",
		    "Apakah anda benar benar yakin ingin melakukan tindakan ini?\n"RED"NOTE: Tindakan ini dapat menghilangkan semua barang di tas termasuk uang cash", "Iya", "Tidak");
		}
		else if(AccountData[playerid][pInjured] && AccountData[playerid][pInjuredTime] > 300)
			Info(playerid, "Kamu harus menunggu setidaknya hingga waktu tersisa 5 menit untuk mengonfirmasi koma.");
	}
	if(newkeys & KEY_SECONDARY_ATTACK && GetPlayerState(playerid) == PLAYER_STATE_ONFOOT)
    {
		foreach(new famid : Families)
		{
			if(IsPlayerInRangeOfPoint(playerid, 2.5, FamData[famid][famExtPos][0], FamData[famid][famExtPos][1], FamData[famid][famExtPos][2]))
			{
				if(IsDoorMyFamilie(playerid) == AccountData[playerid][pFamily])
				{
					if(FamData[famid][famIntPos][0] == 0.0 && FamData[famid][famIntPos][1] == 0.0 && FamData[famid][famIntPos][2] == 0.0)
						return ShowTDN(playerid, NOTIFICATION_ERROR, "Interior ini masih kosong!");

					if(AccountData[playerid][pFaction] == FACTION_NONE)
						if(AccountData[playerid][pFamily] == -1)
							return ShowTDN(playerid, NOTIFICATION_ERROR, "Kamu tidak memiliki Akses untuk masuk kedalam sini!");
					
					AccountData[playerid][UsingDoor] = true;
					Player_ToggleTelportAntiCheat(playerid, false);
					SetPlayerPositionEx(playerid, FamData[famid][famIntPos][0], FamData[famid][famIntPos][1], FamData[famid][famIntPos][2], FamData[famid][famIntPos][3], 5000);

					SetPlayerInterior(playerid, FamData[famid][famInterior]);
					SetPlayerVirtualWorld(playerid, famid);
					SetCameraBehindPlayer(playerid);
					SetPlayerWeather(playerid, 0);
					FadeIn(playerid);
					AccountData[playerid][pInFamily] = famid;
				}
				else ShowTDN(playerid, NOTIFICATION_ERROR, "Anda bukan bagian dari Families ini!");
			}
			new infamily = AccountData[playerid][pInFamily];
			if(AccountData[playerid][pInFamily] != -1 && IsPlayerInRangeOfPoint(playerid, 2.5, FamData[infamily][famIntPos][0], FamData[infamily][famIntPos][1],FamData[infamily][famIntPos][2]))
			{
				AccountData[playerid][pInFamily] = -1;
				AccountData[playerid][UsingDoor] = true;
				Player_ToggleTelportAntiCheat(playerid, false);
				SetPlayerPositionEx(playerid, FamData[infamily][famExtPos][0], FamData[infamily][famExtPos][1], FamData[infamily][famExtPos][2], FamData[infamily][famExtPos][3], 5000);

				SetPlayerInterior(playerid, 0);
				SetPlayerVirtualWorld(playerid, 0);
				SetCameraBehindPlayer(playerid);
				SetPlayerWeather(playerid, WorldWeather);
				FadeIn(playerid);
				Player_ToggleTelportAntiCheat(playerid, true);
			}
		}
	}
	
	if(newkeys & KEY_LOOK_BEHIND)
	{
		if(GetPlayerState(playerid) == PLAYER_STATE_ONFOOT) return 0;

		new vehid = GetNearestVehicleToPlayer(playerid, 3.0, false);
		if(vehid == INVALID_VEHICLE_ID) return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak ada kendaraan apapun di sekitar!");

		foreach(new iter : PvtVehicles)
		{
			if(PlayerVehicle[iter][pVehExists])
			{
				if(PlayerVehicle[iter][pVehPhysic] == vehid)
				{
					if(PlayerVehicle[iter][pVehOwnerID] != AccountData[playerid][pID]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Kendaraan ini bukan milik anda!");
					
					PlayerPlaySound(playerid, 1147, 0.0, 0.0, 0.0);
					PlayerVehicle[iter][pVehLocked] = !(PlayerVehicle[iter][pVehLocked]);

					PlayerPlayNearbySound(playerid, SOUND_LOCK_CAR_DOOR);
					LockVehicle(PlayerVehicle[iter][pVehPhysic], PlayerVehicle[iter][pVehLocked]);
					ToggleVehicleLights(PlayerVehicle[iter][pVehPhysic], PlayerVehicle[iter][pVehLocked]);
					EagleUI_GameTextForPlayer(playerid, sprintf("~w~%s %s", GetVehicleName(PlayerVehicle[iter][pVehPhysic]), PlayerVehicle[iter][pVehLocked] ? ("~r~Locked") : ("~g~Unlocked")), 4000, 4);
					return 1;
				}
			}
		}

		if(AccountData[playerid][pJobVehicle] != 0)
		{
			if (vehid == JobVehicle[AccountData[playerid][pJobVehicle]][Vehicle])
			{
				PlayerPlaySound(playerid, 1147, 0.0, 0.0, 0.0);
				JobVehicle[AccountData[playerid][pJobVehicle]][Locked] = !(JobVehicle[AccountData[playerid][pJobVehicle]][Locked]);

				PlayerPlayNearbySound(playerid, SOUND_LOCK_CAR_DOOR);
				LockVehicle(JobVehicle[AccountData[playerid][pJobVehicle]][Vehicle], JobVehicle[AccountData[playerid][pJobVehicle]][Locked]);
				ToggleVehicleLights(JobVehicle[AccountData[playerid][pJobVehicle]][Vehicle], JobVehicle[AccountData[playerid][pJobVehicle]][Locked]);
				EagleUI_GameTextForPlayer(playerid, sprintf("~w~%s %s", GetVehicleName(JobVehicle[AccountData[playerid][pJobVehicle]][Vehicle]), JobVehicle[AccountData[playerid][pJobVehicle]][Locked] ? ("~r~Locked") : ("~g~Unlocked")), 4000, 4);
			}
			return 1;
		}

		if(PlayerElectricJob[playerid][ElectricVehicle] == vehid)
		{
			PlayerPlaySound(playerid, 1147, 0.0, 0.0, 0.0);
			PlayerElectricJob[playerid][ElectricLocked] = !(PlayerElectricJob[playerid][ElectricLocked]);

			PlayerPlayNearbySound(playerid, SOUND_LOCK_CAR_DOOR);
			LockVehicle(PlayerElectricJob[playerid][ElectricVehicle], PlayerElectricJob[playerid][ElectricLocked]);
			ToggleVehicleLights(PlayerElectricJob[playerid][ElectricVehicle], PlayerElectricJob[playerid][ElectricLocked]);
			EagleUI_GameTextForPlayer(playerid, sprintf("~w~%s %s", GetVehicleName(PlayerElectricJob[playerid][ElectricVehicle]), PlayerElectricJob[playerid][ElectricLocked] ? ("~r~Locked") : ("~g~Unlocked")), 4000, 4);
			return 1;
		}
	}
	if(newkeys & KEY_CTRL_BACK)
	{
		if(IsPlayerInjured(playerid))
		{
		    SetPlayerInterior(playerid, 0);
		    SetPlayerVirtualWorld(playerid, 0);
		}
	}
	if(PRESSED(KEY_YES))
	{
		if(AccountData[playerid][pInjured])
		{
			if(SignalExists[playerid]) return ShowTDN(playerid, NOTIFICATION_WARNING, "Anda sudah mengirim signal, tunggu hingga EMS merespon!");
			
			GetPlayerPos(playerid, SignalPos[playerid][0], SignalPos[playerid][1], SignalPos[playerid][2]);
			SignalExists[playerid] = true;
			SignalTimer[playerid] = 120;
			ShowTDN(playerid, NOTIFICATION_SUKSES, "Berhasil mengirim sinyal kepada EMS!");
			foreach(new i : Player) if (AccountData[i][pSpawned] && AccountData[i][pFaction] == FACTION_EMS) if (AccountData[i][pDutyEms])
			{
				SendClientMessageEx(i, -1, ""RED"[Emergency Signal]"WHITE" Signal terlah diterima dari daerah "YELLOW"%s", GetLocation(SignalPos[playerid][0], SignalPos[playerid][1], SignalPos[playerid][2]));
				Info(i, "Buka Smartphone ~> GPS ~> Signal Emergency (EMS) jika ingin merespon signal");
			}
		}
	}
	if((newkeys & KEY_NO) && aOfferID[playerid] == INVALID_PLAYER_ID)
	{
		if (AccountData[playerid][ActivityTime] != 0) return ShowTDN(playerid, NOTIFICATION_WARNING, "Tidak dapat membuka radial saat actvitity berjalan!");
		if (AccountData[playerid][pInjured]) return ShowTDN(playerid, NOTIFICATION_WARNING, "Anda tidak ddapat melakukan ini ketika sedang pingsan!");
		
		ShowPlayerRadialNew(playerid, true);
	}
	return 1;
}

public OnPlayerStateChange(playerid, newstate, oldstate)
{
	new vehicleid = GetPlayerVehicleID(playerid);
	
	if(newstate == PLAYER_STATE_DRIVER || newstate == PLAYER_STATE_PASSENGER)
	{
		for(new x = 0; x < 60; x++) EAGLEUI_HidePlayer(playerid, Althf_InfoPlayer[playerid][x]);
	}
	
	if(oldstate == PLAYER_STATE_DRIVER || oldstate == PLAYER_STATE_PASSENGER)
	{
		if(newstate == PLAYER_STATE_ONFOOT)
		{
			// ShowHbeTextdraws(playerid, AccountData[playerid][pHUDMode]);
			if(AccountData[playerid][pInfoPlayerShown])
			{
				for(new x = 0; x < 60; x++) EAGLEUI_ShowPlayer(playerid, Althf_InfoPlayer[playerid][x]);
			}
		}
	}

	if(newstate == PLAYER_STATE_DRIVER || newstate == PLAYER_STATE_PASSENGER)
	{
		ShowUiNames(playerid, false);
	}
	
	if(oldstate == PLAYER_STATE_DRIVER || oldstate == PLAYER_STATE_PASSENGER)
	{
		if(newstate == PLAYER_STATE_ONFOOT)
		{
			ShowUiNames(playerid, true);
		}
	}
	
	if((oldstate == PLAYER_STATE_ONFOOT && newstate == PLAYER_STATE_DRIVER) && AccountData[playerid][pTogAutoEngine])
	{
		if(!GetEngineStatus(vehicleid))
		{
			if(IsEngineVehicle(vehicleid) && !IsADealerVehicle(playerid, vehicleid))
			{
				AccountData[playerid][pTurningEngine] = true;
				SetTimerEx("EngineStatus", 2500, false, "id", playerid, vehicleid);
				SendRPMeAboveHead(playerid, "Mencoba menghidupkan mesin kendaraan", X11_PLUM1);
			}
		}
	}
	if(newstate == PLAYER_STATE_WASTED && AccountData[playerid][pJail] < 1)
    {	
		if(IsPlayerInEvent(playerid))
			return 1;

		SetPlayerArmedWeapon(playerid, 0);
		ResetPlayer(playerid);

		if(!AccountData[playerid][pInjured] && !IsPlayerInEvent(playerid))
		{
			AccountData[playerid][pInjured] = 1;
			AccountData[playerid][pInjuredTime] = 600;
			
			AccountData[playerid][pInt] = GetPlayerInterior(playerid);
			AccountData[playerid][pWorld] = GetPlayerVirtualWorld(playerid);

			GetPlayerPos(playerid, AccountData[playerid][pPosX], AccountData[playerid][pPosY], AccountData[playerid][pPosZ]);
			GetPlayerFacingAngle(playerid, AccountData[playerid][pPosA]);

			SendPlayerKoma(playerid, "Kondisi Sekarat");
		}
	}
	//Spec Player
	if(newstate == PLAYER_STATE_ONFOOT)
	{
		if(AccountData[playerid][playerSpectated] != 0)
		{
			foreach(new ii : Player)
			{
				if(AccountData[ii][pSpec] == playerid)
				{
					PlayerSpectatePlayer(ii, playerid);
					SendClientMessageEx(ii, -1, ""YELLOW"SPEC:"WHITE" %s(%d) sekarang berjalan kaki.", AccountData[playerid][pName], playerid);
				}
			}
		}
	}
	if(newstate == PLAYER_STATE_DRIVER || newstate == PLAYER_STATE_PASSENGER)
    {
		if(AccountData[playerid][pInjured] == 1)
        {
            //RemoveFromVehicle(playerid);
			RemovePlayerFromVehicle(playerid);
            SetPlayerHealthEx(playerid, 99999);
        }
		foreach (new ii : Player) if(AccountData[ii][pSpec] == playerid) 
		{
            PlayerSpectateVehicle(ii, GetPlayerVehicleID(playerid));
        }
		GangZoneHideForPlayer(playerid, GangZoneData[gzSafezone]);
	}
    
	new vehicle_index = -1;
	if((vehicle_index = Vehicle_ReturnID(vehicleid)) != RETURN_INVALID_VEHICLE_ID)
	{
		if((newstate == PLAYER_STATE_DRIVER || newstate == PLAYER_STATE_PASSENGER) && PlayerVehicle[vehicle_index][vehAudio])
		{
			PlayVehicleAudio(playerid, vehicle_index);
		}
	}
	
	if((oldstate == PLAYER_STATE_DRIVER || oldstate == PLAYER_STATE_PASSENGER) && AccountData[playerid][pVehAudioPlay])
	{
		StopAudioStreamForPlayer(playerid);
		AccountData[playerid][pVehAudioPlay] = 0;
	}
	if(oldstate == PLAYER_STATE_DRIVER)
    {	
		if(GetPlayerSpecialAction(playerid) == SPECIAL_ACTION_CARRY || GetPlayerSpecialAction(playerid) == SPECIAL_ACTION_CUFFED)
            return RemovePlayerFromVehicle(playerid);/*RemoveFromVehicle(playerid);*/
		
		for(new i; i<40; i++) EAGLEUI_HidePlayer(playerid, GradientSpeedo[playerid][i]);
		Compass_Status(playerid, false);
	}
	/*
	if(oldstate == PLAYER_STATE_PASSENGER)
	{
		GangZoneShowForPlayer(playerid, GangZoneData[gzSafezone], 0xFFB6C1EE);
	}
	*/
	else if(newstate == PLAYER_STATE_DRIVER)
    {	
		static pviterid = -1;

		if((pviterid = Vehicle_Nearest2(playerid)) != -1)
		{
			if(IsABike(PlayerVehicle[pviterid][pVehPhysic]) || GetVehicleModel(PlayerVehicle[pviterid][pVehPhysic]) == 424)
			{
				if(PlayerVehicle[pviterid][pVehLocked])
				{
					RemovePlayerFromVehicle(playerid);
					ClearAnimations(playerid, 1);
					ShowTDN(playerid, NOTIFICATION_ERROR, "Kendaraan ini terkunci!");
					return 1;
				}
			}
		}
		if(!IsEngineVehicle(vehicleid))
        {
            SwitchVehicleEngine(vehicleid, true);
        }
		
		for(new i; i<40; i++) EAGLEUI_ShowPlayer(playerid, GradientSpeedo[playerid][i]);
		Compass_Status(playerid, true);

		new Float:health;
        GetVehicleHealth(GetPlayerVehicleID(playerid), health);
        VehicleHealthSecurityData[GetPlayerVehicleID(playerid)] = health;
        VehicleHealthSecurity[GetPlayerVehicleID(playerid)] = true;
		
		if(AccountData[playerid][playerSpectated] != 0)
  		{
			foreach(new ii : Player)
			{
    			if(AccountData[ii][pSpec] == playerid)
			    {
        			PlayerSpectateVehicle(ii, vehicleid);
					SendClientMessageEx(ii, -1, ""YELLOW"SPEC:"WHITE" %s(%d) sekarang mengendarai %s(%d).", AccountData[playerid][pName], playerid, GetVehicleModelName(GetVehicleModel(vehicleid)), vehicleid);
				}
			}
		}
		SetPVarInt(playerid, "LastVehicleID", vehicleid);
	}
	return 1;
}

public OnPlayerWeaponShot(playerid, weaponid, hittype, hitid, Float:fX, Float:fY, Float:fZ)
{
	switch(weaponid){ case 0..18, 39..54: return 1;} //invalid weapons
	if(1 <= weaponid <= 46 && AccountData[playerid][pGuns][g_aWeaponSlots[weaponid]] == weaponid)
	{
		AccountData[playerid][pAmmo][g_aWeaponSlots[weaponid]]--;
		if(AccountData[playerid][pGuns][g_aWeaponSlots[weaponid]] != 0 && !AccountData[playerid][pAmmo][g_aWeaponSlots[weaponid]])
		{
			AccountData[playerid][pGuns][g_aWeaponSlots[weaponid]] = 0;
		}
	}

	if(PlayerHasTazer(playerid) && AccountData[playerid][pFaction] == FACTION_POLISI)
	{
		SetPlayerArmedWeapon(playerid, 0);
		PlayerPlayNearbySound(playerid, 6003);
	}
	
	if(weaponid >= 22 && weaponid <= 45)
	{
		static Float:x, Float:y, Float:z;
		GetPlayerPos(playerid, x, y, z);
		
		foreach (new i : Player) if (IsPlayerConnected(i)) if (SQL_IsCharacterLogged(i))
		{
			if (AccountData[i][pFaction] == FACTION_POLISI && AccountData[i][pDutyPD])
			{
				// SendClientMessageEx(i, X11_ORANGE1, "[WAR ALERT]"WHITE" Terdeteksi penembakan di daerah %s.", GetLocation(x, y, z));
				
				new atext[20];
				if(AccountData[playerid][pGender] == 1) atext = "Male";
				else atext = "Female";
				
				new shotinfo[128];
				format(shotinfo, sizeof(shotinfo), "Gender: %s", atext);
				EAGLEUI_SetStringPlayer(i, ShotsTD[i][19], shotinfo);
				
				format(shotinfo, sizeof(shotinfo), "Weapon: %s", ReturnWeaponName(weaponid));
				EAGLEUI_SetStringPlayer(i, ShotsTD[i][21], shotinfo);
				
				format(shotinfo, sizeof(shotinfo), "Location: %s", GetLocation(x, y, z));
				EAGLEUI_SetStringPlayer(i, ShotsTD[i][16], shotinfo);
				
				for(new igh; igh < 23; igh++)
				{
					EAGLEUI_ShowPlayer(i, ShotsTD[i][igh]);
				}

				SetTimerEx("HideShotTD", 5000, false, "i", i);
			}
		}
	}
	return 1;
}

stock GivePlayerHealth(playerid,Float:Health)
{
	new Float:health; GetPlayerHealth(playerid,health);
	SetPlayerHealth(playerid,health+Health);
}

/*public OnVehicleDamageStatusUpdate(vehicleid, playerid)
{
	new
        Float: vehicleHealth,
        playerVehicleId = GetPlayerVehicleID(playerid);

    new Float:health = GetPlayerHealth(playerid, health);
    GetVehicleHealth(playerVehicleId, vehicleHealth);
    if(AccountData[playerid][pSeatBelt] == 0 || AccountData[playerid][pHelmetOn] == 0)
    {
    	if(GetVehicleSpeed(vehicleid) <= 20)
    	{
    		new asakit = RandomEx(0, 1);
    		new bsakit = RandomEx(0, 1);
    		new csakit = RandomEx(0, 1);
    		AccountData[playerid][pLFoot] -= csakit;
    		AccountData[playerid][pLHand] -= bsakit;
    		AccountData[playerid][pRFoot] -= csakit;
    		AccountData[playerid][pRHand] -= bsakit;
    		AccountData[playerid][pHead] -= asakit;
    		GivePlayerHealth(playerid, -1);
    		return 1;
    	}
    	if(GetVehicleSpeed(vehicleid) <= 50)
    	{
    		new asakit = RandomEx(0, 2);
    		new bsakit = RandomEx(0, 2);
    		new csakit = RandomEx(0, 2);
    		new dsakit = RandomEx(0, 2);
    		AccountData[playerid][pLFoot] -= dsakit;
    		AccountData[playerid][pLHand] -= bsakit;
    		AccountData[playerid][pRFoot] -= csakit;
    		AccountData[playerid][pRHand] -= dsakit;
    		AccountData[playerid][pHead] -= asakit;
    		GivePlayerHealth(playerid, -2);
    		return 1;
    	}
    	if(GetVehicleSpeed(vehicleid) <= 90)
    	{
    		new asakit = RandomEx(0, 3);
    		new bsakit = RandomEx(0, 3);
    		new csakit = RandomEx(0, 3);
    		new dsakit = RandomEx(0, 3);
    		AccountData[playerid][pLFoot] -= csakit;
    		AccountData[playerid][pLHand] -= csakit;
    		AccountData[playerid][pRFoot] -= dsakit;
    		AccountData[playerid][pRHand] -= bsakit;
    		AccountData[playerid][pHead] -= asakit;
    		GivePlayerHealth(playerid, -5);
    		return 1;
    	}
    	return 1;
    }
    if(AccountData[playerid][pSeatBelt] == 1 || AccountData[playerid][pHelmetOn] == 1)
    {
    	if(GetVehicleSpeed(vehicleid) <= 20)
    	{
    		new asakit = RandomEx(0, 1);
    		new bsakit = RandomEx(0, 1);
    		new csakit = RandomEx(0, 1);
    		AccountData[playerid][pLFoot] -= csakit;
    		AccountData[playerid][pLHand] -= bsakit;
    		AccountData[playerid][pRFoot] -= csakit;
    		AccountData[playerid][pRHand] -= bsakit;
    		AccountData[playerid][pHead] -= asakit;
    		GivePlayerHealth(playerid, -1);
    		return 1;
    	}
    	if(GetVehicleSpeed(vehicleid) <= 50)
    	{
    		new asakit = RandomEx(0, 1);
    		new bsakit = RandomEx(0, 1);
    		new csakit = RandomEx(0, 1);
    		new dsakit = RandomEx(0, 1);
    		AccountData[playerid][pLFoot] -= dsakit;
    		AccountData[playerid][pLHand] -= bsakit;
    		AccountData[playerid][pRFoot] -= csakit;
    		AccountData[playerid][pRHand] -= dsakit;
    		AccountData[playerid][pHead] -= asakit;
    		GivePlayerHealth(playerid, -1);
    		return 1;
    	}
    	if(GetVehicleSpeed(vehicleid) <= 90)
    	{
    		new asakit = RandomEx(0, 1);
    		new bsakit = RandomEx(0, 1);
    		new csakit = RandomEx(0, 1);
    		new dsakit = RandomEx(0, 1);
    		AccountData[playerid][pLFoot] -= csakit;
    		AccountData[playerid][pLHand] -= csakit;
    		AccountData[playerid][pRFoot] -= dsakit;
    		AccountData[playerid][pRHand] -= bsakit;
    		AccountData[playerid][pHead] -= asakit;
    		GivePlayerHealth(playerid, -3);
    		return 1;
    	}
    }
    return 1;
}*/

public OnPlayerGiveDamage(playerid, damagedid, Float:amount, weaponid, bodypart)
{
	if(damagedid != INVALID_PLAYER_ID && weaponid == WEAPON_CHAINSAW) {
        TogglePlayerControllable(playerid, 0);
        SetPlayerArmedWeapon(playerid, 0);
        TogglePlayerControllable(playerid, 1);
        SetCameraBehindPlayer(playerid);

        SetPVarInt(playerid, "ChainsawWarning", GetPVarInt(playerid, "ChainsawWarning")+1);

        if(GetPVarInt(playerid, "ChainsawWarning") == 3) {
			SendClientMessageToAllEx(X11_RED, "[AntiCheat]:"YELLOW" %s(%d)"LIGHTGREY" telah ditendang dari server karena Abusing Chainsaw!", ReturnName(playerid), playerid);
            DeletePVar(playerid, "ChainsawWarning");
            KickEx(playerid);
        }
    }
	else if(damagedid != INVALID_PLAYER_ID)
	{
		AccountData[damagedid][pLastShot] = playerid;
		AccountData[damagedid][pShotTime] = gettime();
		if(AccountData[playerid][pFaction] == FACTION_POLISI && PlayerHasTazer(playerid) && !AccountData[damagedid][pStunned])
		{
			if(GetPlayerState(damagedid) != PLAYER_STATE_ONFOOT)
				return ShowTDN(playerid, NOTIFICATION_ERROR, "Pemain tersebut harus keadaan onfoot untuk dilumpuhkan!");
			
			if(GetPlayerDistanceFromPlayer(playerid, damagedid) > 5.0)
				return ShowTDN(playerid, NOTIFICATION_ERROR, "Kamu harus lebih dekat untuk melumpuhkan pemain tersebut!");
			
			AccountData[damagedid][pStunned] = 10;
			TogglePlayerControllable(damagedid, 0);
			
			ApplyAnimation(damagedid, "CRACK", "crckdeth4", 4.0, 0, 0, 0, 1, 0, 1);
			ShowTDN(damagedid, NOTIFICATION_WARNING, "Kamu terkena stun gun / taser!");
		}
	}
	return 1;
}

public OnPlayerTakeDamage(playerid, issuerid, Float:amount, weaponid, bodypart)
{
	if(!IsPlayerInEvent(playerid))
	{
		new sakit = RandomEx(1, 4);
		new asakit = RandomEx(1, 5);
		new bsakit = RandomEx(1, 7);
		new csakit = RandomEx(1, 4);
		if(issuerid != INVALID_PLAYER_ID && GetPlayerWeapon(issuerid) && bodypart == 9)
		{
			AccountData[playerid][pHead] -= 20;
		}
		if(issuerid != INVALID_PLAYER_ID && GetPlayerWeapon(issuerid) && bodypart == 3)
		{
			AccountData[playerid][pPerut] -= sakit;
		}
		if(issuerid != INVALID_PLAYER_ID && GetPlayerWeapon(issuerid) && bodypart == 6)
		{
			AccountData[playerid][pRHand] -= bsakit;
		}
		if(issuerid != INVALID_PLAYER_ID && GetPlayerWeapon(issuerid) && bodypart == 5)
		{
			AccountData[playerid][pLHand] -= asakit;
		}
		if(issuerid != INVALID_PLAYER_ID && GetPlayerWeapon(issuerid) && bodypart == 8)
		{
			AccountData[playerid][pRFoot] -= csakit;
		}
		if(issuerid != INVALID_PLAYER_ID && GetPlayerWeapon(issuerid) && bodypart == 7)
		{
			AccountData[playerid][pLFoot] -= bsakit;	
		}
	}
	if(issuerid != INVALID_PLAYER_ID && bodypart == 3 && weaponid >= 22 && weaponid <= 45)
	{
		static Float:x, Float:y, Float:z;
		GetPlayerPos(playerid, x, y, z);
		foreach(new i : Player) if (IsPlayerConnected(i)) if (SQL_IsCharacterLogged(i))
		{
			if(AccountData[i][pFaction] == FACTION_POLISI && AccountData[i][pDutyPD])
			{
				SendClientMessageEx(i, X11_ORANGE1, "[WAR ALERT]"WHITE" Terdeteksi penembakan di daerah %s.", GetLocation(x, y, z));
			}
		}
	}
    return 1;
}

ptask Inspike_Timer[1000](playerid)
{
	if(!AccountData[playerid][pSpawned]) 
		return 0;

	static s_Keys, s_UpDown, s_LeftRight;
    GetPlayerKeys( playerid, s_Keys, s_UpDown, s_LeftRight );

    if ( AccountData[playerid][pFreeze] && ( s_Keys || s_UpDown || s_LeftRight ) )
        return 0;

	CheckPlayerInSpike(playerid);
    return 1;
}

task VehicleUpdate[30000]()
{
	foreach(new i: Vehicle) if (IsEngineVehicle(i) && GetEngineStatus(i))
	{
		if (GetFuel(i) > 0)
		{
			VehicleCore[i][vCoreFuel] --;
			if (GetFuel(i) <= 0)
			{
				SwitchVehicleEngine(i, false);
				VehicleCore[i][vCoreFuel] = 0;
			}
		}
	}
	return 1;
}

timer Vehicle_UpdatePosition[2000](vehicleid)
{
	new
		Float:x,
		Float:y,
		Float:z,
		Float:a
	;

	GetVehiclePos(vehicleid, x, y, z);
	GetVehicleZAngle(vehicleid, a);

	SetVehiclePos(vehicleid, x, y, z);
	SetVehicleZAngle(vehicleid, a);
	return 1;
}

public OnVehicleDamageStatusUpdate(vehicleid, playerid)
{
	new vehicle_index; // Index = Vehicle id ingame, vehicleid = Index DB
    vehicle_index = Vehicle_ReturnID(vehicleid);
    if(vehicle_index != RETURN_INVALID_VEHICLE_ID)
    {
		new panels, doors, lights, tires;
		GetVehicleDamageStatus(PlayerVehicle[vehicle_index][pVehPhysic], panels, doors, lights, tires);
		if(PlayerVehicle[vehicle_index][pVehBodyUpgrade] == 3 && PlayerVehicle[vehicle_index][pVehBodyRepair] > 0)
		{
			panels = doors = lights = tires = 0;
            UpdateVehicleDamageStatus(PlayerVehicle[vehicle_index][pVehPhysic], panels, doors, lights, tires);
			PlayerVehicle[vehicle_index][pVehBodyRepair] -= 50.0;
		}
		else if(PlayerVehicle[vehicle_index][pVehBodyRepair] <= 0)
		{
			PlayerVehicle[vehicle_index][pVehBodyRepair] = 0;
		}
	}
	if(GetPlayerJob(playerid) == JOB_DRIVER_MIXERS){
		if(jobs::mixer[playerid][mixerSlump] > 0 && IsValidVehicle(vehicleid))
		{
			new rand = RandomEx(2,4);
			jobs::mixer[playerid][mixerSlump]-=rand;

			new Float: progressvalue; 
			progressvalue = jobs::mixer[playerid][mixerSlump]*61/100;
			EAGLEUI_SetTextSizePlayer(playerid, jobs::PBMixer[playerid], progressvalue, 13.0);
			EAGLEUI_ShowPlayer(playerid, jobs::PBMixer[playerid]);
		}
	}
	return 1;
}

public OnVehicleStreamOut(vehicleid, forplayerid)
{
	return 1;
}

public OnVehicleStreamIn(vehicleid, forplayerid)
{
	new Float: vhealth;

	AntiCheatGetVehicleHealth(vehicleid, vhealth);
	SetVehicleHealth(vehicleid, vhealth);
	return 1;
}

public OnVehicleSpawn(vehicleid)
{
	defer Vehicle_UpdatePosition(vehicleid);

	for (new vid = 1; vid < sizeof(JobVehicle); vid ++) if (JobVehicle[vid][Vehicle] != INVALID_VEHICLE_ID)
	{
		if (vehicleid == JobVehicle[vid][Vehicle])
		{
			foreach(new i : Player)
			{
				if (AccountData[i][pJobVehicle] == JobVehicle[vid][Vehicle])
				{
					if (AccountData[i][pJobVehicle] != 0)
					{
						DestroyJobVehicle(i);
						AccountData[i][pJobVehicle] = 0;
						break;
					}
				}
			}
		}
	}

	foreach(new i : PvtVehicles) if (vehicleid == PlayerVehicle[i][pVehPhysic] && IsValidVehicle(PlayerVehicle[i][pVehPhysic]))
	{
		if (PlayerVehicle[i][pVehRental] == -1)
		{
			PlayerVehicle[i][pVehInsuranced] = true;
			
			foreach(new pid : Player) if(PlayerVehicle[i][pVehOwnerID] == AccountData[pid][pID])
			{
				Syntax(pid, "Kendaraan anda rusak dan sudah dikirimkan ke Asuransi!");
			}
			
			for (new slot = 0; slot < MAX_VEHICLE_OBJECT; slot ++) if (VehicleObjects[i][slot][vehObjectExists])
			{
				if (VehicleObjects[i][slot][vehObject] != INVALID_STREAMER_ID)
					DestroyDynamicObject(VehicleObjects[i][slot][vehObject]);
				
				VehicleObjects[i][slot][vehObject] = INVALID_STREAMER_ID;
			}

			if (IsValidVehicle(PlayerVehicle[i][pVehPhysic]))
				DestroyVehicle(PlayerVehicle[i][pVehPhysic]);
			
			PlayerVehicle[i][pVehPhysic] = INVALID_VEHICLE_ID;
		}
		else
		{
			PlayerVehicle[i][pVehRental] = -1;
			PlayerVehicle[i][pVehRentTime] = 0;
			PlayerVehicle[i][pVehExists] = false;

			foreach(new pid : Player) if(PlayerVehicle[i][pVehOwnerID] == AccountData[pid][pID])
			{
				Info(pid, "Kendaaraanmu rental anda telah hancur. Anda dikenakan denda sebesar "GREEN"%s!", FormatMoney(PlayerVehicle[i][pVehPrice]/2));
				TakeMoney(pid, (PlayerVehicle[i][pVehPrice]/2));
			}

			if(IsValidVehicle(PlayerVehicle[i][pVehPhysic])) 
			{
				DestroyVehicle(PlayerVehicle[i][pVehPhysic]);
				PlayerVehicle[i][pVehPhysic] = INVALID_VEHICLE_ID;
			}

			new cQuery[200];
			mysql_format(g_SQL, cQuery, sizeof(cQuery), "DELETE FROM `player_vehicles` WHERE `id` = '%d'", PlayerVehicle[i][pVehID]);
			mysql_tquery(g_SQL, cQuery);

			Vehicle_ResetVariable(i);
			Iter_Remove(PvtVehicles, i);
		}
	}

	//ini untuk menghapus kendaraan yang dispawn oleh admin
	if(VehicleCore[vehicleid][vehAdmin])
	{
		DestroyVehicle(VehicleCore[vehicleid][vehAdminPhysic]);
		VehicleCore[vehicleid][vehAdminPhysic] = INVALID_VEHICLE_ID;
		VehicleCore[vehicleid][vehAdmin] = false;
	}
	return 1;
}

public OnVehicleSirenStateChange(playerid, vehicleid, newstate)
{
	if(newstate)
	{
		SwitchVehicleLight(vehicleid, true);
		vehicleid = GetPlayerVehicleID(playerid);
		
		foreach(new i : PvtVehicles)
		{
			if(vehicleid == PlayerVehicle[i][pVehPhysic])
			{
				if(PlayerVehicle[i][pVehFaction] != FACTION_POLISI && PlayerVehicle[i][pVehFaction] != FACTION_EMS) 
					return 0;

				gToggleELM[vehicleid] = true;
				gELMTimer[vehicleid] = SetTimerEx("ToggleELM", 80, true, "d", vehicleid);
			}
		}
	}
	else 
	{
		static panels, doors, lights, tires;

		gToggleELM[vehicleid] = false;
		KillTimer(gELMTimer[vehicleid]);

		GetVehicleDamageStatus(vehicleid, panels, doors, lights, tires);
		UpdateVehicleDamageStatus(vehicleid, panels, doors, 0, tires);
	}
	return 1;
}

hook OnVehicleCreated(vehicleid)
{
	TrunkVehEntered[vehicleid] = INVALID_PLAYER_ID;
	return 1;
}

hook OnVehicleDestroyed(vehicleid)
{
	new index = -1;
    //new playerid = GetVehicleDriver(vehicleid);
	if((index = Vehicle_GetID(vehicleid)) != -1)
	{
		if(PlayerVehicle[index][vehSirenOn])
		{
			PlayerVehicle[index][vehSirenOn] = false;
			if(IsValidDynamicObject(PlayerVehicle[index][vehSirenObject]))
			{
				DestroyDynamicObject(PlayerVehicle[index][vehSirenObject]);
				PlayerVehicle[index][vehSirenObject] = INVALID_STREAMER_ID;
			}
		}

		if(IsBagasiOpened[PlayerVehicle[index][pVehPhysic]])
		{
			IsBagasiOpened[PlayerVehicle[index][pVehPhysic]] = false;
		}

		if(TrunkVehEntered[PlayerVehicle[index][pVehPhysic]] != INVALID_PLAYER_ID)
		{
			new Float:x, Float:y, Float:z;
			GetVehicleBoot(vehicleid, x, y, z);
			PlayerSpectateVehicle(TrunkVehEntered[PlayerVehicle[index][pVehPhysic]], INVALID_VEHICLE_ID);

			SetSpawnInfo(TrunkVehEntered[PlayerVehicle[index][pVehPhysic]], 0, AccountData[TrunkVehEntered[PlayerVehicle[index][pVehPhysic]]][pSkin], x, y, z, 0.0, 0, 0, 0, 0, 0, 0);
			TogglePlayerSpectating(TrunkVehEntered[PlayerVehicle[index][pVehPhysic]], false);
			SetPVarInt(TrunkVehEntered[PlayerVehicle[index][pVehPhysic]], "PlayerInTrunk", 0);
			AccountData[TrunkVehEntered[PlayerVehicle[index][pVehPhysic]]][pTempVehID] = INVALID_VEHICLE_ID;
			TrunkVehEntered[PlayerVehicle[index][pVehPhysic]] = INVALID_PLAYER_ID;
		}

		for (new slot = 0; slot < MAX_VEHICLE_OBJECT; slot ++) if (VehicleObjects[index][slot][vehObjectExists])
		{
			if (VehicleObjects[index][slot][vehObject] != INVALID_STREAMER_ID)
				DestroyDynamicObject(VehicleObjects[index][slot][vehObject]);
			
			VehicleObjects[index][slot][vehObject] = INVALID_STREAMER_ID;
		}
		
		PlayerVehicle[index][pVehPhysic] = INVALID_VEHICLE_ID;
	}

	if(gToggleELM[vehicleid])
	{
		gToggleELM[vehicleid] = false;
		KillTimer(gELMTimer[vehicleid]);
	}
	foreach(new playerid : Player)
	{
		if(jobs::mixer[playerid][mixerVehicle] == vehicleid)
		{
			if(jobs::mixer[playerid][mixerDuty][0] && IsValidVehicle(jobs::mixer[playerid][mixerVehicle]))
			{
				for(new i; i<3; i++)
				{
					EAGLEUI_HideGlobalForPlayer(playerid, jobs::GBMixer[i]);
				}
				EAGLEUI_HidePlayer(playerid, jobs::PBMixer[playerid]);
				jobs::mixer_reset_enum(playerid);
				ShowTDN(playerid, NOTIFICATION_WARNING, "Anda gagal mengirimkan beton karena kendaraan anda hancur!");
			}
		}
	}
	return 1;
}

public OnPlayerExitVehicle(playerid, vehicleid)
{
	if(AccountData[playerid][pTogAutoEngine] && !IsABicycle(vehicleid))
	{
		if(GetPlayerState(playerid) == PLAYER_STATE_DRIVER)
		{
			if(GetEngineStatus(vehicleid)) 
			{
				AccountData[playerid][pTempVehID] = vehicleid;
				SetTimerEx("EngineTurnOff", 1500, false, "dd", playerid, vehicleid);
			}
		}
	}
	return 1;
}

forward EngineTurnOff(playerid, vehicleid);
public EngineTurnOff(playerid, vehicleid)
{
	if(AccountData[playerid][pTempVehID] == vehicleid)
	{
		SwitchVehicleEngine(vehicleid, false);
		SendRPMeAboveHead(playerid, "Mesin mati", X11_LIGHTGREEN);	
	
		AccountData[playerid][pTempVehID] = INVALID_VEHICLE_ID;
	}
	return 1;
}

public OnPlayerClickMap(playerid, Float:fX, Float:fY, Float:fZ)
{
   	if((AccountData[playerid][pAdmin] >= 1 || AccountData[playerid][pTheStars] >= 1) && AccountData[playerid][pAdminDuty] == 1)
    {
        new vehicleid = GetPlayerVehicleID(playerid);
        if(vehicleid > 0 && GetPlayerState(playerid) == PLAYER_STATE_DRIVER)
        {
            SetVehiclePos(vehicleid, fX, fY, fZ+10);
        }
        else
        {
            SetPlayerPosFindZ(playerid, fX, fY, 999.0);
            SetPlayerVirtualWorld(playerid, 0);
            SetPlayerInterior(playerid, 0);
        }
    }

	if(AccountData[playerid][pAdmin] >= 1 || AccountData[playerid][pTheStars] >= 1)
	{
		new vehicleid = GetPlayerVehicleID(playerid);
		if(vehicleid > 0 && GetPlayerState(playerid) == PLAYER_STATE_DRIVER)
		{
			SetPVarFloat(playerid, "tpX", fX);
			SetPVarFloat(playerid, "tpY", fY);
			SetPVarFloat(playerid, "tpZ", fZ + 5.0);
		}
		else 
		{
			SetPVarFloat(playerid, "tpX", fX);
			SetPVarFloat(playerid, "tpY", fY);
			SetPVarFloat(playerid, "tpZ", fZ);
		}
	}
    return 1;
}

Dialog:DOKUMENT_MENU(playerid, response, listitem, inputtext[])
{
	if (!response)
	{
		return ShowTDN(playerid, NOTIFICATION_INFO, "Anda telah membatalkan pilihan");
	}

	switch(listitem)
	{
		case 1: // lihat ktp
		{
			if(!AccountData[playerid][Ktp]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak memiliki KTP!");
			ShowKTPTD(playerid);
		}
		case 2: // Tunjukan KTP
		{
			if(!AccountData[playerid][Ktp]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak memiliki KTP!");
			foreach(new i : Player) if (IsPlayerConnected(i)) if (i != playerid)
			{
				if(IsPlayerNearPlayer(playerid, i, 3.0))
				{
					ShowMyKTPTD(playerid, i);
				}
			}
		}
		case 3: // Lihat SIM
		{
			DisplayLicensi(playerid, playerid);
		}
		case 4: // Tunjukan SIM
		{
			foreach(new i : Player) if (IsPlayerConnected(i)) if (i != playerid)
			{
				if(IsPlayerNearPlayer(playerid, i, 3.0))
				{
					DisplayLicensi(i, playerid);
				}
			}
		}
		case 5: // Lihat SKWB
		{
			if (!AccountData[playerid][pSKWB]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak memiliki SKWB!");

			DisplaySKWB(playerid, playerid);
		}
		case 6: // tunjukan SKWB
		{
			if(!AccountData[playerid][pSKWB]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak memiliki SKWB!");
			
			foreach(new i : Player) if (IsPlayerConnected(i))
			{
				if(IsPlayerNearPlayer(playerid, i, 3.0))
				{
					DisplaySKWB(playerid, i);
				}
			}
		}

		case 8: //lihat bpjs
		{
			if(!AccountData[playerid][pBPJS]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak memiliki BPJS/Expired!");
			DisplayBPJS(playerid, playerid);
		}
		case 9: //tunjukan bpjs
		{
			if(!AccountData[playerid][pBPJS]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak memiliki BPJS/Expired!");
			foreach(new i : Player) if (IsPlayerConnected(i)) if (i != playerid)
			{   
				if(IsPlayerNearPlayer(playerid, i, 3.0))
				{
					DisplayBPJS(i, playerid);
				}
			}
		}
		case 10: //lihat skck
		{
			if(!AccountData[playerid][pSKCK]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak memiliki SKCK/Expired!");
			DisplaySKCK(playerid, playerid);
		}
		case 11: //tunjuk skck
		{
			if(!AccountData[playerid][pSKCK]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak memiliki SKCK/Expired!");
			foreach(new i : Player) if (IsPlayerConnected(i)) if (i != playerid)
			{   
				if(IsPlayerNearPlayer(playerid, i, 3.0))
				{
					DisplaySKCK(i, playerid);
				}
			}
		}
		case 12: //lihat sks
		{
			if(!AccountData[playerid][pSKS]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak memiliki Surat Keterangan Sehat/Expired!");
			DisplaySKS(playerid, playerid);
		}
		case 13: //tunjuk sks
		{
			if(!AccountData[playerid][pSKS]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak memiliki Surat Keterangan Sehat/Expired!");
			foreach(new i : Player) if (IsPlayerConnected(i)) if (i != playerid)
			{   
				if(IsPlayerNearPlayer(playerid, i, 3.0))
				{
					DisplaySKS(i, playerid);
				}
			}
		}
	}
	return 1;
}

public OnCEFUIGlobalClick(playerid, textid)
{
	if(textid == Althaf_UpdateTD[6])
	{
		HideAlthafUpdate(playerid);
		AllGui_Status(playerid, true);
	}
	// New Clothing Menu
	if(textid == ClothesSelect[55]) // Batal
    {
        ShowTDN(playerid, NOTIFICATION_INFO, "Anda membatalkan pilihan");
        SetCameraBehindPlayer(playerid);
        TogglePlayerControllable(playerid, 1);
        if (AccountData[playerid][pUsingUniform])
		{
  			SetPlayerSkin(playerid, AccountData[playerid][pUniform]);
  		}
    	else
     	{
      		SetPlayerSkin(playerid, AccountData[playerid][pSkin]);
      	}
      	BuyClothes[playerid] = 0;
      	BuyTopi[playerid] = 0;
      	BuyGlasses[playerid] = 0;
      	BuyTAksesoris[playerid] = 0;
      	BuyBackpack[playerid] = 0;
      	CSelect[playerid] = 0;
       	SelectAccTopi[playerid] = 0;
       	SelectAccGlasses[playerid] = 0;
       	SelectAccAksesoris[playerid] = 0;
       	SelectAccBackpack[playerid] = 0;
        AttachPlayerToys(playerid);
        RemovePlayerAttachedObject(playerid, 9);
        for(new txd = 0; txd < 84; txd++)
		{
			EAGLEUI_HideGlobalForPlayer(playerid, ClothesSelect[txd]);
		}
		for(new txd = 0; txd < 20; txd++)
		{
			EAGLEUI_HidePlayer(playerid, ClothesPlayerSelect[playerid][txd]);
		}
        PlayerPlaySound(playerid, 1053, 0, 0, 0);
        EAGLEUI_Cancel(playerid);
    }
    if(textid == ClothesSelect[53]) // camera
    {
        if(takingclothes[playerid] == 0)
		{
		    static Float:X, Float:Y, Float:Z, Float:A;
			GetPlayerPos(playerid, X, Y, Z);
			GetPlayerFacingAngle(playerid, A);
			SetPlayerCameraPos(playerid, X, Y + 2.5, Z - 0.25);
			SetPlayerCameraLookAt(playerid, X, Y - 1.0, Z + 0.15);
			SetPlayerFacingAngle(playerid, 357.9849);
			takingclothes[playerid] = 1;
			return 1;
		}
	    if(takingclothes[playerid] == 1)
		{
			new Float:x, Float:y, Float:z, Float:angle;
		    GetPlayerPos(playerid, x, y, z);
		    GetPlayerFacingAngle(playerid, angle);

		    new Float:camX = x + 5.0 * floatsin(-angle, degrees);
		    new Float:camY = y + 5.0 * floatcos(-angle, degrees);
		    new Float:camZ = z + 0.5;

		    SetPlayerCameraPos(playerid, camX, camY, camZ);
		    SetPlayerCameraLookAt(playerid, x, y, z);

		    takingclothes[playerid] = 0;
		    return 1;
		}
    }
    if(textid == ClothesSelect[54]) // Beli Clothes
    {
        for(new txd = 0; txd < 8; txd++)
		{
			EAGLEUI_ShowPlayer(playerid, ConfirmBuyTD[playerid][txd]);
		}
		EAGLEUI_Select(playerid, COLOR_ALTHF);
        PlayerPlaySound(playerid, 1053, 0, 0, 0);
    }
	if(textid == ClothesSelect[33])//prev pakaian male
	{
	    if(AccountData[playerid][pGender] == 1)
		{
		    CSelect[playerid] --;
	    	BuyClothes[playerid] = 1;
	    	BuyTopi[playerid] = 0;
	    	BuyGlasses[playerid] = 0;
	    	BuyTAksesoris[playerid] = 0;
	    	BuyBackpack[playerid] = 0;
	 		if(CSelect[playerid] <= -1) CSelect[playerid] = (AccountData[playerid][pGender] == 1 ? sizeof ClothesSkinMale  : sizeof ClothesSkinFemale) - 1;
	       	SetPlayerSkin(playerid, ClothesSkinMale[CSelect[playerid]]);
			static minsty[128];
	  		format(minsty, sizeof minsty, "%02d/%d", CSelect[playerid] + 1, ((AccountData[playerid][pGender] == 1) ? sizeof(ClothesSkinMale) : sizeof(ClothesSkinFemale)));
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][1], minsty);
	    	static minstys[128];
	  		format(minstys, sizeof minstys, "%02d", CSelect[playerid] + 1);
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][0], minstys);
    	}
	}
	if(textid == ClothesSelect[34])//next pakaian male
	{
	    if(AccountData[playerid][pGender] == 1)
		{
		 	CSelect[playerid] ++;
		 	BuyClothes[playerid] = 1;
	  		BuyTopi[playerid] = 0;
		   	BuyGlasses[playerid] = 0;
		   	BuyTAksesoris[playerid] = 0;
		   	BuyBackpack[playerid] = 0;
		 	if(AccountData[playerid][pGender] == 1 && CSelect[playerid] >= sizeof ClothesSkinMale) CSelect[playerid] = 0;
	       	SetPlayerSkin(playerid, ClothesSkinMale[CSelect[playerid]]);
			static minsty[128];
	  		format(minsty, sizeof minsty, "%02d/%d", CSelect[playerid] + 1, ((AccountData[playerid][pGender] == 1) ? sizeof(ClothesSkinMale) : sizeof(ClothesSkinFemale)));
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][1], minsty);
	    	static minstys[128];
	  		format(minstys, sizeof minstys, "%02d", CSelect[playerid] + 1);
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][0], minstys);
		}
	}
	if(textid == ClothesSelect[35])//prev pakaian female
	{
	    if(AccountData[playerid][pGender] == 2)
		{
	 		CSelect[playerid] --;
	 		BuyClothes[playerid] = 1;
	  		BuyTopi[playerid] = 0;
		   	BuyGlasses[playerid] = 0;
		   	BuyTAksesoris[playerid] = 0;
		   	BuyBackpack[playerid] = 0;
	 		if(CSelect[playerid] <= -1) CSelect[playerid] = (AccountData[playerid][pGender] == 1 ? sizeof ClothesSkinMale  : sizeof ClothesSkinFemale) - 1;
	       	SetPlayerSkin(playerid, ClothesSkinFemale[CSelect[playerid]]);
			static minsty[128];
	  		format(minsty, sizeof minsty, "%02d/%d", CSelect[playerid] + 1, ((AccountData[playerid][pGender] == 1) ? sizeof(ClothesSkinMale) : sizeof(ClothesSkinFemale)));
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][2], minsty);
	    	static minstys[128];
	  		format(minstys, sizeof minstys, "%02d", CSelect[playerid] + 1);
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][11], minstys);
    	}
	}
	if(textid == ClothesSelect[36])//next pakaian female
	{
	    if(AccountData[playerid][pGender] == 2)
		{
	 		CSelect[playerid] ++;
	 		BuyClothes[playerid] = 1;
	  		BuyTopi[playerid] = 0;
		   	BuyGlasses[playerid] = 0;
		   	BuyTAksesoris[playerid] = 0;
		   	BuyBackpack[playerid] = 0;
	 		if(AccountData[playerid][pGender] == 2 && CSelect[playerid] >= sizeof ClothesSkinFemale) CSelect[playerid] = 0;
	       	SetPlayerSkin(playerid, ClothesSkinFemale[CSelect[playerid]]);
			static minsty[128];
	  		format(minsty, sizeof minsty, "%02d/%d", CSelect[playerid] + 1, ((AccountData[playerid][pGender] == 1) ? sizeof(ClothesSkinMale) : sizeof(ClothesSkinFemale)));
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][2], minsty);
	    	static minstys[128];
	  		format(minstys, sizeof minstys, "%02d", CSelect[playerid] + 1);
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][11], minstys);
    	}
	}
	if(textid == ClothesSelect[37])//prev topi/helm male
	{
	    if(AccountData[playerid][pGender] == 1)
		{
	 		SelectAccTopi[playerid] --;
	     	BuyClothes[playerid] = 0;
	  		BuyTopi[playerid] = 1;
		   	BuyGlasses[playerid] = 0;
		   	BuyTAksesoris[playerid] = 0;
		   	BuyBackpack[playerid] = 0;
		   	if(SelectAccTopi[playerid] <= -1) SelectAccTopi[playerid] = sizeof (AksesorisHat) - 1;
			SetPlayerAttachedObject(playerid, 9, AksesorisHat[SelectAccTopi[playerid]], 2, 0.269, 0.000, 0.000, 0.000, 0.000, 0.000, 1.000, 1.000, 1.000);
	  		static minsty[128];
	    	format(minsty, sizeof minsty, "%02d/%d", SelectAccTopi[playerid] + 1, sizeof(AksesorisHat));
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][3], minsty);
	    	static minstys[128];
	    	format(minstys, sizeof minstys, "%02d", SelectAccTopi[playerid] + 1);
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][12], minstys);
    	}
	}
	if(textid == ClothesSelect[38])//next topi/helm male
	{
	    if(AccountData[playerid][pGender] == 1)
		{
			SelectAccTopi[playerid] ++;
	     	BuyClothes[playerid] = 0;
	  		BuyTopi[playerid] = 1;
		   	BuyGlasses[playerid] = 0;
		   	BuyTAksesoris[playerid] = 0;
		   	BuyBackpack[playerid] = 0;
		   	if(SelectAccTopi[playerid] >= sizeof AksesorisHat) SelectAccTopi[playerid] = 0;
			SetPlayerAttachedObject(playerid, 9, AksesorisHat[SelectAccTopi[playerid]], 2, 0.269, 0.000, 0.000, 0.000, 0.000, 0.000, 1.000, 1.000, 1.000);
	  		static minsty[128];
	    	format(minsty, sizeof minsty, "%02d/%d", SelectAccTopi[playerid] + 1, sizeof(AksesorisHat));
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][3], minsty);
	    	static minstys[128];
	    	format(minstys, sizeof minstys, "%02d", SelectAccTopi[playerid] + 1);
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][12], minstys);
    	}
	}
	if(textid == ClothesSelect[39])//prev topi/helm female
	{
	    if(AccountData[playerid][pGender] == 2)
		{
	 		SelectAccTopi[playerid] --;
	     	BuyClothes[playerid] = 0;
	  		BuyTopi[playerid] = 1;
		   	BuyGlasses[playerid] = 0;
		   	BuyTAksesoris[playerid] = 0;
		   	BuyBackpack[playerid] = 0;
		   	if(SelectAccTopi[playerid] <= -1) SelectAccTopi[playerid] = sizeof (AksesorisHat) - 1;
			SetPlayerAttachedObject(playerid, 9, AksesorisHat[SelectAccTopi[playerid]], 2, 0.269, 0.000, 0.000, 0.000, 0.000, 0.000, 1.000, 1.000, 1.000);
	  		static minsty[128];
	    	format(minsty, sizeof minsty, "%02d/%d", SelectAccTopi[playerid] + 1, sizeof(AksesorisHat));
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][4], minsty);
	    	static minstys[128];
	    	format(minstys, sizeof minstys, "%02d", SelectAccTopi[playerid] + 1);
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][13], minstys);
    	}
	}
	if(textid == ClothesSelect[40])//next topi/helm female
	{
	    if(AccountData[playerid][pGender] == 2)
		{
			SelectAccTopi[playerid] ++;
	     	BuyClothes[playerid] = 0;
	  		BuyTopi[playerid] = 1;
		   	BuyGlasses[playerid] = 0;
		   	BuyTAksesoris[playerid] = 0;
		   	BuyBackpack[playerid] = 0;
		   	if(SelectAccTopi[playerid] >= sizeof AksesorisHat) SelectAccTopi[playerid] = 0;
			SetPlayerAttachedObject(playerid, 9, AksesorisHat[SelectAccTopi[playerid]], 2, 0.269, 0.000, 0.000, 0.000, 0.000, 0.000, 1.000, 1.000, 1.000);
	  		static minsty[128];
	    	format(minsty, sizeof minsty, "%02d/%d", SelectAccTopi[playerid] + 1, sizeof(AksesorisHat));
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][4], minsty);
	    	static minstys[128];
	    	format(minstys, sizeof minstys, "%02d", SelectAccTopi[playerid] + 1);
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][13], minstys);
    	}
	}
	if(textid == ClothesSelect[41])//prev kacamata male
	{
	    if(AccountData[playerid][pGender] == 1)
		{
	 		SelectAccGlasses[playerid] --;
	     	BuyClothes[playerid] = 0;
	  		BuyTopi[playerid] = 0;
		   	BuyGlasses[playerid] = 1;
		   	BuyTAksesoris[playerid] = 0;
		   	BuyBackpack[playerid] = 0;
	   		if(SelectAccGlasses[playerid] <= -1) SelectAccGlasses[playerid] = sizeof (GlassesToys) - 1;
			SetPlayerAttachedObject(playerid, 9, GlassesToys[SelectAccGlasses[playerid]], 2, 0.269, 0.000, 0.000, 0.000, 0.000, 0.000, 1.000, 1.000, 1.000);
	  		static minsty[128];
	    	format(minsty, sizeof minsty, "%02d/%d", SelectAccGlasses[playerid] + 1, sizeof(GlassesToys));
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][5], minsty);
	    	static minstys[128];
	    	format(minstys, sizeof minstys, "%02d", SelectAccGlasses[playerid] + 1);
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][14], minstys);
    	}
	}
	if(textid == ClothesSelect[42])//next kacamata male
	{
	    if(AccountData[playerid][pGender] == 1)
		{
			SelectAccGlasses[playerid] ++;
	     	BuyClothes[playerid] = 0;
	  		BuyTopi[playerid] = 0;
		   	BuyGlasses[playerid] = 1;
		   	BuyTAksesoris[playerid] = 0;
		   	BuyBackpack[playerid] = 0;
		   	if(SelectAccGlasses[playerid] >= sizeof GlassesToys) SelectAccGlasses[playerid] = 0;
			SetPlayerAttachedObject(playerid, 9, GlassesToys[SelectAccGlasses[playerid]], 2, 0.269, 0.000, 0.000, 0.000, 0.000, 0.000, 1.000, 1.000, 1.000);
	  		static minsty[128];
	    	format(minsty, sizeof minsty, "%02d/%d", SelectAccGlasses[playerid] + 1, sizeof(GlassesToys));
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][5], minsty);
	    	static minstys[128];
	    	format(minstys, sizeof minstys, "%02d", SelectAccGlasses[playerid] + 1);
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][14], minstys);
    	}
	}
	if(textid == ClothesSelect[43])//prev kacamata female
	{
	    if(AccountData[playerid][pGender] == 2)
		{
	 		SelectAccGlasses[playerid] --;
	     	BuyClothes[playerid] = 0;
	  		BuyTopi[playerid] = 0;
		   	BuyGlasses[playerid] = 1;
		   	BuyTAksesoris[playerid] = 0;
		   	BuyBackpack[playerid] = 0;
		   	if(SelectAccGlasses[playerid] <= -1) SelectAccGlasses[playerid] = sizeof (GlassesToys) - 1;
			SetPlayerAttachedObject(playerid, 9, GlassesToys[SelectAccGlasses[playerid]], 2, 0.269, 0.000, 0.000, 0.000, 0.000, 0.000, 1.000, 1.000, 1.000);
	  		static minsty[128];
	    	format(minsty, sizeof minsty, "%02d/%d", SelectAccGlasses[playerid] + 1, sizeof(GlassesToys));
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][6], minsty);
	    	static minstys[128];
	    	format(minstys, sizeof minstys, "%02d", SelectAccGlasses[playerid] + 1);
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][15], minstys);
    	}
	}
	if(textid == ClothesSelect[44])//next kacamata female
	{
	    if(AccountData[playerid][pGender] == 2)
		{
			SelectAccGlasses[playerid] ++;
	     	BuyClothes[playerid] = 0;
	  		BuyTopi[playerid] = 0;
		   	BuyGlasses[playerid] = 1;
		   	BuyTAksesoris[playerid] = 0;
		   	BuyBackpack[playerid] = 0;
		   	if(SelectAccGlasses[playerid] >= sizeof GlassesToys) SelectAccGlasses[playerid] = 0;
			SetPlayerAttachedObject(playerid, 9, GlassesToys[SelectAccGlasses[playerid]], 2, 0.269, 0.000, 0.000, 0.000, 0.000, 0.000, 1.000, 1.000, 1.000);
	  		static minsty[128];
	    	format(minsty, sizeof minsty, "%02d/%d", SelectAccGlasses[playerid] + 1, sizeof(GlassesToys));
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][6], minsty);
	    	static minstys[128];
	    	format(minstys, sizeof minstys, "%02d", SelectAccGlasses[playerid] + 1);
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][15], minstys);
    	}
	}
	if(textid == ClothesSelect[45])//prev aksesoris male
	{
	    if(AccountData[playerid][pGender] == 1)
		{
	 		SelectAccAksesoris[playerid] --;
	     	BuyClothes[playerid] = 0;
	  		BuyTopi[playerid] = 0;
		   	BuyGlasses[playerid] = 0;
		   	BuyTAksesoris[playerid] = 1;
		   	BuyBackpack[playerid] = 0;
		   	if(SelectAccAksesoris[playerid] <= -1) SelectAccAksesoris[playerid] = sizeof (AksesorisToys) - 1;
			SetPlayerAttachedObject(playerid, 9, AksesorisToys[SelectAccAksesoris[playerid]], 2, 0.269, 0.000, 0.000, 0.000, 0.000, 0.000, 1.000, 1.000, 1.000);
	  		static minsty[128];
	    	format(minsty, sizeof minsty, "%02d/%d", SelectAccAksesoris[playerid] + 1, sizeof(AksesorisToys));
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][7], minsty);
	    	static minstys[128];
	    	format(minstys, sizeof minstys, "%02d", SelectAccAksesoris[playerid] + 1);
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][16], minstys);
    	}
	}
	if(textid == ClothesSelect[46])//next aksesoris male
	{
	    if(AccountData[playerid][pGender] == 1)
		{
			SelectAccAksesoris[playerid] ++;
	     	BuyClothes[playerid] = 0;
	  		BuyTopi[playerid] = 0;
		   	BuyGlasses[playerid] = 0;
		   	BuyTAksesoris[playerid] = 1;
		   	BuyBackpack[playerid] = 0;
		   	if(SelectAccAksesoris[playerid] >= sizeof AksesorisToys) SelectAccAksesoris[playerid] = 0;
			SetPlayerAttachedObject(playerid, 9, AksesorisToys[SelectAccAksesoris[playerid]], 2, 0.269, 0.000, 0.000, 0.000, 0.000, 0.000, 1.000, 1.000, 1.000);
	  		static minsty[128];
	    	format(minsty, sizeof minsty, "%02d/%d", SelectAccAksesoris[playerid] + 1, sizeof(AksesorisToys));
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][7], minsty);
	    	static minstys[128];
	    	format(minstys, sizeof minstys, "%02d", SelectAccAksesoris[playerid] + 1);
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][16], minstys);
    	}
	}
	if(textid == ClothesSelect[47])//prev aksesoris female
	{
	    if(AccountData[playerid][pGender] == 2)
		{
	 		SelectAccAksesoris[playerid] --;
	     	BuyClothes[playerid] = 0;
	  		BuyTopi[playerid] = 0;
		   	BuyGlasses[playerid] = 0;
		   	BuyTAksesoris[playerid] = 1;
		   	BuyBackpack[playerid] = 0;
		   	if(SelectAccAksesoris[playerid] <= -1) SelectAccAksesoris[playerid] = sizeof (AksesorisToys) - 1;
			SetPlayerAttachedObject(playerid, 9, AksesorisToys[SelectAccAksesoris[playerid]], 2, 0.269, 0.000, 0.000, 0.000, 0.000, 0.000, 1.000, 1.000, 1.000);
	  		static minsty[128];
	    	format(minsty, sizeof minsty, "%02d/%d", SelectAccAksesoris[playerid] + 1, sizeof(AksesorisToys));
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][8], minsty);
	    	static minstys[128];
	    	format(minstys, sizeof minstys, "%02d", SelectAccAksesoris[playerid] + 1);
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][17], minstys);
    	}
	}
	if(textid == ClothesSelect[48])//next aksesoris female
	{
	    if(AccountData[playerid][pGender] == 2)
		{
			SelectAccAksesoris[playerid] ++;
	     	BuyClothes[playerid] = 0;
	  		BuyTopi[playerid] = 0;
		   	BuyGlasses[playerid] = 0;
		   	BuyTAksesoris[playerid] = 1;
		   	BuyBackpack[playerid] = 0;
		   	if(SelectAccAksesoris[playerid] >= sizeof AksesorisToys) SelectAccAksesoris[playerid] = 0;
			SetPlayerAttachedObject(playerid, 9, AksesorisToys[SelectAccAksesoris[playerid]], 2, 0.269, 0.000, 0.000, 0.000, 0.000, 0.000, 1.000, 1.000, 1.000);
	  		static minsty[128];
	    	format(minsty, sizeof minsty, "%02d/%d", SelectAccAksesoris[playerid] + 1, sizeof(AksesorisToys));
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][8], minsty);
	    	static minstys[128];
	    	format(minstys, sizeof minstys, "%02d", SelectAccAksesoris[playerid] + 1);
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][17], minstys);
    	}
	}
	if(textid == ClothesSelect[49])//prev tas male
	{
	    if(AccountData[playerid][pGender] == 1)
		{
	 		SelectAccBackpack[playerid] --;
	     	BuyClothes[playerid] = 0;
	  		BuyTopi[playerid] = 0;
		   	BuyGlasses[playerid] = 0;
		   	BuyTAksesoris[playerid] = 0;
		   	BuyBackpack[playerid] = 1;
		   	if(SelectAccBackpack[playerid] <= -1) SelectAccBackpack[playerid] = sizeof (BackpackToys) - 1;
			SetPlayerAttachedObject(playerid, 9, BackpackToys[SelectAccBackpack[playerid]], 2, 0.269, 0.000, 0.000, 0.000, 0.000, 0.000, 1.000, 1.000, 1.000);
	  		static minsty[128];
	    	format(minsty, sizeof minsty, "%02d/%d", SelectAccBackpack[playerid] + 1, sizeof(BackpackToys));
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][9], minsty);
	    	static minstys[128];
	    	format(minstys, sizeof minstys, "%02d", SelectAccBackpack[playerid] + 1);
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][18], minstys);
    	}
	}
	if(textid == ClothesSelect[50])//next tas male
	{
	    if(AccountData[playerid][pGender] == 1)
		{
			SelectAccBackpack[playerid] ++;
	     	BuyClothes[playerid] = 0;
	  		BuyTopi[playerid] = 0;
		   	BuyGlasses[playerid] = 0;
		   	BuyTAksesoris[playerid] = 0;
		   	BuyBackpack[playerid] = 1;
		   	if(SelectAccBackpack[playerid] >= sizeof BackpackToys) SelectAccBackpack[playerid] = 0;
			SetPlayerAttachedObject(playerid, 9, BackpackToys[SelectAccBackpack[playerid]], 2, 0.269, 0.000, 0.000, 0.000, 0.000, 0.000, 1.000, 1.000, 1.000);
	  		static minsty[128];
	    	format(minsty, sizeof minsty, "%02d/%d", SelectAccBackpack[playerid] + 1, sizeof(BackpackToys));
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][9], minsty);
	    	static minstys[128];
	    	format(minstys, sizeof minstys, "%02d", SelectAccBackpack[playerid] + 1);
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][18], minstys);
    	}
	}
	if(textid == ClothesSelect[51])//prev tas female
	{
	    if(AccountData[playerid][pGender] == 2)
		{
	 		SelectAccBackpack[playerid] --;
	     	BuyClothes[playerid] = 0;
	  		BuyTopi[playerid] = 0;
		   	BuyGlasses[playerid] = 0;
		   	BuyTAksesoris[playerid] = 0;
		   	BuyBackpack[playerid] = 1;
		   	if(SelectAccBackpack[playerid] <= -1) SelectAccBackpack[playerid] = sizeof (BackpackToys) - 1;
			SetPlayerAttachedObject(playerid, 9, BackpackToys[SelectAccBackpack[playerid]], 2, 0.269, 0.000, 0.000, 0.000, 0.000, 0.000, 1.000, 1.000, 1.000);
	  		static minsty[128];
	    	format(minsty, sizeof minsty, "%02d/%d", SelectAccBackpack[playerid] + 1, sizeof(BackpackToys));
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][10], minsty);
	    	static minstys[128];
	    	format(minstys, sizeof minstys, "%02d", SelectAccBackpack[playerid] + 1);
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][19], minstys);
    	}
	}
	if(textid == ClothesSelect[52])//next tas female
	{
	    if(AccountData[playerid][pGender] == 2)
		{
			SelectAccBackpack[playerid] ++;
	     	BuyClothes[playerid] = 0;
	  		BuyTopi[playerid] = 0;
		   	BuyGlasses[playerid] = 0;
		   	BuyTAksesoris[playerid] = 0;
		   	BuyBackpack[playerid] = 1;
		   	if(SelectAccBackpack[playerid] >= sizeof BackpackToys) SelectAccBackpack[playerid] = 0;
			SetPlayerAttachedObject(playerid, 9, BackpackToys[SelectAccBackpack[playerid]], 2, 0.269, 0.000, 0.000, 0.000, 0.000, 0.000, 1.000, 1.000, 1.000);
	  		static minsty[128];
	    	format(minsty, sizeof minsty, "%02d/%d", SelectAccBackpack[playerid] + 1, sizeof(BackpackToys));
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][10], minsty);
	    	static minstys[128];
	    	format(minstys, sizeof minstys, "%02d", SelectAccBackpack[playerid] + 1);
	    	EAGLEUI_SetStringPlayer(playerid, ClothesPlayerSelect[playerid][19], minstys);
    	}
	}
	return 1;
}

public OnCEFUIPlayerClick(playerid, textid)
{
	// Login/register are native SA-MP dialogs. No CEF auth UI is used here.
	// Emote Sistem New
	if(textid == EmoteMenu[playerid][4])
	{
	    new i;
	    forex(is, 18)
		{
            EAGLEUI_HidePlayer(playerid, EmoteMenu[playerid][is]);
        }
        for(i = 0; i < 35; i++) 
		{
            if(i < 19 || i > 28) 
			{
                //new totalAnimDetails = sizeof(g_AnimDetails);
                EAGLEUI_ShowPlayer(playerid, emoteList[playerid][i]);
                EAGLEUI_SetStringPlayer(playerid, emoteList[playerid][6], va_return("%d / 18", animPage[playerid]));
            } 
			else 
			{
                if(i - 19 < 10) 
				{
                    EAGLEUI_SetStringPlayer(playerid, emoteList[playerid][i], g_AnimDetails[i - 19][e_AnimationName]);
                    EAGLEUI_ShowPlayer(playerid, emoteList[playerid][i]);
                }
            }
        }
        animPage[playerid] = 1;
        EAGLEUI_Select(playerid, -1);
	}
	if(textid == EmoteMenu[playerid][5])
	{
	    forex(i, 18)
		{
            EAGLEUI_HidePlayer(playerid, EmoteMenu[playerid][i]);
        }
	    callcmd::epropmenu(playerid, "");
	}
	if(textid == EmoteMenu[playerid][6])//share animasi
	{
	}
	if(textid == EmoteMenu[playerid][7])
	{
	    forex(i, 18)
		{
            EAGLEUI_HidePlayer(playerid, EmoteMenu[playerid][i]);
        }
        animPage[playerid] = 1;
		AllGui_Status(playerid, true);
        EAGLEUI_Cancel(playerid);
	}

	if(textid == emoteList[playerid][29])
	{
        // TODO: Next page anim
        if (animPage[playerid] < 18)
		{
            animPage[playerid]++;
            SyncAnimPages(playerid);
            new animDetailStr[128];
            for (new i = 0; i < 10; i++)
			{
                new index = (animPage[playerid] * 10) + i - 10;
                if (index < 0 || index >= sizeof(g_AnimDetails)) continue;
                format(animDetailStr, sizeof(animDetailStr), "%s", g_AnimDetails[index][e_AnimationName]);
                EAGLEUI_SetStringPlayer(playerid, emoteList[playerid][19 + i], animDetailStr);
                EAGLEUI_ShowPlayer(playerid, emoteList[playerid][19 + i]);
                PlayerPlaySound(playerid, 1039, 0.0, 0.0, 0.0);
            }
        }
    }
    if(textid == emoteList[playerid][30])
	{
        // TODO: Prev page anim
        if (animPage[playerid] > 1)
		{
            animPage[playerid]--;
            SyncAnimPages(playerid);
            new animDetailStr[128];
            for (new i = 0; i < 10; i++)
			{
                new index = (animPage[playerid] * 10) + i - 10;
                if (index < 0 || index >= sizeof(g_AnimDetails)) continue;
                format(animDetailStr, sizeof(animDetailStr), "%s", g_AnimDetails[index][e_AnimationName]);
                EAGLEUI_SetStringPlayer(playerid, emoteList[playerid][19 + i], animDetailStr);
                EAGLEUI_ShowPlayer(playerid, emoteList[playerid][19 + i]);
            }
        }
        PlayerPlaySound(playerid, 1039, 0.0, 0.0, 0.0);
    }
    if(textid == emoteList[playerid][34])
	{ // Close Animation Page
        forex(i, 35)
		{
            EAGLEUI_HidePlayer(playerid, emoteList[playerid][i]);
        }
        animPage[playerid] = 1;
        //EAGLEUI_Cancel(playerid);
        forex(i, 18)
		{
            EAGLEUI_ShowPlayer(playerid, EmoteMenu[playerid][i]);
        }
    }
    for(new i = 0; i < 10; i++)
	{
        if(textid == emoteList[playerid][i + 8])
		{
            new ePage = i + ((animPage[playerid]-1) * 10);
            ApplyAnimation(playerid, g_AnimDetails[ePage][e_AnimLib], g_AnimDetails[ePage][e_AnimName], g_AnimDetails[ePage][e_AnimDelta], g_AnimDetails[ePage][e_AnimLoop], g_AnimDetails[ePage][e_AnimLX], g_AnimDetails[ePage][e_AnimLY], g_AnimDetails[ePage][e_AnimFreeze], g_AnimDetails[ePage][e_AnimTime]);
            return 1;
        }
    }
    if(textid == EpropList1[playerid][8])//
	{
        ApplyAnimation(playerid, "KISSING", "gift_give", 5.33, 0, 0, 0, 0, 0, 1);
		SetPlayerAttachedObject(playerid, 9, 325, 6, _, _, _, _, _, _, 1.0, 1.0, 1.0);
    }
    if(textid == EpropList1[playerid][9])//
	{
 		ApplyAnimation(playerid, "ped","Jetpack_Idle", 4.1, false, false, false, true, 0);
		SetPlayerAttachedObject(playerid, 9, 11245, 5, -0.097999, 0.039000, 0.091999, 1.500000, 103.000022, -2.900001, 0.384999, 0.204000, 0.276000, 0, 0);
    }
    if(textid == EpropList1[playerid][10])//
	{
        ApplyAnimation(playerid, "ped","Jetpack_Idle", 4.1, false, false, false, true, 0);
		SetPlayerAttachedObject(playerid, 9, 19610, 5, 0.051999, 0.028999, -0.020000, -84.299865, -0.799999, 10.899998, 1.000000, 1.000000, 1.000000, 0, 0);
    }
    if(textid == EpropList1[playerid][11])//udah
	{
        ApplyAnimation(playerid, "ped","Jetpack_Idle", 4.1, false, false, false, true, 0);
		SetPlayerAttachedObject(playerid, 9, 19878, 5, 0.016000, 0.028000, 0.456000, 0.400000, 91.400108, -1.100000, 1.000000, 1.000000, 1.000000, 0, 0);
    }
    if(textid == EpropList1[playerid][12])//
	{
        ApplyAnimation(playerid, "CRACK", "Bbalbat_Idle_02", 10.00, true, false, false, true, 0);
		SetPlayerAttachedObject(playerid, 9, 336, 6, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 1.000000, 1.000000, 1.000000, 0, 0);
    }
    if(textid == EpropList1[playerid][13])//
	{
        ApplyAnimation(playerid, "CRACK", "Bbalbat_Idle_01", 6.67, true, false, false, true, 0);
		SetPlayerAttachedObject(playerid, 9, 334, 6, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 1.000000, 1.000000, 1.000000, 0, 0);
    }
    if(textid == EpropList1[playerid][14])//
	{
        ApplyAnimation(playerid, "CRACK", "Bbalbat_Idle_02", 10.00, true, false, false, true, 0);
		SetPlayerAttachedObject(playerid,  9, 334, 6, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 1.000000, 1.000000, 1.000000, 0, 0);
    }
    if(textid == EpropList1[playerid][15])//udah
	{
        ApplyAnimation(playerid, "CRACK", "Bbalbat_Idle_01", 6.67, true, false, false, true, 0);
		SetPlayerAttachedObject(playerid, 9, 336, 6, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 1.000000, 1.000000, 1.000000, 0, 0);
    }
    if(textid == EpropList1[playerid][16])//
	{
		ApplyAnimation(playerid,"PAULNMAC", "WANK_LOOP", 4.0, true, false, false, true, 0);
		SetPlayerAttachedObject(playerid, 9, 322, 5, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 1.000000, 1.000000, 1.000000, 0, 0);
    }
    if(textid == EpropList1[playerid][17])//
	{
		ApplyAnimation(playerid, "PAULNMAC", "WANK_LOOP", 4.0, true, false, false, true, 0);
		SetPlayerAttachedObject(playerid, 9, 321, 5, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 1.000000, 1.000000, 1.000000, 0, 0);
    }
    
    if(textid == EpropList2[playerid][8])//udah
	{
       	ApplyAnimation(playerid, "CRACK", "Bbalbat_Idle_01", 6.67, true, false, false, true, 0);
		SetPlayerAttachedObject(playerid,  9, 19317, 1, -0.145000, 0.356999, 0.211999, -9.399999, 25.299961, 154.199905, 1.000000, 1.051999, 1.000000, 0, 0);
    }
    if(textid == EpropList2[playerid][9])//udah
	{
        ApplyAnimation(playerid, "CAMERA", "camcrch_idleloop", 2.0, true, false, false, false, 0);
		SetPlayerAttachedObject(playerid, 9, 11738, 1, -0.522999, 0.668999, 0.550999, 74.799995, 76.100028, -21.699998, 1.473999, 1.431999, 1.212000, 0, 0);
    }
    if(textid == EpropList2[playerid][10])//udah
	{
        ApplyAnimation(playerid, "BSKTBALL","BBALL_walk", 1.07, true, true, true, true, 0);
		SetPlayerAttachedObject(playerid, 9, 2114, 6, 0.300000, 0.000000, 0.039999, 0.000000, 0.000000, 0.000000, 1.000000, 1.000000, 1.000000, 0, 0);
    }
    if(textid == EpropList2[playerid][11])//udah
	{
		ApplyAnimation(playerid, "BSKTBALL","BBALL_run", 0.90, true, true, true, true, 0);
		SetPlayerAttachedObject(playerid,  9, 2114, 6, 0.300000, 0.000000, 0.039999, 0.000000, 0.000000, 0.000000, 1.000000, 1.000000, 1.000000, 0, 0);
    }
    if(textid == EpropList2[playerid][12])//udah
	{
		ApplyAnimation(playerid, "BSKTBALL","BBALL_idleloop", 0.67, true, false, false, true, 0);
		SetPlayerAttachedObject(playerid, 9, 2114, 6, 0.300000, 0.000000, 0.039999, 0.000000, 0.000000, 0.000000, 1.000000, 1.000000, 1.000000, 0, 0);
    }
    if(textid == EpropList2[playerid][13])//udah
	{
        ApplyAnimation(playerid, "ped","Jetpack_Idle", 4.1, false, false, false, true, 0);
		SetPlayerAttachedObject(playerid, 9, 642, 5, -0.279000, 0.126000, -0.356999, 19.699987, -134.099990, 1.599998, 0.368000, 0.371000, 0.470999, 0xFF3A3B3C, 0xFF3A3B3C);
    }
    if(textid == EpropList2[playerid][14])//udah
	{
        ApplyAnimation(playerid, "CAMERA", "picstnd_take", 1.0, true, false, false, false, 0);
		SetPlayerAttachedObject(playerid, 9, 19623, 6, 0.152000, 0.068999, 0.037999, 3.899933, -0.499996, 91.399879, 1.000000, 1.000000, 1.000000, 0, 0);
    }
    if(textid == EpropList2[playerid][15])//udah
	{
		ApplyAnimation(playerid, "CAMERA", "piccrch_take", 1.0, true, false, false, false, 0);
		SetPlayerAttachedObject(playerid, 9, 19623, 6, 0.074999, 0.112999, 0.079999, 0.000000, 0.000000, 96.599990, 1.000000, 1.000000, 1.000000, 0, 0);
    }
    if(textid == EpropList2[playerid][16])//udah
	{
	    ApplyAnimation(playerid, "ped", "SEAT_down", 4.1, false, false, false, true, 0);
		SetPlayerAttachedObject(playerid, 9, 2121, 1, -0.324999, 0.050000, -0.015000, -128.700027, 94.600151, -55.500225, 1.000000, 1.000000, 1.000000, 0, 0);
    }
    if(textid == EpropList2[playerid][17])//udah
	{
		ApplyAnimation(playerid, "ped", "SEAT_down", 4.1, false, false, false, true, 0);
		SetPlayerAttachedObject(playerid, 9, 1369, 1, -0.207000, 0.101999, -0.010000, -88.599967, 100.600143, -94.200103, 1.000000, 1.000000, 1.000000, 0, 0);
    }
    if(textid == EpropList3[playerid][8])//udah
	{
       	SetPlayerAttachedObject(playerid, 9, 2322, 1, 0.298, 0.405, 0.0, 0.0, 92.2, 178.9, 1.0, 1.0, 1.0);
		SetPlayerSpecialAction(playerid, SPECIAL_ACTION_CARRY);
    }
    if(textid == EpropList3[playerid][9])//udah
	{
  		ApplyAnimationEx(playerid, "CRACK", "Bbalbat_Idle_01", 4.0, 1, 0, 0, 0, 0, 1);
  		SetPlayerAttachedObject(playerid, 9, 19307, 5,  0.067000, 0.046999, 0.021000,  -4.299974, 169.900070, 163.699966,  1.000000, 1.000000, 1.000000); // Bendera2
    }
    if(textid == EpropList3[playerid][10])//udah
	{
        SetPlayerSpecialAction(playerid, SPECIAL_ACTION_CARRY);
		SetPlayerAttachedObject(playerid, 9, 2814, 1, 0.095, 0.312, 0.0, -89.7, 56.5, 5.4, 1.0, 1.0, 1.0);
    }
    if(textid == EpropList3[playerid][11])//udah
	{
	    SetPlayerSpecialAction(playerid, SPECIAL_ACTION_CARRY);
        SetPlayerAttachedObject(playerid, 9, 2654, 6,  -0.018999, 0.143999, -0.186999,  -106.299964, -2.699998, -11.199999,  1.000000, 0.703000, 0.858000);
    }
    if(textid == EpropList3[playerid][12])//udah
	{
        SetPlayerSpecialAction(playerid, SPECIAL_ACTION_CARRY);
        SetPlayerAttachedObject(playerid, 9, 19636, 1, 0.0, 0.484, 0.0, 0.0, 94.6, 89.6, 1.0, 1.0, 1.0);
    }
    if(textid == EpropList3[playerid][13])//
	{
        SetPlayerSpecialAction(playerid, SPECIAL_ACTION_CARRY);
		SetPlayerAttachedObject(playerid, 9, 2912, 1, 0.181, 0.253, -0.067, -82.3, 1.0, 6.0, 0.51, 0.575, 0.483);
    }
    if(textid == EpropList3[playerid][14])//
	{
        SetPlayerSpecialAction(playerid, SPECIAL_ACTION_CARRY);
		SetPlayerAttachedObject(playerid, 9, 1080, 1, 0.165, 0.436, -0.026, 0.00, 0.00, 86.9, 0.853, 0.478, 0.541);
    }
    if(textid == EpropList3[playerid][15])//udah
	{
        SetPlayerSpecialAction(playerid, SPECIAL_ACTION_CARRY);
        SetPlayerAttachedObject(playerid, 9, 1150, 6,  0.057999, 0.100999, 0.934000,  0.000000, -88.199981, 0.000000,  1.000000, 1.000000, 1.000000); // Bumper
    }
    if(textid == EpropList3[playerid][16])//udah
	{
        SetPlayerSpecialAction(playerid, SPECIAL_ACTION_CARRY);
        SetPlayerAttachedObject(playerid, 9, 1010, 1, -0.065, 0.405, 0.003, 0.0, 92.0, 0.0, 1.0, 1.0, 1.0);
    }
    if(textid == EpropList3[playerid][17])//udah
	{
	    ApplyAnimation(playerid, "ped","Jetpack_Idle", 4.1, false, false, false, true, 0);
	    SetPlayerAttachedObject(playerid, 9, 19317, 1, -0.214, 0.383, 0.142, -14.200, 17.900, 158.400, 1.000, 1.000, 1.000);
    }
    if(textid == EpropList1[playerid][29])//next
	{
	    forex(i, 35)
		{
            EAGLEUI_HidePlayer(playerid, EpropList1[playerid][i]);
        }
        forex(i, 35)
		{
            EAGLEUI_ShowPlayer(playerid, EpropList2[playerid][i]);
        }
        PlayerPlaySound(playerid, 1039, 0.0, 0.0, 0.0);
    }
    if(textid == EpropList1[playerid][30])//prev
	{
	    forex(i, 35)
		{
            EAGLEUI_HidePlayer(playerid, EpropList1[playerid][i]);
        }
	    forex(i, 18)
		{
            EAGLEUI_ShowPlayer(playerid, EmoteMenu[playerid][i]);
        }
        PlayerPlaySound(playerid, 1039, 0.0, 0.0, 0.0);
    }
    if(textid == EpropList1[playerid][34])
	{ // Close Animation Page
        forex(i, 35)
		{
            EAGLEUI_HidePlayer(playerid, EpropList1[playerid][i]);
        }
		AllGui_Status(playerid, true);
        EAGLEUI_Cancel(playerid);
    }
    if(textid == EpropList2[playerid][29])//next
	{
	    forex(i, 35)
		{
            EAGLEUI_HidePlayer(playerid, EpropList2[playerid][i]);
        }
        forex(i, 35)
		{
            EAGLEUI_ShowPlayer(playerid, EpropList3[playerid][i]);
        }
        PlayerPlaySound(playerid, 1039, 0.0, 0.0, 0.0);
    }
    if(textid == EpropList2[playerid][30])//prev
	{
	    forex(i, 35)
		{
            EAGLEUI_HidePlayer(playerid, EpropList2[playerid][i]);
        }
        forex(i, 35)
		{
            EAGLEUI_ShowPlayer(playerid, EpropList1[playerid][i]);
        }
        PlayerPlaySound(playerid, 1039, 0.0, 0.0, 0.0);
    }
    if(textid == EpropList2[playerid][34])
	{ // Close Animation Page
        forex(i, 35)
		{
            EAGLEUI_HidePlayer(playerid, EpropList2[playerid][i]);
        }
		AllGui_Status(playerid, true);
        EAGLEUI_Cancel(playerid);
    }
    if(textid == EpropList3[playerid][29])//next
	{
        PlayerPlaySound(playerid, 1039, 0.0, 0.0, 0.0);
    }
    if(textid == EpropList3[playerid][30])//prev
	{
	    forex(i, 35)
		{
            EAGLEUI_HidePlayer(playerid, EpropList3[playerid][i]);
        }
        forex(i, 35)
		{
            EAGLEUI_ShowPlayer(playerid, EpropList2[playerid][i]);
        }
        PlayerPlaySound(playerid, 1039, 0.0, 0.0, 0.0);
    }
    if(textid == EpropList3[playerid][34])
	{ // Close Animation Page
        forex(i, 35)
		{
            EAGLEUI_HidePlayer(playerid, EpropList3[playerid][i]);
        }
		AllGui_Status(playerid, true);
        EAGLEUI_Cancel(playerid);
    }

	// Gacha Sistem [ALTHAF ARBAHAM]
	if(textid == Althf_GachaTD[playerid][54]) 
	{
    StartGachaRoll(playerid);
  	}
	if(textid == Althf_GachaTD[playerid][57]) 
	{
    HideGachaTD(playerid);
  	}
	if(textid == FlistDuty[playerid][14]) // CLOSE flist
	{
		PlayerPlaySound(playerid, 21001, 0.0, 0.0, 0.0);
		ShowPlayerFactionList(playerid, false);
		// ShowHudUI(playerid, true);
	}
	if(textid == Radial_New[playerid][3]) // CLOSE
	{
		PlayerPlaySound(playerid, 21001, 0.0, 0.0, 0.0);
		ShowPlayerRadialNew(playerid, false);
		// ShowHudUI(playerid, true);
	}
	if (textid == Radial_New[playerid][4]) // Inventory
	{
		PlayerPlaySound(playerid, 21000, 0.0, 0.0, 0.0);
		// ShowHudUI(playerid, false);
		ShowPlayerRadialNew(playerid, false);

		if(AccountData[playerid][ActivityTime] != 0)
		{
			EAGLEUI_Cancel(playerid);
			return ShowTDN(playerid, NOTIFICATION_WARNING, "Anda sedang melakukan sesuatu, tunggu sampai progress selesai!");
		}
		
		Inventory_Show(playerid);
		PlayerPlaySound(playerid, 1039, 0.0, 0.0, 0.0);
	}
	if (textid == Radial_New[playerid][5]) // Phone
	{
		PlayerPlaySound(playerid, 21000, 0.0, 0.0, 0.0);
		// ShowHudUI(playerid, false);
		ShowPlayerRadialNew(playerid, false);
		ShowingSmartphone(playerid);
	}
	if (textid == Radial_New[playerid][6]) // dokumen
	{
		PlayerPlaySound(playerid, 21000, 0.0, 0.0, 0.0);
		ShowPlayerRadialNew(playerid, false);
		Dialog_Show(playerid, DOKUMENT_MENU, DIALOG_STYLE_LIST, ""ALTHF"EAGLE Roleplay "WHITE"- Dokument",
		""YELLOW"Identitas:\
		\n\n> Lihat KTP\
		\n"GRAY"> Tunjukan KTP\
		\n> Lihat SIM\
		\n"GRAY"> Tunjukan SIM\
		\n> Lihat SKWB\
		\n"GRAY"> Tunjukan SKWB\
		\n\n"YELLOW"Dokument:\
		\n\n> Lihat BPJS\
		\n"GRAY"> Perlihatkan BPJS\
		\n> Lihat SKCK\
		\n"GRAY"> Perlihatkan SKCK\
		\n> Lihat SKS\
		\n"GRAY"> Perlihatkan SKS", "Pilih", "Batal");
	}
	if (textid == Radial_New[playerid][7]) // toys
	{
		PlayerPlaySound(playerid, 21000, 0.0, 0.0, 0.0);
		ShowPlayerRadialNew(playerid, false);
		callcmd::fashion(playerid);
		EAGLEUI_Cancel(playerid);
	}
	if(textid == Radial_New[playerid][2]) // vehicle
	{
		PlayerPlaySound(playerid, 21000, 0.0, 0.0, 0.0);
		ShowPlayerRadialNew(playerid, false);
		new vehid = GetNearestVehicleToPlayer(playerid, 3.5, false);
		if(vehid == INVALID_VEHICLE_ID) return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak ada kendaraan apapun di sekitar!"), EAGLEUI_Cancel(playerid);
		
		static string[178];
		NearestVehicleID[playerid] = vehid;
		format(string, sizeof(string), "Kunci\
		\n"GRAY"Lampu\
		\nHood buka/tutup\
		\n"GRAY"Trunk buka/tutup\
		\nBagasi\
		\n"GRAY"Holster\
		\nMasuk ke dalam bagasi");
		
		ShowPlayerDialog(playerid, DIALOG_VEHICLE_MENU, DIALOG_STYLE_LIST, ""ALTHF"EAGLE Roleplay "WHITE"- Vehicle Menu",
		string, "Pilih", "Batal");
	}
	if (textid == Radial_New[playerid][8]) // action
	{
		new frmtx[300], count = 0;

		foreach(new i : Player) if (i != playerid) if (IsPlayerNearPlayer(playerid, i, 2.5))
		{
			format(frmtx, sizeof(frmtx), "%sPlayer ID: %d\n", frmtx, i);
			NearestPlayer[playerid][count++] = i;
		}
			
		if (AccountData[playerid][pFaction] == FACTION_NONE && AccountData[playerid][pFamily] == -1)
		{
			Dialog_Show(playerid, PANEL_NONE, DIALOG_STYLE_LIST, ""ALTHF"EAGLE Roleplay "WHITE"- Menu Warga", "Drag/Undrag Person", "Pilih", "Batal");
			ShowPlayerRadialNew(playerid, false);
		}
		else if (AccountData[playerid][pFaction] == FACTION_TRANS && AccountData[playerid][pFamily] == -1)
		{
			Dialog_Show(playerid, PANEL_NONE, DIALOG_STYLE_LIST, ""ALTHF"EAGLE Roleplay "WHITE"- Menu Warga", "Drag/Undrag Person", "Pilih", "Batal");
			ShowPlayerRadialNew(playerid, false);
		}
		else
		{
			if (count > 0)
			{
				Dialog_Show(playerid, DialogKantongPanel, DIALOG_STYLE_LIST, ""ALTHF"EAGLE ROLEPLAY"WHITE" - Faction Panel", frmtx, "Pilih", "Batal");
			}
			else ShowTDN(playerid, NOTIFICATION_WARNING, "Tidak ada orang disekitar anda!");
			
			return ShowPlayerRadialNew(playerid, false);
		}
		
		if (AccountData[playerid][pFamily] > -1 && AccountData[playerid][pFamilyRank] > 1)
		{
			if (count > 0)
			{
				Dialog_Show(playerid, FamiliesKantongList, DIALOG_STYLE_LIST, ""ALTHF"EAGLE ROLEPLAY"WHITE" - Faction Panel (Gang)", frmtx, "Pilih", "Batal");
			}
			else ShowTDN(playerid, NOTIFICATION_WARNING, "Tidak ada orang disekitar anda!");
			return ShowPlayerRadialNew(playerid, false);
		}
	}
	// PAYCHECK SYSTEM
	if(textid == ALTHAF_PaycheckLoginTD[playerid][1]) // Close Button Akses
	{
		ShowPaycheckLogTD(playerid, false);
		AllGui_Status(playerid, true);
		PlayerPlaySound(playerid, 1054, 0.0, 0.0, 0.0);
	}
	if(textid == ALTHAF_PaycheckLoginTD[playerid][2]) // Withdraw Button
	{
		ShowPaycheckLogTD(playerid, false);
		ShowPilihanButtonTD(playerid, false);
		ShowPaycheckTD(playerid, true);
		Paycheck_UpdateBalanceDisplay(playerid);
		PlayerPlaySound(playerid, 1054, 0.0, 0.0, 0.0);
	}
	if(textid == ALTHAF_PayCheckWithdrawTD[playerid][11]) // Input Amount Button
	{
		Paycheck_ShowWithdrawDialog(playerid);
		PlayerPlaySound(playerid, 1054, 0.0, 0.0, 0.0);
	}
	if(textid == ALTHAF_PayCheckWithdrawTD[playerid][20]) // Select Method Button
	{
		if(PaycheckWithdrawAmount[playerid] <= 0)
		{
			return ShowTDN(playerid, NOTIFICATION_ERROR, "Silakan input jumlah terlebih dahulu!");
		}
		ShowPilihanButtonTD(playerid, true);
		PlayerPlaySound(playerid, 1054, 0.0, 0.0, 0.0);
	}
	if(textid == ALTHAF_PilihanPayTD[playerid][0]) // Cash Button
	{
		if(PaycheckWithdrawAmount[playerid] <= 0)
		{
			return ShowTDN(playerid, NOTIFICATION_ERROR, "Silakan input jumlah terlebih dahulu!");
		}

		Paycheck_ProcessWithdraw(playerid, PaycheckWithdrawAmount[playerid], 1);
		Paycheck_HideAllUI(playerid);
		PlayerPlaySound(playerid, 1054, 0.0, 0.0, 0.0);
	}
	if(textid == ALTHAF_PilihanPayTD[playerid][2]) // Bank Button
	{
		if(PaycheckWithdrawAmount[playerid] <= 0)
		{
			return ShowTDN(playerid, NOTIFICATION_ERROR, "Silakan input jumlah terlebih dahulu!");
		}
		Paycheck_ProcessWithdraw(playerid, PaycheckWithdrawAmount[playerid], 2);
		Paycheck_HideAllUI(playerid);
		PlayerPlaySound(playerid, 1054, 0.0, 0.0, 0.0);
	}
	if(textid == ALTHAF_PayCheckWithdrawTD[playerid][20])
	{
		if(PaycheckWithdrawAmount[playerid] == 0)
		{
			Paycheck_HideAllUI(playerid);
			PlayerPlaySound(playerid, 1054, 0.0, 0.0, 0.0);
		}
	}
	// New Clothing Menu
	if(textid == ConfirmBuyTD[playerid][3]) // Beli Clothes
	{
		if (BuyClothes[playerid] == 1)
		{
			new price = 200;

			if (AccountData[playerid][pMoney] < price) return ShowTDN(playerid, NOTIFICATION_ERROR, "Uang tidak cukup! (Price: $200)");
			TakeMoney(playerid, price);
			ShowTDN(playerid, NOTIFICATION_SUKSES, "Anda membeli baju seharga ~g~$200");

			AccountData[playerid][pSkin] = GetPlayerSkin(playerid);
			BuyClothes[playerid] = 0;
			SetPlayerSkin(playerid, AccountData[playerid][pSkin]);
			for(new txd = 0; txd < 84; txd++)
			{
				EAGLEUI_HideGlobalForPlayer(playerid, ClothesSelect[txd]);
			}
			for(new txd = 0; txd < 20; txd++)
			{
				EAGLEUI_HidePlayer(playerid, ClothesPlayerSelect[playerid][txd]);
			}
			BuyTopi[playerid] = 0;
			BuyGlasses[playerid] = 0;
			BuyTAksesoris[playerid] = 0;
			BuyBackpack[playerid] = 0;
			CSelect[playerid] = 0;
			SelectAccTopi[playerid] = 0;
			SelectAccGlasses[playerid] = 0;
			SelectAccAksesoris[playerid] = 0;
			SelectAccBackpack[playerid] = 0;
			EAGLEUI_Cancel(playerid);
			SetCameraBehindPlayer(playerid);
			TogglePlayerControllable(playerid, 1);
		}
		if (BuyTopi[playerid] == 1)
		{
			AccountData[playerid][toySelected] = 0;

			new price = 80;
			if (AccountData[playerid][pMoney] < price) return ShowTDN(playerid, NOTIFICATION_ERROR, "Uang kamu tidak cukup! (Price: $80)");
			TakeMoney(playerid, price);
			pToys[playerid][AccountData[playerid][toySelected]][toy_model] = AksesorisHat[SelectAccTopi[playerid]];
			pToys[playerid][AccountData[playerid][toySelected]][toy_status] = 1;
			pToys[playerid][AccountData[playerid][toySelected]][toy_x] = 0.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_y] = 0.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_z] = 0.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_rx] = 0.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_ry] = 0.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_rz] = 0.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_sx] = 1.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_sy] = 1.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_sz] = 1.0;

			ShowPlayerDialog(playerid, DIALOG_TOYPOSISIBUY, DIALOG_STYLE_LIST, ""ALTHF"EAGLE "WHITE"- Ubah Tulang(Bone)",
			"Spine\
			\n"GRAY"Head\
			\nLeft Upper Arm\
			\n"GRAY"Right Upper Arm\
			\nLeft Hand\
			\n"GRAY"Right Hand\
			\nLeft Thigh\
			\n"GRAY"Right Thigh\
			\nLeft Foot\
			\n"GRAY"Right Foot\
			\nRight Calf\
			\n"GRAY"Left Calf\
			\nLeft Forearm\
			\n"GRAY"Right Forearm\
			\nLeft Clavicle\
			\n"GRAY"Right Clavicle\
			\nNeck\
			\n"GRAY"Jaw", "Select", "Cancel");
			SetCameraBehindPlayer(playerid);
			TogglePlayerControllable(playerid, 1);
			ShowTDN(playerid, NOTIFICATION_SUKSES, "Anda membeli Topi seharga ~g~$80");
			for(new txd = 0; txd < 84; txd++)
			{
				EAGLEUI_HideGlobalForPlayer(playerid, ClothesSelect[txd]);
			}
			for(new txd = 0; txd < 20; txd++)
			{
				EAGLEUI_HidePlayer(playerid, ClothesPlayerSelect[playerid][txd]);
			}
			BuyClothes[playerid] = 0;
			BuyTopi[playerid] = 0;
			BuyGlasses[playerid] = 0;
			BuyTAksesoris[playerid] = 0;
			BuyBackpack[playerid] = 0;
			CSelect[playerid] = 0;
			SelectAccTopi[playerid] = 0;
			SelectAccGlasses[playerid] = 0;
			SelectAccAksesoris[playerid] = 0;
			SelectAccBackpack[playerid] = 0;
			RemovePlayerAttachedObject(playerid, 9);
			EAGLEUI_Cancel(playerid);
		}
		if (BuyGlasses[playerid] == 1)
		{
			AccountData[playerid][toySelected] = 1;

			new price = 50;
			if (AccountData[playerid][pMoney] < price) return ShowTDN(playerid, NOTIFICATION_ERROR, "Uang kamu tidak cukup! (Price: $50)");
			TakeMoney(playerid, price);
			pToys[playerid][AccountData[playerid][toySelected]][toy_model] = GlassesToys[SelectAccGlasses[playerid]];
			pToys[playerid][AccountData[playerid][toySelected]][toy_status] = 1;
			pToys[playerid][AccountData[playerid][toySelected]][toy_x] = 0.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_y] = 0.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_z] = 0.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_rx] = 0.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_ry] = 0.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_rz] = 0.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_sx] = 1.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_sy] = 1.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_sz] = 1.0;

			ShowPlayerDialog(playerid, DIALOG_TOYPOSISIBUY, DIALOG_STYLE_LIST, ""ALTHF"EAGLE "WHITE"- Ubah Tulang(Bone)",
			"Spine\
			\n"GRAY"Head\
			\nLeft Upper Arm\
			\n"GRAY"Right Upper Arm\
			\nLeft Hand\
			\n"GRAY"Right Hand\
			\nLeft Thigh\
			\n"GRAY"Right Thigh\
			\nLeft Foot\
			\n"GRAY"Right Foot\
			\nRight Calf\
			\n"GRAY"Left Calf\
			\nLeft Forearm\
			\n"GRAY"Right Forearm\
			\nLeft Clavicle\
			\n"GRAY"Right Clavicle\
			\nNeck\
			\n"GRAY"Jaw", "Select", "Cancel");

			SetCameraBehindPlayer(playerid);
			TogglePlayerControllable(playerid, 1);
			ShowTDN(playerid, NOTIFICATION_SUKSES, "Anda membeli Kacamata seharga ~g~$50");
			for(new txd = 0; txd < 84; txd++)
			{
				EAGLEUI_HideGlobalForPlayer(playerid, ClothesSelect[txd]);
			}
			for(new txd = 0; txd < 20; txd++)
			{
				EAGLEUI_HidePlayer(playerid, ClothesPlayerSelect[playerid][txd]);
			}
			BuyClothes[playerid] = 0;
			BuyTopi[playerid] = 0;
			BuyGlasses[playerid] = 0;
			BuyTAksesoris[playerid] = 0;
			BuyBackpack[playerid] = 0;
			CSelect[playerid] = 0;
			SelectAccTopi[playerid] = 0;
			SelectAccGlasses[playerid] = 0;
			SelectAccAksesoris[playerid] = 0;
			SelectAccBackpack[playerid] = 0;
			RemovePlayerAttachedObject(playerid, 9);
			EAGLEUI_Cancel(playerid);
		}
		if (BuyTAksesoris[playerid] == 1)
		{
			AccountData[playerid][toySelected] = 2;

			new price = 100;
			if (AccountData[playerid][pMoney] < price) return ShowTDN(playerid, NOTIFICATION_ERROR, "Uang kamu tidak cukup! (Price: $100)");
			TakeMoney(playerid, price);
			pToys[playerid][AccountData[playerid][toySelected]][toy_model] = AksesorisToys[SelectAccAksesoris[playerid]];
			pToys[playerid][AccountData[playerid][toySelected]][toy_status] = 1;
			pToys[playerid][AccountData[playerid][toySelected]][toy_x] = 0.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_y] = 0.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_z] = 0.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_rx] = 0.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_ry] = 0.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_rz] = 0.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_sx] = 1.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_sy] = 1.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_sz] = 1.0;

			ShowPlayerDialog(playerid, DIALOG_TOYPOSISIBUY, DIALOG_STYLE_LIST, ""ALTHF"EAGLE "WHITE"- Ubah Tulang(Bone)",
			"Spine\
			\n"GRAY"Head\
			\nLeft Upper Arm\
			\n"GRAY"Right Upper Arm\
			\nLeft Hand\
			\n"GRAY"Right Hand\
			\nLeft Thigh\
			\n"GRAY"Right Thigh\
			\nLeft Foot\
			\n"GRAY"Right Foot\
			\nRight Calf\
			\n"GRAY"Left Calf\
			\nLeft Forearm\
			\n"GRAY"Right Forearm\
			\nLeft Clavicle\
			\n"GRAY"Right Clavicle\
			\nNeck\
			\n"GRAY"Jaw", "Select", "Cancel");

			SetCameraBehindPlayer(playerid);
			TogglePlayerControllable(playerid, 1);
			ShowTDN(playerid, NOTIFICATION_SUKSES, "Anda membeli Aksesoris seharga ~g~$100");
			for(new txd = 0; txd < 84; txd++)
			{
				EAGLEUI_HideGlobalForPlayer(playerid, ClothesSelect[txd]);
			}
			for(new txd = 0; txd < 20; txd++)
			{
				EAGLEUI_HidePlayer(playerid, ClothesPlayerSelect[playerid][txd]);
			}
			BuyClothes[playerid] = 0;
			BuyTopi[playerid] = 0;
			BuyGlasses[playerid] = 0;
			BuyTAksesoris[playerid] = 0;
			BuyBackpack[playerid] = 0;
			CSelect[playerid] = 0;
			SelectAccTopi[playerid] = 0;
			SelectAccGlasses[playerid] = 0;
			SelectAccAksesoris[playerid] = 0;
			SelectAccBackpack[playerid] = 0;
			RemovePlayerAttachedObject(playerid, 9);
			EAGLEUI_Cancel(playerid);
		}
		if (BuyBackpack[playerid] == 1)
		{
			AccountData[playerid][toySelected] = 3;

			new price = 100;
			if (AccountData[playerid][pMoney] < price) return ShowTDN(playerid, NOTIFICATION_ERROR, "Uang kamu tidak cukup! (Price: 100)");
			TakeMoney(playerid, price);
			pToys[playerid][AccountData[playerid][toySelected]][toy_model] = BackpackToys[SelectAccBackpack[playerid]];
			pToys[playerid][AccountData[playerid][toySelected]][toy_status] = 1;
			pToys[playerid][AccountData[playerid][toySelected]][toy_x] = 0.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_y] = 0.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_z] = 0.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_rx] = 0.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_ry] = 0.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_rz] = 0.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_sx] = 1.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_sy] = 1.0;
			pToys[playerid][AccountData[playerid][toySelected]][toy_sz] = 1.0;

			ShowPlayerDialog(playerid, DIALOG_TOYPOSISIBUY, DIALOG_STYLE_LIST, ""ALTHF"EAGLE "WHITE"- Ubah Tulang(Bone)",
			"Spine\
			\n"GRAY"Head\
			\nLeft Upper Arm\
			\n"GRAY"Right Upper Arm\
			\nLeft Hand\
			\n"GRAY"Right Hand\
			\nLeft Thigh\
			\n"GRAY"Right Thigh\
			\nLeft Foot\
			\n"GRAY"Right Foot\
			\nRight Calf\
			\n"GRAY"Left Calf\
			\nLeft Forearm\
			\n"GRAY"Right Forearm\
			\nLeft Clavicle\
			\n"GRAY"Right Clavicle\
			\nNeck\
			\n"GRAY"Jaw", "Select", "Cancel");

			SetCameraBehindPlayer(playerid);
			TogglePlayerControllable(playerid, 1);
			ShowTDN(playerid, NOTIFICATION_SUKSES, "Anda membeli Tas seharga ~g~$100");
			for(new txd = 0; txd < 84; txd++)
			{
				EAGLEUI_HideGlobalForPlayer(playerid, ClothesSelect[txd]);
			}
			for(new txd = 0; txd < 20; txd++)
			{
				EAGLEUI_HidePlayer(playerid, ClothesPlayerSelect[playerid][txd]);
			}
			BuyClothes[playerid] = 0;
			BuyTopi[playerid] = 0;
			BuyGlasses[playerid] = 0;
			BuyTAksesoris[playerid] = 0;
			BuyBackpack[playerid] = 0;
			CSelect[playerid] = 0;
			SelectAccTopi[playerid] = 0;
			SelectAccGlasses[playerid] = 0;
			SelectAccAksesoris[playerid] = 0;
			SelectAccBackpack[playerid] = 0;
			RemovePlayerAttachedObject(playerid, 9);
			EAGLEUI_Cancel(playerid);
		}
		for(new txd = 0; txd < 8; txd++)
		{
			EAGLEUI_HidePlayer(playerid, ConfirmBuyTD[playerid][txd]);
		}
		PlayerPlaySound(playerid, 1053, 0, 0, 0);
	}
	if(textid == ConfirmBuyTD[playerid][4]) // cancel Clothes
	{
		ShowTDN(playerid, NOTIFICATION_INFO, "Anda membatalkan pilihan");
		SetCameraBehindPlayer(playerid);
		TogglePlayerControllable(playerid, 1);
		if (AccountData[playerid][pUsingUniform])
		{
			SetPlayerSkin(playerid, AccountData[playerid][pUniform]);
		}
		else
		{
			SetPlayerSkin(playerid, AccountData[playerid][pSkin]);
		}
		BuyClothes[playerid] = 0;
		BuyTopi[playerid] = 0;
		BuyGlasses[playerid] = 0;
		BuyTAksesoris[playerid] = 0;
		BuyBackpack[playerid] = 0;
		CSelect[playerid] = 0;
		SelectAccTopi[playerid] = 0;
		SelectAccGlasses[playerid] = 0;
		SelectAccAksesoris[playerid] = 0;
		SelectAccBackpack[playerid] = 0;
		AttachPlayerToys(playerid);
		RemovePlayerAttachedObject(playerid, 9);
		for(new txd = 0; txd < 84; txd++)
		{
			EAGLEUI_HideGlobalForPlayer(playerid, ClothesSelect[txd]);
		}
		for(new txd = 0; txd < 20; txd++)
		{
			EAGLEUI_HidePlayer(playerid, ClothesPlayerSelect[playerid][txd]);
		}
		for(new txd = 0; txd < 8; txd++)
		{
			EAGLEUI_HidePlayer(playerid, ConfirmBuyTD[playerid][txd]);
		}
		PlayerPlaySound(playerid, 1053, 0, 0, 0);
		// ShowHudUI(playerid, true);
		EAGLEUI_Cancel(playerid);
	}

	// Login, registration, character selection and character creation use native SA-MP dialogs.

	if(IsRobbery[playerid])
    {
        new isCorrect = -1, Float:x, Float:y, Float:z;
        GetPlayerPos(playerid, x, y, z);

        for(new i = 0; i < 10; i ++)
        {
            if(textid == RobberyBankTD[playerid][ClueBoxes[playerid][i]])
            {
                isCorrect = i;
                break;
            }
        }

        if(ClickIndex[playerid] == textid)
        {
            return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda sudah menekan tombol ini sebelumnya!");
        }

        ClickIndex[playerid] = textid;

        if(isCorrect != -1)
        {
            EAGLEUI_SetColorPlayer(playerid, RobberyBankTD[playerid][ClueBoxes[playerid][isCorrect]], 163025407);
            EAGLEUI_ShowPlayer(playerid, RobberyBankTD[playerid][ClueBoxes[playerid][isCorrect]]);

            CorrectClicks[playerid] ++;

            if(CorrectClicks[playerid] >= 10)
            {
                IsRobbery[playerid] = false;
                CorrectClicks[playerid] = 0;
                WrongClicks[playerid] = 0;
                EAGLEUI_Cancel(playerid);

                DurringRobbery[playerid] = true;
                AccountData[playerid][pRobMin] = 60; //420 7 menit
                g_RobberyTime = 2400;

                Inventory_Remove(playerid, "Hacking Card");
                ShowItemBox(playerid, "Removed 1x", "Hacking Card", 19792);
                SendClientMessageToAllEx(-1, "{FF0000}BERITA:{FFFFFF} TELAH TERJADI PERAMPOKAN WARUNG DI %s. WARGA HARAP MENJAUH DARI AREA PERAMPOKAN!", GetLocation(x, y, z));
                
                foreach(new i : Player) if (AccountData[i][IsLoggedIn])
                {
                    if(AccountData[i][pFaction] == FACTION_POLISI && AccountData[i][pDutyPD])
                    {
                        static shstr[255];
                        format(shstr, sizeof(shstr), "{FF0000}[ALARM]"WHITE"Telah terjadi perampokan warung di~n~%s", GetLocation(x, y, z));
                        RobberyShowTD(i, shstr);
                        
                        SetPlayerRaceCheckpoint(i, 1, x, y, z, 0.0, 0.0, 0.0, 5.0);
                        Warning(i, "Lokasi warung yang sedang dirampok telah ditandai pada blip di map!");
                    }
                }

                for(new i = 1; i < 37; i ++) 
                {
                    EAGLEUI_SetColorPlayer(playerid, RobberyBankTD[playerid][i], -1061109505);
                    for(new j = 0; j < 37; j ++) 
                    {
                        EAGLEUI_HidePlayer(playerid, RobberyBankTD[playerid][j]);
                    }
                }
            }
        }
        else
        {
            EAGLEUI_SetColorPlayer(playerid, textid, 0xFF0000FF);
            EAGLEUI_ShowPlayer(playerid, textid);
            
            WrongClicks[playerid] ++;

            if(WrongClicks[playerid] >= 10)
            {
                Error(playerid, ""LIGHTGOLDENROD"[ROBBERY] "WHITE"Terlalu banyak kesalahan pada pemilihan box, anda gagal!");
                IsRobbery[playerid] = false;
                CorrectClicks[playerid] = 0;
                WrongClicks[playerid] = 0;
                EAGLEUI_Cancel(playerid);

                ClearAnimations(playerid);
                StopLoopingAnim(playerid);
                ApplyAnimationEx(playerid, "CARRY", "crry_prtial", 4.0, 0, 0, 0, 0, 0, 1);

                for(new i = 1; i < 37; i ++)
                {
                    EAGLEUI_SetColorPlayer(playerid, RobberyBankTD[playerid][i], -1061109505);
                    for(new j = 0; j < 37; j ++) 
                    {
                        EAGLEUI_HidePlayer(playerid, RobberyBankTD[playerid][j]);
                    }
                }
            }
        }
    }	
	//New Hope Spawn
	if(textid == HopeSpawn[playerid][2]) //bandara
    {
		new rand = random(sizeof(SpawnBandara));
		AccountData[playerid][pPosX] = SpawnBandara[rand][0];
		AccountData[playerid][pPosY] = SpawnBandara[rand][1];
		AccountData[playerid][pPosZ] = SpawnBandara[rand][2];
		AccountData[playerid][pPosA] = SpawnBandara[rand][3];
		SetPlayerInteriorEx(playerid, 0);
		SetPlayerVirtualWorldEx(playerid, 0);

		SetPlayerPositionEx(playerid, AccountData[playerid][pPosX], AccountData[playerid][pPosY], AccountData[playerid][pPosZ], AccountData[playerid][pPosA], 6000);
		SpawnMenu(playerid, false);
		ShowAlthafUpdate(playerid);
		AllGui_Status(playerid, false);
		ResetDynIdVars(playerid);
	}
	if(textid == HopeSpawn[playerid][3]) //pelabuhan
    {
		new rand = random(sizeof(SpawnPelabuhan));
		AccountData[playerid][pPosX] = SpawnPelabuhan[rand][0];
		AccountData[playerid][pPosY] = SpawnPelabuhan[rand][1];
		AccountData[playerid][pPosZ] = SpawnPelabuhan[rand][2];
		AccountData[playerid][pPosA] = SpawnPelabuhan[rand][3];
		SetPlayerInteriorEx(playerid, 0);
		SetPlayerVirtualWorldEx(playerid, 0);

		SetPlayerPositionEx(playerid, AccountData[playerid][pPosX], AccountData[playerid][pPosY], AccountData[playerid][pPosZ], AccountData[playerid][pPosA], 6000);
		SpawnMenu(playerid, false);
		ShowAlthafUpdate(playerid);
		AllGui_Status(playerid, false);
		ResetDynIdVars(playerid);
	}
	if(textid == HopeSpawn[playerid][5]) //rumah prima/teman
    {
		if(AccountData[playerid][pOwnedHouse] == -1 && AccountData[playerid][pFriendHouseID] == -1)
		{
			return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak memiliki rumah!");
		}
		
		foreach(new hid : House) 
		{
			if(HouseData[hid][hsOwnerID] == AccountData[playerid][pID] || AccountData[playerid][pFriendHouseID] == hid)
			{
				AccountData[playerid][pPosX] = HouseData[hid][hsExtPos][0];
				AccountData[playerid][pPosY] = HouseData[hid][hsExtPos][1];
				AccountData[playerid][pPosZ] = HouseData[hid][hsExtPos][2];
				AccountData[playerid][pPosA] = HouseData[hid][hsExtPos][3];
				SetPlayerInteriorEx(playerid, 0);
				SetPlayerVirtualWorldEx(playerid, 0);

				AccountData[playerid][pInDoor] = -1;
				AccountData[playerid][pInRusun] = -1;
				AccountData[playerid][pInFamily] = -1;
				AccountData[playerid][pInBiz] = -1;

				SetPlayerPositionEx(playerid, AccountData[playerid][pPosX], AccountData[playerid][pPosY], AccountData[playerid][pPosZ], AccountData[playerid][pPosA], 6000);
				SpawnMenu(playerid, false);
				ShowAlthafUpdate(playerid);
				AllGui_Status(playerid, false);
				ResetDynIdVars(playerid);
				break;
			}
		}
	}
	if(textid == HopeSpawn[playerid][7]) //faction
    {
		if(AccountData[playerid][pFaction] == FACTION_NONE) 
		{
			return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak bergabung dengan faction apapun!");
		}
		
		// Spawn sesuai faction
		switch(AccountData[playerid][pFaction])
		{
			case FACTION_POLISI:
			{
				AccountData[playerid][pPosX] = PoliceStuff[PoldaSpawnPOS][0];
				AccountData[playerid][pPosY] = PoliceStuff[PoldaSpawnPOS][1];
				AccountData[playerid][pPosZ] = PoliceStuff[PoldaSpawnPOS][2];
				AccountData[playerid][pPosA] = PoliceStuff[PoldaSpawnPOS][3];
				SetPlayerInteriorEx(playerid, 0);
				SetPlayerVirtualWorldEx(playerid, 0);
				SetPlayerPositionEx(playerid, AccountData[playerid][pPosX], AccountData[playerid][pPosY], AccountData[playerid][pPosZ], AccountData[playerid][pPosA], 6000);
				SpawnMenu(playerid, false);
				ShowAlthafUpdate(playerid);
				AllGui_Status(playerid, false);
				ResetDynIdVars(playerid);
			}
			case FACTION_EMS:
			{
				AccountData[playerid][pPosX] = EMSStuff[EMSSpawnPOS][0];
				AccountData[playerid][pPosY] = EMSStuff[EMSSpawnPOS][1];
				AccountData[playerid][pPosZ] = EMSStuff[EMSSpawnPOS][2];
				AccountData[playerid][pPosA] = EMSStuff[EMSSpawnPOS][3];
				SetPlayerInteriorEx(playerid, 0);
				SetPlayerVirtualWorldEx(playerid, 0);
				SetPlayerPositionEx(playerid, AccountData[playerid][pPosX], AccountData[playerid][pPosY], AccountData[playerid][pPosZ], AccountData[playerid][pPosA], 6000);
				SpawnMenu(playerid, false);
				ShowAlthafUpdate(playerid);
				AllGui_Status(playerid, false);
				ResetDynIdVars(playerid);
			}
			case FACTION_PEMERINTAH:
			{
				AccountData[playerid][pPosX] = PemerStuff[PemerSpawnPOS][0];
				AccountData[playerid][pPosY] = PemerStuff[PemerSpawnPOS][1];
				AccountData[playerid][pPosZ] = PemerStuff[PemerSpawnPOS][2];
				AccountData[playerid][pPosA] = PemerStuff[PemerSpawnPOS][3];
				SetPlayerInteriorEx(playerid, 0);
				SetPlayerVirtualWorldEx(playerid, 0);
				SetPlayerPositionEx(playerid, AccountData[playerid][pPosX], AccountData[playerid][pPosY], AccountData[playerid][pPosZ], AccountData[playerid][pPosA], 6000);
				SpawnMenu(playerid, false);
				ShowAlthafUpdate(playerid);
				AllGui_Status(playerid, false);
				ResetDynIdVars(playerid);
			}
			default:
			{
				return ShowTDN(playerid, NOTIFICATION_ERROR, "Faction Anda tidak memiliki spawn point!");
			}
		}
	}
	if(textid == HopeSpawn[playerid][9]) // Rusun/Motel
	{
		if(AccountData[playerid][pOwnedRusun] == -1)
		{
			return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak memiliki rusun/motel!");
		}
		
		foreach(new rsid : Rusun)
		{
			if(RusunData[rsid][rusunOwnerID] == AccountData[playerid][pID])
			{
				AccountData[playerid][pPosX] = RusunData[rsid][rusunExtPos][0];
				AccountData[playerid][pPosY] = RusunData[rsid][rusunExtPos][1];
				AccountData[playerid][pPosZ] = RusunData[rsid][rusunExtPos][2];
				AccountData[playerid][pPosA] = RusunData[rsid][rusunExtPos][3];
				SetPlayerInteriorEx(playerid, 0);
				SetPlayerVirtualWorldEx(playerid, 0);

				AccountData[playerid][pInDoor] = -1;
				AccountData[playerid][pInRusun] = -1;
				AccountData[playerid][pInFamily] = -1;
				AccountData[playerid][pInBiz] = -1;

				SetPlayerPositionEx(playerid, AccountData[playerid][pPosX], AccountData[playerid][pPosY], AccountData[playerid][pPosZ], AccountData[playerid][pPosA], 6000);
				SpawnMenu(playerid, false);
				ShowAlthafUpdate(playerid);
				AllGui_Status(playerid, false);
				ResetDynIdVars(playerid);
				break;
			}
		}
	}
	if(textid == HopeSpawn[playerid][14]) //last exit
    {
		ResetDynIdVars(playerid);
		SpawnMenu(playerid, false);
		SetPlayerPositionEx(playerid, AccountData[playerid][pPosX], AccountData[playerid][pPosY], AccountData[playerid][pPosZ], AccountData[playerid][pPosA], 6000);
	}

	//=================[ AKSESGOV TD ALTHAFF ]====================
	if(textid == ALTHAF_AksesGovTD[playerid][1])
	{
		ShowAksesGov(playerid, false);
		AllGui_Status(playerid, true);
		PlayerPlaySound(playerid, 1054, 0.0, 0.0, 0.0);
		return 1;
	}

	if(textid == ALTHAF_AksesGovTD[playerid][2])
	{
		ShowAksesGov(playerid, false);
		PlayerPlaySound(playerid, 1054, 0.0, 0.0, 0.0);
		ShowGovTD(playerid);
		return 1;
	}

	// New Pemerintah TD [ALTHAF]
	if(textid == Althaf_GovTD[playerid][20]) // Close
	{
		HideGovTD(playerid);
		AllGui_Status(playerid, true);
		return 1;
	}
	if(textid == Althaf_GovTD[playerid][34]) // Ambil Pekerjaan
	{
		HideGovTD(playerid);
		AllGui_Status(playerid, true);
		Disnaker_Select(playerid, 0);
		return 1;
	}
	if(textid == Althaf_GovTD[playerid][63]) // Buat KTP
	{
		HideGovTD(playerid);
		AllGui_Status(playerid, true);
		Disnaker_Select(playerid, 1);
		return 1;
	}

	//garage
	if(textid == Garage_TD[playerid][28])
	{
		foreach(new gkid : PublicGarage) if(IsPlayerInRangeOfPoint(playerid, 3.5, PublicGarage[gkid][pgPOS][0], PublicGarage[gkid][pgPOS][1], PublicGarage[gkid][pgPOS][2]))
		{
			new i = AccountData[playerid][pTakeVehicle];

			if(PlayerVehicle[i][pVehParked] != -1)
			{
				GetVehicles(i, PublicGarage[gkid][pgSpawnPOS][0], PublicGarage[gkid][pgSpawnPOS][1], PublicGarage[gkid][pgSpawnPOS][2], PublicGarage[gkid][pgSpawnPOS][3]);
				SetTimerEx("ForcedPlayerHopInVehicle", 1500, false, "idd", playerid, PlayerVehicle[i][pVehPhysic], 0);

				forex(a, 30)
				{
					EAGLEUI_HidePlayer(playerid, Garage_TD[playerid][a]);
				}
				EAGLEUI_Cancel(playerid);
				AllGui_Status(playerid, true);
			}
		}

		foreach(new gkid : PrivateGarage) if(IsPlayerInRangeOfPoint(playerid, 3.5, PrivateGarage[gkid][pgPOS][0], PrivateGarage[gkid][pgPOS][1], PrivateGarage[gkid][pgPOS][2]))
		{
			new i = AccountData[playerid][pTakeVehicle];

			if(PlayerVehicle[i][pVehPrivateG] != -1)
			{
				GetVehicles(i, PrivateGarage[gkid][pgSpawnPOS][0], PrivateGarage[gkid][pgSpawnPOS][1], PrivateGarage[gkid][pgSpawnPOS][2], PrivateGarage[gkid][pgSpawnPOS][3]);
				SetTimerEx("ForcedPlayerHopInVehicle", 1500, false, "idd", playerid, PlayerVehicle[i][pVehPhysic], 0);

				forex(a, 30)
				{
					EAGLEUI_HidePlayer(playerid, Garage_TD[playerid][a]);
				}
				EAGLEUI_Cancel(playerid);
				AllGui_Status(playerid, true);
			}
		}
	}
	if(textid == Garage_TD[playerid][4])
	{
		AccountData[playerid][pUseGarage] = 0;
		forex(a, 30)
		{
			EAGLEUI_HidePlayer(playerid, Garage_TD[playerid][a]);
		}
		EAGLEUI_Cancel(playerid);
		AllGui_Status(playerid, true);
	}

	if(textid == Garage_TD[playerid][7])
	{
		new vehid = AccountData[playerid][pGarage][0];
		AccountData[playerid][pTakeVehicle] = vehid;

		GarageString(playerid, vehid);
	}

	if(textid == Garage_TD[playerid][11])
	{
		new vehid = AccountData[playerid][pGarage][1];
		AccountData[playerid][pTakeVehicle] = vehid;

		GarageString(playerid, vehid);
	}

	if(textid == Garage_TD[playerid][15])
	{
		new vehid = AccountData[playerid][pGarage][2];
		AccountData[playerid][pTakeVehicle] = vehid;

		GarageString(playerid, vehid);
	}

	if(textid == Garage_TD[playerid][19])
	{
		new vehid = AccountData[playerid][pGarage][3];
		AccountData[playerid][pTakeVehicle] = vehid;

		GarageString(playerid, vehid);
	}
	//job mixer
	if(textid == jobs::Pmixer[playerid][5])
	{
		jobs::mixer_select_case(playerid, 1);
	}
	if(textid == jobs::Pmixer[playerid][6])
	{
		jobs::mixer_select_case(playerid, 2);
	}
	if(textid == jobs::Pmixer[playerid][7])
	{
		jobs::mixer_select_case(playerid, 3);
	}
	if(textid == jobs::Pmixer[playerid][8])
	{
		jobs::mixer_select_case(playerid, 4);
	}
	if(textid == jobs::Pmixer[playerid][9])
	{
		jobs::mixer_select_case(playerid, 5);
	}
	if(textid == jobs::Pmixer[playerid][10])//confirm
	{
		jobs::mixer_confirm(playerid);
	}

	//NEW PHONE FUNCTIONS
	if(textid == HandphoneMenuApk[playerid][19])
    {
		Toggle_PhoneTD(playerid, true, "info");
    }
    if(textid == HandphoneMenuApk[playerid][79])
    {
		Toggle_PhoneTD(playerid, true, "game");
    }
    if(textid == HandphoneMenuGame[playerid][31])//tictactoe
    {
        if(MatchInfo[playerid][Fullxo] == 1) return SendClientMessage(playerid,COLOR_RED,"Error: Match is Already Stared");
		xocash = 0;
	//	MatchInfo[Fullxo] = 1;
		Moneylist(playerid);
    }
    if(textid == HandphoneMenuGame[playerid][38])//card slot
    {
        for(new i; i < 61; i++) EAGLEUI_HidePlayer(playerid, HandphoneMenuGame[playerid][i]);
        for(new i = 0; i < 41; i++) EAGLEUI_ShowPlayer(playerid, HandphonePoker[playerid][i]);
    }
    if(textid == HandphoneMenuGame[playerid][43])//planewar
    {
    }
    if(textid == HandphoneMenuGame[playerid][47])//kalkulator
    {
        for(new i; i < 61; i++) EAGLEUI_HidePlayer(playerid, HandphoneMenuGame[playerid][i]);
        for(new i = 0; i < 72; i++) EAGLEUI_ShowPlayer(playerid, HandphoneKalkulator[playerid][i]);
    }
    if(textid == HandphoneMenuGame[playerid][51])//trading
    {
    }
    if(textid == HandphoneKalkulator[playerid][13])//
    {
   		for(new i = 0; i < 72; i++) EAGLEUI_HidePlayer(playerid, HandphoneKalkulator[playerid][i]);
    	for(new i; i < 61; i++) EAGLEUI_ShowPlayer(playerid, HandphoneMenuGame[playerid][i]);
    }
    if(textid == HandphoneKalkulator[playerid][27])//<
    {
   		format(KalkulatorInput[playerid], 12, "");
        EAGLEUI_SetStringPlayer(playerid, HandphoneKalkulator[playerid][71], KalkulatorInput[playerid]);
        EAGLEUI_ShowPlayer(playerid, HandphoneKalkulator[playerid][71]);
    }
    if(textid == HandphoneKalkulator[playerid][27])//<
    {
   		format(KalkulatorInput[playerid], 12, "");
        EAGLEUI_SetStringPlayer(playerid, HandphoneKalkulator[playerid][71], KalkulatorInput[playerid]);
        EAGLEUI_ShowPlayer(playerid, HandphoneKalkulator[playerid][71]);
    }
    if(textid == HandphoneKalkulator[playerid][28])//+/-
    {
   		strcat(KalkulatorInput[playerid], "+/-");
        if(strlen(KalkulatorInput[playerid]) >= 18) return Error(playerid, "Teks sudah maksimal");
        EAGLEUI_SetStringPlayer(playerid, HandphoneKalkulator[playerid][71], KalkulatorInput[playerid]);
        EAGLEUI_ShowPlayer(playerid, HandphoneKalkulator[playerid][71]);
    }
    if(textid == HandphoneKalkulator[playerid][29])//%
    {
   		strcat(KalkulatorInput[playerid], "%");
        if(strlen(KalkulatorInput[playerid]) >= 18) return Error(playerid, "Teks sudah maksimal");
        EAGLEUI_SetStringPlayer(playerid, HandphoneKalkulator[playerid][71], KalkulatorInput[playerid]);
        EAGLEUI_ShowPlayer(playerid, HandphoneKalkulator[playerid][71]);
    }
    if(textid == HandphoneKalkulator[playerid][30])//bagi
    {
   		strcat(KalkulatorInput[playerid], "/");
        if(strlen(KalkulatorInput[playerid]) >= 18) return Error(playerid, "Teks sudah maksimal");
        EAGLEUI_SetStringPlayer(playerid, HandphoneKalkulator[playerid][71], KalkulatorInput[playerid]);
        EAGLEUI_ShowPlayer(playerid, HandphoneKalkulator[playerid][71]);
    }
    if(textid == HandphoneKalkulator[playerid][31])//
    {
   		strcat(KalkulatorInput[playerid], "7");
        if(strlen(KalkulatorInput[playerid]) >= 18) return Error(playerid, "Teks sudah maksimal");
        EAGLEUI_SetStringPlayer(playerid, HandphoneKalkulator[playerid][71], KalkulatorInput[playerid]);
        EAGLEUI_ShowPlayer(playerid, HandphoneKalkulator[playerid][71]);
    }
    if(textid == HandphoneKalkulator[playerid][32])//
    {
   		strcat(KalkulatorInput[playerid], "8");
        if(strlen(KalkulatorInput[playerid]) >= 18) return Error(playerid, "Teks sudah maksimal");
        EAGLEUI_SetStringPlayer(playerid, HandphoneKalkulator[playerid][71], KalkulatorInput[playerid]);
        EAGLEUI_ShowPlayer(playerid, HandphoneKalkulator[playerid][71]);
    }
    if(textid == HandphoneKalkulator[playerid][33])//
    {
   		strcat(KalkulatorInput[playerid], "9");
        if(strlen(KalkulatorInput[playerid]) >= 18) return Error(playerid, "Teks sudah maksimal");
        EAGLEUI_SetStringPlayer(playerid, HandphoneKalkulator[playerid][71], KalkulatorInput[playerid]);
        EAGLEUI_ShowPlayer(playerid, HandphoneKalkulator[playerid][71]);
    }
    if(textid == HandphoneKalkulator[playerid][34])//
    {
   		strcat(KalkulatorInput[playerid], "x");
        if(strlen(KalkulatorInput[playerid]) >= 18) return Error(playerid, "Teks sudah maksimal");
        EAGLEUI_SetStringPlayer(playerid, HandphoneKalkulator[playerid][71], KalkulatorInput[playerid]);
        EAGLEUI_ShowPlayer(playerid, HandphoneKalkulator[playerid][71]);
    }
    if(textid == HandphoneKalkulator[playerid][35])//
    {
   		strcat(KalkulatorInput[playerid], "4");
        if(strlen(KalkulatorInput[playerid]) >= 18) return Error(playerid, "Teks sudah maksimal");
        EAGLEUI_SetStringPlayer(playerid, HandphoneKalkulator[playerid][71], KalkulatorInput[playerid]);
        EAGLEUI_ShowPlayer(playerid, HandphoneKalkulator[playerid][71]);
    }
    if(textid == HandphoneKalkulator[playerid][36])//
    {
   		strcat(KalkulatorInput[playerid], "5");
        if(strlen(KalkulatorInput[playerid]) >= 18) return Error(playerid, "Teks sudah maksimal");
        EAGLEUI_SetStringPlayer(playerid, HandphoneKalkulator[playerid][71], KalkulatorInput[playerid]);
        EAGLEUI_ShowPlayer(playerid, HandphoneKalkulator[playerid][71]);
    }
    if(textid == HandphoneKalkulator[playerid][37])//
    {
   		strcat(KalkulatorInput[playerid], "6");
        if(strlen(KalkulatorInput[playerid]) >= 18) return Error(playerid, "Teks sudah maksimal");
        EAGLEUI_SetStringPlayer(playerid, HandphoneKalkulator[playerid][71], KalkulatorInput[playerid]);
        EAGLEUI_ShowPlayer(playerid, HandphoneKalkulator[playerid][71]);
    }
    if(textid == HandphoneKalkulator[playerid][38])//-
    {
   		strcat(KalkulatorInput[playerid], "-");
        if(strlen(KalkulatorInput[playerid]) >= 18) return Error(playerid, "Teks sudah maksimal");
        EAGLEUI_SetStringPlayer(playerid, HandphoneKalkulator[playerid][71], KalkulatorInput[playerid]);
        EAGLEUI_ShowPlayer(playerid, HandphoneKalkulator[playerid][71]);
    }
    if(textid == HandphoneKalkulator[playerid][39])//+
    {
   		strcat(KalkulatorInput[playerid], "+");
        if(strlen(KalkulatorInput[playerid]) >= 18) return Error(playerid, "Teks sudah maksimal");
        EAGLEUI_SetStringPlayer(playerid, HandphoneKalkulator[playerid][71], KalkulatorInput[playerid]);
        EAGLEUI_ShowPlayer(playerid, HandphoneKalkulator[playerid][71]);
    }
    if(textid == HandphoneKalkulator[playerid][40])//=
    {
   		strreplace(KalkulatorInput[playerid], "x", "*");
        new Float:result = MathEval(KalkulatorInput[playerid]);
        new str[218];
        if (result == FloatNaN)
        {
            EAGLEUI_SetStringPlayer(playerid, HandphoneKalkulator[playerid][71], "Malformed Input");
        }
        else
        {
            format(str, sizeof(str), "%.1f", result);
            strreplace(KalkulatorInput[playerid], "*", "x");
            EAGLEUI_SetStringPlayer(playerid, HandphoneKalkulator[playerid][71], str);
            EAGLEUI_ShowPlayer(playerid, HandphoneKalkulator[playerid][71]);
        }
    }
    if(textid == HandphoneKalkulator[playerid][41])//
    {
   		strcat(KalkulatorInput[playerid], "1");
        if(strlen(KalkulatorInput[playerid]) >= 18) return Error(playerid, "Teks sudah maksimal");
        EAGLEUI_SetStringPlayer(playerid, HandphoneKalkulator[playerid][71], KalkulatorInput[playerid]);
        EAGLEUI_ShowPlayer(playerid, HandphoneKalkulator[playerid][71]);
    }
    if(textid == HandphoneKalkulator[playerid][42])//
    {
   		strcat(KalkulatorInput[playerid], "2");
        if(strlen(KalkulatorInput[playerid]) >= 18) return Error(playerid, "Teks sudah maksimal");
        EAGLEUI_SetStringPlayer(playerid, HandphoneKalkulator[playerid][71], KalkulatorInput[playerid]);
        EAGLEUI_ShowPlayer(playerid, HandphoneKalkulator[playerid][71]);
    }
    if(textid == HandphoneKalkulator[playerid][43])//
    {
   		strcat(KalkulatorInput[playerid], "3");
        if(strlen(KalkulatorInput[playerid]) >= 18) return Error(playerid, "Teks sudah maksimal");
        EAGLEUI_SetStringPlayer(playerid, HandphoneKalkulator[playerid][71], KalkulatorInput[playerid]);
        EAGLEUI_ShowPlayer(playerid, HandphoneKalkulator[playerid][71]);
    }
    if(textid == HandphoneKalkulator[playerid][45])//
    {
   		strcat(KalkulatorInput[playerid], ".");
        if(strlen(KalkulatorInput[playerid]) >= 18) return Error(playerid, "Teks sudah maksimal");
        EAGLEUI_SetStringPlayer(playerid, HandphoneKalkulator[playerid][71], KalkulatorInput[playerid]);
        EAGLEUI_ShowPlayer(playerid, HandphoneKalkulator[playerid][71]);
    }
    if(textid == HandphoneKalkulator[playerid][47])//
    {
   		strcat(KalkulatorInput[playerid], "0");
        if(strlen(KalkulatorInput[playerid]) >= 18) return Error(playerid, "Teks sudah maksimal");
        EAGLEUI_SetStringPlayer(playerid, HandphoneKalkulator[playerid][71], KalkulatorInput[playerid]);
        EAGLEUI_ShowPlayer(playerid, HandphoneKalkulator[playerid][71]);
    }
    if(textid == HandphoneAirdrop[playerid][27])//permisson
    {
        EAGLEUI_HidePlayer(playerid, HandphoneAirdrop[playerid][30]);
        switch(AccountData[playerid][AirdropPermission])
        {
        	case false: AccountData[playerid][AirdropPermission] = true;
         	case true: AccountData[playerid][AirdropPermission] = false;
        }
		EAGLEUI_SetStringPlayer(playerid, HandphoneAirdrop[playerid][30], sprintf("~w~%s",AccountData[playerid][AirdropPermission] ? "~w~Yes" : "~w~No"));
		EAGLEUI_ShowPlayer(playerid, HandphoneAirdrop[playerid][30]);
    }
    if(textid == HandphoneAirdrop[playerid][28])//airdrop
    {
        			if(!AccountData[playerid][AirdropPermission])
                        return ShowTDN(playerid, NOTIFICATION_WARNING, "Izinkan terlebih dahulu Permission Share Contact!");

                    new frmxt[255], count = 0;

                    foreach(new i : Player) if (i != playerid) if (IsPlayerNearPlayer(playerid, i, 2.0) && AccountData[i][AirdropPermission])
                    {
                        format(frmxt, sizeof(frmxt), "%sPlayer ID: %d\n", frmxt, i);
                        NearestPlayer[playerid][count++] = i;
                    }

                    if(count == 0)
                    {
                        PlayerPlaySound(playerid, 5206, 0.0, 0.0, 0.0);
                        return ShowPlayerDialog(playerid, DIALOG_UNUSED, DIALOG_STYLE_MSGBOX, ""ALTHF"EAGLE "WHITE" - Airdrop",
                        "Tidak ada player yang dekat dengan anda!", "Tutup", "");
                    }

                    ShowPlayerDialog(playerid, DIALOG_AIRDROP, DIALOG_STYLE_LIST, ""ALTHF"EAGLE "WHITE" - Airdrop", frmxt, "Pilih", "Batal");
    }
    if(textid == HandphoneMenuApk[playerid][73])
    {
        Toggle_PhoneTD(playerid, true, "garasi");
    }

    if(textid == HandphoneMenuApk[playerid][29])
    {
        Toggle_PhoneTD(playerid, true, "kontak");
    }
    if(textid == HandphoneTelponAngka[playerid][28])//1
    {
        if(rrechnungPhoneCall[playerid] == 0)
	    {
			strcat(zahPhonelCall[playerid], "1");
			EAGLEUI_ShowPlayer(playerid, HandphoneTelponAngka[playerid][41]);
			strcat(rechiPhoneCall[playerid], "1");
			EAGLEUI_SetStringPlayer(playerid,HandphoneTelponAngka[playerid][41], rechiPhoneCall[playerid]);
		}
		else
		{
            strcat(azahPhonelCall[playerid], "1");
			EAGLEUI_ShowPlayer(playerid, HandphoneTelponAngka[playerid][41]);
			strcat(rechiPhoneCall[playerid], "1");
			EAGLEUI_SetStringPlayer(playerid,HandphoneTelponAngka[playerid][41], rechiPhoneCall[playerid]);
		}
    }
    if(textid == HandphoneTelponAngka[playerid][29])//2
    {
        if(rrechnungPhoneCall[playerid] == 0)
	    {
			strcat(zahPhonelCall[playerid], "2");
			EAGLEUI_ShowPlayer(playerid, HandphoneTelponAngka[playerid][41]);
			strcat(rechiPhoneCall[playerid], "2");
			EAGLEUI_SetStringPlayer(playerid,HandphoneTelponAngka[playerid][41], rechiPhoneCall[playerid]);
		}
		else
		{
            strcat(azahPhonelCall[playerid], "2");
			EAGLEUI_ShowPlayer(playerid, HandphoneTelponAngka[playerid][41]);
			strcat(rechiPhoneCall[playerid], "2");
			EAGLEUI_SetStringPlayer(playerid,HandphoneTelponAngka[playerid][41], rechiPhoneCall[playerid]);
		}
    }
    if(textid == HandphoneTelponAngka[playerid][30])//3
    {
        if(rrechnungPhoneCall[playerid] == 0)
	    {
			strcat(zahPhonelCall[playerid], "3");
			EAGLEUI_ShowPlayer(playerid, HandphoneTelponAngka[playerid][41]);
			strcat(rechiPhoneCall[playerid], "3");
			EAGLEUI_SetStringPlayer(playerid,HandphoneTelponAngka[playerid][41], rechiPhoneCall[playerid]);
		}
		else
		{
            strcat(azahPhonelCall[playerid], "3");
			EAGLEUI_ShowPlayer(playerid, HandphoneTelponAngka[playerid][41]);
			strcat(rechiPhoneCall[playerid], "3");
			EAGLEUI_SetStringPlayer(playerid,HandphoneTelponAngka[playerid][41], rechiPhoneCall[playerid]);
		}
    }
    if(textid == HandphoneTelponAngka[playerid][31])//4
    {
        if(rrechnungPhoneCall[playerid] == 0)
	    {
			strcat(zahPhonelCall[playerid], "4");
			EAGLEUI_ShowPlayer(playerid, HandphoneTelponAngka[playerid][41]);
			strcat(rechiPhoneCall[playerid], "4");
			EAGLEUI_SetStringPlayer(playerid,HandphoneTelponAngka[playerid][41], rechiPhoneCall[playerid]);
		}
		else
		{
            strcat(azahPhonelCall[playerid], "4");
			EAGLEUI_ShowPlayer(playerid, HandphoneTelponAngka[playerid][41]);
			strcat(rechiPhoneCall[playerid], "4");
			EAGLEUI_SetStringPlayer(playerid,HandphoneTelponAngka[playerid][41], rechiPhoneCall[playerid]);
		}
    }
    if(textid == HandphoneTelponAngka[playerid][32])//5
    {
        if(rrechnungPhoneCall[playerid] == 0)
	    {
			strcat(zahPhonelCall[playerid], "5");
			EAGLEUI_ShowPlayer(playerid, HandphoneTelponAngka[playerid][41]);
			strcat(rechiPhoneCall[playerid], "5");
			EAGLEUI_SetStringPlayer(playerid,HandphoneTelponAngka[playerid][41], rechiPhoneCall[playerid]);
		}
		else
		{
            strcat(azahPhonelCall[playerid], "5");
			EAGLEUI_ShowPlayer(playerid, HandphoneTelponAngka[playerid][41]);
			strcat(rechiPhoneCall[playerid], "5");
			EAGLEUI_SetStringPlayer(playerid,HandphoneTelponAngka[playerid][41], rechiPhoneCall[playerid]);
		}
    }
    if(textid == HandphoneTelponAngka[playerid][33])//6
    {
        if(rrechnungPhoneCall[playerid] == 0)
	    {
			strcat(zahPhonelCall[playerid], "6");
			EAGLEUI_ShowPlayer(playerid, HandphoneTelponAngka[playerid][41]);
			strcat(rechiPhoneCall[playerid], "6");
			EAGLEUI_SetStringPlayer(playerid,HandphoneTelponAngka[playerid][41], rechiPhoneCall[playerid]);
		}
		else
		{
            strcat(azahPhonelCall[playerid], "6");
			EAGLEUI_ShowPlayer(playerid, HandphoneTelponAngka[playerid][41]);
			strcat(rechiPhoneCall[playerid], "6");
			EAGLEUI_SetStringPlayer(playerid,HandphoneTelponAngka[playerid][41], rechiPhoneCall[playerid]);
		}
    }
    if(textid == HandphoneTelponAngka[playerid][34])//7
    {
        if(rrechnungPhoneCall[playerid] == 0)
	    {
			strcat(zahPhonelCall[playerid], "7");
			EAGLEUI_ShowPlayer(playerid, HandphoneTelponAngka[playerid][41]);
			strcat(rechiPhoneCall[playerid], "7");
			EAGLEUI_SetStringPlayer(playerid,HandphoneTelponAngka[playerid][41], rechiPhoneCall[playerid]);
		}
		else
		{
            strcat(azahPhonelCall[playerid], "7");
			EAGLEUI_ShowPlayer(playerid, HandphoneTelponAngka[playerid][41]);
			strcat(rechiPhoneCall[playerid], "7");
			EAGLEUI_SetStringPlayer(playerid,HandphoneTelponAngka[playerid][41], rechiPhoneCall[playerid]);
		}
    }
    if(textid == HandphoneTelponAngka[playerid][35])//8
    {
        if(rrechnungPhoneCall[playerid] == 0)
	    {
			strcat(zahPhonelCall[playerid], "8");
			EAGLEUI_ShowPlayer(playerid, HandphoneTelponAngka[playerid][41]);
			strcat(rechiPhoneCall[playerid], "8");
			EAGLEUI_SetStringPlayer(playerid,HandphoneTelponAngka[playerid][41], rechiPhoneCall[playerid]);
		}
		else
		{
            strcat(azahPhonelCall[playerid], "8");
			EAGLEUI_ShowPlayer(playerid, HandphoneTelponAngka[playerid][41]);
			strcat(rechiPhoneCall[playerid], "8");
			EAGLEUI_SetStringPlayer(playerid,HandphoneTelponAngka[playerid][41], rechiPhoneCall[playerid]);
		}
    }
    if(textid == HandphoneTelponAngka[playerid][36])//9
    {
        if(rrechnungPhoneCall[playerid] == 0)
	    {
			strcat(zahPhonelCall[playerid], "9");
			EAGLEUI_ShowPlayer(playerid, HandphoneTelponAngka[playerid][41]);
			strcat(rechiPhoneCall[playerid], "9");
			EAGLEUI_SetStringPlayer(playerid,HandphoneTelponAngka[playerid][41], rechiPhoneCall[playerid]);
		}
		else
		{
            strcat(azahPhonelCall[playerid], "9");
			EAGLEUI_ShowPlayer(playerid, HandphoneTelponAngka[playerid][41]);
			strcat(rechiPhoneCall[playerid], "9");
			EAGLEUI_SetStringPlayer(playerid,HandphoneTelponAngka[playerid][41], rechiPhoneCall[playerid]);
		}
    }
    if(textid == HandphoneTelponAngka[playerid][37])//0
    {
        if(rrechnungPhoneCall[playerid] == 0)
	    {
			strcat(zahPhonelCall[playerid], "#");
			EAGLEUI_ShowPlayer(playerid, HandphoneTelponAngka[playerid][41]);
			strcat(rechiPhoneCall[playerid], "#");
			EAGLEUI_SetStringPlayer(playerid,HandphoneTelponAngka[playerid][41], rechiPhoneCall[playerid]);
		}
		else
		{
            strcat(azahPhonelCall[playerid], "#");
			EAGLEUI_ShowPlayer(playerid, HandphoneTelponAngka[playerid][41]);
			strcat(rechiPhoneCall[playerid], "#");
			EAGLEUI_SetStringPlayer(playerid,HandphoneTelponAngka[playerid][41], rechiPhoneCall[playerid]);
		}
    }
    if(textid == HandphoneTelponAngka[playerid][38])//#
    {
        if(rrechnungPhoneCall[playerid] == 0)
	    {
			strcat(zahPhonelCall[playerid], "0");
			EAGLEUI_ShowPlayer(playerid, HandphoneTelponAngka[playerid][41]);
			strcat(rechiPhoneCall[playerid], "0");
			EAGLEUI_SetStringPlayer(playerid,HandphoneTelponAngka[playerid][41], rechiPhoneCall[playerid]);
		}
		else
		{
            strcat(azahPhonelCall[playerid], "0");
			EAGLEUI_ShowPlayer(playerid, HandphoneTelponAngka[playerid][41]);
			strcat(rechiPhoneCall[playerid], "0");
			EAGLEUI_SetStringPlayer(playerid,HandphoneTelponAngka[playerid][41], rechiPhoneCall[playerid]);
		}
    }
    if(textid == HandphoneTelponAngka[playerid][39])//<
    {
        EAGLEUI_SetStringPlayer(playerid,HandphoneTelponAngka[playerid][41], "");
		EAGLEUI_ShowPlayer(playerid, HandphoneTelponAngka[playerid][41]);
		rechiPhoneCall[playerid] = "";
		rrechnungPhoneCall[playerid] = 0;
		zahPhonelCall[playerid] = "";
		azahPhonelCall[playerid] = "";
    }
    if(textid == HandphoneTelponAngka[playerid][40])//c
    {
        rrechnungPhoneCall[playerid] = 1;
		if(rrechnungPhoneCall[playerid] >= 1)
		{
			if(rrechnungPhoneCall[playerid] == 1)
			{
				ergebPhoneCall[playerid] = strval(zahPhonelCall[playerid]);
    			new targetnumberownerid = GetNumberOwner(zahPhonelCall[playerid]);
       			if(!IsPlayerConnected(targetnumberownerid) || targetnumberownerid == INVALID_PLAYER_ID) return ShowTDN(playerid, NOTIFICATION_ERROR, "Mohon maaf nomor tersebut sedang tidak aktif!");
          		if(!strcmp(AccountData[playerid][pPhone], zahPhonelCall[playerid], false)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat menghubungi diri sendiri!");
            	OnOutcomingCall(playerid, zahPhonelCall[playerid]);
				//callcmd::call(playerid, zahPhonelCall[playerid]);
			}
		}
    }
    if(textid == HandphoneMenuApk[playerid][24])
    {
        Toggle_PhoneTD(playerid, true, "trans");
    }
    if(textid == HandphoneMenuApk[playerid][25])
    {
        Toggle_PhoneTD(playerid, true, "airdrop");
    }
    if(textid == HandphoneTrans[playerid][33])
    {
        if(AccountData[playerid][phoneAirplaneMode]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Smartphone anda sedang Mode Pesawat!");
        if(AccountData[playerid][pTaxiPlayer] != INVALID_PLAYER_ID) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda sedang menjadi penumpang di Trans!");

        ShowPlayerDialog(playerid, DIALOG_TRANSORDER, DIALOG_STYLE_INPUT, ""ALTHF"EAGLE "WHITE" - Pesan Transportasi",
        "Hai, kamu ingin memesan Trans, mau kemana hari ini?", "Input", "Batal");
    }
    // bank
    if(textid == HandphoneMenuApk[playerid][20])
    {
        Toggle_PhoneTD(playerid, true, "bank");
    }

    // spotify
    if(textid == HandphoneMenuApk[playerid][21])
    {
        Toggle_PhoneTD(playerid, true, "spotify");
    }

    // yellow
    if(textid == HandphoneMenuApk[playerid][23])
    {
        Toggle_PhoneTD(playerid, true, "yellow");
    }

    // Twitter
    if(textid == HandphoneMenuApk[playerid][22])
    {
        Toggle_PhoneTD(playerid, true, "twitter");
    }
    if(textid == HandphoneGps[playerid][28])//lokasi umum
    {
        			new minsty[4096];
                    format(minsty, sizeof(minsty), "Nama\tLokasi\tJarak\
                    \nBalai Kota\t%s\t"YELLOW"%.2f m\
                    \n"GRAY"Kantor Kepolisian EAGLE\t"GRAY"%s\t"YELLOW"%.2f m\
                    \nRumah Sakit LS\t%s\t"YELLOW"%.2f m\
                    \n"GRAY"Bengkel Kota\t"GRAY"%s\t"YELLOW"%.2f m\
                    \nAsuransi\t%s\t"YELLOW"%.2f m\
                    \n"GRAY"Asuransi LV\t"GRAY"%s\t"YELLOW"%.2f m\
                    \nRestaurant\t%s\t"YELLOW"%.2f m\
                    \n"GRAY"Pelabuhan\t"GRAY"%s\t"YELLOW"%.2f m\
                    \n"GRAY"Rusun Abah Iwan\t"GRAY"%s\t"YELLOW"%.2f m\
                    \nTerminal Desa\t%s\t"YELLOW"%.2f m\
                    \n"GRAY"Pasar EAGLE ROLEPLAY\t"GRAY"%s\t"YELLOW"%.2f m\
                    \nShowroom EAGLE ROLEPLAY\t%s\t"YELLOW"%.2f m\
                    \n"GRAY"Gudang Warbun\t"GRAY"%s\t"YELLOW"%.2f m\
                    \nGudang Fort Carson\t%s\t"YELLOW"%.2f m\
                    \n"GRAY"OYO Hotels #1\t"GRAY"%s\t"YELLOW"%.2f m\
                    \nRusun Suroh\t%s\t"YELLOW"%.2f m\
                    \n"GRAY"Rusun Jamal\t"GRAY"%s\t"YELLOW"%.2f m\
                    \nToko Olahraga\t%s\t"YELLOW"%.2f m\
                    \n"GRAY"Motel Romo\t"GRAY"%s\t"YELLOW"%.2f m\
                    \nVenue EAGLE ROLEPLAY\t%s\t"YELLOW"%.2f m\
                    \n"GRAY"Rusun BlueDoorz\t"GRAY"%s\t"YELLOW"%.2f m\
                    \nPanggung San Fiero\t%s\t"YELLOW"%.2f m\
                    \nDrag Race Las Venturas\t%s\t"YELLOW"%.2f m\
                    \nBank\t%s\t"YELLOW"%.2f m\
                    \nKarnival\t%s\t"YELLOW"%.2f m\
                    \nBahamas LS\t%s\t"YELLOW"%.2f m\
                    \nBahamas LV\t%s\t"YELLOW"%.2f m\
                    \nBahamas SF\t%s\t"YELLOW"%.2f m\
                    \nComponent Store\t%s\t"YELLOW"%.2f m\
                    ",
                    GetLocation(1483.953, -1744.269, 13.546), GetPlayerDistanceFromPoint(playerid, 1483.953, -1744.269, 13.546), // Balai Kota
                    GetLocation(650.282, -1463.720, 15.439), GetPlayerDistanceFromPoint(playerid, 650.282, -1463.720, 15.439), // Kantor Kepolisian
                    GetLocation(325.7004, -1515.1147, 36.0325), GetPlayerDistanceFromPoint(playerid, 325.7004, -1515.1147, 36.0325), // Rumah Sakit LS
                    GetLocation(-75.1937, 1035.4578, 19.7411), GetPlayerDistanceFromPoint(playerid, -75.1937, 1035.4578, 19.7411), // Bengkel Kota
                    GetLocation(2792.800, -1087.599, 30.818), GetPlayerDistanceFromPoint(playerid, 2792.800, -1087.599, 30.818), // Asuransi LS
                    GetLocation(51.3536, 1222.1011, 18.9170), GetPlayerDistanceFromPoint(playerid, 51.3536, 1222.1011, 18.9170), // Asuransi LV
                    GetLocation(568.4230,-1830.0209,5.6257), GetPlayerDistanceFromPoint(playerid, 568.4230,-1830.0209,5.6257), // Restaurant
                    GetLocation(2767.8762, -2435.3850, 13.6850), GetPlayerDistanceFromPoint(playerid, 2767.8762, -2435.3850, 13.6850), // Pelabuhan
                    GetLocation(2224.1106,-1152.6976,25.7977), GetPlayerDistanceFromPoint(playerid, 2224.1106,-1152.6976,25.7977), // Rusun Abah Iwan
                    GetLocation(88.39, -280.85, 1.57), GetPlayerDistanceFromPoint(playerid, 88.39, -280.85, 1.57), // Terminal Desa
                    GetLocation(1574.7855, 714.9474, 10.8203), GetPlayerDistanceFromPoint(playerid, 1574.7855, 714.9474, 10.8203), // Pasar EAGLE ROLEPLAY
                    GetLocation(398.735, -1341.825, 14.639), GetPlayerDistanceFromPoint(playerid, 398.735, -1341.825, 14.639), // Showroom EAGLE ROLEPLAY
                    GetLocation(2076.8, -2033.33, 13.5469), GetPlayerDistanceFromPoint(playerid, 2076.8, -2033.33, 13.5469), // Gudang Warbun
                    GetLocation(-136.0707, 1116.6332, 20.1966), GetPlayerDistanceFromPoint(playerid, -136.0707, 1116.6332, 20.1966), // Gudang Fort Carson
                    GetLocation(2223.5115, -1143.1807, 25.7969), GetPlayerDistanceFromPoint(playerid, 2223.5115, -1143.1807, 25.7969), // OYO Hotels #1
                    GetLocation(221.2156, -117.9283, 1.5781), GetPlayerDistanceFromPoint(playerid, 221.2156, -117.9283, 1.5781), // Rusun Suroh
                    GetLocation(2183.3953, -1794.7335, 13.3606), GetPlayerDistanceFromPoint(playerid, 2183.3953, -1794.7335, 13.3606), // Rusun Jamal
                    GetLocation(1386.4347, 293.3129, 19.5469), GetPlayerDistanceFromPoint(playerid, 1386.4347, 293.3129, 19.5469), // Toko Olahraga
                    GetLocation(-3.3894, 1212.4326, 19.3527), GetPlayerDistanceFromPoint(playerid, -3.3894, 1212.4326, 19.3527), // Motel Romo
                    GetLocation(836.0340, -2008.6443, 12.8672), GetPlayerDistanceFromPoint(playerid, 836.0340, -2008.6443, 12.8672), // Venue EAGLE ROLEPLAY
                    GetLocation(2613.9070, 732.6111, 10.8203), GetPlayerDistanceFromPoint(playerid, 2613.9070, 732.6111, 10.8203), // Rusun BlueDoorz
                    GetLocation(-2882.8586, 464.0963, 4.9141), GetPlayerDistanceFromPoint(playerid, -2882.8586, 464.0963, 4.9141), // Panggung San Fiero
                    GetLocation(2832.8967, 1903.7570, 10.8203), GetPlayerDistanceFromPoint(playerid, 2832.8967, 1903.7570, 10.8203), // Drag Race Las Venturas
                    GetLocation(2166.895, 952.260, 10.827), GetPlayerDistanceFromPoint(playerid, 2166.895, 952.260, 10.827), // Bank
                    GetLocation(2287.270, 618.831, 10.829), GetPlayerDistanceFromPoint(playerid, 2287.270, 618.831, 10.829), // Karnival
                    GetLocation(2422.3745,-1234.7301,24.5338), GetPlayerDistanceFromPoint(playerid, 2422.3745,-1234.7301,24.5338), // Bahamas LS
                    GetLocation(2222.4739, 1837.4940, 10.8203), GetPlayerDistanceFromPoint(playerid, 2222.4739, 1837.4940, 10.8203), // Bahamas LV
                    GetLocation(-2442.7500, 755.2680, 35.2719), GetPlayerDistanceFromPoint(playerid, -2442.7500, 755.2680, 35.2719),
                    GetLocation(Component[ComponentPos][0], Component[ComponentPos][1], Component[ComponentPos][2]), GetPlayerDistanceFromPoint(playerid, Component[ComponentPos][0], Component[ComponentPos][1], Component[ComponentPos][2]));
                    ShowPlayerDialog(playerid, LokasiUmum, DIALOG_STYLE_TABLIST_HEADERS, ""ALTHF"EAGLE "WHITE"- GPS", minsty, "Pilih", "Batal");
    }
    if(textid == HandphoneGps[playerid][29])//lokasi garkot
    {
        			new id = GarkotNearby(playerid);
                    if(id == -1) return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak ada Garasi Umum terdekat dari posisi anda!");

                    SetPlayerRaceCheckpoint(playerid, 1, PublicGarage[id][pgPOS][0], PublicGarage[id][pgPOS][1], PublicGarage[id][pgPOS][2], PublicGarage[id][pgPOS][0], PublicGarage[id][pgPOS][1], PublicGarage[id][pgPOS][2], 5.0);
                    pMapCP[playerid] = true;
                    Info(playerid, "Silahkan ikuti tanda blip yang sudah ditandai pada map anda");
    }
    if(textid == HandphoneGps[playerid][30])//lokasi sampah
    {
        			new id = NearbyTrash(playerid);
                    if(id == -1) return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak ada Tong Sampah terdekat dari posisi anda!");
                    
                    SetPlayerRaceCheckpoint(playerid, 1, TrashData[id][trashPos][0], TrashData[id][trashPos][1], TrashData[id][trashPos][2], 0.0, 0.0, 0.0 ,5.0);
                    pMapCP[playerid] = true;
                    Info(playerid, "Silahkan ikuti tanda blip yang sudah ditandai pada map anda");
    }
    if(textid == HandphoneGps[playerid][31])//lokasi pekerjaan
    {
        			new minsty[4012];
                    format(minsty, sizeof(minsty), "Pekerjaan\tNama\tLokasi\tJarak\
                    \n"GRAY"Electrican Job\t"GRAY"( Multiplayer Job )\t"GRAY"%s\t"YELLOW"%.2f m\
                    \nSupir Bus\tTerminal EAGLE ROLEPLAY\t%s\t"YELLOW"%.2f m\
                    \n"GRAY"Tukang Ayam #1\t"GRAY"Kandang Ayam EAGLE ROLEPLAY\t%s\t"YELLOW"%.2f m\
                    \nTukang Ayam #2\tKantor Ayam EAGLE ROLEPLAY\t%s\t"YELLOW"%.2f m\
                    \n"GRAY"Petani #1\t"GRAY"Pembelian Bibit\t%s\t"YELLOW"%.2f m\
                    \nPetani #2\tLadang Tanaman\t%s\t"YELLOW"%.2f m\
                    \n"GRAY"Petani #3\t"GRAY"Olah Tanaman\t%s\t"YELLOW"%.2f m\
                    \nTukang Kayu\tHutan Kayu\t%s\t"YELLOW"%.2f m\
                    \n"GRAY"Kargo\t"GRAY"Pengambilan Truck Kargo\t%s\t"YELLOW"%.2f m\
                    \nPemerah Sapi\tLokasi Pemerahan\t%s\t"YELLOW"%.2f m\
                    \n"GRAY"Penambang #1\t"GRAY"Pertambangan EAGLE ROLEPLAY\t%s\t"YELLOW"%.2f m\
                    \nPenambang #2\tPencucian Batu\t%s\t"YELLOW"%.2f m\
                    \n"GRAY"Penambang #3\t"GRAY"Peleburan Batu\t%s\t"YELLOW"%.2f m\
                    \nPenjahit #1\tKantor Penjahit\t%s\t"YELLOW"%.2f m\
                    \n"GRAY"Penjahit #2\t"GRAY"Penjualan Pakaian\t%s\t"YELLOW"%.2f m\
                    \nRecycler #1\tTempat Penyortiran\t%s\t"YELLOW"%.2f m\
                    \n"GRAY"Recycler #2\t"GRAY"Tempat Daur Ulang\t%s\t"YELLOW"%.2f m\
                    \nTukang Minyak #1\tAmbil Minyak\t%s\t"YELLOW"%.2f m\
                    \n"GRAY"Tukang Minyak #2\t"GRAY"Refined Minyak\t%s\t"YELLOW"%.2f m\
                    \nTukang Minyak #3\tMixxing Minyak\t%s\t"YELLOW"%.2f m\
                    \n"GRAY"Tukang Minyak #4\t"GRAY"Penjualan Gas\t%s\t"YELLOW"%.2f m\
                    \nNelayan #1\tRental Perahu\t%s\t"YELLOW"%.2f m\
                    \n"GRAY"Nelayan #2\t"GRAY"Penangkapan Ikan\t"GRAY"%s\t"YELLOW"%.2f m\
                    \nTrashmaster\tSidejob\t%s\t"YELLOW"%.2f m\
                    \n"GRAY"Mower\t"GRAY"Sidejob\t%s\t"YELLOW"%.2f m\
                    \nSweeper\tSidejob\t%s\t"YELLOW"%.2f m\
                    \n"GRAY"Delivery\t"GRAY"Sidejob\t%s\t"YELLOW"%.2f m\
                    \nForklift\tSidejob\t%s\t"YELLOW"%.2f m\
                    ",
                    GetLocation(-2521.1821, -621.8853, 132.7418), GetPlayerDistanceFromPoint(playerid, -2521.1821, -621.8853, 132.7418),
                    GetLocation(96.0680,-272.6256,1.5781), GetPlayerDistanceFromPoint(playerid, 96.0680,-272.6256,1.5781),
                    GetLocation(1546.5872,28.7098,24.1406), GetPlayerDistanceFromPoint(playerid, 1546.5872,28.7098,24.1406),
                    GetLocation(1911.8618,164.4111,37.1539), GetPlayerDistanceFromPoint(playerid, 1911.8618,164.4111,37.1539),
                    GetLocation(-547.7806, -185.1288, 78.4063), GetPlayerDistanceFromPoint(playerid, -547.7806, -185.1288, 78.4063),
                    GetLocation(-376.1269, -1439.9231, 25.7266), GetPlayerDistanceFromPoint(playerid, -376.1269, -1439.9231, 25.7266),
                    GetLocation(3.9224, 66.8390, 3.1172), GetPlayerDistanceFromPoint(playerid, 3.9224, 66.8390, 3.1172),
                    GetLocation(-439.7503, -62.3335, 58.9720), GetPlayerDistanceFromPoint(playerid, -439.7503, -62.3335, 58.9720),
                    GetLocation(-1704.2260, 49.6503, 3.5495), GetPlayerDistanceFromPoint(playerid, -1704.2260, 49.6503, 3.5495),
                    GetLocation(306.8608,1141.2626,8.5859), GetPlayerDistanceFromPoint(playerid, 306.8608,1141.2626,8.5859),
                    GetLocation(686.9853,895.7302,-39.5328), GetPlayerDistanceFromPoint(playerid, 686.9853,895.7302,-39.5328),
                    GetLocation(-412.7031, 1197.8976, 2.2932), GetPlayerDistanceFromPoint(playerid, -412.7031, 1197.8976, 2.2932),
                    GetLocation(2182.6780,-2259.5010,13.3878), GetPlayerDistanceFromPoint(playerid, 2182.6780,-2259.5010,13.3878),
                    GetLocation(2348.7112, -82.1600, 26.3359), GetPlayerDistanceFromPoint(playerid, 2348.7112, -82.1600, 26.3359),
                    GetLocation(676.1796,-619.9467,16.3359), GetPlayerDistanceFromPoint(playerid, 676.1796,-619.9467,16.3359),
                    GetLocation(2297.9268, 2764.1992, 10.8203), GetPlayerDistanceFromPoint(playerid, 2297.9268, 2764.1992, 10.8203),
                    GetLocation(-31.6359, 1386.9554, 9.1719), GetPlayerDistanceFromPoint(playerid, -31.6359, 1386.9554, 9.1719),
                    GetLocation(471.9127, 1299.1512, 9.7176), GetPlayerDistanceFromPoint(playerid, 471.9127, 1299.1512, 9.7176),
                    GetLocation(497.5595, 1518.7350, 1.0000), GetPlayerDistanceFromPoint(playerid, 497.5595, 1518.7350, 1.0000),
                    GetLocation(279.6849, 1348.9515, 10.5859), GetPlayerDistanceFromPoint(playerid, 279.6849, 1348.9515, 10.5859),
                    GetLocation(1929.94, -1776.33, 13.5469), GetPlayerDistanceFromPoint(playerid, 1929.94, -1776.33, 13.5469),
                    GetLocation(111.3999, -1895.6553, 2.9408), GetPlayerDistanceFromPoint(playerid, 111.3999, -1895.6553, 2.9408),
                    GetLocation(352.4596, -2669.7722, -0.0401), GetPlayerDistanceFromPoint(playerid, 352.4596, -2669.7722, -0.0401),
                    GetLocation(1037.3827, -305.1682, 74.0922), GetPlayerDistanceFromPoint(playerid, 1037.3827, -305.1682, 74.0922),
                    GetLocation(2118.1814, -1188.9286, 23.9358), GetPlayerDistanceFromPoint(playerid, 2118.1814, -1188.9286, 23.9358),
                    GetLocation(604.9979, -1508.6365, 14.9549), GetPlayerDistanceFromPoint(playerid, 604.9979, -1508.6365, 14.9549),
                    GetLocation(1001.3441, -1445.8391, 13.5469), GetPlayerDistanceFromPoint(playerid, 1001.3441, -1445.8391, 13.5469),
                    GetLocation(-1723.7289, -63.5671, 3.5547), GetPlayerDistanceFromPoint(playerid, -1723.7289, -63.5671, 3.5547));
                    ShowPlayerDialog(playerid, LokasiPekerjaan, DIALOG_STYLE_TABLIST_HEADERS, ""ALTHF"EAGLE "WHITE"- GPS", minsty, "Pilih", "Batal");
    }
    if(textid == HandphoneGps[playerid][32])//lokasi Hobi
    {
        			new minsty[1218];
                    format(minsty, sizeof(minsty), "Hobi\tNama\tLokasi\tJarak\
                    \nMemancing #1\tSpot Pemancingan\t%s\t"YELLOW"%.2f m\
                    \n"GRAY"Memancing #2\t"GRAY"Penjualan Ikan\t%s\t"YELLOW"%.2f m\
                    \nBerburu #1\tSpot Perburuan\t%s\t"YELLOW"%.2f m\
                    \n"GRAY"Berburu #2\t"GRAY"Penjualan Hasil Buruan\t%s\t"YELLOW"%.2f m\
                    ",
                    GetLocation(383.1566,-2075.2007,7.8359), GetPlayerDistanceFromPoint(playerid, 383.1566,-2075.2007,7.8359),
                    GetLocation(1052.0156,-345.4073,73.9922), GetPlayerDistanceFromPoint(playerid, 1052.0156,-345.4073,73.9922),
                    GetLocation(-387.3126,-2259.8279,45.5646), GetPlayerDistanceFromPoint(playerid, -387.3126,-2259.8279,45.5646),
                    GetLocation(-1693.3431,-88.9088,3.5654), GetPlayerDistanceFromPoint(playerid, -1693.3431,-88.9088,3.5654));
                    ShowPlayerDialog(playerid, LokasiHobi, DIALOG_STYLE_TABLIST_HEADERS, ""ALTHF"EAGLE "WHITE"- GPS", minsty, "Pilih", "Batal");
    }
    if(textid == HandphoneGps[playerid][33])//lokasi Warung
    {
        			new id = WarungNearby(playerid);
                    if(id == -1) return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak ada Warung terdekat dari posisi anda!");

                    SetPlayerRaceCheckpoint(playerid, 1, WarungData[id][warungPOS][0], WarungData[id][warungPOS][1], WarungData[id][warungPOS][2], WarungData[id][warungPOS][0], WarungData[id][warungPOS][1], WarungData[id][warungPOS][2], 5.0);
                    pMapCP[playerid] = true;
                    Info(playerid, "Silahkan ikuti tanda blip yang sudah ditandai pada map anda");
    }
    if(textid == HandphoneGps[playerid][34])//lokasi Pom
    {
        			new id = GasFuelNearby(playerid);
                    if(id == -1) return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak ada Pom Bensin terdekat dari posisi anda!");

                    SetPlayerRaceCheckpoint(playerid, 1, PomNearest[id][0], PomNearest[id][1], PomNearest[id][2], PomNearest[id][0], PomNearest[id][1], PomNearest[id][2], 5.0);
                    pMapCP[playerid] = true;
                    Info(playerid, "Silahkan ikuti tanda blip yang sudah ditandai pada map anda");
    }
    if(textid == HandphoneGps[playerid][35])//lokasi toko
    {
        			ShowPlayerDialog(playerid, LokasiPertokoan, DIALOG_STYLE_LIST, ""ALTHF"EAGLE "WHITE" - GPS",
                    "Toko Pakaian Terdekat\
                    \n"GRAY"Toko Elektronik Terdekat", "Pilih", "Batal");
    }
    if(textid == HandphoneGps[playerid][36])//lokasi atm
    {
        			new id = NearestAtm(playerid);
                    if(id == -1) return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak ada ATM terdekat dari posisi anda!");
                    
                    SetPlayerRaceCheckpoint(playerid, 1, AtmData[id][atmX], AtmData[id][atmY], AtmData[id][atmZ], AtmData[id][atmX], AtmData[id][atmY], AtmData[id][atmZ], 5.0);
                    pMapCP[playerid] = true;
                    Info(playerid, "Silahkan ikuti tanda blip yang sudah ditandai pada map anda");
    }
    if(textid == HandphoneGps[playerid][37])//lokasi Modshop
    {
        			SetPlayerRaceCheckpoint(playerid, 1, 1101.4049, -1233.4498, 15.8203, 1101.4049, -1233.4498, 15.8203, 5.0);
                    pMapCP[playerid] = true;
                    Info(playerid, "Silahkan ikuti tanda blip yang sudah ditandai pada map anda");
    }
    if(textid == HandphoneGps[playerid][48])//disable cekpoint
    {
        			DisablePlayerRaceCheckpoint(playerid);
                    ShowTDN(playerid, NOTIFICATION_SUKSES, "Berhasil menghapus Checkpoint");
                    pMapCP[playerid] = false;
    }
    if(textid == HandphoneGps[playerid][49])//disable shareloc
    {
        			if(!IsValidDynamicMapIcon(SharelocSender[playerid]))
                    {
                        return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak ada yang mengirimkan anda share lokasi!");
                    }
                    else
                    {
                        ShowTDN(playerid, NOTIFICATION_SUKSES, "Berhasil menghapus Shareloc!");

                        DestroyDynamicMapIcon(SharelocSender[playerid]);
                        SharelocSender[playerid] = INVALID_STREAMER_ID;
                        SharelocTimer[playerid] = 0;
                    }
    }
    if(textid == HandphoneSetting[playerid][13] || textid ==  HandphoneTrans[playerid][13] || textid ==  HandphoneGps[playerid][13] || textid ==  HandphoneAirdrop[playerid][13] || textid == HandphoneSpotify[playerid][13] \
    || textid == HandphoneMbanking[playerid][13] || textid == HandphoneMenuGame[playerid][13] ||  textid ==  HandphoneTelponAngka[playerid][13] || textid == HandphoneMenuVehicle[playerid][13] \
     ||  textid == HandphoneWhatsapp[playerid][13] || textid == HandphoneKontak[playerid][13] || textid == HandphoneAds[playerid][13] || textid == HandphoneTwitter[playerid][13])
    {
        Toggle_PhoneTD(playerid, true, "aplikasi");
    }
    if(textid == HandphoneMenuApk[playerid][13])
    {
        Toggle_PhoneTD(playerid, false);
        EAGLEUI_Cancel(playerid);
        ApplyAnimation(playerid, "CARRY", "crry_prtial", 4.0, 0, 0, 0, 0, 0, 1);
        RemovePlayerAttachedObject(playerid, 9);
        AccountData[playerid][phoneShown] = false;
		ShowUiSegel(playerid, true);
		AllGui_Status(playerid, true);
        SendRPMeAboveHead(playerid, "Menutup HP Miliknya.", X11_PLUM1);
    }

    if(textid == HandphoneMenuApk[playerid][26])//telepon
    {
        Toggle_PhoneTD(playerid, true, "telpon");
        //ShowPlayerDialog(playerid, DialogTelepon, DIALOG_STYLE_INPUT, ""ALTHF"EAGLE "WHITE" - Telepon", "Mohon masukan nomor telepon yang ingin anda hubungi:", "Telfon", "Batal");
    }
    if(textid == HandphoneMenuApk[playerid][27])//whatsapp
    {
        Toggle_PhoneTD(playerid, true, "whatsapp");
    }
    if(textid == HandphoneMenuApk[playerid][28])
    {
        if(BusIndex[playerid] != 0) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda sedang bekerja sebagai supir bus!");
        if(DurringSweeping[playerid]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda sedang bekerja sebagai pembersih jalan!");
        if(PlayerKargoVars[playerid][KargoStarted]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda sedang bekerja sebagai Supir Kargo!");

        if(AccountData[playerid][pFaction] == FACTION_EMS && AccountData[playerid][pDutyEms]) {
            Dialog_Show(playerid, GpsMenu, DIALOG_STYLE_LIST, ""ALTHF"EAGLE "WHITE" - Menu Gps",
            "Lokasi GPS\n"GRAY"Signal Emergency (EMS)", "Pilih", "Batal");
        }
		else
		{
		    Toggle_PhoneTD(playerid, true, "gps");
            /*ShowPlayerDialog(playerid, LokasiGps, DIALOG_STYLE_LIST, ""ALTHF"EAGLE "WHITE" - Lokasi",
            "Lokasi Umum\
            \n"GRAY"Lokasi Pekerjaan\
            \nLokasi Hobi\
            \n"GRAY"Lokasi Pertokoan\
            \nATM Terdekat\
            \n"GRAY"Garasi Umum Terdekat\
            \nTong Sampah Terdekat\
            \n"GRAY"Warung Terdekat\
            \nPom Bensin Terdekat\
            \n"GRAY"Bengkel Modshop\
            \nRumah Saya\
            \n"RED"(Disable Checkpoint)\
            \n"RED"(Disable Shareloc)", "Pilih", "Batal");*/
        }
    }

	if(textid == HandphoneMbanking[playerid][39])
    {
		ShowPlayerDialog(playerid, DialogTransfer, DIALOG_STYLE_INPUT, ""ALTHF"EAGLE "WHITE" - Transfer",
        "Mohon masukkan nomor rekening yang ingin anda transfer:", "Submit", "Batal");
    }
    if(textid == HandphoneMbanking[playerid][40])//delay
    {
		new shstr[255];
		format(shstr, sizeof(shstr), "Kegiatan\tWaktu (Menit)\
		\nMower Sidejob\t%d\
		\n"GRAY"Delivery Sidejob\t"GRAY"%d\
		\nSweeper Sidejob\t%d\
		\n"GRAY"Forklift Sidejob\t"GRAY"%d\
		\nTrashmaster Sidejob\t%d",
		AccountData[playerid][pMowerTime]/60,
		AccountData[playerid][pDeliveryTime]/60,
		AccountData[playerid][pSweeperTime]/60,
		AccountData[playerid][pForkliftTime]/60,
		AccountData[playerid][pTrashmasterDelay]/60);
		ShowPlayerDialog(playerid, DIALOG_UNUSED, DIALOG_STYLE_TABLIST_HEADERS, ""ALTHF"EAGLE "WHITE" - Waktu Delay", shstr, "Tutup", "");
    }
    if(textid == HandphoneMbanking[playerid][44])//invoice
    {
		ShowPlayerInvoice(playerid);
    }
	//kontak
    new page = PlayerContactPage[playerid];
    new start_index2 = page * 7;
	new end_index = start_index2 + 7;

	for (new i = start_index2; i < end_index && i < MAX_CONTACTS; i ++) if (ContactData[playerid][i][contactExists] && ContactData[playerid][i][contactOwnerID] == AccountData[playerid][pID])
    {
        if(textid == HandphoneKontak[playerid][index_kotak_kontak + (i - start_index2)])
        {
            if(ContactData[playerid][i][contactExists])
            {
                AccountData[playerid][pContact] = i;

                ShowPlayerDialog(playerid, DialogContactMenu, DIALOG_STYLE_LIST, sprintf(""ALTHF"EAGLE "WHITE" - %s", ContactData[playerid][AccountData[playerid][pContact]][contactName]),
                "Panggil\
                \n"GRAY"Shareloc\
                \nEdit Nama Kontak\
                \n"GRAY"Edit Nomor Kontak\
                \nBlokir/Buka Blokir Kontak\
                \n"GRAY"Hapus Kontak", "Pilih", "Batal");
            }
        }
    }
    for (new i = start_index2; i < end_index && i < MAX_CONTACTS; i ++) if (ContactData[playerid][i][contactExists] && ContactData[playerid][i][contactOwnerID] == AccountData[playerid][pID])
    {
        if(textid == HandphoneWhatsapp[playerid][index_kotak_whatsapp + (i - start_index2)])
        {
            if(ContactData[playerid][i][contactExists])
            {
                    AccountData[playerid][pContact] = i;
                    new cidt = AccountData[playerid][pContact];
            		new ownernumber = GetNumberOwner(ContactData[playerid][cidt][contactNumber]);
                	if(AccountData[playerid][phoneAirplaneMode])
                        return ShowTDN(playerid, NOTIFICATION_ERROR, "Smartphone sedang dalam Mode Pesawat!");

                    if(!IsPlayerConnected(ownernumber)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Mohon maaf nomor tersebut tidak aktif di kota!");
                    if(CheckNumberBlocked(playerid, AccountData[ownernumber][pPhone])) return ShowTDN(playerid, NOTIFICATION_ERROR, "Nomor tersebut anda blokir, buka terlebih dahulu!");

                    new query[525], harlem[128];
                    mysql_format(g_SQL, query, sizeof(query), "SELECT * FROM `whatsapp_chats` WHERE `ID`=%d ORDER BY `chatTimestamp` ASC LIMIT 30", AccountData[playerid][pMaskID]+AccountData[ownernumber][pMaskID]);
                    mysql_query(g_SQL, query);
                    if(cache_num_rows())
                    {
                        if(cache_num_rows() >= 30)
                        {
                            mysql_format(g_SQL, harlem, sizeof(harlem), "DELETE FROM `whatsapp_chats` WHERE `ID`=%d", AccountData[playerid][pMaskID]+AccountData[ownernumber][pMaskID]);
                            mysql_tquery(g_SQL, harlem);
                        }

                        new list[2500], date[64], issuer[24], watext[128];

                        ContactData[playerid][cidt][contactUnread] = 0;
                        mysql_format(g_SQL, query, sizeof(query), "UPDATE `contacts` SET `contactUnread`= 0 WHERE `contactID`=%d", ContactData[playerid][cidt][contactID]);
                        mysql_tquery(g_SQL, query);

                        format(list, sizeof(list), "Tanggal\tPengirim\tPesan\n");
                        for(new iv; iv < cache_num_rows(); ++iv)
                        {
                            cache_get_value_name(iv, "chatTimestamp", date);
                            cache_get_value_name(iv, "chatSender", issuer);
                            cache_get_value_name(iv, "chatMessage", watext);

                            format(list, sizeof(list), "%s%s\t%s\t%s\n", list, date, issuer, watext);
                        }
                        new title[100];
                        format(title, sizeof(title), "WhatsApp Chat - %s", ContactData[playerid][cidt][contactName]);
                        ShowPlayerDialog(playerid, DIALOG_WHATSAPP_CHAT, DIALOG_STYLE_TABLIST_HEADERS, title, list, "Kirim", "Kembali");
                    }
                    else
                    {
                        new list[208], title[102];
                        format(list, sizeof(list), "Tanggal\tPengirim\tPesan\n");
                        format(list, sizeof(list), "%sPesan dan panggilan terenkripsi secara end-to-end.", list);
                        format(title, sizeof(title), "WhatsApp Chat - %s", ContactData[playerid][cidt][contactName]);
                        ShowPlayerDialog(playerid, DIALOG_WHATSAPP_CHAT_EMPTY, DIALOG_STYLE_TABLIST_HEADERS, title, list, "Kirim", "Kembali");
                    }
                    AccountData[playerid][CurrentlyReadWA] = true;
            }
        }
    }
    // Twitter

    if(textid == HandphoneTwitter[playerid][60])
    {
        TweetPage[playerid] -= 1;
        ShowPlayerTwitterPage(playerid);
    }
    if(textid == HandphoneTwitter[playerid][59])
    {
        TweetPage[playerid] += 1;
        ShowPlayerTwitterPage(playerid);
    }
    if(textid == HandphoneTwitter[playerid][29])
    {
        ShowPlayerDialog(playerid, DIALOG_TWITTER_POST_SEND, DIALOG_STYLE_INPUT, ""ALTHF"EAGLE "WHITE" - Kirim Tweet", "Masukkan Tweet yang ingin anda buat dibawah sini:", "Kirim", "Kembali");
    }
    if(textid == HandphoneAds[playerid][60])
    {
        YellowPage[playerid] -= 1;
        ShowPlayerYellowsPage(playerid);
    }
    if(textid == HandphoneAds[playerid][59])
    {
        YellowPage[playerid] += 1;
        ShowPlayerYellowsPage(playerid);
    }

    if(textid == HandphoneAds[playerid][29])
    {
        ShowPlayerDialog(playerid, DIALOG_YELLOW_PAGE_MENU, DIALOG_STYLE_LIST, ""ALTHF"EAGLE "WHITE" - Yellow Pages",
        "Melihat antrian iklan\nKirim iklan baru", "Pilih", "Batal");    }
    // Phone
    if(textid == HandphoneKontak[playerid][40])
    {
        PlayerContactPage[playerid] --;
        ShowContactList(playerid);
    }

    if(textid == HandphoneKontak[playerid][39])
    {
        new next_page = PlayerContactPage[playerid] + 1;
        new start_index = next_page * 7;
        if(ContactData[playerid][start_index][contactExists])
        {
            PlayerContactPage[playerid] ++;
            ShowContactList(playerid);
        }
        else
        {
            PlayerContactPage[playerid] = PlayerContactPage[playerid];
            ShowContactList(playerid);
            Error(playerid, "Anda tidak memiliki kontak lagi di halaman selanjutnya!");
        }
    }
    if(textid == HandphoneWhatsapp[playerid][40])
    {
        PlayerContactPage[playerid] --;
        ShowWhatsappList(playerid);
    }

    if(textid == HandphoneWhatsapp[playerid][39])
    {
        new next_page = PlayerContactPage[playerid] + 1;
        new start_index = next_page * 7;
        if(ContactData[playerid][start_index][contactExists])
        {
            PlayerContactPage[playerid] ++;
            ShowWhatsappList(playerid);
        }
        else
        {
            PlayerContactPage[playerid] = PlayerContactPage[playerid];
            ShowWhatsappList(playerid);
            Error(playerid, "Anda tidak memiliki konta/pesan lagi di halaman selanjutnya!");
        }
    }

    if(textid == HandphoneKontak[playerid][29])
    {
        ShowPlayerDialog(playerid, DIALOG_ADD_CONTACT, DIALOG_STYLE_INPUT, ""ALTHF"EAGLE "WHITE" - Tambah Kontak",
                    "Mohon masukkan nama kontak yang akan disimpan dibawah ini:", "Set", "Batal");
    }

    if(textid == HandphoneLockScreen[playerid][13])
    {
        Toggle_PhoneTD(playerid, true, "aplikasi");
    }

    if(textid == HandphoneSetting[playerid][27])
    {
		static minsty[200];
  		format(minsty, sizeof(minsty), "Aevhone X25 Milik: %s\
    	\nNomor Telepon: %s\
     	\nNama Series Model: X25\
      	\nNomor Serial: VR81AXS23S33\nIMEI (slot 1): 7182991211\nIMEI (slot 2): 9928192882", ReturnName(playerid), AccountData[playerid][pPhone]);
       	ShowPlayerDialog(playerid, DIALOG_UNUSED, DIALOG_STYLE_MSGBOX, ""ALTHF"EAGLE "WHITE" - Tentang Ponsel", minsty, "Tutup", "");
    }
    if(textid == HandphoneSetting[playerid][28])
    {
		Dialog_Show(playerid, PhoneRingtone, DIALOG_STYLE_INPUT, ""ALTHF"EAGLE "WHITE" - Ubah Nada Dering",
  		"Mohon masukkan link mp3 yang sudah anda upload dimanapun itu untuk dijadikan sebagai nada dering saat ada panggilan masuk\
    	\nNOTE: Tidak dapat memasukkan link langsung dari YouTube!", "Submit", "Batal");
    }
    if(textid == HandphoneSetting[playerid][29])
    {
		AccountData[playerid][phoneCallRingtone][0] = EOS;
  		ShowTDN(playerid, NOTIFICATION_SUKSES, "Berhasil menghapus nada dering!");
    }
    if(textid == HandphoneSetting[playerid][30])
    {
		switch(AccountData[playerid][phoneAirplaneMode])
  		{
    		case false:
      		{
        		AccountData[playerid][phoneAirplaneMode] = true;
          		ShowTDN(playerid, NOTIFICATION_INFO, "Anda mengaktifkan Mode Pesawat");
        	}
         	case true:
          	{
           		AccountData[playerid][phoneAirplaneMode] = false;
             	ShowTDN(playerid, NOTIFICATION_INFO, "Anda menonaktifkan Mode Pesawat");
           	}
    	}
    }
    if(textid == HandphoneSpotify[playerid][32])//play
    {
    }
    if(textid == HandphoneSpotify[playerid][36])//boombox
    {
		if(!AccountData[playerid][pVip]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda bukan pengguna VIP!");

        if(GetPVarType(playerid, "PlacedBB"))
		{
			if(IsPlayerInRangeOfPoint(playerid, 3.0, GetPVarFloat(playerid, "BBX"), GetPVarFloat(playerid, "BBY"), GetPVarFloat(playerid, "BBZ")))
			{
				ShowPlayerDialog(playerid, DANN_BOOMBOX, DIALOG_STYLE_LIST, ""ALTHF"EAGLE "WHITE" - Boombox", "Matikan Boombox\nPutar Musik", "Select", "Cancel");
			}
			else
			{
	   			return ShowTDN(playerid, NOTIFICATION_ERROR, "~g~[!]~w~: Kamu tidak berada didekat boombox mu!");
			}
	    }
	    else
	    {
	    	ShowTDN(playerid, NOTIFICATION_ERROR, "Kamu tidak menaruh boombox sebelumnya!");
		}
    }
    if(textid == HandphoneSpotify[playerid][37])//erapohone
    {
		if(AccountData[playerid][pEarphone] != 1) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak memiliki Earphone!");

        ShowPlayerDialog(playerid, DialogSpotify, DIALOG_STYLE_LIST, ""ALTHF"EAGLE "WHITE" - Spotify", "Matikan Musik\nPutar Musik", "Select", "Cancel");
    }
    if(textid == RedButtonincomingCall[playerid])
    {
        foreach(new i : Player) if(IsPlayerConnected(i) && AccountData[i][phoneCallingWithPlayerID] == playerid)
        {
            new phoneCallFromID = i;
            ApplyAnimation(phoneCallFromID, "ped", "phone_out", 4.0, 0, 0, 0, 0, 0, 1);
            RemovePlayerAttachedObject(phoneCallFromID, 9);

            ApplyAnimation(playerid, "ped", "phone_out", 4.0, 0, 0, 0, 0, 0, 1);
            RemovePlayerAttachedObject(playerid, 9);

            if(AccountData[playerid][phoneShown]) {
                AccountData[playerid][phoneShown] = false;
            }

            if(AccountData[phoneCallFromID][phoneShown]) {
                AccountData[phoneCallFromID][phoneShown] = false;
            }

            HideAllSmartphone(playerid), HideAllSmartphone(phoneCallFromID);
            Toggle_CallTD(playerid, false), Toggle_CallTD(phoneCallFromID, false);
            EAGLEUI_Cancel(playerid), EAGLEUI_Cancel(phoneCallFromID);
            EAGLEUI_HidePlayer(playerid, RedButtonincomingCall[playerid]);
            EAGLEUI_HidePlayer(playerid, GreenButtonincomingCall[playerid]);
            EAGLEUI_HidePlayer(phoneCallFromID, RedButtonoutComingCall[playerid]);
            EAGLEUI_HidePlayer(playerid, GreenCButtonincomingCall[playerid]);
            EAGLEUI_HidePlayer(playerid, RedCButtonincomingCall[playerid]);
            EAGLEUI_ShowPlayer(playerid, RedCButtonoutComingCall[playerid]);
            StopAudioStreamForPlayer(playerid);

            AccountData[playerid][phoneCallingTime] = 0;
            AccountData[playerid][phoneCallingWithPlayerID] = INVALID_PLAYER_ID;
            AccountData[playerid][phoneIncomingCall] = false;
            AccountData[playerid][phoneIncomingCall] = false;

            AccountData[phoneCallFromID][phoneCallingTime] = 0;
            AccountData[phoneCallFromID][phoneCallingWithPlayerID] = INVALID_PLAYER_ID;
            AccountData[phoneCallFromID][phoneIncomingCall] = false;
            AccountData[phoneCallFromID][phoneIncomingCall] = false;
        }
    }

    if(textid == GreenButtonincomingCall[playerid])
    {
        if(AccountData[playerid][phoneDurringConversation]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda sedang dalam percakapan!");
        if(AccountData[playerid][pInjured]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda sedang pingsan tidak dapat mengangkat panggilan!");
        foreach(new i : Player) if (IsPlayerConnected(i) && AccountData[i][phoneCallingWithPlayerID] == playerid)
        {
            new callingWithPlayerID = i;
            AccountData[playerid][phoneDurringConversation] = true;
            AccountData[playerid][phoneIncomingCall] = false;
            AccountData[playerid][phoneCallingTime] = 0;
            AccountData[playerid][phoneCallingWithPlayerID] = callingWithPlayerID;

            AccountData[callingWithPlayerID][phoneDurringConversation] = true;
            AccountData[callingWithPlayerID][phoneIncomingCall] = false;
            AccountData[callingWithPlayerID][phoneCallingTime] = 0;
            AccountData[callingWithPlayerID][phoneCallingWithPlayerID] = playerid;

            ApplyAnimationEx(playerid, "ped", "phone_talk", 3.1, 0, 1, 0, 1, 1, 1);
            SetPlayerAttachedObject(playerid, 9, 18870, 6,  0.099000, 0.009999, 0.000000,  78.200027, 179.000061, -1.500000,  1.000000, 1.000000, 1.000000); // 276

            ApplyAnimationEx(callingWithPlayerID, "ped", "phone_talk", 3.1, 0, 1, 0, 1, 1, 1);
            SetPlayerAttachedObject(callingWithPlayerID, 9, 18870, 6,  0.099000, 0.009999, 0.000000,  78.200027, 179.000061, -1.500000,  1.000000, 1.000000, 1.000000); // 276

            static contnstr[25];
            format(contnstr, sizeof(contnstr), "%s", AccountData[callingWithPlayerID][pPhone]);
            for(new cid; cid < MAX_CONTACTS; ++cid)
            {
                if(ContactData[playerid][cid][contactExists])
                {
                    if(!strcmp(ContactData[playerid][cid][contactNumber], AccountData[callingWithPlayerID][pPhone], false))
                    {
                        format(contnstr, sizeof(contnstr), "%s", ContactData[playerid][cid][contactName]);
                    }
                }
            }
            EAGLEUI_SetStringPlayer(playerid, ContactNameTD[playerid], contnstr);
            StopAudioStreamForPlayer(playerid);

            HideAllSmartphone(playerid), HideAllSmartphone(callingWithPlayerID);
            EAGLEUI_HidePlayer(playerid, GreenButtonincomingCall[playerid]);
            EAGLEUI_HidePlayer(playerid, RedButtonincomingCall[playerid]);
            EAGLEUI_ShowPlayer(playerid, RedButtonoutComingCall[playerid]);
            EAGLEUI_HidePlayer(playerid, GreenCButtonincomingCall[playerid]);
            EAGLEUI_HidePlayer(playerid, RedCButtonincomingCall[playerid]);
            EAGLEUI_ShowPlayer(playerid, RedCButtonoutComingCall[playerid]);
            Toggle_CallTD(playerid, true), Toggle_CallTD(callingWithPlayerID, true);
            EAGLEUI_Cancel(playerid), EAGLEUI_Cancel(callingWithPlayerID);
            CallRemoteFunction("ConnectPlayerCalling", "dd", playerid, callingWithPlayerID);
        }
    }

    if(textid == RedButtonoutComingCall[playerid])
    {
        new callDurringWithPlayerID = AccountData[playerid][phoneCallingWithPlayerID];
        if(!AccountData[playerid][phoneIncomingCall] && callDurringWithPlayerID != INVALID_PLAYER_ID)
        {
            if(!IsPlayerInAnyVehicle(playerid) && GetPlayerState(playerid) == PLAYER_STATE_ONFOOT)
            {
                ClearAnimations(playerid, 1);
                ApplyAnimation(playerid, "ped", "phone_out", 4.0, 0, 0, 0, 0, 0, 1);
            }

            if(!IsPlayerInAnyVehicle(callDurringWithPlayerID) && GetPlayerState(callDurringWithPlayerID) == PLAYER_STATE_ONFOOT)
            {
                ClearAnimations(callDurringWithPlayerID, 1);
                ApplyAnimation(callDurringWithPlayerID, "ped", "phone_out", 4.0, 0, 0, 0, 0, 0, 1);
            }
            RemovePlayerAttachedObject(playerid, 9);
            RemovePlayerAttachedObject(callDurringWithPlayerID, 9);
            CallRemoteFunction("DisconnectPlayerCalling", "dd", playerid, callDurringWithPlayerID);

            if(AccountData[playerid][phoneShown]) {
                AccountData[playerid][phoneShown] = false;
            }

            if(AccountData[callDurringWithPlayerID][phoneShown]) {
                AccountData[callDurringWithPlayerID][phoneShown] = false;
            }

            HideAllSmartphone(playerid), HideAllSmartphone(callDurringWithPlayerID);
            Toggle_CallTD(playerid, false), Toggle_CallTD(callDurringWithPlayerID, false);
            EAGLEUI_HidePlayer(playerid, RedButtonoutComingCall[playerid]),
			EAGLEUI_HidePlayer(callDurringWithPlayerID, RedButtonoutComingCall[callDurringWithPlayerID]);
            EAGLEUI_HidePlayer(callDurringWithPlayerID, RedButtonincomingCall[callDurringWithPlayerID]),
			EAGLEUI_HidePlayer(callDurringWithPlayerID, GreenButtonincomingCall[callDurringWithPlayerID]);
			EAGLEUI_HidePlayer(playerid, RedCButtonoutComingCall[playerid]),
			EAGLEUI_HidePlayer(callDurringWithPlayerID, RedCButtonoutComingCall[callDurringWithPlayerID]);
            EAGLEUI_HidePlayer(callDurringWithPlayerID, RedCButtonincomingCall[callDurringWithPlayerID]),
			EAGLEUI_HidePlayer(callDurringWithPlayerID, GreenCButtonincomingCall[callDurringWithPlayerID]);
            EAGLEUI_Cancel(playerid), EAGLEUI_Cancel(callDurringWithPlayerID);
            StopAudioStreamForPlayer(callDurringWithPlayerID);
            AccountData[playerid][phoneCallingWithPlayerID] = INVALID_PLAYER_ID;
            AccountData[playerid][phoneDurringConversation] = false;
            AccountData[playerid][phoneIncomingCall] = false;
            AccountData[playerid][phoneCallingTime] = 0;

            AccountData[callDurringWithPlayerID][phoneCallingWithPlayerID] = INVALID_PLAYER_ID;
            AccountData[callDurringWithPlayerID][phoneDurringConversation] = false;
            AccountData[callDurringWithPlayerID][phoneIncomingCall] = false;
            AccountData[callDurringWithPlayerID][phoneCallingTime] = 0;
            Info(playerid, "Telepon terputus...");
            Info(callDurringWithPlayerID, "Telepon terputus...");
        }
        else
        {
            ApplyAnimation(playerid, "CARRY", "crry_prtial", 4.0, 0, 0, 0, 0, 0, 1);
            RemovePlayerAttachedObject(playerid, 9);

            if(AccountData[playerid][phoneShown]) {
                AccountData[playerid][phoneShown] = false;
            }
            EAGLEUI_HidePlayer(playerid, RedButtonoutComingCall[playerid]);
            EAGLEUI_HidePlayer(playerid, RedCButtonoutComingCall[playerid]);
            HideAllSmartphone(playerid);
            Toggle_CallTD(playerid, false);
            EAGLEUI_Cancel(playerid);
            AccountData[playerid][phoneCallingWithPlayerID] = INVALID_PLAYER_ID;
            AccountData[playerid][phoneDurringConversation] = false;
            AccountData[playerid][phoneIncomingCall] = false;
            AccountData[playerid][phoneCallingTime] = 0;
            Info(playerid, "Nomor tersebut berada di panggilan lain/tidak aktif...");
        }
    }
	//showroom
	new showroomID = GetPVarInt(playerid, "SelectShowroomID");
	if(textid == ATRP_ShowroomTD[playerid][11]) // Next Veh
    {
        if(showroomID != 0)
        {
            if(showroomID == 1) // Truk
            {
                if(SelectVeh[playerid] == sizeof(TrukShowroom) - 1)
                {
                    PlayerPlaySound(playerid, 4203, 0.0, 0.0, 0.0);
                    return 0;
                }
                else SelectVeh[playerid] ++;
                VehicleTruckSelect(playerid);

                EAGLEUI_SetStringPlayer(playerid, ATRP_ShowroomTD[playerid][14], sprintf("%s~n~~g~%s", GetVehicleModelName(TrukShowroom[SelectVeh[playerid]]), FormatMoney(TrukCost(playerid))));
                EAGLEUI_ShowPlayer(playerid, ATRP_ShowroomTD[playerid][14]);
            }
            else if(showroomID == 2) // Suv
            {
                if(SelectVeh[playerid] == sizeof(SuvShowroom) - 1)
                {
                    PlayerPlaySound(playerid, 4203, 0.0, 0.0, 0.0);
                    return 0;
                }
                else SelectVeh[playerid] ++;
                VehicleSuvSelect(playerid);

                EAGLEUI_SetStringPlayer(playerid, ATRP_ShowroomTD[playerid][14], sprintf("%s~n~~g~%s", GetVehicleModelName(SuvShowroom[SelectVeh[playerid]]), FormatMoney(SuvCost(playerid))));
                EAGLEUI_ShowPlayer(playerid, ATRP_ShowroomTD[playerid][14]);
            }
            else if(showroomID == 3) // Motor
            {
                if(SelectVeh[playerid] == sizeof(MotorShowroom) - 1)
                {
                    PlayerPlaySound(playerid, 4203, 0.0, 0.0, 0.0);
                    return 0;
                }
                else SelectVeh[playerid] ++;
                VehicleMotorSelect(playerid);

                EAGLEUI_SetStringPlayer(playerid, ATRP_ShowroomTD[playerid][14], sprintf("%s~n~~g~%s", GetVehicleModelName(MotorShowroom[SelectVeh[playerid]]), FormatMoney(MotorCost(playerid))));
                EAGLEUI_ShowPlayer(playerid, ATRP_ShowroomTD[playerid][14]);
            }
            else if(showroomID == 4) // Low ride
            {
                if(SelectVeh[playerid] == sizeof(ClassicShowroom) - 1)
                {
                    PlayerPlaySound(playerid, 4203, 0.0, 0.0, 0.0);
                    return 0;
                }
                else SelectVeh[playerid] ++;
                VehicleLowriderSelect(playerid);

                EAGLEUI_SetStringPlayer(playerid, ATRP_ShowroomTD[playerid][14], sprintf("%s~n~~g~%s", GetVehicleModelName(ClassicShowroom[SelectVeh[playerid]]), FormatMoney(ClassicCost(playerid))));
                EAGLEUI_ShowPlayer(playerid, ATRP_ShowroomTD[playerid][14]);
            }
            else if(showroomID == 5) // Compact
            {
                if(SelectVeh[playerid] == sizeof(CompactShowroom) - 1)
                {
                    PlayerPlaySound(playerid, 4203, 0.0, 0.0, 0.0);
                    return 0;
                }
                else SelectVeh[playerid] ++;
                VehicleCompactSelect(playerid);

                EAGLEUI_SetStringPlayer(playerid, ATRP_ShowroomTD[playerid][14], sprintf("%s~n~~g~%s", GetVehicleModelName(CompactShowroom[SelectVeh[playerid]]), FormatMoney(CompactCost(playerid))));
                EAGLEUI_ShowPlayer(playerid, ATRP_ShowroomTD[playerid][14]);
            }
            else if(showroomID == 6) // Luxury
            {
                if(SelectVeh[playerid] == sizeof(LuxuryShowroom) - 1)
                {
                    PlayerPlaySound(playerid, 4203, 0.0, 0.0, 0.0);
                    return 0;
                }
                else SelectVeh[playerid] ++;
                VehicleLuxurySelect(playerid);

                EAGLEUI_SetStringPlayer(playerid, ATRP_ShowroomTD[playerid][14], sprintf("%s~n~~g~%s", GetVehicleModelName(LuxuryShowroom[SelectVeh[playerid]]), FormatMoney(LuxuryCost(playerid))));
                EAGLEUI_ShowPlayer(playerid, ATRP_ShowroomTD[playerid][14]);
            }
        }
    }
    else if(textid == ATRP_ShowroomTD[playerid][10]) // Previous veh
    {
        if(showroomID != 0)
        {
            if(showroomID == 1) // truk
            {
                if(SelectVeh[playerid] == 0)
                {
                    PlayerPlaySound(playerid, 4203, 0.0, 0.0, 0.0);
                    return 0;
                }
                else SelectVeh[playerid] --;
                VehicleTruckSelect(playerid);

                EAGLEUI_SetStringPlayer(playerid, ATRP_ShowroomTD[playerid][14], sprintf("%s~n~~g~%s", GetVehicleModelName(TrukShowroom[SelectVeh[playerid]]), FormatMoney(TrukCost(playerid))));
                EAGLEUI_ShowPlayer(playerid, ATRP_ShowroomTD[playerid][14]);
            }
            else if(showroomID == 2) // Suv
            {
                if(SelectVeh[playerid] == 0)
                {
                    PlayerPlaySound(playerid, 4203, 0.0, 0.0, 0.0);
                    return 0;
                }
                else SelectVeh[playerid] --;
                VehicleSuvSelect(playerid);

                EAGLEUI_SetStringPlayer(playerid, ATRP_ShowroomTD[playerid][14], sprintf("%s~n~~g~%s", GetVehicleModelName(SuvShowroom[SelectVeh[playerid]]), FormatMoney(SuvCost(playerid))));
                EAGLEUI_ShowPlayer(playerid, ATRP_ShowroomTD[playerid][14]);
            }
            else if(showroomID == 3) // Motor
            {
                if(SelectVeh[playerid] == 0)
                {
                    PlayerPlaySound(playerid, 4203, 0.0, 0.0, 0.0);
                    return 0;
                }
                else SelectVeh[playerid] --;
                VehicleMotorSelect(playerid);

                EAGLEUI_SetStringPlayer(playerid, ATRP_ShowroomTD[playerid][14], sprintf("%s~n~~g~%s", GetVehicleModelName(MotorShowroom[SelectVeh[playerid]]), FormatMoney(MotorCost(playerid))));
                EAGLEUI_ShowPlayer(playerid, ATRP_ShowroomTD[playerid][14]);
            }
            else if(showroomID == 4) // Lowrider
            {
                if(SelectVeh[playerid] == 0)
                {
                    PlayerPlaySound(playerid, 4203, 0.0, 0.0, 0.0);
                    return 0;
                }
                else SelectVeh[playerid] --;
                VehicleLowriderSelect(playerid);

                EAGLEUI_SetStringPlayer(playerid, ATRP_ShowroomTD[playerid][14], sprintf("%s~n~~g~%s", GetVehicleModelName(ClassicShowroom[SelectVeh[playerid]]), FormatMoney(ClassicCost(playerid))));
                EAGLEUI_ShowPlayer(playerid, ATRP_ShowroomTD[playerid][14]);
            }
            else if(showroomID == 5) // Compact
            {
                if(SelectVeh[playerid] == 0)
                {
                    PlayerPlaySound(playerid, 4203, 0.0, 0.0, 0.0);
                    return 0;
                }
                else SelectVeh[playerid] --;
                VehicleCompactSelect(playerid);

                EAGLEUI_SetStringPlayer(playerid, ATRP_ShowroomTD[playerid][14], sprintf("%s~n~~g~%s", GetVehicleModelName(CompactShowroom[SelectVeh[playerid]]), FormatMoney(CompactCost(playerid))));
                EAGLEUI_ShowPlayer(playerid, ATRP_ShowroomTD[playerid][14]);
            }
            else if(showroomID == 6) // Luxury
            {
                if(SelectVeh[playerid] == 0)
                {
                    PlayerPlaySound(playerid, 4203, 0.0, 0.0, 0.0);
                    return 0;
                }
                else SelectVeh[playerid] --;
                VehicleLuxurySelect(playerid);

                EAGLEUI_SetStringPlayer(playerid, ATRP_ShowroomTD[playerid][14], sprintf("%s~n~~g~%s", GetVehicleModelName(LuxuryShowroom[SelectVeh[playerid]]), FormatMoney(LuxuryCost(playerid))));
                EAGLEUI_ShowPlayer(playerid, ATRP_ShowroomTD[playerid][14]);
            }
        }
    }
    else if(textid == ATRP_ShowroomTD[playerid][13]) // Keluar Showroom
    {
        EnableAntiCheatForPlayer(playerid, 4, true);
        DestroyVehicle(ShowroomVeh[playerid]);
        ShowroomVeh[playerid] = INVALID_VEHICLE_ID;

        SetPlayerPositionEx(playerid, 397.752, -1329.153, 14.817, 300.020, 1500);
        SetPlayerVirtualWorld(playerid, 0);
        SetCameraBehindPlayer(playerid);
        SetPVarInt(playerid, "SelectShowroomID", 0);
        SelectVeh[playerid] = 0;
        EAGLEUI_Cancel(playerid);
        Toggle_ShowroomTD(playerid, false);
    }
    else if(textid == ATRP_ShowroomTD[playerid][12]) // Buy
    {
        if(showroomID != 0)
        {
            if(showroomID == 1) // Truk
            {
                new count = 0, modelid = TrukShowroom[SelectVeh[playerid]], cost = TrukCost(playerid);
                if(modelid <= 0) return ShowTDN(playerid, NOTIFICATION_ERROR, "Model ID Kendaraan tidak valid!");
                if(AccountData[playerid][pMoney] < cost) return ShowTDN(playerid, NOTIFICATION_ERROR, "Uang anda tidak mencukupi!");
                foreach(new iter : PvtVehicles) if (PlayerVehicle[iter][pVehExists])
                {
                    if(PlayerVehicle[iter][pVehOwnerID] == AccountData[playerid][pID])
                    {
                        count ++;
                    }
                }

                if(count >= GetPlayerVehicleLimit(playerid)) return ShowTDN(playerid, NOTIFICATION_WARNING, "Slot kendaraan anda sudah penuh!");
                ShowTDN(playerid, NOTIFICATION_SUKSES, "Pembelian berhasil dilakukan.");
                TakeMoney(playerid, cost);
                ShowroomVehicle_Create(playerid, modelid, 400.109, -1321.088, 14.943, 109.732, random(255), random(255), cost);
                static shstr[128];
                format(shstr, sizeof(shstr), "Membeli kendaraan %s seharga %s", GetVehicleModelName(modelid), FormatMoney(cost));
                AddPMoneyLog(AccountData[playerid][pName], AccountData[playerid][pUCP], shstr, cost);
                
                Toggle_ShowroomTD(playerid, false);
                SetPVarInt(playerid, "SelectShowroomID", 0);
                SelectVeh[playerid] = 0;
            }
            else if(showroomID == 2) // Suv
            {
                new count = 0, modelid = SuvShowroom[SelectVeh[playerid]], cost = SuvCost(playerid);
                if(modelid <= 0) return ShowTDN(playerid, NOTIFICATION_ERROR, "Model ID Kendaraan tidak valid!");
                if(AccountData[playerid][pMoney] < cost) return ShowTDN(playerid, NOTIFICATION_ERROR, "Uang anda tidak mencukupi!");
                foreach(new iter : PvtVehicles) if (PlayerVehicle[iter][pVehExists])
                {
                    if(PlayerVehicle[iter][pVehOwnerID] == AccountData[playerid][pID])
                    {
                        count ++;
                    }
                }

                if(count >= GetPlayerVehicleLimit(playerid)) return ShowTDN(playerid, NOTIFICATION_WARNING, "Slot kendaraan anda sudah penuh!");
                ShowTDN(playerid, NOTIFICATION_SUKSES, "Pembelian berhasil dilakukan.");
                TakeMoney(playerid, cost);
                ShowroomVehicle_Create(playerid, modelid, 400.109, -1321.088, 14.943, 109.732,random(255), random(255), cost);
                static shstr[128];
                format(shstr, sizeof(shstr), "Membeli kendaraan %s seharga %s", GetVehicleModelName(modelid), FormatMoney(cost));
                AddPMoneyLog(AccountData[playerid][pName], AccountData[playerid][pUCP], shstr, cost);
                
                Toggle_ShowroomTD(playerid, false);
                SetPVarInt(playerid, "SelectShowroomID", 0);
                SelectVeh[playerid] = 0;
            }
            else if(showroomID == 3) // Motor
            {
                new count = 0, modelid = MotorShowroom[SelectVeh[playerid]], cost = MotorCost(playerid);
                if(modelid <= 0) return ShowTDN(playerid, NOTIFICATION_ERROR, "Model ID Kendaraan tidak valid!");
                if(AccountData[playerid][pMoney] < cost) return ShowTDN(playerid, NOTIFICATION_ERROR, "Uang anda tidak mencukupi!");
                foreach(new iter : PvtVehicles) if (PlayerVehicle[iter][pVehExists])
                {
                    if(PlayerVehicle[iter][pVehOwnerID] == AccountData[playerid][pID])
                    {
                        count ++;
                    }
                }

                if(count >= GetPlayerVehicleLimit(playerid)) return ShowTDN(playerid, NOTIFICATION_WARNING, "Slot kendaraan anda sudah penuh!");
                ShowTDN(playerid, NOTIFICATION_SUKSES, "Pembelian berhasil dilakukan.");
                TakeMoney(playerid, cost);
                ShowroomVehicle_Create(playerid, modelid, 400.109, -1321.088, 14.943, 109.732,random(255), random(255), cost);
                static shstr[128];
                format(shstr, sizeof(shstr), "Membeli kendaraan %s seharga %s", GetVehicleModelName(modelid), FormatMoney(cost));
                AddPMoneyLog(AccountData[playerid][pName], AccountData[playerid][pUCP], shstr, cost);
                
                Toggle_ShowroomTD(playerid, false);
                SetPVarInt(playerid, "SelectShowroomID", 0);
                SelectVeh[playerid] = 0;
            }
            else if(showroomID == 4) // Low
            {
                new count = 0, modelid = ClassicShowroom[SelectVeh[playerid]], cost = ClassicCost(playerid);
                if(modelid <= 0) return ShowTDN(playerid, NOTIFICATION_ERROR, "Model ID Kendaraan tidak valid!");
                if(AccountData[playerid][pMoney] < cost) return ShowTDN(playerid, NOTIFICATION_ERROR, "Uang anda tidak mencukupi!");
                foreach(new iter : PvtVehicles) if (PlayerVehicle[iter][pVehExists])
                {
                    if(PlayerVehicle[iter][pVehOwnerID] == AccountData[playerid][pID])
                    {
                        count ++;
                    }
                }

                if(count >= GetPlayerVehicleLimit(playerid)) return ShowTDN(playerid, NOTIFICATION_WARNING, "Slot kendaraan anda sudah penuh!");
                ShowTDN(playerid, NOTIFICATION_SUKSES, "Pembelian berhasil dilakukan.");
                TakeMoney(playerid, cost);
                ShowroomVehicle_Create(playerid, modelid, 400.109, -1321.088, 14.943, 109.732,random(255), random(255), cost);
                static shstr[128];
                format(shstr, sizeof(shstr), "Membeli kendaraan %s seharga %s", GetVehicleModelName(modelid), FormatMoney(cost));
                AddPMoneyLog(AccountData[playerid][pName], AccountData[playerid][pUCP], shstr, cost);
                
                Toggle_ShowroomTD(playerid, false);
                SetPVarInt(playerid, "SelectShowroomID", 0);
                SelectVeh[playerid] = 0;
            }
            else if(showroomID == 5) // Compact
            {
                new count = 0, modelid = CompactShowroom[SelectVeh[playerid]], cost = CompactCost(playerid);
                if(modelid <= 0) return ShowTDN(playerid, NOTIFICATION_ERROR, "Model ID Kendaraan tidak valid!");
                if(AccountData[playerid][pMoney] < cost) return ShowTDN(playerid, NOTIFICATION_ERROR, "Uang anda tidak mencukupi!");
                foreach(new iter : PvtVehicles) if (PlayerVehicle[iter][pVehExists])
                {
                    if(PlayerVehicle[iter][pVehOwnerID] == AccountData[playerid][pID])
                    {
                        count ++;
                    }
                }

                if(count >= GetPlayerVehicleLimit(playerid)) return ShowTDN(playerid, NOTIFICATION_WARNING, "Slot kendaraan anda sudah penuh!");
                ShowTDN(playerid, NOTIFICATION_SUKSES, "Pembelian berhasil dilakukan.");
                TakeMoney(playerid, cost);
                ShowroomVehicle_Create(playerid, modelid, 400.109, -1321.088, 14.943, 109.732,random(255), random(255), cost);
                static shstr[128];
                format(shstr, sizeof(shstr), "Membeli kendaraan %s seharga %s", GetVehicleModelName(modelid), FormatMoney(cost));
                AddPMoneyLog(AccountData[playerid][pName], AccountData[playerid][pUCP], shstr, cost);
                
                Toggle_ShowroomTD(playerid, false);
                SetPVarInt(playerid, "SelectShowroomID", 0);
                SelectVeh[playerid] = 0;
            }
            else if(showroomID == 6) // Luxury
            {
                new count = 0, modelid = LuxuryShowroom[SelectVeh[playerid]], cost = LuxuryCost(playerid);
                if(modelid <= 0) return ShowTDN(playerid, NOTIFICATION_ERROR, "Model ID Kendaraan tidak valid!");
                if(AccountData[playerid][pMoney] < cost) return ShowTDN(playerid, NOTIFICATION_ERROR, "Uang anda tidak mencukupi!");
                foreach(new iter : PvtVehicles) if (PlayerVehicle[iter][pVehExists])
                {
                    if(PlayerVehicle[iter][pVehOwnerID] == AccountData[playerid][pID])
                    {
                        count ++;
                    }
                }

                if(count >= GetPlayerVehicleLimit(playerid)) return ShowTDN(playerid, NOTIFICATION_WARNING, "Slot kendaraan anda sudah penuh!");
                ShowTDN(playerid, NOTIFICATION_SUKSES, "Pembelian berhasil dilakukan.");
                TakeMoney(playerid, cost);
                ShowroomVehicle_Create(playerid, modelid, 400.109, -1321.088, 14.943, 109.732,random(255), random(255), cost);
                static shstr[128];
                format(shstr, sizeof(shstr), "Membeli kendaraan %s seharga %s", GetVehicleModelName(modelid), FormatMoney(cost));
                AddPMoneyLog(AccountData[playerid][pName], AccountData[playerid][pUCP], shstr, cost);
                
                Toggle_ShowroomTD(playerid, false);
                SetPVarInt(playerid, "SelectShowroomID", 0);
                SelectVeh[playerid] = 0;
            }
        }
    }
	if(textid == HandphonePoker[playerid][13])//card slot
    {
   		if(SlotTimert[playerid]>0)
   		{
   			SendClientMessage(playerid,-1,"Anda Sedang Bermain Harap Tunggu Hingga Selesai");
    	}
    	else
    	{
	    	for(new i = 0; i < 41; i++) EAGLEUI_HidePlayer(playerid, HandphonePoker[playerid][i]);
	      	for(new i; i < 61; i++) EAGLEUI_ShowPlayer(playerid, HandphoneMenuGame[playerid][i]);
	      	SlotMachineStarted[playerid]=0;
	      	SlotTimert[playerid]=0;
	      	SlotRunde[playerid]=0;
    	}
    }
    if(textid == HandphonePoker[playerid][39])//card slot
    {
        	if(SlotTimert[playerid]>0)
       		{
        		SendClientMessage(playerid,-1,"Harap tunggu hingga babak ini selesai!");
         	}
          	else
           	{
           	    SlotMachineStarted[playerid]=1;
           	    TakeMoney(playerid, 500);
            	SlotTimert[playerid]=SetTimerEx("SlotRoll",500,1,"i",playerid);
             	EAGLEUI_HidePlayer(playerid,HandphonePoker[playerid][34]);
           	}
    }
	if(textid == HandphoneGameXoWin[playerid][13])
	{
	    for(new i=0; i < 33; i++)
	    {
	    	EAGLEUI_HidePlayer(playerid,HandphoneGameXoWin[playerid][i]);
	    }
	    for(new i; i < 61; i++) EAGLEUI_ShowPlayer(playerid, HandphoneMenuGame[playerid][i]);
	}
	if(textid == HandphoneGameXoLose[playerid][13])
	{
	    for(new i=0; i < 33; i++)
	    {
	    	EAGLEUI_HidePlayer(playerid,HandphoneGameXoLose[playerid][i]);
	    }
	    for(new i; i < 61; i++) EAGLEUI_ShowPlayer(playerid, HandphoneMenuGame[playerid][i]);
	}
	if(textid == HandphoneGameXoDraw[playerid][13])
	{
	    for(new i=0; i < 33; i++)
	    {
	    	EAGLEUI_HidePlayer(playerid,HandphoneGameXoDraw[playerid][i]);
	    }
	    for(new i; i < 61; i++) EAGLEUI_ShowPlayer(playerid, HandphoneMenuGame[playerid][i]);
	}
    if(textid == HandphoneGameXo[playerid][50])
	{
	 	cmdplay(playerid,1);
	 	return 1;
	}
	if(textid == HandphoneGameXo[playerid][51])
	{
	 	cmdplay(playerid,2);
	 	return 1;
	}
	if(textid == HandphoneGameXo[playerid][52])
	{
	 	cmdplay(playerid,3);
	 	return 1;
	}
	if(textid == HandphoneGameXo[playerid][53])
	{
	 	cmdplay(playerid,4);
	 	return 1;
	}
	if(textid == HandphoneGameXo[playerid][54])
	{
	 	cmdplay(playerid,5);
	 	return 1;
	}
	if(textid == HandphoneGameXo[playerid][55])
	{
	 	cmdplay(playerid,6);
	 	return 1;
	}
	if(textid == HandphoneGameXo[playerid][56])
	{
	 	cmdplay(playerid,7);
	 	return 1;
	}
	if(textid == HandphoneGameXo[playerid][57])
	{
	 	cmdplay(playerid,8);
	 	return 1;
	}
	if(textid == HandphoneGameXo[playerid][58])
	{
	 	cmdplay(playerid,9);
	 	return 1;
	}
	//radio
	if(textid == ATRP_RadioTD[playerid][10]) //set freq
    {   
        ShowPlayerDialog(playerid, DIALOG_RADIO_FREQ, DIALOG_STYLE_INPUT, ""ALTHF"EAGLE Roleplay "WHITE"- Radio Fx",
        "Masukkan frekuensi radio yang ingin diterapkan pada kolom dibawah ini\
        \n(Frekuensi harus berada diantara 0 - 9999)\
        \nCatatan: Masukkan frekuensi 0 untuk memutuskan saluran frekuensi/netral", "Submit", "Batal");
    }
    else if(textid == ATRP_RadioTD[playerid][9]) // Close
    {
        SendRPMeAboveHead(playerid, "Menutup Radio miliknya.", X11_PLUM1);
        if(!IsPlayerInAnyVehicle(playerid))
        {
            ClearAnimations(playerid, 1);
            ApplyAnimation(playerid, "CARRY", "crry_prtial", 4.0, 0, 0, 0, 0, 0, 1);
            SetPlayerSpecialAction(playerid, SPECIAL_ACTION_NONE);
        }
        RemovePlayerAttachedObject(playerid, 9);
        RadioTextdrawToggle(playerid, false);
        EAGLEUI_Cancel(playerid);
    }
    else if(textid == ATRP_RadioTD[playerid][8]) // Power
    {
        RadioMicOn[playerid] = false;
        CallRemoteFunction("UpdatePlayerVoiceMicToggle", "dd", playerid, false);
        switch(ToggleRadio[playerid])
        {
            case false:
            {
                ToggleRadio[playerid] = true;
                CallRemoteFunction("UpdatePlayerVoiceRadioToggle", "dd", playerid, true);
                if(!IsPlayerInAnyVehicle(playerid))
                {
                    ClearAnimations(playerid, 1);
                    ApplyAnimation(playerid, "CARRY", "crry_prtial", 4.0, 0, 0, 0, 0, 0, 1);
                }
                RemovePlayerAttachedObject(playerid, 9);
                ShowTDN(playerid, NOTIFICATION_INFO, "Berhasil menyalakan radio");
                
                EAGLEUI_Cancel(playerid);
                RadioTextdrawToggle(playerid, false);
            }
            case true:
            {
                ToggleRadio[playerid] = false;
                CallRemoteFunction("UpdatePlayerVoiceRadioToggle", "dd", playerid, false);
                if(!IsPlayerInAnyVehicle(playerid))
                {
                    ClearAnimations(playerid, 1);
                    ApplyAnimation(playerid, "CARRY", "crry_prtial", 4.0, 0, 0, 0, 0, 0, 1);
                }
                RemovePlayerAttachedObject(playerid, 9);
                ShowTDN(playerid, NOTIFICATION_INFO, "Berhasil mematikan radio");
                
                EAGLEUI_Cancel(playerid);
                RadioTextdrawToggle(playerid, false);
            }
        }
    }
	//toys
	if(textid == P_TOYS[playerid][1]) // X Minus
	{
		pToys[playerid][AccountData[playerid][toySelected]][toy_x] -= 0.020;
	
		SetPlayerAttachedObject(playerid,
			AccountData[playerid][toySelected],
			pToys[playerid][AccountData[playerid][toySelected]][toy_model],
			pToys[playerid][AccountData[playerid][toySelected]][toy_bone],
			pToys[playerid][AccountData[playerid][toySelected]][toy_x],
			pToys[playerid][AccountData[playerid][toySelected]][toy_y],
			pToys[playerid][AccountData[playerid][toySelected]][toy_z],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_ry],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rz],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sy],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sz]);
		
		SetPVarInt(playerid, "UpdatedToy", 1);
	}
	if(textid == P_TOYS[playerid][2]) // X Plus
	{
		pToys[playerid][AccountData[playerid][toySelected]][toy_x] += 0.020;
	
		SetPlayerAttachedObject(playerid,
			AccountData[playerid][toySelected],
			pToys[playerid][AccountData[playerid][toySelected]][toy_model],
			pToys[playerid][AccountData[playerid][toySelected]][toy_bone],
			pToys[playerid][AccountData[playerid][toySelected]][toy_x],
			pToys[playerid][AccountData[playerid][toySelected]][toy_y],
			pToys[playerid][AccountData[playerid][toySelected]][toy_z],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_ry],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rz],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sy],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sz]);
		
		SetPVarInt(playerid, "UpdatedToy", 1);
	}
	if(textid == P_TOYS[playerid][4]) // Y Minus
	{
		pToys[playerid][AccountData[playerid][toySelected]][toy_y] -= 0.020;

		SetPlayerAttachedObject(playerid,
			AccountData[playerid][toySelected],
			pToys[playerid][AccountData[playerid][toySelected]][toy_model],
			pToys[playerid][AccountData[playerid][toySelected]][toy_bone],
			pToys[playerid][AccountData[playerid][toySelected]][toy_x],
			pToys[playerid][AccountData[playerid][toySelected]][toy_y],
			pToys[playerid][AccountData[playerid][toySelected]][toy_z],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_ry],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rz],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sy],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sz]);
		
		SetPVarInt(playerid, "UpdatedToy", 1);
	}
	if(textid == P_TOYS[playerid][5]) // Y Plus
	{
		pToys[playerid][AccountData[playerid][toySelected]][toy_y] += 0.020;

		SetPlayerAttachedObject(playerid,
			AccountData[playerid][toySelected],
			pToys[playerid][AccountData[playerid][toySelected]][toy_model],
			pToys[playerid][AccountData[playerid][toySelected]][toy_bone],
			pToys[playerid][AccountData[playerid][toySelected]][toy_x],
			pToys[playerid][AccountData[playerid][toySelected]][toy_y],
			pToys[playerid][AccountData[playerid][toySelected]][toy_z],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_ry],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rz],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sy],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sz]);
		
		SetPVarInt(playerid, "UpdatedToy", 1);
	}
	if(textid == P_TOYS[playerid][7]) // Z Minus
	{
		pToys[playerid][AccountData[playerid][toySelected]][toy_z] -= 0.020;

		SetPlayerAttachedObject(playerid,
			AccountData[playerid][toySelected],
			pToys[playerid][AccountData[playerid][toySelected]][toy_model],
			pToys[playerid][AccountData[playerid][toySelected]][toy_bone],
			pToys[playerid][AccountData[playerid][toySelected]][toy_x],
			pToys[playerid][AccountData[playerid][toySelected]][toy_y],
			pToys[playerid][AccountData[playerid][toySelected]][toy_z],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_ry],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rz],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sy],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sz]);
		
		SetPVarInt(playerid, "UpdatedToy", 1);
	}
	if(textid == P_TOYS[playerid][8]) // Z Plus
	{
		pToys[playerid][AccountData[playerid][toySelected]][toy_z] += 0.020;

		SetPlayerAttachedObject(playerid,
			AccountData[playerid][toySelected],
			pToys[playerid][AccountData[playerid][toySelected]][toy_model],
			pToys[playerid][AccountData[playerid][toySelected]][toy_bone],
			pToys[playerid][AccountData[playerid][toySelected]][toy_x],
			pToys[playerid][AccountData[playerid][toySelected]][toy_y],
			pToys[playerid][AccountData[playerid][toySelected]][toy_z],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_ry],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rz],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sy],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sz]);
		
		SetPVarInt(playerid, "UpdatedToy", 1);
	}
	if(textid == P_TOYS[playerid][10]) // Rot x Minus
	{
		pToys[playerid][AccountData[playerid][toySelected]][toy_rx] -= 3.0;

		SetPlayerAttachedObject(playerid,
			AccountData[playerid][toySelected],
			pToys[playerid][AccountData[playerid][toySelected]][toy_model],
			pToys[playerid][AccountData[playerid][toySelected]][toy_bone],
			pToys[playerid][AccountData[playerid][toySelected]][toy_x],
			pToys[playerid][AccountData[playerid][toySelected]][toy_y],
			pToys[playerid][AccountData[playerid][toySelected]][toy_z],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_ry],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rz],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sy],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sz]);
		
		SetPVarInt(playerid, "UpdatedToy", 1);
	}
	if(textid == P_TOYS[playerid][11]) // Rot x Minus
	{
		pToys[playerid][AccountData[playerid][toySelected]][toy_rx] += 3.0;

		SetPlayerAttachedObject(playerid,
			AccountData[playerid][toySelected],
			pToys[playerid][AccountData[playerid][toySelected]][toy_model],
			pToys[playerid][AccountData[playerid][toySelected]][toy_bone],
			pToys[playerid][AccountData[playerid][toySelected]][toy_x],
			pToys[playerid][AccountData[playerid][toySelected]][toy_y],
			pToys[playerid][AccountData[playerid][toySelected]][toy_z],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_ry],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rz],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sy],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sz]);
		
		SetPVarInt(playerid, "UpdatedToy", 1);
	}
	if(textid == P_TOYS[playerid][13]) // Rot y Minus
	{
		pToys[playerid][AccountData[playerid][toySelected]][toy_ry] -= 3.0;

		SetPlayerAttachedObject(playerid,
			AccountData[playerid][toySelected],
			pToys[playerid][AccountData[playerid][toySelected]][toy_model],
			pToys[playerid][AccountData[playerid][toySelected]][toy_bone],
			pToys[playerid][AccountData[playerid][toySelected]][toy_x],
			pToys[playerid][AccountData[playerid][toySelected]][toy_y],
			pToys[playerid][AccountData[playerid][toySelected]][toy_z],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_ry],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rz],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sy],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sz]);
		
		SetPVarInt(playerid, "UpdatedToy", 1);
	}
	if(textid == P_TOYS[playerid][14]) // Rot y Minus
	{
		pToys[playerid][AccountData[playerid][toySelected]][toy_ry] += 3.0;

		SetPlayerAttachedObject(playerid,
			AccountData[playerid][toySelected],
			pToys[playerid][AccountData[playerid][toySelected]][toy_model],
			pToys[playerid][AccountData[playerid][toySelected]][toy_bone],
			pToys[playerid][AccountData[playerid][toySelected]][toy_x],
			pToys[playerid][AccountData[playerid][toySelected]][toy_y],
			pToys[playerid][AccountData[playerid][toySelected]][toy_z],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_ry],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rz],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sy],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sz]);
		
		SetPVarInt(playerid, "UpdatedToy", 1);
	}
	if(textid == P_TOYS[playerid][16]) // rot z min 
	{
		pToys[playerid][AccountData[playerid][toySelected]][toy_rz] -= 3.0;

		SetPlayerAttachedObject(playerid,
			AccountData[playerid][toySelected],
			pToys[playerid][AccountData[playerid][toySelected]][toy_model],
			pToys[playerid][AccountData[playerid][toySelected]][toy_bone],
			pToys[playerid][AccountData[playerid][toySelected]][toy_x],
			pToys[playerid][AccountData[playerid][toySelected]][toy_y],
			pToys[playerid][AccountData[playerid][toySelected]][toy_z],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_ry],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rz],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sy],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sz]);
		
		SetPVarInt(playerid, "UpdatedToy", 1);
	}
	if(textid == P_TOYS[playerid][17]) // rot z plus 
	{
		pToys[playerid][AccountData[playerid][toySelected]][toy_rz] += 3.0;

		SetPlayerAttachedObject(playerid,
			AccountData[playerid][toySelected],
			pToys[playerid][AccountData[playerid][toySelected]][toy_model],
			pToys[playerid][AccountData[playerid][toySelected]][toy_bone],
			pToys[playerid][AccountData[playerid][toySelected]][toy_x],
			pToys[playerid][AccountData[playerid][toySelected]][toy_y],
			pToys[playerid][AccountData[playerid][toySelected]][toy_z],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_ry],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rz],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sy],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sz]);
		
		SetPVarInt(playerid, "UpdatedToy", 1);
	}
	if(textid == P_TOYS[playerid][19]) // skale x min 
	{
		pToys[playerid][AccountData[playerid][toySelected]][toy_sx] -= 0.020;

		SetPlayerAttachedObject(playerid,
			AccountData[playerid][toySelected],
			pToys[playerid][AccountData[playerid][toySelected]][toy_model],
			pToys[playerid][AccountData[playerid][toySelected]][toy_bone],
			pToys[playerid][AccountData[playerid][toySelected]][toy_x],
			pToys[playerid][AccountData[playerid][toySelected]][toy_y],
			pToys[playerid][AccountData[playerid][toySelected]][toy_z],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_ry],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rz],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sy],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sz]);
		
		SetPVarInt(playerid, "UpdatedToy", 1);
	}
	if(textid == P_TOYS[playerid][20]) // skale x plus
	{
		pToys[playerid][AccountData[playerid][toySelected]][toy_sx] += 0.020;

		SetPlayerAttachedObject(playerid,
			AccountData[playerid][toySelected],
			pToys[playerid][AccountData[playerid][toySelected]][toy_model],
			pToys[playerid][AccountData[playerid][toySelected]][toy_bone],
			pToys[playerid][AccountData[playerid][toySelected]][toy_x],
			pToys[playerid][AccountData[playerid][toySelected]][toy_y],
			pToys[playerid][AccountData[playerid][toySelected]][toy_z],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_ry],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rz],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sy],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sz]);
		
		SetPVarInt(playerid, "UpdatedToy", 1);
	}
	if(textid == P_TOYS[playerid][22]) // skale y min 
	{
		pToys[playerid][AccountData[playerid][toySelected]][toy_sy] -= 0.020;

		SetPlayerAttachedObject(playerid,
			AccountData[playerid][toySelected],
			pToys[playerid][AccountData[playerid][toySelected]][toy_model],
			pToys[playerid][AccountData[playerid][toySelected]][toy_bone],
			pToys[playerid][AccountData[playerid][toySelected]][toy_x],
			pToys[playerid][AccountData[playerid][toySelected]][toy_y],
			pToys[playerid][AccountData[playerid][toySelected]][toy_z],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_ry],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rz],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sy],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sz]);
		
		SetPVarInt(playerid, "UpdatedToy", 1);
	}
	if(textid == P_TOYS[playerid][23]) // skale y plus 
	{
		pToys[playerid][AccountData[playerid][toySelected]][toy_sy] += 0.020;

		SetPlayerAttachedObject(playerid,
			AccountData[playerid][toySelected],
			pToys[playerid][AccountData[playerid][toySelected]][toy_model],
			pToys[playerid][AccountData[playerid][toySelected]][toy_bone],
			pToys[playerid][AccountData[playerid][toySelected]][toy_x],
			pToys[playerid][AccountData[playerid][toySelected]][toy_y],
			pToys[playerid][AccountData[playerid][toySelected]][toy_z],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_ry],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rz],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sy],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sz]);
		
		SetPVarInt(playerid, "UpdatedToy", 1);
	}
	if(textid == P_TOYS[playerid][25]) // skale z min 
	{
		pToys[playerid][AccountData[playerid][toySelected]][toy_sz] -= 0.020;

		SetPlayerAttachedObject(playerid,
			AccountData[playerid][toySelected],
			pToys[playerid][AccountData[playerid][toySelected]][toy_model],
			pToys[playerid][AccountData[playerid][toySelected]][toy_bone],
			pToys[playerid][AccountData[playerid][toySelected]][toy_x],
			pToys[playerid][AccountData[playerid][toySelected]][toy_y],
			pToys[playerid][AccountData[playerid][toySelected]][toy_z],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_ry],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rz],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sy],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sz]);
		
		SetPVarInt(playerid, "UpdatedToy", 1);
	}
	if(textid == P_TOYS[playerid][26]) // skale z plus 
	{
		pToys[playerid][AccountData[playerid][toySelected]][toy_sz] += 0.020;

		SetPlayerAttachedObject(playerid,
			AccountData[playerid][toySelected],
			pToys[playerid][AccountData[playerid][toySelected]][toy_model],
			pToys[playerid][AccountData[playerid][toySelected]][toy_bone],
			pToys[playerid][AccountData[playerid][toySelected]][toy_x],
			pToys[playerid][AccountData[playerid][toySelected]][toy_y],
			pToys[playerid][AccountData[playerid][toySelected]][toy_z],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_ry],
			pToys[playerid][AccountData[playerid][toySelected]][toy_rz],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sx],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sy],
			pToys[playerid][AccountData[playerid][toySelected]][toy_sz]);
		
		SetPVarInt(playerid, "UpdatedToy", 1);
	}
	if(textid == P_TOYS[playerid][27]) // Keluar
	{
		HideTDToys(playerid);
		MySQL_SavePlayerToys(playerid);
		ShowTDN(playerid, NOTIFICATION_SUKSES, "Berhasil menyimpan Kordinat Baru");
	}
	//mneu ui
	if(textid == MenuUI::Textdraw[playerid][14]) // next page
	{
		if(GetPVarInt(playerid, "WarungTipe") == 1)
		{
			Menu_NextPage(playerid);
			return 1;
		}
	}
	if(textid == MenuUI::Textdraw[playerid][13]) // prev page
	{
		if(GetPVarInt(playerid, "WarungTipe") == 1)
		{
			Menu_PrevPage(playerid);
			return 1;
		}
	}


	for(new slot = 0; slot < ITEMS_PER_PAGE; slot++)
	{
		if(textid == MenuUI::Box[playerid][slot])
		{
			page = GetPVarInt(playerid, "WarungPage");
			new itemIndex = page * ITEMS_PER_PAGE + slot;

			if(itemIndex >= sizeof(g_WarungDetails))
				break;

			if(GetPVarInt(playerid, "Menu_ItemID") != -1)
			{
				new oldItem = GetPVarInt(playerid, "Menu_ItemID");
				new oldPage = oldItem / ITEMS_PER_PAGE;
				new oldSlot = oldItem % ITEMS_PER_PAGE;

				if(oldPage == page)
				{
					EAGLEUI_SetColorPlayer(playerid, MenuUI::Box[playerid][oldSlot], 143);
					EAGLEUI_ShowPlayer(playerid, MenuUI::Box[playerid][oldSlot]);
				}
			}

			SetPVarInt(playerid, "Menu_ItemID", itemIndex);

			EAGLEUI_SetColorPlayer(playerid, MenuUI::Box[playerid][slot], 250);
			EAGLEUI_ShowPlayer(playerid, MenuUI::Box[playerid][slot]);
		}
	}
	if(textid == MenuUI::Textdraw[playerid][2])
	{
		if(GetPVarInt(playerid, "Menu_ItemID") == -1)
			return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda belum memilih item!");
		
		new i = GetPVarInt(playerid, "Menu_ItemID"), id = GetPVarInt(playerid, "InWarungID");

		if(GetPVarInt(playerid, "WarungTipe") == 1)
		{
			new string[48];
			if(i > sizeof g_WarungDetails) return ShowTDN(playerid, NOTIFICATION_ERROR, "Invalid Item"); 
			if(AccountData[playerid][pMoney] < g_WarungDetails[i][e_shopPrice]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Uang mu tidak cukup");
			
			strunpack(string, g_WarungDetails[i][e_shopName]);
			new model = g_WarungDetails[i][e_shopModel];                 

			if(!strcmp(string, "Helmet"))
			{
				if(AccountData[playerid][pHelmet]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda sudah memiliki helm!");
				TakeMoney(playerid, g_WarungDetails[i][e_shopPrice]);
				WarungData[id][warungMoney] += g_WarungDetails[i][e_shopPrice];
				AccountData[playerid][pHelmet] = 1;
				ShowTDN(playerid, NOTIFICATION_SUKSES, "Pembelian berhasil");
				return 1;
			}
			new invid = Inventory_Add(playerid, string, model, 1);
			if(invid == -1) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak dapat memasukan item lagi");

			TakeMoney(playerid, g_WarungDetails[i][e_shopPrice]);
			WarungData[id][warungMoney] += g_WarungDetails[i][e_shopPrice];
			ShowItemBox(playerid, "Received 1x", string, model);
			SendNearbyMessage(playerid, 20.0, COLOR_PURPLE, "* %s membeli %s dari warung.", GetName(playerid), string); 
		}
		if(GetPVarInt(playerid, "WarungTipe") == 4)
		{
			new string[48];
			if(i > sizeof g_BarDetails) return ShowTDN(playerid, NOTIFICATION_ERROR, "Invalid Item"); 
			if(AccountData[playerid][pMoney] < g_BarDetails[i][e_shopPrice]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Uang mu tidak cukup");
			
			strunpack(string, g_BarDetails[i][e_shopName]);
			new model = g_WarungDetails[i][e_shopModel];                 

			new invid = Inventory_Add(playerid, string, model, 1);
			if(invid == -1) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak dapat memasukan item lagi");

			TakeMoney(playerid, g_WarungDetails[i][e_shopPrice]);
			WarungData[id][warungMoney] += g_WarungDetails[i][e_shopPrice];
			ShowItemBox(playerid, "Received 1x", string, model);
			SendNearbyMessage(playerid, 20.0, COLOR_PURPLE, "* %s membeli %s dari warung.", GetName(playerid), string); 
		}
		else if(GetPVarInt(playerid, "WarungTipe") == 2)
		{
			new string[48];
			if(i > sizeof g_ElectronicDetails) return ShowTDN(playerid, NOTIFICATION_ERROR, "Invalid Item"); 
			if(AccountData[playerid][pMoney] < g_ElectronicDetails[i][e_shopPrice]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Uang mu tidak cukup");
			
			strunpack(string, g_ElectronicDetails[i][e_shopName]);
			new model = g_ElectronicDetails[i][e_shopModel];                

			if(!strcmp(string, "Earphone"))
			{
				if(AccountData[playerid][pEarphone] > 0) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda hanya bisa membeli 1"); 
				AccountData[playerid][pEarphone] = 1;
				ShowTDN(playerid, NOTIFICATION_SUKSES, "Pembelian berhasil");
				TakeMoney(playerid, g_ElectronicDetails[i][e_shopPrice]);
				WarungData[id][warungMoney] += g_ElectronicDetails[i][e_shopPrice];

				new icsr[125];
				mysql_format(g_SQL, icsr, sizeof(icsr), "UPDATE `player_characters` SET `Char_Earphone`=1 WHERE `pID`=%d", AccountData[playerid][pID]);
				mysql_tquery(g_SQL, icsr);
				return 1;
			}
			if(!strcmp(string, "Boombox"))
			{
				if(AccountData[playerid][pVip] < 1) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda bukan pengguna VIP!");
				if(PlayerHasItem(playerid, "Boombox")) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda sudah memiliki boombox!");

				TakeMoney(playerid, g_ElectronicDetails[i][e_shopPrice] * AccountData[playerid][pAmountInv]);
				WarungData[id][warungMoney] += g_ElectronicDetails[i][e_shopPrice] * AccountData[playerid][pAmountInv];

				new invid = Inventory_Add(playerid, "Boombox", 2103);
				if(invid == -1) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak dapat memasukan item lagi");

				ShowItemBox(playerid, "Received 1x", "Boombox", 2103);
				SendNearbyMessage(playerid, 20.0, COLOR_PURPLE, "* %s membeli %s dari warung.", GetName(playerid), string); 
				return 1;
			}

			new invid = Inventory_Add(playerid, string, model, 1);
			if(invid == -1) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak dapat memasukan item lagi");

			TakeMoney(playerid, g_ElectronicDetails[i][e_shopPrice] * AccountData[playerid][pAmountInv]);
			WarungData[id][warungMoney] += g_ElectronicDetails[i][e_shopPrice] * AccountData[playerid][pAmountInv];
			ShowItemBox(playerid, "Received 1x", string, model);
			SendNearbyMessage(playerid, 20.0, COLOR_PURPLE, "* %s membeli %s dari warung.", GetName(playerid), string); 
		}
		Menu_Close(playerid);
	}
	if(textid == MenuUI::Textdraw[playerid][3])
	{
		Menu_Close(playerid);
	}
	//inventory click new 
    for(new i = 0; i < MAX_INVENTORY; i++)
	{
		if (textid == Inv_Textdraw[playerid][box_index + i])
        {
            new Old = AccountData[playerid][pSelectItem];
			if(InventoryData[playerid][i][invExists])
			{
				UnselectItem(playerid);
				SelectItem(playerid, i);
			}
			else 
			{
				PlayerPlaySound(playerid, 1052, 0, 0, 0);
				if(Old != -1)
				{ 
					if(InventoryData[playerid][i][invExists])
						return 0;
					MoveItemToNewSlot(playerid, Old, i);
					UnselectItem(playerid);
					Old = -1;
				}
			}
		}
	}
    if (textid == Inv_Textdraw[playerid][17])
    {
		new id = AccountData[playerid][pSelectItem];
		if(id == -1)
		{
			Info(playerid, "Pilih barang terlebih dahulu");
		}
        else
        {
            ShowPlayerDialog(playerid, DIALOG_SETAMOUNT, DIALOG_STYLE_INPUT, "Inventory Set Amount", "Mohon masukkan berapa jumlah item yang akan diberikan:", 
			"Set", "Batal");
        }  
    }
    if (textid == Inv_Textdraw[playerid][18])//give
    {
        if(AccountData[playerid][pSelectItem] == -1) return ShowTDN(playerid, NOTIFICATION_WARNING, "Anda belum memilih barang!");
		if(AccountData[playerid][pAmountInv] == 0) return ShowTDN(playerid, NOTIFICATION_WARNING, "Anda belum input jumlah yang akan diberikan!");
		
		new frmxt[355], string[512];
		strunpack(string, InventoryData[playerid][AccountData[playerid][pSelectItem]][invItem]);
		

		if(!strcmp(string, "Sampah Makanan"))
			return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat memberikan sampah kepada orang lain!");
		
		if(!strcmp(string, "Boombox"))
			return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat memberikan Boombox kepada orang lain!");

		new count = 0;
		foreach(new i : Player) if(i != playerid) if(IsPlayerNearPlayer(playerid, i, 2.5))
		{
			format(frmxt, sizeof(frmxt), "%sPlayer ID: %d\n", frmxt, i);
			NearestPlayer[playerid][count++] = i;
		}
		
		if(count == 0)
		{
			PlayerPlaySound(playerid, 5206, 0.0, 0.0, 0.0);
			Inventory_Close(playerid);
			return ShowPlayerDialog(playerid, DIALOG_UNUSED, DIALOG_STYLE_MSGBOX, ""ALTHF"EAGLE "WHITE"- Give Item",
			"Tidak ada player yang dekat dengan anda!", "Tutup", "");
		}

		ShowPlayerDialog(playerid, DIALOG_MEMBERI, DIALOG_STYLE_LIST, ""ALTHF"EAGLE "WHITE"- Give Item", frmxt, "Pilih", "Close");
    }
    if (textid == Inv_Textdraw[playerid][19])//drop
    {
        if(IsPlayerInAnyVehicle(playerid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak Bisa Membuka Menu Ini Jika Didalam kendaraan");
        
        OpenDropItemTD(playerid);
    }

    for(new i = 0; i < 9; i++)
    {
        if (textid == Inv_Textdraw[playerid][index_dbox + i])
        {
            if(IsPlayerInAnyVehicle(playerid)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak Bisa Jika Didalam kendaraan");
            new id = Item_Nearest(playerid);

            if(index_dbox + i != -1)
            {
            	if(id != -1)
	            {
                    	if(GetTotalWeightFloat(playerid) >= 150) return ShowTDN(playerid, NOTIFICATION_ERROR, "Inventory anda telah penuh!");
	                    if(Inventory_Items(playerid) >= MAX_INVENTORY) return ShowTDN(playerid, NOTIFICATION_ERROR, "Slot Inventory anda telah penuh!");

	                    if(PickupItem(playerid, id))
	                    {
	                        SendRPMeAboveHead(playerid, "Mengutip sesuatu dari tanah", X11_PLUM1);
	                        ApplyAnimation(playerid, "CARRY", "liftup", 3.1, 0, 0, 0, 0, 0, 1);
	                    }
	                    else ShowTDN(playerid, NOTIFICATION_ERROR, "Inventory anda telah penuh!");

	            }
	            else
	            {
            		if(AccountData[playerid][pSelectItem] < 0) return ShowTDN(playerid, NOTIFICATION_WARNING, "Anda belum memilih barang!");
					if(AccountData[playerid][pAmountInv] == 0) return ShowTDN(playerid, NOTIFICATION_WARNING, "Anda belum menentukan jumlah barang!");
					if(AccountData[playerid][ActivityTime] != 0) return ShowTDN(playerid, NOTIFICATION_WARNING, "Anda sedang melakukan sesuatu, tunggu hingga progress selesai!");

					new itemid = AccountData[playerid][pSelectItem],
						amount = AccountData[playerid][pAmountInv],
						model = InventoryData[playerid][AccountData[playerid][pSelectItem]][invModel],
						string[ 256 ];

					strunpack(string, InventoryData[playerid][itemid][invItem]);

					new trash_nearest = TrashNearest(playerid);
					if(trash_nearest != -1)
					{
						if(amount < 1) return ShowTDN(playerid, NOTIFICATION_ERROR, "Jumlah tidak valid!");
						if(amount > InventoryData[playerid][AccountData[playerid][pSelectItem]][invQuantity]) return ShowTDN(playerid, NOTIFICATION_ERROR, sprintf("Anda tidak memiliki %s sebanyak itu!", string));
						Inventory_Remove(playerid, string, amount);
						Inventory_Close(playerid);
						ShowItemBox(playerid, sprintf("Removed %dx", amount), string, model);
						ApplyAnimation(playerid, "GRENADE", "WEAPON_throwu", 4.1, 0, 0, 0, 0, 0, 1);

						SendRPMeAboveHead(playerid, sprintf("Membuang %d %s miliknya ke tong sampah", amount, string), X11_PLUM1);
					}
					else if(IsPeleburanArea(playerid))
					{
						if(AccountData[playerid][pFaction] != FACTION_POLISI) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda bukan anggota kepolisian!");
						if(AccountData[playerid][pInjured]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Anda sedang pingsan!");
						if(amount < 1 || amount > InventoryData[playerid][AccountData[playerid][pSelectItem]][invQuantity]) return ShowTDN(playerid, NOTIFICATION_ERROR, "Jumlah tidak valid!");

						Inventory_Remove(playerid, string, amount);
						Inventory_Close(playerid);
						ShowItemBox(playerid, sprintf("Removed %dx", amount), string, model);
						ApplyAnimation(playerid, "GRENADE", "WEAPON_throwu", 4.1, 0, 0, 0, 0, 0, 1);

						SendRPMeAboveHead(playerid, sprintf("Melempar %d %s ke tempat peleburan", amount, string), X11_PLUM1);
					}
					else
					{
						if(!strcmp(string, "Sampah Makanan"))
						{
							ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat membuang sampah sembarangan!");
							return 1;
						}
						else if(!strcmp(string, "Smartphone"))
						{
							ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat membuang item ini!");
							return 1;
						}
						else if(!strcmp(string, "Hiu"))
						{
							ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat membuang item ini!");
							return 1;
						}
						else if(!strcmp(string, "Penyu"))
						{
							ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat membuang item ini!");
							return 1;
						}
						else if(!strcmp(string, "Kayu"))
						{
							ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat membuang item ini!");
							return 1;
						}
						else if(!strcmp(string, "Kayu Potongan"))
						{
							ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat membuang item ini!");
							return 1;
						}
						else if(!strcmp(string, "Ayam Hidup"))
						{
							ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat membuang item ini!");
							return 1;
						}
						else if(!strcmp(string, "Ayam Potongan"))
						{
							ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat membuang item ini!");
							return 1;
						}
						else if(!strcmp(string, "Bulu"))
						{
							ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat membuang item ini!");
							return 1;
						}
						else if(!strcmp(string, "Boxmats"))
						{
							ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat membuang item ini!");
							return 1;
						}
						else if(!strcmp(string, "Pancingan"))
						{
							ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat membuang item ini!");
							return 1;
						}
						else if(!strcmp(string, "Umpan"))
						{
							ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat membuang item ini!");
							return 1;
						}
						else if(!strcmp(string, "Batu Kotor"))
						{
							ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat membuang item ini!");
							return 1;
						}
						else if(!strcmp(string, "Batu Bersih"))
						{
							ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat membuang item ini!");
							return 1;
						}
						else if(!strcmp(string, "Petrol"))
						{
							ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat membuang item ini!");
							return 1;
						}
						else if(!strcmp(string, "Pure Oil"))
						{
							ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat membuang item ini!");
							return 1;
						}
						else if(!strcmp(string, "Uang Merah"))
						{
							ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat membuang item ini!");
							return 1;
						}
                        else if(!strcmp(string, "Smartphone"))
						{
							ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat membuang item ini!");
							return 1;
						}
					 	else if(!strcmp(string, "Boombox"))
						{
							ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat membuang item ini!");
							return 1;
						}
						else if(!strcmp(string, "Penyu"))
						{
							ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat membuang item ini!");
							return 1;
						}
						else if(!strcmp(string, "Vape"))
						{
							ShowTDN(playerid, NOTIFICATION_ERROR, "Tidak dapat membuang item ini!");
							return 1;
						}
						if(amount < 1) return ShowTDN(playerid, NOTIFICATION_ERROR, "Jumlah input tidak valid!");
						if(amount > InventoryData[playerid][itemid][invQuantity]) return ShowTDN(playerid, NOTIFICATION_ERROR, sprintf("Anda tidak memiliki %s sebanyak itu!", string));

						if(!strcmp(string, "Radio", true))
						{
							if(ToggleRadio[playerid] || RadioMicOn[playerid])
							{
								ToggleRadio[playerid] = false;
								RadioMicOn[playerid] = false;
								CallRemoteFunction("UpdatePlayerVoiceMicToggle", "dd", playerid, false);
								CallRemoteFunction("UpdatePlayerVoiceRadioToggle", "dd", playerid, false);
								CallRemoteFunction("AssignFreqToFSVoice", "ddd", playerid, true, 0);
							//	EAGLEUI_SetStringPlayer(playerid, ATRP_RadioTD[playerid][7], "0");
							}
						}
						DropPlayerItem(playerid, itemid, amount);
					}
	                }
            }
            break;
        }
    }

    if (textid == Inv_Textdraw[playerid][20])
    {
        Inventory_Close(playerid);
    }
    if (textid == Inv_Textdraw[playerid][21])
    {
        new id = AccountData[playerid][pSelectItem];

        if (id == -1) 
        {
            ShowTDN(playerid, NOTIFICATION_ERROR, "Anda belum memilih item");
        } 
        else 
        {
            new string[64];
            strunpack(string, InventoryData[playerid][id][invItem]);

            if (!PlayerHasItem(playerid, string)) {
                ShowTDN(playerid, NOTIFICATION_ERROR, "Item ini tidak ada di dalam inventory anda");
                Inventory_Show(playerid);
            } 
            else 
            {
                //if (ItemCantUse(string)) return ShowTDN(playerid, NOTIFICATION_ERROR, "Item tersebut tidak bisa digunakan!");
                    //OnPlayerUseItem(playerid, id, string);
                    CallLocalFunction("OnPlayerUseItem", "ids", playerid, id, string);

            }
        }
    }
	if(textid == Althaf_TollTD[playerid][19])
	{
		new forcount = MuchNumber(sizeof(BarrierInfo));
		for(new i = 0; i < forcount; i++)
		{
			if(i < sizeof(BarrierInfo))
			{
				if(IsPlayerInRangeOfPoint(playerid, 8.0, BarrierInfo[i][brPos_X], BarrierInfo[i][brPos_Y], BarrierInfo[i][brPos_Z]))
				{
					if(BarrierInfo[i][brOrg] == TEAM_NONE)
					{
						if(!BarrierInfo[i][brOpen])
						{
							if(AccountData[playerid][pMoney] < 100 && !IsVehicleFaction(GetPlayerVehicleID(playerid)))
							{
								ShowTDN(playerid, NOTIFICATION_INFO, "Anda membutuhkan "YELLOW"$100"WHITE" untuk membayar Toll");
							}
							else if(IsVehicleFaction(GetPlayerVehicleID(playerid)))
							{
								MoveDynamicObject(gBarrier[i], BarrierInfo[i][brPos_X], BarrierInfo[i][brPos_Y], BarrierInfo[i][brPos_Z] + 0.7, BARRIER_SPEED, 0.0, 0.0, BarrierInfo[i][brPos_A] + 180);
								SetTimerEx("BarrierClose", 10000, 0, "i", i);
								BarrierInfo[i][brOpen] = true;
								ShowTDN(playerid, NOTIFICATION_INFO, "Hati hati dijalan, Pintu akan tertutup selama 10 detik");
								if(BarrierInfo[i][brForBarrierID] != -1)
								{
									new barrierid = BarrierInfo[i][brForBarrierID];
									MoveDynamicObject(gBarrier[barrierid], BarrierInfo[barrierid][brPos_X], BarrierInfo[barrierid][brPos_Y], BarrierInfo[barrierid][brPos_Z] + 0.7, BARRIER_SPEED, 0.0, 0.0, BarrierInfo[barrierid][brPos_A] + 180);
									BarrierInfo[barrierid][brOpen] = true;
								}
							}
							else
							{
								MoveDynamicObject(gBarrier[i], BarrierInfo[i][brPos_X], BarrierInfo[i][brPos_Y], BarrierInfo[i][brPos_Z] + 0.7, BARRIER_SPEED, 0.0, 0.0, BarrierInfo[i][brPos_A] + 180);
								SetTimerEx("BarrierClose", 10000, 0, "i", i);
								BarrierInfo[i][brOpen] = true;
								ShowTDN(playerid, NOTIFICATION_INFO, "Hati hati dijalan, Pintu akan tertutup selama 10 detik");
								ShowItemBox(playerid, "Removed $100", "Uang", 1212);
								TakeMoney(playerid, 100);
								if(BarrierInfo[i][brForBarrierID] != -1)
								{
									new barrierid = BarrierInfo[i][brForBarrierID];
									MoveDynamicObject(gBarrier[barrierid], BarrierInfo[barrierid][brPos_X], BarrierInfo[barrierid][brPos_Y], BarrierInfo[barrierid][brPos_Z] + 0.7, BARRIER_SPEED, 0.0, 0.0, BarrierInfo[barrierid][brPos_A] + 180);
									BarrierInfo[barrierid][brOpen] = true;
								}
							}
						}
					}
					else ShowTDN(playerid, NOTIFICATION_ERROR, "Anda tidak dapat membuka toll ini!");
					break;
				}
			}
		}
		
		for(new txd = 0; txd < 26; txd++)
		{
			EAGLEUI_HidePlayer(playerid, Althaf_TollTD[playerid][txd]);
		}
		
		AllGui_Status(playerid, true);
		EAGLEUI_Cancel(playerid);
		TogglePlayerControllable(playerid, true);
		SetCameraBehindPlayer(playerid);
	}
	return 1;
}

RemovePlayerWeapon(playerid, weaponid)
{
	// Reset the player's weapons.
	ResetPlayerWeapons(playerid);
	// Set the armed slot to zero.
	SetPlayerArmedWeapon(playerid, 0);
	// Set the weapon in the slot to zero.
	AccountData[playerid][pGuns][g_aWeaponSlots[weaponid]] = 0;
	AccountData[playerid][pACTime] = gettime() + 2;
	// Set the player's weapons.
	SetWeapons(playerid);
	return 1;
}

SetCameraData(playerid)
{
	switch(random(1))
	{
		case 0: // Hope Carnival
		{
			SetPlayerVirtualWorld(playerid, 0);
			SetPlayerInterior(playerid, 0);
			Streamer_Update(playerid, STREAMER_TYPE_OBJECT);
			SetPlayerCameraPos(playerid, 485.642, -2111.710, 68.742);
			SetPlayerCameraLookAt(playerid, 483.018, -2107.744, 67.201);
			InterpolateCameraPos(playerid, 485.642, -2111.710, 68.742, 470.870, -2081.438, 61.609, 25000, CAMERA_MOVE);
		}
		/*case 1: // vinewood
		{
			SetPlayerCameraPos(playerid, 485.642, -2111.710, 68.742);
			SetPlayerCameraLookAt(playerid, 483.018, -2107.744, 67.201);
			InterpolateCameraPos(playerid, 485.642, -2111.710, 68.742, 470.870, -2081.438, 61.609, 25000, CAMERA_MOVE);
		}*/
	}
	return 1;
}

public OnPlayerSelectionMenuResponse(playerid, extraid, response, listitem, modelid)
{
    switch(extraid)
    {
        case MODEL_SELECTION_GangSkin:
        {
			SendClientMessageEx(playerid,  -1,"[SKIN ID]: %d", modelid);
			printf("[SKIN ID]: %d", modelid);
            if(response){
                AccountData[playerid][pSkin] = modelid;
                SetPlayerSkin(playerid, AccountData[playerid][pSkin]);
                TakeMoney(playerid, 50);
                ShowTDN(playerid, NOTIFICATION_INFO, sprintf("Berhasil membeli Clothes seharga: %s", FormatMoney(50)));
            }
        }
        case MODEL_SELECTION_Toys:
        {
            if(response){
                TakeMoney(playerid, -50);
                if(AccountData[playerid][PurchasedToy] == false) MySQL_CreatePlayerToy(playerid);
                pToys[playerid][AccountData[playerid][toySelected]][toy_model] = modelid;
                pToys[playerid][AccountData[playerid][toySelected]][toy_status] = 1;
                new finstring[750];
                strcat(finstring, ""dot"Spine\n"dot"Head\n"dot"Left upper arm\n"dot"Right upper arm\n"dot"Left hand\n"dot"Right hand\n"dot"Left thigh\n"dot"Right tigh\n"dot"Left foot\n"dot"Right foot");
                strcat(finstring, "\n"dot"Right calf\n"dot"Left calf\n"dot"Left forearm\n"dot"Right forearm\n"dot"Left clavicle\n"dot"Right clavicle\n"dot"Neck\n"dot"Jaw");
                ShowPlayerDialog(playerid, DIALOG_TOYPOSISIBUY, DIALOG_STYLE_LIST, ""WHITE_E"Select Bone", finstring, "Select", "Cancel");
            }
        }
        case MODEL_SELECTION_MaleSkin:
        {
			SendClientMessageEx(playerid,  -1,"[SKIN ID]: %d", modelid);
			printf("[SKIN ID]: %d", modelid);
            if(response){
                AccountData[playerid][pSkin] = modelid;
                SetPlayerSkin(playerid, AccountData[playerid][pSkin]);
                TakeMoney(playerid, 50);
                ShowTDN(playerid, NOTIFICATION_INFO, sprintf("Berhasil membeli Clothes seharga: %s", FormatMoney(50)));
            }
        }
        case MODEL_SELECTION_FemaleSkin:
        {
			SendClientMessageEx(playerid,  -1,"[SKIN ID]: %d", modelid);
			printf("[SKIN ID]: %d", modelid);
            if(response){
                AccountData[playerid][pSkin] = modelid;
                SetPlayerSkin(playerid, AccountData[playerid][pSkin]);
                TakeMoney(playerid, 50);
                ShowTDN(playerid, NOTIFICATION_INFO, sprintf("Berhasil membeli Clothes seharga: %s", FormatMoney(50)));
            }
        }
        case MODEL_SELECTION_Waa:
	    {
	        if(response)
	        {
                new
                price = 30000,
                vehicleid
                ;

                if(GetPlayerState(playerid) != PLAYER_STATE_DRIVER)
                    return Error(playerid, "You need to be inside vehicle as driver");

                if(AccountData[playerid][pMoney] < 30000)  
                    return ShowTDN(playerid, NOTIFICATION_ERROR, "Uang anda tidak mencukupi! ($30,000)");

                vehicleid = Vehicle_Nearest(playerid);

                if(vehicleid == -1)
                    return 0;

                Vehicle_ObjectAddObjects(playerid, vehicleid, modelid, OBJECT_TYPE_BODY);   
                
                SendCustomMessage(playerid, "MODSHOP", "Anda membeli "YELLOW"%s"WHITE" seharga "GREEN"%s", GetVehObjectNameByModel(modelid), FormatMoney(price));
            }
        } 
        case MODEL_SELECTION_Loco:
	    {
	        if(response)
	        {
                new
                price = 30000,
                vehicleid
                ;

                if(GetPlayerState(playerid) != PLAYER_STATE_DRIVER)
                    return Error(playerid, "You need to be inside vehicle as driver");

                if(AccountData[playerid][pMoney] < 30000)  
                    return ShowTDN(playerid, NOTIFICATION_ERROR, "Uang anda tidak mencukupi! ($30,000)");

                vehicleid = Vehicle_Nearest(playerid);

                if(vehicleid == -1)
                    return 0;

                Vehicle_ObjectAddObjects(playerid, vehicleid, modelid, OBJECT_TYPE_BODY);

                SendCustomMessage(playerid, "MODSHOP", "Anda membeli "YELLOW"%s"WHITE" seharga "GREEN"%s", GetVehObjectNameByModel(modelid), FormatMoney(price));
            }
        } 
        case MODEL_SELECTION_Transfender:
	    {
	        if(response)
	        {
                new
                price = 30000,
                vehicleid
                ;

                if(GetPlayerState(playerid) != PLAYER_STATE_DRIVER)
                    return Error(playerid, "You need to be inside vehicle as driver");

                if(AccountData[playerid][pMoney] < 30000)  
                    return ShowTDN(playerid, NOTIFICATION_ERROR, "Uang anda tidak mencukupi! ($30,000)");

                vehicleid = Vehicle_Nearest(playerid);

                if(vehicleid == -1)
                    return 0;

                Vehicle_ObjectAddObjects(playerid, vehicleid, modelid, OBJECT_TYPE_BODY);

                SendCustomMessage(playerid, "MODSHOP", "Anda membeli "YELLOW"%s"WHITE" seharga "GREEN"%s", GetVehObjectNameByModel(modelid), FormatMoney(price));
            }
        } 
    }
    return 1;
}
