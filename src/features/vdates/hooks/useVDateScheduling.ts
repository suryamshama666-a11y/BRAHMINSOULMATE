
import { useState } from 'react';
import { VDateTemplate, UserAvailability } from '@/types/vdates';
import { vdateTemplates, defaultAvailability } from '@/data/vdatesData';

export const useVDateScheduling = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<VDateTemplate | null>(null);
  const [availability] = useState<UserAvailability>(defaultAvailability);

  const getAvailableTimeSlots = (date: Date) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const daySchedule = availability.weeklySchedule[dayName];
    
    if (!daySchedule?.available) return [];
    
    const dateString = date.toISOString().split('T')[0];
    if (availability.blackoutDates.includes(dateString)) return [];
    
    return daySchedule.timeSlots;
  };

  const resetSelection = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedTemplate(null);
  };

  return {
    selectedDate,
    selectedTime,
    selectedTemplate,
    vdateTemplates,
    setSelectedDate,
    setSelectedTime,
    setSelectedTemplate,
    getAvailableTimeSlots,
    resetSelection
  };
};
