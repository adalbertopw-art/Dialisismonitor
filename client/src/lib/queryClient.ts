import { QueryClient } from "@tanstack/react-query";

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
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API call failed");
  }

  if (res.status === 204) return null;
  return res.json();
}
