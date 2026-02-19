
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Instant results for the most common global cities
const POPULAR_CITIES = [
  { city: "New York", country: "USA", timezone: "America/New_York" },
  { city: "London", country: "UK", timezone: "Europe/London" },
  { city: "Tokyo", country: "Japan", timezone: "Asia/Tokyo" },
  { city: "Paris", country: "France", timezone: "Europe/Paris" },
  { city: "Mumbai", country: "India", timezone: "Asia/Kolkata" },
  { city: "Delhi", country: "India", timezone: "Asia/Kolkata" },
  { city: "Bengaluru", country: "India", timezone: "Asia/Kolkata" },
  { city: "Dubai", country: "UAE", timezone: "Asia/Dubai" },
  { city: "Singapore", country: "Singapore", timezone: "Asia/Singapore" },
  { city: "Sydney", country: "Australia", timezone: "Australia/Sydney" },
  { city: "Berlin", country: "Germany", timezone: "Europe/Berlin" },
  { city: "San Francisco", country: "USA", timezone: "America/Los_Angeles" },
  { city: "Los Angeles", country: "USA", timezone: "America/Los_Angeles" },
  { city: "Chicago", country: "USA", timezone: "America/Chicago" },
  { city: "Toronto", country: "Canada", timezone: "America/Toronto" },
  { city: "Hong Kong", country: "China", timezone: "Asia/Hong_Kong" },
  { city: "Seoul", country: "South Korea", timezone: "Asia/Seoul" },
  { city: "Bangkok", country: "Thailand", timezone: "Asia/Bangkok" },
  { city: "Istanbul", country: "Turkey", timezone: "Europe/Istanbul" },
  { city: "Mexico City", country: "Mexico", timezone: "America/Mexico_City" },
  { city: "Sao Paulo", country: "Brazil", timezone: "America/Sao_Paulo" },
  { city: "Johannesburg", country: "South Africa", timezone: "Africa/Johannesburg" },
  { city: "Moscow", country: "Russia", timezone: "Europe/Moscow" },
  { city: "Madrid", country: "Spain", timezone: "Europe/Madrid" },
  { city: "Rome", country: "Italy", timezone: "Europe/Rome" },
  { city: "Amsterdam", country: "Netherlands", timezone: "Europe/Amsterdam" }
];

const queryCache = new Map<string, any[]>();

/**
 * Parses a natural language time query.
 */
export const parseTimeQuery = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Parse this natural language time request: "${query}". Return the target time (ISO string) and the city/timezone mentioned.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            time: { type: Type.STRING, description: "ISO 8601 formatted datetime string" },
            city: { type: Type.STRING, description: "Target city name" },
            timezone: { type: Type.STRING, description: "IANA Timezone ID if identifiable" },
            explanation: { type: Type.STRING }
          },
          required: ["time", "city"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

/**
 * Provides a "Fortune Cookie" wisdom based on time and global themes.
 */
export const getFortune = async () => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate a short, punchy, and modern 'Fortune Cookie' style piece of wisdom. It should be mysterious, encouraging, and related to time, travel, or global synchronicity. Maximum 20 words.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fortune: { type: Type.STRING },
            lucky_numbers: { type: Type.ARRAY, items: { type: Type.INTEGER } }
          },
          required: ["fortune", "lucky_numbers"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Fortune Error:", error);
    return { fortune: "The clock is ticking in your favor.", lucky_numbers: [7, 12, 24, 60] };
  }
};

/**
 * Resolves a specific location to its official IANA details.
 */
export const resolveCityDetails = async (locationName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find the official IANA timezone for: "${locationName}". Return city, timezone, and country.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            city: { type: Type.STRING },
            timezone: { type: Type.STRING },
            country: { type: Type.STRING }
          },
          required: ["city", "timezone"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Resolution Error:", error);
    return null;
  }
};

/**
 * Provides autocomplete suggestions for city names.
 * Optimized with local lookup and caching for extreme speed.
 */
export const getCitySuggestions = async (partialName: string) => {
  const query = partialName.trim().toLowerCase();
  if (!query) return [];

  // 1. Instant Cache Check
  if (queryCache.has(query)) {
    return queryCache.get(query);
  }

  // 2. Instant Local Popular Check
  const localMatches = POPULAR_CITIES.filter(c => 
    c.city.toLowerCase().includes(query) || 
    c.country.toLowerCase().includes(query)
  ).slice(0, 5);

  // If we have enough local matches, return them immediately to keep UI snappy
  // We still trigger the API call in the background if it's a short query to get more results
  if (localMatches.length >= 3) {
    return localMatches;
  }

  // 3. API Fallback for Long Tail
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide 5 popular city suggestions matching: "${partialName}". Return a JSON array of objects with city name, country, and IANA timezone.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              city: { type: Type.STRING },
              country: { type: Type.STRING },
              timezone: { type: Type.STRING }
            },
            required: ["city", "timezone", "country"]
          }
        }
      }
    });
    
    const results = JSON.parse(response.text);
    
    // Merge with local matches for unique results
    const combined = [...localMatches];
    results.forEach((r: any) => {
      if (!combined.some(c => c.timezone === r.timezone && c.city.toLowerCase() === r.city.toLowerCase())) {
        combined.push(r);
      }
    });

    const finalResults = combined.slice(0, 5);
    queryCache.set(query, finalResults);
    return finalResults;
  } catch (error) {
    console.error("Suggestions Error:", error);
    return localMatches; // Fail gracefully with local matches
  }
};
