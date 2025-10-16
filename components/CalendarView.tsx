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
     console.log(`RENDERING ALL-DAY EVENT: ${event.title} at top of day`);
     return (
       <div className={`absolute top-0 left-1 right-1 p-2 rounded-md text-xs font-semibold text-white ${userColor} z-20 border-2 border-white border-opacity-50`}>
         📅 {event.title}
       </div>
     );
   }

   return (
     <div
       className={`absolute p-1 rounded-md text-xs text-gray-200 ${userColor} overflow-hidden z-10 background-image-[%linear-gradient(105deg,rgb(0 249 255 / 100%) 39%, rgb(51 56 57 / 100%) 96%);%]`}
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

const processEventsForLayout = (dayEvents: CalendarEvent[]): ProcessedEvent[] => {
    const timedEvents = dayEvents
        .filter(event => {
          const startDate = new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate());
          const endDate = new Date(event.end.getFullYear(), event.end.getMonth(), event.end.getDate());
          const isAllDay = (event.start.getHours() === 0 && event.start.getMinutes() === 0 &&
                           (event.end.getHours() === 23 && event.end.getMinutes() === 59)) ||
                           (endDate > startDate);
          return !isAllDay;
        })
        .sort((a, b) => a.start.getTime() - b.start.getTime());

    if (timedEvents.length === 0) return [];

    const collisionGroups: CalendarEvent[][] = [];
    if (timedEvents.length > 0) {
        collisionGroups.push([timedEvents[0]]);
        for (let i = 1; i < timedEvents.length; i++) {
            const event = timedEvents[i];
            const lastGroup = collisionGroups[collisionGroups.length - 1];
            const maxEnd = Math.max(...lastGroup.map(e => e.end.getTime()));

            if (event.start.getTime() < maxEnd) {
                lastGroup.push(event);
            } else {
                collisionGroups.push([event]);
            }
        }
    }

    const processedEvents: ProcessedEvent[] = [];
    collisionGroups.forEach(group => {
        const columns: (CalendarEvent & { colIndex: number })[][] = [];
        group.sort((a,b) => a.start.getTime() - b.start.getTime());

        group.forEach(event => {
            let placed = false;
            for (let i = 0; i < columns.length; i++) {
                const col = columns[i];
                const lastEventInCol = col[col.length - 1];
                if (event.start.getTime() >= lastEventInCol.end.getTime()) {
                    col.push({ ...event, colIndex: i });
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                columns.push([{ ...event, colIndex: columns.length }]);
            }
        });

        const totalColumns = columns.length;
        columns.forEach(col => {
            col.forEach(event => {
                const startHour = event.start.getHours() + event.start.getMinutes() / 60;
                const endHour = event.end.getHours() + event.end.getMinutes() / 60;
                
                if (startHour >= 19 || endHour <= 6) return;

                processedEvents.push({
                    ...event,
                    layout: {
                        top: (startHour - 6) * 4 * 14,
                        height: (endHour - startHour) * 4 * 14,
                        left: (100 / totalColumns) * event.colIndex,
                        width: 100 / totalColumns,
                    },
                });
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
    
    events.forEach(event => {
       const dayKey = toYYYYMMDD(event.start);
       if (!eventsByDay[dayKey]) eventsByDay[dayKey] = [];
       eventsByDay[dayKey].push(event);

       // For multi-day events, also add to subsequent days
       // Use a simpler approach: if end date is more than 1 day after start date, it's multi-day
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

        console.log(`Processing day ${dayKey}: ${dayEvents.length} total events, ${allDayEvents.length} all-day events`);

        processed[dayKey] = [
            ...processEventsForLayout(dayEvents),
            // Pass all-day events through with a default layout, they are handled separately
            ...allDayEvents.map(e => ({...e, layout: {top:0, height:0, left:0, width:100}} as ProcessedEvent))
        ];
    }
    return processed;
}, [events]);

  return (
    <div className="bg-[#1a202c]/0 rounded-lg p-2 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <button onClick={() => changeWeek(-1)} className="px-3 py-0 text-2xl bg-blue-950 rounded hover:bg-blue-700">&lt;</button>
        <h2 className="text-3xl font-bold font-size-40px text-gray-300">
            {new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' }).format(startDate)}
        </h2>
        <button onClick={() => changeWeek(1)} className="px-3 py-0 text-2xl bg-blue-950 rounded hover:bg-blue-700">&gt;</button>
      </div>
      <div className="grid grid-cols-[auto,1fr,1fr,1fr,1fr,1fr,1fr,1fr] -mr-2">
        {/* Header */}
        <div className="text-xs text-gray-400 -mb-1">GMT+02</div>
        {weekDates.map((date, i) => (
          <div key={i} className="text-center">
            <p className="text-xl text-gray-300">{WEEK_DAYS[i]}</p>
            <p className="text-3xl font-bold text-gray-300  -mb-1">{date.getDate()}</p>
          </div>
        ))}
        {/* Body */}
        {/* <div className="col-span-1 row-span-1"></div> */}
        <div className="col-start-2 col-span-7 row-span-1 border-b border-gray-500 -ml-3 p-2 -mb-0"></div>

        <div className="col-start-1 col-end-9 grid grid-cols-[auto,1fr,1fr,1fr,1fr,1fr,1fr,1fr] relative h-full overflow-y-auto">
          {/* Time Gutter */}
          <div className="relative">
            {HOURS.map(hour => (
              <div key={hour} className="h-14 text-right pr-2 text-xs text-gray-400 relative -top-1">
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
                {dayEvents
                    .map(event => (
                    <EventCard key={event.id} event={event} user={userMap[event.userId]} />
                    ))
                }
                </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};