import { QueryClient } from "@tanstack/react-query";

let sessionId = "";
try {
  sessionId = localStorage.getItem("hd_session_id") || "";
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem("hd_session_id", sessionId);
  }
} catch (e) {
  sessionId = "fallback-" + Math.random().toString(36).substring(2, 8);
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        return await apiRequest("GET", queryKey[0] as string);
      },
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export async function apiRequest(method: string, url: string, data?: any) {
  const headers: Record<string, string> = {
    "x-session-id": sessionId
  };
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API call failed");
  }

  if (res.status === 204) return null;
  return res.json();
}
