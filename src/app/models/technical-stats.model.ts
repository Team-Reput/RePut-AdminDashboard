export interface TechnicalStats {
  activeUsers: number;
  activeUsersChange: string;
  apiHits: number;
  apiSuccessRate: number;
  apiLatency: number;
  slaBound: number;
  networkTrafficUp: number;
  networkTrafficDown: number;
}

export interface LatencyChartData {
  categories: string[];
  series: Array<{
    name: string;
    data: number[];
    color: string;
    yAxis: number;
  }>;
}

export interface ScopeChartData {
  series: Array<{
    name: string;
    data: Array<{
      name: string;
      y: number;
      color: string;
    }>;
  }>;
}
