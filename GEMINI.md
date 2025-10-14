# GEMINI.md

## Project Overview

This is a web-based meeting scheduler application that helps users find optimal meeting times. It uses React for the frontend, Vite for the build tool, and TypeScript for type safety. The application integrates with Google Calendar and uses the Gemini AI to suggest meeting times based on participants' schedules.

**Key Technologies:**

*   **Frontend:** React, TypeScript
*   **Build Tool:** Vite
*   **AI:** Google Gemini
*   **Calendar:** Google Calendar (simulated)

**Architecture:**

The application is structured into several components:

*   `App.tsx`: The main application component that manages state and orchestrates the other components.
*   `components/`: Contains reusable UI components like `CalendarView`, `UserSelection`, and `CreateMeetingModal`.
*   `services/`: Contains services for interacting with external APIs, including `geminiService.ts` for the Gemini AI and `googleCalendarService.ts` for Google Calendar.
*   `constants.ts`: Defines constants used throughout the application, such as the list of users and mock event data.
*   `types.ts`: Contains TypeScript type definitions for the application's data structures.

## Building and Running

**Prerequisites:**

*   Node.js

**Commands:**

*   **Install dependencies:**
    ```bash
    npm install
    ```
*   **Set the `GEMINI_API_KEY`:**
    Create a `.env.local` file in the root of the project and add the following line:
    ```
    GEMINI_API_KEY=your_gemini_api_key
    ```
*   **Run the app:**
    ```bash
    npm run dev
    ```
*   **Build the app:**
    ```bash
    npm run build
    ```
*   **Preview the build:**
    ```bash
    npm run preview
    ```

## Development Conventions

*   **Coding Style:** The project uses TypeScript and follows standard React conventions.
*   **Testing:** There are no explicit testing practices defined in the project.
*   **Contribution:** There are no explicit contribution guidelines defined in the project.
