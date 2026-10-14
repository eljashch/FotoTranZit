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
const galleryId = () => {
  const id = new URLSearchParams(location.search).get("id");
  return GALLERY_DEFAULTS[id] ? id : "wedding";
};
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
const goneGalleries = () => readList("ft-gone");
const unlocked = () => sessionStorage.getItem(`ft-unlock-${galleryId()}`) === "1";
const belongs = (node) => (node.dataset.in || "wedding").split(/\s+/).includes(galleryId());

const paintFiles = () => {
  const state = settings();
  document.querySelectorAll("[data-file]").forEach((node) => {
    if (!belongs(node) || state.deleted.includes(node.dataset.file)) {
      node.hidden = true;
      return;
    }
    const secret = state.hidden.includes(node.dataset.file);
    node.classList.toggle("is-hidden", secret);
    const hideBtn = node.querySelector("[data-hide]");
    if (hideBtn) hideBtn.textContent = secret ? "Скрыт" : "Скрыть";
    node.hidden = Boolean(node.dataset.kind) && secret && !unlocked();
    if (node.dataset.kind === "file" && !state.open) node.hidden = true;
  });
  const rows = [...document.querySelectorAll("#file-list .file-row")].filter((row) => !row.hidden);
  const emptyFiles = document.getElementById("files-empty");
  if (emptyFiles) emptyFiles.hidden = rows.length > 0;
  const shots = [...document.querySelectorAll(".g-grid [data-file]")].filter((shot) => !shot.hidden);
  const emptyGallery = document.getElementById("gallery-empty");
  if (emptyGallery) emptyGallery.hidden = shots.length > 0;
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
    const state = settings();
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
document.querySelectorAll("[data-download]").forEach((button) => {
  button.addEventListener("click", async (event) => {
    event.stopPropagation();
    const kind = button.dataset.download;
    if (kind === "review") {
      openOverlay("review-modal");
      return;
    }
    guardPause = true;
    setTimeout(() => { guardPause = false; }, 2000);
    const img = document.querySelector("#photo-view img");
    const src = img?.getAttribute("src") || "img/cover.jpg";
    const name = (img?.src || "photo.jpg").split("/").pop().split("?")[0];
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
    const old = button.textContent;
    button.textContent = "Скачивается";
    setTimeout(() => { button.textContent = old; }, 1200);
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

const applyBrand = () => {
  const photo = localStorage.getItem("ft-photo");
  const logo = localStorage.getItem("ft-logo");
  if (photo) document.querySelectorAll("[data-use='photo']").forEach((img) => { img.src = photo; });
  if (logo) document.querySelectorAll("[data-use='logo']").forEach((img) => { img.src = logo; });
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
      try { localStorage.setItem(key, canvas.toDataURL("image/jpeg", 0.86)); } catch (error) {}
      applyBrand();
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
    storeImage(file, logo ? "ft-logo" : "ft-photo", logo ? 640 : 900);
  });
});
applyBrand();

const meta = GALLERY_META[galleryId()];
document.querySelectorAll("[data-gallery-title]").forEach((node) => { node.textContent = meta.title; });
document.querySelectorAll("[data-gallery-date]").forEach((node) => { node.textContent = meta.date; });
document.querySelectorAll("[data-gallery-cover]").forEach((img) => { img.src = meta.cover; });
if (title && !params.get("name")) title.textContent = meta.title;

document.querySelectorAll("a[href]").forEach((link) => {
  const href = link.getAttribute("href");
  if (!href || href.startsWith("#") || href.includes("://")) return;
  const file = href.split("?")[0].split("/").pop();
  if (!["project.html", "gallery.html", "access.html", "design.html", "download.html", "reviews.html"].includes(file)) return;
  if (new URL(href, location.href).searchParams.get("id")) return;
  link.setAttribute("href", `${file}?id=${galleryId()}`);
});

const secretSet = document.getElementById("secret-set");
if (secretSet) secretSet.value = settings().secret;
secretSet?.addEventListener("input", () => saveSettings({ secret: secretSet.value.trim() }));

document.querySelectorAll("[data-opt]").forEach((field) => {
  const key = field.dataset.opt;
  const value = settings()[key];
  if (field.type === "checkbox") field.checked = Boolean(value);
  else if (value != null) field.value = value;
  field.addEventListener("change", () => {
    saveSettings({ [key]: field.type === "checkbox" ? field.checked : field.value });
  });
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
  const saved = settings().secret.trim();
  if (!saved) {
    note.textContent = "Для этой галереи код не задан.";
    return;
  }
  if (code !== saved) {
    note.textContent = "Код не подошёл к этой галерее.";
    return;
  }
  sessionStorage.setItem(`ft-unlock-${galleryId()}`, "1");
  note.textContent = "Скрытые кадры этой галереи открыты.";
  paintFiles();
});

document.querySelectorAll("[data-hide]").forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.closest("[data-file]").dataset.file;
    const list = settings().hidden;
    const next = list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
    saveSettings({ hidden: next });
    paintFiles();
  });
});

document.querySelectorAll("[data-del-file]").forEach((button) => {
  button.addEventListener("click", () => {
    const row = button.closest("[data-file]");
    if (!belongs(row)) return;
    const name = row.querySelector("span")?.textContent || "файл";
    if (!confirm(`Удалить «${name}» только из этой галереи?`)) return;
    saveSettings({ deleted: [...settings().deleted, row.dataset.file] });
    paintFiles();
  });
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
const fillCardSettings = (id) => {
  settingsCard = id;
  const state = settings(id);
  document.getElementById("card-settings-title").textContent = GALLERY_META[id].title;
  document.getElementById("card-secret").value = state.secret;
  document.querySelectorAll("[data-card-opt]").forEach((field) => {
    field.checked = Boolean(state[field.dataset.cardOpt]);
  });
  document.getElementById("card-files").href = `project.html?id=${id}`;
};
document.querySelectorAll("[data-open-settings]").forEach((button) => {
  button.addEventListener("click", () => {
    fillCardSettings(button.closest("[data-gallery]").dataset.gallery);
    openOverlay("card-settings");
  });
});
document.querySelector("#card-settings form")?.addEventListener("submit", (event) => event.preventDefault());
document.getElementById("card-secret")?.addEventListener("input", (event) => {
  saveSettings({ secret: event.target.value.trim() }, settingsCard);
});
document.querySelectorAll("[data-card-opt]").forEach((field) => {
  field.addEventListener("change", () => {
    saveSettings({ [field.dataset.cardOpt]: field.checked }, settingsCard);
  });
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
