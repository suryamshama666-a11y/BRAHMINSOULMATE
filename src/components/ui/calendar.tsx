
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, CaptionProps, useNavigation } from "react-day-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function CustomCaption(props: CaptionProps) {
  const { displayMonth } = props;
  const { goToMonth } = useNavigation();
  
  const currentYear = displayMonth.getFullYear();
  const currentMonth = displayMonth.getMonth();
  
  // Generate years from 1950 to current year + 10
  const years = Array.from({ length: new Date().getFullYear() - 1950 + 11 }, (_, i) => 1950 + i);
  
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleYearChange = (year: string) => {
    const newDate = new Date(parseInt(year), currentMonth);
    goToMonth(newDate);
  };

  const handleMonthChange = (month: string) => {
    const newDate = new Date(currentYear, parseInt(month));
    goToMonth(newDate);
  };

  return (
    <div className="flex justify-center items-center gap-2 py-2">
      <Select value={currentMonth.toString()} onValueChange={handleMonthChange}>
        <SelectTrigger className="w-32 h-8 text-sm bg-white border border-gray-200">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
          {months.map((month, index) => (
            <SelectItem key={month} value={index.toString()} className="bg-white hover:bg-gray-100 text-black">
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={currentYear.toString()} onValueChange={handleYearChange}>
        <SelectTrigger className="w-20 h-8 text-sm bg-white border border-gray-200">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-60 bg-white border border-gray-200 shadow-lg z-50">
          {years.reverse().map((year) => (
            <SelectItem key={year} value={year.toString()} className="bg-white hover:bg-gray-100 text-black">
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-white border border-gray-200 rounded-lg shadow-lg", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-black",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-white p-0 opacity-70 hover:opacity-100 border border-gray-200"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-gray-600 rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-black hover:bg-gray-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground font-semibold text-black",
        day_outside:
          "day-outside text-gray-400 opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-gray-400 opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4 text-black" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4 text-black" />,
        Caption: CustomCaption,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
