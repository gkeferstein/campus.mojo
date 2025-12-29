class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// Get API URL dynamically - use relative URL on client (works for both dev and prod)
function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side: use relative URL (same origin)
    return '/api';
  }
  // Server-side: use env variable
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers as Record<string, string>,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new ApiError(response.status, error.error || "Request failed");
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string, token?: string) =>
    request<T>(endpoint, { method: "GET" }, token),

  post: <T>(endpoint: string, data: unknown, token?: string) =>
    request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  patch: <T>(endpoint: string, data: unknown, token?: string) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, token),

  delete: <T>(endpoint: string, token?: string) =>
    request<T>(endpoint, { method: "DELETE" }, token),
};

export { ApiError };






