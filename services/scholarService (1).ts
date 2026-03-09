import type { User } from '../types';
import { API_BASE_URL } from '../constants';
export interface CitationData {
  year: number;
  [userId: string]: number;
}
// npm run dev
// python server/main.py
// ssh DMC_admin@192.168.10.3 -p 22
// ssh DMC_admin@195.136.68.185 -p 22
// python3.9 server/main.py
// cd C:\projects\meeting-scheduler

// const API_BASE_URL = 'http://195.136.68.185:8000';

/**
 * Fetches real citation data for a user from the Python bridge.
 */
export const fetchCitationsForUser = async (scholarID: string): Promise<Record<string, number>> => {
  if (!scholarID || scholarID === 'None') return {};
  
  try {
    const response = await fetch(`${API_BASE_URL}/citations/${scholarID}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch citations for ${scholarID}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching citations for ${scholarID}:`, error);
    return {};
  }
};

/**
 * Combines citation data for multiple users into the format required by Recharts.
 */
export const getCitationDataForUsers = async (users: User[]): Promise<CitationData[]> => {
  const usersWithID = users.filter(u => u.scholarID && u.scholarID !== 'None');
  
  if (usersWithID.length === 0) return [];

  const results = await Promise.all(
    usersWithID.map(async (user) => {
      const citations = await fetchCitationsForUser(user.scholarID!);
      return { userId: user.id, citations };
    })
  );

  // Get all unique years
  const allYears = new Set<number>();
  results.forEach(res => {
    Object.keys(res.citations).forEach(year => allYears.add(parseInt(year)));
  });

  const sortedYears = Array.from(allYears).sort((a, b) => a - b);
  
  // Create data points for each year
  const data: CitationData[] = sortedYears.map(year => {
    const dataPoint: CitationData = { year };
    results.forEach(res => {
      if (res.citations[year]) {
        dataPoint[res.userId] = res.citations[year];
      } else {
        // Fallback or 0? 0 is better for charts
        dataPoint[res.userId] = 0;
      }
    });
    return dataPoint;
  });

  return data;
};

/**
 * Legacy mock generator (keep for fallback or testing)
 */
// export const getMockCitationDataForUsers = (users: User[]): CitationData[] => {
//   const currentYear = new Date().getFullYear();
//   const startYear = currentYear - 10;
//   const data: CitationData[] = [];

//   for (let year = startYear; year <= currentYear; year++) {
//     const dataPoint: CitationData = { year };
    
//     users.forEach(user => {
//       if (user.scholarID && user.scholarID !== 'None') {
//         const hash = user.scholarID.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
//         const baseCitations = (hash % 50) + 10;
//         const growth = (year - startYear) * (hash % 20 + 5);
//         const seasonal = Math.sin((year + hash) * 0.5) * 10;
        
//         dataPoint[user.id] = Math.max(0, Math.floor(baseCitations + growth + seasonal));
//       }
//     });
    
//     data.push(dataPoint);
//   }

//   return data;
// };
