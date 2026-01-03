import React, { useState, useEffect } from 'react';
import { Search, MapPin, Wind, Droplets, Thermometer, Cloud, Sun, CloudRain, Snowflake, Navigation } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;


function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);

  const getTheme = () => {
    if (!weather) return "from-slate-900 via-slate-950 to-black";
    const main = weather.weather[0].main.toLowerCase();
    if (main.includes('clear')) return "from-blue-400 via-blue-600 to-blue-800";
    if (main.includes('cloud')) return "from-gray-700 via-slate-800 to-slate-900";
    if (main.includes('rain')) return "from-indigo-800 via-purple-900 to-slate-950";
    return "from-slate-900 via-slate-950 to-black";
  };

  const fetchData = async (searchCity) => {
    setLoading(true);
    try {

      const currentRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&units=metric&appid=${API_KEY}`);
      setWeather(currentRes.data);


      const forecastRes = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${searchCity}&units=metric&appid=${API_KEY}`);

      const dailyData = forecastRes.data.list.filter(reading => reading.dt_txt.includes("12:00:00"));
      setForecast(dailyData);
    } catch (err) {
      alert("City nahi mili!");
    } finally {
      setLoading(false);
    }
  };


  const getMyLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;

      axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`)
        .then(res => fetchData(res.data.name));
    });
  };

  const getWeatherIcon = (desc, size = 80) => {
    const d = desc.toLowerCase();
    if (d.includes('rain')) return <CloudRain size={size} className="text-blue-300" />;
    if (d.includes('clear')) return <Sun size={size} className="text-yellow-300" />;
    if (d.includes('snow')) return <Snowflake size={size} className="text-white" />;
    return <Cloud size={size} className="text-gray-300" />;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getTheme()} transition-all duration-1000 flex items-center justify-center p-4 text-white font-sans`}>
      <div className="w-full max-w-4xl">
        

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 group">
            <input 
              type="text"
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl py-4 px-6 pl-14 text-lg focus:outline-none focus:ring-2 focus:ring-white/50 transition-all shadow-xl"
              placeholder="Search City..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchData(city)}
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50" size={24} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => fetchData(city)} className="bg-white text-blue-900 px-8 py-4 rounded-2xl font-bold hover:bg-opacity-90 transition-all shadow-lg uppercase tracking-wider text-sm">
              {loading ? '...' : 'Check'}
            </button>
            <button onClick={getMyLocation} className="bg-blue-500/30 backdrop-blur-md p-4 rounded-2xl hover:bg-blue-500/50 transition-all border border-white/10 shadow-lg">
              <Navigation size={24} />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {weather && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-3 gap-6">
              

              <div className="md:col-span-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-5xl font-black flex items-center gap-3 mb-2 tracking-tighter">
                        <MapPin className="text-blue-400" size={40} /> {weather.name}
                      </h2>
                      <p className="text-white/70 text-lg font-medium">{new Date().toDateString()}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-8xl font-black">{Math.round(weather.main.temp)}°</div>
                      <p className="text-xl font-bold uppercase tracking-widest text-blue-300">{weather.weather[0].description}</p>
                    </div>
                  </div>

                  <div className="mt-12 grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
                    <div className="text-center">
                      <Droplets className="mx-auto mb-2 text-blue-300" />
                      <p className="text-[10px] uppercase font-bold text-white/50">Humidity</p>
                      <p className="text-xl font-bold">{weather.main.humidity}%</p>
                    </div>
                    <div className="text-center">
                      <Wind className="mx-auto mb-2 text-emerald-400" />
                      <p className="text-[10px] uppercase font-bold text-white/50">Wind Speed</p>
                      <p className="text-xl font-bold">{weather.wind.speed} m/s</p>
                    </div>
                    <div className="text-center">
                      <Thermometer className="mx-auto mb-2 text-orange-400" />
                      <p className="text-[10px] uppercase font-bold text-white/50">Feels Like</p>
                      <p className="text-xl font-bold">{Math.round(weather.main.feels_like)}°</p>
                    </div>
                  </div>
                </div>
              </div>


              <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-6 shadow-2xl">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 px-2">
                  <Cloud size={20} /> 5-Day Forecast
                </h3>
                <div className="space-y-4">
                  {forecast.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                      <p className="font-bold text-sm w-12">
                        {new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                      {getWeatherIcon(day.weather[0].description, 28)}
                      <p className="font-black text-lg">{Math.round(day.main.temp)}°</p>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-10 text-center text-white/30 text-[10px] font-black tracking-[0.4em] uppercase">
          SKYCAST PRO • Dashboard 2.0 • Build for Excellence
        </footer>
      </div>
    </div>
  );
}

export default App;