import { useCallback, useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import { CalendarApi, EventInput, EventClickArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import "./App.css";

interface CardData {
  category: string;
  day: string;
  id: number;
  name: string;
  payment: number;
}

interface CalenderProps {
  date: Date;
  data: CardData[];
  onDateClick: (event: EventInput[] | null) => void;
  detailDate: React.Dispatch<React.SetStateAction<string>>
}

interface InvertedColorPalette {
    '旅行': string;
    '経費': string;
    '交通費': string;
    '生活必需品': string;
    'サブスク': string;
    '外出': string;
    '娯楽': string;
    'その他': string;
}

function Calendar({ date, data, onDateClick, detailDate }: CalenderProps) {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [events, setEvents] = useState<EventInput[]>([]);

  const invertedColorPalette: InvertedColorPalette = {
    '旅行': '#2E86C1',
    '経費': '#28B463',
    '交通費': '#F39C12',
    '生活必需品': '#8E44AD',
    'サブスク': '#E74C3C',
    '外出': '#1ABC9C',
    '娯楽': '#D35400',
    'その他': '#5D6D7E'
  };
  
  const handleDateClick = useCallback((arg: DateClickArg) => {
    detailDate(arg.dateStr);
    const specifiedEvent: EventInput[] | undefined = events.filter(event => event.start === arg.dateStr);
    onDateClick(specifiedEvent || null);
  }, [events, onDateClick, detailDate]);

  const handleEventClick = useCallback((arg: EventClickArg) => {
    detailDate(arg.event.startStr);
    const specifiedEvent: EventInput[] | undefined = events.filter(event => event.start === arg.event.startStr);
    onDateClick(specifiedEvent || null);
  }, [events, onDateClick, detailDate]);

  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi: CalendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(date);
    }
  }, [date]);

  const convertToCalenderObject = (cardData: CardData[]): EventInput[] => {
    return cardData.map((item) => {
      const formattedDate = item.day.replace(/\//g, "-");
      const payMethod = 500 > item.id ? "rakuten" : (item.id < 1000 ? "aeon" : "cash");
      const payColor = 500 > item.id ? "#6D2E1C" : (item.id < 1000 ? "#C71585" : "#556B2F") ;

      return {
        id: item.id.toString(),
        title: `${item.payment}円`,
        description: item.name,
        start: formattedDate,
        end: formattedDate,
        backgroundColor: invertedColorPalette[item.category as  keyof InvertedColorPalette],
        borderColor: payColor,
        textColor: "white",
        classNames: ['custom-calendar-event'],
        extendedProps: {
          payMethod: payMethod
        }
      };
    });
  };

  useEffect(() => {
    const calenderEvents = convertToCalenderObject(data);
    setEvents(calenderEvents);
  }, [data]);

  return (
    <div className="calendar">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        headerToolbar={false}
        initialView="dayGridMonth"
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        events={events}
      />
    </div>
  );
}

export default Calendar;
