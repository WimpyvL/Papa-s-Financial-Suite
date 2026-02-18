import { GoogleGenAI } from "@google/genai";
import { Transaction, Product, Invoice } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialInsight = async (
  query: string,
  data: { transactions: Transaction[], products: Product[], invoices: Invoice[] }
): Promise<string> => {
  try {
    // We summarize the data to avoid token limits if the dataset is large in a real app.
    // For this demo, we pass a simplified version.
    const contextData = {
      totalRevenue: data.transactions
        .filter(t => t.type === 'SALE' || t.type === 'INVOICE_PAYMENT')
        .reduce((sum, t) => sum + t.amount, 0),
      totalExpenses: data.transactions
        .filter(t => t.type === 'EXPENSE' || t.type === 'RESTOCK')
        .reduce((sum, t) => sum + t.amount, 0),
      recentTransactions: data.transactions.slice(0, 20),
      lowStockAlerts: data.products.filter(p => p.stock < 10).map(p => p.name),
      pendingInvoices: data.invoices.filter(i => i.status === 'SENT').length
    };

    const prompt = `
      You are a senior financial analyst for a signage and printing company called "Papa's Signs".
      The currency used is ZAR (South African Rand), symbol 'R'.
      Here is the current financial snapshot JSON:
      \`\`\`json
      ${JSON.stringify(contextData, null, 2)}
      \`\`\`

      User Query: "${query}"

      Provide a concise, professional, and actionable response. If the data suggests a problem (like low stock or high expenses), point it out.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "I couldn't generate an insight at this moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I am currently unable to analyze the financial data. Please check your API configuration.";
  }
};

export const parseInvoiceData = async (rawText: string): Promise<string> => {
    try {
        const prompt = `
            Extract invoice details from this raw text and format it as a JSON object with keys: customerName, items (array of name, quantity, price), total.
            The currency is ZAR.
            Raw text: "${rawText}"
        `;
         const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        return response.text || "{}";
    } catch (e) {
        console.error(e);
        return "{}";
    }
}