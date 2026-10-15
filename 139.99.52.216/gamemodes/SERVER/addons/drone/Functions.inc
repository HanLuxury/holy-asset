stock Float:GetDistance3D(Float:x1, Float:y1, Float:z1, Float:x2, Float:y2, Float:z2)
{
    return floatsqroot((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2) + (z1-z2)*(z1-z2));
}

stock Drone_Create(playerid, Float:x, Float:y, Float:z)
{
    if(DroneCount >= MAX_DRONES) return -1;
    if(PlayerDroneID[playerid] != -1) return -1; // Pemain sudah memiliki drone.
    
    new droneID = -1;
    for(new i = 0; i < MAX_DRONES; i++)
    {
        if(!Drone[i][droneExists])
        {
            droneID = i;
            break;
        }
    }
    
    if(droneID == -1) return -1;
    
    Drone[droneID][droneExists] = true;
    Drone[droneID][droneOwner] = playerid;
    Drone[droneID][droneX] = x + 1.0;
    Drone[droneID][droneY] = y + 1.0;
    Drone[droneID][droneZ] = z + 1.0;
    
    Drone[droneID][droneRX] = 0.0;
    Drone[droneID][droneRY] = 0.0;
    Drone[droneID][droneRZ] = 0.0;
    Drone[droneID][droneActive] = true;
    Drone[droneID][droneSpeed] = 10.0; // Default speed
    
    Drone[droneID][droneVehicleID] = CreateVehicle(DRONE_MODEL, Drone[droneID][droneX], Drone[droneID][droneY], Drone[droneID][droneZ], 2.0, -1, -1, -1);
    
    ApplyAnimation(playerid, "BOMBER", "BOM_Plant", 4.0, 0, 0, 0, 0, 0, 1);
    
    PlayerDroneID[playerid] = droneID;
    DroneCount++;
    
    return droneID;
}

stock Drone_Destroy(droneID)
{
    if(droneID < 0 || droneID >= MAX_DRONES) return 0;
    if(!Drone[droneID][droneExists]) return 0;
    
    new playerid = Drone[droneID][droneOwner];
    
    if(IsValidVehicle(Drone[droneID][droneVehicleID]))
    {
        DestroyVehicle(Drone[droneID][droneVehicleID]);
    }
    
    if(Drone[droneID][dronePlayerActor] != INVALID_ACTOR_ID)
    {
        DestroyActor(Drone[droneID][dronePlayerActor]);
    }
    
    Drone[droneID][droneExists] = false;
    Drone[droneID][droneActive] = false;
    Drone[droneID][dronePlayerActor] = INVALID_ACTOR_ID;
    PlayerDroneID[playerid] = -1;
    PlayerDroneMode[playerid] = false;
    
    DroneCount--;
    return 1;
}

stock Drone_GetPlayerDrone(playerid)
{
    return PlayerDroneID[playerid];
}

stock Drone_Move(droneID, Float:x, Float:y, Float:z, Float:speed)
{
    if(droneID < 0 || droneID >= MAX_DRONES) return 0;
    if(!Drone[droneID][droneExists]) return 0;
    
    Drone[droneID][droneX] = x;
    Drone[droneID][droneY] = y;
    Drone[droneID][droneZ] = z;
    
    if(IsValidVehicle(Drone[droneID][droneVehicleID]))
    {
        SetVehiclePos(Drone[droneID][droneVehicleID], x, y, z);
    }
    
    return 1;
}

stock Drone_SetCamera(playerid, droneID)
{
    if(droneID < 0 || droneID >= MAX_DRONES) return 0;
    if(!Drone[droneID][droneExists]) return 0;
    if(Drone[droneID][droneOwner] != playerid) return 0;
    
    new Float:x = Drone[droneID][droneX];
    new Float:y = Drone[droneID][droneY];
    new Float:z = Drone[droneID][droneZ];
    
    new Float:playerX, Float:playerY, Float:playerZ;
    GetPlayerPos(playerid, playerX, playerY, playerZ);
    
    Drone[droneID][droneSavedX] = playerX;
    Drone[droneID][droneSavedY] = playerY;
    Drone[droneID][droneSavedZ] = playerZ;
    
    Drone[droneID][droneCamera] = CreatePlayerObject(playerid, 19300, x, y, z, 0.0, 0.0, 0.0);
    Drone[droneID][dronePlayerActor] = CreateActor(GetPlayerSkin(playerid), playerX, playerY, playerZ, 0.0);
    
    ApplyActorAnimation(playerid, "CASINO", "CARDS_LOOP", 4.1, 1, 0, 0, 1, -1);
    TogglePlayerSpectating(playerid, true);
    
    new Float:camStartX, Float:camStartY, Float:camStartZ;
    GetPlayerCameraPos(playerid, camStartX, camStartY, camStartZ);
    
    InterpolateCameraPos(playerid, camStartX, camStartY, camStartZ, x - 5.0, y - 5.0, z, 2000, CAMERA_MOVE);
    InterpolateCameraLookAt(playerid, camStartX, camStartY, camStartZ, x, y, z, 2000, CAMERA_MOVE);
    
    SetTimerEx("Drone_AttachCamera", 2100, false, "ii", playerid, droneID);
    
    AllGui_Status(playerid, false);
    Drone_ToggleUI(playerid, true);
    
    PlayerDroneMode[playerid] = true;
    return 1;
}

stock Drone_ResetCamera(playerid)
{
    new droneID = Drone_GetPlayerDrone(playerid);
    
    if(droneID != -1)
    {
        if(Drone[droneID][droneCamera] != 0)
        {
            DestroyPlayerObject(playerid, Drone[droneID][droneCamera]);
            Drone[droneID][droneCamera] = 0;
        }
        
        if(Drone[droneID][dronePlayerActor] != INVALID_ACTOR_ID)
        {
            DestroyActor(Drone[droneID][dronePlayerActor]);
            Drone[droneID][dronePlayerActor] = INVALID_ACTOR_ID;
        }
        
        if(Drone[droneID][thermalActive])
        {
            Drone_ToggleThermal(playerid, droneID, false);
        }
    }
    
    TogglePlayerSpectating(playerid, false);
    
    if(droneID != -1)
    {
        SetPlayerPos(playerid, Drone[droneID][droneSavedX], Drone[droneID][droneSavedY], Drone[droneID][droneSavedZ]);
    }
    
    Drone_ToggleUI(playerid, false);
    AllGui_Status(playerid, true);
    SetCameraBehindPlayer(playerid);

    PlayerDroneMode[playerid] = false;
    return 1;
}

stock Drone_ToggleThermal(playerid, droneID, bool:mode)
{
    if(droneID < 0 || droneID >= MAX_DRONES) return 0;
    if(!Drone[droneID][droneExists]) return 0;
    
    Drone[droneID][thermalActive] = mode;
    
    if(mode)
    {
        new hour, minute;
        GetPlayerTime(playerid, hour, minute);
        Drone[droneID][droneSavedTime] = hour;
        
        SetPlayerTime(playerid, 22, 0);
        CEF_Overlay(playerid, "thermal", true);
        SendClientMessageEx(playerid, -1, ""ALTHF"[DRONE] "GREEN"Thermal Vision: ON");
    }
    else
    {
        SetPlayerTime(playerid, Drone[droneID][droneSavedTime], 0);
        CEF_Overlay(playerid, "thermal", false);
        SendClientMessageEx(playerid, -1, ""ALTHF"[DRONE] "RED"Thermal Vision: OFF");
    }
    
    return 1;
}

stock Drone_UpdateMovement(playerid, droneID)
{
    if(droneID < 0 || droneID >= MAX_DRONES) return 0;
    if(!Drone[droneID][droneExists]) return 0;
    if(!PlayerDroneMode[playerid]) return 0;
    
    new keys, ud, lr;
    GetPlayerKeys(playerid, keys, ud, lr);
    
    new Float:acceleration = 0.005;
    new Float:maxSpeed = 0.5;
    new Float:friction = 0.94;
    
    new Float:speedMultiplier;
    if(Drone[droneID][droneSpeed] <= 20.0)
    {
        speedMultiplier = 0.1 + (Drone[droneID][droneSpeed] / 500.0); // 0.1 to 1.0
    }
    else
    {
        speedMultiplier = 1.0 + ((Drone[droneID][droneSpeed] - 50.0) / 25.0); // 1.0 to 3.0
    }
    
    acceleration *= speedMultiplier;
    maxSpeed *= speedMultiplier;
    
    new Float:camX, Float:camY, Float:camZ;
    new Float:frontX, Float:frontY, Float:frontZ;
    
    GetPlayerCameraPos(playerid, camX, camY, camZ);
    GetPlayerCameraFrontVector(playerid, frontX, frontY, frontZ);
    
    #define DRONE_OFFSET_X (frontX * 50.0)
    #define DRONE_OFFSET_Y (frontY * 50.0)
    #define DRONE_OFFSET_Z (frontZ * 50.0)
    
    Drone[droneID][droneVelX] *= friction;
    Drone[droneID][droneVelY] *= friction;
    Drone[droneID][droneVelZ] *= friction;

    if(ud < 0)
    {
        Drone[droneID][droneVelX] += DRONE_OFFSET_X * acceleration;
        Drone[droneID][droneVelY] += DRONE_OFFSET_Y * acceleration;
        Drone[droneID][droneVelZ] += DRONE_OFFSET_Z * acceleration;
    }
    else if(ud > 0)
    {
        Drone[droneID][droneVelX] -= DRONE_OFFSET_X * acceleration;
        Drone[droneID][droneVelY] -= DRONE_OFFSET_Y * acceleration;
        Drone[droneID][droneVelZ] -= DRONE_OFFSET_Z * acceleration;
    }
    
    if(lr < 0)
    {
        Drone[droneID][droneVelX] -= DRONE_OFFSET_Y * acceleration;
        Drone[droneID][droneVelY] += DRONE_OFFSET_X * acceleration;
    }
    else if(lr > 0)
    {
        Drone[droneID][droneVelX] += DRONE_OFFSET_Y * acceleration;
        Drone[droneID][droneVelY] -= DRONE_OFFSET_X * acceleration;
    }
    
    if(keys & KEY_SPRINT) 
    {
        Drone[droneID][droneVelZ] += acceleration * 0.5;
    }
    if(keys & KEY_CROUCH) 
    {
        Drone[droneID][droneVelZ] -= acceleration * 0.5;
    }
    
    if(Drone[droneID][droneVelX] > maxSpeed) Drone[droneID][droneVelX] = maxSpeed;
    if(Drone[droneID][droneVelX] < -maxSpeed) Drone[droneID][droneVelX] = -maxSpeed;
    if(Drone[droneID][droneVelY] > maxSpeed) Drone[droneID][droneVelY] = maxSpeed;
    if(Drone[droneID][droneVelY] < -maxSpeed) Drone[droneID][droneVelY] = -maxSpeed;
    if(Drone[droneID][droneVelZ] > maxSpeed) Drone[droneID][droneVelZ] = maxSpeed;
    if(Drone[droneID][droneVelZ] < -maxSpeed) Drone[droneID][droneVelZ] = -maxSpeed;

    Drone[droneID][droneX] += Drone[droneID][droneVelX];
    Drone[droneID][droneY] += Drone[droneID][droneVelY];
    Drone[droneID][droneZ] += Drone[droneID][droneVelZ];

    if(IsValidVehicle(Drone[droneID][droneVehicleID]))
    {
        SetVehiclePos(Drone[droneID][droneVehicleID], Drone[droneID][droneX], Drone[droneID][droneY], Drone[droneID][droneZ]);
    }

    if(Drone[droneID][droneCamera] != 0)
    {
        SetPlayerObjectPos(playerid, Drone[droneID][droneCamera], Drone[droneID][droneX], Drone[droneID][droneY], Drone[droneID][droneZ]);
    }
    
    #undef DRONE_OFFSET_X
    #undef DRONE_OFFSET_Y
    #undef DRONE_OFFSET_Z
    
    return 1;
}

#include <YSI_Coding/y_hooks>

hook OnPlayerDisconnect(playerid, reason)
{
    for(new i = 0; i < MAX_DRONES; i++)
    {
        if(Drone[i][droneExists])
        {
            if(Drone[i][dronePlayerActor] != INVALID_ACTOR_ID)
            {
                DestroyActor(Drone[i][dronePlayerActor]);
            }
            Drone_Destroy(i);
        }
    }
    
    PlayerDroneMode[playerid] = false;
    return 1;
}

hook OnPlayerKeyStateChange(playerid, newkeys, oldkeys)
{
    if(!PlayerDroneMode[playerid]) return 1;
    
    new droneID = Drone_GetPlayerDrone(playerid);
    if(droneID == -1) return 1;
    
    if((newkeys & KEY_WALK) && !(oldkeys & KEY_WALK))
    {
        Drone_ToggleThermal(playerid, droneID, !Drone[droneID][thermalActive]);
    }
    
    return 1;
}

ptask DroneUpdate[16](playerid)
{
    if(!SQL_IsCharacterLogged(playerid)) return 1;
    
    new droneID = Drone_GetPlayerDrone(playerid);
    
    if(droneID == -1) return 1;
    if(!PlayerDroneMode[playerid]) return 1;
    
    Drone_UpdateMovement(playerid, droneID);

    new playerName[MAX_PLAYER_NAME];
    GetPlayerName(playerid, playerName, sizeof(playerName));
    
    new altitudeStr[32];
    format(altitudeStr, sizeof(altitudeStr), "%.0fm", Drone[droneID][droneZ]);
    
    new speedStr[32];
    new Float:speedKmh = Drone[droneID][droneSpeed] * 2.5;
    format(speedStr, sizeof(speedStr), "%.0fkm/h", speedKmh);
    
    new positionStr[64];
    new Float:angle = 0.0;
    if(Drone[droneID][droneVelX] != 0.0 || Drone[droneID][droneVelY] != 0.0)
    {
        angle = atan2(Drone[droneID][droneVelY], Drone[droneID][droneVelX]);
        angle = angle * 180.0 / 3.14159265359;
        if(angle < 0.0) angle += 360.0;
    }
    
    Drone[droneID][droneRZ] = angle;
    
    new cityName[64] = "Unknown";
    
    if(Drone[droneID][droneX] >= -2997.47 && Drone[droneID][droneX] <= -1213.91 && Drone[droneID][droneY] >= -1115.58 && Drone[droneID][droneY] <= 1659.68)
    {
        format(cityName, 64, "San Fierro");
    }
    else if(Drone[droneID][droneX] >= 869.461 && Drone[droneID][droneX] <= 2997.06 && Drone[droneID][droneY] >= 596.349 && Drone[droneID][droneY] <= 2993.87)
    {
        format(cityName, 64, "Las Venturas");
    }
    else if(Drone[droneID][droneX] >= 44.6147 && Drone[droneID][droneX] <= 2997.06 && Drone[droneID][droneY] >= -2892.97 && Drone[droneID][droneY] <= -768.027)
    {
        format(cityName, 64, "Los Santos");
    }
    else
    {
        for(new i = 0; i < sizeof(ZoneInfo); i++)
        {
            if(Drone[droneID][droneX] >= ZoneInfo[i][zonePosx1] && Drone[droneID][droneX] <= ZoneInfo[i][zonePosx2])
            {
                if(Drone[droneID][droneY] >= ZoneInfo[i][zonePosy1] && Drone[droneID][droneY] <= ZoneInfo[i][zonePosy2])
                {
                    format(cityName, 64, "%s", ZoneInfo[i][ZoneName]);
                    break;
                }
            }
        }
    }
    
    format(positionStr, sizeof(positionStr), "%s", cityName);
    
    new Float:playerX, Float:playerY, Float:playerZ;
    GetPlayerPos(playerid, playerX, playerY, playerZ);
    new Float:distance = GetDistance3D(Drone[droneID][droneX], Drone[droneID][droneY], Drone[droneID][droneZ], playerX, playerY, playerZ);
    
    new signalStr[32];
    if(distance < 50.0)
        format(signalStr, sizeof(signalStr), "OPTIMAL");
    else if(distance < 150.0)
        format(signalStr, sizeof(signalStr), "GOOD");
    else if(distance < 300.0)
        format(signalStr, sizeof(signalStr), "WEAK");
    else
        format(signalStr, sizeof(signalStr), "LOST");
    
    // CEF: HUD kamera drone (dikirim hanya bila berubah)
    Drone_SendHUD(playerid, playerName, altitudeStr, speedStr, positionStr, signalStr, Drone[droneID][thermalActive]);
    
    return 1;
}

forward Drone_AttachCamera(playerid, droneID);
public Drone_AttachCamera(playerid, droneID)
{
    if(!IsPlayerConnected(playerid) || droneID < 0 || droneID >= MAX_DRONES) return 0;
    if(!Drone[droneID][droneExists]) return 0;
    
    AttachCameraToPlayerObject(playerid, Drone[droneID][droneCamera]);
    
    return 1;
}
