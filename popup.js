const input = document.getElementById("inputDomain");
const addBtn = document.getElementById("addBtn");
const cardList = document.getElementById("cardList");

// URL → ドメイン抽出
function extractDomain(input) {
  input = input.trim();

  if (!input) return "";

  try {
    const url = new URL(input);
    return url.hostname.replace(/^\./, "");
  } catch {
    return input.replace(/^\./, "");
  }
}

// カード描画
function renderCards(list) {
  cardList.innerHTML = "";
  list.forEach((domain, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <span>${domain}</span>
      <button data-index="${index}">✖</button>
    `;
    cardList.appendChild(card);
  });
}

// 初期ロード
chrome.storage.sync.get({ excludeDomains: [] }, data => {
  renderCards(data.excludeDomains);
});

// 追加ボタン
addBtn.onclick = () => {
  const domain = extractDomain(input.value);
  if (!domain) return;

  chrome.storage.sync.get({ excludeDomains: [] }, data => {
    if (!data.excludeDomains.includes(domain)) {
      data.excludeDomains.push(domain);
      chrome.storage.sync.set({ excludeDomains: data.excludeDomains });
      renderCards(data.excludeDomains);
    }
  });

  input.value = "";
};

// カードの削除
cardList.onclick = e => {
  if (e.target.tagName === "BUTTON") {
    const index = e.target.dataset.index;

    chrome.storage.sync.get({ excludeDomains: [] }, data => {
      data.excludeDomains.splice(index, 1);
      chrome.storage.sync.set({ excludeDomains: data.excludeDomains });
      renderCards(data.excludeDomains);
    });
  }
};

// 保存ボタン
document.getElementById("save").onclick = () => {
  alert("保存しました");
};

// クリーン実行
document.getElementById("clean").onclick = () => {
  chrome.runtime.sendMessage({ action: "clean" }, () => {
    alert("削除完了");
  });
};
