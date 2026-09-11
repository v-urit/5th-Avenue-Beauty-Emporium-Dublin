"use client"

import * as React from "react"
import { DayPicker, getDefaultClassNames } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 bg-card rounded-2xl border border-border/80 shadow-md select-none", className)}
      classNames={{
        root: `${defaultClassNames.root} w-full max-w-sm mx-auto`,
        months: "relative flex flex-col sm:flex-row gap-4",
        month: "w-full space-y-4",
        month_caption: "flex justify-center items-center relative pt-1 pb-2",
        caption_label: "text-sm font-serif font-semibold text-foreground tracking-wide",
        nav: "flex items-center justify-between w-full absolute top-1 inset-x-0 px-1 pointer-events-none",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-background/80 hover:bg-muted p-0 rounded-lg text-muted-foreground hover:text-foreground pointer-events-auto border-border shadow-xs"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-background/80 hover:bg-muted p-0 rounded-lg text-muted-foreground hover:text-foreground pointer-events-auto border-border shadow-xs"
        ),
        month_grid: "w-full border-collapse space-y-1 mt-2",
        weekdays: "flex justify-between w-full mb-1",
        weekday: "text-muted-foreground rounded-md w-9 font-medium text-[0.75rem] text-center uppercase tracking-wider",
        week: "flex justify-between w-full mt-1.5",
        day: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal rounded-xl hover:bg-primary/15 hover:text-primary transition-all duration-150 aria-selected:opacity-100"
        ),
        selected: "[&>.rdp-day_button]:!bg-primary [&>.rdp-day_button]:!text-primary-foreground [&>.rdp-day_button]:!font-semibold [&>.rdp-day_button]:shadow-md [&>.rdp-day_button]:shadow-primary/30 [&>.rdp-day_button]:scale-105",
        today: "[&>.rdp-day_button]:border-2 [&>.rdp-day_button]:border-primary/50 [&>.rdp-day_button]:font-bold",
        outside: "text-muted-foreground/30 opacity-40 pointer-events-none",
        disabled: "text-muted-foreground/25 opacity-25 cursor-not-allowed pointer-events-none line-through",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
