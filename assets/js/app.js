const currentWeather = document.querySelector("#current-weather");
const searchHistory = document.querySelector("#search-history");
const forecastTable = document.querySelector("#forecast-table");

const openWeatherAPIkey = "&appid=1057847a31bdd1cca5308fb38057c338";
const openWeatherOneAPIurl = "https://api.openweathermap.org/data/2.5/onecall?";
const openWeatherGeoAPIurl = "http://api.openweathermap.org/geo/1.0/direct?q=";
const geoLimit = "&limit=1";
const adjustmentsUrl = "&exclude=minutely,hourly&units=imperial";
let searchTerm = "";
let today = "";
let previousSearch = [];

//lat={lat}&lon={lon}

function getGeoData(location) {
    fetch(openWeatherGeoAPIurl + location + geoLimit + openWeatherAPIkey)
    .then(function(response) {
        if (response.ok) {
            response.json().then(function (data) {
                if (previousSearch.unshift(data[0].name) > 10) {
                    previousSearch.pop();
                }
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
            // send to localStorage
            localStorage.setItem("previousSearches", JSON.stringify(previousSearch));
            renderHistory();

            response.json().then(function (data) {
                renderCurrent(data.current.temp, data.current.wind_speed, data.current.humidity, data.current.uvi, data.current.weather[0].icon);
                renderForecast(data.daily.slice(0, 4));
            });
        } else {
            console.log("Error" + response.statusText);
        }
    })
    .catch(function (error) {
        console.log("unable to connect to openweatheronecall");
    });
};

function renderCurrent(temp, wind, humidity, uv, icon) {


}

function renderForecast(dailyArray) {

}

function renderHistory() {
    previousSearch = JSON.parse(localStorage.getItem("previousSearches"));
    console.log(previousSearch);
}


// init
function init(){
    //render historyList
    today = new Date();
    let dd = String(today.getDate()).padStart(2, "0");
    let mm = String(today.getMonth() + 1).padStart(2, "0");
    let yyyy = today.getFullYear();
    today = mm + "/" + dd + "/" + yyyy;
    previousSearch = JSON.parse(localStorage.getItem("previousSearches"));
}

document.querySelector("#search-form").addEventListener("submit", function(event){
    event.preventDefault();
    searchTerm = document.querySelector("#search-term").value;
    if (searchTerm) {
        let adjustedSearch = searchTerm.replace(" ", "+");
        getGeoData(adjustedSearch);
    } else {
        alert("You must enter a location");
    }

})

init();