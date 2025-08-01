🚀3 作目ポートフォリオ設計

## 📝 ① 画面設計（ワイヤーフレーム構成案）

**アプリ名：営業支援 CRM アプリ**

| 画面名         | 概要             | 主な機能                                        |
| -------------- | ---------------- | ----------------------------------------------- |
| ログイン画面   | ユーザー認証     | メール/パスワードログイン、エラーメッセージ表示 |
| ダッシュボード | 概要表示         | 営業成績、直近の予定、通知など                  |
| 顧客一覧画面   | 顧客リスト管理   | 顧客の検索・フィルター・並び替え・新規追加      |
| 顧客詳細画面   | 顧客プロフィール | 基本情報・商談履歴・タスク連携など              |
| 商談一覧画面   | 商談の管理       | 商談の状態別表示・絞り込み                      |
| 商談詳細画面   | 商談の詳細情報   | メモ、アクション履歴、進捗ステータス管理        |
| タスク管理画面 | 営業タスク一覧   | 期限・担当・ステータスごとのタスク管理          |
| 設定画面       | ユーザー設定など | プロフィール編集・通知設定・ログアウト          |

---

## 🗄 ② Firestore 設計テンプレート

**コレクション＆ドキュメント構造**

```
yaml
Copy code
users (コレクション)
 ┗ userId (ドキュメント)
     ┣ name: string
     ┣ email: string
     ┗ role: 'sales' | 'admin'

customers
 ┗ customerId
     ┣ name: string
     ┣ industry: string
     ┣ contact: string
     ┣ assignedUserId: string (参照)

deals
 ┗ dealId
     ┣ customerId: string (参照)
     ┣ title: string
     ┣ status: 'negotiating' | 'won' | 'lost'
     ┣ amount: number
     ┣ dueDate: timestamp
     ┣ createdAt: timestamp

tasks
 ┗ taskId
     ┣ userId: string (参照)
     ┣ dealId: string (参照)
     ┣ title: string
     ┣ status: 'todo' | 'in_progress' | 'done'
     ┣ dueDate: timestamp

notifications
 ┗ notificationId
     ┣ userId: string
     ┣ type: 'reminder' | 'info'
     ┣ message: string
     ┣ createdAt: timestamp

```

---

## 🎨 ③ UI モック案（簡易構成）

**主要 UI パーツのラフ構成**

- 🔐 **ログイン画面**
  - Email 入力
  - Password 入力
  - ログインボタン
- 📊 **ダッシュボード**
  - 本日の予定（カード型）
  - 月間売上（グラフ）
  - 通知バナー
- 🧑‍💼 **顧客一覧**
  - 検索ボックス
  - 顧客カード（名前、業種、直近商談）
- 💼 **商談詳細**
  - タイトル
  - 状態選択プルダウン
  - メモ欄 / 進捗履歴リスト

### ✅ タイトル：`3作目 実装チェックリスト`

```
css
Copy code
🚀 実装前準備
- [x] ワイヤーフレーム作成
- [ ] Firestoreスキーマ設計
- [ ] Figmaでラフモック作成

🧱 基本機能実装
- [ ] Firebase Auth（ログイン / 登録 / ログアウト）
- [ ] 顧客データの追加／編集／削除
- [ ] 商談（案件）データの登録／表示／更新
- [ ] ステータス変更機能（ドラッグ or セレクト）

🔍 ユーザー体験改善
- [ ] 検索機能（名前・キーワード）
- [ ] フィルター（ステータス・優先度）
- [ ] ダークモード切替
- [ ] モバイル対応チェック

📦 リリース準備
- [ ] README記述（構成図／技術スタック）
- [ ] 実装スクショの挿入
- [ ] Netlify／Vercelなどでデプロイ
- [ ] エージェント提出用にポートフォリオリンク化

```

### 🔥 効率的な開発ステップ順（おすすめ）

1. 📁 ディレクトリ構成の整理
   　 → これからの開発がスムーズに。ファイル管理を最初に固める。

2. 🔗 React Router の導入
   　 → 画面遷移ができると、ログイン画面やダッシュボードなど複数画面の実装が進めやすい。

3. 🔥 Firebase 初期化（Auth + Firestore）
   　 → 認証やデータベース連携の基盤作り。環境変数の管理もこのタイミングで。

4. 🔐 ログイン画面の実装
   　 → Firebase Auth と連携してユーザー認証を実装。

5. 📦 状態管理（Context API or Zustand）の準備
   　 → ログイン状態やユーザーデータの管理。Auth 連携後に設計すると効率的。

6. 📊 ダッシュボード画面構築
   　 → ユーザー認証後のメイン画面。API 連携や表示ロジックを組み込む。

7. 🧪 テスト環境 or デプロイ準備（Vercel など）
   　 → 一通り機能ができたら動作確認や本番環境準備。

ポイント
まずは 構成と画面遷移のベースを固めてから、

認証や状態管理の実装に進むのが効率的です。

UI やビジネスロジックはその後で整えていきましょう。

→ 一通り機能ができたら動作確認や本番環境準備。

### はい、フロント主導で進めるのは大丈夫ですし、むしろ今回のような Firebase（BaaS）を使う構成では非常に効率的です 💡

✅ フロント主導で進めるのが適している理由
理由 説明
🔌 バックエンドを自前で構築しない Firestore や Firebase Auth によって、サーバーなしで多くの機能をカバーできます。
🧪 UI 先行でユーザー体験を確認できる 実際に画面を動かしながら機能追加できるので、モック → 実装 → 改善がスムーズです。
🛠 バックエンドが必要になったら後付け可能 複雑な処理が出てきたときだけ Firebase Cloud Functions や Express などを追加できます。

🧭 フロント主導の進行フロー
React + Tailwind で画面をどんどん作る

ルーティングとログイン画面を先に整備

Firebase Auth を導入して認証付きに切り替える

Firestore でデータ取得 → 表示機能から実装

必要に応じてバック側（Cloud Functions など）を追加

✳️ フロント主導で注意すること
Firebase などの セキュリティルール（Firestore Rules） は必ず後で設計する

認証なしでは直接 Firestore にアクセスできてしまうので、Auth の導入を早めに

👉 結論：
✅ フロント主導でどんどん進めて大丈夫です！
必要に応じてバックの処理は後で補強していけば OK です。

### 🚀 開発の効率が良い順序ステップ（フロント主導）

🔧 ① プロジェクト基盤の整備（済）
✅ Vite + React + Tailwind 初期化
✅ ディレクトリ構成を frontend/ に整理
✅ ブラウザ表示確認済み

→ 完了！素晴らしいスタートです 🎉

🧭 ② ルーティング設定（React Router）
🔹 /src/routes にルーティング設定ファイルを作る
🔹 Login, Dashboard, CustomerList などのページ用意
🔹 ページ切り替えができるか確認

📦 使用パッケージ:

bash
Copy code
npm install react-router-dom
🔐 ③ Firebase Auth（ログイン機能）
🔹 Firebase プロジェクト作成
🔹 Firebase Auth 設定（Email/Password）
🔹 ログイン画面 + 認証フロー実装
🔹 ログイン状態でルート制限（保護ルート）

📦 使用パッケージ:

bash
Copy code
npm install firebase
📄 ④ Firestore 設計＆データ構造作成
🔹 Firestore にデータ構造作成（users, customers, deals...）
🔹 Firebase SDK を使って CRUD 操作を開始
🔹 顧客一覧や商談一覧など読み込み表示を開始

🧱 ⑤ 画面ごとの機能構築
画面 実装内容例
Dashboard 成績表示（ダミーデータから）
顧客一覧 Firestore からの読み込み・並び替えなど
顧客詳細 詳細表示・関連商談リスト
商談画面 状態別フィルタリング・更新機能
タスク管理 状態ごとにタスクを分類・完了チェックなど

✨ ⑥ ユーザー体験の改善
検索・絞り込み機能

ダークモード

ローディングスピナーやトースト通知

📦 ⑦ デプロイと提出用ポートフォリオ化
Vercel にデプロイ（frontend/ をルートに指定）

スクショ撮影・README の整理

提出用リンク化・動作確認

🧭 今すぐ始めるならこの順！
react-router-dom をインストール

/src/routes/index.jsx を作ってルーティング設定

/pages/Login.jsx などを作成

ルーティングが機能するか確認

Firebase プロジェクト連携へ移行（Auth から）

### ✅ 🔐 Firebase Auth 導入ステップ（Email/Password）

🧭 ステップ ①：Firebase プロジェクトを作成

🧭 ステップ ②：Firebase SDK をインストール

🧭 ステップ ③：Firebase 初期化ファイル作成

🧭 ステップ ⑤：Login 画面で認証処理を追加

🧭 ステップ ⑥：ログイン状態の管理と保護ルート

🧪 動作確認
Firebase Auth の「ユーザー」タブから、テスト用ユーザーを登録（Email/Password）

/ にアクセスしてログイン

成功すれば /dashboard にリダイレクト

未ログインで /dashboard にアクセスしようとすると / にリダイレクトされる

### ✅ Firebase 認証ルート機能 完成！

項目 状況
🔐 ログイン画面 表示 OK
🔐 Firebase Auth 接続 OK
🔁 ログイン状態の監視（AuthContext） OK
🔒 保護ルート処理（ProtectedRoute） OK
🔄 未ログイン時のリダイレクト / → /dashboard ✅ 成功！

次に進むステップ 🔽
ここからは「アプリの中身（機能）」を実装していくステージです。おすすめの順番はこちら：

🧭 次のおすすめ実装順（機能別）
📂 ① 顧客管理機能（Customer）
顧客一覧画面 /customers を作成

顧客追加フォーム（react-hook-form）

Firestore への保存＆取得

💼 ② 商談管理機能（Deal）
商談一覧 /deals

商談詳細 /deals/:id

ステータス選択（select or ドラッグ操作）

📅 ③ タスク管理（Tasks）
営業タスク一覧 /tasks

ステータスごとの絞り込み

タスク作成／更新

🔔 ④ 通知・ダッシュボード
/dashboard に統計・グラフ

通知一覧（リマインダー表示）

💡 実装の前にやると良いこと
src/pages/ に各ページファイルだけ用意（空で OK）

Firestore 設計にあわせて firebase/firestore.js を切る

レイアウトやナビバー（共通 UI）を追加
