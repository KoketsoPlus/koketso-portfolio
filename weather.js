let cityInput = document.getElementById('city_input'),
  searchBtn = document.getElementById('searchBtn'),
  locationBtn = document.getElementById('locationBtn'),
  apiKey = 'cd2b167e0493f182c1803321a2cbf6ea',
  currentWeatherCard = document.querySelector('.weather-left.card'),
  fiveDaysForecastCard = document.querySelector('.day-forecast');

const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getWeatherDetails(name, lat, lon, country) {
  const WEATHER_API = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  const FORECAST_API = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  fetch(WEATHER_API)
    .then(res => res.json())
    .then(data => {
      let date = new Date();
      currentWeatherCard.innerHTML = `
        <div class="details">
          <p>Now</p>
          <h2>${(data.main.temp - 273.15).toFixed(1)}°C</h2>
          <p>${data.weather[0].description}</p>
        </div>
        <div class="weather-icon">
          <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="">
        </div>
        <hr>
        <div class="card-footer">
          <p>${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}</p>
          <p>${name}, ${country}</p>
        </div>`;
    }).catch(() => alert('Failed to fetch current weather'));

  fetch(FORECAST_API)
    .then(res => res.json())
    .then(data => {
      let uniqueDays = [];
      let dailyForecast = data.list.filter(item => {
        let day = new Date(item.dt_txt).getDate();
        if (!uniqueDays.includes(day)) {
          uniqueDays.push(day);
          return true;
        }
        return false;
      });

      fiveDaysForecastCard.innerHTML = '';
      dailyForecast.slice(1, 6).forEach(item => {
        let date = new Date(item.dt_txt);
        fiveDaysForecastCard.innerHTML += `
          <div class="forecast-item">
            <div class="icon-wrapper">
              <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="">
              <span>${(item.main.temp - 273.15).toFixed(1)}°C</span>
            </div>
            <p>${days[date.getDay()]}</p>
            <p>${date.getDate()} ${months[date.getMonth()]}</p>
          </div>`;
      });
    }).catch(() => alert('Failed to fetch forecast'));
}

function getCityCoordinates() {
  let cityName = cityInput.value.trim();
  cityInput.value = '';
  if (!cityName) return;

  let GEO_API = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;
  fetch(GEO_API)
    .then(res => res.json())
    .then(data => {
      if (!data.length) throw new Error();
      let { name, lat, lon, country } = data[0];
      getWeatherDetails(name, lat, lon, country);
    })
    .catch(() => alert('City not found'));
}

function getWeatherFromLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      const REVERSE_GEO = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;
      fetch(REVERSE_GEO)
        .then(res => res.json())
        .then(data => {
          const { name, country } = data[0];
          getWeatherDetails(name, latitude, longitude, country);
        })
        .catch(() => alert('Failed to reverse geocode location'));
    }, () => {
      alert('Location access denied');
    });
  } else {
    alert('Geolocation not supported');
  }
}

searchBtn.addEventListener('click', getCityCoordinates);
locationBtn.addEventListener('click', getWeatherFromLocation);
window.addEventListener('load', getWeatherFromLocation);
