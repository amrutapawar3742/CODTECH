// OpenWeather API key
const apiKey = "74c8e652c0efef1e6f61a6906b7f464b";

const weatherResult = document.getElementById("weatherResult");
const loader = document.getElementById("loader");
const dateTime = document.getElementById("dateTime");
const toggleMode = document.getElementById("toggleMode");

/* ---------------- DATE & TIME ---------------- */
function updateDateTime() {
  const now = new Date();
  dateTime.innerText = now.toLocaleString();
}
updateDateTime();
setInterval(updateDateTime, 1000);

/* ---------------- DARK MODE ---------------- */
toggleMode.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

/* ---------------- WEATHER FUNCTION ---------------- */
async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();

  if (!city) {
    alert("Please enter a city name");
    return;
  }

  weatherResult.innerHTML = "";
  loader.classList.remove("hidden");

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );

    const data = await response.json();

    // Proper error handling
    if (!response.ok) {
      weatherResult.innerHTML = `Error: ${data.message}`;
      return;
    }

    const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    weatherResult.innerHTML = `
      <h2>${data.name}, ${data.sys.country}</h2>
      <img src="${icon}" alt="Weather icon">

      <p><strong>${data.main.temp} °C</strong></p>
      <p>Feels like: ${data.main.feels_like} °C</p>
      <p>${data.weather[0].description}</p>

      <p>Humidity: ${data.main.humidity}%</p>
      <p>Wind Speed: ${data.wind.speed} m/s</p>
      <p>Min: ${data.main.temp_min} °C | Max: ${data.main.temp_max} °C</p>
    `;
  } catch (error) {
    weatherResult.innerHTML = "Network error. Please try again.";
    console.error(error);
  } finally {
    loader.classList.add("hidden");
  }
}

/* ---------------- ENTER KEY SUPPORT ---------------- */
document.getElementById("cityInput").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    getWeather();
  }
});
