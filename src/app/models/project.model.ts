export interface Project {
  id?: string; // Optional since DB creates it, but present on output
  name: string;
  client: string;
  clientContact?: string;
  parentProject?: string;
  startDate?: string;
  deadline?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'progress' | 'accepted' | 'completed' | 'hold' | 'cancelled';
  progress: number;
  teamMembers: string[];
  description?: string;
}
