/**
 * Event related types
 */

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image?: string;
  max_participants?: number;
  current_participants: number;
  price?: number;
  organizer_id: string;
  created_at: string;
}
