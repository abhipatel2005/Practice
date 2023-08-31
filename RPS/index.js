let compChoice = Math.floor(Math.random() * 3) + 1;

switch(compChoice) {

    case 1 : document.querySelector(".cmp .comp").setAttribute("src", "./imgs/rock.png");
            document.querySelector(".cmp .comp").setAttribute("alt", 1);
    break;

    case 2 : document.querySelector(".cmp .comp").setAttribute("src", "./imgs/paper.jpg");
            document.querySelector(".cmp .comp").setAttribute("alt", 2);
    break;

    case 3 : document.querySelector(".cmp .comp").setAttribute("src", "./imgs/scissor.png");
            document.querySelector(".cmp .comp").setAttribute("alt", 3);
    break;
}

let compc = document.querySelector(".cmp .comp").getAttribute("alt");

let getImageName = function() {
    document.onclick = function(e) {
      if (e.target.tagName == 'IMG') {
        let image = e.target.getAttribute("src");
        let user = e.target.getAttribute("alt");
        document.querySelector(".cmp .user").setAttribute("src", image);
        document.querySelector(".cmp .user").setAttribute("alt", user);
        document.querySelector(".uchoice").setAttribute("id", "hidden");
        document.querySelector(".cmp").setAttribute("id", "show");

        let userc = document.querySelector(".cmp .user").getAttribute("alt");

        if (userc == compc) {
                document.querySelector("h2").textContent = "It's Tie...!";
                document.querySelector(".cmp .user").setAttribute("id", "animate");
                document.querySelector(".cmp .comp").setAttribute("id", "animate");
        } 
        else if((userc == 2 && compc == 1) || (userc == 1 && compc == 3) || (userc == 3 && compc == 2)){
                document.querySelector("h2").textContent = "User Won...!";
                document.querySelector(".cmp .user").setAttribute("id", "animate");
                document.querySelector(".cmp .comp").setAttribute("id", "danimate");
        }
        else {
                document.querySelector("h2").textContent = "Computer Won...!";
                document.querySelector(".cmp .comp").setAttribute("id", "animate");
                document.querySelector(".cmp .user").setAttribute("id", "danimate");
        }
    }
    }
}

getImageName();

document.querySelector("#rematch").addEventListener("click",() => {
        document.querySelector(".uchoice").setAttribute("id", "show");
        document.querySelector(".cmp").setAttribute("id", "hidden");
        document.querySelector("h2").textContent = "Select your Choice";
        window.location.reload();
})