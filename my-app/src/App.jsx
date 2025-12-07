import React, { useState, useEffect, useCallback } from "react";
import { Search, MapPin, Sunset, Sunrise, Droplet, Wind, Loader, Zap } from 'lucide-react';

// --- GLOBAL CONSTANTS ---
// NOTE: OpenWeatherMap API Key is hardcoded here for simplicity in this sandbox.
const API_KEY = ''
// GEMINI_API_KEY is expected to be provided by the runtime environment.
const GEMINI_API_KEY = ''
const LLM_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;


// ===================================
// --- UTILITY FUNCTIONS BLOCK ---
// ===================================

// Function to handle fetching with exponential backoff for robust API calls
export const  exponentialBackoffFetch = async (url, options, maxRetries = 5) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                // Throw specific error for 4xx status codes (e.g., city not found)
                if (response.status >= 400 && response.status < 500) {
                    throw new Error(`API returned status code ${response.status}: ${await response.text()}`);
                }
                // Retry for other transient errors
                throw new Error(`Transient API error: ${response.status}`);
            }
            return response;
        } catch (error) {
            if (i === maxRetries - 1) {
                throw error;
            }
            // Exponential delay with jitter
            const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

// Converts temperature from Kelvin (OpenWeatherMap's default) to Celsius or Fahrenheit.
export const convertTemperature = (kelvin, targetUnit) => {
    if (typeof kelvin !== "number") return null;
    let result;

    if (targetUnit === 'C') {
        result = kelvin - 273.15; // Kelvin to Celsius
    } else if (targetUnit === 'F') {
        result = (kelvin - 273.15) * 1.8 + 32; // Kelvin to Fahrenheit
    } else {
        return kelvin; 
    }
    return parseFloat(result.toFixed(1)); // Return one decimal place and perse float make it a number 
};

// Aggregates the 3-hour forecast list into 5-day daily high/low data.
export const filterForecastData = (list, unit) => {
    const dailyData = {};
    const today = new Date().toDateString();

    list.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const itemDateString = date.toDateString();

        // Skip today's data as we focus on the upcoming 5 days
        if (itemDateString === today) {
            return; 
        }

        const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
        const currentTemp = item.main.temp; // Temperature in Kelvin for accurate min/max comparison

        if (!dailyData[dayName]) {
            dailyData[dayName] = {
                tempMax: -Infinity,
                tempMin: Infinity,
                noonItem: item, // Stores the full item closest to noon for description/icon
            };
        }

        // Update overall max and min for the day using Kelvin
        if (currentTemp > dailyData[dayName].tempMax) {
            dailyData[dayName].tempMax = currentTemp;
        }
        if (currentTemp < dailyData[dayName].tempMin) {
            dailyData[dayName].tempMin = currentTemp;
        }

        // Determine the best item for the weather icon/description (closest to 12 PM)
        const hour = date.getHours();
        const storedNoonHour = new Date(
            dailyData[dayName].noonItem.dt * 1000
        ).getHours();

        if (Math.abs(hour - 12) < Math.abs(storedNoonHour - 12)) {
            dailyData[dayName].noonItem = item;
        }
    });

    // Convert the map back to an array and apply unit conversion
    const finalForecast = Object.values(dailyData)
        .slice(0, 5) // Ensure only 5 days are shown
        .map((dayEntry) => ({
            date: dayEntry.noonItem.dt * 1000,
            day: new Date(dayEntry.noonItem.dt * 1000).toLocaleDateString("en-US", {
                weekday: "short",
            }),
            // Convert the calculated daily high/low (which are in Kelvin)
            tempMax: convertTemperature(dayEntry.tempMax, unit),
            tempMin: convertTemperature(dayEntry.tempMin, unit),
            description: dayEntry.noonItem.weather[0].description,
            icon: dayEntry.noonItem.weather[0].icon,
        }));

    return finalForecast;
};

