// ===============================
// 除外リスト取得
// ===============================
async function getExclusionList() {
  return new Promise(resolve => {
    chrome.storage.sync.get({ excludeDomains: [] }, data => {
      resolve(data.excludeDomains);
    });
  });
}

// ===============================
// クッキー削除（除外リスト以外）
// ===============================
async function deleteCookies() {
  const exclude = await getExclusionList();

  chrome.cookies.getAll({}, cookies => {
    cookies.forEach(cookie => {
      const domain = cookie.domain.replace(/^\./, "");

      // 除外判定（includes の方が確実）
      if (exclude.some(ex => domain.includes(ex))) {
        return;
      }

      // URL を正しく生成
      const url =
        (cookie.secure ? "https://" : "http://") +
        domain +
        cookie.path;

      chrome.cookies.remove({
        url: url,
        name: cookie.name
      });
    });
  });
}

// ===============================
// キャッシュ削除（全期間）
// ===============================
function deleteCache() {
  chrome.browsingData.remove(
    { since: 0 },
    { cache: true, cacheStorage: true },
    () => console.log("Cache cleared")
  );
}

// ===============================
// 閲覧履歴削除（全期間）
// ===============================
function deleteHistory() {
  chrome.browsingData.remove(
    { since: 0 },
    { history: true },
    () => console.log("History cleared")
  );
}

// ===============================
// popup からのメッセージ受信
// ===============================
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "clean") {
    deleteCookies();
    deleteCache();
    deleteHistory();
    sendResponse({ status: "done" });
  }
});
