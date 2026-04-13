
import { VDate, VDateInvitation } from '@/types/vdates';
import { toast } from 'sonner';

export const useVDateActions = (
  vdates: VDate[],
  setVDates: React.Dispatch<React.SetStateAction<VDate[]>>,
  invitations: VDateInvitation[],
  setInvitations: React.Dispatch<React.SetStateAction<VDateInvitation[]>>
) => {
  const currentUserId = 'user-1';

  const acceptInvitation = (invitationId: string) => {
    setInvitations(prev => 
      prev.map(inv => 
        inv.id === invitationId 
          ? { ...inv, status: 'accepted', respondedAt: new Date() }
          : inv
      )
    );

    const invitation = invitations.find(inv => inv.id === invitationId);
    if (invitation) {
      setVDates(prev => 
        prev.map(vdate => 
          vdate.id === invitation.vdateId 
            ? { ...vdate, status: 'confirmed', meetingLink: `https://meet.brahminmatrimony.com/room/${vdate.id}` }
            : vdate
        )
      );
      toast.success('V-Date invitation accepted!');
    }
  };

  const declineInvitation = (invitationId: string) => {
    setInvitations(prev => 
      prev.map(inv => 
        inv.id === invitationId 
          ? { ...inv, status: 'declined', respondedAt: new Date() }
          : inv
      )
    );

    const invitation = invitations.find(inv => inv.id === invitationId);
    if (invitation) {
      setVDates(prev => 
        prev.map(vdate => 
          vdate.id === invitation.vdateId 
            ? { ...vdate, status: 'rejected' }
            : vdate
        )
      );
      toast.info('V-Date invitation declined');
    }
  };

  const cancelVDate = (vdateId: string) => {
    setVDates(prev => 
      prev.map(vdate => 
        vdate.id === vdateId 
          ? { ...vdate, status: 'cancelled', updatedAt: new Date() }
          : vdate
      )
    );
    toast.info('V-Date cancelled');
  };

  const joinVDate = (vdateId: string) => {
    const vdate = vdates.find(v => v.id === vdateId);
    if (vdate?.meetingLink) {
      window.open(vdate.meetingLink, '_blank');
    } else {
      toast.error('Meeting link not available');
    }
  };

  const submitFeedback = (vdateId: string, rating: number, comment: string, wouldMeetAgain: boolean) => {
    const feedback = {
      userId: currentUserId,
      rating,
      comment,
      connectionQuality: 'good' as const,
      wouldMeetAgain,
      submittedAt: new Date()
    };

    setVDates(prev => 
      prev.map(vdate => 
        vdate.id === vdateId 
          ? { 
              ...vdate, 
              feedback: [...(vdate.feedback || []), feedback],
              status: 'completed' as const
            }
          : vdate
      )
    );
    toast.success('Thank you for your feedback!');
  };

  return {
    acceptInvitation,
    declineInvitation,
    cancelVDate,
    joinVDate,
    submitFeedback
  };
};
