import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeProteinSequence = async (sequence: string): Promise<string> => {
    if (!ai) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(`**Simulated Analysis:**\n\nBased on the input sequence, this protein exhibits high similarity (98%) to **IsPETase** from *Ideonella sakaiensis*.\n\n**Predicted Function:** Hydrolysis of Polyethylene terephthalate (PET) into MHET and EG.\n\n**Structural Features:** Contains a canonical alpha/beta hydrolase fold with a surface-exposed catalytic triad (Ser-His-Asp).`);
            }, 1500);
        });
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `You are a bioinformatics expert specializing in plastic-degrading enzymes. Analyze the following protein sequence/query: "${sequence}". 
            
            Identify if it resembles known plastic-degrading enzymes (like PETase, Cutinase, Alkane Hydroxylase, etc.).
            Provide:
            1. Likely Enzyme Name/Family
            2. Target Plastic Substrate (e.g., PET, PE, PUR)
            3. Key structural features or active sites if inferable.
            4. A brief confidence assessment.
            
            Keep the response concise (under 100 words).`,
        });
        return response.text || "Analysis complete. No details returned.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Error analyzing sequence. Please check your network connection.";
    }
};
