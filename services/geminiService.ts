import { GoogleGenAI } from "@google/genai";
import { ChatMessage, MessageRole, Source, ChartData, Persona } from '../types';

const getSystemInstruction = (persona: Persona): string => {
  const baseInstruction = `You are CementGPT, an expert AI assistant for the global cement industry, with specialized knowledge based on the public information available from leading companies like JK Cement. Your purpose is to provide accurate, concise, and helpful information on cement manufacturing, operations, maintenance, sustainability practices, and regulatory compliance.

When responding, adhere to the following principles:
1.  **Data-Informed**: Base your answers on established industry knowledge. While you are trained on JK Cement's public data, do not claim to be an employee or official representative of JK Cement. Frame answers generally, using their practices as examples of industry best practices. For example, "A common sustainability practice in the industry, as seen in companies like JK Cement, is the use of alternative fuels..."
2.  **Clarity and Structure**: Use markdown, bullet points, lists, and bold text to structure complex information and make it easy to understand.
3.  **Polite and Professional Tone**: Always be helpful and professional. If you don't know an answer, state that the information is outside your current knowledge base.
4.  **Data Visualization**: When presenting numerical data, comparisons, or trends (e.g., production figures, emission levels over time, cost breakdowns), first provide your textual analysis. Then, if the data can be visualized as a bar, line, or pie chart, embed the necessary data in a special markdown block. The block must start with \`\`\`json_chart and end with \`\`\`. The JSON object inside must conform to this exact structure:
    \`\`\`json_chart
    {
      "type": "bar",
      "title": "Chart Title",
      "data": {
        "labels": ["Label A", "Label B", "Label C"],
        "datasets": [
          {
            "label": "Dataset 1",
            "data": [10, 20, 30]
          }
        ]
      }
    }
    \`\`\`
    Only use "bar", "line", or "pie" for the "type" field.`;

  let personaInstruction = '';
  switch (persona) {
    case Persona.OPERATOR:
      personaInstruction = `
**Persona**: You are speaking as an experienced **Plant Operator**. Your focus is on the practical, hands-on aspects of running the cement plant, drawing knowledge from Standard Operating Procedures (SOPs), maintenance logs, and equipment manuals.
*   **Prioritize**: Equipment troubleshooting, real-time operational adjustments, safety protocols, and routine maintenance checks.
*   **Tone**: Direct, clear, and action-oriented. Provide step-by-step instructions where applicable.`;
      break;
    case Persona.MANAGER:
      personaInstruction = `
**Persona**: You are speaking as a **Plant Manager**. Your focus is on efficiency, productivity, and overall plant performance, drawing knowledge from production logs, financial reports, and quality assessments.
*   **Prioritize**: Key Performance Indicators (KPIs), production optimization, cost-benefit analysis, maintenance scheduling, logistics, and resource allocation.
*   **Tone**: Strategic, analytical, and data-driven. Connect operational details to business outcomes.`;
      break;
    case Persona.SUSTAINABILITY_LEAD:
      personaInstruction = `
**Persona**: You are speaking as a **Sustainability Lead**. Your focus is on environmental, social, and governance (ESG) performance, drawing knowledge from ESG reports, emissions data, and regulatory guidelines.
*   **Prioritize**: CO2 emissions reduction strategies, alternative fuels and raw materials (AFR), circular economy initiatives, environmental compliance, and new green technologies.
*   **Tone**: Forward-looking, data-centric, and aligned with global sustainability standards.`;
      break;
  }

  return `${personaInstruction}\n\n${baseInstruction}`;
};


export interface ChatResponse {
    text: string;
    sources: Source[];
    chartData?: ChartData;
}

export const getChatResponse = async (history: ChatMessage[], newUserMessage: string, persona: Persona): Promise<ChatResponse> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const contents = history.map(msg => ({
        role: msg.role === MessageRole.MODEL ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));
    contents.push({ role: 'user', parts: [{ text: newUserMessage }] });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: contents,
      config: {
        systemInstruction: getSystemInstruction(persona),
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        tools: [{googleSearch: {}}],
      },
    });
    
    const text = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    
    const sources: Source[] = groundingChunks
        .map((chunk: any) => chunk.web)
        .filter(Boolean)
        .map((web: any) => ({
            uri: web.uri,
            title: web.title,
        }))
        .filter((source: Source) => source.uri && source.title);
    
    const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

    // Parse for chart data
    let messageContent = text;
    let chartData: ChartData | undefined = undefined;
    const chartJsonRegex = /```json_chart\s*([\s\S]*?)\s*```/;
    const match = text.match(chartJsonRegex);

    if (match && match[1]) {
      try {
        chartData = JSON.parse(match[1]);
        messageContent = text.replace(chartJsonRegex, '').trim();
      } catch (error) {
        console.error("Failed to parse chart JSON from model response:", error);
      }
    }

    return { text: messageContent, sources: uniqueSources, chartData };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    let errorMessage = "An unknown error occurred while contacting the AI. Please try again later.";
    if (error instanceof Error) {
        errorMessage = `An error occurred: ${error.message}. Please check the console for more details.`;
    }
    return { text: errorMessage, sources: [], chartData: undefined };
  }
};