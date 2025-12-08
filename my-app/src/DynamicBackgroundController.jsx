import React, { useEffect, useState } from 'react';

// --- Condition ID Mapping (More Accurate than Icon Code) ---
const ID_TO_IMAGE_MAP = {
    // 800s: Clouds
    800: { day: "clear-sky.jpg", night: "night-sky.jpg" }, 
    801: { day: "few-clouds.jpg", night: "few-clouds.jpg" },
    802: { day: "scattered-clouds.jpg", night: "scattered-clouds.jpg" },
    803: { day: "overcast.jpg", night: "overcast.jpg" }, // Broken
    804: { day: "overcast.jpg", night: "overcast.jpg" }, // Overcast (Heavier image)

    // 300s & 500s: Rain/Drizzle
    300: { day: "drizzel.jpg", night: "drizzel.jpg" },
    500: { day: "drizzel.jpg", night: "drizzel.jpg" }, // Light rain
    501: { day: "rain.jpg", night: "rain.jpg" }, // Moderate rain
    502: { day: "rain.jpg", night: "rain.jpg" }, // Heavy rain
    511: { day: "rain.jpg", night: "rain.jpg" }, // Freezing rain
    
    // 200s: Thunderstorm
    200: { day: "Thunderstorm.jpg", night: "Thunderstorm.jpg" },
    201: { day: "Thunderstorm.jpg", night: "Thunderstorm.jpg" },

    // 600s: Snow
    600: { day: "snow.jpg", night: "snow.jpg" },

    // 700s: Atmosphere (Haze/Mist)
    701: { day: "haze.jpg", night: "haze.jpg" }, // Mist
    741: { day: "haze.jpg", night: "haze.jpg" }, // Fog
    781: { day: "extrem-weather.jpg", night: "extrem-weather.jpg" }, // Tornado
};


// --- Utility Function Updated to use ID and Icon Code ---
const getBackgroundImageUrl = (iconCode, conditionId) => {
    
    // Determine if it's day or night based on icon code suffix ('d' or 'n')
    const time = iconCode ? (iconCode.endsWith('n') ? 'night' : 'day') : 'day'; 
    let filename = null;

    // 1. Check the Condition ID first for the most accurate match
    if (conditionId && ID_TO_IMAGE_MAP[conditionId]) {
        filename = ID_TO_IMAGE_MAP[conditionId][time];
    }
    
    // 2. If ID wasn't found (or for safety), use the generic icon code base (e.g., '10' for rain)
    if (!filename && iconCode) {
        const baseIcon = iconCode.slice(0, 2);
        const ICON_MAPPING_FALLBACK = {
            '01': "clear-sky.jpg", '02': "few-clouds.jpg", '03': "scattered-clouds.jpg", '04': "overcast.jpg",
            '09': "drizzel.jpg", '10': "rain.jpg", '11': "Thunderstorm.jpg", '13': "snow.jpg", '50': "haze.jpg",
        };
        filename = ICON_MAPPING_FALLBACK[baseIcon];
    }

    const finalFilename = filename || "clear-sky.jpg"; 
    
    return `url('/${finalFilename}')`;
};


// --- Component ---
const DynamicBackgroundController = ({ currentIconCode, currentConditionId }) => {
    
    const [isTransitioning, setIsTransitioning] = useState(false);

    // 1. useEffect for Initial Load (Fixes Shaking/Jumping)
    useEffect(() => {
        // Set the default body styles and initial image immediately on mount.
        document.body.className = "bg-cover bg-fixed bg-center";
        if (!document.body.style.backgroundImage) {
            document.body.style.backgroundImage = getBackgroundImageUrl('01d', null);
        }
    }, []); 

    
    // 2. useEffect for Dynamic Transition (Fixes Dark Screen)
    useEffect(() => {
        // Declare timers in the outer scope for cleanup access
        let timer1 = null; 
        let timer2 = null; 
        
        if (!currentIconCode) return;

        const newImageUrl = getBackgroundImageUrl(currentIconCode, currentConditionId);
        
        // Skip transition if the image source hasn't actually changed
        if (document.body.style.backgroundImage === newImageUrl) {
            return;
        }

        // 1. START TRANSITION: Show the black overlay
        setIsTransitioning(true);

        // 2. WAIT (200ms): Must match the CSS transition duration
        timer1 = setTimeout(() => { 
            
            // 3. SWAP IMAGE: Change the background URL
            document.body.style.backgroundImage = newImageUrl;
            
            // 4. END TRANSITION: Hide the overlay quickly
            timer2 = setTimeout(() => { 
                 setIsTransitioning(false);
            }, 10); // Very short delay

        }, 200); // ⬅️ Reduced time for faster swap
        
        // Cleanup function
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2); 
        };
        
    }, [currentIconCode, currentConditionId]); 

    // Renders the fullscreen, black transition overlay (CSS duration-200)
    return (
        <div 
            className={`
                fixed inset-0 z-[999]           
                bg-black                        
                transition-opacity duration-200 ease-in-out /* ⬅️ Reduced time for faster swap */
                pointer-events-none             
                ${isTransitioning ? 'opacity-100' : 'opacity-0'} 
            `}
        />
    );
};

export default DynamicBackgroundController;