import React, { useState } from 'react';
import axios from 'axios';
function Weather() {
    const [city, setCity] = useState('');
    const [weather, setWeather] = useState(null);
    const [temperature, setTemperature] = useState(null);
    const [description, setDescription] = useState(null);
    const [searchedCity, setSearchedCity] = useState('');
    const [cityImage, setCityImage] = useState('');
    const [weatherTheme, setWeatherTheme] = useState('default');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handlechange = (e) => {
        setCity(e.target.value);
    };
    function getWeatherTheme(condition) {
        const normalized = condition.toLowerCase();
        if (normalized.includes('thunder')) return 'thunderstorm';
        if (normalized.includes('drizzle') || normalized.includes('rain')) return 'rain';
        if (normalized.includes('snow')) return 'snow';
        if (normalized.includes('clear')) return 'clear';
        if (normalized.includes('cloud')) return 'clouds';
        if (['mist', 'fog', 'haze', 'smoke', 'dust', 'sand', 'ash'].some((word) => normalized.includes(word))) {
            return 'mist';
        }
        return 'clouds';
    }
    async function getWeather() {
        const cityName = city.trim();
        if (!cityName) {
            setError('Please enter a city name.');
            return;
        }

        setLoading(true);
        setError('');
        setCityImage('');
        try {
            const response = await axios(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=b7591d1c0262e2b949db4c378726beab`
            );
            const currentWeather = response.data.weather[0];
            setWeather(currentWeather.main);
            setDescription(currentWeather.description);
            setTemperature((response.data.main.temp - 273.15).toFixed(2));
            setSearchedCity(response.data.name);
            setWeatherTheme(getWeatherTheme(currentWeather.main));

            try {
                const imageResponse = await axios.get('https://commons.wikimedia.org/w/api.php', {
                    params: {
                        action: 'query',
                        generator: 'search',
                        gsrsearch: `${response.data.name} city skyline`,
                        gsrnamespace: 6,
                        gsrlimit: 10,
                        prop: 'imageinfo',
                        iiprop: 'url',
                        iiurlwidth: 1920,
                        format: 'json',
                        origin: '*',
                    },
                });
                const pages = Object.values(imageResponse.data.query?.pages || []);
                const imagePage = pages.find((page) => page.imageinfo?.[0]?.thumburl || page.imageinfo?.[0]?.url);
                setCityImage(imagePage?.imageinfo?.[0]?.thumburl || imagePage?.imageinfo?.[0]?.url || '');
            } catch (imageError) {
                console.error('Could not load a background image for this city.', imageError);
            }
        } catch (requestError) {
            setWeather(null);
            setTemperature(null);
            setDescription(null);
            setSearchedCity('');
            setCityImage('');
            setWeatherTheme('default');
            setError(requestError.response?.data?.message || 'Unable to get weather. Please try again.');
        } finally {
            setLoading(false);
        }
    }
    return (
        <main className={`weather-scene weather-scene--${weatherTheme} relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 text-slate-800 transition-colors sm:py-20`}>
            <div className="weather-effects" aria-hidden="true">
                <span className="weather-sun" />
                <span className="weather-cloud" />
                <span className="weather-rain" />
                <span className="weather-snow" />
                <span className="weather-lightning" />
            </div>
            <section className="relative z-10 mx-auto w-full max-w-lg rounded-3xl border border-white/70 bg-white/70 p-6 shadow-2xl shadow-slate-900/20 backdrop-blur-xl sm:p-10">
                <div className="mb-8 text-center">
                    <span className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-3xl" aria-hidden="true">
                        {weatherTheme === 'rain' || weatherTheme === 'thunderstorm' ? '🌧️' : weatherTheme === 'snow' ? '❄️' : weatherTheme === 'clouds' || weatherTheme === 'mist' ? '☁️' : '☀️'}
                    </span>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Weather App</h1>
                    <p className="mt-2 text-sm text-slate-500">
                        {searchedCity ? `Current weather in ${searchedCity}` : 'Find the current weather in your city.'}
                    </p>
                </div>
                <label htmlFor="city" className="mb-2 block text-sm font-semibold text-slate-700">City name</label>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                        id="city"
                        type="text"
                        placeholder="e.g. London"
                        value={city}
                        onChange={handlechange}
                        className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                    />
                    <button
                        type="button"
                        onClick={getWeather}
                        disabled={loading}
                        className="rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-200 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
                    >
                        {loading ? 'Loading...' : 'Get Weather'}
                    </button>
                </div>
                {error && (
                    <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {error}
                    </p>
                )}
                <div className="mt-8">
                    {weather ? (
                        <ul className="divide-y divide-slate-100 rounded-2xl bg-slate-50 px-5">
                            <li className="flex items-center justify-between gap-4 py-4">
                                <span className="text-sm text-slate-500">Weather  :</span>
                                <span className="font-semibold capitalize text-slate-900">{weather}</span>
                            </li>
                            <li className="flex items-center justify-between gap-4 py-4">
                                <span className="text-sm text-slate-500">Temperature :</span>
                                <span className="font-semibold text-slate-900">{temperature}°C</span>
                            </li>
                            <li className="flex items-center justify-between gap-4 py-4">
                                <span className="text-sm text-slate-500">Description :</span>
                                <span className="font-semibold capitalize text-slate-900">{description}</span>
                            </li>
                        </ul>
                    ) : (
                        <p className="rounded-2xl border border-dashed border-slate-200 px-5 py-6 text-center text-sm text-slate-500">
                            {loading ? 'Getting the latest weather...' : 'Enter a city above to see its current weather.'}
                        </p>
                    )}
                </div>

                {cityImage && (
                    <div className="city-background mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner shadow-slate-900/5">
                        <img
                            src={cityImage}
                            alt={`${searchedCity || 'City'} skyline`}
                            width="800"
                            height="600"
                            className="h-40 w-full object-cover sm:h-44"
                            onError={() => {
                                console.error(`The background image for ${searchedCity} could not be displayed.`);
                                setCityImage('');
                            }}
                        />
                    </div>
                )}
            </section>
        </main >
       
        
    );
}
export default Weather;
