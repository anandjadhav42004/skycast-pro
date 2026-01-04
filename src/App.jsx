import React, { useState, useEffect } from 'react';
import { Search, Wind, Droplets, Thermometer, CloudRain, Navigation, Eye, Gauge, Sunrise, X, SunMedium, WindArrowDown, MapPin, Clock } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY; 
const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY; 

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [aqi, setAqi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bgImage, setBgImage] = useState('');
  const [userCoords, setUserCoords] = useState(null);
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
    }, (err) => console.log("Location Denied"));
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return Math.round(R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))));
  };

  const handleSearch = async (searchVal) => {
    const finalCity = typeof searchVal === 'string' ? searchVal : city;
    if (!finalCity) return;
    
    setLoading(true);
    try {
      const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${finalCity.trim()}&units=metric&appid=${API_KEY}`);
      const { lat, lon } = res.data.coord;

      const aqiRes = await axios.get(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
      setAqi(aqiRes.data.list[0].main.aqi);

      const imgRes = await axios.get(`https://api.unsplash.com/search/photos`, {
        params: {
          query: `${finalCity} india landmark city skyline`,
          orientation: 'landscape', per_page: 1, client_id: UNSPLASH_KEY
        }
      });

      if (imgRes.data.results.length > 0) {
        setBgImage(imgRes.data.results[0].urls.full + "&sig=" + new Date().getTime());
      }

      if (userCoords) {
        setDistance(calculateDistance(userCoords.lat, userCoords.lon, lat, lon));
      }

      const fRes = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${finalCity.trim()}&units=metric&appid=${API_KEY}`);
      setForecast(fRes.data.list.filter(f => f.dt_txt.includes("12:00:00")));
      
      setWeather(res.data);
    } catch (err) {
      alert("City name check karle bhai!");
    } finally {
      setLoading(false);
    }
  };

  const goHome = () => {
    setWeather(null);
    setBgImage('');
    setCity('');
    setAqi(null);
  };

  return (
    <div className="app-container">
      <AnimatePresence>
        {bgImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="full-screen-bg" style={{ backgroundImage: `url(${bgImage})` }} 
          />
        )}
      </AnimatePresence>

      <div className={`ui-layer ${!weather ? 'home-centered' : 'data-top'}`}>
        
        
        <div className="top-nav-bar">
          {!weather ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="greeting-text">
              <span className="sun-icon-mini"><SunMedium size={18} /></span>
              {getGreeting()}, Anand
            </motion.div>
          ) : (
            <button className="exit-btn-ios" onClick={goHome}><X size={16} /> Close</button>
          )}
        </div>

        
        {!weather && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="welcome-content">
            <h2 className="main-intro-title">Where would you like to go?</h2>
            <p className="sub-intro-text">Check live weather, legit city views, and distance.</p>
          </motion.div>
        )}

        
        <div className="search-box-container">
          <div className="glass-search-bar-premium">
            <Search size={22} className="search-icon-dim" />
            <input 
              type="text" 
              placeholder="Search Indian City or State..." 
              value={city} 
              onChange={(e) => setCity(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
            />
            <button onClick={() => handleSearch()} className="premium-btn-go">
              {loading ? <div className="loader-dots">...</div> : 'Search'}
            </button>
          </div>

          
          {!weather && (
            <div className="quick-chips">
              {['Pune', 'Mumbai', 'Latur', 'Delhi', 'Rajasthan'].map((c) => (
                <button key={c} onClick={() => handleSearch(c)} className="chip-btn">
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {weather && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="weather-content">
            <div className="hero-data-box">
              <h1 className="city-title-main">{weather.name}</h1>
              <div className="temp-huge-display">{Math.round(weather.main.temp)}°</div>
              <p className="status-label">{weather.weather[0].main}</p>
              <div className="hl-container">H:{Math.round(weather.main.temp_max)}° &nbsp; L:{Math.round(weather.main.temp_min)}°</div>
              
              {distance && (
                <div className="dist-badge-premium">
                  <MapPin size={12} fill="white" /> {distance} km away from you
                </div>
              )}
            </div>

            <div className="widgets-grid-iphone">
              {/* AQI Widget */}
              <div className="glass-widget aqi-special">
                <div className="w-head"><WindArrowDown size={14}/> AIR QUALITY</div>
                <div className="aqi-main-val">
                  <span className="aqi-num">{aqi}</span>
                  <span className="aqi-txt" style={{color: aqi <= 2 ? '#4ade80' : '#fb923c'}}>
                    {aqi <= 2 ? 'Good' : 'Moderate'}
                  </span>
                </div>
                <div className="aqi-line"><div className="aqi-fill" style={{width: `${aqi*20}%`}}></div></div>
              </div>

              <Widget icon={<SunMedium size={16}/>} label="UV INDEX" value={aqi > 2 ? "High" : "Low"} note="Sunscreen needed." />
              <Widget icon={<Droplets size={16}/>} label="HUMIDITY" value={`${weather.main.humidity}%`} note="The dew point is 21°." />
              <Widget icon={<Wind size={16}/>} label="WIND" value={`${weather.wind.speed} m/s`} note="North direction." />
              
              <div className="forecast-card-premium glass-widget">
                <p className="w-head">5-DAY FORECAST</p>
                {forecast.map((f, i) => (
                  <div key={i} className="f-row">
                    <span className="f-day">{new Date(f.dt * 1000).toLocaleDateString('en', {weekday: 'short'})}</span>
                    <CloudRain size={20} color="#60a5fa" />
                    <span className="f-temp">{Math.round(f.main.temp)}°</span>
                  </div>
                ))}
              </div>

              <Widget icon={<Eye size={16}/>} label="VISIBILITY" value={`${weather.visibility/1000} km`} note="Clear conditions." />
              <Widget icon={<Gauge size={16}/>} label="PRESSURE" value={weather.main.pressure} note="hPa" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Widget({ icon, label, value, note }) {
  return (
    <div className="glass-widget">
      <div className="w-head">{icon} <span>{label}</span></div>
      <div className="w-value">{value}</div>
      <div className="w-note">{note}</div>
    </div>
  );
}

export default App;