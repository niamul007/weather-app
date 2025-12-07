import { Search, MapPin, Sunset, Sunrise, Droplet, Wind, Loader, Zap } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import SearchBar from './SearchBar';
import CurrentWeatherCard from './CurrentWeatherCard';
import ForecastList from './ForecastList';
import { exponentialBackoffFetch } from './App.jsx';
import { convertTemperature, filterForecastData } from './App.jsx';
// API Keys and Endpoints
const API_KEY = ''
const GEMINI_API_KEY = ''
const LLM_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;

export default function WeatherApp() {
    // State hooks
    const [weatherData, setWeatherData] = useState(null);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [unit, setUnit] = useState('C'); // Default to Celsius
    const [suggestion, setSuggestion] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);

    // Function to toggle between C and F units
    const toggleUnit = () => {
        setUnit(prevUnit => prevUnit === 'C' ? 'F' : 'C');
    };
    
    // Core Fetch Function (Memoized via useCallback)
    // Handles fetching both by city name and by coordinates (lat/lon)
    const fetchData = useCallback(async ({ cityName, lat, lon }) => {
        setLoading(true);
        setError(null);
        setSuggestion(null); // Clear previous AI suggestion

        try {
            
            let currentUrl, cityLat, cityLon;
            // 1. Determine the initial API call URL
            if (lat && lon) {
                // Fetch current weather using coordinates (used by Geolocation)
                currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
            } else if (cityName) {
                // Fetch current weather using city name (used by search bar)
                currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}`;
            } else {
                throw new Error("Missing city name or coordinates for fetch.");
            }

            const currentRes = await exponentialBackoffFetch(currentUrl);
            const currentData = await currentRes.json();
            
            if (currentData.cod && currentData.cod !== 200) {
                 throw new Error(currentData.message || "City not found or invalid response.");
            }
            
            // Extract coordinates needed for the forecast API call
            cityLat = currentData.coord.lat;
            cityLon = currentData.coord.lon;

            // 2. Fetch 5-day / 3-hour Forecast using coordinates
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${cityLat}&lon=${cityLon}&appid=${API_KEY}`;
            const forecastRes = await exponentialBackoffFetch(forecastUrl);
            const forecastData = await forecastRes.json();
            
            // 3. --- DATA PROCESSING ---
            const dailyForecast = filterForecastData(forecastData.list, unit);

            const finalData = {
                current: {
                    location: currentData.name,
                    country: currentData.sys.country,
                    // Convert and store display temperatures
                    temp: convertTemperature(currentData.main.temp, unit),
                    feelsLike: convertTemperature(currentData.main.feels_like, unit),
                    description: currentData.weather[0].description,
                    icon: currentData.weather[0].icon,
                    dt: currentData.dt,
                    windSpeed: currentData.wind.speed,
                    humidity: currentData.main.humidity,
                    sunrise: currentData.sys.sunrise, 
                    sunset: currentData.sys.sunset,   
                    // Store the raw Kelvin values for accurate re-conversion when unit changes
                    rawTemp: currentData.main.temp, 
                    rawFeelsLike: currentData.main.feels_like,
                },
                forecast: dailyForecast,
                // Store the raw forecast list (in Kelvin) for unit switching without re-fetching
                rawForecastList: forecastData.list,
            };

            setWeatherData(finalData); 
        } catch (err) {
            console.error("Error fetching weather:", err.message);
            setError(`Failed to fetch weather. ${err.message}`);
            setWeatherData(null);
        } finally {
            setLoading(false);
        }
    }, [unit]); // Re-create if unit changes (important for initial fetch)

    // Re-convert data whenever the unit changes (NO API RE-FETCH NEEDED)
    useEffect(() => {
        if (weatherData && weatherData.current) {
            // Recalculate current weather temps from stored raw values
            const newCurrent = {
                ...weatherData.current,
                temp: convertTemperature(weatherData.current.rawTemp, unit),
                feelsLike: convertTemperature(weatherData.current.rawFeelsLike, unit),
            };

            // Recalculate forecast temps using the raw list
            const newForecast = filterForecastData(weatherData.rawForecastList, unit);

            // Update state with new, converted data
            setWeatherData(prevData => ({
                ...prevData,
                current: newCurrent,
                forecast: newForecast
            }));
        }
    }, [unit]); // Depends only on unit

    
    // --- GEOLOCATION LOGIC ---

    // Initial Data Load on Component Mount
    useEffect(() => {
        // Function to attempt geolocation
        const getGeoLocation = () => {
            if (navigator.geolocation) {
                // Request location access
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        // Success: Fetch weather using coordinates
                        fetchData({ 
                            lat: position.coords.latitude, 
                            lon: position.coords.longitude 
                        });
                    },
                    (error) => {
                        // Error/Denial: Fallback to a default location (e.g., London)
                        console.warn("Geolocation failed or denied. Falling back to London.", error);
                        fetchData({ cityName: "london" });
                    },
                    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
                );
            } else {
                // Browser doesn't support geolocation: Fallback
                console.warn("Geolocation not supported by browser. Falling back to London.");
                fetchData({ cityName: "london" });
            }
        };

        getGeoLocation();
    }, [fetchData]); // Run once on mount, using the memoized fetchData


    // Handlers for User Interaction (Search Button)
    function handleSearch() {
        if (query.trim() === "") return;
        fetchData({ cityName: query.trim() });
        setQuery("");
    }

    // Handler for User Interaction (MapPin Button)
    function handleGeolocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Success: Fetch weather using coordinates
                    fetchData({ 
                        lat: position.coords.latitude, 
                        lon: position.coords.longitude 
                    });
                },
                (error) => {
                    let errorMessage = "Could not get current location.";
                    // Provide a more descriptive error based on Geolocation API codes
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = "Location access was denied. Please check your browser's site permissions.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = "Location information is unavailable (network or GPS issue).";
                            break;
                        case error.TIMEOUT:
                            errorMessage = "The request to get your location timed out.";
                            break;
                        default:
                            errorMessage += " Please try searching manually.";
                    }
                    setError(errorMessage);
                    console.error("Geolocation failed on button click:", error);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            setError("Geolocation is not supported by your browser.");
        }
    }

    // --- GEMINI API CALL FUNCTION ---
    const generateWeatherSuggestion = async () => {
        if (!weatherData) return;
        
        setAiLoading(true);
        setSuggestion(null);

        const current = weatherData.current;
        // Summarize the forecast data to include in the prompt
        const forecastSummary = weatherData.forecast.map(f => 
            `${f.day}: High ${Math.round(f.tempMax)}°${unit} and ${f.description}`
        ).join(', ');

        // System Instruction guides the model's persona and output format
        const systemPrompt = "You are a friendly and enthusiastic travel planner and activity guide. Your task is to provide a single, concise paragraph with an activity or travel suggestion based on the provided weather information. Focus on the best thing a person can do outdoors or indoors given the current conditions and the 5-day outlook.";
        
        // User Query contains the actual data for grounding
        const userQuery = `Location: ${current.location}. Current Temp: ${current.temp}°${unit} and ${current.description}. 5-Day Forecast: ${forecastSummary}. Based ONLY on this weather data, what is a single, exciting activity or travel tip for this location right now?`;

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
        };

        try {
            const response = await exponentialBackoffFetch(LLM_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a suggestion right now.";
            setSuggestion(generatedText);

        } catch (err) {
            console.error("Gemini API Error:", err);
            setSuggestion("Could not connect to the AI service for a suggestion. Please try again.");
        } finally {
            setAiLoading(false);
        }
    };


    // --- RENDERING ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 text-white p-4 sm:p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <header className="text-center py-6">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 flex items-center justify-center">
                        <span role="img" aria-label="sun" className="mr-3 text-yellow-300 text-4xl">
                            ☀️
                        </span> 
                        Smart Weather Dashboard
                    </h1>
                </header>
                
                {/* Units Toggle Button */}
                <div className="flex justify-end mb-4">
                    <button 
                        onClick={toggleUnit} 
                        className="p-2 bg-purple-700 hover:bg-purple-600 text-white font-semibold rounded-xl shadow-lg transition duration-200"
                        title="Toggle temperature units"
                    >
                        Switch to {unit === 'C' ? '°F' : '°C'}
                    </button>
                </div>

                <SearchBar 
                    query={query} 
                    setQuery={setQuery} 
                    onSearch={handleSearch}
                    onGeolocation={handleGeolocation} // Pass the Geolocation handler
                />

                {/* Loading State UI */}
                {loading && (
                    <div className="text-center py-12">
                        <Loader className="animate-spin h-8 w-8 text-white mx-auto"/>
                        <p className="status-text mt-4">Loading weather data, please wait...</p>
                    </div>
                )}
                
                {/* Error State UI */}
                {error && (
                    <p className="text-center p-4 bg-red-600/70 rounded-xl shadow-lg text-lg">
                        Error: {error}
                    </p>
                )}

                {/* Main Weather Display */}
                {weatherData && !loading && !error && (
                    <div className="weather-display space-y-8">
                        <CurrentWeatherCard 
                            data={weatherData.current} 
                            unit={unit} 
                            onGenerateSuggestion={generateWeatherSuggestion}
                            aiLoading={aiLoading}
                            suggestion={suggestion}
                        />
                        <ForecastList forecast={weatherData.forecast} unit={unit} />
                    </div>
                )}
            </div>
        </div>
    );
}

