import cloud from './assets/cloud3.jpg'
import errorimg from './assets/error2.png'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {

  // To store searched city. Default city is Manjeri
  const [city, setCity] = useState("manjeri");

  // To store weather data got from API Call
  const [current, setCurrent] = useState(null);

  // To store forecast data got from API Call
  const [forecast, setForecast] = useState([]);

  // To Show error message on entering invalid City
  const [error, setError] = useState(false);

  // For Applying Flip animation 
  const [searchedCity, setSearchedCity] = useState("");

  // To load default city when component mounts
  useEffect(() => {
    handleSearch();
  }, []);


  const handleSearch = async () => {

    setError(false); // reset error state
    setSearchedCity(city);

    // Current weather
    const resCurrent = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=5b4bee0ba241d092159faf007e166080&units=metric`
    );
    const currentData = await resCurrent.json();
    console.log(currentData);

    if (currentData.cod !== 200) {
      setCurrent(null);
      setForecast([]);
      setError(true);
      return;
    }

    setCurrent({
      temp: currentData.main.temp,
      weather: currentData.weather[0].main,
      icon: currentData.weather[0].icon,
      humidity: currentData.main.humidity,
      wind: currentData.wind.speed,
      city: currentData.name,
      localTime: new Date((currentData.dt + currentData.timezone) * 1000).toLocaleString("en-US", {
        weekday: "long",
        hour: "2-digit",
        minute: "2-digit"
      }),
    });


    // Forecast
    const resForecast = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=5b4bee0ba241d092159faf007e166080&units=metric`
    );
    const dataForecast = await resForecast.json();

    // Group & pick 1 per day
    const grouped = {};
    dataForecast.list.forEach((item) => {
      const date = item.dt_txt.split(" ")[0];
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(item);
    });

    const daily = Object.keys(grouped)
      .slice(0, 7)
      .map((date) => {
        const dayData = grouped[date];
        const midday = dayData.find((d) => d.dt_txt.includes("12:00:00")) || dayData[0];
        return {
          day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
          min: Math.round(Math.min(...dayData.map((d) => d.main.temp_min))),
          max: Math.round(Math.max(...dayData.map((d) => d.main.temp_max))),
          icon: midday.weather[0].icon,
        };
      });

    setForecast(daily);

  }

  return (
    <>
      <div style={{ backgroundImage: `url(${cloud})`, height: '100vh', backgroundSize: 'cover', backgroundPosition: "center", width: "100%" }} className='d-flex align-items-center justify-content-center'>

        {/* Weather card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={searchedCity + (error ? 'error' : 'ok')}
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -90 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className='weather-card p-3 py-4'
          >

            {/* City search section */}
            <div className='d-flex align-items-center pb-1'>
              <input onChange={(e) => setCity(e.target.value.trim())} type="text" className='form-control border-0' style={{ borderRadius: '35px', backgroundColor: 'rgba(0, 11, 34, 0.12)', outline: 'none', border: 'none', boxShadow: 'none', color: 'white' }} />
              <button onClick={handleSearch} className='border-0 bg-transparent searchbtn'><i className="fa-solid fa-magnifying-glass fa-sm text-light" style={{ marginLeft: '-32px' }}></i></button>
            </div>

            {/* Invalid city preview */}
            {error && (
              <div className="d-flex flex-column justify-content-center align-items-center h-75 mt-2">
                <img src={errorimg} alt="Not found" style={{ width: "200px" }} />
                <p style={{ color: "rgba(255, 255, 255, 0.68)" }}>Enter a valid city</p>
              </div>
            )}

            {current &&
              <div>

                {/* Main Section */}
                <div className='p-2 mt-1 container'>
                  <div className='row d-flex align-items-center justify-content-center py-2' style={{ backgroundColor: 'rgba(0, 11, 34, 0.12)', borderRadius: '30px' }}>
                    <div className='col-5'>
                      <img src={`https://openweathermap.org/img/wn/${current.icon}@2x.png`} alt={current.weather} className='w-100' />
                    </div>
                    <div className='col-7 d-flex flex-column'>
                      <span style={{ fontWeight: '200', fontSize: '11px', letterSpacing: '0.1px', color: 'rgba(255, 255, 255, 0.88)' }}>{current.localTime}</span>
                      <span className='fs-5' style={{ letterSpacing: '0.3px', fontWeight: '500' }}>{current.weather} {Math.round(current.temp)}°C</span>
                      <span style={{ fontWeight: '200', fontSize: '14px' }}>{current.city}</span>
                    </div>
                  </div>
                </div>

                {/* Humidity and wind section */}
                <div className='d-flex align-items-center justify-content-between mt-1'>
                  <h6 className='py-1' style={{ fontWeight: '200', color: 'rgba(255, 255, 255, 0.88)', fontSize: '13px' }}>Humidity : <span style={{ color: 'rgba(255, 255, 255, 1)', fontWeight: '400' }}>{current.humidity}%</span></h6>
                  <h6 style={{ fontWeight: '200', color: 'rgba(255, 255, 255, 0.88)', fontSize: '13px' }}>Wind : <span style={{ color: 'rgba(255, 255, 255, 1)', fontWeight: '400' }}>{current.wind}km/h</span></h6>
                </div>

                {/* Forecast section */}
                <div className='d-flex align-items-center justify-content-around mt-1'>
                  {forecast.map((day, index) => (
                    <div key={index} className='forecast d-flex flex-column align-items-center'>
                      <span>{day.day}</span>
                      <img src={`https://openweathermap.org/img/wn/${day.icon}.png`} alt="" className='w-100' />
                      <span>{day.max}°</span>
                      <span>{day.min}°</span>
                    </div>
                  ))}
                </div>

              </div>
            }

          </motion.div>
        </AnimatePresence>
      </div>
    </>
  )
}

export default App
