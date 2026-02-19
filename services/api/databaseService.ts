/**
 * Database Service Layer
 * Provides typed async API for enzyme data fetched from FastAPI backend
 */

import { Enzyme, PlasticType, BlastRequest, BlastResponse } from '@/types';

// API base URL - defaults to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Filter options for querying enzymes
 */
export interface FilterOptions {
    searchTerm?: string;
    plasticTypes?: PlasticType[];
    page?: number;
    limit?: number;
}

/**
 * Paginated response structure
 */
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Database statistics
 */
export interface DatabaseStats {
    totalEnzymes: number;
    totalOrganisms: number;
    totalStructures: number;
    substrates: number;
}

/**
 * Get paginated list of enzymes with optional filtering
 *
 * @param options - Filter and pagination options
 * @returns Paginated enzyme results
 * @throws Error if API request fails
 */
export async function getEnzymes(
    options: FilterOptions = {}
): Promise<PaginatedResult<Enzyme>> {
    const { searchTerm = '', plasticTypes = [], page = 1, limit = 10 } = options;

    // Build query parameters
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });

    if (searchTerm) {
        params.append('search', searchTerm);
    }

    if (plasticTypes.length > 0) {
        plasticTypes.forEach(type => params.append('plastic_types', type));
    }

    try {
        // Fetch from API
        const response = await fetch(`${API_BASE_URL}/api/enzymes?${params}`);

        if (!response.ok) {
            // Distinguish between different error types
            if (response.status === 0) {
                throw new Error('Network error: Unable to reach backend API. Please check if the backend server is running on port 8000.');
            }
            throw new Error(`API Error (${response.status}): ${response.statusText}`);
        }

        return response.json();
    } catch (error) {
        // Handle network errors (CORS, connection refused, etc.)
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            console.error('Network error details:', error);
            throw new Error(`Cannot connect to backend API at ${API_BASE_URL}. Please ensure:\n1. Backend server is running (python3 -m uvicorn main:app --reload)\n2. CORS is properly configured\n3. No firewall is blocking the connection`);
        }
        // Re-throw other errors
        throw error;
    }
}

/**
 * Get a single enzyme by its protein ID
 *
 * @param proteinId - The enzyme's protein ID (e.g., "X0001")
 * @returns Enzyme data or null if not found
 * @throws Error if API request fails (except 404)
 */
export async function getEnzymeById(proteinId: string): Promise<Enzyme | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/enzymes/${proteinId}`);

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            if (response.status === 0) {
                throw new Error('Network error: Unable to reach backend API.');
            }
            throw new Error(`API Error (${response.status}): ${response.statusText}`);
        }

        return response.json();
    } catch (error) {
        // Handle network errors (CORS, connection refused, etc.)
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            console.error('Network error details:', error);
            throw new Error(`Cannot connect to backend API at ${API_BASE_URL}. Please check if the backend server is running.`);
        }
        // Re-throw other errors
        throw error;
    }
}

/**
 * Export all enzymes matching current filters
 *
 * @param options - Filter options (search term and plastic types)
 * @returns All matching enzymes (not paginated)
 * @throws Error if API request fails
 */
export async function exportAllEnzymes(
    options: Pick<FilterOptions, 'searchTerm' | 'plasticTypes'> = {}
): Promise<Enzyme[]> {
    const { searchTerm = '', plasticTypes = [] } = options;

    // Build query parameters
    const params = new URLSearchParams();

    if (searchTerm) {
        params.append('search', searchTerm);
    }

    if (plasticTypes.length > 0) {
        plasticTypes.forEach(type => params.append('plastic_types', type));
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/enzymes/export?${params}`);

        if (!response.ok) {
            if (response.status === 0) {
                throw new Error('Network error: Unable to reach backend API.');
            }
            throw new Error(`API Error (${response.status}): ${response.statusText}`);
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            console.error('Network error details:', error);
            throw new Error(`Cannot connect to backend API at ${API_BASE_URL}`);
        }
        throw error;
    }
}

/**
 * Get database statistics
 *
 * @returns Database stats including enzyme count, organism count, structures, and substrates
 * @throws Error if API request fails
 */
export async function getDatabaseStats(): Promise<DatabaseStats> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/stats`);

        if (!response.ok) {
            if (response.status === 0) {
                throw new Error('Network error: Unable to reach backend API. Please check if the backend server is running on port 8000.');
            }
            throw new Error(`API Error (${response.status}): ${response.statusText}`);
        }

        return response.json();
    } catch (error) {
        // Handle network errors (CORS, connection refused, etc.)
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            console.error('Network error details:', error);
            throw new Error(`Cannot connect to backend API at ${API_BASE_URL}. Please ensure:\n1. Backend server is running (python3 -m uvicorn main:app --reload)\n2. CORS is properly configured\n3. No firewall is blocking the connection`);
        }
        // Re-throw other errors
        throw error;
    }
}

/**
 * Perform BLAST sequence alignment against the database
 *
 * @param request - BLAST request with sequence and parameters
 * @returns BLAST response with alignment hits
 * @throws Error if API request fails
 */
export async function blastSearch(request: BlastRequest): Promise<BlastResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/blast`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sequence: request.sequence,
                max_results: request.max_results ?? 100,
                similarity_threshold: request.similarity_threshold ?? '30',
                plastic_types: request.plastic_types ?? null,
                require_structure: request.require_structure ?? false,
            }),
        });

        if (!response.ok) {
            if (response.status === 0) {
                throw new Error('Network error: Unable to reach backend API.');
            }

            // Try to get error detail from response
            let errorDetail = response.statusText;
            try {
                const errorData = await response.json();
                errorDetail = errorData.detail || errorDetail;
            } catch {
                // Ignore JSON parse errors
            }

            throw new Error(`API Error (${response.status}): ${errorDetail}`);
        }

        return response.json();
    } catch (error) {
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            console.error('Network error details:', error);
            throw new Error(`Cannot connect to backend API at ${API_BASE_URL}. Please check if the backend server is running.`);
        }
        throw error;
    }
}
