
import { useState, useEffect } from 'react';
import { VDate, VDateInvitation, VDateTemplate } from '@/types/vdates';
import { mockVDates, mockInvitations } from '@/data/vdatesData';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useVDateScheduling } from './hooks/useVDateScheduling';
import { useVDateActions } from './hooks/useVDateActions';

export const useVDates = () => {
  const [vdates, setVDates] = useState<VDate[]>(mockVDates);
  const [invitations, setInvitations] = useState<VDateInvitation[]>(mockInvitations);
  
  const profiles = getAllProfiles();
  const currentUserId = 'user-1';

  // Use smaller focused hooks
  const scheduling = useVDateScheduling();
  const actions = useVDateActions(vdates, setVDates, invitations, setInvitations);

  // Computed values
  const upcomingVDates = vdates.filter(vdate => {
    const vdateDateTime = new Date(`${vdate.date}T${vdate.time}`);
    return vdateDateTime > new Date() && (vdate.status === 'confirmed' || vdate.status === 'pending');
  }).sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

  const pastVDates = vdates.filter(vdate => {
    const vdateDateTime = new Date(`${vdate.date}T${vdate.time}`);
    return vdateDateTime <= new Date() || vdate.status === 'completed';
  }).sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());

  const pendingInvitations = invitations.filter(inv => 
    inv.status === 'sent' && inv.toUserId === currentUserId
  );

  const sentInvitations = invitations.filter(inv => 
    inv.status === 'sent' && inv.fromUserId === currentUserId
  );

  // Schedule a new V-Date
  const scheduleVDate = (profileId: string, template: VDateTemplate, message?: string) => {
    if (!scheduling.selectedDate || !scheduling.selectedTime) {
      toast.error('Please select date and time');
      return;
    }

    const newVDate: VDate = {
      id: `vdate-${Date.now()}`,
      participantIds: [currentUserId, profileId],
      initiatorId: currentUserId,
      date: scheduling.selectedDate.toISOString().split('T')[0],
      time: scheduling.selectedTime,
      type: template.type,
      status: 'pending',
      title: template.name,
      description: template.description,
      duration: template.duration,
      createdAt: new Date(),
      updatedAt: new Date(),
      reminderSent: false
    };

    const newInvitation: VDateInvitation = {
      id: `inv-${Date.now()}`,
      fromUserId: currentUserId,
      toUserId: profileId,
      vdateId: newVDate.id,
      message,
      status: 'sent',
      createdAt: new Date()
    };

    setVDates(prev => [...prev, newVDate]);
    setInvitations(prev => [...prev, newInvitation]);
    
    toast.success('V-Date invitation sent successfully!');
    scheduling.resetSelection();
  };

  return {
    vdates,
    upcomingVDates,
    pastVDates,
    invitations,
    pendingInvitations,
    sentInvitations,
    profiles,
    ...scheduling,
    ...actions,
    scheduleVDate
  };
};
