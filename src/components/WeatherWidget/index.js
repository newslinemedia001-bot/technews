'use client';

import { useState, useEffect } from 'react';
import styles from './WeatherWidget.module.css';

// City coordinates mapping
const CITIES = [
    { name: 'Nairobi', lat: -1.2921, lon: 36.8219 },
    { name: 'Mombasa', lat: -4.0435, lon: 39.6682 },
    { name: 'Kisumu', lat: -0.0917, lon: 34.7680 },
    { name: 'Nakuru', lat: -0.3031, lon: 36.0800 },
    { name: 'Eldoret', lat: 0.5143, lon: 35.2698 }
];

export default function WeatherWidget() {
    const [weatherData, setWeatherData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllWeather = async () => {
            try {
                // Fetch weather for all cities in parallel
                const promises = CITIES.map(async (city) => {
                    const response = await fetch(
                        `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code&timezone=auto`
                    );
                    if (!response.ok) throw new Error(`Failed to fetch for ${city.name}`);
                    const data = await response.json();
                    return { ...city, ...data.current };
                });

                const results = await Promise.all(promises);

                // Convert array to object for easier access
                const dataMap = {};
                results.forEach(result => {
                    dataMap[result.name] = result;
                });

                setWeatherData(dataMap);
                setLoading(false);
            } catch (err) {
                console.error('Weather fetch error:', err);
                setError('Failed to load weather');
                setLoading(false);
            }
        };

        fetchAllWeather();
    }, []);

    const getWeatherIcon = (code) => {
        if (code === 0) return '☀️';
        if (code === 1 || code === 2 || code === 3) return '⛅';
        if (code === 45 || code === 48) return '🌫️';
        if (code >= 51 && code <= 67) return 'Hz';
        if (code >= 71 && code <= 77) return '❄️';
        if (code >= 80 && code <= 82) return '🌧️';
        if (code >= 95) return '⛈️';
        return '☀️';
    };

    const getWeatherText = (code) => {
        if (code === 0) return 'Clear';
        if (code === 1 || code === 2 || code === 3) return 'Partly Cloudy';
        if (code === 45 || code === 48) return 'Foggy';
        if (code >= 51 && code <= 67) return 'Rainy';
        if (code === 95) return 'Storm';
        return 'Clear';
    };

    if (loading) return null;
    if (error) return null;

    return (
        <div className={styles.widget}>
            <div className={styles.header}>
                <h3 className={styles.title}>Weather</h3>
                <div className={styles.location}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    Kenya
                </div>
            </div>

            <div className={styles.citiesContainer}>
                {CITIES.map(city => {
                    const data = weatherData[city.name];
                    if (!data) return null;

                    return (
                        <div key={city.name} className={styles.cityCard}>
                            <h4 className={styles.cityName}>{city.name}</h4>
                            <div className={styles.cityTemp}>
                                {Math.round(data.temperature_2m)}°
                            </div>
                            <div className={styles.cityCondition}>
                                <div className={styles.cityIcon}>{getWeatherIcon(data.weather_code)}</div>
                                <div className={styles.cityText}>{getWeatherText(data.weather_code)}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
