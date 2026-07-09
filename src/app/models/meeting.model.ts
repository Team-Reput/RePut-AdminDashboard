export interface Meeting {
  id?: string;
  userId?: number;
  title: string;
  project: string;
  date: string;
  time: string;
  minutesOfMeeting: string;
  attendees: string[];
  recordingLength?: string;
  filesCount: number;
}
