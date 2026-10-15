#include <YSI/y_hooks>

new
    PoliceMoneyVault,
    PemerintahMoneyVault,
    EMSMoneyVault,
    RestoMoneyVault,
    GojekMoneyVault,
    BengkelMoneyVault,
    TransMoneyVault;

enum component{
    ComponentPrice,
    ComponentStock,
    Float:ComponentPos[3],
    STREAMER_TAG_3D_TEXT_LABEL: ComponentLabel,
    STREAMER_TAG_AREA: ComponentArea
};
new Component[component];

forward LoadBrankasGoodside();
public LoadBrankasGoodside()
{
    cache_get_value_name_int(0, "bengkelmoneyvault", BengkelMoneyVault);
    cache_get_value_name_int(0, "policemoneyvault", PoliceMoneyVault);
    cache_get_value_name_int(0, "pemerintahmoneyvault", PemerintahMoneyVault);
    cache_get_value_name_int(0, "emsmoneyvault", EMSMoneyVault);
    cache_get_value_name_int(0, "restomoneyvault", RestoMoneyVault);
    cache_get_value_name_int(0, "gojekmoneyvault", GojekMoneyVault);
    cache_get_value_name_int(0, "transmoneyvault", TransMoneyVault);
    cache_get_value_name_int(0, "globaltime_rusun", g_RusunTime);

    cache_get_value_name_int(0, "component_price", Component[ComponentPrice]);
    cache_get_value_name_int(0, "component_stock", Component[ComponentStock]);
    cache_get_value_name_float(0, "component_posx", Component[ComponentPos][0]);
    cache_get_value_name_float(0, "component_posy", Component[ComponentPos][1]);
    cache_get_value_name_float(0, "component_posz", Component[ComponentPos][2]);

    Component_Refresh();
    
    printf("[EAGLE] [Saldo Goodside]: Jumlah total Saldo Faction yang dimuat 5.");
}

CMD:acomponent(playerid, params[])
{
    if(AccountData[playerid][pAdmin] < 2)
        return PermissionError(playerid);

    new option[12], nextopt[12];
    if(sscanf(params, "s[12]S()[12]", option, nextopt))
        return ShowTDN(playerid, NOTIFICATION_INFO, "/acomponent [stock/price/position/goto]");

    if(!strcmp(option, "stock", true)){
        new amount;
        if(sscanf(nextopt, "d", amount))
            return ShowTDN(playerid, NOTIFICATION_INFO, "/acomponent [stock] [stock amount]");

        if(amount < 0)
            return ShowTDN(playerid, NOTIFICATION_ERROR, "Jumlah stock tidak valid.");

        Component[ComponentStock] = amount;
        ShowTDN(playerid, NOTIFICATION_INFO, "Kamu berhasil mengubah stok komponen!");
        SendStaffMessage(X11_TOMATO, "%s mengubah stok komponen menjadi %d", AccountData[playerid][pAdminname], Component[ComponentStock]);

        Component_Refresh();

        new string[200];
        mysql_format(g_SQL, string, sizeof(string), "UPDATE `stuffs` SET `component_stock` = %d WHERE `ID` = 0", Component[ComponentStock]);
		mysql_tquery(g_SQL, string);
    }
    else if(!strcmp(option, "price", true)){
        new price;
        if(sscanf(nextopt, "d", price))
            return ShowTDN(playerid, NOTIFICATION_INFO, "/acomponent [price] [new price]");

        if(price < 0)
            return ShowTDN(playerid, NOTIFICATION_ERROR, "Harga component tidak valid.");

        Component[ComponentPrice] = price;
        ShowTDN(playerid, NOTIFICATION_INFO, "Kamu berhasil mengubah harga component!");
        SendStaffMessage(X11_TOMATO, "%s mengubah harga component menjadi %s", AccountData[playerid][pAdminname], FormatMoney(Component[ComponentPrice]));

        new string[200];
        mysql_format(g_SQL, string, sizeof(string), "UPDATE `stuffs` SET `component_price` = %d WHERE `ID` = 0", Component[ComponentPrice]);
		mysql_tquery(g_SQL, string);
    }
    else if(!strcmp(option, "position", true)){
        GetPlayerPos(playerid, Component[ComponentPos][0], Component[ComponentPos][1], Component[ComponentPos][2]);

        ShowTDN(playerid, NOTIFICATION_INFO, "Kamu berhasil memindahkan posisi pemblian component!");
        SendStaffMessage(X11_TOMATO, "%s mengubah posisi pembelian component", AccountData[playerid][pAdminname]);
        Component_Refresh();
    
        new string[200];
        mysql_format(g_SQL, string, sizeof(string), "UPDATE `stuffs` SET `component_posx` = %.4f, `component_posy` = %.4f, `component_posz` = %.4f WHERE `ID` = 0", Component[ComponentPos][0], Component[ComponentPos][1], Component[ComponentPos][2]);
		mysql_tquery(g_SQL, string);
    }
    else if(!strcmp(option, "goto", true)){
        if(Component[ComponentPos][0] != 0.0 && Component[ComponentPos][1] != 0.0 && Component[ComponentPos][2] != 0.0){
            SetPlayerPos(playerid, Component[ComponentPos][0], Component[ComponentPos][1], Component[ComponentPos][2]);
            
            ShowTDN(playerid, NOTIFICATION_INFO, "Kamu berhasil teleportasi ke tempat pembelian component.");
        }
        else ShowTDN(playerid, NOTIFICATION_INFO, "Lokasi pembelian component tidak valid.");
    }
    return 1;
}

Component_Refresh(){
    Component[ComponentLabel] = Eagle_CreateDynamic3DTextLabel(sprintf(""GREEN"[Component Store]\n"WHITE"Stock: %d\n"GREEN"[ALT] "WHITE"Membeli Component", Component[ComponentStock]), -1, Component[ComponentPos][0], Component[ComponentPos][1], Component[ComponentPos][2]+0.3, 5.0, INVALID_PLAYER_ID, INVALID_VEHICLE_ID, 1);
    Component[ComponentArea] = CreateDynamicSphere(Component[ComponentPos][0], Component[ComponentPos][1], Component[ComponentPos][2], 2.0, 0, 0, -1);
}

hook OnPlayerKeyStateChange(playerid, newkeys, oldkeys){
    if(newkeys & KEY_WALK && GetPlayerState(playerid) == PLAYER_STATE_ONFOOT)
    {
        if(IsPlayerInDynamicArea(playerid, Component[ComponentArea]))
        {
            Dialog_Show(playerid, Component_Buy, DIALOG_STYLE_INPUT, "Buy Component", sprintf(""WHITE"Component Stock: %d\nComponent Price (per-1): %s\n\nMasukkan jumlah komponen yang ingin di beli:", Component[ComponentStock], FormatMoney(Component[ComponentPrice])), "Beli", "Tutup");
        }
    }
}

hook OnGameModeInit(){
    Component_Refresh();
}

Dialog:Component_Buy(playerid, response, listitem, inputtext[]){
    if(response){
        new amount = strval(inputtext),
            price = amount * Component[ComponentPrice];

        if(amount < 1)
            return Dialog_Show(playerid, Component_Buy, DIALOG_STYLE_INPUT, "Buy Component", sprintf(""WHITE"Component Stock: %d\nComponent Price (per-1): %s\n\nMasukkan jumlah komponen yang ingin di beli:", Component[ComponentStock], FormatMoney(Component[ComponentPrice])), "Beli", "Tutup");

        if(amount > Component[ComponentStock])
            return ShowTDN(playerid, NOTIFICATION_INFO, "Stok component tidak mencukupi.");

        if(price > AccountData[playerid][pMoney])
            return ShowTDN(playerid, NOTIFICATION_ERROR, sprintf("Uang anda tidak mencukupi (perlu %s)", FormatMoney(AccountData[playerid][pMoney])));

        Component[ComponentStock] -= amount;
        GiveMoney(playerid, -price);
        PemerintahMoneyVault += price;

        Inventory_Add(playerid, "Component", 19627, amount);
	    ShowItemBox(playerid, sprintf("ADDED %dx", amount), "Component", 19627);
        
        Component_Refresh();

        new string[200];
        mysql_format(g_SQL, string, sizeof(string), "UPDATE `stuffs` SET `component_stock` = %d WHERE `ID` = 0", Component[ComponentStock]);
		mysql_tquery(g_SQL, string);

        Info(playerid, "Kamu telah membeli %d component seharga %s", amount, FormatMoney(price));
    }
    return 1;
}