import express, { Application, Request, Response } from "express";
import cors from 'cors';
import mysql, { ResultSetHeader } from "mysql2";

const app: Application = express();
const corsOptions = {
    origin: 'http://localhost:3000', // 許可したいオリジンを指定
    credentials: true, // レスポンスヘッダーにAccess-Control-Allow-Credentialsを追加。ユーザー認証等を行う場合は、これがないとブラウザがレスポンスを捨ててしまうそう。
    optionsSuccessStatus: 200 // レスポンスのHTTPステータスコードを「200(成功)」に設定
}

// よう修正
// const corsOptions = {
//     origin: 'http://kakeibo.rikuyasan.com:3000', // 許可したいオリジンを指定
//     credentials: true, // レスポンスヘッダーにAccess-Control-Allow-Credentialsを追加。ユーザー認証等を行う場合は、これがないとブラウザがレスポンスを捨ててしまうそう。
//     optionsSuccessStatus: 200 // レスポンスのHTTPステータスコードを「200(成功)」に設定
// }

app.use(cors(corsOptions));
app.use(express.json());
const PORT = 3001;

// サーバー立ち上げ(ローカル)
try {
    app.listen(PORT, () => {
    });
} catch (e) {
    if (e instanceof Error) {
        console.error(e.message);
    }
};

// データベース接続
const connection = mysql.createConnection({
    host: "127.0.0.1",
    port: 3307,
    user: "csv_db",
    password: "rikuya",
    database: "rakuten_card",
});
connection.connect((error) => {
    if (error) {
        console.error("Error connecting to MySQL: ", error);
        return;
    }
});

// 指定した月の詳細な使用履歴を取得
app.get('/api/rakuten', (req: Request, res: Response) => {
    const detailQuery = `SELECT * FROM rakuten_${req.query.currentMonth}`;
    connection.query(detailQuery, (error, results) => {
        if (error) {
            if (error.code === 'ER_NO_SUCH_TABLE') {
                return res.status(200).json([]);
            }
            console.error(`cannot get detail data:${error}`);
            return res.status(500).json(error);

        }
        res.status(200).json(results);
        console.log('アクセスは成功したようです')
    })
});

app.get('/api/aeon', (req: Request, res: Response) => {
    const detailQuery = `SELECT * FROM aeon_${req.query.currentMonth}`;
    connection.query(detailQuery, (error, results) => {
        if (error) {
            if (error.code === 'ER_NO_SUCH_TABLE') {
                console.error(`テーブルが存在しません`);
                return res.status(200).json([]);
            }
            console.error(`cannot get detail data:${error}`);
            return res.status(500).json(error);

        }
        res.status(200).json(results);
    })
});

app.get('/api/cash', (req: Request, res: Response) => {
    const detailQuery = `SELECT * FROM cash_${req.query.currentMonth}`;
    connection.query(detailQuery, (error, results) => {
        if (error) {
            if (error.code === 'ER_NO_SUCH_TABLE') {
                console.error(`テーブルが存在しません`);
                return res.status(200).json([]);
            }
            console.error(`cannot get detail data:${error}`);
            return res.status(500).json(error);
        }
        res.status(200).json(results);
    })
});

interface body {
    paticularId: number
    category: string
}

app.post('/api/rakuten/tag', (req: Request, res: Response) => {
    const body: body = req.body;
    const newCategory = `UPDATE rakuten_${req.query.currentMonth} SET category = ? WHERE id = ?`;
    connection.query(newCategory, [body.category, body.paticularId], (error, results) => {
        if (error) {
            console.error(`cannot get detail data:${error}`);
            return;
        }
    })
})

app.post('/api/aeon/tag', (req: Request, res: Response) => {
    const body: body = req.body;
    const newCategory = `UPDATE aeon_${req.query.currentMonth} SET category = ? WHERE id = ?`;
    connection.query(newCategory, [body.category, body.paticularId], (error, results) => {
        if (error) {
            console.log(`cannot get detail data:${error}`);
            return;
        }
    })
})

interface createBody {
    date: string
    description: string
    payment: number
    category: string
}

app.post('/api/cash/new', (req: Request, res: Response) => {
    const body: createBody = req.body;
    const isFindTable = `CREATE TABLE IF NOT EXISTS cash_${req.query.currentMonth} (
                    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    day VARCHAR(20),
                    name VARCHAR(100),
                    payment INT,
                    category VARCHAR(10)
                ) AUTO_INCREMENT=1000;`;
    connection.query(isFindTable, (error, results) => {
        if (error) {
            console.error(`テーブル作成エラー:${error}`);
            res.status(500).json(error);
            return;
        }
        res.status(200).json(results);
        const newCategory = `INSERT INTO cash_${req.query.currentMonth} (day, name, payment, category) VALUES (?, ?, ?, ?)`;
        connection.query(newCategory, [body.date, body.description, body.payment, body.category], (error, results) => {
            if (error) {
                console.log(`cannot get detail data:${error}`);
                return;
            }
        })
    })
})

interface editBody {
    date: string
    description: string
    payment: number
    category: string
    id: number
    oldMonth: string
}

app.post('/api/cash/edit', (req: Request, res: Response) => {
    const body: editBody = req.body;
    const currentMonth = body.oldMonth;
    const newMonth = req.query.currentMonth;
    if (currentMonth === newMonth) {
        const newCategory = `UPDATE cash_${currentMonth} SET  day = ?, name = ?, payment = ?, category = ? WHERE id = ?`;
        connection.query(newCategory, [body.date, body.description, body.payment, body.category, body.id], (error, results) => {
            if (error) {
                return;
            }
            return;
        })
    }
    const dropData = `DELETE FROM cash_${currentMonth} WHERE id = ?`;
    connection.query(dropData, [body.id], (error, results) => {
        if (error) {
            return;
        }
        const resultHeader = results as ResultSetHeader;
        if (resultHeader.affectedRows === 0) {
        }
        const createTable = `CREATE TABLE IF NOT EXISTS cash_${newMonth} (
                    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    day VARCHAR(20),
                    name VARCHAR(100),
                    payment INT,
                    category VARCHAR(10)
                ) AUTO_INCREMENT=1000;`;
        connection.query(createTable, [body.id], (error, results) => {
            if (error) {
                return;
            }
            const newCategory = `INSERT INTO cash_${req.query.currentMonth} (day, name, payment, category) VALUES (?, ?, ?, ?)`;
            connection.query(newCategory, [body.date, body.description, body.payment, body.category], (error, results) => {
                if (error) {
                    return;
                }
                res.status(200).json(results);
            })
        })
    })
})


app.post('/api/cash/delete', (req: Request, res: Response) => {
    const id: number = req.body.id;
    const newCategory = `DELETE FROM cash_${req.query.currentMonth} WHERE id = ?`;
    connection.query(newCategory, [id], (error, results) => {
        if (error) {
            return;
        }
        const resultHeader = results as ResultSetHeader;
        if (resultHeader.affectedRows === 0) {
            return;
        }
        res.status(200).json(results);
    })
})