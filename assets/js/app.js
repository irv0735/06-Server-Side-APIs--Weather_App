const currentWeather = document.querySelector("#current-weather");
const searchHistory = document.querySelector("#search-history");
const forecastTable = document.querySelector("#forecast-table");

const openWeatherAPIkey = "&appid=1057847a31bdd1cca5308fb38057c338";
const openWeatherOneAPIurl = "https://api.openweathermap.org/data/2.5/onecall?";
const openWeatherGeoAPIurl = "https://api.openweathermap.org/geo/1.0/direct?q=";
const geoLimit = "&limit=1";
const adjustmentsUrl = "&exclude=minutely,hourly&units=imperial";
let dailyArray = [];
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
            });
            
        } else {
            console.log("Error" + response.statusText);
        }
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
                renderCurrent(data.current.temp, data.current.wind_speed, data.current.humidity, data.current.uvi, data.current.weather[0].icon);
                renderForecast(data.daily.slice(0, 5));
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
 * @param {number} temp 
 * @param {number} wind 
 * @param {number} humidity 
 * @param {number} uv 
 * @param {string} icon 
 */
function renderCurrent(temp, wind, humidity, uv, icon) {
    currentWeather.innerHTML = "";
    let newH2 = document.createElement("h2");
    newH2.innerHTML = previousSearch[0] + " (" + dailyArray[0] + ") ";
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
 */
function renderForecast(forecastArray) {
    forecastTable.innerHTML = "";
    for (i=0; i<forecastArray.length; i++) {
        let newDailyTd = document.createElement("td");
        let newh3 = document.createElement("h3");
        newh3.innerHTML = dailyArray[i+1];
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
 * gets the current day and next 5 days and stores them in an array
 * @author Nate Irvin <nathan.a.irvin@gmail.com>
 */
function getDays(){
    let today = new Date();
    for (i=0; i<6; i++) {
        let newDate = new Date(Number(today));
        newDate.setDate(today.getDate() + i);
        let dd = String(newDate.getDate()).padStart(2, "0");
        let mm = String(newDate.getMonth()+ 1).padStart(2, "0");
        let yyyy = newDate.getFullYear();
        dailyArray[i] = mm + "/" + dd + "/" + yyyy;
    }
}


function init(){
    getDays();
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