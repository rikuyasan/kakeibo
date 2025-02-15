import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const rakuten = await prisma.payment.upsert({
        where: { id: 1 },
        update: {
            date: '2025-01-01',
            name: 'rakuten_testdata',
            payment: 1,
            category: 'その他',
            paymentMethod: 'rakuten',
            yearMonth: 202501
        },
        create: {
            date: '2025-01-01',
            name: 'rakuten_testdata',
            payment: 1,
            category: 'その他',
            paymentMethod: 'rakuten',
            yearMonth: 202501
        }
    })

    const aeon = await prisma.payment.upsert({
        where: { id: 2 },
        update: {
            date: '2025-01-02',
            name: 'aeon_testdata',
            payment: 1000,
            category: '経費',
            paymentMethod: 'aeon',
            yearMonth: 202501
        },
        create: {
            date: '2025-01-02',
            name: 'aeon_testdata',
            payment: 1000,
            category: '経費',
            paymentMethod: 'aeon',
            yearMonth: 202501
        }
    })

    const cash = await prisma.payment.upsert({
        where: { id: 3 },
        update: {
            date: '2025-03-03',
            name: 'cash_testdata',
            payment: 1,
            category: '旅行',
            paymentMethod: 'cash',
            yearMonth: 202503
        },
        create: {
            date: '2025-03-03',
            name: 'cash_testdata',
            payment: 1,
            category: '旅行',
            paymentMethod: 'cash',
            yearMonth: 202503
        }
    })
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1); // スクリプト実行時にエラー発生したら、異常終了としてプロセス終了をする
    })
    .finally(async () => {
    await prisma.$disconnect(); //prismaとの接続を遮断
    });