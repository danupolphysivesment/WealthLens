export interface AnalyzeInput {
  value: number;
  equity: number;
  fixed_income: number;
  alternatives: number;
  age: number;
  horizon_years: number;
  tolerance: number;
  liquidity: "Low" | "Medium" | "High";
}

export interface Weights { Equity: number; "Fixed Income": number; Alternatives: number; }

export interface RebalanceRow {
  asset: string; current: number; target: number; drift: number;
  dollars: number; action: "Buy" | "Sell" | "Hold";
}

export interface StressRow {
  name: string; icon: string; desc: string;
  shocks: Record<string, number>;
  currentImpact: number; targetImpact: number; valueAfter: number;
  recoveryMonths: number; contribs: Record<string, number>;
}

export interface FanPoint {
  t: number; date: string; p5: number; p25: number; p50: number; p75: number; p95: number;
}

export interface HorizonBlock {
  horizon: string; median: number; p5: number; p25: number; p75: number; p95: number;
  chanceGain: number; chanceLoss: number; hist: { x: number; n: number }[];
}

export interface ActionItem {
  priority: "high" | "medium" | "low"; icon: string; page: string;
  title: string; body: string; cta: string;
}

export interface Analysis {
  input: AnalyzeInput;
  profile: string; score: number; profileBlurb: string;
  current: { weights: Weights; mu: number; vol: number };
  target: { weights: Weights; mu: number; vol: number };
  drift: Record<string, number>;
  maxDrift: number;
  rebalance: RebalanceRow[];
  horizonSummary: { current: { horizon: string; p5: number; p25: number; p50: number; p75: number; p95: number; chanceLoss: number }[] };
  stress: StressRow[];
  future: {
    current: { fan: { band: FanPoint[]; samples: number[][]; dates: string[] }; horizons: HorizonBlock[] };
    target: { fan: { band: FanPoint[]; samples: number[][]; dates: string[] }; horizons: HorizonBlock[] };
  };
  track: {
    dates: string[]; currentGrowth: number[]; targetGrowth: number[]; drawdown: number[];
    annual: { year: number; current: number; target: number }[];
    metrics: { current: Record<string, number>; target: Record<string, number> };
  };
  learn: {
    diversification: { date: string; equity: number; balanced: number }[];
    lossByHorizon: { horizon: string; chanceLoss: number }[];
    drawdownAnatomy: {
      series: { date: string; v: number }[];
      peak: { date: string; v: number };
      trough: { date: string; v: number; depth: number };
      recovered: { date: string; v: number } | null;
    };
  };
  actions: ActionItem[];
  meta: { dataSource: string; asOf: string; colors: Record<string, string>; assets: string[] };
}

export interface Meta {
  assets: string[];
  colors: Record<string, string>;
  proxies: Record<string, string>;
  dataSource: string; asOf: string; dataStart: string;
  assetStats: { asset: string; expectedReturn: number; volatility: number; proxy: string; color: string }[];
  profiles: Record<string, Weights>;
}

export interface Lesson {
  id: string; icon: string; title: string; minutes: number; level: string; summary: string;
}
export interface QuizQ { q: string; options: string[]; answer: number; explain: string; }
export interface Badge { id: string; icon: string; title: string; desc: string; cond: string; }

export interface Content {
  assetCards: { icon: string; key: string; title: string; body: string }[];
  bigIdeas: { icon: string; title: string; body: string }[];
  glossary: { term: string; meaning: string }[];
  lessons: Lesson[];
  lessonBodies: Record<string, string[]>;
  quizzes: Record<string, QuizQ[]>;
  badges: Badge[];
}

export interface AuthUser { id: number; email: string; name: string; }

export interface Progress {
  completedLessons: string[];
  quizScores: Record<string, number>; // lessonId -> 0..1 best score
  streak: number;
  lastActive: string; // YYYY-MM-DD
}

export const COLORS = {
  Equity: "#1F2A44",
  "Fixed Income": "#5E8C6A",
  Alternatives: "#B0894F",
  Portfolio: "#3E6E8E",
  Recommended: "#9C5A6B",
  purple: "#1F2A44",
  blue: "#3E6E8E",
  green: "#5E8C6A",
  amber: "#B0894F",
  pink: "#9C5A6B",
  coral: "#B5654A",
  ink: "#1B2030",
  muted: "#71747E",
} as const;
