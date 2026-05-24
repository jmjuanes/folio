import { createContext, useState, useCallback, useEffect, useContext } from "react";
import type { JSX } from "react";

export type AiQuotas = {
    requestsLimit: number | null; // null --> no limit
    requestsUsed: number;
};

export type AiContextValue = {
    host: string;
    quotas: AiQuotas | null; // null --> still loading
    updateQuotas: (partial: Partial<AiQuotas>) => void;
};

export const AiContext = createContext<AiContextValue | null>(null);

// parse quotas from response headers
const parseQuotasFromHeaders = (headers: Headers): AiQuotas => {
    const limit = headers.get("X-Folio-Requests-Limit");
    const used = headers.get("X-Folio-Requests-Used");
    return {
        requestsLimit: limit !== null ? (limit === "null" ? null : Number(limit)) : null,
        requestsUsed: used !== null ? Number(used) : 0,
    };
};

export type UseAi = {
    loading: boolean;
    error: Error | null;
    quotas: AiQuotas | null;
    isQuotaExceeded: boolean;
    isQuotaLoading: boolean;
    generateElements: (prompt: string) => Promise<any[]>;
    transformElements: (prompt: string, elements: any[]) => Promise<any[]>;
};

export const useAi = (): UseAi => {
    const context = useContext(AiContext);
    if (!context) {
        throw new Error("useAi must be used within an AiProvider");
    }
    const { host, quotas, updateQuotas } = context;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const call = useCallback(async (endpoint: string, body: object): Promise<any> => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${host}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });
            // update quotas from response headers regardless of status
            const partialQuotas = parseQuotasFromHeaders(response.headers);
            if (partialQuotas?.requestsLimit !== null && partialQuotas?.requestsUsed > 0) {
                updateQuotas(partialQuotas);
            }
            // 429 = quota exceeded on the server side
            if (response.status === 429) {
                throw new Error("quota_exceeded");
            }
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }
            return await response.json();
        } catch (responseError: any) {
            setError(responseError);
        } finally {
            setLoading(false);
        }
    }, [host, updateQuotas]);

    return {
        loading,
        error,
        quotas,
        isQuotaExceeded: !!quotas && quotas.requestsLimit !== null && quotas.requestsUsed >= quotas.requestsLimit,
        isQuotaLoading: quotas === null,
        generateElements: (prompt) => {
            return call("/_ai/generateElements", { prompt }).then(response => response?.data?.elements ?? []);
        },
        transformElements: (prompt, elements) => {
            return call("/_ai/transformElements", { prompt, elements }).then(response => response?.data?.elements ?? []);
        },
    };
};

export type AiProviderProps = {
    host: string;
    children: React.ReactNode;
};

export const AiProvider = ({ host, children }: AiProviderProps): JSX.Element => {
    const [quotas, setQuotas] = useState<AiQuotas | null>(null);

    const updateQuotas = useCallback((partial: Partial<AiQuotas>) => {
        setQuotas(prev => {
            return Object.assign({}, prev ?? { requestsLimit: null, requestsUsed: 0 }, partial);
        });
    }, [setQuotas]);

    // on mount (or when host changes), fetch initial quotas
    useEffect(() => {
        if (!host) return;
        // setQuotas(null); // reset to loading state
        fetch(`${host}/_ai/quotas`, { method: "POST" })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Quotas request failed: ${response.status}`);
                }
                return response.json();
            })
            .then((response: any) => {
                setQuotas({
                    requestsLimit: response?.data?.requestsLimit ?? null,
                    requestsUsed: response?.data?.requestsUsed ?? 0,
                });
            })
            .catch((error) => {
                console.error(error);
                // if quotas endpoint fails, assume limit is 0 so the user is not blocked
                // but the ai service is not available
                setQuotas({
                    requestsLimit: null,
                    requestsUsed: 0,
                });
            });
    }, [host]);

    return (
        <AiContext.Provider value={{ host, quotas, updateQuotas }}>
            {children}
        </AiContext.Provider>
    );
};
