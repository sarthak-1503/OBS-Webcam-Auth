
function preback() {
    window.history.forward();
}
setTimeout("preback()", 0);
window.onunload = function () { null };

$(document).ready(function () {
    $("#cancel").click(function () {
        alert("Transaction Cancelled")
        window.location.replace("/");
    });
});