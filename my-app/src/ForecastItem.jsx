// Example structure for ForecastItem.jsx

const ForecastItem = ({ data, unit }) => {
    // ... data destructuring ...

    return (
        // 1. OUTER CONTAINER: Establishes the boundary (relative position is CRITICAL)
        <div className="relative p-4 rounded-xl overflow-hidden min-w-[120px] shadow-lg"> 

            {/* 2. THE GLASS LAYER (Background Effect Layer) */}
            {/* This div is absolutely positioned to cover the container and holds the blur filter. 
               The content will sit on the background BEHIND this layer. */}
            <div 
                className="absolute inset-0 bg-white/20 z-0" 
                style={{ 
                    backdropFilter: 'blur(12px)', // ⬅️ THIS applies the blur to what's behind it
                    WebkitBackdropFilter: 'blur(12px)' 
                }}
            >
                {/* This layer should be empty */}
            </div>

            {/* 3. THE CONTENT LAYER (Info Layer) */}
            {/* This div holds all your readable data and MUST have a higher z-index (z-10 or higher) */}
            <div className="relative z-10 text-center space-y-1">
                
                {/* All your readable elements go here: Day, Temperature, Icon */}
                <p className="font-bold text-lg">{data.day}</p> 
                <img 
                    src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`} 
                    alt={data.description} 
                    className="w-10 h-10 mx-auto"
                />
                <p className="text-xl font-extrabold">{Math.round(data.tempMax)}°{unit}</p>
                <p className="text-xs text-gray-200">{data.description}</p>
                
            </div>
        </div>
    );
}

export default ForecastItem;