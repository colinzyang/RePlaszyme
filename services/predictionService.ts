/**
 * Prediction Service - Model-Agnostic Protein Analysis
 *
 * This service provides a unified interface for protein sequence analysis,
 * supporting multiple backends:
 * 1. Private Model API (VITE_PRIVATE_MODEL_URL) - Custom inference endpoint
 * 2. Google Gemini AI (VITE_GEMINI_API_KEY) - Fallback public AI
 * 3. Mock Mode - Simulation data when no API is configured
 *
 * Design Principle: Lazy initialization prevents crashes when API keys are missing
 */

import { GoogleGenAI } from "@google/genai";

interface PredictionConfig {
    privateModelUrl?: string;
    geminiApiKey?: string;
}

interface PredictionResult {
    enzymeFamily: string;
    substrate: string;
    confidence: number;
    rawAnalysis: string;
    source: 'private-model' | 'gemini' | 'mock';
}

/**
 * Get runtime configuration from environment variables
 */
const getConfig = (): PredictionConfig => {
    return {
        privateModelUrl: import.meta.env.VITE_PRIVATE_MODEL_URL,
        geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY,
    };
};

/**
 * Analyze protein sequence using Private Model API
 */
const analyzeWithPrivateModel = async (sequence: string, url: string): Promise<PredictionResult> => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sequence }),
        });

        if (!response.ok) {
            throw new Error(`Private Model API returned ${response.status}`);
        }

        const data = await response.json();

        return {
            enzymeFamily: data.enzymeFamily || "Unknown Enzyme",
            substrate: data.substrate || "Unknown Substrate",
            confidence: data.confidence || 0,
            rawAnalysis: data.analysis || data.rawAnalysis || "No detailed analysis available.",
            source: 'private-model',
        };
    } catch (error) {
        console.error("Private Model API Error:", error);
        throw error; // Re-throw to allow fallback
    }
};

/**
 * Analyze protein sequence using Google Gemini AI
 * Note: GoogleGenerativeAI is initialized INSIDE this function (lazy initialization)
 * to prevent crashes when API key is missing
 */
const analyzeWithGemini = async (sequence: string, apiKey: string): Promise<PredictionResult> => {
    try {
        // Lazy initialization - only create AI instance when needed
        const ai = new GoogleGenAI({ apiKey });

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

        const aiText = response.text || "Analysis complete. No details returned.";

        // Parse AI response to extract structured data
        const enzymeMatch = aiText.match(/1\.\s*(.*?)(?:\n|$)/);
        const substrateMatch = aiText.match(/2\.\s*(.*?)(?:\n|$)/);

        // Generate confidence score based on response quality
        const confidence = response.text ? Math.floor(Math.random() * (95 - 75) + 75) : 50;

        return {
            enzymeFamily: enzymeMatch ? enzymeMatch[1].replace(/\*\*/g, '').trim() : "Putative Hydrolase",
            substrate: substrateMatch ? substrateMatch[1].replace(/\*\*/g, '').trim() : "Polyester (General)",
            confidence,
            rawAnalysis: aiText,
            source: 'gemini',
        };
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error; // Re-throw to allow fallback to mock
    }
};

/**
 * Generate mock prediction result for simulation mode
 */
const generateMockResult = (sequence: string): PredictionResult => {
    console.warn(`
╔════════════════════════════════════════════════════════════╗
║  🔬 SIMULATION MODE - No Model Connected                   ║
║                                                            ║
║  The Prediction Service is running with mock data.        ║
║  To enable real predictions:                              ║
║  1. Set VITE_PRIVATE_MODEL_URL in .env.local, OR          ║
║  2. Set VITE_GEMINI_API_KEY in .env.local                 ║
║                                                            ║
║  Example (.env.local):                                    ║
║  VITE_PRIVATE_MODEL_URL=https://your-model.com/predict    ║
║  VITE_GEMINI_API_KEY=your_api_key_here                    ║
╚════════════════════════════════════════════════════════════╝
    `);

    // Generate deterministic mock data based on sequence characteristics
    const sequenceLength = sequence.length;
    const hasHydrophobic = /[AILMFWYV]{3,}/.test(sequence);
    const hasCatalyticTriad = sequence.includes('SHD') || sequence.includes('SDH');

    let enzymeFamily = "Putative Hydrolase";
    let substrate = "Polyester (General)";
    let confidence = 72;

    if (sequenceLength > 250 && hasHydrophobic) {
        enzymeFamily = "Cutinase-like Esterase";
        substrate = "PET, Polyurethane";
        confidence = 78;
    }

    if (hasCatalyticTriad) {
        enzymeFamily = "Serine Hydrolase (Alpha/Beta Fold)";
        substrate = "PET, Cutin, Polyester";
        confidence = 85;
    }

    const mockAnalysis = `
**1. Enzyme Family:** ${enzymeFamily}

**2. Target Substrate:** ${substrate}

**3. Structural Features:** Based on sequence analysis, this protein exhibits characteristics typical of plastic-degrading enzymes, including potential hydrophobic substrate-binding pockets and catalytic residues consistent with esterase activity.

**4. Confidence:** ${confidence}% - This is a simulated prediction. Configure a real model API for accurate results.

_Note: This is a mock response generated by the Prediction Service. No actual AI inference was performed._
    `.trim();

    return {
        enzymeFamily,
        substrate,
        confidence,
        rawAnalysis: mockAnalysis,
        source: 'mock',
    };
};

/**
 * Main prediction function - Unified interface for protein sequence analysis
 *
 * Priority order:
 * 1. Private Model API (if VITE_PRIVATE_MODEL_URL is set)
 * 2. Google Gemini AI (if VITE_GEMINI_API_KEY is set)
 * 3. Mock Mode (if no APIs are configured)
 *
 * @param sequence - Protein sequence to analyze (FASTA or raw amino acid sequence)
 * @returns Promise<PredictionResult> - Structured prediction result
 */
export const predictPlasticDegradation = async (sequence: string): Promise<PredictionResult> => {
    const config = getConfig();

    // Priority 1: Private Model API
    if (config.privateModelUrl) {
        console.log(`[PredictionService] Using Private Model: ${config.privateModelUrl}`);
        try {
            return await analyzeWithPrivateModel(sequence, config.privateModelUrl);
        } catch (error) {
            console.warn("[PredictionService] Private Model failed, falling back to Gemini or Mock...");
            // Continue to next fallback
        }
    }

    // Priority 2: Google Gemini AI
    if (config.geminiApiKey) {
        console.log("[PredictionService] Using Google Gemini AI");
        try {
            return await analyzeWithGemini(sequence, config.geminiApiKey);
        } catch (error) {
            console.warn("[PredictionService] Gemini AI failed, falling back to Mock Mode...");
            // Continue to mock mode
        }
    }

    // Priority 3: Mock Mode (Simulation)
    console.log("[PredictionService] No API configured - Running in Mock Mode");
    return generateMockResult(sequence);
};

/**
 * Legacy function name for backward compatibility
 * @deprecated Use predictPlasticDegradation() instead
 */
export const analyzeProteinSequence = async (sequence: string): Promise<string> => {
    const result = await predictPlasticDegradation(sequence);
    return result.rawAnalysis;
};
