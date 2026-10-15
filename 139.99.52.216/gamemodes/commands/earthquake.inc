#define SMALL_QUAKE 5

new AmountOfShakes[ MAX_PLAYERS ];

forward SetPlayerEarthquakeEffect   ( playerid, amount_of_shakes );
forward EarthquakeEffects           ( playerid, interval, bool:status );

public SetPlayerEarthquakeEffect( playerid, amount_of_shakes ){
    if( amount_of_shakes < AmountOfShakes[ playerid ] )
        return 0;
    AmountOfShakes[ playerid ] = amount_of_shakes;
    new vehicleid = GetPlayerVehicleID( playerid );
    if( vehicleid ){
        if(amount_of_shakes <= SMALL_QUAKE+200 ){
            SetVehicleAngularVelocity( vehicleid, 0.09, 0.033, 0.05 );
        } else SetVehicleAngularVelocity( vehicleid, 0.03, 0.03, 0.03 );
    }
    return EarthquakeEffects( playerid, 10, false );
}

public EarthquakeEffects( playerid, interval, bool:status ){
    if( AmountOfShakes[ playerid ] <= 0 )
        return 1;
    if( !(AmountOfShakes[ playerid ]%5) ){
        new vehicleid = GetPlayerVehicleID( playerid );
        if(vehicleid){
            if(AmountOfShakes[ playerid ] <= SMALL_QUAKE+200 ){
                SetVehicleAngularVelocity( vehicleid, 0.03, 0.03, 0.03 );
            } else SetVehicleAngularVelocity( vehicleid, 0.015, 0.015, 0.015 );
        }
    }
    AmountOfShakes[ playerid ]--;
    return SetTimerEx( "EarthquakeEffects", interval, false, "iii", playerid, interval, !status );
}

CMD:earthquake(playerid, params[])
{
    if(AccountData[playerid][pAdmin] < 3)
        return PermissionError(playerid);

    new amount_of_shakes;
    if(sscanf(params, "i", amount_of_shakes))
        return Syntax(playerid, "/earthquake [interval]");

    if(amount_of_shakes < 0) return 0;
    
    foreach(new i : Player) if (IsPlayerConnected(i) && AccountData[i][pSpawned])
    {
        SetPlayerEarthquakeEffect( i, amount_of_shakes );
    }
    return 1;
}
