import Modal from "react-modal";
import { format } from "date-fns";
import { EventInput } from "@fullcalendar/core";

interface ColorPalette {
    '#2E86C1': string;  // Vibrant Blue
    '#28B463': string;  // Emerald Green
    '#F39C12': string;  // Orange Gold
    '#8E44AD': string;  // Deep Purple
    '#E74C3C': string;  // Bright Red
    '#1ABC9C': string;  // Turquoise
    '#D35400': string;  // Burnt Orange
    '#5D6D7E': string;  // Cool Gray
}

interface CardData {
    category: string;
    day: string;
    id: number;
    name: string;
    payment: number;
}

const TagModal = ({ modal, setModal, id, month, payMethod, setData, data, date, onUpdateTag, event }: { modal: boolean, setModal: React.Dispatch<React.SetStateAction<boolean>>, id: string, month: string, payMethod: string, setData: React.Dispatch<React.SetStateAction<CardData[]>>, data: CardData[], date: Date, onUpdateTag: (event: EventInput[] | null) => void, event: EventInput[]}) => {
    const RenderCalendar = (color: string) => {
        const currentMonth: string = format(date, 'yyyyMM');
        if (currentMonth === month) {
            let newData: CardData[] = [...data];
            const particularId: number = +id;
            const newCategory: string = colorPalette[color as keyof ColorPalette];
            for (let i = 0; i < newData.length; i++) {
                if (newData[i].id === particularId) {
                    newData[i].category = newCategory;
                    break;  // es5のため、findが使えない..
                }
            }
            setData(newData);
        }
        const newEvent = event.map(item => 
            item.id === id ? { ...item, backgroundColor: color } : item
          );
        onUpdateTag(newEvent)
    };


    const handleTagModal = (color: string) => {
        setModal(false);
        const postNewTag = async () => {
            const category: string = colorPalette[color as keyof ColorPalette];
            const paticularId: number = +id;
            try {
                await fetch(`${process.env.REACT_APP_API}/${payMethod}/tag?currentMonth=${month}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ category, paticularId }),
                });
            } catch (error) {
                console.error('リクエストエラー:', error);
            };
        }
        postNewTag();
        RenderCalendar(color);
    }

    const colorArray: string[] = ['#2E86C1', '#28B463', '#F39C12', '#8E44AD', '#E74C3C', '#1ABC9C', '#D35400', '#5D6D7E']

    const colorPalette: ColorPalette = {
        '#2E86C1': '旅行',
        '#28B463': '経費',
        '#F39C12': '交通費',
        '#8E44AD': '生活必需品',
        '#E74C3C': 'サブスク',
        '#1ABC9C': '外出',
        '#D35400': '娯楽',
        '#5D6D7E': 'その他'
    };

    const customStyles = {
        content: {
            zIndex: 1000, // 高い値を指定してモーダルを最前面に表示
            position: 'relative' as 'relative',
            padding: '20px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '300px',
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            textAlign: 'center' as 'center',
        },
        overlay: {
            zIndex: 999,  // モーダルの背景にも高いz-indexを設定
            backgroundColor: 'rgba(0, 0, 0, 0.75)', // 背景を半透明に
        }
    };

    return (
        <>
            <Modal isOpen={modal} style={customStyles}>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>カテゴリーを選択してください</h1>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {colorArray.map((color) => (
                        <button
                            key={color}
                            onClick={() => handleTagModal(color)}
                            style={{
                                backgroundColor: color,
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                padding: '10px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                transition: 'background-color 0.3s ease',
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = darkenColor(color))}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = color)}
                        >
                            {colorPalette[color as keyof ColorPalette]}
                        </button>
                    ))}
                </div>
            </Modal>
        </>
    )
}

export default TagModal;

// 色を暗くする関数
function darkenColor(color: string): string {
    const amount = -0.2; // 色を20%暗くする
    const colorValue = parseInt(color.slice(1), 16);
    const r = Math.max(0, Math.min(255, (colorValue >> 16) + Math.round(255 * amount)));
    const g = Math.max(0, Math.min(255, ((colorValue >> 8) & 0x00ff) + Math.round(255 * amount)));
    const b = Math.max(0, Math.min(255, (colorValue & 0x0000ff) + Math.round(255 * amount)));
    return `rgb(${r}, ${g}, ${b})`;
}
