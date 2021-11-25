
let matchPasswords = () => {
    let password = document.getElementsByName('p1').value;
    let confirm = document.getElementsByName('p2').value;

    if (password != confirm) {
        alert("Passwords don't match!");
        return false;
    }

    return true;
};