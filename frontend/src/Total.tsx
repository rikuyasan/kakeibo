interface CardData {
    category: string,
    day: string,
    id: number,
    name: string,
    payment: number
}

interface TotalProps {
    data: CardData[]
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
function Total({ data }: TotalProps) {

    // 支払い別の利用額
    const { totalPayment, totalAeon, totalRakuten, totalCash } = data.reduce(
        (acc, item) => {
            acc.totalPayment += item.payment;
            if (item.id < 500) {
                acc.totalRakuten += item.payment;
            } else if (1000 <= item.id) {
                acc.totalCash += item.payment;
            } else {
                acc.totalAeon += item.payment
            }
            return acc;
        },
        { totalPayment: 0, totalAeon: 0, totalRakuten: 0, totalCash: 0 }
    );

    const totals: { [key in keyof InvertedColorPalette]: number } = {
        '旅行': 0,
        '経費': 0,
        '交通費': 0,
        '生活必需品': 0,
        'サブスク': 0,
        '外出': 0,
        '娯楽': 0,
        'その他': 0
    };

    data.forEach((item) => {
        if (totals[item.category as keyof InvertedColorPalette] !== undefined) {
            totals[item.category as keyof InvertedColorPalette] += item.payment;
        }
    });

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

    const results = Object.keys(totals).map((category) => ({
        category,
        total: totals[category as keyof InvertedColorPalette]
    }));

    return (
        <div className="total-cost">
            <h1>トータルコスト</h1>
            <h2>合計</h2>
            <div className="moneyTotal">総利用額:{totalPayment}円</div>
            <h2>支払い方法別</h2>
            <h3>クレジットカード</h3>
            <div className="total-section">
                <div className="rakutenTotal">楽天カード利用額: {totalRakuten}円</div>
                <div className="aeonTotal">イオンカード利用額: {totalAeon}円</div>
            </div>
            <h3>現金</h3>
            <div className="cashTotal">現金利用額： {totalCash}円</div>
            <h2>カテゴリー別</h2>
            <div className="category-container-total">
                {results.map((result) => (
                    <div
                        key={result.category}
                        className="category-total"
                        style={{ backgroundColor: invertedColorPalette[result.category as keyof InvertedColorPalette] }}
                    >
                        {result.category}: {result.total}円
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Total;
