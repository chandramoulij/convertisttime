
export interface Location {
  id: string;
  name: string;
  timezone: string;
  countryCode?: string;
  coords?: { x: number; y: number }; // Percentage 0-100 for SVG map
}

export interface TimeState {
  baseTime: Date;
  offsetMinutes: number;
}

export enum TimeDisplayMode {
  Analog = 'analog',
  Digital = 'digital'
}

export enum AppView {
  Timeline = 'timeline',
  Planner = 'planner',
  Widgets = 'widgets',
  Calculator = 'calculator',
  Countdown = 'countdown',
  Fortune = 'fortune'
}
