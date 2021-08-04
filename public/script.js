var currentPage = 0;
var totalPages = -1;
let data = '';
let yourlocation = "";

let googleUser;

const searchInput = document.querySelector("#search");
const searchButton = document.querySelector('.magnifyingglass--btn');
const results = document.querySelector(".results");
const showingresultsfor = document.querySelector(".showingresutlsfor");
const signupbtn = document.querySelector(".signup--btn");

let fullhtml = '';
function renderCard({ dates, name, locale, url, distance, images, info, classifications }) {
    let html = `
          <div class="hero--event_2">
                <img src="${images[2].url}" class="hero--img">
                <h3 class="hero--eventname">${name.length > 14 ? name.slice(0, 20) + '...' : name}</h3>
                <h4 class="hero--eventdesc1">${dates.start.localDate} | ${classifications[0].segment.name} </h4>
                <h4 class="hero--eventdesc2">${info === undefined ? "There is no info on this event. If you want to read more about the event, click the I'm interested button below :D" : info}</h4>
                  <button class="learnmore"><a target="_blank" style="color: white; text-decoration: none" href="${url}">I'm Interested</a></button>
              <img src='images/icons8-heart-96.png' class="bookmark">

            </div>
  `
    fullhtml += html;
}

// TODO: THINK ABOUT EMPTY SEARCH

searchButton.addEventListener("click", function () {
    fullhtml = ''
    results.innerHTML = ''
    fetch('secret.json')
        .then(response => response.text())
        .then(data => {
            data = JSON.parse(data)
            if (searchInput.value.length > 0) {
                yourlocation = searchInput.value;
            }
            const url = `https://app.ticketmaster.com/discovery/v2/events?apikey=${data["ticketmaster-api-key"]}&city=${yourlocation}&radius=50&unit=miles&locale=*&page=${currentPage}`;
            fetch(url)
                .then(response => response.json())
                .then(myjson => {
                    data = myjson;
                    if (totalPages == -1) {
                        totalPages = myjson.page.totalPages;
                    }
                    for (events in data._embedded) {
                        console.log(data._embedded[events])
                        data._embedded[events].forEach((eventdata) => renderCard(eventdata))
                        results.insertAdjacentHTML("afterbegin", fullhtml);
                        results.scrollTo();
                        showingresultsfor.textContent = "Showing results for " + searchInput.value
                    }

                })
        })
})



function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        console.log("Couldn't get location")
    }
}

window.addEventListener("load", function () {
    getLocation()
});


function showPosition(position) {
    fetch('secret.json')
        .then(response => response.text())
        .then(data => {
            data = JSON.parse(data)
            console.log(data);
            const url = `https://app.ticketmaster.com/discovery/v2/events?apikey=${data["ticketmaster-api-key"]}&latlong=${position.coords.latitude},${position.coords.longitude}&radius=50&unit=miles&locale=*&page=${currentPage}`;
            fetch(url)
                .then(response => response.json()) // read JSON response
                .then(myjson => {
                    // code to execute once JSON response is available
                    data = myjson;
                    console.log(data._embedded)
                    if (totalPages == -1) {
                        totalPages = myjson.page.totalPages;
                    }
                    for (events in data._embedded) {
                        console.log(data._embedded[events])
                        data._embedded[events].forEach((eventdata) => renderCard(eventdata))
                        results.insertAdjacentHTML("afterbegin", fullhtml);
                        results.scrollTo()
                    }
                })
        })
        .catch(error => {
            console.log(error); // Log error if there is one
        })
}



document.querySelector("#locateme").addEventListener("click", function () {
    // getLocation()
    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    function success(pos) {
        var crd = pos.coords;
        console.log('Your current position is:');
        console.log(`Latitude : ${crd.latitude}`);
        console.log(`Longitude: ${crd.longitude}`);
        console.log(`More or less ${crd.accuracy} meters.`);

        fetch(`https://geocode.xyz/${crd.latitude},${crd.longitude}?json=1`).then((res) => res.json()).then((res) => {
            console.log(res)
            yourlocation = res.city;

            const words = yourlocation.split(" ");
            for (const i in words) {
                const word = words[i];
                words[i] = word.slice(0, 1).toUpperCase() + word.toLowerCase().slice(1, word.length);
            }
            yourlocation = words.join(" ");
            searchInput.value = yourlocation;

            // searchInput.value = yourlocation.slice(0, 1).toUpperCase() + yourlocation.toLowerCase().slice(1, yourlocation.length);
        }).catch((err) => {
            if (yourlocation != "") {
                searchInput.value = yourlocation;
            } else {
                searchInput.value = "Try again!"
            }
        });
        
    }

    function error(err) {
        getLocation();
    }

    navigator.geolocation.getCurrentPosition(success, error, options);
})

// --------SIGN UP FLOW------------------- //

signupbtn.addEventListener("click", function(){
    console.log("Signup button clicked!");
    document.querySelector("body").style.overflow = 'hidden'
    document.querySelector(".overlay").style.display = 'flex'
})

document.querySelector(".cancelModal1").addEventListener("click", function(){
    document.querySelector("body").style.overflow = 'auto'
    document.querySelector(".overlay").style.display = 'none'
})

function pushToDB({ dates, name, locale, url, distance, images, info, classifications }) {
    firebase.database().ref(`users/${googleUser.uid}/saved`).push({
        name, dates, locale, url, distance, images, info, classifications
    });
}

function signIn() {
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth()
  .signInWithPopup(provider)
  .then((result) => {
    /** @type {firebase.auth.OAuthCredential} */
    var credential = result.credential;
    var token = credential.accessToken;
    googleUser = result.user;
    
  }).catch( e => {
    console.log(e);
  });
}
