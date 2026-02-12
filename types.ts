export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface MarketAnalysisData {
  topCountries: ChartDataPoint[];
  competitors: string[];
  suggestedAction: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        reviewText: string;
      }[];
    };
  };
}

export interface AnalysisResult {
  markdownReport: string;
  structuredData: MarketAnalysisData | null;
  groundingChunks: GroundingChunk[];
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}