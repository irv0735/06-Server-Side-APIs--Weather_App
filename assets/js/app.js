const currentWeather = document.querySelector("#current-weather");
const searchHistory = document.querySelector("#search-history");
const forecastTable = document.querySelector("#forecast-table");

const openWeatherAPIkey = "&appid=1057847a31bdd1cca5308fb38057c338";
const openWeatherOneAPIurl = "https://api.openweathermap.org/data/2.5/onecall?";
const openWeatherGeoAPIurl = "https://api.openweathermap.org/geo/1.0/direct?q=";
const geoLimit = "&limit=1";
const adjustmentsUrl = "&exclude=minutely,hourly&units=imperial";
let previousSearch = [];

/**
 * Takes the adjusted search term (spaces replaced with +) as an input and fetches the API response to get the lat/lon for
 * the location. Then calls a new function, passing the received lat/lon.
 * @author Nate Irvin <nathan.a.irvin@gmail.com>
 * @param {string} location 
 */
function getGeoData(location) {
    fetch(openWeatherGeoAPIurl + location + geoLimit + openWeatherAPIkey)
    .then(function(response) {
        if (response.ok) {
            response.json().then(function (data) {
                let checkExist = false;
                if (data[0]) {
                    previousSearch.forEach(element => {
                        if (data[0].name == element) {
                            checkExist = true;
                            previousSearch.unshift(previousSearch.splice(previousSearch.indexOf(element), 1))
                            getWeatherData(data[0].lat, data[0].lon);
                            return;
                        }
                    });
                    if (!checkExist) {
                        if (previousSearch.unshift(data[0].name) > 10) {
                            previousSearch.pop();
                        }
                        getWeatherData(data[0].lat, data[0].lon);
                        return;
                    } 
                } else {
                    alert("Please enter a valid location.")
                    return;
                }
            });
        } else {
            alert("Please enter a valid location.");
            console.log("Error " + response.statusText);
        }
        return;
    })
    .catch(function (error) {
        console.log("unable to connect to openweathergeo");
    });
};

/**
 * function takes the lat/lon and calls weather api to fetch data. It then calls additional functions, passing the data received
 * @author Nate Irvin <nathan.a.irvin@gmail.com>
 * @param {number} lat 
 * @param {number} lon 
 */
function getWeatherData(lat, lon) {
    fetch(openWeatherOneAPIurl + "lat=" + lat + "&lon=" + lon + adjustmentsUrl + openWeatherAPIkey)
    .then(function(response) {
        if (response.ok) {
            response.json().then(function (data) {
                renderCurrent(data.current.dt, data.timezone_offset, data.current.temp, data.current.wind_speed, data.current.humidity, data.current.uvi, data.current.weather[0].icon);
                renderForecast(data.daily.slice(1, 6), data.timezone_offset);
            });
            localStorage.setItem("previousSearches", JSON.stringify(previousSearch));
            renderHistory();
        } else {
            console.log("Error" + response.statusText);
        }
    })
    .catch(function (error) {
        console.log("unable to connect to openweatheronecall");
    });
};

/**
 * Renders the weather information received on the page in the current weather section
 * @author Nate Irvin <nathan.a.irvin@gmail.com>
 * @param {number} date
 * @param {number} offset
 * @param {number} temp 
 * @param {number} wind 
 * @param {number} humidity 
 * @param {number} uv 
 * @param {string} icon 
 */
function renderCurrent(date, offset, temp, wind, humidity, uv, icon) {
    currentWeather.innerHTML = "";
    let newH2 = document.createElement("h2");
    let currentDate = getDate(date, offset);
    newH2.innerHTML = previousSearch[0] + " (" + currentDate + ") ";
    let newIcon = document.createElement("img");
    newIcon.setAttribute("src", "http://openweathermap.org/img/wn/" + icon + ".png");
    newH2.appendChild(newIcon);
    currentWeather.appendChild(newH2);

    let newPtemp = document.createElement("p");
    newPtemp.innerHTML = "Temp: " + temp + " \u00B0F";
    currentWeather.appendChild(newPtemp);

    let newPwind = document.createElement("p");
    newPwind.innerHTML = "Wind: " + wind + " MPH";
    currentWeather.appendChild(newPwind);

    let newPhumidity = document.createElement("p");
    newPhumidity.innerHTML = "Humidity: " + humidity + " %";
    currentWeather.appendChild(newPhumidity);

    let newPuv = document.createElement("p");
    let newSpanUv = document.createElement("span");
    newSpanUv.innerHTML = uv;
    if (uv <=2) {
        newSpanUv.setAttribute("style", "background-color: green; color: white;")
    } else if (uv <=5) {
        newSpanUv.setAttribute("style", "background-color: yellow;")
    } else {
        newSpanUv.setAttribute("style", "background-color: red; color: white;");
    }
    newPuv.innerHTML = "UV Index: "
    newPuv.appendChild(newSpanUv);
    currentWeather.appendChild(newPuv);
}

/**
 * Renders the forecast on the page in the forecast section
 * @author Nate Irvin <nathan.a.irvin@gmail.com>
 * @param {array} forecastArray
 * @param {number} offset the UTC offset 
 */
function renderForecast(forecastArray, offset) {
    forecastTable.innerHTML = "";
    for (i=0; i<forecastArray.length; i++) {
        let newDailyTd = document.createElement("td");
        let newh3 = document.createElement("h3");
        let nextDate = getDate(forecastArray[i].dt, offset)
        newh3.innerHTML = nextDate;
        newDailyTd.appendChild(newh3);

        let forecastIcon = document.createElement("img");
        forecastIcon.setAttribute("src", "http://openweathermap.org/img/wn/" + forecastArray[i].weather[0].icon + ".png")
        newDailyTd.appendChild(forecastIcon);

        let forecastTemp = document.createElement("p");
        forecastTemp.innerHTML = "Temp: " + forecastArray[i].temp.day + " \u00B0F";
        newDailyTd.appendChild(forecastTemp);

        let forecastWind = document.createElement("p");
        forecastWind.innerHTML = "Wind: " + forecastArray[i].wind_speed + " MPH";
        newDailyTd.appendChild(forecastWind);

        let forecatHumidity = document.createElement("p");
        forecatHumidity.innerHTML = "Humidity: " + forecastArray[i].humidity + " %";
        newDailyTd.appendChild(forecatHumidity);

        forecastTable.appendChild(newDailyTd);
    }
}

/**
 * renders the search history on the page (pulled from local storage)
 * @author Nate Irvin <nathan.a.irvin@gmail.com>
 */
function renderHistory() {
    searchHistory.innerHTML = "";
    previousSearch = JSON.parse(localStorage.getItem("previousSearches"));
    if (previousSearch == null) {
        previousSearch = [];
    }
    previousSearch.forEach(element => {
        let newLi = document.createElement("li");
        let newBtn = document.createElement("button");
        newBtn.setAttribute("class", "previous-button");
        newBtn.innerText = element;
        searchHistory.appendChild(newLi);
        newLi.appendChild(newBtn);
    });
    let formerSearches = document.querySelectorAll(".previous-button");
    formerSearches.forEach(element => {
        element.addEventListener("click", function(event){
            let adjustedSearch = element.innerText.replace(" ", "+");
            getGeoData(adjustedSearch);
        });
    });
}

/**
 * Converts a unix timestamp to date string
 * @author Nate Irvin <nathan.a.irvin@gmail.com>
 * @param {number} timestamp UNIX Timestamp
 * @param {Number} timeOffset The number of seconds offset from UTC
 */
function getDate(timestamp, timeOffset){
    console.log(timeOffset);
    const zoneCorrected = timestamp + timeOffset
    const milliseconds = zoneCorrected*1000;
    const dateObject = new Date(milliseconds);
    console.log(dateObject.toLocaleString("en-US", {hour: "numeric"}));
    const displayableDateFormat = dateObject.toLocaleString("en-US", {month: "numeric"}) +
         "/" + dateObject.toLocaleString("en-US", {day: "numeric"}) + 
         "/" + dateObject.toLocaleString("en-US", {year: "numeric"});
    return displayableDateFormat;
}


function init(){
    renderHistory();
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