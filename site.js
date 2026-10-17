document.querySelectorAll(".menu-btn").forEach((menu) => {
  const nav = document.getElementById("nav");
  if (!nav) return;
  menu.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menu.setAttribute("aria-expanded", open ? "true" : "false");
  });
});

const cookie = document.getElementById("cookie");
if (cookie) {
  if (localStorage.getItem("ft-cookie")) cookie.hidden = true;
  const hide = (value) => {
    localStorage.setItem("ft-cookie", value);
    cookie.hidden = true;
  };
  document.getElementById("cookie-yes")?.addEventListener("click", () => hide("yes"));
  document.getElementById("cookie-no")?.addEventListener("click", () => hide("no"));
}

const stage = document.getElementById("stage");
if (stage && matchMedia("(pointer:fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  stage.addEventListener("mousemove", (event) => {
    const box = stage.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    stage.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
  });
  stage.addEventListener("mouseleave", () => { stage.style.transform = ""; });
}

const params = new URLSearchParams(location.search);
const title = document.querySelector("[data-project-title]");
if (title && params.get("name")) title.textContent = params.get("name");

document.getElementById("gen-pass")?.addEventListener("click", () => {
  const rows = [...document.querySelectorAll("#pass-table tbody tr")].filter((row) => row.querySelector("input[type=checkbox]")?.checked);
  const targets = rows.length ? rows : [...document.querySelectorAll("#pass-table tbody tr")];
  const dirty = targets.some((row) => row.dataset.secret);
  if (dirty && !confirm("У части папок пароль уже есть. Заменить его?")) return;
  targets.forEach((row) => {
    const pass = Math.random().toString(36).slice(2, 8).toUpperCase().replace(/0/g, "2").replace(/O/g, "A").replace(/1/g, "7").replace(/L/g, "M");
    row.dataset.secret = pass;
    row.querySelector("[data-pass]").textContent = pass;
  });
});

const saveText = (name, lines) => {
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
};
document.getElementById("export-excel")?.addEventListener("click", () => {
  const reviews = [...document.querySelectorAll(".review")];
  if (reviews.length && !document.getElementById("pass-table")) {
    const lines = ["Имя;Оценка;Текст;Где"];
    reviews.forEach((review) => {
      const name = review.querySelector("strong")?.textContent.trim() || "";
      const stars = review.querySelector(".stars")?.textContent.trim() || "";
      const text = review.querySelector("p")?.textContent.trim() || "";
      const where = review.querySelector(".hint")?.textContent.trim() || "";
      lines.push(`${name};${stars};${text};${where}`);
    });
    saveText("отзывы.csv", lines);
    return;
  }
  const rows = [...document.querySelectorAll("#pass-table tbody tr")];
  const picked = rows.filter((row) => row.querySelector("input[type=checkbox]")?.checked);
  const list = picked.length ? picked : rows;
  const lines = ["Имя папки;Пароль;Ссылка"];
  list.forEach((row, index) => {
    const name = row.querySelector("[data-name]")?.textContent.trim() || "";
    const pass = row.querySelector("[data-pass]")?.textContent.trim() || "";
    const slug = name.replace(/\s+/g, "-");
    lines.push(`${name};${pass};${1800 + index + 1}-${slug}`);
  });
  saveText("пароли-папок.csv", lines);
});

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const text = button.getAttribute("data-copy");
    try { await navigator.clipboard.writeText(text); } catch (error) {}
    const old = button.textContent;
    button.textContent = "Скопировано";
    setTimeout(() => { button.textContent = old; }, 1200);
  });
});

const openOverlay = (id) => {
  const node = document.getElementById(id);
  if (node) node.hidden = false;
};
document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => {
    document.getElementById(button.getAttribute("data-close")).hidden = true;
  });
});

const readList = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch (error) { return []; }
};
const readJson = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "");
    return value == null ? fallback : value;
  } catch (error) { return fallback; }
};
const writeList = (key, list) => localStorage.setItem(key, JSON.stringify(list));
const GALLERY_META = {
  wedding: { title: "Свадьба Марии и Ильи", date: "12 сентября", cover: "img/p1.jpg", until: "12 ноября 2026" },
  kindergarten: { title: "Садик «Ромашка», группа 5", date: "2 ноября", cover: "img/p5.jpg", until: "2 ноября 2026" },
  portrait: { title: "Портрет в студии", date: "18 ноября", cover: "img/cover.jpg", until: "18 ноября 2026" }
};
const GALLERY_DEFAULTS = {
  wedding: { secret: "свадьба", hidden: ["p5", "p6"], deleted: [], originals: false, small: true, open: true, watermark: true, guard: true },
  kindergarten: { secret: "ромашка", hidden: ["p5"], deleted: [], originals: false, small: true, open: false, watermark: false, guard: true },
  portrait: { secret: "студия", hidden: ["p6"], deleted: [], originals: true, small: false, watermark: false, guard: false, open: true }
};
const FOLDER_TREE = {
  wedding: [
    {
      id: "ceremony",
      name: "Церемония",
      cover: "img/p2.jpg",
      meta: "Удалится 12 ноября · 96 файлов · скачали 28",
      children: [
        { id: "prep", name: "Подготовка", cover: "img/p4.jpg", meta: "Удалится 12 ноября · 40 файлов · скачали 11" },
        { id: "banquet", name: "Банкет", cover: "img/p3.jpg", meta: "Удалится 12 ноября · 56 файлов · скачали 17" }
      ]
    },
    { id: "walk", name: "Прогулка", cover: "img/p1.jpg", meta: "Удалится 12 ноября · 90 файлов · скачали 18" }
  ],
  kindergarten: [
    {
      id: "group5",
      name: "Группа 5",
      cover: "img/p5.jpg",
      meta: "Раздельная выдача · удалится 2 ноября · 160 файлов",
      children: [
        { id: "morning", name: "Утренник", cover: "img/p6.jpg", meta: "Удалится 2 ноября · 80 файлов · скачали 9" }
      ]
    }
  ],
  portrait: [
    { id: "light", name: "Свет", cover: "img/cover.jpg", meta: "Удалится 18 ноября · 60 файлов · скачали 12" }
  ]
};
const FILE_CATALOG = [
  { id: "cover", name: "portrait.jpg", src: "img/cover.jpg", in: "wedding portrait", at: { wedding: "", portrait: "" } },
  { id: "p2", name: "ceremony-014.jpg", src: "img/p2.jpg", in: "wedding", at: { wedding: "ceremony" } },
  { id: "p3", name: "hands.jpg", src: "img/p3.jpg", in: "wedding kindergarten", at: { wedding: "", kindergarten: "group5" } },
  { id: "p4", name: "dance.mp4", src: "img/p4.jpg", in: "wedding", at: { wedding: "ceremony" } },
  { id: "p5", name: "balloons.jpg", src: "img/p5.jpg", in: "wedding kindergarten", at: { wedding: "prep", kindergarten: "group5" } },
  { id: "p6", name: "couple.jpg", src: "img/p6.jpg", in: "wedding portrait", at: { wedding: "", portrait: "light" } },
  { id: "pdf", name: "Список гостей.pdf", src: "", in: "wedding kindergarten", doc: true, at: { wedding: "banquet", kindergarten: "" } }
];
const userFolders = (gid) => {
  try { return JSON.parse(localStorage.getItem("ft-user-folders") || "{}")[gid] || []; } catch (error) { return []; }
};
const folderNodes = (gid) => {
  const extras = userFolders(gid);
  const pack = (item) => ({
    id: item.id,
    name: item.name,
    cover: item.cover || "img/p3.jpg",
    meta: item.meta || "Новая папка",
    children: extras.filter((row) => row.parent === item.id).map(pack)
  });
  const walk = (nodes) => (nodes || []).map((node) => ({
    ...node,
    children: [...walk(node.children || []), ...extras.filter((row) => row.parent === node.id).map(pack)]
  }));
  return [...walk(FOLDER_TREE[gid] || []), ...extras.filter((row) => !row.parent).map(pack)];
};
const filePlace = (file, gid) => {
  if (file.gallery) return file.folder || "";
  if (file.at && Object.prototype.hasOwnProperty.call(file.at, gid)) return file.at[gid];
  return "";
};
const filesInFolder = (gid, fid) => {
  const deleted = new Set(settings(gid).deleted || []);
  const place = fid || "";
  const base = FILE_CATALOG.filter((file) => (file.in || "").split(/\s+/).includes(gid) && filePlace(file, gid) === place && !deleted.has(file.id));
  const extra = readList("ft-user-files").filter((file) => file.gallery === gid && (file.folder || "") === place && !deleted.has(file.id));
  return [...base, ...extra];
};
const galleryId = () => {
  const id = new URLSearchParams(location.search).get("id");
  return GALLERY_DEFAULTS[id] ? id : "wedding";
};
const folderId = () => params.get("folder") || "";
const pageFile = () => (location.pathname.split("/").pop() || "").toLowerCase();
const loadSettings = () => {
  try { return JSON.parse(localStorage.getItem("ft-settings") || "{}"); } catch (error) { return {}; }
};
const settings = (id = galleryId()) => {
  const saved = loadSettings()[id] || {};
  const base = GALLERY_DEFAULTS[id] || GALLERY_DEFAULTS.wedding;
  return {
    ...base,
    ...saved,
    hidden: Array.isArray(saved.hidden) ? saved.hidden : base.hidden,
    deleted: Array.isArray(saved.deleted) ? saved.deleted : base.deleted
  };
};
const saveSettings = (patch, id = galleryId()) => {
  const all = loadSettings();
  all[id] = { ...settings(id), ...patch };
  localStorage.setItem("ft-settings", JSON.stringify(all));
};
const pending = {};
const liveSettings = (id = galleryId()) => {
  const base = settings(id);
  const extra = pending[id] || {};
  return {
    ...base,
    ...extra,
    hidden: Array.isArray(extra.hidden) ? extra.hidden : base.hidden,
    deleted: base.deleted
  };
};
const flashSaved = () => {
  let note = document.getElementById("saved-note");
  if (!note) {
    note = document.createElement("p");
    note.id = "saved-note";
    note.className = "saved-note";
    note.textContent = "Сохранено";
    document.body.appendChild(note);
  }
  note.hidden = false;
  clearTimeout(flashSaved.timer);
  flashSaved.timer = setTimeout(() => { note.hidden = true; }, 1600);
};
const revealSave = (id) => {
  const button = document.getElementById(id);
  if (button) button.hidden = false;
};
const goneGalleries = () => readList("ft-gone");
const goneFolders = () => readList("ft-gone-folders");
const folderStoreKey = (gid, fid) => `${gid}::${fid}`;
const locateFolder = (gid, fid, nodes = folderNodes(gid), ancestors = []) => {
  for (const node of nodes) {
    const path = [...ancestors, node];
    if (node.id === fid) return { node, ancestors, path };
    const nested = locateFolder(gid, fid, node.children || [], path);
    if (nested) return nested;
  }
  return null;
};
const isFolderGone = (gid, fid) => {
  const gone = new Set(goneFolders());
  const found = locateFolder(gid, fid);
  if (!found) return false;
  return found.path.some((node) => gone.has(`${gid}/${node.id}`));
};
const childFolders = (gid, fid) => {
  if (fid && isFolderGone(gid, fid)) return [];
  const nodes = fid ? (locateFolder(gid, fid)?.node.children || []) : folderNodes(gid);
  return nodes.filter((node) => !isFolderGone(gid, node.id));
};
const folderTitle = (gid, fid) => locateFolder(gid, fid)?.node.name || "";
const isClientGallery = () => pageFile() === "gallery.html";
const unlockKey = () => {
  const fid = folderId();
  const extra = fid ? (loadSettings()[folderStoreKey(galleryId(), fid)] || {}) : {};
  if (isClientGallery() && fid && String(extra.secret || "").trim()) return `ft-unlock-${folderStoreKey(galleryId(), fid)}`;
  return `ft-unlock-${galleryId()}`;
};
const unlocked = () => sessionStorage.getItem(unlockKey()) === "1";
const activeSettings = () => {
  const gid = galleryId();
  const base = liveSettings(gid);
  if (!isClientGallery()) return base;
  const fid = folderId();
  if (!fid) return base;
  const extra = loadSettings()[folderStoreKey(gid, fid)];
  if (!extra) return base;
  return {
    ...base,
    ...extra,
    hidden: Array.isArray(extra.hidden) ? extra.hidden : base.hidden,
    deleted: base.deleted
  };
};
const belongs = (node) => (node.dataset.in || "wedding").split(/\s+/).includes(galleryId());
const manageScope = () => {
  if (pageFile() !== "cabinet.html") return "";
  const gid = galleryId();
  const fid = folderId();
  if (!fid || !locateFolder(gid, fid)) return "";
  if (isFolderGone(gid, fid) || goneGalleries().includes(gid)) return "";
  if (childFolders(gid, fid).length) return "";
  return folderStoreKey(gid, fid);
};
const folderSettingsView = (gid, fid) => {
  const base = settings(gid);
  const key = folderStoreKey(gid, fid);
  const saved = loadSettings()[key] || {};
  const extra = pending[key] || {};
  return {
    ...base,
    ...saved,
    ...extra,
    hidden: Array.isArray(extra.hidden) ? extra.hidden : (Array.isArray(saved.hidden) ? saved.hidden : base.hidden),
    deleted: base.deleted
  };
};

const paintFiles = () => {
  const scope = manageScope();
  const state = scope ? folderSettingsView(galleryId(), folderId()) : activeSettings();
  document.querySelectorAll("[data-file]").forEach((node) => {
    if (!belongs(node) || state.deleted.includes(node.dataset.file)) {
      node.hidden = true;
      return;
    }
    const secret = state.hidden.includes(node.dataset.file);
    node.classList.toggle("is-hidden", secret);
    const hideBtn = node.querySelector("[data-hide]");
    if (hideBtn) hideBtn.textContent = secret ? (hideBtn.closest(".tile-drop") ? "Показать" : "Скрыт") : "Скрыть";
    const menuLabel = document.querySelector(`.tile-drop[data-for="${CSS.escape(node.dataset.file)}"] [data-hide]`);
    if (menuLabel) menuLabel.textContent = secret ? "Показать" : "Скрыть";
    node.hidden = Boolean(node.dataset.kind) && secret && !unlocked();
    if (node.dataset.kind === "file" && !state.open) node.hidden = true;
  });
  const rows = [...document.querySelectorAll("#file-list .file-row")].filter((row) => !row.hidden);
  const emptyFiles = document.getElementById("files-empty");
  if (emptyFiles) emptyFiles.hidden = rows.length > 0;
  const shots = [...document.querySelectorAll(".g-grid [data-file]")].filter((shot) => !shot.hidden);
  const emptyGallery = document.getElementById("gallery-empty");
  if (emptyGallery) emptyGallery.hidden = shots.length > 0;
  const query = (document.getElementById("split-query")?.value || "").trim().toLowerCase();
  const tileNodes = [...document.querySelectorAll("#photo-tiles [data-file]")];
  tileNodes.forEach((node) => {
    if (node.hidden) return;
    const name = (node.querySelector(".tile-name")?.textContent || "").toLowerCase();
    if (query && !name.includes(query)) node.hidden = true;
  });
  const emptyTiles = document.getElementById("tiles-empty");
  if (emptyTiles) emptyTiles.hidden = tileNodes.length === 0 || tileNodes.some((node) => !node.hidden);
  document.querySelectorAll("[data-download='file']").forEach((button) => { button.hidden = !state.originals; });
  document.querySelectorAll("[data-download='small']").forEach((button) => { button.hidden = !state.small; });
  const mark = document.getElementById("shot-wm");
  if (mark) mark.hidden = !state.watermark || state.originals;
  if (typeof window.ftPaintConsent === "function") window.ftPaintConsent();
};

document.querySelectorAll(".filters button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filters button").forEach((item) => item.classList.remove("on"));
    button.classList.add("on");
    const kind = button.dataset.filter;
    const state = activeSettings();
    const open = unlocked();
    document.querySelectorAll("[data-kind]").forEach((card) => {
      if (!belongs(card) || state.deleted.includes(card.dataset.file)) {
        card.hidden = true;
        return;
      }
      const kinds = card.dataset.kind.split(/\s+/);
      let marks = {};
      try { marks = JSON.parse(localStorage.getItem("ft-consent-marks") || "{}"); } catch (error) { marks = {}; }
      let byKind = kind !== "all" && !kinds.includes(kind);
      if (kind === "pub-ok") byKind = marks[card.dataset.file] !== "ok";
      if (kind === "pub-no") byKind = marks[card.dataset.file] !== "no";
      const secret = state.hidden.includes(card.dataset.file) && !open;
      const closedFile = card.dataset.kind === "file" && !state.open;
      card.hidden = byKind || secret || closedFile;
    });
  });
});

let named = false;
document.querySelectorAll(".heart").forEach((heart) => {
  heart.addEventListener("click", (event) => {
    event.stopPropagation();
    if (!named) {
      openOverlay("name-modal");
      named = true;
    }
    heart.classList.toggle("on");
    heart.textContent = heart.classList.contains("on") ? "♥" : "♡";
  });
});

document.querySelectorAll("[data-view]").forEach((card) => {
  card.addEventListener("click", () => {
    const view = card.getAttribute("data-view");
    if (view === "photo-view") {
      const source = card.querySelector("img");
      const viewer = document.querySelector("#photo-view img");
      if (source && viewer) viewer.src = source.src;
      const label = document.querySelector("#photo-view .ov-bar span");
      if (label && source) label.textContent = source.src.split("/").pop();
      const commentBtn = document.getElementById("viewer-comment");
      if (commentBtn) commentBtn.dataset.comment = card.dataset.file || "";
    }
    openOverlay(view);
  });
});

const saveLink = (href, name) => {
  const link = document.createElement("a");
  link.href = href;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
};
let guardPause = false;
const shareBlob = async (blob, name) => {
  try {
    const file = new File([blob], name, { type: blob.type || "image/jpeg" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: name });
      return true;
    }
  } catch (error) {}
  return false;
};
const shareUrl = async (href, name) => {
  try {
    const response = await fetch(href);
    const blob = await response.blob();
    return shareBlob(blob, name);
  } catch (error) {
    return false;
  }
};
const deliverDownload = async (kind, src, name, button) => {
  guardPause = true;
  setTimeout(() => { guardPause = false; }, 2000);
  if (kind === "small") {
    const image = new Image();
    image.src = src;
    await new Promise((resolve) => { image.onload = resolve; image.onerror = resolve; });
    const max = 960;
    const scale = Math.min(1, max / Math.max(image.width || max, image.height || max));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round((image.width || max) * scale));
    canvas.height = Math.max(1, Math.round((image.height || max) * scale));
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.72));
    const fileName = name.replace(/\.\w+$/, "") + "-small.jpg";
    if (blob) {
      const shared = await shareBlob(blob, fileName);
      if (!shared) saveLink(URL.createObjectURL(blob), fileName);
    }
  } else {
    const shared = await shareUrl(src, name);
    if (!shared) saveLink(src, name);
  }
  if (!button) return;
  const old = button.textContent;
  button.textContent = "Скачивается";
  setTimeout(() => { button.textContent = old; }, 1200);
};
document.querySelectorAll("[data-download]").forEach((button) => {
  button.addEventListener("click", async (event) => {
    event.stopPropagation();
    const kind = button.dataset.download;
    if (kind === "review") {
      openOverlay("review-modal");
      return;
    }
    if (kind === "project") {
      openOverlay("phone-choice");
      return;
    }
    const img = document.querySelector("#photo-view img");
    const src = img?.getAttribute("src") || "img/cover.jpg";
    const name = (img?.src || "photo.jpg").split("/").pop().split("?")[0];
    const run = () => deliverDownload(kind, src, name, button);
    if (typeof window.ftGateDownload === "function") {
      window.ftGateDownload(run);
      return;
    }
    await run();
  });
});


const brandPending = {};
let logoCleared = false;
let cropPending = null;
let logoCropPending = null;
const defaultCrop = () => ({ x: 0, y: 0, z: 1 });
const storedCrop = () => {
  try {
    const raw = JSON.parse(localStorage.getItem("ft-photo-crop") || "null");
    if (raw && typeof raw === "object") {
      return {
        x: Number(raw.x) || 0,
        y: Number(raw.y) || 0,
        z: Math.min(2.5, Math.max(1, Number(raw.z) || 1))
      };
    }
  } catch (error) { /* keep the default crop */ }
  return defaultCrop();
};
const liveCrop = () => cropPending || storedCrop();
const storedLogoCrop = () => {
  try {
    const raw = JSON.parse(localStorage.getItem("ft-logo-crop") || "null");
    if (raw && typeof raw === "object") {
      return {
        x: Number(raw.x) || 0,
        y: Number(raw.y) || 0,
        z: Math.min(2.5, Math.max(1, Number(raw.z) || 1))
      };
    }
  } catch (error) { /* keep the default crop */ }
  return defaultCrop();
};
const liveLogoCrop = () => logoCropPending || storedLogoCrop();
const currentLogo = () => {
  if (logoCleared) return "";
  if (Object.prototype.hasOwnProperty.call(brandPending, "ft-logo")) return brandPending["ft-logo"] || "";
  return localStorage.getItem("ft-logo") || "";
};
const currentPhoto = () => {
  if (Object.prototype.hasOwnProperty.call(brandPending, "ft-photo")) return brandPending["ft-photo"] || "";
  return localStorage.getItem("ft-photo") || "";
};
const placePortrait = (frame, img, crop) => {
  const size = frame.clientWidth || 168;
  const nw = img.naturalWidth || size;
  const nh = img.naturalHeight || size;
  const z = Math.min(2.5, Math.max(1, Number(crop.z) || 1));
  const cover = Math.max(size / nw, size / nh);
  const scale = cover * z;
  const slack = size * 0.28;
  const maxX = Math.max(slack, (nw * scale - size) / 2);
  const maxY = Math.max(slack, (nh * scale - size) / 2);
  const ox = Math.max(-maxX, Math.min(maxX, (Number(crop.x) || 0) * size));
  const oy = Math.max(-maxY, Math.min(maxY, (Number(crop.y) || 0) * size));
  img.style.width = `${nw}px`;
  img.style.height = `${nh}px`;
  img.style.transform = `translate(-50%, -50%) translate(${ox}px, ${oy}px) scale(${scale})`;
  return { x: size ? ox / size : 0, y: size ? oy / size : 0, z };
};
const layoutPortraits = () => {
  const crop = liveCrop();
  let placed = null;
  document.querySelectorAll("[data-portrait]").forEach((frame) => {
    const img = frame.querySelector("[data-use='photo']");
    if (!img || img.hidden || !img.naturalWidth) return;
    const next = placePortrait(frame, img, crop);
    if (frame.dataset.crop === "edit") placed = next;
  });
  if (cropPending && placed) cropPending = placed;
};
const layoutLogos = () => {
  const crop = liveLogoCrop();
  let placed = null;
  document.querySelectorAll("[data-logo-frame]").forEach((frame) => {
    const img = frame.querySelector("[data-use='logo']");
    if (!img || img.hidden || !img.naturalWidth) return;
    const next = placePortrait(frame, img, crop);
    if (frame.dataset.crop === "edit") placed = next;
  });
  if (logoCropPending && placed) logoCropPending = placed;
};
const bindPortrait = (img, photo) => {
  const draw = () => layoutPortraits();
  if (!photo) {
    img.hidden = true;
    img.removeAttribute("src");
    delete img.dataset.bound;
    return;
  }
  img.hidden = false;
  if (img.dataset.bound === photo && img.complete && img.naturalWidth) {
    draw();
    return;
  }
  img.dataset.bound = photo;
  img.onload = draw;
  img.src = photo;
};
const applyBrand = () => {
  const photo = currentPhoto();
  const logo = currentLogo();
  document.querySelectorAll("[data-portrait]").forEach((frame) => {
    const img = frame.querySelector("[data-use='photo']");
    if (!img) return;
    const show = Boolean(photo) || frame.dataset.crop === "edit";
    frame.hidden = !show;
    frame.classList.toggle("is-empty", !photo);
    bindPortrait(img, photo);
  });
  requestAnimationFrame(() => layoutPortraits());
  document.querySelectorAll("[data-logo-frame]").forEach((frame) => {
    const img = frame.querySelector("[data-use='logo']");
    if (!img) return;
    frame.hidden = !logo;
    frame.classList.toggle("is-empty", !logo);
    if (!logo) {
      img.hidden = true;
      img.removeAttribute("src");
      delete img.dataset.bound;
      return;
    }
    img.hidden = false;
    if (img.dataset.bound === logo && img.complete && img.naturalWidth) {
      layoutLogos();
      return;
    }
    img.dataset.bound = logo;
    img.onload = () => layoutLogos();
    img.src = logo;
  });
  document.querySelectorAll("[data-use='logo']").forEach((img) => {
    if (img.closest("[data-logo-frame]")) return;
    if (logo) {
      img.src = logo;
      img.hidden = false;
    } else {
      img.hidden = true;
      img.removeAttribute("src");
    }
  });
  document.querySelectorAll("[data-logo-slot]").forEach((slot) => { slot.hidden = !logo; });
  const deleteLogo = document.getElementById("delete-logo");
  if (deleteLogo) deleteLogo.hidden = !logo;
  const zoomWrap = document.getElementById("photo-zoom-wrap");
  const zoom = document.getElementById("photo-zoom");
  if (zoomWrap) zoomWrap.hidden = !photo;
  if (zoom && document.activeElement !== zoom) zoom.value = String(liveCrop().z);
};
const storeImage = (file, key, max) => {
  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, max / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const keepAlpha = key === "ft-logo";
      brandPending[key] = keepAlpha ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", 0.86);
      if (key === "ft-logo") {
        logoCleared = false;
        logoCropPending = defaultCrop();
      }
      if (key === "ft-photo") cropPending = defaultCrop();
      applyBrand();
      revealSave("save-profile");
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
};
document.querySelectorAll("[data-brand]").forEach((input) => {
  input.addEventListener("change", () => {
    const file = input.files && input.files[0];
    if (!file) return;
    const logo = input.dataset.brand === "logo";
    storeImage(file, logo ? "ft-logo" : "ft-photo", logo ? 1200 : 900);
  });
});
document.getElementById("delete-logo")?.addEventListener("click", () => {
  logoCleared = true;
  delete brandPending["ft-logo"];
  applyBrand();
  revealSave("save-profile");
});
document.getElementById("photo-zoom")?.addEventListener("input", (event) => {
  const prev = liveCrop();
  cropPending = { x: prev.x, y: prev.y, z: Number(event.target.value) };
  layoutPortraits();
  revealSave("save-profile");
});
document.querySelectorAll("[data-crop='edit']").forEach((frame) => {
  let drag = null;
  const logoFrame = frame.hasAttribute("data-logo-frame");
  frame.addEventListener("pointerdown", (event) => {
    if (event.target.closest("[data-zoom]")) return;
    const img = frame.querySelector(logoFrame ? "[data-use='logo']" : "[data-use='photo']");
    if (!img || img.hidden || (logoFrame ? !currentLogo() : !currentPhoto())) return;
    frame.setPointerCapture(event.pointerId);
    frame.classList.add("is-dragging");
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, crop: { ...(logoFrame ? liveLogoCrop() : liveCrop()) } };
    event.preventDefault();
  });
  frame.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    event.preventDefault();
    const img = frame.querySelector(logoFrame ? "[data-use='logo']" : "[data-use='photo']");
    const size = frame.clientWidth || 168;
    const next = placePortrait(frame, img, {
      x: drag.crop.x + (event.clientX - drag.x) / size,
      y: drag.crop.y + (event.clientY - drag.y) / size,
      z: drag.crop.z
    });
    if (logoFrame) logoCropPending = next;
    else cropPending = next;
    revealSave("save-profile");
  });
  const endDrag = (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    drag = null;
    frame.classList.remove("is-dragging");
  };
  frame.addEventListener("pointerup", endDrag);
  frame.addEventListener("pointercancel", endDrag);
});
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-zoom]");
  if (!button) return;
  const frame = button.closest("[data-crop='edit']");
  if (!frame) return;
  event.preventDefault();
  event.stopPropagation();
  const logoFrame = frame.hasAttribute("data-logo-frame");
  const prev = logoFrame ? liveLogoCrop() : liveCrop();
  const step = button.dataset.zoom === "in" ? 0.15 : -0.15;
  const next = { x: prev.x, y: prev.y, z: Math.min(2.5, Math.max(1, (Number(prev.z) || 1) + step)) };
  const img = frame.querySelector(logoFrame ? "[data-use='logo']" : "[data-use='photo']");
  const placed = img && !img.hidden && img.naturalWidth ? placePortrait(frame, img, next) : next;
  if (logoFrame) logoCropPending = placed;
  else cropPending = placed;
  revealSave("save-profile");
});
window.addEventListener("resize", () => layoutPortraits());
applyBrand();

const meta = GALLERY_META[galleryId()];
document.querySelectorAll("[data-gallery-title]").forEach((node) => { node.textContent = meta.title; });
document.querySelectorAll("[data-gallery-date]").forEach((node) => { node.textContent = meta.date; });
document.querySelectorAll("[data-gallery-cover]").forEach((img) => { img.src = meta.cover; });
if (title && !params.get("name")) title.textContent = meta.title;
if (folderId() && folderTitle(galleryId(), folderId())) {
  const name = folderTitle(galleryId(), folderId());
  if (title && !params.get("name")) title.textContent = name;
  if (isClientGallery() || pageFile() === "project.html") {
    if (isClientGallery()) document.querySelectorAll("[data-gallery-title]").forEach((node) => { node.textContent = name; });
    document.title = `${name} — ФотоТранзит`;
  }
  const frames = document.querySelector("#file-manager h2");
  if (frames) frames.textContent = name;
}

document.querySelectorAll("a[href]").forEach((link) => {
  const href = link.getAttribute("href");
  if (!href || href.startsWith("#") || href.includes("://")) return;
  const file = href.split("?")[0].split("/").pop();
  if (!["project.html", "gallery.html", "access.html", "design.html", "download.html", "reviews.html"].includes(file)) return;
  if (new URL(href, location.href).searchParams.get("id")) return;
  const next = new URLSearchParams();
  next.set("id", galleryId());
  if (folderId()) next.set("folder", folderId());
  link.setAttribute("href", `${file}?${next.toString()}`);
});

const secretSet = document.getElementById("secret-set");
if (secretSet) secretSet.value = settings().secret;
secretSet?.addEventListener("input", () => {
  pending[galleryId()] = { ...(pending[galleryId()] || {}), secret: secretSet.value.trim() };
  revealSave("save-project");
});

document.querySelectorAll("[data-opt]").forEach((field) => {
  const key = field.dataset.opt;
  const value = settings()[key];
  if (field.type === "checkbox") field.checked = Boolean(value);
  else if (value != null) field.value = value;
  field.addEventListener("change", () => {
    const id = galleryId();
    pending[id] = { ...(pending[id] || {}), [key]: field.type === "checkbox" ? field.checked : field.value };
    revealSave("save-download");
  });
});
document.getElementById("save-project")?.addEventListener("click", () => {
  const id = galleryId();
  if (pending[id]) saveSettings(pending[id], id);
  delete pending[id];
  document.getElementById("save-project").hidden = true;
  paintFiles();
  flashSaved();
});
document.getElementById("save-download")?.addEventListener("click", () => {
  const id = galleryId();
  if (pending[id]) saveSettings(pending[id], id);
  delete pending[id];
  document.getElementById("save-download").hidden = true;
  paintFiles();
  flashSaved();
});

document.querySelectorAll("[data-only]").forEach((node) => {
  node.hidden = node.dataset.only !== galleryId();
});
const accessOther = document.getElementById("access-other");
if (accessOther) accessOther.hidden = galleryId() === "kindergarten";

document.getElementById("secret-ask")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const note = document.getElementById("secret-note");
  const code = document.getElementById("secret-try").value.trim();
  const saved = activeSettings().secret.trim();
  if (!saved) {
    note.textContent = "Для этой галереи код не задан.";
    return;
  }
  if (code !== saved) {
    note.textContent = "Код не подошёл к этой галерее.";
    return;
  }
  sessionStorage.setItem(unlockKey(), "1");
  note.textContent = "Скрытые кадры этой галереи открыты.";
  paintFiles();
});

const closeTileMenus = () => {
  document.querySelectorAll(".tile-drop").forEach((menu) => { menu.hidden = true; });
  document.querySelectorAll(".tile-more").forEach((button) => button.setAttribute("aria-expanded", "false"));
};
const menuOfTile = (tile) => tile?.querySelector(".tile-drop") || document.querySelector(`.tile-drop[data-for="${tile?.dataset.file || ""}"]`);
const fileHost = (node) => {
  const row = node.closest(".file-row, .photo-tile");
  if (row) return row;
  const id = node.closest(".tile-drop")?.dataset.for;
  if (!id) return node.closest("[data-file]");
  return document.querySelector(`#photo-tiles [data-file="${CSS.escape(id)}"]`);
};
const placeAnchored = (anchor, menu) => {
  if (menu.parentElement !== document.body) document.body.appendChild(menu);
  menu.hidden = false;
  menu.style.position = "fixed";
  menu.style.right = "auto";
  menu.style.bottom = "auto";
  anchor.setAttribute("aria-expanded", "true");
  const margin = 8;
  const rect = anchor.getBoundingClientRect();
  const width = Math.min(Math.max(menu.offsetWidth || 200, 200), window.innerWidth - margin * 2);
  const height = menu.offsetHeight || 40;
  let left = rect.left;
  if (left + width > window.innerWidth - margin) left = rect.right - width;
  left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));
  let top = rect.bottom + 6;
  if (top + height > window.innerHeight - margin) {
    const above = rect.top - height - 6;
    top = above >= margin ? above : Math.max(margin, window.innerHeight - height - margin);
  }
  menu.style.left = `${Math.round(left)}px`;
  menu.style.top = `${Math.round(top)}px`;
};
let anchoredMenu = null;
let anchoredButton = null;
const placeTileMenu = (anchor, menu) => {
  const seen = anchor.getBoundingClientRect();
  if (seen.bottom < 72 || seen.top > window.innerHeight - 72) {
    anchor.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
  placeAnchored(anchor, menu);
  anchoredMenu = menu;
  anchoredButton = anchor;
};
window.addEventListener("resize", () => {
  if (anchoredMenu && anchoredButton && !anchoredMenu.hidden) placeAnchored(anchoredButton, anchoredMenu);
});
window.addEventListener("scroll", () => {
  if (anchoredMenu && anchoredButton && !anchoredMenu.hidden) placeAnchored(anchoredButton, anchoredMenu);
}, true);
document.addEventListener("click", (event) => {
  const more = event.target.closest(".tile-more");
  if (more) {
    event.preventDefault();
    event.stopPropagation();
    const menu = menuOfTile(more.closest(".photo-tile"));
    const willOpen = Boolean(menu && menu.hidden);
    closeTileMenus();
    if (willOpen && menu) placeTileMenu(more, menu);
    return;
  }
  if (!event.target.closest(".tile-drop")) closeTileMenus();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeTileMenus();
});
document.addEventListener("click", (event) => {
  const heart = event.target.closest(".photo-tile .heart");
  if (!heart) return;
  event.preventDefault();
  heart.classList.toggle("on");
  heart.textContent = heart.classList.contains("on") ? "♥" : "♡";
});
document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-tile-download]");
  if (!button) return;
  event.preventDefault();
  const tile = fileHost(button);
  const kind = button.dataset.tileDownload;
  closeTileMenus();
  if (kind === "review") {
    openOverlay("review-modal");
    return;
  }
  const src = tile?.querySelector("img")?.getAttribute("src") || "";
  const name = tile?.querySelector(".tile-name")?.textContent || "photo.jpg";
  if (!src) return;
  await deliverDownload(kind, src, name, button);
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-hide]");
  if (!button) return;
  const row = fileHost(button);
  if (!row) return;
  const file = row.dataset.file;
  const scope = manageScope();
  const id = scope || galleryId();
  const list = (scope ? folderSettingsView(galleryId(), folderId()) : liveSettings(id)).hidden;
  const hiding = !list.includes(file);
  const next = hiding ? [...list, file] : list.filter((item) => item !== file);
  pending[id] = { ...(pending[id] || {}), hidden: next };
  revealSave(scope ? "save-folder-manage" : "save-project");
  if (button.closest(".tile-drop")) closeTileMenus();
  paintFiles();
  if (hiding) openSecretPanel(galleryId(), folderId() || "");
});

const fileLabel = (row, fallback) => row?.querySelector(".tile-name")?.textContent || row?.querySelector("h3")?.textContent || row?.querySelector("span")?.textContent || fallback || "файл";
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-del-file]");
  if (!button) return;
  const row = fileHost(button);
  if (!row || !belongs(row)) return;
  const name = fileLabel(row, "файл");
  const gid = galleryId();
  const fileId = row.dataset.file;
  askDelete(name, {
    trash: () => {
      trashFile(gid, fileId, name);
      if (button.closest(".tile-drop")) closeTileMenus();
      paintFiles();
      if (pageFile() === "cabinet.html") mountFolderBrowser();
    },
    forever: () => {
      purgeFile(gid, fileId);
      if (button.closest(".tile-drop")) closeTileMenus();
      paintFiles();
      if (pageFile() === "cabinet.html") mountFolderBrowser();
    }
  });
});

document.getElementById("delete-all-files")?.addEventListener("click", () => {
  const rows = [...document.querySelectorAll("#file-list [data-file]")].filter((row) => belongs(row) && !settings().deleted.includes(row.dataset.file));
  if (!rows.length) return;
  const gid = galleryId();
  askDelete("все файлы", {
    trash: () => {
      rows.forEach((row) => trashFile(gid, row.dataset.file, fileLabel(row, "файл")));
      paintFiles();
    },
    forever: () => {
      saveSettings({ deleted: [...new Set([...settings(gid).deleted, ...rows.map((row) => row.dataset.file)])] }, gid);
      rows.forEach((row) => dropTrash((item) => item.kind === "file" && item.id === row.dataset.file && item.gallery === gid));
      paintFiles();
    }
  });
});

const loadTrash = () => readList("ft-trash");
const saveTrash = (list) => writeList("ft-trash", list);
const dropTrash = (match) => saveTrash(loadTrash().filter((item) => !match(item)));
const pushTrash = (item) => {
  const list = loadTrash().filter((row) => !(row.kind === item.kind && row.id === item.id && (row.gallery || "") === (item.gallery || "")));
  list.push({ ...item, at: Date.now() });
  saveTrash(list);
};
const galleryTrashSnapshot = (id, card) => ({
  kind: "gallery",
  id,
  gallery: id,
  title: card?.querySelector("h3")?.textContent?.trim() || GALLERY_META[id]?.title || id,
  meta: card?.querySelector("p")?.textContent?.trim() || "",
  cover: card?.querySelector("img")?.getAttribute("src") || GALLERY_META[id]?.cover || ""
});
const moveGalleryToTrash = (id, card) => {
  if (!id) return;
  pushTrash(galleryTrashSnapshot(id, card));
  writeList("ft-gone", [...new Set([...goneGalleries(), id])]);
};
const purgeGallery = (id) => {
  if (!id) return;
  dropTrash((item) => (item.kind || "gallery") === "gallery" && item.id === id);
  writeList("ft-gone", [...new Set([...goneGalleries(), id])]);
};
const purgeFile = (gid, fileId) => {
  const gone = new Set([...(settings(gid).deleted || []), fileId]);
  saveSettings({ deleted: [...gone] }, gid);
  dropTrash((item) => item.kind === "file" && item.id === fileId && item.gallery === gid);
};
const trashFile = (gid, fileId, name) => {
  const gone = new Set([...(settings(gid).deleted || []), fileId]);
  saveSettings({ deleted: [...gone] }, gid);
  pushTrash({ kind: "file", id: fileId, gallery: gid, folder: folderId(), title: name || "файл" });
};
const markFolderGone = (gid, fid) => {
  writeList("ft-gone-folders", [...new Set([...goneFolders(), `${gid}/${fid}`])]);
};
const purgeFolder = (gid, fid) => {
  markFolderGone(gid, fid);
  dropTrash((item) => item.kind === "folder" && item.id === fid && item.gallery === gid);
};
const trashFolder = (gid, fid, name, cover) => {
  markFolderGone(gid, fid);
  pushTrash({ kind: "folder", id: fid, gallery: gid, title: name || "папка", cover: cover || "" });
};
let deleteJob = null;
const closeDeleteAsk = () => {
  const modal = document.getElementById("delete-ask");
  if (modal) modal.hidden = true;
  deleteJob = null;
};
const askDelete = (name, job) => {
  deleteJob = job;
  const text = document.getElementById("delete-ask-text");
  if (text) text.textContent = `Что сделать с «${name}»?`;
  const modal = document.getElementById("delete-ask");
  if (!modal) {
    if (job?.trash) job.trash();
    return;
  }
  openOverlay("delete-ask");
};
document.getElementById("delete-ask-form")?.addEventListener("submit", (event) => event.preventDefault());
document.getElementById("delete-cancel")?.addEventListener("click", () => closeDeleteAsk());
document.getElementById("delete-forever")?.addEventListener("click", () => {
  const job = deleteJob;
  closeDeleteAsk();
  job?.forever?.();
});
document.getElementById("delete-to-trash")?.addEventListener("click", () => {
  const job = deleteJob;
  closeDeleteAsk();
  job?.trash?.();
});
document.getElementById("delete-gallery")?.addEventListener("click", () => {
  const title = document.querySelector("[data-project-title]")?.textContent || "галерею";
  const id = galleryId();
  askDelete(title, {
    trash: () => {
      moveGalleryToTrash(id);
      location.href = "cabinet.html?view=trash";
    },
    forever: () => {
      purgeGallery(id);
      location.href = "cabinet.html";
    }
  });
});

document.querySelectorAll("[data-gallery]").forEach((card) => {
  if (goneGalleries().includes(card.dataset.gallery)) card.remove();
});
const galleryCards = document.getElementById("gallery-cards");
const galleriesEmpty = document.getElementById("galleries-empty");
if (galleryCards && galleriesEmpty) galleriesEmpty.hidden = galleryCards.children.length > 0;
function fitCardGrid(board) {
  if (!board || board.hidden) return;
  const count = [...board.children].filter((node) => node.classList && node.classList.contains("gcard") && !node.hidden).length;
  const width = board.clientWidth || 320;
  const gap = 12;
  const minCard = width < 700 ? 150 : 120;
  const maxFit = Math.max(1, Math.floor((width + gap) / (minCard + gap)));
  const cols = count <= 1 ? 2 : Math.min(Math.max(count, 1), 6, maxFit);
  board.style.setProperty("--card-cols", String(cols));
}
function fitCardGrids() {
  document.querySelectorAll("#gallery-cards, #folder-cards").forEach((board) => fitCardGrid(board));
}
fitCardGrids();
window.addEventListener("resize", () => fitCardGrids());

document.querySelectorAll("[data-del-gallery]").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest("[data-gallery]");
    const name = card.querySelector("h3")?.textContent || "галерею";
    const id = card.dataset.gallery;
    askDelete(name, {
      trash: () => {
        moveGalleryToTrash(id, card);
        card.remove();
        if (galleriesEmpty) galleriesEmpty.hidden = galleryCards.children.length > 0;
        fitCardGrids();
      },
      forever: () => {
        purgeGallery(id);
        card.remove();
        if (galleriesEmpty) galleriesEmpty.hidden = galleryCards.children.length > 0;
        fitCardGrids();
      }
    });
  });
});

let settingsCard = "wedding";
let settingsFolder = "";
const fillCardSettings = (id, folder = "") => {
  settingsFolder = folder || "";
  settingsCard = folder ? folderStoreKey(id, folder) : id;
  delete pending[settingsCard];
  const saveCard = document.getElementById("save-card");
  if (saveCard) saveCard.hidden = true;
  const galleryState = settings(id);
  const saved = folder ? (loadSettings()[settingsCard] || {}) : {};
  const state = folder ? {
    ...galleryState,
    ...saved,
    hidden: Array.isArray(saved.hidden) ? saved.hidden : galleryState.hidden,
    deleted: galleryState.deleted
  } : galleryState;
  const titleNode = document.getElementById("card-settings-title");
  if (titleNode) titleNode.textContent = folder ? (folderTitle(id, folder) || GALLERY_META[id].title) : GALLERY_META[id].title;
  const hint = document.getElementById("card-settings-hint");
  if (hint) hint.textContent = folder ? "Эти переключатели действуют только на выбранную папку." : "Эти переключатели действуют только на выбранную галерею.";
  const passLabel = document.getElementById("card-pass-label");
  const pass = document.getElementById("card-folder-pass");
  if (passLabel) passLabel.hidden = !folder;
  if (pass) pass.value = folder ? (folderAccessOf(id, folder).password || "") : "";
  document.querySelectorAll("[data-card-opt]").forEach((field) => {
    field.checked = Boolean(state[field.dataset.cardOpt]);
  });
  const files = document.getElementById("card-files");
  if (files) {
    const next = new URLSearchParams();
    next.set("id", id);
    if (folder) next.set("folder", folder);
    files.href = `project.html?${next.toString()}`;
  }
};
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-open-settings]");
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();
  const card = button.closest("[data-gallery]");
  if (!card) return;
  fillCardSettings(card.dataset.gallery, card.dataset.folder || "");
  openOverlay("card-settings");
});
document.querySelector("#card-settings form")?.addEventListener("submit", (event) => event.preventDefault());
document.getElementById("card-folder-pass")?.addEventListener("input", (event) => {
  if (!settingsFolder) return;
  const gid = settingsCard.split("::")[0] || galleryId();
  saveFolderAccess(gid, settingsFolder, { password: event.target.value });
  const field = document.querySelector(`#split-list [data-folder="${CSS.escape(settingsFolder)}"] .split-pass`);
  if (field) field.value = event.target.value;
});
document.getElementById("card-files")?.addEventListener("click", (event) => {
  event.preventDefault();
  const gid = settingsFolder ? (settingsCard.split("::")[0] || galleryId()) : settingsCard;
  openSecretPanel(gid, settingsFolder || "");
});
document.querySelector("#card-settings [data-close='card-settings']")?.addEventListener("click", () => {
  document.getElementById("save-card")?.click();
});
document.querySelectorAll("[data-card-opt]").forEach((field) => {
  field.addEventListener("change", () => {
    pending[settingsCard] = { ...(pending[settingsCard] || {}), [field.dataset.cardOpt]: field.checked };
    revealSave("save-card");
  });
});
document.getElementById("save-card")?.addEventListener("click", () => {
  if (pending[settingsCard]) {
    if (settingsFolder) {
      const gid = settingsCard.split("::")[0];
      const all = loadSettings();
      all[settingsCard] = { ...settings(gid), ...(all[settingsCard] || {}), ...pending[settingsCard] };
      localStorage.setItem("ft-settings", JSON.stringify(all));
    } else {
      saveSettings(pending[settingsCard], settingsCard);
    }
  }
  delete pending[settingsCard];
  document.getElementById("save-card").hidden = true;
  paintFiles();
  flashSaved();
});

document.getElementById("delete-all-galleries")?.addEventListener("click", () => {
  const cards = [...document.querySelectorAll("#gallery-cards [data-gallery]")];
  if (!cards.length) return;
  askDelete("все галереи", {
    trash: () => {
      cards.forEach((card) => moveGalleryToTrash(card.dataset.gallery, card));
      cards.forEach((card) => card.remove());
      if (galleriesEmpty) galleriesEmpty.hidden = false;
    },
    forever: () => {
      cards.forEach((card) => purgeGallery(card.dataset.gallery));
      cards.forEach((card) => card.remove());
      if (galleriesEmpty) galleriesEmpty.hidden = false;
    }
  });
});

const manager = document.getElementById("file-manager");
if (manager) {
  const id = new URLSearchParams(location.search).get("id");
  if (id) manager.dataset.gallery = id;
}
paintFiles();

const loadProfile = () => {
  try { return JSON.parse(localStorage.getItem("ft-profile") || "null"); } catch (error) { return null; }
};
const loadUser = () => {
  try { return JSON.parse(localStorage.getItem("ft-user") || "null"); } catch (error) { return null; }
};
const personName = () => {
  const profile = loadProfile();
  const user = loadUser();
  const first = (profile && profile.first) || (user && user.first) || "";
  const last = (profile && profile.last) || (user && user.last) || "";
  return [first, last].filter(Boolean).join(" ");
};

const profileForm = document.getElementById("profile-form");
if (profileForm) {
  const saved = loadProfile();
  const user = loadUser();
  const seed = saved || {};
  const fields = {
    "pf-first": saved ? (saved.first || "") : ((user && user.first) || ""),
    "pf-last": saved ? (saved.last || "") : ((user && user.last) || ""),
    "pf-role": seed.role || "",
    "pf-city": seed.city || "",
    "pf-about": seed.about || "",
    "pf-slug": seed.slug || "",
    "pf-phone": seed.phone || "",
    "pf-email": saved ? (saved.email || "") : ((user && user.email) || ""),
    "pf-site": seed.site || "",
    "pf-vk": seed.vk || "",
    "pf-max": seed.max || ""
  };
  Object.entries(fields).forEach(([id, value]) => {
    const node = document.getElementById(id);
    if (node) node.value = value;
  });
  ["phone", "email", "site", "vk", "max"].forEach((key) => {
    const box = document.getElementById(`pf-show-${key}`);
    if (box) box.checked = Boolean(seed.show && seed.show[key]);
  });
  const banner = document.getElementById("fill-card");
  if (banner && localStorage.getItem("ft-ask-card") === "1") banner.hidden = false;
  if (!saved && user) revealSave("save-profile");
  const markDirty = (event) => {
    if (event.target && event.target.type === "password") return;
    revealSave("save-profile");
  };
  profileForm.addEventListener("input", markDirty);
  profileForm.addEventListener("change", markDirty);
  profileForm.addEventListener("submit", (event) => event.preventDefault());
  document.getElementById("save-profile")?.addEventListener("click", () => {
    const read = (id) => document.getElementById(id)?.value.trim() || "";
    const profile = {
      first: read("pf-first"),
      last: read("pf-last"),
      role: read("pf-role"),
      city: read("pf-city"),
      about: read("pf-about"),
      slug: read("pf-slug"),
      phone: read("pf-phone"),
      email: read("pf-email"),
      site: read("pf-site"),
      vk: read("pf-vk"),
      max: read("pf-max"),
      socials: typeof window.ftReadSocials === "function" ? window.ftReadSocials() : ((loadProfile() && loadProfile().socials) || []),
      show: {
        phone: document.getElementById("pf-show-phone")?.checked || false,
        email: document.getElementById("pf-show-email")?.checked || false,
        site: document.getElementById("pf-show-site")?.checked || false,
        vk: document.getElementById("pf-show-vk")?.checked || false,
        max: document.getElementById("pf-show-max")?.checked || false
      }
    };
    localStorage.setItem("ft-profile", JSON.stringify(profile));
    if (Object.prototype.hasOwnProperty.call(brandPending, "ft-photo")) {
      if (brandPending["ft-photo"]) localStorage.setItem("ft-photo", brandPending["ft-photo"]);
      else localStorage.removeItem("ft-photo");
      delete brandPending["ft-photo"];
    }
    if (logoCleared) {
      localStorage.removeItem("ft-logo");
      localStorage.removeItem("ft-logo-crop");
      delete brandPending["ft-logo"];
      logoCleared = false;
      logoCropPending = null;
    } else if (Object.prototype.hasOwnProperty.call(brandPending, "ft-logo")) {
      if (brandPending["ft-logo"]) localStorage.setItem("ft-logo", brandPending["ft-logo"]);
      else localStorage.removeItem("ft-logo");
      delete brandPending["ft-logo"];
    }
    if (!logoCleared && logoCropPending) {
      localStorage.setItem("ft-logo-crop", JSON.stringify(logoCropPending));
      logoCropPending = null;
    }
    if (cropPending) {
      localStorage.setItem("ft-photo-crop", JSON.stringify(cropPending));
      cropPending = null;
    }
    localStorage.removeItem("ft-ask-card");
    if (banner) banner.hidden = true;
    document.getElementById("save-profile").hidden = true;
    flashSaved();
  });
}

const registerForm = document.getElementById("register-form");
if (registerForm) {
  const fillDraft = (first, last, email) => {
    document.getElementById("reg-first").value = first;
    document.getElementById("reg-last").value = last;
    document.getElementById("reg-email").value = email;
    const note = document.getElementById("oauth-note");
    if (note) note.hidden = false;
  };
  document.getElementById("via-vk")?.addEventListener("click", () => fillDraft("Иван", "Петров", "ivan@example.com"));
  document.getElementById("via-google")?.addEventListener("click", () => fillDraft("Мария", "Иванова", "maria@example.com"));
  registerForm.addEventListener("submit", () => {
    const user = {
      first: document.getElementById("reg-first").value.trim(),
      last: document.getElementById("reg-last").value.trim(),
      email: document.getElementById("reg-email").value.trim()
    };
    const ref = new URLSearchParams(location.search).get("ref");
    if (ref) user.referredBy = ref;
    localStorage.setItem("ft-user", JSON.stringify(user));
    localStorage.setItem("ft-ask-card", "1");
    if (ref) {
      const book = readJson("ft-ref-book", { codes: {} });
      const row = book.codes[ref] || { count: 0, bonus: 0, people: [] };
      row.count += 1;
      if (user.email && !row.people.includes(user.email)) row.people.push(user.email);
      book.codes[ref] = row;
      localStorage.setItem("ft-ref-book", JSON.stringify(book));
    }
  });
}

const mailSent = document.getElementById("mail-sent");
if (mailSent) {
  const user = loadUser();
  if (user && user.email) mailSent.textContent = `Мы отправили ссылку на ${user.email}. Ссылка действует 24 часа. Пока почта не подтверждена, кабинет закрыт.`;
  if (localStorage.getItem("ft-ask-card") === "1") {
    const prompt = document.getElementById("fill-prompt");
    const link = document.getElementById("fill-link");
    if (prompt) prompt.hidden = false;
    if (link) link.hidden = false;
  }
}

const publicContacts = (target) => {
  if (!target) return;
  const profile = loadProfile();
  target.replaceChildren();
  const page = document.createElement("a");
  page.href = "photographer.html";
  page.textContent = "Страница фотографа";
  if (!profile) {
    target.appendChild(page);
    return;
  }
  const add = (href, text) => {
    if (!text) return;
    const link = document.createElement("a");
    link.href = href;
    link.textContent = text;
    target.appendChild(link);
  };
  if (profile.show?.phone && profile.phone) add(`tel:${profile.phone.replace(/\s/g, "")}`, profile.phone);
  if (profile.show?.email && profile.email) add(`mailto:${profile.email}`, profile.email);
  if (profile.show?.site && profile.site) add(profile.site, "Сайт");
  if (profile.show?.vk && profile.vk) add(profile.vk, "ВКонтакте");
  if (profile.show?.max && profile.max) add(profile.max, "MAX");
  (profile.socials || []).forEach((item) => {
    if (item && item.show !== false && item.url) add(item.url, item.label || item.kind);
  });
  target.appendChild(page);
};
const galName = document.getElementById("gal-name");
if (galName) galName.textContent = personName();
publicContacts(document.getElementById("gal-contacts"));
const phName = document.getElementById("ph-name");
if (phName) {
  const profile = loadProfile();
  phName.textContent = personName() || "Фотограф";
  const role = document.getElementById("ph-role");
  const about = document.getElementById("ph-about");
  if (role) role.textContent = [profile?.role, profile?.city].filter(Boolean).join(", ");
  if (about) about.textContent = profile?.about || "";
  document.title = `${phName.textContent} — ФотоТранзит`;
  const contacts = document.getElementById("ph-contacts");
  if (contacts) {
    contacts.replaceChildren();
    if (profile) {
      const add = (href, text) => {
        if (!text) return;
        const link = document.createElement("a");
        link.href = href;
        link.textContent = text;
        contacts.appendChild(link);
      };
      if (profile.show?.phone && profile.phone) add(`tel:${profile.phone.replace(/\s/g, "")}`, profile.phone);
      if (profile.show?.email && profile.email) add(`mailto:${profile.email}`, profile.email);
      if (profile.show?.site && profile.site) add(profile.site, "Сайт");
      if (profile.show?.vk && profile.vk) add(profile.vk, "ВКонтакте");
      if (profile.show?.max && profile.max) add(profile.max, "MAX");
      (profile.socials || []).forEach((item) => {
        if (item && item.show !== false && item.url) add(item.url, item.label || item.kind);
      });
    }
  }
}

const folderTree = document.getElementById("folder-tree");
if (folderTree) {
  const tree = FOLDER_TREE[galleryId()] || [];
  const folderKey = `ft-folders-${galleryId()}`;
  let stored = {};
  try { stored = JSON.parse(localStorage.getItem(folderKey) || "{}"); } catch (error) { stored = {}; }
  const draft = JSON.parse(JSON.stringify(stored));
  const baseAccess = () => ({ view: true, download: true, open: true, password: "", hidden: false });
  const drawNode = (node, depth) => {
    if (isFolderGone(galleryId(), node.id)) return;
    const access = { ...baseAccess(), ...(draft[node.id] || {}) };
    const box = document.createElement("article");
    box.className = "folder-node";
    box.style.setProperty("--nest", String(depth));
    const title = document.createElement("strong");
    title.textContent = node.name;
    const checks = document.createElement("div");
    checks.className = "folder-checks";
    [["view", "Просмотр"], ["download", "Скачивание"], ["open", "Открытие"], ["hidden", "Скрыта"]].forEach(([key, label]) => {
      const lab = document.createElement("label");
      const input = document.createElement("input");
      input.type = "checkbox";
      if (access[key]) input.setAttribute("checked", "");
      input.checked = Boolean(access[key]);
      input.addEventListener("change", () => {
        draft[node.id] = { ...baseAccess(), ...(draft[node.id] || {}), [key]: input.checked };
        revealSave("save-folders");
      });
      lab.append(input, document.createTextNode(label));
      checks.appendChild(lab);
    });
    const passLabel = document.createElement("label");
    passLabel.append(document.createTextNode("Пароль"));
    const pass = document.createElement("input");
    pass.type = "text";
    pass.autocomplete = "off";
    pass.value = access.password || "";
    pass.addEventListener("input", () => {
      draft[node.id] = { ...baseAccess(), ...(draft[node.id] || {}), password: pass.value };
      revealSave("save-folders");
    });
    passLabel.appendChild(pass);
    box.append(title, checks, passLabel);
    folderTree.appendChild(box);
    (node.children || []).forEach((child) => drawNode(child, depth + 1));
  };
  tree.forEach((node) => drawNode(node, 0));
  document.getElementById("save-folders")?.addEventListener("click", () => {
    localStorage.setItem(folderKey, JSON.stringify(draft));
    document.getElementById("save-folders").hidden = true;
    flashSaved();
  });
}

const folderQuery = (gid, fid) => {
  const next = new URLSearchParams();
  next.set("id", gid);
  if (fid) next.set("folder", fid);
  return next.toString();
};
const issuedRoot = () => (params.has("root") ? (params.get("root") || "") : (folderId() || ""));
const clientHref = (gid, fid) => {
  const next = new URLSearchParams();
  next.set("id", gid);
  next.set("root", issuedRoot());
  if (fid) next.set("folder", fid);
  return `gallery.html?${next.toString()}`;
};
const folderOpenHref = (gid, node, client) => (client ? clientHref(gid, node.id) : `cabinet.html?${folderQuery(gid, node.id)}`);
const folderLinkHref = (gid, node) => `gallery.html?${folderQuery(gid, node.id)}`;
const parentFolderHref = (gid, fid, client) => {
  const found = fid ? locateFolder(gid, fid) : null;
  const parent = found ? found.ancestors[found.ancestors.length - 1] : null;
  if (client) {
    const root = issuedRoot();
    const path = found?.path || [];
    if (root && fid && !path.some((node) => node.id === root)) return clientHref(gid, root);
    if ((fid || "") === root) return clientHref(gid, root);
    return clientHref(gid, parent ? parent.id : "");
  }
  if (!fid) return "cabinet.html";
  return parent ? `cabinet.html?${folderQuery(gid, parent.id)}` : `cabinet.html?${folderQuery(gid, "")}`;
};
const folderCrumbs = (gid, fid, client) => {
  const gallery = GALLERY_META[gid];
  const items = [{ name: "Галереи", href: "cabinet.html" }];
  items.push({
    name: gallery.title,
    href: client ? `gallery.html?${folderQuery(gid, "")}` : `cabinet.html?${folderQuery(gid, "")}`
  });
  const found = fid ? locateFolder(gid, fid) : null;
  const onProject = pageFile() === "project.html";
  (found?.path || []).forEach((node, index, list) => {
    const lastLeaf = index === list.length - 1 && !childFolders(gid, node.id).length;
    const href = onProject && lastLeaf ? `project.html?${folderQuery(gid, node.id)}` : folderOpenHref(gid, node, client);
    items.push({ name: node.name, href });
  });
  return items;
};
const paintCrumbs = (nav, items) => {
  if (!nav) return;
  nav.replaceChildren();
  items.forEach((item, index) => {
    if (index) {
      const sep = document.createElement("span");
      sep.className = "sep";
      sep.setAttribute("aria-hidden", "true");
      sep.textContent = "/";
      nav.appendChild(sep);
    }
    const link = document.createElement("a");
    link.href = item.href;
    link.textContent = item.name;
    if (index === items.length - 1) link.setAttribute("aria-current", "page");
    nav.appendChild(link);
  });
  nav.hidden = false;
};
const makeFolderCard = (gid, node, client) => {
  const card = document.createElement("article");
  card.className = "gcard";
  card.dataset.gallery = gid;
  card.dataset.folder = node.id;
  const wrap = document.createElement("div");
  wrap.className = "cover-wrap";
  const cover = document.createElement("a");
  cover.className = "cover-open";
  cover.href = folderOpenHref(gid, node, client);
  const img = document.createElement("img");
  img.src = folderCover(gid, node.id, node.cover || GALLERY_META[gid].cover);
  img.alt = "";
  cover.appendChild(img);
  const settingsBtn = document.createElement("button");
  settingsBtn.className = "card-set";
  settingsBtn.type = "button";
  settingsBtn.dataset.openSettings = "";
  settingsBtn.setAttribute("aria-label", "Настройки");
  settingsBtn.textContent = "Настройки";
  wrap.append(cover, settingsBtn);
  if (!client) {
    const actions = document.createElement("div");
    actions.className = "cover-actions";
    const open = document.createElement("a");
    open.className = "btn btn-line";
    open.href = folderOpenHref(gid, node, client);
    open.textContent = "Открыть";
    const link = document.createElement("a");
    link.className = "btn btn-line";
    link.href = folderLinkHref(gid, node);
    link.textContent = "Ссылка";
    const remove = document.createElement("button");
    remove.className = "btn btn-line btn-danger";
    remove.type = "button";
    remove.dataset.delFolder = "";
    remove.textContent = "Удалить";
    actions.append(open, link, remove);
    wrap.append(actions);
  }
  const heading = document.createElement("h3");
  heading.textContent = node.name;
  const meta = document.createElement("p");
  meta.textContent = node.meta || "";
  card.append(wrap, heading, meta);
  return card;
};

const baseAccess = () => ({ view: true, download: true, open: true, password: "", hidden: false });
const readFolderMap = (gid) => {
  try { return JSON.parse(localStorage.getItem(`ft-folders-${gid}`) || "{}"); } catch (error) { return {}; }
};
const folderAccessOf = (gid, fid) => ({ ...baseAccess(), ...(readFolderMap(gid)[fid] || {}) });
const buildPhotoTile = (file) => {
  const tile = document.createElement("article");
  tile.className = "photo-tile";
  tile.dataset.file = file.id;
  tile.dataset.in = file.in;
  const frame = document.createElement("div");
  frame.className = "frame";
  if (file.doc) {
    const doc = document.createElement("span");
    doc.className = "file-doc";
    doc.textContent = "PDF";
    frame.appendChild(doc);
  } else {
    const img = document.createElement("img");
    img.src = file.src;
    img.alt = "";
    frame.appendChild(img);
  }
  const heart = document.createElement("button");
  heart.type = "button";
  heart.className = "heart";
  heart.setAttribute("aria-label", "Отметить");
  heart.textContent = "♡";
  const more = document.createElement("button");
  more.type = "button";
  more.className = "tile-more";
  more.setAttribute("aria-haspopup", "true");
  more.setAttribute("aria-expanded", "false");
  more.setAttribute("aria-label", "Действия с кадром");
  more.textContent = "Ещё";
  frame.append(heart, more);
  const name = document.createElement("p");
  name.className = "tile-name";
  name.textContent = file.name;
  const menu = document.createElement("div");
  menu.className = "tile-drop";
  menu.hidden = true;
  menu.dataset.for = file.id;
  menu.setAttribute("role", "menu");
  const item = (label, attr, value, danger) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.setAttribute(attr, value || "");
    if (danger) btn.className = "is-danger";
    menu.appendChild(btn);
  };
  item("Скрыть", "data-hide");
  item("Удалить", "data-del-file", "", true);
  item("Оригинал", "data-tile-download", "file");
  item("Уменьшенная", "data-tile-download", "small");
  item("Отзыв", "data-tile-download", "review");
  item("Посмотреть комментарии", "data-comment", file.id);
  const code = readSecret(galleryId(), folderId() || "");
  item(`Секретный код: ${code || "не задан"}`, "data-edit-secret", "");
  const secretBtn = menu.lastElementChild;
  if (secretBtn) {
    secretBtn.dataset.secretGallery = galleryId();
    secretBtn.dataset.secretFolder = folderId() || "";
  }
  tile.append(frame, name, menu);
  return tile;
};
const fillFolderManage = (gid, fid) => {
  const access = folderAccessOf(gid, fid);
  document.querySelectorAll("[data-folder-access]").forEach((field) => {
    field.checked = Boolean(access[field.dataset.folderAccess]);
  });
  const pass = document.getElementById("folder-password");
  if (pass) pass.value = access.password || "";
  const state = folderSettingsView(gid, fid);
  const secret = document.getElementById("folder-secret");
  if (secret) secret.value = state.secret || "";
  document.querySelectorAll("[data-folder-opt]").forEach((field) => {
    field.checked = Boolean(state[field.dataset.folderOpt]);
  });
  const copy = document.getElementById("copy-client");
  if (copy) copy.setAttribute("data-copy", new URL(`gallery.html?${folderQuery(gid, fid)}`, location.href).href);
  const photos = document.getElementById("photo-tiles");
  if (photos && !photos.childElementCount) {
    FILE_CATALOG.forEach((file) => {
      if (!(file.in || "wedding").split(/\s+/).includes(gid)) return;
      photos.appendChild(buildPhotoTile(file));
    });
  }
  paintFiles();
};

const clientFiles = (gid, fid) => {
  const state = fid ? folderSettingsView(gid, fid) : settings(gid);
  const hidden = new Set(state.hidden || []);
  const open = unlocked();
  return filesInFolder(gid, fid).filter((file) => open || !hidden.has(file.id));
};
const filesUnder = (gid, fid) => filesInFolder(gid, fid).concat(childFolders(gid, fid).flatMap((node) => filesUnder(gid, node.id)));
const paintClient = (gid, fid) => {
  document.body.classList.add("client-view");
  const shell = document.getElementById("client-shell");
  if (shell) shell.hidden = false;
  const root = issuedRoot();
  const found = fid ? locateFolder(gid, fid) : null;
  if (root && (!fid || (found && !found.path.some((node) => node.id === root)))) {
    location.replace(clientHref(gid, root));
    return;
  }
  const tabs = document.getElementById("path-tabs");
  if (tabs) {
    tabs.replaceChildren();
    const items = [];
    if (!root) items.push({ name: GALLERY_META[gid].title, href: clientHref(gid, ""), current: !fid });
    const path = found?.path || [];
    const start = root ? path.findIndex((node) => node.id === root) : 0;
    (start >= 0 ? path.slice(start) : path).forEach((node, index, list) => {
      items.push({ name: node.name, href: clientHref(gid, node.id), current: index === list.length - 1 });
    });
    items.forEach((item) => {
      const link = document.createElement("a");
      link.href = item.href;
      link.textContent = item.name;
      if (item.current) link.setAttribute("aria-current", "page");
      tabs.appendChild(link);
    });
  }
  const back = document.getElementById("client-back");
  if (back) {
    const atRoot = (fid || "") === root;
    back.hidden = atRoot;
    back.href = parentFolderHref(gid, fid, true);
  }
  const until = document.getElementById("client-until");
  if (until) until.textContent = `Хранится до ${GALLERY_META[gid].until}`;
  const locked = fid ? (folderAccessOf(gid, fid).password || "") : "";
  const gate = document.getElementById("client-lock");
  const knownPass = !locked || sessionStorage.getItem(`ft-foldpass-${gid}/${fid}`) === locked;
  if (gate) gate.hidden = knownPass;
  const lockTitle = document.getElementById("client-lock-title");
  if (lockTitle) lockTitle.textContent = fid ? (folderTitle(gid, fid) || "Папка") : (GALLERY_META[gid].title);
  if (!knownPass) {
    document.getElementById("client-folders")?.replaceChildren();
    document.getElementById("client-grid")?.replaceChildren();
    document.title = `${lockTitle?.textContent || "Папка"} — ФотоТранзит`;
    return;
  }
  const folders = document.getElementById("client-folders");
  if (folders) {
    folders.replaceChildren();
    childFolders(gid, fid).filter((node) => !folderAccessOf(gid, node.id).hidden).forEach((node) => {
      const link = document.createElement("a");
      link.className = "client-folder";
      link.href = clientHref(gid, node.id);
      const img = document.createElement("img");
      img.src = folderCover(gid, node.id, node.cover || GALLERY_META[gid].cover);
      img.alt = "";
      const name = document.createElement("strong");
      name.textContent = node.name;
      link.append(img, name);
      folders.appendChild(link);
    });
  }
  const grid = document.getElementById("client-grid");
  if (grid) {
    grid.replaceChildren();
    clientFiles(gid, fid).forEach((file) => {
      const shot = document.createElement("article");
      shot.className = "client-shot";
      shot.dataset.file = file.id;
      shot.dataset.in = gid;
      shot.dataset.name = file.name;
      if (file.doc || !file.src) {
        const doc = document.createElement("div");
        doc.className = "client-doc";
        doc.textContent = file.name;
        shot.appendChild(doc);
      } else {
        const img = document.createElement("img");
        img.src = file.src;
        img.alt = file.name;
        shot.appendChild(img);
      }
      const heart = document.createElement("button");
      heart.type = "button";
      heart.className = "heart";
      heart.textContent = "♡";
      heart.setAttribute("aria-label", "Отметить");
      const caption = document.createElement("p");
      caption.textContent = file.name;
      shot.append(heart, caption);
      grid.appendChild(shot);
    });
  }
  document.title = `${fid ? (folderTitle(gid, fid) || GALLERY_META[gid].title) : GALLERY_META[gid].title} — ФотоТранзит`;
};
const mountFolderBrowser = () => {
  const file = pageFile();
  const gid = galleryId();
  const asked = folderId();
  const known = !asked || Boolean(locateFolder(gid, asked));
  const fid = known ? asked : "";
  const client = file === "gallery.html";
  if (client) {
    paintClient(gid, fid);
    return;
  }
  const inCabinet = file === "cabinet.html";
  const inProject = file === "project.html";
  const drilled = inCabinet && Boolean(params.get("id"));
  const crumbs = document.getElementById("crumbs");
  const back = document.getElementById("folder-back");
  const board = document.getElementById("folder-cards");
  const showPath = drilled || (inProject && (fid || (FOLDER_TREE[gid] || []).length > 0));
  const referral = document.getElementById("referral-box");
  const banner = document.getElementById("offer-banner");
  if (referral && drilled) referral.hidden = true;
  if (banner && drilled) banner.hidden = true;

  if (showPath && crumbs) paintCrumbs(crumbs, folderCrumbs(gid, fid, false));
  if (back && (drilled || fid)) {
    back.hidden = false;
    back.href = parentFolderHref(gid, fid, false);
  }

  if (inProject) return;

  const kids = childFolders(gid, fid);
  const removedHere = Boolean(fid) && isFolderGone(gid, fid);
  const galleryGone = goneGalleries().includes(gid);

  if (inCabinet && drilled) {
    const rootCards = document.getElementById("gallery-cards");
    const rootActions = document.getElementById("root-actions");
    const heading = document.getElementById("gallery-heading");
    if (rootCards) rootCards.hidden = true;
    if (rootActions) rootActions.hidden = true;
    if (heading) heading.textContent = galleryGone ? "Галерея удалена" : (fid ? (folderTitle(gid, fid) || GALLERY_META[gid].title) : GALLERY_META[gid].title);
    if (galleriesEmpty) galleriesEmpty.hidden = true;
    document.title = `${heading?.textContent || "Папки"} — ФотоТранзит`;
  }

  const manage = document.getElementById("folder-manage");
  if (manage) manage.hidden = true;

  const tools = document.getElementById("explorer-tools");
  const photos = document.getElementById("photo-tiles");
  const emptyTiles = document.getElementById("tiles-empty");
  const inside = inCabinet && drilled && !galleryGone && !removedHere;
  const mode = viewMode();
  const listMode = inside && mode === "list";
  const split = inside && splitEnabled(gid, fid);
  if (tools) tools.hidden = !inside;
  const viewSwitch = document.getElementById("view-switch");
  if (viewSwitch) viewSwitch.hidden = !inside;
  document.querySelectorAll("[data-view-mode]").forEach((button) => button.classList.toggle("on", button.dataset.viewMode === mode));
  document.querySelectorAll("[data-display-choice]").forEach((field) => { field.value = mode; });
  if (photos) {
    photos.hidden = !inside || listMode;
    photos.replaceChildren();
    if (inside && !listMode) {
      filesInFolder(gid, fid).forEach((item) => photos.appendChild(buildPhotoTile(item)));
      paintFiles();
    }
  }
  if (emptyTiles) emptyTiles.hidden = !inside || listMode || filesInFolder(gid, fid).length > 0;

  const splitWrap = document.getElementById("split-switch-wrap");
  const splitToggle = document.getElementById("split-toggle");
  const splitPanel = document.getElementById("split-panel");
  if (splitWrap) splitWrap.hidden = !inside;
  if (splitToggle) splitToggle.checked = split;
  if (splitPanel) splitPanel.hidden = !split;
  if (split) paintSplitList(gid, fid);
  const listHost = document.getElementById("content-list");
  if (listHost) {
    listHost.hidden = !listMode;
    if (listMode) paintContentList(gid, fid, !split);
  }

  if (board) {
    const showCards = !galleryGone && kids.length > 0 && drilled && !split && !listMode;
    board.hidden = !showCards;
    board.replaceChildren();
    if (showCards) {
      orderedKids(gid, fid, kids).forEach((node) => board.appendChild(makeFolderCard(gid, node, false)));
      let empty = document.getElementById("folders-empty");
      if (!empty && board.parentElement) {
        empty = document.createElement("p");
        empty.id = "folders-empty";
        empty.className = "hint";
        empty.hidden = true;
        board.insertAdjacentElement("afterend", empty);
      }
      if (empty) empty.hidden = true;
    }
  }
  const typed = (document.getElementById("split-query")?.value || "").trim().toLowerCase();
  if (typed) {
    document.querySelectorAll("#folder-cards [data-folder], #content-list .list-row, #split-list .split-row, #photo-tiles .photo-tile").forEach((node) => {
      const name = node.querySelector("h3, .tile-name")?.textContent || "";
      node.hidden = !ftNameHit(name, typed);
    });
  }
  requestAnimationFrame(() => fitCardGrids());
};

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-del-folder]");
  if (!button) return;
  const card = button.closest("[data-folder]") || menuHost(button);
  if (!card?.dataset?.folder) return;
  const name = card.querySelector("h3")?.textContent || "папку";
  const gid = card.dataset.gallery;
  const fid = card.dataset.folder;
  const cover = card.querySelector("img")?.getAttribute?.("src") || "";
  askDelete(name, {
    trash: () => {
      trashFolder(gid, fid, name, cover);
      if (card.remove) card.remove();
      mountFolderBrowser();
    },
    forever: () => {
      purgeFolder(gid, fid);
      if (card.remove) card.remove();
      mountFolderBrowser();
    }
  });
});

let pendingAccess = null;
const touchAccess = (patch) => {
  pendingAccess = { ...(pendingAccess || folderAccessOf(galleryId(), folderId())), ...patch };
  revealSave("save-folder-manage");
};
document.querySelectorAll("[data-folder-access]").forEach((field) => {
  field.addEventListener("change", () => touchAccess({ [field.dataset.folderAccess]: field.checked }));
});
document.getElementById("folder-password")?.addEventListener("input", (event) => {
  touchAccess({ password: event.target.value });
});
document.getElementById("folder-secret")?.addEventListener("input", (event) => {
  const key = folderStoreKey(galleryId(), folderId());
  pending[key] = { ...(pending[key] || {}), secret: event.target.value.trim() };
  revealSave("save-folder-manage");
});
document.querySelectorAll("[data-folder-opt]").forEach((field) => {
  field.addEventListener("change", () => {
    const key = folderStoreKey(galleryId(), folderId());
    pending[key] = { ...(pending[key] || {}), [field.dataset.folderOpt]: field.checked };
    revealSave("save-folder-manage");
  });
});
document.getElementById("save-folder-manage")?.addEventListener("click", () => {
  const gid = galleryId();
  const fid = folderId();
  if (!fid) return;
  if (pendingAccess) {
    const stored = readFolderMap(gid);
    stored[fid] = { ...folderAccessOf(gid, fid), ...pendingAccess };
    localStorage.setItem(`ft-folders-${gid}`, JSON.stringify(stored));
    pendingAccess = null;
  }
  const key = folderStoreKey(gid, fid);
  if (pending[key]) {
    const all = loadSettings();
    all[key] = { ...settings(gid), ...(all[key] || {}), ...pending[key] };
    localStorage.setItem("ft-settings", JSON.stringify(all));
    delete pending[key];
  }
  const button = document.getElementById("save-folder-manage");
  if (button) button.hidden = true;
  paintFiles();
  flashSaved();
});

const coverMap = () => {
  try { return JSON.parse(localStorage.getItem("ft-covers") || "{}"); } catch (error) { return {}; }
};
const folderCover = (gid, id, fallback) => coverMap()[`${gid}::${id || ""}`] || fallback || "";
const splitMap = () => {
  try { return JSON.parse(localStorage.getItem("ft-split") || "{}"); } catch (error) { return {}; }
};
const splitKey = (gid, fid) => `${gid}::${fid || ""}`;
const splitEnabled = (gid, fid) => {
  const map = splitMap();
  const key = splitKey(gid, fid);
  if (Object.prototype.hasOwnProperty.call(map, key)) return Boolean(map[key]);
  return gid === "kindergarten" && !fid;
};
const orderMap = () => {
  try { return JSON.parse(localStorage.getItem("ft-order") || "{}"); } catch (error) { return {}; }
};
const orderedKids = (gid, fid, nodes) => {
  const saved = orderMap()[splitKey(gid, fid)] || [];
  const pool = new Map(nodes.map((node) => [node.id, node]));
  const list = [];
  saved.forEach((id) => {
    if (!pool.has(id)) return;
    list.push(pool.get(id));
    pool.delete(id);
  });
  pool.forEach((node) => list.push(node));
  return list;
};
const saveOrder = (gid, fid, ids) => {
  const all = orderMap();
  all[splitKey(gid, fid)] = ids;
  localStorage.setItem("ft-order", JSON.stringify(all));
};
const folderStamp = (node) => node.created || ({ ceremony: 1, prep: 2, banquet: 3, walk: 4, group5: 1, morning: 2, light: 1 }[node.id] || 0);
const saveFolderAccess = (gid, fid, patch) => {
  const stored = readFolderMap(gid);
  stored[fid] = { ...folderAccessOf(gid, fid), ...patch };
  localStorage.setItem(`ft-folders-${gid}`, JSON.stringify(stored));
};
const genPass = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const len = 6 + Math.floor(Math.random() * 3);
  let out = "";
  for (let i = 0; i < len; i += 1) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
};
const absFolderLink = (gid, node) => new URL(folderLinkHref(gid, node), location.href).href;
let splitQuery = "";
const rowLead = (img, name, sizeText, menu) => {
  const lead = document.createElement("div");
  lead.className = "row-lead";
  const text = document.createElement("div");
  text.className = "row-text";
  const title = document.createElement("h3");
  title.textContent = name;
  const size = document.createElement("span");
  size.textContent = sizeText;
  text.append(title, size);
  if (menu) lead.append(img, menu, text);
  else lead.append(img, text);
  return lead;
};
const ftNameHit = (name, query) => {
  const text = String(name || "").trim().toLowerCase();
  const q = String(query || "").trim().toLowerCase();
  if (!q) return true;
  const surname = text.split(/\s+/)[0] || "";
  return text.includes(q) || surname.includes(q);
};
const rowBurger = (entries) => {
  const wrap = document.createElement("div");
  wrap.className = "row-menu";
  const burger = document.createElement("button");
  burger.type = "button";
  burger.className = "row-burger";
  burger.setAttribute("aria-label", "Действия");
  burger.setAttribute("aria-haspopup", "true");
  burger.setAttribute("aria-expanded", "false");
  for (let i = 0; i < 3; i += 1) burger.appendChild(document.createElement("span"));
  const menu = document.createElement("div");
  menu.className = "row-drop";
  menu.hidden = true;
  menu.id = `row-menu-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  menu.setAttribute("role", "menu");
  burger.dataset.menu = menu.id;
  entries.forEach((entry) => {
    if (entry.href) {
      const link = document.createElement("a");
      link.href = entry.href;
      link.textContent = entry.label;
      menu.appendChild(link);
      return;
    }
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = entry.label;
    if (entry.danger) button.className = "is-danger";
    Object.entries(entry.data || {}).forEach(([key, value]) => { button.dataset[key] = value; });
    menu.appendChild(button);
  });
  wrap.append(burger, menu);
  return wrap;
};
const closeRowMenus = () => {
  document.querySelectorAll(".row-drop").forEach((menu) => { menu.hidden = true; });
  document.querySelectorAll(".row-burger").forEach((button) => button.setAttribute("aria-expanded", "false"));
};
const placeRowMenu = (burger, menu) => {
  const row = burger.closest("[data-folder], [data-file]");
  if (row) {
    menu.dataset.anchorGallery = row.dataset.gallery || galleryId();
    menu.dataset.anchorFolder = row.dataset.folder || "";
    menu.dataset.anchorFile = row.dataset.file || "";
    menu.dataset.anchorName = row.querySelector("h3")?.textContent || "";
    menu.dataset.anchorSrc = row.querySelector("img")?.getAttribute("src") || "";
  }
  placeAnchored(burger, menu);
  anchoredMenu = menu;
  anchoredButton = burger;
};
document.addEventListener("click", (event) => {
  const burger = event.target.closest(".row-burger");
  if (burger) {
    event.preventDefault();
    const menu = document.getElementById(burger.dataset.menu) || burger.parentElement?.querySelector(".row-drop");
    const willOpen = Boolean(menu && menu.hidden);
    closeRowMenus();
    if (willOpen && menu) placeRowMenu(burger, menu);
    return;
  }
  if (event.target.closest(".row-drop button, .row-drop a")) closeRowMenus();
  else if (!event.target.closest(".row-drop")) closeRowMenus();
});
const menuHost = (node) => {
  const row = node.closest(".list-row, .split-row");
  if (row) return row;
  const menu = node.closest(".row-drop");
  if (!menu) return null;
  return {
    dataset: {
      gallery: menu.dataset.anchorGallery || "",
      folder: menu.dataset.anchorFolder || "",
      file: menu.dataset.anchorFile || ""
    },
    querySelector: (sel) => {
      if (sel === "h3") return { textContent: menu.dataset.anchorName || "" };
      if (sel === "img") return { getAttribute: () => menu.dataset.anchorSrc || "" };
      return menu.querySelector(sel);
    }
  };
};
const secretEntry = (gid, fid) => ({
  label: `Секретный код: ${readSecret(gid, fid) || "не задан"}`,
  data: { editSecret: "", secretGallery: gid, secretFolder: fid || "" }
});
const loadMails = () => {
  try { return JSON.parse(localStorage.getItem("ft-mails") || "{}"); } catch (error) { return {}; }
};
const mailKey = (gid, fid) => `${gid}/${fid}`;
const mailOf = (gid, fid) => (loadMails()[mailKey(gid, fid)] || "").trim();
const saveMail = (gid, fid, value) => {
  const all = loadMails();
  const next = String(value || "").trim();
  if (next) all[mailKey(gid, fid)] = next;
  else delete all[mailKey(gid, fid)];
  localStorage.setItem("ft-mails", JSON.stringify(all));
};
const mailCapsule = (gid, fid) => {
  const wrap = document.createElement("div");
  wrap.className = "mail-capsule";
  const field = document.createElement("input");
  field.type = "email";
  field.className = "split-mail";
  field.placeholder = "почта";
  field.autocomplete = "off";
  field.value = mailOf(gid, fid);
  field.setAttribute("aria-label", "Почта");
  field.addEventListener("input", () => saveMail(gid, fid, field.value));
  const send = document.createElement("button");
  send.type = "button";
  send.className = "mail-send";
  send.dataset.sendMail = "";
  send.textContent = "Отправить";
  wrap.append(field, send);
  return wrap;
};
const paintSplitList = (gid, fid) => {
  const host = document.getElementById("split-list");
  if (!host) return;
  document.querySelectorAll("body > .row-drop").forEach((menu) => menu.remove());
  const mode = document.getElementById("split-sort")?.value || "order";
  let rows = orderedKids(gid, fid, childFolders(gid, fid));
  const query = (document.getElementById("split-query")?.value || splitQuery).trim().toLowerCase();
  const surnameOf = (name) => (String(name || "").trim().split(/\s+/)[0] || "").toLowerCase();
  if (query) rows = rows.filter((node) => ftNameHit(node.name, query));
  const parentCover = coverMap()[splitKey(gid, fid)] || "";
  rows.sort((a, b) => {
    if (mode === "az") return a.name.localeCompare(b.name, "ru");
    if (mode === "za") return b.name.localeCompare(a.name, "ru");
    if (mode === "date") return folderStamp(b) - folderStamp(a);
    if (mode === "surname") return surnameOf(a.name).localeCompare(surnameOf(b.name), "ru");
    const ap = folderAccessOf(gid, a.id).password ? 1 : 0;
    const bp = folderAccessOf(gid, b.id).password ? 1 : 0;
    if (mode === "pass") return bp - ap;
    if (mode === "nopass") return ap - bp;
    return 0;
  });
  host.replaceChildren();
  if (!rows.length) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = query ? "Таких папок нет." : "В этой папке нет вложенных папок.";
    host.appendChild(empty);
    return;
  }
  rows.forEach((node) => {
    const access = folderAccessOf(gid, node.id);
    const row = document.createElement("article");
    row.className = "split-row";
    if (access.hidden) row.classList.add("is-hidden");
    row.dataset.gallery = gid;
    row.dataset.folder = node.id;
    const img = document.createElement("img");
    img.src = folderCover(gid, node.id, node.cover || GALLERY_META[gid].cover);
    img.alt = "";
    const pass = document.createElement("input");
    pass.type = "text";
    pass.className = "split-pass";
    pass.value = access.password || "";
    pass.placeholder = "пароль";
    pass.setAttribute("aria-label", "Задать пароль");
    pass.autocomplete = "off";
    const gen = document.createElement("button");
    gen.type = "button";
    gen.className = "btn btn-line";
    gen.dataset.gen = "";
    gen.textContent = "Сгенерировать пароль";
    row.append(
      rowLead(img, node.name, folderSizeLabel(gid, node.id), rowBurger([
        { label: "Выше", data: { move: "up", kind: "folder" } },
        { label: "Ниже", data: { move: "down", kind: "folder" } },
        { label: parentCover && parentCover === img.src ? "Обложка" : "На обложку", data: { cover: "", kind: "folder" } },
        { label: "Открыть", href: `cabinet.html?${folderQuery(gid, node.id)}` },
        { label: access.hidden ? "Показать" : "Скрыть", data: { hideFolder: "", kind: "folder" } },
        { label: "Удалить", data: { delFolder: "", kind: "folder" }, danger: true },
        secretEntry(gid, node.id)
      ])),
      pass,
      gen,
      mailCapsule(gid, node.id)
    );
    host.appendChild(row);
  });
};
const askReset = () => new Promise((resolve) => {
  const box = document.getElementById("reset-ask");
  if (!box) { resolve(false); return; }
  box.hidden = false;
  const onClick = (event) => {
    const button = event.target.closest("[data-reset]");
    if (!button) return;
    event.preventDefault();
    box.hidden = true;
    box.removeEventListener("click", onClick);
    resolve(button.dataset.reset === "yes");
  };
  box.addEventListener("click", onClick);
});
const ensureChildFolder = (gid, parent, name) => {
  const found = (parent ? (locateFolder(gid, parent)?.node.children || []) : folderNodes(gid)).find((node) => node.name === name);
  if (found) return found.id;
  const all = JSON.parse(localStorage.getItem("ft-user-folders") || "{}");
  all[gid] = all[gid] || [];
  const id = "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  all[gid].push({ id, name, parent: parent || "", cover: "img/p3.jpg", meta: "Новая папка", created: Date.now() });
  localStorage.setItem("ft-user-folders", JSON.stringify(all));
  return id;
};
const readPreview = (file) => new Promise((resolve, reject) => {
  if (!file || !file.size) { reject(new Error("empty")); return; }
  if (!file.type.startsWith("image/") || file.size > 900000) {
    resolve(file.type.startsWith("image/") ? "img/p2.jpg" : "");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ""));
  reader.onerror = () => reject(new Error("read"));
  reader.readAsDataURL(file);
});
const showUploadedFiles = (gid, folder) => {
  const list = document.getElementById("file-list");
  if (!list || pageFile() !== "project.html") return;
  list.querySelectorAll("[data-user-file]").forEach((node) => node.remove());
  filesInFolder(gid, folder).filter((file) => String(file.id).startsWith("file")).forEach((file) => {
    const row = document.createElement("article");
    row.className = "file-row";
    row.dataset.file = file.id;
    row.dataset.userFile = "";
    row.dataset.in = gid;
    const name = document.createElement("span");
    name.textContent = file.name;
    row.appendChild(name);
    list.appendChild(row);
  });
};
const ingestUploads = async (fileList) => {
  const files = [...fileList || []];
  if (!files.length) return;
  const line = document.getElementById("upload-line");
  const failsBox = document.getElementById("upload-fails");
  if (line) line.hidden = false;
  if (failsBox) { failsBox.hidden = true; failsBox.replaceChildren(); }
  const started = Date.now();
  const gid = galleryId();
  const parent = folderId();
  const fails = [];
  const stored = readList("ft-user-files");
  for (const file of files) {
    const filename = file.name || "файл";
    try {
      const rel = file.webkitRelativePath || file.ftPath || filename;
      const parts = String(rel).split(/[/\\]/).filter(Boolean);
      parts.pop();
      let folder = parent;
      for (const part of parts) folder = ensureChildFolder(gid, folder, part);
      const src = await readPreview(file);
      stored.push({
        id: "file" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name: filename,
        src,
        gallery: gid,
        folder,
        in: gid,
        size: file.size || 0,
        doc: !file.type.startsWith("image/") && !file.type.startsWith("video/")
      });
    } catch (error) {
      fails.push(filename);
    }
  }
  writeList("ft-user-files", stored);
  const wait = 700 - (Date.now() - started);
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  if (line) line.hidden = true;
  if (failsBox) {
    failsBox.replaceChildren();
    failsBox.hidden = fails.length === 0;
    fails.forEach((name) => {
      const item = document.createElement("li");
      item.textContent = name;
      failsBox.appendChild(item);
    });
  }
  showUploadedFiles(gid, parent);
  mountFolderBrowser();
};

const viewMode = () => (localStorage.getItem("ft-display") === "list" ? "list" : "tiles");
const setViewMode = (mode) => {
  localStorage.setItem("ft-display", mode === "list" ? "list" : "tiles");
  mountFolderBrowser();
};
const knownBytes = { cover: 3145728, p2: 1887436, p3: 1572864, p4: 52428800, p5: 1310720, p6: 2359296, pdf: 262144 };
const fileBytes = (file) => Number(file.size || knownBytes[file.id] || 0);
const formatSize = (bytes) => {
  const n = Number(bytes) || 0;
  if (n >= 1048576) return `${(n / 1048576).toLocaleString("ru-RU", { maximumFractionDigits: 1 })} МБ`;
  if (!n) return "0 КБ";
  return `${Math.max(1, Math.round(n / 1024))} КБ`;
};
const folderBytes = (gid, fid) => filesInFolder(gid, fid).reduce((sum, file) => sum + fileBytes(file), 0)
  + childFolders(gid, fid).reduce((sum, node) => sum + folderBytes(gid, node.id), 0);
const folderSizeLabel = (gid, fid) => {
  const total = folderBytes(gid, fid);
  return total ? `папка · ${formatSize(total)}` : "папка";
};
const fileOrderMap = () => {
  try { return JSON.parse(localStorage.getItem("ft-file-order") || "{}"); } catch (error) { return {}; }
};
const orderedFiles = (gid, fid) => {
  const files = filesInFolder(gid, fid);
  const saved = fileOrderMap()[splitKey(gid, fid)] || [];
  const pool = new Map(files.map((file) => [file.id, file]));
  const list = [];
  saved.forEach((id) => {
    if (!pool.has(id)) return;
    list.push(pool.get(id));
    pool.delete(id);
  });
  pool.forEach((file) => list.push(file));
  return list;
};
const saveFileOrder = (gid, fid, ids) => {
  const all = fileOrderMap();
  all[splitKey(gid, fid)] = ids;
  localStorage.setItem("ft-file-order", JSON.stringify(all));
};
const saveCovers = (gid, parent, src) => {
  const all = coverMap();
  all[splitKey(gid, parent)] = src;
  localStorage.setItem("ft-covers", JSON.stringify(all));
};
const lineButton = (label, dataset, danger) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = danger ? "btn btn-line btn-danger" : "btn btn-line";
  Object.entries(dataset).forEach(([key, value]) => { button.dataset[key] = value; });
  button.textContent = label;
  return button;
};
const paintContentList = (gid, fid, withFolders) => {
  const host = document.getElementById("content-list");
  if (!host) return;
  document.querySelectorAll("body > .row-drop").forEach((menu) => menu.remove());
  host.replaceChildren();
  const parentCover = coverMap()[splitKey(gid, fid)] || "";
  if (withFolders) {
    orderedKids(gid, fid, childFolders(gid, fid)).forEach((node) => {
      const access = folderAccessOf(gid, node.id);
      const row = document.createElement("article");
      row.className = "list-row";
      if (access.hidden) row.classList.add("is-hidden");
      row.dataset.gallery = gid;
      row.dataset.folder = node.id;
      const img = document.createElement("img");
      img.src = folderCover(gid, node.id, node.cover || GALLERY_META[gid].cover);
      img.alt = "";
      row.append(
        rowLead(img, node.name, folderSizeLabel(gid, node.id), rowBurger([
          { label: "Выше", data: { move: "up", kind: "folder" } },
          { label: "Ниже", data: { move: "down", kind: "folder" } },
          { label: parentCover && parentCover === img.src ? "Обложка" : "На обложку", data: { cover: "", kind: "folder" } },
          { label: "Открыть", href: `cabinet.html?${folderQuery(gid, node.id)}` },
          { label: access.hidden ? "Показать" : "Скрыть", data: { hideFolder: "", kind: "folder" } },
          { label: "Удалить", data: { delFolder: "", kind: "folder" }, danger: true },
          secretEntry(gid, node.id)
        ]))
      );
      host.appendChild(row);
    });
  }
  const hidden = new Set(settings(gid).hidden || []);
  orderedFiles(gid, fid).forEach((file) => {
    const row = document.createElement("article");
    row.className = "list-row";
    if (hidden.has(file.id)) row.classList.add("is-hidden");
    row.dataset.file = file.id;
    row.dataset.gallery = gid;
    const img = document.createElement("img");
    img.src = file.src || "img/p2.jpg";
    img.alt = "";
    const isCover = parentCover && parentCover === img.src;
    row.append(
      rowLead(img, file.name, formatSize(fileBytes(file)), rowBurger([
        { label: "Выше", data: { move: "up", kind: "file" } },
        { label: "Ниже", data: { move: "down", kind: "file" } },
        { label: isCover ? "Обложка" : "На обложку", data: { cover: "", kind: "file" } },
        { label: hidden.has(file.id) ? "Показать" : "Скрыть", data: { hideFile: "", kind: "file" } },
        { label: "Удалить", data: { removeFile: "", kind: "file" }, danger: true },
        secretEntry(gid, fid)
      ]))
    );
    host.appendChild(row);
  });
  if (!host.children.length) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = "В этой папке пока пусто.";
    host.appendChild(empty);
  }
};

mountFolderBrowser();
const folderAsk = document.getElementById("folder-ask");
const folderAskInput = document.getElementById("folder-ask-name");
const placeOverlayBox = (node) => {
  if (!node || node.hidden) return;
  const main = document.querySelector(".app-main") || document.querySelector("main");
  const vv = window.visualViewport;
  const viewTop = vv ? vv.offsetTop : 0;
  const viewLeft = vv ? vv.offsetLeft : 0;
  const viewW = vv ? vv.width : window.innerWidth;
  const viewH = vv ? vv.height : window.innerHeight;
  const margin = 12;
  let left = viewLeft + margin;
  let top = viewTop + margin;
  let width = Math.max(0, viewW - margin * 2);
  let height = Math.max(0, viewH - margin * 2);
  if (main) {
    const rect = main.getBoundingClientRect();
    const colLeft = Math.max(rect.left, viewLeft + margin);
    const colRight = Math.min(rect.right, viewLeft + viewW - margin);
    const colTop = Math.max(rect.top, viewTop + margin);
    const colBottom = Math.min(rect.bottom, viewTop + viewH - margin);
    if (colRight - colLeft >= 160 && colBottom - colTop >= 140) {
      left = colLeft;
      top = colTop;
      width = colRight - colLeft;
      height = colBottom - colTop;
    }
  }
  node.style.left = `${Math.round(left)}px`;
  node.style.top = `${Math.round(top)}px`;
  node.style.width = `${Math.round(width)}px`;
  node.style.height = `${Math.round(height)}px`;
};
function readSecret(gid, fid) {
  if (fid) return folderSettingsView(gid, fid).secret || "";
  return settings(gid).secret || "";
}
function writeSecret(gid, fid, code) {
  const value = String(code || "").trim();
  if (fid) {
    const key = folderStoreKey(gid, fid);
    const all = loadSettings();
    all[key] = { ...settings(gid), ...(all[key] || {}), secret: value };
    localStorage.setItem("ft-settings", JSON.stringify(all));
    return;
  }
  saveSettings({ secret: value }, gid);
}
let secretEdit = { gid: "", fid: "" };
function openSecretPanel(gid, fid) {
  const panel = document.getElementById("secret-panel");
  const field = document.getElementById("secret-panel-code");
  if (!panel) return;
  secretEdit = { gid: gid || galleryId(), fid: fid || "" };
  if (field) field.value = readSecret(secretEdit.gid, secretEdit.fid);
  panel.hidden = false;
  placeOverlayBox(panel);
  field?.focus();
  field?.select();
}
function closeSecretPanel() {
  const panel = document.getElementById("secret-panel");
  if (panel) panel.hidden = true;
}
const placeFolderAsk = () => placeOverlayBox(folderAsk);
const closeFolderAsk = () => {
  if (!folderAsk) return;
  folderAsk.hidden = true;
};
const openFolderAsk = () => {
  if (!folderAsk || !params.get("id")) return;
  if (folderAskInput) folderAskInput.value = "";
  folderAsk.hidden = false;
  placeFolderAsk();
  folderAskInput?.focus();
};
window.addEventListener("resize", () => {
  placeFolderAsk();
  placeOverlayBox(document.getElementById("secret-panel"));
});
window.visualViewport?.addEventListener("resize", () => {
  placeFolderAsk();
  placeOverlayBox(document.getElementById("secret-panel"));
});
window.visualViewport?.addEventListener("scroll", () => {
  placeFolderAsk();
  placeOverlayBox(document.getElementById("secret-panel"));
});
document.getElementById("add-folder")?.addEventListener("click", () => openFolderAsk());
const bindAddButton = (buttonId, fileId, treeId) => {
  const button = document.getElementById(buttonId);
  const files = document.getElementById(fileId);
  const tree = document.getElementById(treeId);
  if (!button) return;
  let taps = 0;
  let timer = 0;
  button.addEventListener("click", () => {
    taps += 1;
    clearTimeout(timer);
    timer = setTimeout(() => {
      const input = taps > 1 ? tree : files;
      taps = 0;
      input?.click();
    }, 220);
  });
};
bindAddButton("add-any", "add-files", "add-tree");
bindAddButton("add-any", "pick-files", "pick-folder");
document.getElementById("folder-ask-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = folderAskInput?.value.trim() || "";
  if (!name || !params.get("id")) return;
  const gid = galleryId();
  const all = JSON.parse(localStorage.getItem("ft-user-folders") || "{}");
  all[gid] = all[gid] || [];
  all[gid].push({ id: "u" + Date.now().toString(36), name, parent: folderId(), cover: "img/p3.jpg", meta: "Новая папка", created: Date.now() });
  localStorage.setItem("ft-user-folders", JSON.stringify(all));
  closeFolderAsk();
  mountFolderBrowser();
});
document.getElementById("folder-ask-cancel")?.addEventListener("click", () => closeFolderAsk());
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const panel = document.getElementById("secret-panel");
  if (panel && !panel.hidden) {
    event.preventDefault();
    closeSecretPanel();
    return;
  }
  if (!folderAsk || folderAsk.hidden) return;
  event.preventDefault();
  closeFolderAsk();
});
document.getElementById("secret-panel-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const field = document.getElementById("secret-panel-code");
  writeSecret(secretEdit.gid || galleryId(), secretEdit.fid || "", field?.value || "");
  closeSecretPanel();
  if (pageFile() === "cabinet.html") mountFolderBrowser();
  paintFiles();
});
document.getElementById("secret-panel-cancel")?.addEventListener("click", () => closeSecretPanel());
const COMMENT_MONTHS = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
const formatCommentWhen = (stamp) => {
  const date = new Date(stamp);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${date.getDate()} ${COMMENT_MONTHS[date.getMonth()]} в ${hh}:${mm}`;
};
const loadCommentStore = () => {
  try { return JSON.parse(localStorage.getItem("ft-comments") || "{}"); } catch (error) { return {}; }
};
const commentKey = (target) => `${galleryId()}/${folderId() || "_"}/${target || "folder"}`;
const asThread = (value) => {
  if (Array.isArray(value)) return value.filter((item) => item && typeof item.text === "string");
  if (typeof value === "string" && value.trim()) {
    return [{ id: "legacy", author: "Фотограф", role: "photo", text: value, at: Date.now(), edited: false }];
  }
  return [];
};
let commentTarget = "folder";
const readThread = (target) => {
  const store = loadCommentStore();
  const key = commentKey(target);
  if (Array.isArray(store[key])) return store[key].slice().sort((a, b) => (a.at || 0) - (b.at || 0));
  const legacy = `${galleryId()}/${target || "folder"}`;
  const thread = asThread(store[legacy]);
  if (thread.length) {
    store[key] = thread;
    if (typeof store[legacy] === "string") delete store[legacy];
    localStorage.setItem("ft-comments", JSON.stringify(store));
  }
  return thread.sort((a, b) => (a.at || 0) - (b.at || 0));
};
const writeThread = (target, list) => {
  const store = loadCommentStore();
  store[commentKey(target)] = list;
  localStorage.setItem("ft-comments", JSON.stringify(store));
};
const paintComments = () => {
  const list = document.getElementById("comment-list");
  if (!list) return;
  const thread = readThread(commentTarget);
  list.replaceChildren();
  if (!thread.length) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = "Пока нет комментариев.";
    list.appendChild(empty);
    return;
  }
  thread.forEach((item) => {
    const block = document.createElement("article");
    block.className = "comment-item";
    block.dataset.id = item.id;
    const author = document.createElement("p");
    author.className = "comment-author";
    author.textContent = item.author || "Фотограф";
    const body = document.createElement("p");
    body.className = "comment-body";
    body.textContent = item.text;
    const time = document.createElement("p");
    time.className = "comment-time";
    time.textContent = `${formatCommentWhen(item.at || Date.now())}${item.edited ? " · изменён" : ""}`;
    const actions = document.createElement("div");
    actions.className = "comment-actions";
    const edit = document.createElement("button");
    edit.type = "button";
    edit.dataset.commentEdit = item.id;
    edit.textContent = "Изменить";
    const remove = document.createElement("button");
    remove.type = "button";
    remove.dataset.commentDelete = item.id;
    remove.textContent = "Удалить";
    actions.append(edit, remove);
    block.append(author, body, time, actions);
    list.appendChild(block);
  });
};
document.getElementById("comment-list")?.addEventListener("click", (event) => {
  const editBtn = event.target.closest("[data-comment-edit]");
  const saveBtn = event.target.closest("[data-comment-save]");
  const deleteBtn = event.target.closest("[data-comment-delete]");
  if (deleteBtn) {
    writeThread(commentTarget, readThread(commentTarget).filter((item) => item.id !== deleteBtn.dataset.commentDelete));
    paintComments();
    return;
  }
  if (saveBtn) {
    const block = saveBtn.closest(".comment-item");
    const text = block?.querySelector(".comment-edit")?.value.trim() || "";
    if (!text) return;
    writeThread(commentTarget, readThread(commentTarget).map((item) => (item.id === saveBtn.dataset.commentSave ? { ...item, text, edited: true } : item)));
    paintComments();
    return;
  }
  if (!editBtn) return;
  const block = editBtn.closest(".comment-item");
  const body = block?.querySelector(".comment-body");
  const item = readThread(commentTarget).find((row) => row.id === editBtn.dataset.commentEdit);
  if (!body || !item) return;
  const area = document.createElement("textarea");
  area.className = "comment-edit";
  area.value = item.text;
  body.replaceWith(area);
  editBtn.textContent = "Сохранить";
  editBtn.dataset.commentSave = editBtn.dataset.commentEdit;
  delete editBtn.dataset.commentEdit;
  area.focus();
});
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-comment]");
  if (!button || button.closest("#comment-modal")) return;
  const modal = document.getElementById("comment-modal");
  if (!modal) return;
  event.preventDefault();
  commentTarget = button.getAttribute("data-comment") || "folder";
  const nameWrap = document.getElementById("comment-name-wrap");
  const nameInput = document.getElementById("comment-name");
  if (isClientGallery()) {
    const saved = sessionStorage.getItem("ft-comment-name") || "";
    if (nameInput) nameInput.value = saved;
    if (nameWrap) nameWrap.hidden = Boolean(saved);
  } else if (nameWrap) nameWrap.hidden = true;
  const area = document.getElementById("comment-text");
  if (area) area.value = "";
  paintComments();
  openOverlay("comment-modal");
  if (button.closest(".tile-drop")) closeTileMenus();
});
document.getElementById("comment-compose")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const area = document.getElementById("comment-text");
  const text = area?.value.trim() || "";
  if (!text) return;
  let author = "";
  if (isClientGallery()) {
    const typed = document.getElementById("comment-name")?.value.trim() || "";
    author = typed || sessionStorage.getItem("ft-comment-name") || "";
    if (!author) return;
    sessionStorage.setItem("ft-comment-name", author);
    const wrap = document.getElementById("comment-name-wrap");
    if (wrap) wrap.hidden = true;
  } else author = personName() || "Фотограф";
  const thread = readThread(commentTarget);
  thread.push({
    id: `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
    author,
    role: isClientGallery() ? "client" : "photo",
    text,
    at: Date.now(),
    edited: false
  });
  writeThread(commentTarget, thread);
  if (area) area.value = "";
  paintComments();
});
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-edit-secret]");
  if (!button) return;
  event.preventDefault();
  openSecretPanel(button.dataset.secretGallery || galleryId(), button.dataset.secretFolder || "");
});
const takeUploads = (event) => {
  const picked = event.target.files;
  ingestUploads(picked);
  event.target.value = "";
};
document.getElementById("add-files")?.addEventListener("change", takeUploads);
document.getElementById("pick-files")?.addEventListener("change", takeUploads);
document.getElementById("pick-folder")?.addEventListener("change", takeUploads);
const readEntryFile = (entry) => new Promise((resolve, reject) => entry.file(resolve, reject));
const readEntryBatch = (reader) => new Promise((resolve, reject) => reader.readEntries(resolve, reject));
const filesFromDrop = async (transfer) => {
  const items = [...transfer?.items || []];
  if (!items.some((item) => item.webkitGetAsEntry)) return [...transfer?.files || []];
  const out = [];
  const walk = async (entry, path) => {
    if (!entry) return;
    if (entry.isFile) {
      const file = await readEntryFile(entry);
      const rel = path ? `${path}/${file.name}` : file.name;
      try { Object.defineProperty(file, "ftPath", { value: rel }); } catch (error) { file.ftPath = rel; }
      out.push(file);
      return;
    }
    if (!entry.isDirectory) return;
    const reader = entry.createReader();
    let batch = [];
    do {
      batch = await readEntryBatch(reader);
      for (const child of batch) await walk(child, path ? `${path}/${entry.name}` : entry.name);
    } while (batch.length);
  };
  for (const item of items) {
    const entry = item.webkitGetAsEntry?.();
    if (entry) await walk(entry, "");
  }
  return out.length ? out : [...transfer?.files || []];
};
const takeDrop = async (event) => {
  event.preventDefault();
  const files = await filesFromDrop(event.dataTransfer);
  ingestUploads(files);
};
const dropZone = document.getElementById("drop-zone");
if (dropZone) {
  dropZone.addEventListener("dragover", (event) => { event.preventDefault(); });
  dropZone.addEventListener("drop", takeDrop);
}
document.getElementById("gallery-panel")?.addEventListener("dragover", (event) => {
  if (pageFile() !== "cabinet.html" || !event.dataTransfer?.types?.includes("Files")) return;
  event.preventDefault();
});
document.getElementById("gallery-panel")?.addEventListener("drop", (event) => {
  if (pageFile() !== "cabinet.html") return;
  takeDrop(event);
});
document.getElementById("split-toggle")?.addEventListener("change", (event) => {
  const all = splitMap();
  all[splitKey(galleryId(), folderId())] = event.target.checked;
  localStorage.setItem("ft-split", JSON.stringify(all));
  mountFolderBrowser();
});
document.querySelectorAll("[data-view-mode]").forEach((button) => {
  button.addEventListener("click", () => setViewMode(button.dataset.viewMode));
});
document.querySelectorAll("[data-display-choice]").forEach((field) => {
  field.addEventListener("change", () => setViewMode(field.value));
});
document.getElementById("split-sort")?.addEventListener("change", () => paintSplitList(galleryId(), folderId()));
const xmlEscape = (value) => String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const crc32 = (bytes) => {
  let crc = ~0;
  for (let i = 0; i < bytes.length; i += 1) {
    crc ^= bytes[i];
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return ~crc >>> 0;
};
const zipStore = (files) => {
  const encoder = new TextEncoder();
  const parts = [];
  const central = [];
  let offset = 0;
  files.forEach((file) => {
    const name = encoder.encode(file.name);
    const data = file.data;
    const crc = crc32(data);
    const local = new Uint8Array(30 + name.length);
    const view = new DataView(local.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(8, 0, true);
    view.setUint32(14, crc, true);
    view.setUint32(18, data.length, true);
    view.setUint32(22, data.length, true);
    view.setUint16(26, name.length, true);
    local.set(name, 30);
    parts.push(local, data);
    const cent = new Uint8Array(46 + name.length);
    const centView = new DataView(cent.buffer);
    centView.setUint32(0, 0x02014b50, true);
    centView.setUint16(4, 20, true);
    centView.setUint16(6, 20, true);
    centView.setUint16(8, 0, true);
    centView.setUint32(16, crc, true);
    centView.setUint32(20, data.length, true);
    centView.setUint32(24, data.length, true);
    centView.setUint16(28, name.length, true);
    centView.setUint32(42, offset, true);
    cent.set(name, 46);
    central.push(cent);
    offset += local.length + data.length;
  });
  const centralSize = central.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, offset, true);
  const blob = new Blob([...parts, ...central, end], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  return blob;
};
const cell = (ref, text) => `<c r="${ref}" t="inlineStr"><is><t>${xmlEscape(text)}</t></is></c>`;
const SAMPLE_NOTE = "* Названия должны совпадать с именами папок и идти в алфавитном порядке.";
const buildSampleXlsx = (title) => {
  const people = [
    ["1", "Иванов", "Иван", "ivanov@mail.ru"],
    ["2", "Петров", "Пётр", "petrov@mail.ru"]
  ].sort((a, b) => a[1].localeCompare(b[1], "ru"));
  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols><col min="1" max="1" width="12" customWidth="1"/><col min="2" max="2" width="16" customWidth="1"/><col min="3" max="3" width="12" customWidth="1"/><col min="4" max="4" width="20" customWidth="1"/></cols><sheetData>
<row r="1">${cell("A1", title)}</row>
<row r="2">${cell("A2", "Номер")}${cell("B2", "Фамилия*")}${cell("C2", "Имя")}${cell("D2", "Почта")}</row>
<row r="3">${cell("A3", people[0][0])}${cell("B3", people[0][1])}${cell("C3", people[0][2])}${cell("D3", people[0][3])}</row>
<row r="4">${cell("A4", people[1][0])}${cell("B4", people[1][1])}${cell("C4", people[1][2])}${cell("D4", people[1][3])}</row>
<row r="6">${cell("A6", SAMPLE_NOTE)}</row>
</sheetData><autoFilter ref="A2:D4"/></worksheet>`;
  const encoder = new TextEncoder();
  return zipStore([
    { name: "[Content_Types].xml", data: encoder.encode(`<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`) },
    { name: "_rels/.rels", data: encoder.encode(`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`) },
    { name: "xl/workbook.xml", data: encoder.encode(`<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Список" sheetId="1" r:id="rId1"/></sheets></workbook>`) },
    { name: "xl/_rels/workbook.xml.rels", data: encoder.encode(`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`) },
    { name: "xl/worksheets/sheet1.xml", data: encoder.encode(sheet) }
  ]);
};
const currentFolderTitle = () => {
  const gid = galleryId();
  const fid = folderId();
  return (fid && folderTitle(gid, fid)) || GALLERY_META[gid]?.title || "Папка";
};
const showSplitNote = (text, bad) => {
  const note = document.getElementById("split-note");
  if (!note) return;
  note.hidden = !text;
  note.textContent = text || "";
  note.classList.toggle("is-bad", Boolean(bad));
};
const parseCsvTable = (text) => {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const delimiter = lines[1].includes(";") ? ";" : (lines[1].includes("\t") ? "\t" : ",");
  const splitLine = (line) => line.split(delimiter).map((cell) => cell.trim().replace(/^"|"$/g, ""));
  return lines.slice(2).map((line) => {
    const cells = splitLine(line);
    return { number: cells[0] || "", surname: cells[1] || "", first: cells[2] || "", email: cells[3] || "" };
  });
};
const unzipEntries = async (buffer) => {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i -= 1) {
    if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("zip");
  const count = view.getUint16(eocd + 10, true);
  let pos = view.getUint32(eocd + 16, true);
  const files = {};
  for (let n = 0; n < count; n += 1) {
    if (view.getUint32(pos, true) !== 0x02014b50) break;
    const method = view.getUint16(pos + 10, true);
    const compSize = view.getUint32(pos + 20, true);
    const nameLen = view.getUint16(pos + 28, true);
    const extraLen = view.getUint16(pos + 30, true);
    const commentLen = view.getUint16(pos + 32, true);
    const localOff = view.getUint32(pos + 42, true);
    const name = new TextDecoder().decode(bytes.subarray(pos + 46, pos + 46 + nameLen));
    const localNameLen = view.getUint16(localOff + 26, true);
    const localExtra = view.getUint16(localOff + 28, true);
    const start = localOff + 30 + localNameLen + localExtra;
    let data = bytes.subarray(start, start + compSize);
    if (method === 8) {
      const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
      data = new Uint8Array(await new Response(stream).arrayBuffer());
    }
    files[name] = new TextDecoder().decode(data);
    pos += 46 + nameLen + extraLen + commentLen;
  }
  return files;
};
const parseSheetRows = (xml, shared) => {
  const rows = [];
  const rowMatches = xml.match(/<row\b[^>]*>[\s\S]*?<\/row>/g) || [];
  rowMatches.forEach((rowXml) => {
    const cells = {};
    const cellMatches = rowXml.match(/<c\b[^>]*>[\s\S]*?<\/c>|<c\b[^>]*\/>/g) || [];
    cellMatches.forEach((cellXml) => {
      const ref = (cellXml.match(/\br="([A-Z]+)\d+"/) || [])[1] || "";
      const type = (cellXml.match(/\bt="([^"]+)"/) || [])[1] || "";
      let value = (cellXml.match(/<v>([\s\S]*?)<\/v>/) || [])[1] || "";
      if (type === "s") value = shared[Number(value)] || "";
      else if (type === "inlineStr") value = (cellXml.match(/<t[^>]*>([\s\S]*?)<\/t>/) || [])[1] || "";
      value = value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
      if (ref) cells[ref] = value;
    });
    rows.push(cells);
  });
  return rows;
};
const sheetPeople = (rows) => rows.filter((row) => {
  const blob = [row.number, row.surname, row.first, row.email].join(" ").trim();
  if (!blob || blob.startsWith("*") || blob.includes("Названия должны совпадать")) return false;
  return true;
});
const rowsFromUpload = async (file) => {
  const name = (file.name || "").toLowerCase();
  if (name.endsWith(".xlsx")) {
    const packed = await unzipEntries(await file.arrayBuffer());
    const sharedXml = packed["xl/sharedStrings.xml"] || "";
    const shared = [...sharedXml.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((match) => match[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"));
    const sheetName = Object.keys(packed).find((key) => key.startsWith("xl/worksheets/sheet"));
    const rows = parseSheetRows(packed[sheetName] || "", shared);
    return sheetPeople(rows.slice(2).map((row) => ({ number: row.A || "", surname: row.B || "", first: row.C || "", email: row.D || "" })));
  }
  return sheetPeople(parseCsvTable(await file.text()));
};
const normName = (value) => String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
const matchChild = (nodes, surname, first) => {
  const sur = normName(surname);
  if (!sur) return null;
  const full = normName(`${surname} ${first}`);
  return nodes.find((node) => normName(node.name) === full)
    || nodes.find((node) => {
      const name = normName(node.name);
      return name === sur || name.startsWith(`${sur} `);
    })
    || null;
};
const applyMailSheet = async (file) => {
  const gid = galleryId();
  const fid = folderId();
  const kids = childFolders(gid, fid);
  let rows = [];
  try { rows = await rowsFromUpload(file); } catch (error) { rows = []; }
  if (!rows.length) {
    showSplitNote("В файле нет строк со списком.", true);
    return;
  }
  const missed = [];
  const filled = [];
  rows.forEach((row) => {
    const surname = row.surname.trim();
    if (!surname) {
      missed.push(row.first ? `пустая фамилия (${row.first})` : "пустая фамилия");
      return;
    }
    const node = matchChild(kids, surname, row.first);
    if (!node) {
      missed.push(row.first ? `${surname} ${row.first}` : surname);
      return;
    }
    saveMail(gid, node.id, row.email || "");
    filled.push(node.name);
  });
  paintSplitList(gid, fid);
  if (missed.length) showSplitNote(`Не совпало: ${missed.join(", ")}. Почта для них не подставлена.${filled.length ? ` Подставлено: ${filled.join(", ")}.` : ""} Названия должны совпадать с именами папок и идти в алфавитном порядке.`, true);
  else showSplitNote(`Почта подставлена: ${filled.join(", ")}.`, false);
};
document.getElementById("split-sample")?.addEventListener("click", () => {
  const title = currentFolderTitle();
  downloadBlob(buildSampleXlsx(title), `${title}.xlsx`);
});
document.getElementById("split-upload")?.addEventListener("click", () => document.getElementById("split-upload-file")?.click());
document.getElementById("split-upload-file")?.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (file) await applyMailSheet(file);
});
document.getElementById("split-mail-all")?.addEventListener("click", () => {
  const gid = galleryId();
  const fid = folderId();
  const ready = [];
  const empty = [];
  childFolders(gid, fid).forEach((node) => {
    const email = mailOf(gid, node.id);
    if (email) ready.push({ node, email });
    else empty.push(node.name);
  });
  if (ready[0]) {
    const { node, email } = ready[0];
    const password = folderAccessOf(gid, node.id).password || "не задан";
    const body = `От: ФотоТранзит <hello@fototranzit.ru>\n\nПапка: ${node.name}\nСсылка: ${absFolderLink(gid, node)}\nПароль: ${password}`;
    location.href = `mailto:${email}?subject=${encodeURIComponent(node.name)}&body=${encodeURIComponent(body)}`;
  }
  const rest = ready.slice(1).map((item) => item.node.name);
  const bits = [];
  if (ready[0]) bits.push(`Открыто письмо для «${ready[0].node.name}».`);
  if (rest.length) bits.push(`Остальные отправьте из своей строки: ${rest.join(", ")}.`);
  if (empty.length) bits.push(`Без почты: ${empty.join(", ")}.`);
  if (!ready.length && !empty.length) bits.push("В этой папке нет вложенных папок.");
  showSplitNote(bits.join(" "), empty.length > 0 && !ready.length);
});
const runSplitFind = () => {
  const field = document.getElementById("split-query");
  splitQuery = field?.value || "";
  mountFolderBrowser();
};
document.getElementById("split-find")?.addEventListener("click", () => {
  document.getElementById("split-query")?.focus();
  runSplitFind();
});
document.getElementById("split-query")?.addEventListener("input", runSplitFind);
document.getElementById("split-query")?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  runSplitFind();
});
document.getElementById("split-gen-all")?.addEventListener("click", async () => {
  const gid = galleryId();
  const fid = folderId();
  const kids = childFolders(gid, fid);
  const any = kids.some((node) => folderAccessOf(gid, node.id).password);
  const reset = any ? await askReset() : true;
  kids.forEach((node) => {
    const current = folderAccessOf(gid, node.id).password || "";
    if (!reset && current) return;
    saveFolderAccess(gid, node.id, { password: genPass() });
  });
  paintSplitList(gid, fid);
});
document.getElementById("split-excel")?.addEventListener("click", () => {
  const gid = galleryId();
  const fid = folderId();
  const lines = ["Название папки;Ссылка;Пароль"];
  childFolders(gid, fid).forEach((node) => {
    const password = folderAccessOf(gid, node.id).password || "";
    lines.push([node.name, absFolderLink(gid, node), password].join(";"));
  });
  const title = fid ? (folderTitle(gid, fid) || "папка") : (GALLERY_META[gid]?.title || "галерея");
  saveText(`${title}.csv`, lines);
});
const shiftId = (ids, id, dir) => {
  const index = ids.indexOf(id);
  const next = index + (dir === "up" ? -1 : 1);
  if (index < 0 || next < 0 || next >= ids.length) return ids;
  const copy = ids.slice();
  const [item] = copy.splice(index, 1);
  copy.splice(next, 0, item);
  return copy;
};
document.addEventListener("click", (event) => {
  const move = event.target.closest("[data-move]");
  if (move) {
    const gid = galleryId();
    const fid = folderId();
    const row = menuHost(move);
    if (move.dataset.kind === "file" || row?.dataset.file) {
      const ids = orderedFiles(gid, fid).map((file) => file.id);
      saveFileOrder(gid, fid, shiftId(ids, row.dataset.file, move.dataset.move));
    } else if (row?.dataset.folder) {
      const ids = orderedKids(gid, fid, childFolders(gid, fid)).map((node) => node.id);
      saveOrder(gid, fid, shiftId(ids, row.dataset.folder, move.dataset.move));
    }
    mountFolderBrowser();
    return;
  }
  const cover = event.target.closest("[data-cover]");
  if (cover) {
    const gid = galleryId();
    const fid = folderId();
    const row = menuHost(cover);
    const src = row?.querySelector("img")?.getAttribute("src") || "";
    if (src) saveCovers(gid, fid, src);
    mountFolderBrowser();
    return;
  }
  const hideFolder = event.target.closest("[data-hide-folder]");
  if (hideFolder) {
    const row = menuHost(hideFolder);
    if (!row) return;
    const access = folderAccessOf(row.dataset.gallery, row.dataset.folder);
    const hiding = !access.hidden;
    saveFolderAccess(row.dataset.gallery, row.dataset.folder, { hidden: !access.hidden });
    mountFolderBrowser();
    if (hiding) openSecretPanel(row.dataset.gallery, row.dataset.folder);
    return;
  }
  const hideFile = event.target.closest("[data-hide-file]");
  if (hideFile) {
    const row = hideFile.closest("[data-file]");
    if (!row) return;
    const gid = galleryId();
    const current = new Set(settings(gid).hidden || []);
    const hiding = !current.has(row.dataset.file);
    if (hiding) current.add(row.dataset.file);
    else current.delete(row.dataset.file);
    saveSettings({ hidden: [...current] }, gid);
    mountFolderBrowser();
    if (hiding) openSecretPanel(gid, folderId() || "");
    return;
  }
  const delFile = event.target.closest("[data-remove-file]");
  if (delFile) {
    const row = menuHost(delFile);
    const name = row?.querySelector("h3")?.textContent || "файл";
    if (!row?.dataset?.file) return;
    const gid = row.dataset.gallery || galleryId();
    const fileId = row.dataset.file;
    askDelete(name, {
      trash: () => { trashFile(gid, fileId, name); mountFolderBrowser(); },
      forever: () => { purgeFile(gid, fileId); mountFolderBrowser(); }
    });
    return;
  }
  const gen = event.target.closest("[data-gen]");
  if (gen) {
    const row = gen.closest("[data-folder]");
    if (!row) return;
    const password = genPass();
    saveFolderAccess(row.dataset.gallery, row.dataset.folder, { password });
    const field = row.querySelector(".split-pass");
    if (field) field.value = password;
    return;
  }
  const send = event.target.closest("[data-send-mail]");
  if (!send) return;
  const row = send.closest("[data-folder]");
  if (!row) return;
  const email = row.querySelector(".split-mail")?.value.trim() || "";
  if (!email) return;
  const name = row.querySelector("h3")?.textContent || "Папка";
  const password = folderAccessOf(row.dataset.gallery, row.dataset.folder).password || "не задан";
  const link = absFolderLink(row.dataset.gallery, { id: row.dataset.folder });
  const body = `От: ФотоТранзит <hello@fototranzit.ru>\n\nПапка: ${name}\nСсылка: ${link}\nПароль: ${password}`;
  location.href = `mailto:${email}?subject=${encodeURIComponent(name)}&body=${encodeURIComponent(body)}`;
});
document.getElementById("split-list")?.addEventListener("change", (event) => {
  const field = event.target.closest(".split-pass");
  if (!field) return;
  const row = field.closest("[data-folder]");
  if (!row) return;
  saveFolderAccess(row.dataset.gallery, row.dataset.folder, { password: field.value.trim() });
});
document.getElementById("client-lock")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const gid = galleryId();
  const fid = folderId();
  const need = folderAccessOf(gid, fid).password || "";
  const got = document.getElementById("client-pass")?.value || "";
  const note = document.getElementById("client-pass-note");
  if (got !== need) {
    if (note) note.textContent = "Пароль не подошёл.";
    return;
  }
  sessionStorage.setItem(`ft-foldpass-${gid}/${fid}`, need);
  if (note) note.textContent = "";
  paintClient(gid, fid);
});
document.getElementById("client-share")?.addEventListener("click", async () => {
  const note = document.getElementById("client-note");
  const url = location.href;
  if (navigator.share) {
    try { await navigator.share({ title: document.title, url }); return; } catch (error) {}
  }
  try { await navigator.clipboard.writeText(url); } catch (error) {}
  if (note) note.textContent = "Ссылка скопирована.";
});
document.getElementById("client-review")?.addEventListener("click", () => openOverlay("review-modal"));
document.getElementById("client-download")?.addEventListener("click", (event) => {
  event.stopPropagation();
  const menu = document.getElementById("client-download-menu");
  if (menu) menu.hidden = !menu.hidden;
});
document.getElementById("client-download-menu")?.addEventListener("click", async (event) => {
  event.stopPropagation();
  const button = event.target.closest("[data-dl]");
  if (!button) return;
  const menu = document.getElementById("client-download-menu");
  if (menu) menu.hidden = true;
  const note = document.getElementById("client-note");
  const gid = galleryId();
  let list = [];
  if (button.dataset.dl === "picked") {
    const ids = new Set([...document.querySelectorAll(".client-shot .heart.on")].map((heart) => heart.closest(".client-shot").dataset.file));
    list = clientFiles(gid, folderId()).filter((file) => ids.has(file.id));
    if (!list.length && note) note.textContent = "Сначала отметьте кадры сердечком.";
  } else {
    list = filesUnder(gid, issuedRoot());
  }
  if (button.dataset.dl === "folder" && note) note.textContent = "Браузер сохранит файлы в загрузки, папкой. Отдельного приложения нет.";
  if (button.dataset.dl === "phone" && note) note.textContent = "Кадр уходит в загрузки браузера. На телефоне его можно отправить в галерею через «Поделиться». Отдельного приложения нет.";
  for (const file of list) {
    if (!file.src) continue;
    if (button.dataset.dl === "phone") {
      const shared = await shareUrl(file.src, file.name);
      if (shared) continue;
    }
    saveLink(file.src, file.name);
    await new Promise((resolve) => setTimeout(resolve, 180));
  }
});
document.addEventListener("click", (event) => {
  if (event.target.closest(".dl-wrap")) return;
  const menu = document.getElementById("client-download-menu");
  if (menu) menu.hidden = true;
  const heart = event.target.closest(".client-shot .heart");
  if (heart) {
    event.stopPropagation();
    heart.classList.toggle("on");
    heart.textContent = heart.classList.contains("on") ? "♥" : "♡";
    return;
  }
  const shot = event.target.closest(".client-shot");
  if (!shot || !document.body.classList.contains("client-view")) return;
  const img = shot.querySelector("img");
  const viewer = document.querySelector("#photo-view img");
  if (img && viewer) viewer.src = img.getAttribute("src");
  const label = document.querySelector("#photo-view .ov-bar span");
  if (label) label.textContent = shot.dataset.name || "";
  openOverlay("photo-view");
});

const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};
const wrapLines = (ctx, text, max) => {
  const words = String(text || "").split(/\s+/);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > max && line) {
      lines.push(line);
      line = word;
    } else line = next;
  });
  if (line) lines.push(line);
  return lines.slice(0, 6);
};
const reviewJpeg = (author, stars, text) => {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 800;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#07111c";
  ctx.fillRect(0, 0, 1200, 800);
  const glow = ctx.createRadialGradient(620, 430, 20, 620, 430, 460);
  glow.addColorStop(0, "rgba(126,240,255,0.28)");
  glow.addColorStop(1, "rgba(7,17,28,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1200, 800);
  ctx.fillStyle = "#f3fbff";
  ctx.font = "700 46px Segoe UI, sans-serif";
  ctx.fillText(personName() || "Фотограф", 72, 110);
  ctx.fillStyle = "#7ef0ff";
  ctx.font = "40px Segoe UI, sans-serif";
  ctx.fillText(stars || "", 72, 168);
  ctx.save();
  ctx.shadowColor = "rgba(126,240,255,0.9)";
  ctx.shadowBlur = 32;
  roundRect(ctx, 72, 220, 1056, 380, 28);
  ctx.fillStyle = "rgba(10,24,42,0.92)";
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(126,240,255,0.85)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = "#9b8cff";
  ctx.font = "700 28px Segoe UI, sans-serif";
  ctx.fillText(author || "", 108, 280);
  ctx.fillStyle = "#f3fbff";
  ctx.font = "32px Segoe UI, sans-serif";
  wrapLines(ctx, text || "", 980).forEach((line, index) => ctx.fillText(line, 108, 350 + index * 46));
  ctx.beginPath();
  ctx.arc(104, 700, 18, 0, Math.PI * 2);
  ctx.fillStyle = "#7ef0ff";
  ctx.fill();
  ctx.fillStyle = "#f3fbff";
  ctx.font = "700 30px Segoe UI, sans-serif";
  ctx.fillText("ФотоТранзит", 136, 712);
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
};
const downloadBlob = (blob, name) => {
  if (!blob) return;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
};
const reviewNodes = () => [...document.querySelectorAll("#print-sheet .review")];
const reviewParts = (node) => ({
  author: node.querySelector("strong")?.textContent.trim() || "",
  stars: node.querySelector(".stars")?.textContent.trim() || "",
  text: node.querySelector("p")?.textContent.trim() || "",
  published: node.dataset.published === "1"
});
const saveReviewJpeg = async (node) => {
  const part = reviewParts(node);
  const blob = await reviewJpeg(part.author, part.stars, part.text);
  downloadBlob(blob, `otzyv-${part.author || "review"}.jpg`);
};
document.querySelectorAll("[data-jpeg]").forEach((button) => {
  button.addEventListener("click", () => saveReviewJpeg(button.closest(".review")));
});
document.getElementById("jpeg-all")?.addEventListener("click", async () => {
  for (const node of reviewNodes()) {
    await saveReviewJpeg(node);
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
});
document.querySelectorAll("[data-pub]").forEach((box) => {
  box.addEventListener("change", () => {
    box.closest(".review").dataset.published = box.checked ? "1" : "0";
  });
});
const printName = document.getElementById("print-name");
if (printName) printName.textContent = personName() || "Фотограф";
document.getElementById("pdf-reviews")?.addEventListener("click", () => window.print());
document.getElementById("mail-reviews")?.addEventListener("click", async () => {
  const note = document.getElementById("mail-note");
  const profile = loadProfile();
  const email = profile?.email?.trim() || "";
  if (!email) {
    if (note) note.textContent = "Укажите email в карточке фотографа и сохраните её. Письмо не открыто.";
    return;
  }
  const format = document.getElementById("mail-format")?.value || "text";
  const labels = { text: "Текст", excel: "Excel", pdf: "PDF", images: "Картинки" };
  const lines = reviewNodes().map((node) => {
    const part = reviewParts(node);
    return `${part.author}; ${part.stars}; ${part.text}`;
  });
  const body = `От: ФотоТранзит <hello@fototranzit.ru>\nФормат: ${labels[format] || format}\n\n${lines.join("\n")}`;
  if (format === "excel") saveText("отзывы.csv", ["Имя;Оценка;Текст", ...lines]);
  if (format === "images") {
    for (const node of reviewNodes()) {
      await saveReviewJpeg(node);
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  if (format === "pdf") window.print();
  if (note) note.textContent = "";
  location.href = `mailto:${email}?subject=${encodeURIComponent("Отзывы ФотоТранзит")}&body=${encodeURIComponent(body)}`;
});

const autopay = document.getElementById("autopay");
if (autopay) {
  autopay.checked = localStorage.getItem("ft-autopay") === "1";
  autopay.addEventListener("change", () => revealSave("save-billing"));
  document.getElementById("save-billing")?.addEventListener("click", () => {
    localStorage.setItem("ft-autopay", autopay.checked ? "1" : "0");
    document.getElementById("save-billing").hidden = true;
    flashSaved();
  });
  const next = document.getElementById("next-plan");
  if (next) {
    try {
      const queued = JSON.parse(localStorage.getItem("ft-next") || "null");
      if (queued) next.textContent = `Следующий пакет: ${queued.name}, старт ${queued.starts}. Сейчас действует пробный период.`;
    } catch (error) {}
  }
}

const payScreen = document.getElementById("pay-screen");
if (payScreen) {
  const plans = {
    start: { name: "Старт", amount: 890 },
    profi: { name: "Профи", amount: 2290 },
    studio: { name: "Студия", amount: 5400 }
  };
  const picked = plans[new URLSearchParams(location.search).get("plan")] || plans.profi;
  const starts = "21 октября 2026";
  const money = (value) => `${value.toLocaleString("ru-RU")} ₽`;
  const priceOf = () => {
    const code = document.getElementById("pay-coupon")?.value.trim().toUpperCase() || "";
    const note = document.getElementById("pay-coupon-note");
    if (!code) {
      if (note) note.textContent = "";
      return picked.amount;
    }
    if (code === "FOTO10") {
      if (note) note.textContent = "Купон FOTO10: скидка 10%. Дата старта не сдвигается.";
      return Math.round(picked.amount * 0.9);
    }
    if (note) note.textContent = "Такого купона нет. Сумма без скидки.";
    return picked.amount;
  };
  document.getElementById("pay-title").textContent = picked.name;
  document.getElementById("pay-plan").textContent = picked.name;
  document.getElementById("pay-start").textContent = starts;
  const payGauge = document.getElementById("pay-gauge");
  if (payGauge) {
    const key = new URLSearchParams(location.search).get("plan");
    payGauge.dataset.plan = Object.prototype.hasOwnProperty.call(plans, key) ? key : "profi";
    payGauge.dataset.start = starts;
  }
  const paintAmount = () => { document.getElementById("pay-amount").textContent = money(priceOf()); };
  paintAmount();
  document.getElementById("pay-coupon")?.addEventListener("input", paintAmount);
  document.getElementById("pay-go")?.addEventListener("click", () => {
    const amount = priceOf();
    localStorage.setItem("ft-next", JSON.stringify({ name: picked.name, starts, amount }));
    payScreen.hidden = true;
    const success = document.getElementById("pay-success");
    success.hidden = false;
    document.getElementById("pay-success-text").textContent = `${picked.name} оплачен на ${money(amount)}. Пакет начнётся ${starts}, когда закончится текущий.`;
  });
}

const FT_USED_GB = 6.4;
const ftPlans = {
  trial: { name: "Пробный период", days: 7, gb: 20 },
  start: { name: "Старт", days: 30, gb: 100 },
  profi: { name: "Профи", days: 30, gb: 500 },
  studio: { name: "Студия", days: 30, gb: 2048 }
};
const ftSizeLabel = (gb) => {
  const rounded = Math.round(gb * 10) / 10;
  if (rounded >= 1024) {
    const tb = Math.round((gb / 1024) * 100) / 100;
    return `${tb.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ТБ`;
  }
  const digits = Number.isInteger(rounded) ? 0 : 1;
  return `${rounded.toLocaleString("ru-RU", { minimumFractionDigits: digits, maximumFractionDigits: 1 })} ГБ`;
};
const ftTrialEnd = new Date(2026, 9, 21);
const ftMonths = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const ftDayStart = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const ftRuDate = (date) => `${date.getDate()} ${ftMonths[date.getMonth()]} ${date.getFullYear()}`;
const ftDaysWord = (count) => {
  const abs = Math.abs(count) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return "дней";
  if (last === 1) return "день";
  if (last >= 2 && last <= 4) return "дня";
  return "дней";
};
const ftLeftPhrase = (count) => `${ftDaysWord(count) === "день" ? "остался" : "осталось"} ${count} ${ftDaysWord(count)}`;
const ftTrialLeft = () => {
  const end = ftDayStart(ftTrialEnd);
  const today = ftDayStart(new Date());
  const diff = Math.round((end - today) / 86400000);
  const left = Math.max(0, Math.min(ftPlans.trial.days, diff));
  return { left, ratio: left / ftPlans.trial.days, end };
};
let ftGaugeSeq = 0;
const ftSpeedometer = (ratio) => {
  const id = `ftg${++ftGaugeSeq}`;
  const cx = 100;
  const cy = 108;
  const radius = 74;
  const start = 150;
  const sweep = 240;
  const rad = (deg) => (deg * Math.PI) / 180;
  const point = (deg, size) => [cx + size * Math.cos(rad(deg)), cy + size * Math.sin(rad(deg))];
  const [x1, y1] = point(start, radius);
  const [x2, y2] = point(start + sweep, radius);
  const arc = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 1 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  const length = radius * rad(sweep);
  const clamped = Math.max(0, Math.min(1, ratio));
  const tip = start + sweep * clamped;
  const [nx, ny] = point(tip, radius - 16);
  const [tx, ty] = point(tip, radius);
  const [hx, hy] = point(tip, 34);
  const filled = length * clamped;
  const value = clamped > 0.004
    ? `<path d="${arc}" fill="none" stroke="url(#${id})" stroke-width="12" stroke-linecap="round" stroke-dasharray="${filled.toFixed(2)} ${length.toFixed(2)}" filter="url(#${id}f)"/>`
    : "";
  return `<svg viewBox="20 24 164 140" aria-hidden="true">
    <defs>
      <linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}">
        <stop offset="0%" stop-color="#3ee6a0"/>
        <stop offset="46%" stop-color="#7ef0ff"/>
        <stop offset="100%" stop-color="#4ea2ff"/>
      </linearGradient>
      <filter id="${id}f" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="0" stdDeviation="1.6" flood-color="#7ef0ff" flood-opacity="0.55"/>
      </filter>
    </defs>
    <path d="${arc}" fill="none" stroke="#24384c" stroke-width="12" stroke-linecap="round"/>
    ${value}
    <line x1="${hx.toFixed(2)}" y1="${hy.toFixed(2)}" x2="${nx.toFixed(2)}" y2="${ny.toFixed(2)}" stroke="#f4fbff" stroke-width="2.6" stroke-linecap="round"/>
    <circle cx="${tx.toFixed(2)}" cy="${ty.toFixed(2)}" r="6.5" fill="#7ef0ff" stroke="#3ee6a0" stroke-width="2"/>
    <circle cx="${cx}" cy="${cy}" r="5" fill="#07111c" stroke="#7ef0ff" stroke-width="2"/>
  </svg>`;
};
const ftPaintGauge = (host) => {
  const mode = host.dataset.gauge || "full";
  const plan = ftPlans[host.dataset.plan] || ftPlans.trial;
  const trial = ftTrialLeft();
  let ratio = 1;
  let lines = [];
  if (mode === "storage") {
    const cap = plan.gb || 20;
    const used = Math.min(FT_USED_GB, cap);
    const free = Math.max(0, Math.round((cap - used) * 10) / 10);
    ratio = cap ? used / cap : 0;
    lines = [`${ftSizeLabel(used)} занято`, `${ftSizeLabel(free)} свободно`];
  } else if (mode === "active") {
    ratio = trial.ratio;
    lines = [plan.name, `до ${ftRuDate(trial.end)}`, ftLeftPhrase(trial.left)];
  } else if (mode === "upcoming") {
    const span = `${plan.days} ${ftDaysWord(plan.days)}`;
    lines = [plan.name, `с ${host.dataset.start || ftRuDate(trial.end)}`, span];
  } else {
    lines = [plan.name === "Пробный период" ? "Пробный" : plan.name, `${plan.days} ${ftDaysWord(plan.days)}`];
  }
  host.innerHTML = `<div class="gauge">${ftSpeedometer(ratio)}<div class="gauge-copy"><p class="gauge-name">${lines[0]}</p>${lines.slice(1).map((line) => `<p class="gauge-meta">${line}</p>`).join("")}</div></div>`;
};
document.querySelectorAll("[data-gauge]").forEach(ftPaintGauge);
const paintTrash = () => {
  const host = document.getElementById("trash-list");
  if (!host) return;
  const items = loadTrash();
  host.replaceChildren();
  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = "Корзина пуста.";
    host.appendChild(empty);
    return;
  }
  items.slice().reverse().forEach((item) => {
    const row = document.createElement("article");
    row.className = "list-row";
    const title = document.createElement("h3");
    const kind = item.kind === "folder" ? "Папка" : (item.kind === "file" ? "Файл" : "Галерея");
    title.textContent = item.title || item.id || "Без названия";
    const meta = document.createElement("p");
    meta.className = "hint";
    meta.textContent = `${kind}. Срок с создания не продлевается.`;
    row.append(title, meta);
    host.appendChild(row);
  });
};
if (params.get("view") === "trash") {
  const trash = document.getElementById("trash-view");
  const panel = document.getElementById("gallery-panel");
  const referral = document.getElementById("referral-box");
  if (trash) trash.hidden = false;
  if (panel) panel.hidden = true;
  if (referral) referral.hidden = true;
  paintTrash();
}
document.getElementById("empty-trash")?.addEventListener("click", () => {
  saveTrash([]);
  paintTrash();
});
const billingLead = document.getElementById("billing-lead");
if (billingLead) {
  const trial = ftTrialLeft();
  const phrase = ftLeftPhrase(trial.left);
  const head = phrase.charAt(0).toUpperCase() + phrase.slice(1);
  billingLead.textContent = `${head}, до ${ftRuDate(trial.end)}. Занято 6,4 из 20 ГБ. Пакет ещё действует: новый можно оплатить сейчас, он начнётся 21 октября 2026, когда текущий закончится.`;
}
