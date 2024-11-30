# 家計簿アプリ
![スクリーンショット 2024-11-30 13 57 46](https://github.com/user-attachments/assets/30d2e58b-12ee-425d-b939-e34272886853)

# 目次
- [家計簿アプリ](#家計簿アプリ)
- [目次](#目次)
  - [1. 概要・機能紹介](#1-概要機能紹介)
    - [a. トータルコスト](#a-トータルコスト)
    - [b. グラフ機能](#b-グラフ機能)
    - [c. 現金の使用履歴追加](#c-現金の使用履歴追加)
    - [d. カレンダー機能](#d-カレンダー機能)
    - [e. 日毎の利用額詳細](#e-日毎の利用額詳細)
  - [2. 使用技術](#2-使用技術)
  - [3. インフラ構成図](#3-インフラ構成図)
  - [4. ディレクトリ構成](#4-ディレクトリ構成)
  - [5. アップデート予定](#5-アップデート予定)


## 1. 概要・機能紹介
お金に無頓着な自身の欠点を解消するため、月毎の利用額を把握しやすくする目的で作成したアプリ。主な機能は5点。

<details>
  <summary>

  ### a. トータルコスト
  </summary>

  選択した月の総利用額が一目でわかる機能。  
  さらに、支払い方法別や設定されたタグ別といった、カテゴリ毎の利用額を確認することが可能。  
  
  <img width="600" alt="スクリーンショット 2024-10-25 18 19 19" src="https://github.com/user-attachments/assets/82f16d0f-5df8-4d00-81e8-12d3b4f8c42c">
</details>

<details>
  <summary>

  ### b. グラフ機能
  </summary>

  利用額を占めるタグ毎の割合が一目でわかる機能。  
  総利用額、楽天カード、イオンカード、現金の計4種の割合を確認可能。  

  <p>
    <img src="https://github.com/user-attachments/assets/07adcf24-99e1-4dfa-bd4b-2da26025a531" width="400">
    <img src="https://github.com/user-attachments/assets/a3197ba8-7a16-47f0-80d1-c95ca0387d24" width="400">
  </p>

</details>

<details>
  <summary>

  ### c. 現金の使用履歴追加
  </summary>

  設定項目は日付、概要、価格、タグの4つ。  
  設定項目を後ほど変更することも可能。(e. 日毎の利用額詳細)  

  <img width="500" alt="スクリーンショット 2024-11-30 16 23 34" src="https://github.com/user-attachments/assets/2775c57a-8f64-4307-9990-326679f25af4">

</details>

<details>
  <summary>

  ### d. カレンダー機能
  </summary>

  選択した月の日毎の利用額をカレンダー上に表示。  
  利用額の外枠は支払い方法、内側はタグに応じた色となっている。  
  特定の日付をクリックすることで、利用額の詳細が表示される。(e. 日毎の利用額詳細)  

  <img width="600" alt="スクリーンショット 2024-10-25 18 20 04" src="https://github.com/user-attachments/assets/93bc58c9-a894-4d46-baaa-b3155d96387b">

</details>

<details>
  <summary>

  ### e. 日毎の利用額詳細
  </summary>

  カレンダーの特定の日付をクリックすることで、利用額の詳細一覧が表示される。  
  ![スクリーンショット 2024-11-30 16 40 12](https://github.com/user-attachments/assets/3a51b510-1c4c-455a-8cf1-3ea838a62561)

  現金の場合は、ここでデータの修正および削除が可能。  
  <img width="500" alt="スクリーンショット 2024-11-30 16 42 34" src="https://github.com/user-attachments/assets/f047fe69-fbe1-45bd-bd9a-51e5fa40ff8e">

  クレジットカードの場合はタグ変更のみ可能。  
  <img width="500" alt="スクリーンショット 2024-11-30 16 41 33" src="https://github.com/user-attachments/assets/05575091-4d00-49db-b316-0f2ca3229288">


</details>

## 2. 使用技術
このアプリはTypeScriptを用いて作成しており、フロントエンドにReact、バックエンドにExpressを利用した。  
また、バッチ処理としてクレジットカードの明細取得からテーブルにセットする一連の動作を行なっている。こちらはPythonを用いて実装した。  
インフラはAWSを用いて作成しており、terraformによるIaCを行っている。  

[![My Skills](https://skillicons.dev/icons?i=ts,react,express,docker,py,mysql,aws,terraform,githubactions)](https://skillicons.dev)

## 3. インフラ構成図
CloudFrontを経由してアプリケーションへのアクセスが可能であり、WAF(IP制限)およびACM(SSL証明書)、Route53(独自ドメイン)を適用している。  
楽天カードのバッチ処理はLambdaにて実装しており、一日一回EventBridgeがトリガーとして動作する。
(イオンカードはワンタイムパスワードが必要であったため、バッチ処理を実装できず。)
S3に利用明細がセットされることを契機に、テーブルに新規データを追加するLambdaが起動される。  

<img width="1000" alt="スクリーンショット 2024-11-30 16 51 30" src="https://github.com/user-attachments/assets/a315c98d-1055-4c48-b7c0-1d751f8cd96a">

フロントエンド、バックエンドおよびバッチ処理を分けた実装をすることで、それぞれに対してCI/CDを構築可能にした。
環境変数は全てSecretsManagerにて管理されている。  
<img width="600" alt="スクリーンショット 2024-11-30 16 52 53" src="https://github.com/user-attachments/assets/c2172df8-3ba8-4190-b628-688d337480f6">


## 4. ディレクトリ構成


## 5. アップデート予定

 - バックエンドのリファクタ作業  
 - フロントエンドのリファクタ作業
 - バッチ処理用(Lambda)のCI/CD構築
 - インフラのコスト改善
   - バックエンド用のECSを別サービスに変更
