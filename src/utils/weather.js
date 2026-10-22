export const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=43.238&longitude=76.945&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=Asia%2FAlmaty";

export function describeWeather(code) {
  if (code === 0) return { label: "Ясно", icon: "sun" };
  if (code === 1 || code === 2)
    return { label: "Переменная облачность", icon: "cloud" };
  if (code === 3) return { label: "Облачно", icon: "cloud" };
  if (code === 45 || code === 48) return { label: "Туман", icon: "cloud" };
  if ([51, 53, 55, 56, 57].includes(code))
    return { label: "Морось", icon: "rain" };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return { label: "Дождь", icon: "rain" };
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return { label: "Снег", icon: "cloud" };
  if ([95, 96, 99].includes(code)) return { label: "Гроза", icon: "rain" };
  return { label: "Текущая погода", icon: "cloud" };
}

export function isValidWeather(data) {
  const current = data?.current;
  return (
    Boolean(current) &&
    [
      "temperature_2m",
      "apparent_temperature",
      "weather_code",
      "wind_speed_10m",
    ].every((key) => Number.isFinite(current[key]))
  );
}
