import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useGetAllWorkers } from "../hooks/useQueries";
import { getBookedDatesForWorker } from "../lib/constants";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function BookingCalendar() {
  const { workerId } = useParams({ from: "/booking-calendar/$workerId" });
  const navigate = useNavigate();

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  const { data: workers } = useGetAllWorkers();
  const worker = workers?.find((w) => w.id.toString() === workerId);

  const bookedDates = getBookedDatesForWorker(workerId);
  const bookedSet = new Set(bookedDates);

  const todayStr = today.toISOString().split("T")[0];

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  // Build calendar grid
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function dateStr(day: number): string {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${viewYear}-${mm}-${dd}`;
  }

  const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div data-ocid="booking_calendar.page" className="page-container">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-display font-black">📅 Booking Calendar</h1>
        {worker && (
          <p className="text-sm text-muted-foreground mt-1">
            {worker.name} · {worker.category}
          </p>
        )}
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4 bg-card border border-border rounded-2xl p-3">
        <Button
          data-ocid="booking_calendar.prev_button"
          variant="outline"
          size="sm"
          onClick={prevMonth}
          className="w-10 h-10 p-0 rounded-xl"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <p className="font-display font-black text-lg">
            {MONTH_NAMES[viewMonth]}
          </p>
          <p className="text-xs text-muted-foreground">{viewYear}</p>
        </div>
        <Button
          data-ocid="booking_calendar.next_button"
          variant="outline"
          size="sm"
          onClick={nextMonth}
          className="w-10 h-10 p-0 rounded-xl"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden mb-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {DAYS_OF_WEEK.map((d) => (
            <div
              key={d}
              className="text-center text-xs font-bold text-muted-foreground py-2"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, _unused) => {
            const cellKey = day === null ? `empty-${_unused}` : `day-${day}`;
            if (!day) {
              return (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: calendar cells are positional by design
                  key={cellKey}
                  className="min-h-[52px] border-b border-r border-border/50 bg-muted/20"
                />
              );
            }

            const ds = dateStr(day);
            const isBooked = bookedSet.has(ds);
            const isPast = ds < todayStr;
            const isToday = ds === todayStr;
            const cellIdx = day;

            let cellClass =
              "min-h-[52px] border-b border-r border-border/50 flex flex-col items-center justify-center gap-0.5 p-1 text-center ";
            let dayClass = "text-sm font-bold ";
            let labelEl: React.ReactNode = null;

            if (isPast && !isToday) {
              cellClass += "bg-muted/30";
              dayClass += "text-muted-foreground";
              labelEl = (
                <span className="text-[9px] text-muted-foreground">Past</span>
              );
            } else if (isBooked) {
              cellClass += "bg-red-100";
              dayClass += "text-red-700";
              labelEl = (
                <span className="text-[9px] font-bold text-red-600">
                  Booked
                </span>
              );
            } else {
              cellClass += "bg-green-50 hover:bg-green-100 transition-colors";
              dayClass += isToday
                ? "text-white bg-green-600 rounded-full w-7 h-7 flex items-center justify-center"
                : "text-green-800";
              labelEl = (
                <span className="text-[9px] font-bold text-green-600">
                  Free
                </span>
              );
            }

            return (
              <div
                key={ds}
                data-ocid={`booking_calendar.day.${cellIdx}`}
                className={cellClass}
              >
                <span className={dayClass}>{day}</span>
                {labelEl}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mb-6 text-xs font-semibold">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-green-100 border border-green-300" />
          Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-red-100 border border-red-300" />
          Booked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-muted/30 border border-border" />
          Past
        </span>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-green-700">
            {
              cells.filter((d) => {
                if (!d) return false;
                const ds = dateStr(d);
                return !bookedSet.has(ds) && ds >= todayStr;
              }).length
            }
          </p>
          <p className="text-xs text-green-700 font-semibold mt-0.5">
            Free Days
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-red-700">
            {
              cells.filter((d) => {
                if (!d) return false;
                return bookedSet.has(dateStr(d));
              }).length
            }
          </p>
          <p className="text-xs text-red-700 font-semibold mt-0.5">
            Booked Days
          </p>
        </div>
      </div>

      {/* Book CTA */}
      <Button
        className="w-full h-12 font-bold text-base"
        onClick={() => navigate({ to: "/find-worker" })}
      >
        📅 Book This Worker
      </Button>
    </div>
  );
}
