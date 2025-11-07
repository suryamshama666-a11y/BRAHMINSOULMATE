import React from 'react';
import Footer from '@/components/Footer';
import { useVDates } from '@/features/vdates/useVDates';
import { VDateScheduler } from '@/features/vdates/VDateScheduler';
import { VDateInvitations } from '@/features/vdates/VDateInvitations';
import { VDateHistory } from '@/features/vdates/VDateHistory';
import { VDatePageHeader } from '@/features/vdates/components/VDatePageHeader';
import { VDateStats } from '@/features/vdates/components/VDateStats';
import { VDateTabs } from '@/features/vdates/components/VDateTabs';
import { UpcomingVDates } from '@/features/vdates/components/UpcomingVDates';
import { VDateTips } from '@/features/vdates/components/VDateTips';

const Schedule = () => {
  const {
    upcomingVDates,
    pastVDates,
    pendingInvitations,
    sentInvitations,
    selectedDate,
    selectedTime,
    selectedTemplate,
    vdateTemplates,
    profiles,
    setSelectedDate,
    setSelectedTime,
    setSelectedTemplate,
    scheduleVDate,
    acceptInvitation,
    declineInvitation,
    cancelVDate,
    joinVDate,
    submitFeedback,
    getAvailableTimeSlots
  } = useVDates();

  const availableTimeSlots = selectedDate ? getAvailableTimeSlots(selectedDate) : [];

  return (
    <div className="min-h-screen flex flex-col bg-orange-50/30">
      <main className="flex-grow container mx-auto px-4 py-8">
        <VDatePageHeader />
        
        <VDateStats
          upcomingCount={upcomingVDates.length}
          pendingCount={pendingInvitations.length}
          completedCount={pastVDates.filter(v => v.status === 'completed').length}
          totalCount={upcomingVDates.length + pastVDates.length}
        />

        <VDateTabs
          upcomingCount={upcomingVDates.length}
          pendingInvitationsCount={pendingInvitations.length}
          pastCount={pastVDates.length}
        >
          <div className="space-y-6">
            <UpcomingVDates
              upcomingVDates={upcomingVDates}
              profiles={profiles}
              onJoinVDate={joinVDate}
              onCancelVDate={cancelVDate}
            />
            <VDateTips />
          </div>

          <VDateScheduler
            profiles={profiles}
            templates={vdateTemplates}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            selectedTemplate={selectedTemplate}
            availableTimeSlots={availableTimeSlots}
            onDateSelect={setSelectedDate}
            onTimeSelect={setSelectedTime}
            onTemplateSelect={setSelectedTemplate}
            onSchedule={scheduleVDate}
          />

          <VDateInvitations
            pendingInvitations={pendingInvitations}
            sentInvitations={sentInvitations}
            profiles={profiles}
            onAccept={acceptInvitation}
            onDecline={declineInvitation}
          />

          <VDateHistory
            pastVDates={pastVDates}
            profiles={profiles}
            currentUserId="user-1"
            onSubmitFeedback={submitFeedback}
          />
        </VDateTabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Schedule;
