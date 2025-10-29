import React, { useMemo } from 'react';
import type { CalendarEvent, User } from '../types';

interface CalendarViewProps {
  events: CalendarEvent[];
  users: User[];
  startDate: Date;
  setStartDate: React.Dispatch<React.SetStateAction<Date>>;
}

const WEEK_DAYS = ['PON.', 'WT.', 'ŚR.', 'CZW.', 'PT.', 'SOB.', 'NIEDZ.'];
const HOURS = Array.from({ length: 14}, (_, i) => 6 + i); // 6 AM to 6 PM (18:00)

const usersById = (users: User[]) => users.reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
}, {} as Record<string, User>);

interface ProcessedEvent extends CalendarEvent {
  layout: {
    top: number;
    height: number;
    left: number;
    width: number;
  };
}

const toYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const EventCard: React.FC<{ event: ProcessedEvent; user?: User }> = ({ event, user }) => {
  // Use green color for confirmed meetings, otherwise use user color or default
  const userColor = event.userId === 'confirmed-meeting'
    ? 'bg-green-600'
    : user?.color || 'bg-fuchsia-600';
  const timeFormat = new Intl.DateTimeFormat('pl-PL', { hour: '2-digit', minute: '2-digit' });

   // Handle all-day events (check if it's a full day event spanning from midnight to midnight)
   // Also check for events that end at 23:59 (without seconds) or are multi-day
  const startDate = new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate());
  const endDate = new Date(event.end.getFullYear(), event.end.getMonth(), event.end.getDate());

  const isAllDay = (event.start.getHours() === 0 && event.start.getMinutes() === 0 &&
                    (event.end.getHours() === 23 && event.end.getMinutes() === 59)) ||
                    // Multi-day events (end date is after start date)
                    (endDate > startDate);

  console.log(`EventCard rendering: "${event.title}" - All-day: ${isAllDay}, Color: ${userColor}`);

  if (isAllDay) {
    console.log(`RENDERING ALL-DAY EVENT: ${event.title} at position top:${event.layout.top}rem`);
    return (
      <div
        className={`absolute p-1 rounded-md text-xs font-semibold text-white ${userColor}/80 z-20 border border-white border-opacity-30`}
        style={{
          top: `${event.layout.top}rem`,
          height: `${event.layout.height}rem`,
          left: `${event.layout.left}%`,
          width: `calc(${event.layout.width}% - 2px)`,
        }}
      >
        📅 {event.title}
      </div>
    );
  }

  return (
    <div
      className={`absolute p-1 rounded-md text-xs text-gray-200 ${userColor}/80 overflow-hidden z-10 background-image-[%linear-gradient(105deg,rgb(0 249 255 / 100%) 39%, rgb(51 56 57 / 100%) 96%);%]`}
      style={{
        top: `${event.layout.top / 16}rem`,
        height: `${event.layout.height / 16}rem`,
        left: `${event.layout.left}%`,
        width: `calc(${event.layout.width}% - 1px)`,
        minHeight: '2rem',
      }}
    >
      <p className="font-bold">{event.title}</p>
      <p>{timeFormat.format(event.start)} - {timeFormat.format(event.end)}</p>
      {user && <p className="text-gray-200 text-[10px]">{user.name}</p>}
    </div>
  );
};

const processTimedEventsForLayout = (timedEvents: CalendarEvent[]): ProcessedEvent[] => {
    if (timedEvents.length === 0) return [];

    // Sort events by start time, then by duration (longer events first)
    const sortedEvents = timedEvents.sort((a, b) => {
        if (a.start.getTime() !== b.start.getTime()) {
            return a.start.getTime() - b.start.getTime();
        }
        return b.end.getTime() - a.end.getTime();
    });

    // This will hold the layout information for each event
    const layoutInfo: { event: CalendarEvent, col: number, totalCols: number }[] = [];

    for (const event of sortedEvents) {
        const overlapping = layoutInfo.filter(
            e => e.event.end.getTime() > event.start.getTime() && e.event.start.getTime() < event.end.getTime()
        );

        const usedCols = new Set(overlapping.map(e => e.col));

        let currentCol = 0;
        while (usedCols.has(currentCol)) {
            currentCol++;
        }

        const newEntry = { event, col: currentCol, totalCols: 1 };
        layoutInfo.push(newEntry);

        const allInvolved = [...overlapping, newEntry];
        const maxCols = allInvolved.reduce((max, e) => Math.max(max, e.col + 1), 0);

        allInvolved.forEach(e => {
            e.totalCols = Math.max(e.totalCols, maxCols);
        });
    }

    return layoutInfo.map(({ event, col, totalCols }) => {
        const startHour = event.start.getHours() + event.start.getMinutes() / 60;
        const endHour = event.end.getHours() + event.end.getMinutes() / 60;

        if (startHour >= 19 || endHour <= 6) return null;

        return {
            ...event,
            layout: {
                top: (startHour - 6) * 4 * 14,
                height: (endHour - startHour) * 4 * 14,
                left: (100 / totalCols) * col,
                width: 100 / totalCols,
            },
        };
    }).filter((e): e is ProcessedEvent => e !== null);
};

const processAllDayEventsForLayout = (allDayEvents: CalendarEvent[]): ProcessedEvent[] => {
    if (allDayEvents.length === 0) return [];

    // Sort all-day events by start time
    const sortedEvents = allDayEvents.sort((a, b) => a.start.getTime() - b.start.getTime());

    // Group overlapping all-day events
    const collisionGroups: CalendarEvent[][] = [];
    if (sortedEvents.length > 0) {
        collisionGroups.push([sortedEvents[0]]);
        for (let i = 1; i < sortedEvents.length; i++) {
            const event = sortedEvents[i];
            const lastGroup = collisionGroups[collisionGroups.length - 1];

            // For all-day events, we consider them overlapping if they occur on the same day(s)
            const eventStartDate = new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate());
            const eventEndDate = new Date(event.end.getFullYear(), event.end.getMonth(), event.end.getDate());

            const lastEventInGroup = lastGroup[lastGroup.length - 1];
            const lastEventStartDate = new Date(lastEventInGroup.start.getFullYear(), lastEventInGroup.start.getMonth(), lastEventInGroup.start.getDate());
            const lastEventEndDate = new Date(lastEventInGroup.end.getFullYear(), lastEventInGroup.end.getMonth(), lastEventInGroup.end.getDate());

            // Check if events overlap on any day
            const hasOverlap = !(eventEndDate <= lastEventStartDate || eventStartDate >= lastEventEndDate);

            if (hasOverlap) {
                lastGroup.push(event);
            } else {
                collisionGroups.push([event]);
            }
        }
    }

    const processedEvents: ProcessedEvent[] = [];
    collisionGroups.forEach(group => {
        const totalEvents = group.length;

        group.forEach((event, index) => {
            processedEvents.push({
                ...event,
                layout: {
                    top: index * 1.75, // Stack vertically with 2.5rem spacing
                    height: 1.75, // Fixed height for all-day events
                    left: 0,
                    width: 100,
                },
            });
        });
    });

    return processedEvents;
};

export const CalendarView: React.FC<CalendarViewProps> = ({ events, users, startDate, setStartDate }) => {
  const userMap = usersById(users);
  const startOfWeek = new Date(startDate);
  startOfWeek.setDate(startOfWeek.getDate() - (startOfWeek.getDay() + 6) % 7); // Set to Monday
  startOfWeek.setHours(0,0,0,0);

  const weekDates = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(date.getDate() + i);
    return date;
  });

  const changeWeek = (offset: number) => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() + offset * 7);
    setStartDate(newDate);
  }

  const processedEventsByDay = useMemo(() => {
    const eventsByDay: Record<string, CalendarEvent[]> = {};

    console.log(`Processing ${events.length} total events for calendar display`);

    events.forEach((event, index) => {
      const dayKey = toYYYYMMDD(event.start);
      if (!eventsByDay[dayKey]) eventsByDay[dayKey] = [];
      eventsByDay[dayKey].push(event);
      console.log(`  Event ${index + 1}: "${event.title}" -> Day ${dayKey} (User: ${event.userId})`);

       // For multi-day events, also add to subsequent days
      const startDate = new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate());
      const endDate = new Date(event.end.getFullYear(), event.end.getMonth(), event.end.getDate());

       // Check if this is actually a multi-day event (end date > start date)
      if (endDate > startDate) {
        console.log(`Multi-day event "${event.title}" from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}, adding to days in between`);

         // Add to each day between start and end (not including start, which is already added)
        let currentDate = new Date(startDate);
         currentDate.setDate(currentDate.getDate() + 1); // Start from next day

        while (currentDate < endDate) {
          const nextDayKey = toYYYYMMDD(currentDate);
          if (!eventsByDay[nextDayKey]) eventsByDay[nextDayKey] = [];
          eventsByDay[nextDayKey].push(event);
          console.log(`  Added to ${nextDayKey}`);
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    });

    // Log summary of events per day
    Object.keys(eventsByDay).forEach(dayKey => {
      console.log(`Day ${dayKey}: ${eventsByDay[dayKey].length} events`);
    });

    const processed: Record<string, ProcessedEvent[]> = {};
    for (const dayKey in eventsByDay) {
        const dayEvents = eventsByDay[dayKey];
        const allDayEvents = dayEvents.filter(e => {
          const startDate = new Date(e.start.getFullYear(), e.start.getMonth(), e.start.getDate());
          const endDate = new Date(e.end.getFullYear(), e.end.getMonth(), e.end.getDate());
          const isAllDayPrecise = (e.start.getHours() === 0 && e.start.getMinutes() === 0 &&
                                  (e.end.getHours() === 23 && e.end.getMinutes() === 59)) ||
                                  (endDate > startDate);
          if (isAllDayPrecise) {
            console.log('ALL-DAY EVENT for day', dayKey, ':', e.title, e.start.toISOString(), e.end.toISOString());
          }
          return isAllDayPrecise;
        });

      console.log(`Processing day ${dayKey}: ${dayEvents.length} total events, ${allDayEvents.length} all-day events, ${dayEvents.length - allDayEvents.length} timed events`);

      // Debug: Log each event being processed
      dayEvents.forEach((event, index) => {
        const isAllDay = allDayEvents.includes(event);
        console.log(`  Event ${index + 1}: "${event.title}" - All-day: ${isAllDay}, User: ${event.userId}`);
      });

       // Process timed events (non-all-day events)
      const timedEvents = dayEvents.filter(e => !allDayEvents.includes(e));

      processed[dayKey] = [
          ...processTimedEventsForLayout(timedEvents),
          ...processAllDayEventsForLayout(allDayEvents)
      ];
    }
    return processed;
}, [events]);

  return (
    <div className="bg-[#1a202c]/0 rounded-lg p-0 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <button onClick={() => changeWeek(-1)} style={{borderRadius: 20 + 'px'}} className="px-4 py-2 text-3xl bg-blue-950 rounded hover:bg-blue-700 text-center">&lt;</button>
        <h2 className="text-4xl font-size-40px text-gray-300 font-100">
            {new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' }).format(startDate)}
        </h2>
        <button onClick={() => changeWeek(1)} style={{borderRadius: 20 + 'px'}} className="px-4 py-2 text-3xl bg-blue-950 rounded hover:bg-blue-700">&gt;</button>
      </div>
      <div className="grid grid-cols-[1fr,1fr,1fr,1fr,1fr,1fr,1fr] -mr-2">
        {/* Header */}
        {/* <div className="text-xs text-gray-400 -mb-1">GMT+02</div> */}
        {weekDates.map((date, i) => (
          <div key={i} className="text-center">
            <p className="text-xl text-gray-300">{WEEK_DAYS[i]}</p>
            <p className="text-3xl font-bold text-gray-300  -mb-1">{date.getDate()}</p>
          </div>
        ))}
        {/* Body */}
        {/* <div className="col-span-1 row-span-1"></div> */}
        <div className="col-start-1 col-span-7 row-span-1 border-b border-gray-500 ml-1 p-2 -mb-0"></div>

        <div className="col-start-1 col-end-9 grid grid-cols-[0.01fr,1fr,1fr,1fr,1fr,1fr,1fr,1fr] relative h-full overflow-y-auto">
          {/* Time Gutter */}
          <div className="relative w-1">
            {HOURS.map(hour => (
              <div key={hour} className="h-14 text-right pr-2 text-xs text-gray-400 relative -top-0 -right-1">
                {`${hour.toString().padStart(2, '0')}:00`}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          {weekDates.map((date, dayIndex) => {
            const dayKey = toYYYYMMDD(date);
            const dayEvents = processedEventsByDay[dayKey] || [];
            return(
                <div key={dayIndex} className="relative border-r border-gray-500">
                {HOURS.map((_, hourIndex) => (
                    <div key={hourIndex} className="h-14 border-b border-gray-500"></div>
                ))}
                {dayEvents.length > 0 && (
                    <>
                        {dayEvents.map(event => (
                            <EventCard key={`${event.id}-${event.userId}`} event={event} user={userMap[event.userId]} />
                        ))}
                    </>
                )}
                </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};