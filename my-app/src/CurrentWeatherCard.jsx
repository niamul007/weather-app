const CurrentWeatherCard = ({ data, unit, onGenerateSuggestion, aiLoading, suggestion }) => {
    const {
        location,
        description,
        temp,
        feelsLike,
        humidity,
        windSpeed,
        icon,
        dt,
        sunrise, 
        sunset,  
    } = data;
    
    const unitSymbol = `°${unit}`;

    // Helper to format UNIX timestamps to local time string
    const formatTime = (timestamp) => 
        new Date(timestamp * 1000).toLocaleTimeString('en-US', {
            hour: '2-digit', 
            minute: '2-digit'
        });

    const formattedTime = formatTime(dt);

    return (
        <div className="current-weather-card p-6 sm:p-8 bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl transition duration-500">
            <div className="card-header border-b pb-4 mb-4 border-white/30">
                <div className="flex items-center justify-between">
                    <h2 className="city-name text-3xl sm:text-4xl font-extrabold flex items-center">
                        <MapPin className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-red-300"/>{location}
                    </h2>
                </div>
                <p className="date-time text-lg opacity-80 mt-1">Today, {formattedTime}</p>
            </div>
            
            <div className="main-info flex flex-col sm:flex-row items-center justify-around mb-6">
                <div className="temp-icon flex items-center mb-4 sm:mb-0">
                    <img 
                        // OpenWeatherMap standard icon URL
                        src={`http://openweathermap.org/img/wn/${icon}@2x.png`} 
                        alt={description} 
                        className="w-24 h-24"
                    />
                    <span className="current-temp text-7xl font-light ml-2">
                        {Math.round(temp)}{unitSymbol} 
                    </span>
                </div>
                <p className="description text-xl sm:text-2xl font-semibold capitalize text-shadow-md">{description}</p>
            </div>

            <div className="details grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm sm:text-lg">
                <DetailItem label="Feels Like" value={`${Math.round(feelsLike)}${unitSymbol}`} icon={<Droplet className="w-5 h-5"/>} />
                <DetailItem label="Humidity" value={`${humidity}%`} icon={<Droplet className="w-5 h-5"/>} />
                <DetailItem label="Wind Speed" value={`${windSpeed} m/s`} icon={<Wind className="w-5 h-5"/>} />
                <DetailItem label="Sunrise" value={formatTime(sunrise)} icon={<Sunrise className="w-5 h-5 text-yellow-300"/>} />
                <DetailItem label="Sunset" value={formatTime(sunset)} icon={<Sunset className="w-5 h-5 text-orange-400"/>} />
            </div>

            {/* Gemini AI Suggestion Feature */}
            <div className="mt-6 pt-4 border-t border-white/30">
                <button 
                    onClick={onGenerateSuggestion}
                    disabled={aiLoading}
                    className="w-full p-3 bg-fuchsia-600 hover:bg-fuchsia-700 disabled:bg-fuchsia-400 text-white font-bold rounded-xl shadow-xl transition duration-200 flex items-center justify-center text-lg"
                >
                    {aiLoading ? (
                        <><Loader className="w-5 h-5 animate-spin mr-2"/> Generating Tip...</>
                    ) : (
                        <><Zap className="w-5 h-5 mr-2"/> Get Today's Activity Suggestion</>
                    )}
                </button>

                {suggestion && (
                    <div className="mt-4 p-4 bg-fuchsia-900/50 rounded-lg shadow-inner border border-fuchsia-500/50">
                        <p className="text-base italic leading-relaxed">{suggestion}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CurrentWeatherCard;