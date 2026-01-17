// GLYTCH Sovereign Intelligence - V44 Core
console.log("UCP Sovereign Protocol V44 Active");

function generateUCPQR(packetData) {
    const qrContainer = document.getElementById('ucp-qr-output');
    if (!qrContainer) return;
    qrContainer.innerHTML = ''; 
    new QRCode(qrContainer, {
        text: JSON.stringify(packetData),
        width: 256,
        height: 256,
        colorDark : '#ea00ea',
        colorLight : '#3c3c3c',
        correctLevel : QRCode.CorrectLevel.H
    });
}
