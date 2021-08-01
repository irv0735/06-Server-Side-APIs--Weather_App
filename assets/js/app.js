const openWeatherAPIkey = "&appid=1057847a31bdd1cca5308fb38057c338";
const openWeatherOneAPIurl = "https://api.openweathermap.org/data/2.5/onecall?";
const openWeatherGeoAPIurl = "http://api.openweathermap.org/geo/1.0/direct?q=";
const geoLimit = "&limit=1";
const adjustmentsUrl = "&exclude=minutely,hourly&units=imperial";
let previousSearch = [];

//lat={lat}&lon={lon}

function getGeoData(location) {
    fetch(openWeatherGeoAPIurl + location + geoLimit + openWeatherAPIkey)
    .then(function(response) {
        if (response.ok) {
            response.json().then(function (data) {
                previousSearch.push(data[0].name);
                console.log(data[0].lat, data[0].lon);
                getWeatherData(data[0].lat, data[0].lon);
            });
        } else {
            console.log("Error" + response.statusText);
        }
    })
    .catch(function (error) {
        console.log("unable to connect to openweathergeo");
    });
};

function getWeatherData(lat, lon) {
    fetch(openWeatherOneAPIurl + "lat=" + lat + "&lon=" + lon + adjustmentsUrl + openWeatherAPIkey)
    .then(function(response) {
        if (response.ok) {
            response.json().then(function (data) {
                console.log(data);
            });
        } else {
            console.log("Error" + response.statusText);
        }
    })
    .catch(function (error) {
        console.log("unable to connect to openweatheronecall");
    });
};










// if valid response received from AP
    // previousSearch.push(searchTerm);
    // send to localStorage
    // reder history list



// render historyList function 
// pull from local storage

// init
    //render historyList

document.querySelector("#search-form").addEventListener("submit", function(event){
    event.preventDefault();
    let searchTerm = document.querySelector("#search-term").value;
    if (searchTerm) {
        let adjustedSearch = searchTerm.replace(" ", "+");
        getGeoData(adjustedSearch);
    } else {
        alert("You must enter a location");
    }

})