function checkPass() {
    password1 = document.getElementById('password'),
    password2 = document.getElementById('re-password'),
    message = document.getElementById('confirmMessage'),
    colors = {
        goodColor: "#fff",
        goodColored: "#087a08",
        badColor: "#fff",
        badColored:"#ed0b0b"
    },
    strings = {
        "confirmMessage": ["Password matched", "Password unmatched"]
    };
    
    if(password1.value === password2.value && (password.value + password2.value) !== "") {
        password2.style.backgroundColor = colors["goodColor"];
        message.style.color = colors["goodColored"];
        message.innerHTML = strings["confirmMessage"][0];
    }
    else if(!(password2.value === "")) {
        password2.style.backgroundColor = colors["badColor"];
        message.style.color = colors["badColored"];
        message.innerHTML = strings["confirmMessage"][1];
    }
    else {
        message.innerHTML = "";	
    }
    
}

function toggle_visibility(id) {
    var e = document.getElementById(id);
    if(e.style.display == 'block')
        e.style.display = 'none';
    else
        e.style.display = 'block';
}