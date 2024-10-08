import csv


monthData = []

with open("rakuten-card.csv", 'r') as f:
    for row in csv.reader(f):
        data = [row[0],row[1],row[6]]
        monthData.append(data)
    del monthData[0]
print(monthData)




import pymysql
connection = pymysql.connect(host="ip-10-0-2-146.ap-northeast-1.compute.internal",
                             port=3306,
                             user="rikuya_test",
                             password="rikuya",
                             db="rikuya_test")

cursor = connection.cursor()
print(cursor) # 接続確認
sql = cursor.execute(
    "SELECT * FROM user"
)
users = cursor.fetchall()
for user in users:
    print(user)

connection.close() # 接続解除