export interface BinState {
  id: string;
  name: string;
  location: string;
  capacityLitres: number;
  heightCm: number;
  currentTrashDistanceCm: number; // HC-SR04 reading
  temperature: number; // DHT11 simulated
  humidity: number; // DHT11 simulated
  gasPpm: number; // MQ-135 simulated
  isOnline: boolean;
  fillRatePerMin: number; // Rate at which it fills up in simulator
  lastClearedAt: string;
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  binId: string;
  binName: string;
  distanceCm: number;
  fillPercent: number;
  temperature: number;
  humidity: number;
  gasPpm: number;
  status: 'Empty' | 'Half-Full' | 'Alighting' | 'Critical Full';
  alertSent: boolean;
}

export interface DispatchTask {
  id: string;
  binId: string;
  binName: string;
  fillPercent: number;
  priority: 'Low' | 'Medium' | 'High' | 'Emergency';
  status: 'Pending' | 'En Route' | 'Completed';
  estimatedTimeToFullMins: number;
}
