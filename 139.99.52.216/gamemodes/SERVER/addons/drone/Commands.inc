CMD:drone(playerid, params[])
{
    new action[32], arg[32];
    
    if(sscanf(params, "s[32]S()[32]", action, arg))
    {
        SendClientMessageEx(playerid, -1, ""ALTHF"[DRONE] "WHITE"Usage: /drone [spawn/destroy/camera/speed]");
        return 1;
    }
    
    if(!strcmp(action, "spawn", true))
    {
        if(PlayerDroneID[playerid] != -1)
            return SendClientMessageEx(playerid, -1, ""ALTHF"[DRONE] "RED"You already have a drone!");
        
        new Float:x, Float:y, Float:z;
        GetPlayerPos(playerid, x, y, z);
        
        new droneID = Drone_Create(playerid, x, y, z + 10.0);
        
        if(droneID == -1)
            return SendClientMessageEx(playerid, -1, ""ALTHF"[DRONE] "RED"Failed to create drone!");
        
        SendClientMessageEx(playerid, -1, ""ALTHF"[DRONE] "GREEN"Drone spawned! Use /drone camera to control it");
        return 1;
    }
    
    if(!strcmp(action, "destroy", true))
    {
        new droneID = Drone_GetPlayerDrone(playerid);
        
        if(droneID == -1)
            return SendClientMessageEx(playerid, -1, ""ALTHF"[DRONE] "RED"You don't have a drone!");
        
        Drone_Destroy(droneID);
        SendClientMessageEx(playerid, -1, ""ALTHF"[DRONE] "GREEN"Drone destroyed!");
        return 1;
    }
    
    if(!strcmp(action, "camera", true))
    {
        new droneID = Drone_GetPlayerDrone(playerid);
        
        if(droneID == -1)
            return SendClientMessageEx(playerid, -1, ""ALTHF"[DRONE] "RED"You don't have a drone!");
        
        if(PlayerDroneMode[playerid])
        {
            Drone_ResetCamera(playerid);
            // SendClientMessageEx(playerid, -1, ""ALTHF"[DRONE] "GREEN"Camera reset!");
        }
        else
        {
            Drone_SetCamera(playerid, droneID);
            SendClientMessageEx(playerid, -1, ""ALTHF"[DRONE] "GREEN"Drone camera activated! Use arrow keys to move");
        }
        return 1;
    }
    
    if(!strcmp(action, "speed", true))
    {
        new speed;
        
        if(sscanf(arg, "d", speed))
            return SendClientMessageEx(playerid, -1, ""ALTHF"[DRONE] "WHITE"Usage: /drone speed [0-100]");
        
        if(speed < 0 || speed > 100)
            return SendClientMessageEx(playerid, -1, ""ALTHF"[DRONE] "RED"Speed must be between 0 and 100!");
        
        new droneID = Drone_GetPlayerDrone(playerid);
        
        if(droneID == -1)
            return SendClientMessageEx(playerid, -1, ""ALTHF"[DRONE] "RED"You don't have a drone!");
        
        Drone[droneID][droneSpeed] = float(speed);
        SendClientMessageEx(playerid, -1, ""ALTHF"[DRONE] "GREEN"Drone speed set to %d%%", speed);
        return 1;
    }
    
    SendClientMessageEx(playerid, -1, ""ALTHF"[DRONE] "WHITE"Usage: /drone [spawn/destroy/camera/speed]");
    return 1;
}

