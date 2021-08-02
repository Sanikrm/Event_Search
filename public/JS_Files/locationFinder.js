var currentPage = 0;
var totalPages = -1;

var x = document.getElementById("demo");
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
    fetch('secret.json')
    .then(response => response.text())
    .then(data => {
        data = JSON.parse(data)
  	    // Do something with your data
        console.log(data);
        const url = `https://app.ticketmaster.com/discovery/v2/events?
                    apikey=${data["ticketmaster-api-key"]}
                    &latlong=${position.coords.latitude},${position.coords.longitude}
                    &radius=50
                    &unit=miles
                    &locale=*
                    &page=${currentPage}`;
        fetch(url)
            .then(response => response.json()) // read JSON response
            .then(myjson => {
            // code to execute once JSON response is available
            console.log(myjson);
            
            if (totalPages == -1) {
                totalPages = myjson.page.totalPages;
            }

            })
    })
    .catch(error => {
      console.log(error); // Log error if there is one
    })
}

function moveForward() {
    if (currentPage < totalPages - 1) {
        currentPage++;
    }
}

function moveBackward() {
    if (currentPage > 0) {
        currentPage--;
    }
}