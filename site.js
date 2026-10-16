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
  const lines = ["Имя папки;Пароль"];
  list.forEach((row) => {
    const name = row.querySelector("[data-name]")?.textContent.trim() || "";
    const pass = row.querySelector("[data-pass]")?.textContent.trim() || "";
    lines.push(`${name};${pass}`);
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
const writeList = (key, list) => localStorage.setItem(key, JSON.stringify(list));
const GALLERY_META = {
  wedding: { title: "Свадьба Марии и Ильи", date: "12 сентября", cover: "img/p1.jpg" },
  kindergarten: { title: "Садик «Ромашка», группа 5", date: "2 ноября", cover: "img/p5.jpg" },
  portrait: { title: "Портрет в студии", date: "18 ноября", cover: "img/cover.jpg" }
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
  { id: "cover", name: "portrait.jpg", src: "img/cover.jpg", in: "wedding portrait" },
  { id: "p2", name: "ceremony-014.jpg", src: "img/p2.jpg", in: "wedding" },
  { id: "p3", name: "hands.jpg", src: "img/p3.jpg", in: "wedding kindergarten" },
  { id: "p4", name: "dance.mp4", src: "img/p4.jpg", in: "wedding" },
  { id: "p5", name: "balloons.jpg", src: "img/p5.jpg", in: "wedding kindergarten" },
  { id: "p6", name: "couple.jpg", src: "img/p6.jpg", in: "wedding portrait" },
  { id: "pdf", name: "Список гостей.pdf", src: "", in: "wedding kindergarten", doc: true }
];
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
const locateFolder = (gid, fid, nodes = FOLDER_TREE[gid] || [], ancestors = []) => {
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
  const nodes = fid ? (locateFolder(gid, fid)?.node.children || []) : (FOLDER_TREE[gid] || []);
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
  const tileNodes = [...document.querySelectorAll("#photo-tiles [data-file]")];
  const emptyTiles = document.getElementById("tiles-empty");
  if (emptyTiles) emptyTiles.hidden = tileNodes.length === 0 || tileNodes.some((node) => !node.hidden);
  document.querySelectorAll("[data-download='file']").forEach((button) => { button.hidden = !state.originals; });
  document.querySelectorAll("[data-download='small']").forEach((button) => { button.hidden = !state.small; });
  const mark = document.getElementById("shot-wm");
  if (mark) mark.hidden = !state.watermark || state.originals;
  const blackBtn = document.getElementById("show-black");
  if (blackBtn) blackBtn.hidden = !state.guard;
  if (document.body.dataset.guard) document.body.dataset.guard = state.guard ? "on" : "off";
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
      const byKind = kind !== "all" && !kinds.includes(kind);
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
    if (blob) saveLink(URL.createObjectURL(blob), name.replace(/\.\w+$/, "") + "-small.jpg");
  } else {
    saveLink(src, name);
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
    const img = document.querySelector("#photo-view img");
    const src = img?.getAttribute("src") || "img/cover.jpg";
    const name = (img?.src || "photo.jpg").split("/").pop().split("?")[0];
    await deliverDownload(kind, src, name, button);
  });
});

const blackout = document.getElementById("blackout");
if (blackout) {
  const guardOn = () => document.body.dataset.guard === "on" && settings().guard;
  document.addEventListener("visibilitychange", () => {
    if (!guardPause && guardOn()) blackout.hidden = !document.hidden;
  });
  window.addEventListener("blur", () => { if (!guardPause && guardOn()) blackout.hidden = false; });
  window.addEventListener("focus", () => { blackout.hidden = true; });
}
document.getElementById("show-black")?.addEventListener("click", () => {
  if (blackout) blackout.hidden = false;
});

const brandPending = {};
let logoCleared = false;
let cropPending = null;
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
  const maxX = Math.max(0, (nw * scale - size) / 2);
  const maxY = Math.max(0, (nh * scale - size) / 2);
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
  document.querySelectorAll("[data-use='logo']").forEach((img) => {
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
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      brandPending[key] = canvas.toDataURL("image/jpeg", 0.86);
      if (key === "ft-logo") logoCleared = false;
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
const portraitEditor = document.querySelector("[data-crop='edit']");
if (portraitEditor) {
  let drag = null;
  portraitEditor.addEventListener("pointerdown", (event) => {
    const img = portraitEditor.querySelector("[data-use='photo']");
    if (!img || img.hidden || !currentPhoto()) return;
    portraitEditor.setPointerCapture(event.pointerId);
    portraitEditor.classList.add("is-dragging");
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, crop: { ...liveCrop() } };
    event.preventDefault();
  });
  portraitEditor.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const img = portraitEditor.querySelector("[data-use='photo']");
    const size = portraitEditor.clientWidth || 168;
    cropPending = placePortrait(portraitEditor, img, {
      x: drag.crop.x + (event.clientX - drag.x) / size,
      y: drag.crop.y + (event.clientY - drag.y) / size,
      z: drag.crop.z
    });
    revealSave("save-profile");
  });
  const endDrag = (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    drag = null;
    portraitEditor.classList.remove("is-dragging");
  };
  portraitEditor.addEventListener("pointerup", endDrag);
  portraitEditor.addEventListener("pointercancel", endDrag);
}
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
const placeTileMenu = (anchor, menu) => {
  document.body.appendChild(menu);
  menu.hidden = false;
  anchor.setAttribute("aria-expanded", "true");
  const margin = 8;
  const seen = anchor.getBoundingClientRect();
  if (seen.bottom < 72 || seen.top > window.innerHeight - 72) {
    anchor.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" });
  }
  const rect = anchor.getBoundingClientRect();
  const width = menu.offsetWidth;
  const height = menu.offsetHeight;
  let left = rect.right - width;
  left = Math.min(Math.max(margin, left), Math.max(margin, window.innerWidth - width - margin));
  let top = rect.bottom + 6;
  if (top + height > window.innerHeight - margin) top = rect.top - height - 6;
  if (top < margin) top = margin;
  if (top + height > window.innerHeight - margin) top = Math.max(margin, window.innerHeight - height - margin);
  menu.style.left = `${Math.round(left)}px`;
  menu.style.top = `${Math.round(top)}px`;
};
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
window.addEventListener("resize", closeTileMenus);
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
  const next = list.includes(file) ? list.filter((item) => item !== file) : [...list, file];
  pending[id] = { ...(pending[id] || {}), hidden: next };
  revealSave(scope ? "save-folder-manage" : "save-project");
  if (button.closest(".tile-drop")) closeTileMenus();
  paintFiles();
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-del-file]");
  if (!button) return;
  const row = fileHost(button);
  if (!row || !belongs(row)) return;
  const name = row.querySelector(".tile-name")?.textContent || row.querySelector("span")?.textContent || "файл";
  if (!confirm(`Удалить «${name}» только из этой галереи?`)) return;
  saveSettings({ deleted: [...settings().deleted, row.dataset.file] });
  if (button.closest(".tile-drop")) closeTileMenus();
  paintFiles();
});

document.getElementById("delete-all-files")?.addEventListener("click", () => {
  const rows = [...document.querySelectorAll("#file-list [data-file]")].filter((row) => belongs(row) && !settings().deleted.includes(row.dataset.file));
  if (!rows.length) return;
  if (!confirm("Удалить все файлы только этой галереи?")) return;
  saveSettings({ deleted: [...new Set([...settings().deleted, ...rows.map((row) => row.dataset.file)])] });
  paintFiles();
});

document.getElementById("delete-gallery")?.addEventListener("click", () => {
  const title = document.querySelector("[data-project-title]")?.textContent || "галерею";
  if (!confirm(`Удалить галерею «${title}»?`)) return;
  writeList("ft-gone", [...goneGalleries(), galleryId()]);
  location.href = "cabinet.html";
});

document.querySelectorAll("[data-gallery]").forEach((card) => {
  if (goneGalleries().includes(card.dataset.gallery)) card.remove();
});
const galleryCards = document.getElementById("gallery-cards");
const galleriesEmpty = document.getElementById("galleries-empty");
if (galleryCards && galleriesEmpty) galleriesEmpty.hidden = galleryCards.children.length > 0;

document.querySelectorAll("[data-del-gallery]").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest("[data-gallery]");
    const name = card.querySelector("h3")?.textContent || "галерею";
    if (!confirm(`Удалить «${name}»?`)) return;
    writeList("ft-gone", [...goneGalleries(), card.dataset.gallery]);
    card.remove();
    if (galleriesEmpty) galleriesEmpty.hidden = galleryCards.children.length > 0;
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
  const secret = document.getElementById("card-secret");
  if (secret) secret.value = state.secret;
  document.querySelectorAll("[data-card-opt]").forEach((field) => {
    field.checked = Boolean(state[field.dataset.cardOpt]);
  });
  const files = document.getElementById("card-files");
  if (files) {
    const next = new URLSearchParams();
    next.set("id", id);
    if (folder) next.set("folder", folder);
    files.href = `${folder ? "cabinet.html" : "project.html"}?${next.toString()}`;
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
document.getElementById("card-secret")?.addEventListener("input", (event) => {
  pending[settingsCard] = { ...(pending[settingsCard] || {}), secret: event.target.value.trim() };
  revealSave("save-card");
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
  if (!confirm("Удалить все галереи?")) return;
  writeList("ft-gone", [...new Set([...goneGalleries(), ...cards.map((card) => card.dataset.gallery)])]);
  cards.forEach((card) => card.remove());
  if (galleriesEmpty) galleriesEmpty.hidden = false;
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
      delete brandPending["ft-logo"];
      logoCleared = false;
    } else if (Object.prototype.hasOwnProperty.call(brandPending, "ft-logo")) {
      if (brandPending["ft-logo"]) localStorage.setItem("ft-logo", brandPending["ft-logo"]);
      else localStorage.removeItem("ft-logo");
      delete brandPending["ft-logo"];
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
    localStorage.setItem("ft-user", JSON.stringify(user));
    localStorage.setItem("ft-ask-card", "1");
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
const folderOpenHref = (gid, node, client) => `${client ? "gallery.html" : "cabinet.html"}?${folderQuery(gid, node.id)}`;
const folderLinkHref = (gid, node) => `gallery.html?${folderQuery(gid, node.id)}`;
const parentFolderHref = (gid, fid, client) => {
  const found = fid ? locateFolder(gid, fid) : null;
  const parent = found ? found.ancestors[found.ancestors.length - 1] : null;
  if (!fid) return "cabinet.html";
  if (client) return parent ? `gallery.html?${folderQuery(gid, parent.id)}` : `gallery.html?${folderQuery(gid, "")}`;
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
  img.src = node.cover || GALLERY_META[gid].cover;
  img.alt = "";
  cover.appendChild(img);
  const settingsBtn = document.createElement("button");
  settingsBtn.className = "card-set";
  settingsBtn.type = "button";
  settingsBtn.dataset.openSettings = "";
  settingsBtn.setAttribute("aria-label", "Настройки");
  settingsBtn.textContent = "Настройки";
  wrap.append(cover, settingsBtn);
  const heading = document.createElement("h3");
  heading.textContent = node.name;
  const meta = document.createElement("p");
  meta.textContent = node.meta || "";
  const actions = document.createElement("div");
  actions.className = "row-actions";
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
  card.append(wrap, heading, meta, actions);
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

const mountFolderBrowser = () => {
  const file = pageFile();
  const gid = galleryId();
  const asked = folderId();
  const known = !asked || Boolean(locateFolder(gid, asked));
  const fid = known ? asked : "";
  const client = file === "gallery.html";
  const inCabinet = file === "cabinet.html";
  const inProject = file === "project.html";
  const drilled = inCabinet && Boolean(params.get("id"));
  const crumbs = document.getElementById("crumbs");
  const back = document.getElementById("folder-back");
  const board = document.getElementById("folder-cards");
  const showPath = drilled || ((client || inProject) && (fid || (FOLDER_TREE[gid] || []).length > 0) && (client || fid));

  if (showPath && crumbs) paintCrumbs(crumbs, folderCrumbs(gid, fid, client));
  if (back && (drilled || fid)) {
    back.hidden = false;
    back.href = parentFolderHref(gid, fid, client);
  }

  if (inProject) return;

  const kids = childFolders(gid, fid);
  const removedHere = Boolean(fid) && isFolderGone(gid, fid);
  const galleryGone = goneGalleries().includes(gid);
  const showCards = !galleryGone && (kids.length > 0 || removedHere) && (drilled || client);

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
  const leaf = inCabinet && drilled && Boolean(fid) && !galleryGone && !removedHere && kids.length === 0;
  if (manage) {
    manage.hidden = !leaf;
    if (leaf) fillFolderManage(gid, fid);
  }

  if (!board || !showCards) return;
  document.querySelectorAll(".js-shots").forEach((node) => { node.hidden = true; });
  board.hidden = false;
  board.replaceChildren();
  kids.forEach((node) => board.appendChild(makeFolderCard(gid, node, client)));
  let empty = document.getElementById("folders-empty");
  if (!empty && board.parentElement) {
    empty = document.createElement("p");
    empty.id = "folders-empty";
    empty.className = "hint";
    empty.hidden = true;
    board.insertAdjacentElement("afterend", empty);
  }
  if (empty) {
    empty.hidden = kids.length > 0;
    empty.textContent = removedHere || galleryGone ? "Папка удалена." : "Папок не осталось.";
  }
};

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-del-folder]");
  if (!button) return;
  const card = button.closest("[data-folder]");
  if (!card) return;
  const name = card.querySelector("h3")?.textContent || "папку";
  if (!confirm(`Удалить папку «${name}»?`)) return;
  const gid = card.dataset.gallery;
  const fid = card.dataset.folder;
  writeList("ft-gone-folders", [...new Set([...goneFolders(), `${gid}/${fid}`])]);
  card.remove();
  const board = document.getElementById("folder-cards");
  const empty = document.getElementById("folders-empty");
  if (empty && board) {
    empty.hidden = board.children.length > 0;
    empty.textContent = "Папок не осталось.";
  }
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

mountFolderBrowser();

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

const ftPlans = {
  trial: { name: "Пробный период", days: 7 },
  start: { name: "Старт", days: 30 },
  profi: { name: "Профи", days: 30 },
  studio: { name: "Студия", days: 30 }
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
  if (mode === "active") {
    ratio = trial.ratio;
    lines = [plan.name, `до ${ftRuDate(trial.end)}`, ftLeftPhrase(trial.left)];
  } else if (mode === "upcoming") {
    const span = `${plan.days} ${ftDaysWord(plan.days)}`;
    lines = [plan.name, `с ${host.dataset.start || ftRuDate(trial.end)}`, span];
  } else {
    lines = [plan.name === "Пробный период" ? "Пробный" : plan.name, `${plan.days} ${ftDaysWord(plan.days)}`];
  }
  host.innerHTML = `<div class="gauge">${ftSpeedometer(ratio)}<p class="gauge-name">${lines[0]}</p>${lines.slice(1).map((line) => `<p class="gauge-meta">${line}</p>`).join("")}</div>`;
};
document.querySelectorAll("[data-gauge]").forEach(ftPaintGauge);
const billingLead = document.getElementById("billing-lead");
if (billingLead) {
  const trial = ftTrialLeft();
  const phrase = ftLeftPhrase(trial.left);
  const head = phrase.charAt(0).toUpperCase() + phrase.slice(1);
  billingLead.textContent = `${head}, до ${ftRuDate(trial.end)}. Занято 6,4 из 20 ГБ. Пакет ещё действует: новый можно оплатить сейчас, он начнётся 21 октября 2026, когда текущий закончится.`;
}
