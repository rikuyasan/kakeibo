import { useState, useEffect } from "react";
import { format } from 'date-fns';
import { EventInput } from "@fullcalendar/core";
import MonthHeader from "./MonthHeader";
import Calender from "./Calendar";
import Total from "./Total";
import CalendarDetail from "./CalendarDetail";
import Graph from "./Graph";
import RegisterCashModal from "./RegisterCashModal";
import "./App.css";

interface CardData {
  category: string;
  day: string;
  id: number;
  name: string;
  payment: number;
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

function App() {
  const [date, setDate] = useState(new Date());
  const [data, setData] = useState<CardData[]>([]);
  const [showTotal, setShowTotal] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventInput[] | null>(null);
  const [showCalendar, setShowCalendar] = useState(false); // カレンダーモードの状態
  const [registerCash, setRegisterCash] = useState(false);
  const [clickedDate, setClickedDate] = useState(format(date, "yyyy-MM-dd"));

  // データ取得と更新
  useEffect(() => {
    const fetchData = async () => {
      const currentMonth = format(date, 'yyyyMM');
      const getRakutenData = async (): Promise<CardData[]> => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_RAKUTEN}?currentMonth=${currentMonth}`);
          const data = await response.json();
          return data;
        } catch (error) {
          console.error('リクエストエラー:', error);
          return [];
        }
      };
      const getAeonData = async (): Promise<CardData[]> => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_AEON}?currentMonth=${currentMonth}`);
          const data = await response.json();
          return data;
        } catch (error) {
          console.error('リクエストエラー:', error);
          return [];
        }
      };
      const getCashData = async (): Promise<CardData[]> => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_CASH}?currentMonth=${currentMonth}`);
          const data = await response.json();
          return data;
        } catch (error) {
          console.error('リクエストエラー:', error);
          return [];
        }
      };
      const rakutenData = await getRakutenData();
      const aeonData = await getAeonData();
      const cashData = await getCashData();

      // データ取得完了後にデータをセット
      setData([...rakutenData, ...aeonData, ...cashData]);
    };

    fetchData();
  }, [date]); // dateが変わるたびにデータを取得

  const handleDateClickTrue = () => {
    setShowTotal(true);
    setSelectedEvent(null); // イベント選択をクリア
  };

  const handleDateClick = (event: EventInput[] | null) => {
    if (event) {
      setSelectedEvent(event); // イベントがある場合、イベントを保持
      setShowTotal(false); // Totalを非表示にしてCalendarDetailを表示
    }
  };

  const handleCalendarShow = () => {
    setShowCalendar(!showCalendar); // カレンダーモードの切り替え
    setShowTotal(true);
  };

  const handelRegisterCash = () => {
    setRegisterCash(true);
  };

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

  const convertToCalenderObject = (cardData: CardData[]): EventInput[] => {
    return cardData.map((item) => {
      const formattedDate = item.day.replace(/\//g, "-");
      const payMethod = 500 > item.id ? "rakuten" : (item.id < 1000 ? "aeon" : "cash");
      const payColor = 500 > item.id ? "#6D2E1C" : (item.id < 1000 ? "#C71585" : "#556B2F");

      return {
        id: item.id.toString(),
        title: `${item.payment}円`,
        description: item.name,
        start: formattedDate,
        end: formattedDate,
        backgroundColor: invertedColorPalette[item.category as keyof InvertedColorPalette],
        borderColor: payColor,
        textColor: "white",
        classNames: ['custom-calendar-event'],
        extendedProps: {
          payMethod: payMethod
        }
      };
    });
  };

  const handleCashReload = async (cashdate: string) => {
    const [nowYear, nowMonth, nowDate] = cashdate.split('-');
    setDate(new Date(+nowYear, +nowMonth - 1, +nowDate)); // dateを更新

    const fetchData = async () => {
      const currentMonth = format(new Date(+nowYear, +nowMonth - 1, +nowDate), 'yyyyMM');
      try {
        const [rakutenData, aeonData, cashData] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_RAKUTEN}?currentMonth=${currentMonth}`).then(res => res.json()),
          fetch(`${process.env.REACT_APP_API_AEON}?currentMonth=${currentMonth}`).then(res => res.json()),
          fetch(`${process.env.REACT_APP_API_CASH}?currentMonth=${currentMonth}`).then(res => res.json())
        ]);
        return [...rakutenData, ...aeonData, ...cashData];
      } catch (error) {
        console.error('データ取得エラー:', error);
        return [];
      }
    };

    // データの更新が完了するのを待つ
    const updatedData = await fetchData();
    setData(updatedData);

    // 最新のデータを使って処理
    const detailDate = cashdate.replace(/-/g, '/');
    const selectedData = updatedData.filter(list => detailDate === list.day);
    console.log(selectedData);
    setSelectedEvent(convertToCalenderObject(selectedData));
    setClickedDate(cashdate);
  };

  return (
    <div>
      <MonthHeader date={date} setDate={setDate} />
      <div>
        <button onClick={handleCalendarShow} className="app-button">
          {showCalendar ? 'グラフモード' : 'カレンダーモード'}
        </button>
        <button onClick={handelRegisterCash} className="app-button">現金の履歴を追加</button>
      </div>
      <div className={`container`}>
        {showTotal ? (
          data ? (
            <Total data={data} />
          ) : (
            <p>データを取得中...</p>
          )
        ) : (
          <CalendarDetail
            onDateClick={handleDateClickTrue}
            detail={selectedEvent}
            setData={setData}
            data={data}
            date={date}
            onUpdateTag={handleDateClick}
            onReload={handleCashReload}
            detailDate={clickedDate}
          />
        )}
        {showCalendar && (
          data ? (
            <Calender date={date} data={data} onDateClick={handleDateClick} detailDate={setClickedDate} />
          ) : (
            <p>データを取得中です</p>
          )
        )}
        {!showCalendar && (
          data ? (
            <div style={{ width: "50%" }}>
              <Graph data={data} />
            </div>
          ) : (
            <p>データを取得中です</p>
          )
        )}
      </div>
      <RegisterCashModal modal={registerCash} setModal={setRegisterCash} onHandle={handleCashReload} />
    </div>
  );
}

export default App;
