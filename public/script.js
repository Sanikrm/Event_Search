var currentPage = 0;
var totalPages = -1;
let data = '';
let yourlocation = "";

let googleUser;
let signedIn = false;

const searchInput = document.querySelector("#search");
const searchButton = document.querySelector('.magnifyingglass--btn');
const results = document.querySelector(".results");
const showingresultsfor = document.querySelector(".showingresutlsfor");
const signupbtn = document.querySelector(".signup--btn")
const signupButton = document.querySelector(".signup--btn");

let fullhtml = '';


function viewMore(dates, name, locale, url, distance, images, info, classifications, eventlocation) {
    console.log(url)
    document.querySelector("body").style.overflow = 'hidden'
    document.querySelector(".overlay2").style.display = 'flex'
    console.log(dates, name, locale, url, distance, images, info, classifications);
    document.querySelector('.viewmore--modal').innerHTML = `
      <div class="viewmore--img_hero">
          <img src="${images[3].url}" class="viewmore--img">
          <div class="viewmote--hero_right">
              <h3 class="viewmodal--name">${name}</h3>
              <h5 class="viewmodal--extra">${dates.start.localDate} | ${classifications[0].segment.name}</h5>
              <h4 class="viewmodal--info">${info === undefined ? "There is no info on this event. If you want to read more about the event, click the I'm interested button below :D" : info.slice(0, 150) + '...'}</h4>
              <button class="viewmodal--moreinfo"><a href="${url}" target="_blank" style="color: white; text-decoration: none">More info</a></button>
          </div>
        </div>
        <div class="locationsection">
        
        <div>
        <h2 class="locationsectionh2">Location</h2>
        <h3 class="locationtext">Check on google maps <a target="_blank" href="https://www.google.com/maps/@${eventlocation.latitude},${eventlocation.longitude},15z">here</a></h3>
        </div>
                 <div id="mapid"></div>

      </div>
     `

    var mymap = L.map('mapid').setView([eventlocation.latitude, eventlocation.longitude], 8);
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1
    }).addTo(mymap);

    L.marker([eventlocation.latitude, eventlocation.longitude]).addTo(mymap)
        .bindPopup("<b>Event here!</b><br />").openPopup();

        document.querySelector(".overlay2").addEventListener("click", function(e){
            if(e.target.className === "overlay2"){
                document.querySelector("body").style.overflow = 'auto'
    document.querySelector(".overlay2").style.display = 'none'
            }
        })
}

function renderCard({ dates, name, locale, url, distance, images, info, classifications, _embedded }) {
    let html = `
          <div class="hero--event_2">
                <img src="${images[2].url}" class="hero--img">
                <h3 class="hero--eventname">${name.length > 14 ? name.slice(0, 20) + '...' : name}</h3>
                <h4 class="hero--eventdesc1">${dates.start.localDate} | ${classifications[0].segment.name} </h4>
                <h4 class="hero--eventdesc2">${info === undefined ? "There is no info on this event. If you want to read more about the event, click the I'm interested button below :D" : info}</h4>
                <button class="learnmore" onclick='viewMore(${JSON.stringify(dates)},${JSON.stringify(name)}, ${JSON.stringify(locale)}, ${JSON.stringify(url)}, ${JSON.stringify(distance)}, ${JSON.stringify(images)}, ${JSON.stringify(info)}, ${JSON.stringify(classifications)}, ${JSON.stringify(_embedded.venues[0].location)})'>Learn More</button>
               <img src='images/icons8-heart-96.png' class="bookmark" onclick="pushToDB(${name}, ${dates}, ${locale}, ${url}, ${distance}, ${images}, ${info}, ${classifications})">
 
            </div>
  `
    fullhtml += html;
}

function searchEvent() {
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
                        data._embedded[events].forEach((eventdata) => renderCard(eventdata));
                        results.insertAdjacentHTML("afterbegin", fullhtml);
                        showingresultsfor.textContent = "Showing results for " + searchInput.value
                    }
                    results.scrollTo();

                })
        })
}

searchButton.addEventListener("click", searchEvent)

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
            const url = `https://app.ticketmaster.com/discovery/v2/events?apikey=${data["ticketmaster-api-key"]}&latlong=${position.coords.latitude},${position.coords.longitude}&radius=50&unit=miles&locale=*&page=${currentPage}`;
            fetch(url)
                .then(response => response.json()) // read JSON response
                .then(myjson => {
                    // code to execute once JSON response is available
                    data = myjson;
                    if (totalPages == -1) {
                        totalPages = myjson.page.totalPages;
                    }
                    for (events in data._embedded) {
                        data._embedded[events].forEach((eventdata) => renderCard(eventdata))
                        results.insertAdjacentHTML("afterbegin", fullhtml);
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
            if (res.success !== false) {
                yourlocation = res.city;
                const words = yourlocation.split(" ");
                for (const i in words) {
                    const word = words[i];
                    words[i] = word.slice(0, 1).toUpperCase() + word.toLowerCase().slice(1, word.length);
                }
                yourlocation = words.join(" ");
            }

            console.log(yourlocation)
            searchInput.value = yourlocation;

            // searchInput.value = yourlocation.slice(0, 1).toUpperCase() + yourlocation.toLowerCase().slice(1, yourlocation.length);
        }).catch((err) => {
            searchInput.value = yourlocation;
        });

    }

    function error(err) {
        getLocation();
    }

    navigator.geolocation.getCurrentPosition(success, error, options);
})

function initAuthProcess() {
    if (signedIn) {
        signOut();
    } else {
        openAuthModal();
    }
}

signupbtn.addEventListener("click", function () {
    document.querySelector("body").style.overflow = 'hidden'
    document.querySelector(".overlay").style.display = 'flex'
})

document.querySelector(".cancelModal1").addEventListener("click", function () {
    document.querySelector("body").style.overflow = 'auto'
    document.querySelector(".overlay").style.display = 'none'
})

function initEmailAuth() {
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    emailSignUp(email, password);
}


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
            googleUser = result.user;
            closeAuthModal();
            signupButton.innerText = "Log Out!";
            signedIn = true;
        }).catch(e => {
            console.log(e);
        });
}


function emailSignIn(email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            googleUser = userCredential.user;
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(error)
        });
}

function emailSignUp(email, password) {
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            googleUser = userCredential.user;
            console.log("Logged in!")
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            alert(errorMessage)
        });
}

function signOut() {
    console.log("Signed out!")
    firebase.auth().signOut().then(() => {
        signedIn = false;
        signupButton.innerText = "Sign In!";
    }).catch((error) => {
        // An error happened.

    });
}

function openAuthModal() {
    document.querySelector("body").style.overflow = 'hidden'
    document.querySelector(".overlay").style.display = 'flex'
}

function closeAuthModal() {
    document.querySelector("body").style.overflow = 'auto'
    document.querySelector(".overlay").style.display = 'none'
}

function searchSuggestion(city) {
    yourlocation = city;
    console.log(yourlocation)
    searchEvent()
}


