import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateStrategicSynthesis(data: any[], query: string, table: string) {
  const model = "gemini-3-flash-preview";
  
  const dataSnippet = JSON.stringify(data.slice(0, 20)); // Send a snippet of data
  
  const prompt = `
    You are a Strategic Business Analyst. 
    Analyze the following data from the table "${table}" based on the user's query: "${query}".
    
    Data Snippet (first 20 rows):
    ${dataSnippet}
    
    Total records found: ${data.length}
    
    Provide a "Strategic Synthesis" which is a high-level, insightful, and actionable summary of the data. 
    Focus on trends, anomalies, or strategic opportunities. 
    Keep it concise (2-4 sentences).
    Output only the synthesis text.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text || "Unable to generate synthesis at this time.";
  } catch (error) {
    console.error("Gemini Synthesis Error:", error);
    return "Strategic synthesis unavailable due to an error.";
  }
}

export async function generateFollowUpQuestions(data: any[], query: string, table: string) {
  const model = "gemini-3-flash-preview";
  
  const dataSnippet = JSON.stringify(data.slice(0, 10));
  
  const prompt = `
    You are a Business Intelligence Assistant.
    Based on the user's query "${query}" and the data from table "${table}", suggest 3 relevant follow-up questions that would help the user explore the data deeper.
    
    Data Snippet:
    ${dataSnippet}
    
    Output the questions as a JSON array of strings.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    const text = response.text;
    return JSON.parse(text || "[]");
  } catch (error) {
    console.error("Gemini Follow-up Error:", error);
    return ["Tell me more about this data", "What are the key trends?", "Show me a detailed breakdown"];
  }
}

export async function answerFollowUp(data: any[], question: string, table: string) {
  const model = "gemini-3-flash-preview";
  
  const dataSnippet = JSON.stringify(data.slice(0, 30));
  
  const prompt = `
    You are a Business Intelligence Assistant.
    Answer the following follow-up question: "${question}"
    Use the data from table "${table}" to provide a specific and accurate answer.
    
    Data Snippet:
    ${dataSnippet}
    
    Total records in context: ${data.length}
    
    Provide a clear, data-driven answer. If the data snippet isn't enough to be certain, mention that based on the sample provided.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text || "I'm sorry, I couldn't generate an answer.";
  } catch (error) {
    console.error("Gemini Answer Error:", error);
    return "Error generating answer.";
  }
}

export async function generateSQL(query: string, schema: Record<string, string[]>) {
  const model = "gemini-3-flash-preview";
  
  const schemaStr = Object.entries(schema)
    .map(([table, columns]) => `Table "${table}" has columns: ${columns.join(", ")}`)
    .join("\n");
    
  const prompt = `
    You are an expert SQL analyst. 
    Convert the following natural language query into a valid SQLite query: "${query}"
    
    Database Schema:
    ${schemaStr}
    
    Rules:
    1. Only output the SQL query.
    2. Use double quotes for table and column names.
    3. Always include a LIMIT 100 if not specified.
    4. If the query is just a table name, return "SELECT * FROM [table] LIMIT 100".
    5. If you cannot determine the table, return "SELECT * FROM [first_table] LIMIT 100".
    6. Ensure the SQL is compatible with SQLite.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
    });
    let sql = response.text || "";
    // Clean up markdown if present
    sql = sql.replace(/```sql/g, "").replace(/```/g, "").trim();
    return sql;
  } catch (error) {
    console.error("Gemini SQL Error:", error);
    return "";
  }
}
