let phone = document.getElementById("phone");

function syncToAndroid() {
    if (window.cef) {

        let rect = phone.getBoundingClientRect();

        cef.setPosition(
            rect.left,
            rect.top,
            rect.width,
            rect.height
        );
    }
}