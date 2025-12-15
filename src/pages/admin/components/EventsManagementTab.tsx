import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar, MapPin, Users, Plus, Pencil, Trash2, Eye, Loader2 } from 'lucide-react';
import { eventsService, Event } from '@/services/api/events.service';
import { useToast } from '@/hooks/use-toast';

interface EventFormData {
  title: string;
  description: string;
  event_date: string;
  location: string;
  capacity: number;
  image_url?: string;
}

const initialFormData: EventFormData = {
  title: '',
  description: '',
  event_date: '',
  location: '',
  capacity: 50,
  image_url: ''
};

export function EventsManagementTab() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [formData, setFormData] = useState<EventFormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await eventsService.getUpcomingEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([
        {
          id: '1',
          title: "Matrimony Meet & Greet",
          event_date: "2025-03-15T10:00:00",
          location: "The Grand Hotel, Mumbai",
          description: "Join us for a day of meaningful connections.",
          capacity: 150,
          participant_count: 45,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: "Virtual Matchmaking Session",
          event_date: "2025-03-20T18:00:00",
          location: "Online (Zoom)",
          description: "A curated virtual event.",
          capacity: 100,
          participant_count: 32,
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedEvent(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      event_date: event.event_date.slice(0, 16),
      location: event.location,
      capacity: event.capacity,
      image_url: event.image_url || ''
    });
    setIsDialogOpen(true);
  };

  const handleViewParticipants = async (event: Event) => {
    setSelectedEvent(event);
    try {
      const data = await eventsService.getEventParticipants(event.id);
      setParticipants(data);
    } catch (error) {
      setParticipants([]);
    }
    setIsParticipantsOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.event_date || !formData.location) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      if (selectedEvent) {
        await eventsService.updateEvent(selectedEvent.id, formData);
        toast({ title: 'Success', description: 'Event updated successfully' });
      } else {
        await eventsService.createEvent(formData);
        toast({ title: 'Success', description: 'Event created successfully' });
      }
      setIsDialogOpen(false);
      await loadEvents();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save event', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    setDeleting(eventId);
    try {
      await eventsService.deleteEvent(eventId);
      toast({ title: 'Deleted', description: 'Event deleted successfully' });
      await loadEvents();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete event', variant: 'destructive' });
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#E30613]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Events Management
          </CardTitle>
          <Button onClick={handleOpenCreate} style={{ backgroundColor: '#E30613' }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{formatDate(event.event_date)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      {event.location}
                    </div>
                  </TableCell>
                  <TableCell>{event.capacity}</TableCell>
                  <TableCell>
                    <Badge variant={event.participant_count! >= event.capacity ? "destructive" : "secondary"}>
                      {event.participant_count || 0}/{event.capacity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleViewParticipants(event)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(event)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleDelete(event.id)}
                        disabled={deleting === event.id}
                      >
                        {deleting === event.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-red-500" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {events.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No events found. Create your first event!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Event title"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Event description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Date & Time *</label>
                <Input
                  type="datetime-local"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Capacity *</label>
                <Input
                  type="number"
                  min={1}
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 50 })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Location *</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Venue or 'Online (Zoom)'"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Image URL</label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving} style={{ backgroundColor: '#E30613' }}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {selectedEvent ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isParticipantsOpen} onOpenChange={setIsParticipantsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participants - {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {participants.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {participants.map((p, idx) => (
                  <div key={p.id || idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {p.user?.profile_picture ? (
                        <img src={p.user.profile_picture} alt="" className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <Users className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{p.user?.full_name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{p.user?.email}</p>
                    </div>
                    <Badge variant="outline">
                      {new Date(p.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No participants registered yet</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
