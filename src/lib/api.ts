const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FetchOptions extends RequestInit {
  token?: string | null;
}

export const apiRequest = async (
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> => {
  const { token, ...fetchOptions } = options;
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    return response;
  } catch (error) {
    console.error("API Request Error:", error);
    throw new Error("Network error. Please check your connection and try again.");
  }
};

export const apiGet = async (endpoint: string, token?: string | null) => {
  const response = await apiRequest(endpoint, {
    method: "GET",
    token,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const apiPost = async (endpoint: string, data: any, token?: string | null) => {
  const response = await apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const apiPut = async (endpoint: string, data: any, token?: string | null) => {
  const response = await apiRequest(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
    token,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const apiDelete = async (endpoint: string, token?: string | null) => {
  const response = await apiRequest(endpoint, {
    method: "DELETE",
    token,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

