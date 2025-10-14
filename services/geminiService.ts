
import { GoogleGenAI, Type } from "@google/genai";
import type { CalendarEvent, SuggestedSlot } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface UserSchedule {
  userId: string;
  name: string;
  events: CalendarEvent[];
}

const formatDate = (date: Date) => date.toISOString().slice(0, 16).replace('T', ' ');

export async function suggestMeetingTimes(
  schedules: UserSchedule[],
  durationMinutes: number,
  prompt: string,
  weekStartDate: Date
): Promise<SuggestedSlot[]> {

  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 7);

  const scheduleText = schedules.map(schedule => {
    const userEvents = schedule.events
      .filter(event => event.start >= weekStartDate && event.start < weekEndDate)
      .map(event => `- ${formatDate(event.start)} to ${formatDate(event.end)}: ${event.title}`)
      .join('\n');
    return `Schedule for ${schedule.name}:\n${userEvents || 'No events scheduled for this week.'}`;
  }).join('\n\n');

  const fullPrompt = `
    You are an intelligent meeting scheduler. Your task is to find the best time slots for a meeting.
    The meeting should be within the working hours of 9:00 to 17:00 on weekdays.
    All participants must be available for the entire duration.

    Meeting Details:
    - Title: "${prompt}"
    - Duration: ${durationMinutes} minutes

    Date Range for consideration:
    - From: ${weekStartDate.toISOString()}
    - To: ${weekEndDate.toISOString()}

    Participant Schedules:
    ${scheduleText}

    Please suggest 3 optimal time slots for this meeting in the specified date range. Provide the response as a JSON array.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              startTime: {
                type: Type.STRING,
                description: "Start time in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)",
              },
              endTime: {
                type: Type.STRING,
                description: "End time in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)",
              },
              reason: {
                type: Type.STRING,
                description: "A brief reason why this is a good slot, e.g., 'Everyone is free.'"
              }
            },
            required: ["startTime", "endTime"],
          },
        },
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("AI returned an empty response.");
    }

    const suggestions = JSON.parse(jsonText);
    return suggestions as SuggestedSlot[];

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get suggestions from AI. Please check the console for details.");
  }
}
