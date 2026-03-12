# Vintage AI - Conversational Business Intelligence

Vintage AI is a full-stack application that turns your data into decisions through natural language. Upload CSV files, ask questions, and get instant insights with automatic visualizations.

## Features

- **Conversational BI**: Ask questions in plain English.
- **CSV Upload**: Import your own data easily.
- **Automatic Visualizations**: Bar charts, line charts, and pie charts generated automatically.
- **Speech-to-Text**: Ask questions using your voice.
- **Export**: Download query results as JSON.

## Tech Stack

- **Frontend**: React, Tailwind CSS, Lucide React, Recharts, Framer Motion.
- **Backend**: Node.js, Express, SQLite (better-sqlite3).
- **AI**: Google Gemini API via `@google/genai`.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)
- A Google Gemini API Key (get one at [aistudio.google.com](https://aistudio.google.com/app/apikey))

## Getting Started

1. **Clone the repository** (or extract the ZIP file).
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up environment variables**:
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
4. **Run the development server**:
   ```bash
   npm run dev
   ```
5. **Open your browser**:
   Navigate to `http://localhost:3000`.

## Scripts

- `npm run dev`: Starts the development server (Express + Vite).
- `npm run build`: Builds the frontend for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Checks for TypeScript errors.

## Database

The application uses a local SQLite database (`analytics.db`). It is automatically created and managed by the backend.

## License

MIT
