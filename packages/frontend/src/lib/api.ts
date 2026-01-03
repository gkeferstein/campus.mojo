class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// Get API URL dynamically - use relative URL on client (works for both dev and prod)
function getApiUrl(): string {
  // In development, use the full API URL from env
  // In production, use relative URL which works with Next.js rewrites
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (typeof window !== 'undefined') {
    // Client-side: use full URL if set and in development, otherwise relative
    if (apiUrl && process.env.NODE_ENV === 'development') {
      return apiUrl;
    }
    // Use relative URL (works with Next.js rewrites)
    return '/api';
  }
  
  // Server-side: use env variable or default
  return apiUrl || 'http://localhost:3003';
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

// ============================================
// B2C LEBENSENERGIE API Types & Functions
// ============================================

// Check-in Types
export interface CheckInData {
  energyLevel: number;
  sleepQuality: number;
  moodLevel: number;
  energyGivers: string[];
  energyDrainers: string[];
  notes?: string;
}

export interface CheckInResponse {
  id: string;
  energyLevel: number;
  sleepQuality: number;
  moodLevel: number;
  energyGivers: string[];
  energyDrainers: string[];
  lebensenergieScore: number;
  notes: string | null;
  checkedInAt: string;
}

export interface CheckInResult {
  checkIn: CheckInResponse;
  newBadges: string[];
}

export interface TodayCheckInResponse {
  hasCheckedIn: boolean;
  checkIn: CheckInResponse | null;
  streak: number;
}

export interface CheckInHistoryResponse {
  checkIns: CheckInResponse[];
  stats: {
    totalCheckIns: number;
    avgScore: number;
    maxScore: number;
    minScore: number;
    streak: number;
  };
  weeklyData: {
    day: string;
    score: number | null;
    date: string;
  }[];
}

// Journey Types
export interface JourneyResponse {
  journey: {
    state: string;
    currentLevel: number;
    checkInsCompleted: number;
    modulesCompleted: number;
    daysActive: number;
    streak: number;
    trend: number;
    subscriptionTier: string | null;
    isTrialActive: boolean;
    trialDaysLeft: number | null;
  };
  featureAccess: {
    dashboard: boolean;
    modules: 'none' | 'first' | 'basis' | 'all';
    community: 'none' | 'read' | 'read_write' | 'full';
    tracker: 'none' | 'basic' | 'advanced';
    workshops: boolean;
    circles: boolean;
    mentoring: boolean;
  };
  nextLevel: {
    level: number;
    checkInsRequired: number;
    modulesRequired: number;
    progress: number;
  } | null;
  badges: {
    slug: string;
    earnedAt: string;
  }[];
  stats: {
    totalCheckIns: number;
    avgScore: number;
  };
}

export interface BadgesResponse {
  earned: {
    slug: string;
    name: string;
    description: string;
    earnedAt: string;
  }[];
  available: {
    slug: string;
    name: string;
    description: string;
  }[];
  total: number;
  earnedCount: number;
}

// Check-in API Functions
export const checkInApi = {
  // Submit a new check-in
  create: (data: CheckInData, token: string) =>
    api.post<CheckInResult>('/checkin', data, token),

  // Get today's check-in status
  getToday: (token: string) =>
    api.get<TodayCheckInResponse>('/checkin/today', token),

  // Get check-in history
  getHistory: (token: string, days = 30) =>
    api.get<CheckInHistoryResponse>(`/checkin/history?days=${days}`, token),
};

// Journey API Functions
export const journeyApi = {
  // Get current journey state
  get: (token: string) =>
    api.get<JourneyResponse>('/journey', token),

  // Start trial
  startTrial: (token: string) =>
    api.post<{ message: string; trialStartedAt: string; trialEndsAt: string; daysLeft: number }>(
      '/journey/trial/start',
      {},
      token
    ),

  // Get badges
  getBadges: (token: string) =>
    api.get<BadgesResponse>('/journey/badges', token),
};

export { ApiError };






