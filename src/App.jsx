import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { getWeather } from "./WeatherData";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const ciudades = {
  BuenosAires: { lat: -34.6037, lon: -58.3816, nombre: "Buenos Aires" },
  Cordoba: { lat: -31.4201, lon: -64.1888, nombre: "Córdoba" },
  Rosario: { lat: -32.9468, lon: -60.6393, nombre: "Rosario" },
  Mendoza: { lat: -32.8895, lon: -68.8458, nombre: "Mendoza" },
  MarDelPlata: { lat: -37.9799, lon: -57.5898, nombre: "Mar del Plata" },
  Salta: { lat: -24.7829, lon: -65.4120, nombre: "Salta" },
  Tucuman: { lat: -26.8083, lon: -65.2176, nombre: "Tucumán" },
  Bariloche: { lat: -41.1335, lon: -71.3100, nombre: "Bariloche" },
  Ushuaia: { lat: -54.8019, lon: -68.3030, nombre: "Ushuaia" },
  Neuquen: { lat: -38.9516, lon: -68.0591, nombre: "Neuquén" },
};

const getWeatherEmoji = (code, isDay = true) => {
  const icons = {
    0: isDay ? "Sunny" : "Clear Night",
    1: isDay ? "Sunny" : "Clear Night",
    2: "Partly Cloudy",
    3: "Cloudy",
    45: "Fog",
    48: "Fog",
    51: "Light Drizzle",
    53: "Drizzle",
    55: "Heavy Drizzle",
    61: "Light Rain",
    63: "Rain",
    65: "Heavy Rain",
    71: "Light Snow",
    73: "Snow",
    75: "Heavy Snow",
    80: "Light Showers",
    81: "Showers",
    82: "Heavy Showers",
    95: "Thunderstorm",
    96: "Thunderstorm",
    99: "Thunderstorm",
  };
  return icons[code] || "Unknown";
};

function MapClickHandler({ onClick }) {
  useMapEvents({ click: (e) => onClick(e.latlng) });
  return null;
}

export default function App() {
  const [ciudadKey, setCiudadKey] = useState("BuenosAires");
  const [weather, setWeather] = useState({ current: null, hourly: [] });
  const [location, setLocation] = useState(ciudades.BuenosAires);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([-34.6037, -58.3816]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadWeather = async (lat, lon, nombre) => {
    setLoading(true);
    try {
      const data = await getWeather(lat, lon);
      setWeather(data);
      setLocation({ lat, lon, nombre });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ciudad = ciudades[ciudadKey] || location;
    setLocation(ciudad);
    setMapCenter([ciudad.lat, ciudad.lon]);
    loadWeather(ciudad.lat, ciudad.lon, ciudad.nombre);
  }, [ciudadKey]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadWeather(location.lat, location.lon, location.nombre);
    }, 300000);
    return () => clearInterval(interval);
  }, [location]);

  const handleMapClick = (latlng) => {
    const nombre = `${latlng.lat.toFixed(3)}, ${latlng.lng.toFixed(3)}`;
    setCiudadKey("");
    setMapCenter([latlng.lat, latlng.lng]);
    loadWeather(latlng.lat, latlng.lng, nombre);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(to bottom, #74d2f9, #ffffff)",
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      color: "#003087"
    }}>
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{
            fontSize: "3.8rem",
            fontWeight: "900",
            color: "#003087",
            margin: "0 0 10px 0"
          }}>
            Clima Argentina
          </h1>
          <div style={{
            fontSize: "1.6rem",
            fontWeight: "600",
            color: "#003087"
          }}>
            {currentTime.toLocaleDateString("es-AR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric"
            }).replace(/^\w/, c => c.toUpperCase())}
            <br />
            <span style={{ fontSize: "2.4rem", fontWeight: "bold" }}>
              {currentTime.toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit"
              })}
            </span>
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "25px",
          marginBottom: "35px"
        }}>
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "25px",
            boxShadow: "0 10px 30px rgba(0,100,200,0.15)",
            border: "2px solid #74d2f9"
          }}>
            <select
              value={ciudadKey}
              onChange={(e) => setCiudadKey(e.target.value)}
              style={{
                width: "100%",
                padding: "16px",
                fontSize: "1.3rem",
                borderRadius: "12px",
                border: "3px solid #74d2f9",
                background: "#f8fdff",
                color: "#003087",
                fontWeight: "600"
              }}
            >
              <option value="">Hacer clic en el mapa</option>
              {Object.entries(ciudades).map(([k, v]) => (
                <option key={k} value={k}>{v.nombre}</option>
              ))}
            </select>
          </div>

          <div style={{
            height: "420px",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 15px 40px rgba(0,100,200,0.25)",
            border: "3px solid #74d2f9"
          }}>
            <MapContainer center={mapCenter} zoom={5.5} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapClickHandler onClick={handleMapClick} />
              <Marker position={[location.lat, location.lon]}>
                <Popup><strong>{location.nombre}</strong></Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>

        {weather.current && !loading && (
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "40px",
            marginBottom: "40px",
            boxShadow: "0 20px 50px rgba(0,100,200,0.2)",
            border: "4px solid #74d2f9",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "7rem", marginBottom: "10px" }}>
              {getWeatherEmoji(weather.current.weather_code, weather.current.is_day)}
            </div>
            <div style={{ fontSize: "6rem", fontWeight: "900", color: "#003087" }}>
              {weather.current.temperature_2m}°
            </div>
            <div style={{ fontSize: "2rem", color: "#0055aa", margin: "15px 0" }}>
              Sensación térmica {weather.current.apparent_temperature}°
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "20px",
              marginTop: "30px",
              fontSize: "1.4rem"
            }}>
              <div><strong>Humedad</strong><br />{weather.current.relative_humidity_2m}%</div>
              <div><strong>Viento</strong><br />{weather.current.wind_speed_10m} km/h</div>
              <div><strong>Lluvia</strong><br />{weather.current.precipitation} mm/h</div>
              <div><strong>Estado</strong><br />{getWeatherEmoji(weather.current.weather_code, weather.current.is_day)}</div>
            </div>
          </div>
        )}

        {weather.hourly.length > 0 && (
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "30px",
            boxShadow: "0 20px 50px rgba(0,100,200,0.2)",
            border: "4px solid #74d2f9"
          }}>
            <h2 style={{
              textAlign: "center",
              color: "#003087",
              fontSize: "2.4rem",
              fontWeight: "bold",
              marginBottom: "25px"
            }}>
              Próximas 48 horas
            </h2>

            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%",
                minWidth: "900px",
                borderCollapse: "collapse",
                fontSize: "1.15rem"
              }}>
                <thead>
                  <tr style={{
                    background: "linear-gradient(90deg, #74d2f9, #0055aa)",
                    color: "white"
                  }}>
                    <th style={{ padding: "16px" }}>Hora</th>
                    <th>Clima</th>
                    <th>Temp</th>
                    <th>Sensación</th>
                    <th>Lluvia</th>
                    <th>Prob.</th>
                  </tr>
                </thead>
                <tbody>
                  {weather.hourly.slice(0, 48).map((h, i) => {
                    const hour = new Date(h.time).getHours();
                    const isDay = hour >= 6 && hour < 20;
                    return (
                      <tr key={i} style={{
                        background: i % 2 === 0 ? "#f5fbff" : "white"
                      }}>
                        <td style={{ textAlign: "center", padding: "16px", fontWeight: "600", color: "#003087" }}>
                          {new Date(h.time).toLocaleTimeString("es-AR", {
                            hour: "numeric",
                            minute: "2-digit",
                            timeZone: "America/Argentina/Buenos_Aires"
                          })}
                        </td>
                        <td style={{ textAlign: "center", fontSize: "2.2rem" }}>
                          {getWeatherEmoji(h.weather_code, isDay)}
                        </td>
                        <td style={{ textAlign: "center", fontWeight: "bold", color: "#003087" }}>
                          {h.temperature_2m}°
                        </td>
                        <td style={{ textAlign: "center", color: "#0055aa" }}>
                          {h.apparent_temperature}°
                        </td>
                        <td style={{ textAlign: "center", fontWeight: "bold", color: h.precipitation > 0 ? "#d32f2f" : "#003087" }}>
                          {h.precipitation} mm
                        </td>
                        <td style={{ textAlign: "center", color: h.precipitation_probability > 50 ? "#ff6d00" : "#003087" }}>
                          {h.precipitation_probability}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}