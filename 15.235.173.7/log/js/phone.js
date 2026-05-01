function openApp(app) {

    console.log("Open app:", app);

    if (typeof Android !== "undefined") {
        Android.sendCommand("phone_" + app);
    }
}