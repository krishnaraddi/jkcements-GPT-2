export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
}

export enum Persona {
  OPERATOR = 'Operator',
  MANAGER = 'Manager',
  SUSTAINABILITY_LEAD = 'Sustainability Lead',
}

export interface Source {
  uri: string;
  title: string;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie';
  title: string;
  data: {
    labels: string[];
    datasets: ChartDataset[];
  };
}

export interface ChatMessage {
  role: MessageRole;
  content: string;
  sources?: Source[];
  chartData?: ChartData;
}