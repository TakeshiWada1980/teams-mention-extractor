const rawHtmlEl = document.getElementById("rawHtml");
const resultEl = document.getElementById("result");
const noteEl = document.getElementById("note");

function parseMRI(mri) {
  if (!mri) return { raw: "", prefix: "", id_type: "", id: "" };
  const parts = mri.split(":");
  return {
    raw: mri,
    prefix: parts[0] || "",
    id_type: parts[1] || "",
    id: parts.slice(2).join(":") || "",
  };
}

function extractMentions(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const mentions = doc.querySelectorAll("mention");
  return Array.from(mentions).map((m, i) => {
    const mri = m.getAttribute("mri") || "";
    return {
      index: i + 1,
      ariaLabel: m.getAttribute("aria-label") || "",
      type: m.getAttribute("type") || "",
      mri: parseMRI(mri),
    };
  });
}

function createRow(label, value, emphasis = false, indent = false) {
  const row = document.createElement("div");
  row.className = indent ? "row row-indent" : "row";

  const labelEl = document.createElement("div");
  labelEl.className = "label";
  labelEl.textContent = label;

  const valueEl = document.createElement("div");
  valueEl.className = emphasis ? "value value-emphasis" : "value";
  valueEl.textContent = value || "";
  valueEl.title = "クリックしてコピー";

  valueEl.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(value || "");
      valueEl.classList.add("copied");
      setTimeout(() => valueEl.classList.remove("copied"), 600);
    } catch {
      valueEl.textContent = "コピー失敗";
      setTimeout(() => (valueEl.textContent = value || ""), 1500);
    }
  });

  row.appendChild(labelEl);
  row.appendChild(valueEl);
  return row;
}

function renderResults(items) {
  resultEl.innerHTML = "";

  if (!items.length) {
    noteEl.hidden = true;
    const empty = document.createElement("div");
    empty.className = "result-empty";
    empty.textContent = "mention が見つかりませんでした";
    resultEl.appendChild(empty);
    return;
  }

  noteEl.hidden = false;

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";

    const header = document.createElement("div");
    header.className = "card-header";
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = item.index;
    header.appendChild(badge);
    header.appendChild(
      document.createTextNode(item.ariaLabel || "（名前なし）"),
    );
    card.appendChild(header);

    const body = document.createElement("div");
    body.className = "card-body";

    body.appendChild(createRow("aria-label", item.ariaLabel));
    body.appendChild(createRow("type", item.type));
    body.appendChild(createRow("mri", item.mri.raw));

    const mriBlock = document.createElement("div");
    mriBlock.className = "mri-block";
    mriBlock.appendChild(createRow("prefix", item.mri.prefix, false, true));
    mriBlock.appendChild(createRow("id_type", item.mri.id_type, false, true));
    mriBlock.appendChild(createRow("id", item.mri.id, true, true));
    body.appendChild(mriBlock);

    card.appendChild(body);
    resultEl.appendChild(card);
  });
}

async function analyzeClipboard() {
  rawHtmlEl.value = "";
  resultEl.innerHTML = "";
  noteEl.hidden = true;

  const btn = document.getElementById("readBtn");
  btn.disabled = true;
  try {
    const items = await navigator.clipboard.read();
    let html = null;

    for (const item of items) {
      if (item.types.includes("text/html")) {
        const blob = await item.getType("text/html");
        html = await blob.text();
        break;
      }
    }

    if (!html) {
      const empty = document.createElement("div");
      empty.className = "result-empty";
      empty.textContent = "text/html が見つかりませんでした";
      resultEl.appendChild(empty);
      return;
    }

    rawHtmlEl.value = html;
    const mentions = extractMentions(html);
    renderResults(mentions);
  } catch (err) {
    const empty = document.createElement("div");
    empty.className = "result-empty";
    empty.textContent = "読み取り失敗: " + err.message;
    resultEl.appendChild(empty);
  } finally {
    btn.disabled = false;
  }
}

document.getElementById("readBtn").addEventListener("click", analyzeClipboard);
