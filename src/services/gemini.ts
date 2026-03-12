import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const GEMINI_MODEL = "gemini-3-flash-preview";

export async function generateGlobalAnalysis(schema: Record<string, string[]>) {
  const model = GEMINI_MODEL;
  
  const schemaStr = Object.entries(schema)
    .map(([table, columns]) => `Table "${table}" has columns: ${columns.join(", ")}`)
    .join("\n");
    
  const prompt = `
    You are a Senior Data Architect and Business Intelligence Strategist.
    Analyze the following database schema and provide a "Global Data Strategy" report.
    
    Schema:
    ${schemaStr}
    
    Your report should include:
    1. An overview of what this database likely represents (e.g., Sales, CRM, Inventory).
    2. Potential insights that can be derived from these tables.
    3. Suggested complex queries or correlations the user might be interested in.
    4. A brief "Data Health" assessment based on the column names.
    
    Keep the tone professional, visionary, and helpful.
    Use Markdown for formatting.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text || "Unable to generate global analysis.";
  } catch (error) {
    console.error("Gemini Global Analysis Error:", error);
    return "Global analysis unavailable.";
  }
}

export async function generateStrategicSynthesis(data: any[], query: string, table: string) {
  const model = GEMINI_MODEL;
  
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
  const model = GEMINI_MODEL;
  
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
  const model = GEMINI_MODEL;
  
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

export async function handleGeneralConversation(message: string) {
  const model = GEMINI_MODEL;
  
  const prompt = `
    You are Gemini, a helpful and warm Business Intelligence Assistant.
    The user is engaging in general small talk or greeting you: "${message}"
    Respond warmly, naturally, and professionally. 
    Do not mention databases or data unless relevant to the greeting.
    Keep it concise.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text || "Hello! How can I help you today?";
  } catch (error) {
    console.error("Gemini Conversation Error:", error);
    return "Hello! I'm here to help you analyze your data. What would you like to know?";
  }
}

export async function classifyIntent(query: string) {
  const model = GEMINI_MODEL;
  
  const prompt = `
    Classify the following user query into one of three categories: "DATA_QUERY", "DIRECT_DATA", or "GENERAL_CONVERSATION".
    
    Query: "${query}"
    
    "DATA_QUERY": The user is asking for specific information from a database (e.g., "show me sales", "who are our customers").
    "DIRECT_DATA": The user is providing raw data directly in the prompt or asking for a graph based on specific numbers they just provided (e.g., "Apples: 10, Oranges: 20, make a bar chart", "Plot these values: 10, 50, 30").
    "GENERAL_CONVERSATION": The user is greeting you, saying goodbye, or making general small talk (e.g., "hi", "hello", "how are you").
    
    Output only the category name.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
    });
    const intent = response.text?.trim().toUpperCase();
    if (intent === "DIRECT_DATA") return "DIRECT_DATA";
    if (intent === "GENERAL_CONVERSATION") return "GENERAL_CONVERSATION";
    return "DATA_QUERY";
  } catch (error) {
    console.error("Intent Classification Error:", error);
    return "DATA_QUERY";
  }
}

export async function generateAutoGraphJSON(input: string) {
  const model = GEMINI_MODEL;
  
  const systemInstruction = `
    Role: You are a Business Intelligence Data Engine.
    Task: Convert user input into a Chart.js JSON object optimized for a dark-themed UI.

    Rules:
    1. Always return a valid JSON object.
    2. For line charts, you MUST include 'borderColor', 'backgroundColor', and 'fill: true'.
    3. Use bright, high-contrast colors (like #FF4500 for orange or #00D1FF for cyan).
    4. NO MARKDOWN, NO EXPLANATIONS.

    Required JSON Structure:
    {
      "type": "line",
      "labels": ["2026-01-02", "2026-01-04", "2026-01-06"],
      "datasets": [{
        "label": "Data Series",
        "data": [10, 25, 15],
        "borderColor": "#FF4500",
        "backgroundColor": "rgba(255, 69, 0, 0.2)",
        "borderWidth": 3,
        "tension": 0.4,
        "fill": true
      }]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: input }] }],
      config: { systemInstruction }
    });
    
    // We expect raw JSON based on the system instruction
    return response.text?.trim() || "{}";
  } catch (error) {
    console.error("Auto-Graph JSON Error:", error);
    return JSON.stringify({ error: "Failed to generate graph data" });
  }
}

export async function generateSQL(query: string, schema: Record<string, string[]>) {
  const model = GEMINI_MODEL;
  
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
    7. Map synonyms intelligently: "revenue" or "sales" usually maps to "amount", "cost" or "price" maps to "price" or "unit_cost".
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

export async function generateChartConfig(data: any[], query: string) {
  const model = GEMINI_MODEL;
  
  const dataSnippet = JSON.stringify(data.slice(0, 15));
  const keys = data.length > 0 ? Object.keys(data[0]) : [];
  
  const prompt = `
    You are a Data Visualization Expert.
    Analyze the following data and the user's query: "${query}".
    Suggest the best chart configuration to represent this data.
    
    Data Snippet:
    ${dataSnippet}
    
    Available Keys: ${keys.join(", ")}
    
    Rules:
    1. Choose the most appropriate chart type from: 'bar', 'line', 'pie', 'area'.
    2. Identify the best 'xKey' (categorical, name, or temporal) and 'yKey' (numeric, amount, count).
    3. If the user explicitly asks for specific axes (e.g., "use price as x and revenue as y"), you MUST follow that instruction.
    4. If the user wants to see distribution or counts, use 'count' as the yKey.
    5. If there are multiple numeric columns, pick the most relevant one as yKey.
    6. Output the configuration as JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['bar', 'line', 'pie', 'area', 'none'] },
            xKey: { type: Type.STRING },
            yKey: { type: Type.STRING }
          },
          required: ['type', 'xKey', 'yKey']
        }
      }
    });
    return JSON.parse(response.text || '{"type": "none", "xKey": "", "yKey": ""}');
  } catch (error) {
    console.error("Gemini Chart Config Error:", error);
    return { type: 'none', xKey: '', yKey: '' };
  }
}

export async function generateInitialAnalysis(data: any[], tableName: string) {
  const model = GEMINI_MODEL;
  
  const dataSnippet = JSON.stringify(data.slice(0, 20));
  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  
  const prompt = `
    You are a Strategic Data Analyst.
    A new dataset has been uploaded to the table "${tableName}".
    
    Columns: ${columns.join(", ")}
    Data Snippet:
    ${dataSnippet}
    
    Provide a "First Look" analysis of this data:
    1. What is the primary purpose of this dataset?
    2. What are 3 key metrics or trends that should be monitored?
    3. Suggest a specific question the user should ask to get immediate value.
    
    Keep it professional, insightful, and concise.
    Use Markdown for formatting.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text || "Initial analysis complete. You can now search your data.";
  } catch (error) {
    console.error("Gemini Initial Analysis Error:", error);
    return "Data uploaded successfully. Start searching to explore.";
  }
}

export async function chatWithData(data: any[], message: string) {
  const model = GEMINI_MODEL;
  
  const dataSnippet = JSON.stringify(data.slice(0, 50));
  
  const systemInstruction = `
    You are a helpful Business Intelligence Chatbot. 
    You have access to a dataset (snippet provided below).
    Answer the user's questions accurately based on the data.
    If you don't know the answer or it's not in the data, say so.
    Keep your answers concise and professional.
    
    Data Context:
    ${dataSnippet}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: message }] }],
      config: { systemInstruction }
    });
    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I encountered an error while processing your message.";
  }
}
