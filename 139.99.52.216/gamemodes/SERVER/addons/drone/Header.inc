#define MAX_DRONES 50
#define DRONE_MODEL 501 // Invisible 3091

enum DroneData {
    bool:droneExists,
    droneOwner,
    Float:droneX,
    Float:droneY,
    Float:droneZ,
    Float:droneRX,
    Float:droneRY,
    Float:droneRZ,
    droneVehicleID,
    droneCamera,
    bool:droneActive,
    Float:droneVelX,
    Float:droneVelY,
    Float:droneVelZ,
    droneLastMove,
    Float:droneSpeed,
    dronePlayerActor,
    bool:thermalActive,
    Float:droneSavedX,
    Float:droneSavedY,
    Float:droneSavedZ,
    droneSavedTime
};

new Drone[MAX_DRONES][DroneData];
new PlayerDroneID[MAX_PLAYERS] = {-1, ...};
new bool:PlayerDroneMode[MAX_PLAYERS] = {false, ...};
new DroneCount = 0;
