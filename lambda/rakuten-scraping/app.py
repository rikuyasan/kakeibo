from tempfile import mkdtemp

import os
import time

# スクレイピングを行うために必要なモジュール
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import glob
import requests

import boto3


print("chrome起動中")
chrome_options = webdriver.ChromeOptions()
chrome_options.add_argument('--headless')
chrome_options.add_argument('--disable-gpu')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument('--disable-dev-tools')
chrome_options.add_argument('--no-zygote')
chrome_options.add_argument('--window-size=1280x1696')
chrome_options.add_argument(f"--user-data-dir={mkdtemp()}")
chrome_options.add_argument(f"--data-path={mkdtemp()}")
chrome_options.add_argument(f"--disk-cache-dir={mkdtemp()}")
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--hide-scrollbars')
chrome_options.add_argument('--enable-logging')
chrome_options.add_argument('--log-level=0')
chrome_options.add_argument('--v=99')
chrome_options.add_argument('--single-process')
chrome_options.add_argument('--remote-debugging-port=9222')
# chrome_options.add_argument('user-agent=' + ...)
# "/var/task/chrome/linux64/121.0.6167.85/chrome" のような場所にある実行ファイルを指定する。
chrome_options.binary_location = glob.glob("/var/task/chrome/linux64/*/chrome")[0]
service = ChromeService(glob.glob("/var/task/chromedriver/linux64/*/chromedriver")[0])
driver = webdriver.Chrome(service=service, options=chrome_options)
print("chrome起動完了")


BUCKET_NAME = 'lambda-kakeibo'
OBJECT_NAME = 'rakuten/rakuten-card.csv'

def lambda_handler(event, context):
    # 対象のサイトを検索する
    driver.get(os.environ["url"])

    # メールアドレス入力
    try:
        # メールアドレス入力画面が現れるまで最大60秒間待機
        userid = WebDriverWait(driver, 60).until(
            EC.presence_of_element_located((By.NAME, "username"))
        )
        userid.clear()
        userid.send_keys(os.environ["id"])
        button = driver.find_element(By.ID,"cta001")
        button.click()
        print("メールアドレス入力完了")
    except TimeoutException:
        print("要素が見つかりませんでした")
        driver.quit()

    # パスワード入力
    try:
        # パスワード入力画面が現れるまで最大60秒間待機
        password = WebDriverWait(driver, 150).until(
            EC.presence_of_element_located((By.ID, "password_current"))
        )
        password.clear()
        password.send_keys(os.environ["pass"])
        button = driver.find_element(By.ID,"cta011")
        button.click()
        print("パスワード入力完了")
    except TimeoutException:
        print("要素が見つかりませんでした")
        driver.quit()

    # 明細画面に遷移
    try:
        # 明細画面への遷移ボタンが現れるまで最大60秒間待機
        password = WebDriverWait(driver, 300).until(
            EC.presence_of_element_located((By.LINK_TEXT, "明細を見る"))
        )
        driver.get(os.environ["csv_url"])
        print("ページ遷移完了")
    except TimeoutException:
        print("要素が見つかりませんでした")
        driver.quit()
    
    # 最新の明細画面に移動
    try:
        # isLatestMonth に該当する要素を取得
        isLatestMonth = WebDriverWait(driver, 300).until(
            EC.presence_of_element_located((By.CLASS_NAME, "stmt-head-calendar__next"))
        )
        
        # 要素のクラスを取得し、そのクラス名に "stmt-head-calendar--desable" が含まれているか確認
        class_name = isLatestMonth.get_attribute("class")
        
        if "stmt-head-calendar--desable" not in class_name:
            # "stmt-head-calendar--desable" が含まれていない場合はクリック
            driver.execute_script("window.scrollTo(0, 300);")
            isLatestMonth.click()
            print("次の月の明細へ移動しました")
        else:
            print("すでに最新の明細です")
    except TimeoutException:
        print("要素が見つかりませんでした")
        driver.quit()

    # 明細ダウンロード
    try:
        href = "https://www.rakuten-card.co.jp/e-navi/members/statement/index.xhtml?downloadAsCsv=1"

        print('ページの読み込み中')
        print("クッキー情報取得開始")

        # 現在のログイン状態をクッキーから取得
        c = {}
        for cookie in driver.get_cookies():
            name = cookie['name']
            value = cookie['value']
            c[name] = value
            print('ここまでできました',c[name])
        
        print('クッキー情報取得完了')

        # クッキー情報とrequestsを利用してデータを取得
        r = requests.get(href, cookies=c)
        file_path = "/tmp/rakuten-card.csv"
        with open(file_path, 'wb') as f:
            f.write(r.content)

        print("取得完了")
    except TimeoutException:
        print("要素が見つかりませんでした")
        driver.quit()
    # ブラウザを閉じる
    driver.quit()

    # csvファイルをs3に保存
    print('s3にファイル保存開始')
    # S3クライアントを作成
    s3_client = boto3.client('s3')

    try:
        # ファイルをS3にアップロード
        s3_client.upload_file(file_path,BUCKET_NAME,OBJECT_NAME)
        print("アップロード完了")
    except Exception as e:
        print(f"File upload failed: {e}")


if __name__ == "__main__":
    # ローカルテスト用に lambda_handler を呼び出す
    event = {}  # 必要ならテスト用のイベントデータを設定
    context = None  # 必要ならテスト用のコンテキストを設定
    lambda_handler(event, context)
