import json
import requests
# スクレイピングを行うために必要なモジュール
from selenium import webdriver
import chromedriver_autoinstaller
# 入力フォームを特定する際に用いる
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

# 自動的に適切なバージョンのChromedriverをインストール
chromedriver_autoinstaller.install()

# JSON形式の個人情報を取得
login_info = json.load(open("rakuten_login.json", "r"))
login = login_info["rakuten"]

# ヘッドレスモードを有効化する
options = webdriver.ChromeOptions()
options.add_argument('--headless')
driver = webdriver.Chrome(options=options)

# 対象のサイトを検索する
driver.get(login["url"])

# メールアドレス入力
try:
    # メールアドレス入力画面が現れるまで最大10秒間待機
    userid = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.NAME, "username"))
    )
    userid.clear()
    userid.send_keys(login["id"])
    button = driver.find_element(By.ID,"cta001")
    button.click()
    print("メールアドレス入力完了")
except TimeoutException:
    print("要素が見つかりませんでした")
    driver.quit()

# パスワード入力
try:
    # パスワード入力画面が現れるまで最大10秒間待機
    password = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "password_current"))
    )
    password.clear()
    password.send_keys(login["pass"])
    button = driver.find_element(By.ID,"cta011")
    button.click()
    print("パスワード入力完了")
except TimeoutException:
    print("要素が見つかりませんでした")
    driver.quit()

# 明細画面に遷移
try:
    # 明細画面への遷移ボタンが現れるまで最大10秒間待機
    password = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.LINK_TEXT, "明細を見る"))
    )
    driver.get(login["csv_url"])
    print("ページ遷移完了")
except TimeoutException:
    print("要素が見つかりませんでした")
    driver.quit()

# 明細ダウンロード
try:
    # 明細のダウンロードボタンが現れるまで最大10秒間待機
    password = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, 'stmt-csv-btn'))
    )
    # ダウンロード先のリンクアドレスをゲット
    tag = driver.find_element(By.CLASS_NAME, 'stmt-csv-btn')
    href = tag.get_attribute('href')

    # 現在のログイン状態をクッキーから取得
    c = {}
    for cookie in driver.get_cookies():
        name = cookie['name']
        value = cookie['value']
        c[name] = value

    # クッキー情報とrequestsを利用してデータを取得
    r = requests.get(href, cookies=c)
    with open("rakuten-card.csv", 'wb') as f:
        f.write(r.content)

    print("取得完了")
except TimeoutException:
    print("要素が見つかりませんでした")
    driver.quit()

# ブラウザを閉じる
driver.quit()