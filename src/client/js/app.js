// Main object to hold trip data with placeholder values
const tripData = {
    destination: '',
    coordinates: { lat: 0, lng: 0 },
    country: '',
    weather: { temp: 0, description: 'Unknown' },
    image: 'default_image_url',
    startDate: '',
    endDate: '',
    tripLength: 0,
    daysUntilTrip: 0
  };
  
  // Configuration for API keys and URLs
  const API_CONFIG = {
    geoNames: {
      baseUrl: 'http://api.geonames.org/searchJSON',
      username: 'ayham0',
    },
    weatherBit: {
      baseUrl: 'https://api.weatherbit.io/v2.0/forecast/daily',
      apiKey: '4f26d4c232dc4060be3787d99408f4d2'
    },
    pixabay: {
      baseUrl: 'https://pixabay.com/api/',
      apiKey: '45783699-b3a2807813756b27a647c69a3'
    }
  };
  
  // Function to retrieve geographic coordinates and country name based on a location
  const getGeoCoordinates = async (destination) => {
    const geoResponse = await fetch(`${API_CONFIG.geoNames.baseUrl}?q=${destination}&maxRows=1&username=${API_CONFIG.geoNames.username}`);
    if (!geoResponse.ok) {
      throw new Error(`GeoNames API encountered an issue: ${geoResponse.status}`);
    }
    const geoData = await geoResponse.json();
    if (geoData.geonames && geoData.geonames.length > 0) {
      const { lat, lng, countryName } = geoData.geonames[0];
      return { lat, lng, countryName };
    } else {
      throw new Error('Destination not found');
    }
  };
  
  // Function to fetch the weather forecast for a specific set of coordinates
  const getWeatherForecast = async (latitude, longitude) => {
    const weatherResponse = await fetch(`${API_CONFIG.weatherBit.baseUrl}?lat=${latitude}&lon=${longitude}&key=${API_CONFIG.weatherBit.apiKey}`);
    const weatherData = await weatherResponse.json();
    return weatherData;
  };
  
  // Function to fetch an image for a given destination using the Pixabay API
  const getImageForLocation = async (destination) => {
    const imageResponse = await fetch(`${API_CONFIG.pixabay.baseUrl}?key=${API_CONFIG.pixabay.apiKey}&q=${encodeURIComponent(destination)}&image_type=photo`);
    const imageData = await imageResponse.json();
    if (imageData.hits.length > 0) {
      return imageData.hits[0].webformatURL;
    } else {
      return 'default_image_url';
    }
  };
  
  // Function to calculate the number of days until the trip starts
  const calculateDaysUntilTrip = (tripStartDate) => {
    const tripDate = new Date(tripStartDate);
    const currentDate = new Date();
    const timeDifference = tripDate - currentDate;
    const daysUntilTrip = Math.ceil(timeDifference / (1000 * 3600 * 24));
    return daysUntilTrip;
  };
  
  // Function to calculate the duration of the trip in days
  function calculateTripLength(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDifference = end.getTime() - start.getTime();
    const dayDifference = timeDifference / (1000 * 3600 * 24);
    return Math.round(dayDifference) - 1;
  }
  
  // Function to display trip details in the UI
  const renderTripDetails = (geoCoordinates, weatherForecast, locationImage, start, end, tripLength) => {
    const tripDetailsContainer = document.getElementById('trip-info');
    const daysUntilTrip = calculateDaysUntilTrip(start);
  
    tripDetailsContainer.innerHTML = `
      <h2>Journey to ${geoCoordinates.countryName}</h2>
      <img src="${locationImage}" alt="${geoCoordinates.countryName}" class="trip-img">
      <p>Departure Date: ${start}</p>
      <p>Return Date: ${end}</p>
      <p>Days until departure: ${daysUntilTrip}</p>
      <p>Trip Length: ${tripLength} days</p>
      <p>Weather Forecast: ${weatherForecast.data[0].temp}°C, ${weatherForecast.data[0].weather.description}</p>
    `;
  };
  
  // Primary function to fetch all trip data and update tripData object
  const fetchTripData = async (destination, startDate, endDate) => {
    try {
      // Fetching coordinates and country
      const geoData = await getGeoCoordinates(destination);
      tripData.destination = destination;
      tripData.coordinates = { lat: geoData.lat, lng: geoData.lng };
      tripData.country = geoData.countryName;
  
      // Fetching weather data
      const weatherData = await getWeatherForecast(geoData.lat, geoData.lng);
      tripData.weather = {
        temp: weatherData.data[0].temp,
        description: weatherData.data[0].weather.description
      };
  
      // Fetching image data
      const imageData = await getImageForLocation(destination);
      tripData.image = imageData;
  
      // Calculating trip length and days until trip
      tripData.startDate = startDate;
      tripData.endDate = endDate;
      tripData.tripLength = calculateTripLength(startDate, endDate);
      tripData.daysUntilTrip = calculateDaysUntilTrip(startDate);
  
      // Render trip details
      renderTripDetails(geoData, weatherData, imageData, startDate, endDate, tripData.tripLength);
    } catch (error) {
      console.error('An error occurred while fetching trip data:', error);
      alert('Failed to retrieve trip details. Please check your input and try again later.');
    }
  };
  
  // Exporting primary function for use in index.js
  export { fetchTripData };
  