# chris58530.github.io

Personal site of Chris Su (小仔): apps, games and how to reach me.

Live at https://chris58530.github.io

## 「我最近在忙什麼」

這一區讀的是曬日子網站上的 `https://saidayapp.web.app/feed.json`，跟曬日子官網的「泡泡最近發了什麼」同一份資料。要更新就改 FameSim repo 的 `firebase/public/feed.json` 再部署 Firebase Hosting，兩個網站會一起變，這個 repo 不用動。

## 頁面

| 檔案 | 內容 |
| --- | --- |
| `index.html` | 首頁：自我介紹、數字、最近在忙什麼、三個分類入口 |
| `apps.html` | 上線中的 App、開發中、開源專案 |
| `games.html` | 遊戲 |
| `about.html` | 關於我、接案合作 |

四頁共用 `assets/site.css` 和 `assets/site.js`，聯絡區和頁尾每頁都有。舊的單頁錨點（例如 `/#famesim`）會自動轉到對應分頁。
