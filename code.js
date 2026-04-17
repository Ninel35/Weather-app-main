const form = document.querySelector(".search-form");

async function getCoordinates(city) {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${city}`,
  );

  const data = await response.json();
  console.log(data);
  return data.results[0];
}

form.addEventListener("submit", handlerQuery);

async function handlerQuery(evt) {
  evt.preventDefault();

  const weatherElem = document.querySelector(".weather-info");
  const input = document.querySelector(".search-input");

  try {
    const city = input.value;

    const location = await getCoordinates(city);

    const lat = location.latitude;
    const lon = location.longitude;
    const cityName = location.name;
    const country = location.country;

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode&hourly=temperature_2m,weather_code,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation&daily=weathercode,temperature_2m_max,temperature_2m_min`,
    );

    const data = await response.json();
    console.log(data);
    weatherElem.innerHTML = weatherMarkup(data, cityName, country);
  } catch (error) {
    console.error("Error", error);
  }
}

function getWeatherIcon(code) {
  console.log(code);
  if (code === 0) return "./assets/images/icon-sunny.webp";

  if (code >= 1 && code <= 3) return "./assets/images/icon-partly-cloudy.webp";

  if (code >= 4 && code <= 48) return "./assets/images/icon-fog.webp";

  if (code === 56 || code === 57) return "./assets/images/icon-drizzle.webp";

  if (code >= 61 && code <= 65) return "./assets/images/icon-rain.webp";

  if (code >= 71 && code <= 75) return "./assets/images/icon-snow.webp";

  if (code >= 95 && code <= 99) return "./assets/images/.webp";

  return "./assets/images/icon-partly-cloudy.webp";
}

function dailyMarkup(data) {
  return data.daily.time
    .map((dateStr, idx) => {
      const dateWeek = new Date(dateStr);

      const dayWeek = dateWeek.toLocaleDateString("en-US", {
        weekday: "short",
      });

      const max = Math.round(data.daily.temperature_2m_max[idx]);
      const min = Math.round(data.daily.temperature_2m_min[idx]);
      const code = data.daily.weathercode[idx];

      const icon = getWeatherIcon(code);

      return `
      <li class="daily-days">
        <p class="text-daily">${dayWeek}</p>
        <img class="picture-daily" src="${icon}" width="40" height="40"/>
        <span class="text-daily">${max}°</span>
        <span class="text-daily">${min}°</span>
      </li>
    `;
    })
    .join("");
}

function weatherMarkup(data, city, country) {
  const temp = Math.round(data.hourly.temperature_2m[0]);
  const code = data.hourly.weather_code[0];

  const iconPath = getWeatherIcon(code);

  const date = new Date(Date.parse(data.current.time));
  console.log(date);

  const weakDay = date.getDay();

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const month = date.getMonth();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const dateNum = date.getDate();
  const currentyear = date.getFullYear();

  const feels = data.hourly.apparent_temperature[0];
  const humidity = data.hourly.relative_humidity_2m[0];
  const wind = data.hourly.wind_speed_10m[0];
  const rain = data.hourly.precipitation[0];

  return `
 
        <div class="weather-card">
          <div class="weather-left">
            <h1 class="city">${city}, ${country}</h1>
            <p class="date">${dayNames[weakDay]}, ${monthNames[month]} ${dateNum}, ${currentyear}</p>
          </div>
          <div class="weather-right">
            <img class="icon" src="${iconPath}" alt="weather icon"  width="70px"
                    height="70px"/>
            <span class="temp">${temp}°</span>
          </div>
        </div>

      <div class="stat-card">

      <div class="stat">
        <p>Feels like</p>
        <h3>${feels}°</h3>
      </div>

      <div class="stat">
        <p>Humidity</p>
        <h3>${humidity}%</h3>
      </div>

      <div class="stat">
        <p>Wind</p>
        <h3>${wind} km/h</h3>
      </div>

      <div class="stat">
        <p>Precipitation</p>
        <h3>${rain} mm</h3>
      </div>
   
     </div>

 <div class = "daily">
     <h3>Daily forecast</h3>
        <ul class="daily-card">
         ${dailyMarkup(data)}
        </ul>
        </div>
  `;
}
