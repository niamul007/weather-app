import React from 'react';
import ForecastItem from './ForecastItem.jsx';
const ForecastList = ({ forecast, unit }) => {
    if (!forecast || forecast.length === 0) {
        return null;
    }

    return (
        <div className="mt-8 p-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl">
            <h3 className="text-xl font-bold mb-4 border-b pb-2 border-white/20">5-Day Forecast</h3>
            <div className="flex flex-wrap justify-center sm:justify-between -m-1">
                {forecast.map((item, index) => (
                    <ForecastItem key={index} data={item} unit={unit} />
                ))}
            </div>
        </div>
    );
};
export default ForecastList;