const getAPI = () => window.API_BASE || "http://localhost:5000";
const el = (id) => document.getElementById(id);

function setInfoVisible(visible) {
  el("info").hidden = !visible;
}

function setDownloadLink(url) {
  const a = el("downloadLink");
  if (url) {
    a.href = url;
    a.textContent = "Direct link";
    a.classList.remove("hidden");
  } else {
    a.removeAttribute("href");
    a.textContent = "";
    a.classList.add("hidden");
  }
}

async function extractInfo() {
  const url = el("url").value.trim();
  if (!url) {
    alert("Please enter a URL");
    return;
  }
  setInfoVisible(false);
  setDownloadLink(null);
  el("formats").textContent = "Loading...";

  try {
    const res = await fetch(`${getAPI()}/extract`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }
    const data = await res.json();

    el("title").textContent = data.title || "(no title)";
    const thumb = (data.thumbnails || []).slice(-1)[0]?.url;
    if (thumb) {
      el("thumb").src = thumb;
      el("thumb").style.display = "block";
    } else {
      el("thumb").style.display = "none";
    }
    el("formats").textContent = JSON.stringify(
      (data.formats || []).map((f) => ({
        id: f.format_id,
        ext: f.ext,
        vcodec: f.vcodec,
        acodec: f.acodec,
        height: f.height,
        abr: f.abr,
        size: f.filesize,
        note: f.format_note,
      })),
      null,
      2
    );

    setInfoVisible(true);
  } catch (err) {
    console.error(err);
    alert(`Extraction failed: ${err.message}`);
    setInfoVisible(false);
  }
}

function makeDownloadURL() {
  const url = encodeURIComponent(el("url").value.trim());
  const kind = encodeURIComponent(el("kind").value);
  const quality = encodeURIComponent(el("quality").value);
  const vext = encodeURIComponent(el("vext").value);
  const aext = encodeURIComponent(el("aext").value);
  const filename = encodeURIComponent(el("filename").value.trim());
  const qp = new URLSearchParams({
    url,
    kind,
    quality,
    vext,
    aext,
  });
  if (filename) qp.set("filename", filename);
  return `${getAPI()}/download?${qp.toString()}`;
}

async function triggerDownload() {
  const dlUrl = makeDownloadURL();
  // For browsers, just navigate to the URL to let it stream/download
  setDownloadLink(dlUrl);
  window.location.href = dlUrl;
}

function saveApiBase() {
  const v = el("apiBase").value.trim();
  if (!v) return;
  localStorage.setItem("API_BASE", v);
  window.API_BASE = v;
  alert(`Saved API base: ${v}`);
}

document.addEventListener("DOMContentLoaded", () => {
  el("apiBase").value = getAPI();
  el("saveApiBase").addEventListener("click", saveApiBase);
  el("extract").addEventListener("click", extractInfo);
  el("download").addEventListener("click", triggerDownload);
});