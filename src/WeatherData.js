const num = (v, fallback = 0) =>
  typeof v === "number" && !isNaN(v) ? v : fallback;

const round1 = (v) => Math.round(num(v) * 10) / 10;

const formatART = (isoString) => {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return {
      full: "—",
      timeOnly: "—",
      time24: "—",
    };
  }

  return {
    full: date.toLocaleString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }),
    timeOnly: date.toLocaleTimeString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
    time24: date.toLocaleTimeString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  };
};

const esDia = (hour) => hour >= 6 && hour < 20;


export async function getWeather(lat, lon) {
  if (!lat || !lon) {
    throw new Error("Latitud o longitud inválidas.");
  }

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,is_day` +
    `&hourly=temperature_2m,apparent_temperature,precipitation,precipitation_probability,weather_code` +
    `&timezone=auto&forecast_days=3`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`);
    }

    const data = await response.json();

    const currentTime = formatART(data?.current?.time);

    const current = {
      temperature_2m: round1(data?.current?.temperature_2m),
      apparent_temperature: round1(data?.current?.apparent_temperature),
      relative_humidity_2m: num(data?.current?.relative_humidity_2m),
      precipitation: num(data?.current?.precipitation),
      weather_code: num(data?.current?.weather_code),
      wind_speed_10m: Math.round(num(data?.current?.wind_speed_10m)),
      wind_direction_10m: num(data?.current?.wind_direction_10m),
      is_day: data?.current?.is_day === 1,

      horaCorta: currentTime.timeOnly,
      hora24: currentTime.time24,
    };

    const hourly = (data?.hourly?.time || []).map((time, i) => {
      const f = formatART(time);
      const hour = new Date(time).getHours();

      return {
        time,
        hora: f.timeOnly,
        hora24: f.time24,

        temperature_2m: round1(data.hourly.temperature_2m?.[i]),
        apparent_temperature: round1(data.hourly.apparent_temperature?.[i]),
        precipitation: num(data.hourly.precipitation?.[i]),
        precipitation_probability: num(data.hourly.precipitation_probability?.[i]),
        weather_code: num(data.hourly.weather_code?.[i]),

        is_day: esDia(hour),
      };
    });

    return { current, hourly };

  } catch (error) {
    console.error("Error al obtener el clima:", error);
    throw new Error("No se pudo cargar el clima. Verificá la conexión o intentá más tarde.");
  }
}
