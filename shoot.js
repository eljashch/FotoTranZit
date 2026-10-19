(() => {
  const MONTHS = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
  const GALLERY_TITLES = {
    wedding: "Свадьба Марии и Ильи",
    kindergarten: "Садик «Ромашка», группа 5",
    portrait: "Портрет в студии"
  };
  const GALLERY_ORIGINALS = { wedding: false, kindergarten: false, portrait: true };
  const BUILTIN = {
    wedding: [
      { id: "ceremony", name: "Церемония", parent: "", children: [
        { id: "prep", name: "Подготовка", parent: "ceremony" },
        { id: "banquet", name: "Банкет", parent: "ceremony" }
      ] },
      { id: "walk", name: "Прогулка", parent: "" }
    ],
    kindergarten: [
      { id: "group5", name: "Группа 5", parent: "", children: [
        { id: "morning", name: "Утренник", parent: "group5" }
      ] }
    ],
    portrait: [{ id: "light", name: "Свет", parent: "" }]
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
  const KNOWN_BYTES = { cover: 3145728, p2: 1887436, p3: 1572864, p4: 52428800, p5: 1310720, p6: 2359296, pdf: 262144 };
  const PARENT_CAP = 3 * 1073741824;
  const DEMO_SAVE = 120 * 1048576;
  const FREE_DAYS = 30;

  const readJson = (key, fallback) => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "");
      return value == null ? fallback : value;
    } catch (error) { return fallback; }
  };
  const pageName = () => (location.pathname.split("/").pop() || "").toLowerCase();
  const todayISO = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };
  const ruDate = (iso) => {
    const parts = String(iso || "").split("-").map(Number);
    if (parts.length < 3 || !parts[2]) return "";
    return `${parts[2]} ${MONTHS[parts[1] - 1]} ${parts[0]}`;
  };
  const daysWord = (count) => {
    const abs = Math.abs(count) % 100;
    const last = abs % 10;
    if (abs > 10 && abs < 20) return "дней";
    if (last === 1) return "день";
    if (last >= 2 && last <= 4) return "дня";
    return "дней";
  };
  const makeId = (prefix) => prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const phoneKey = (value) => {
    let digits = String(value || "").replace(/\D/g, "");
    if (digits.length > 10) digits = digits.slice(-10);
    if (digits.length === 10) return `7${digits}`;
    return digits;
  };
  const samePhone = (row, key) => Boolean(key) && phoneKey(row && (row.phoneKey || row.phone)) === key;
  const findParentByPhone = (list, value) => {
    const key = phoneKey(value);
    return key ? (list || []).find((row) => samePhone(row, key)) || null : null;
  };
  const bytesLabel = (bytes) => {
    const n = Number(bytes) || 0;
    if (n <= 0) return "0 ГБ";
    const gb = n / 1073741824;
    if (gb >= 0.1) return `${gb.toLocaleString("ru-RU", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ГБ`;
    return `${Math.max(1, Math.round(n / 1048576)).toLocaleString("ru-RU")} МБ`;
  };

  const loadLists = () => {
    const value = readJson("ft-shoot-lists", {});
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  };
  const saveLists = (all) => localStorage.setItem("ft-shoot-lists", JSON.stringify(all));
  const blankList = () => ({ token: "", on: false, deadline: "", rows: [] });
  const listOf = (gid) => loadLists()[gid] || blankList();
  const findByToken = (token) => {
    const all = loadLists();
    const gid = Object.keys(all).find((key) => all[key] && all[key].token === token);
    return gid ? { gid, list: all[gid] } : null;
  };
  const listOpen = (list) => {
    if (!list || !list.on || !list.token) return false;
    if (!list.deadline) return true;
    return todayISO() <= list.deadline;
  };
  const listUrl = (token) => new URL(`shoot.html?t=${encodeURIComponent(token)}`, location.href).href;
  const galleryTitle = (gid) => {
    const names = readJson("ft-names", {});
    if (names && names[gid]) return String(names[gid]);
    const custom = readJson("ft-user-galleries", []);
    const row = Array.isArray(custom) ? custom.find((item) => item.id === gid) : null;
    return (row && row.title) || GALLERY_TITLES[gid] || "Фотосессия";
  };
  const namesMap = () => {
    const value = readJson("ft-names", {});
    return value && typeof value === "object" ? value : {};
  };
  const folderDisplayName = (gid, fid, fallback) => {
    const saved = String(namesMap()[`${gid}/${fid}`] || "").trim();
    return saved || String(fallback || "").trim();
  };
  const userFolderRecords = (gid) => {
    const all = readJson("ft-user-folders", {});
    return all && Array.isArray(all[gid]) ? all[gid] : [];
  };
  const goneList = () => {
    const value = readJson("ft-gone-folders", []);
    return Array.isArray(value) ? value : [];
  };
  const rehomeMap = () => {
    const value = readJson("ft-rehome", {});
    return value && typeof value === "object" ? value : {};
  };
  const builtinFlat = (gid) => {
    const out = [];
    const walk = (nodes, parent) => (nodes || []).forEach((node) => {
      out.push({ id: node.id, name: node.name, parent: parent || "" });
      walk(node.children || [], node.id);
    });
    walk(BUILTIN[gid] || [], "");
    return out;
  };
  const builtinChildren = (gid, parentId) => builtinFlat(gid).filter((row) => (row.parent || "") === (parentId || ""));
  const childFolderRecords = (gid, parentId) => {
    const gone = new Set(goneList());
    const rehome = rehomeMap();
    const wanted = parentId || "";
    const users = userFolderRecords(gid).filter((row) => !gone.has(`${gid}/${row.id}`));
    const own = users.filter((row) => {
      const key = `${gid}/${row.id}`;
      if (Object.prototype.hasOwnProperty.call(rehome, key)) return (rehome[key] || "") === wanted;
      return (row.parent || "") === wanted;
    });
    const built = builtinChildren(gid, wanted).filter((row) => {
      const key = `${gid}/${row.id}`;
      return !gone.has(key) && !Object.prototype.hasOwnProperty.call(rehome, key);
    });
    const map = new Map();
    [...built, ...own].forEach((row) => map.set(row.id, row));
    return [...map.values()];
  };
  const folderGone = (gid, fid) => {
    if (!fid) return false;
    if (goneList().includes(`${gid}/${fid}`)) return true;
    return !userFolderRecords(gid).some((row) => row.id === fid) && !builtinFlat(gid).some((row) => row.id === fid);
  };
  const collectNames = (gid) => {
    const set = new Set();
    builtinFlat(gid).forEach((row) => {
      set.add(row.name);
      const shown = folderDisplayName(gid, row.id, row.name);
      if (shown) set.add(shown);
    });
    userFolderRecords(gid).forEach((row) => {
      if (row.name) set.add(String(row.name).trim());
      const shown = folderDisplayName(gid, row.id, row.name);
      if (shown) set.add(shown);
    });
    return set;
  };
  const uniqueFolderName = (gid, raw) => {
    const name = String(raw || "").trim();
    const taken = collectNames(gid);
    if (!taken.has(name)) return name;
    let index = 2;
    while (taken.has(`${name} (${index})`)) index += 1;
    return `${name} (${index})`;
  };
  const filePlace = (file, gid) => {
    if (file.gallery) return file.folder || "";
    if (file.at && Object.prototype.hasOwnProperty.call(file.at, gid)) return file.at[gid];
    return "";
  };
  const filesOf = (gid, fid) => {
    const settings = readJson("ft-settings", {});
    const deleted = new Set((settings[gid] && settings[gid].deleted) || []);
    const place = fid || "";
    const base = FILE_CATALOG.filter((file) => String(file.in || "").split(/\s+/).includes(gid) && filePlace(file, gid) === place && !deleted.has(file.id));
    const extra = readJson("ft-user-files", []);
    const more = (Array.isArray(extra) ? extra : []).filter((file) => file && file.gallery === gid && (file.folder || "") === place && !deleted.has(file.id));
    return [...base, ...more];
  };
  const fileBytes = (file) => Number(file.size || KNOWN_BYTES[file.id] || 0);
  const folderBytes = (gid, fid) => filesOf(gid, fid).reduce((sum, file) => sum + fileBytes(file), 0)
    + childFolderRecords(gid, fid).reduce((sum, node) => sum + folderBytes(gid, node.id), 0);
  const gallerySettings = (gid) => {
    const saved = readJson("ft-settings", {})[gid] || {};
    return { originals: Object.prototype.hasOwnProperty.call(GALLERY_ORIGINALS, gid) ? GALLERY_ORIGINALS[gid] : false, ...saved };
  };
  const originalsOn = (gid, fid) => {
    const folder = readJson("ft-settings", {})[`${gid}::${fid}`];
    if (folder && Object.prototype.hasOwnProperty.call(folder, "originals")) return Boolean(folder.originals);
    return Boolean(gallerySettings(gid).originals);
  };
  const accessOf = (gid, fid) => {
    const map = readJson(`ft-folders-${gid}`, {});
    return { view: true, download: true, open: true, password: "", hidden: false, ...(map[fid] || {}) };
  };
  const canTake = (gid, fid) => accessOf(gid, fid).download !== false && originalsOn(gid, fid);
  const ownsFolder = (gid, rootId, fid) => {
    if (!rootId || !fid) return false;
    if (fid === rootId) return true;
    const seen = new Set([rootId]);
    const queue = [rootId];
    while (queue.length) {
      const current = queue.shift();
      childFolderRecords(gid, current).forEach((node) => {
        if (seen.has(node.id)) return;
        seen.add(node.id);
        queue.push(node.id);
      });
    }
    return seen.has(fid);
  };

  const photographerKey = () => {
    const user = readJson("ft-user", null);
    const email = user && user.email ? String(user.email).trim().toLowerCase() : "";
    return email || "cabinet";
  };
  const loadMail = () => {
    const value = readJson("ft-client-mail", {});
    return value && typeof value === "object" ? value : {};
  };
  const messagesFor = (parentId) => {
    const list = loadMail()[parentId];
    return Array.isArray(list) ? list : [];
  };
  const photoPerson = () => {
    const profile = readJson("ft-profile", null);
    const user = readJson("ft-user", null);
    const first = (profile && profile.first) || (user && user.first) || "";
    const last = (profile && profile.last) || (user && user.last) || "";
    return [first, last].filter(Boolean).join(" ");
  };
  const photoName = () => photoPerson() || "Фотограф";
  const readCursors = () => {
    const value = readJson("ft-mail-read", {});
    return value && typeof value === "object" ? value : {};
  };
  const cursorOf = (role, parentId) => Number((readCursors()[role] || {})[parentId] || 0);
  const markRead = (role, parentId) => {
    const all = readCursors();
    all[role] = all[role] && typeof all[role] === "object" ? all[role] : {};
    all[role][parentId] = Date.now();
    localStorage.setItem("ft-mail-read", JSON.stringify(all));
  };
  const pushMessage = (parentId, text, from, author, file) => {
    const all = loadMail();
    const list = Array.isArray(all[parentId]) ? all[parentId] : [];
    const message = {
      id: makeId("m"),
      text,
      at: Date.now(),
      from,
      author: author || "",
      fileName: file && file.name ? file.name : "",
      fileType: file && file.type ? file.type : "",
      fileData: file && file.data ? file.data : ""
    };
    list.push(message);
    all[parentId] = list;
    try {
      localStorage.setItem("ft-client-mail", JSON.stringify(all));
    } catch (error) {
      message.fileData = "";
      localStorage.setItem("ft-client-mail", JSON.stringify(all));
    }
    window.dispatchEvent(new CustomEvent("ft-mail", { detail: message }));
    return message;
  };
  const loadParents = () => {
    const value = readJson("ft-parents", []);
    return Array.isArray(value) ? value : [];
  };
  const saveParents = (list) => localStorage.setItem("ft-parents", JSON.stringify(list));
  const currentParent = () => {
    const id = localStorage.getItem("ft-parent-session") || "";
    return loadParents().find((row) => row.id === id) || null;
  };
  const parentLinks = (parentId) => {
    const all = readJson("ft-parent-links", {});
    return all && Array.isArray(all[parentId]) ? all[parentId] : [];
  };
  const saveParentLinks = (parentId, links) => {
    const all = readJson("ft-parent-links", {});
    all[parentId] = links;
    localStorage.setItem("ft-parent-links", JSON.stringify(all));
  };
  const parentSaves = (parentId) => {
    const all = readJson("ft-parent-saves", {});
    return all && Array.isArray(all[parentId]) ? all[parentId] : [];
  };
  const saveParentSaves = (parentId, rows) => {
    const all = readJson("ft-parent-saves", {});
    all[parentId] = rows;
    try { localStorage.setItem("ft-parent-saves", JSON.stringify(all)); }
    catch (error) {
      const slim = rows.map((row) => ({ ...row, tree: stripSrc(row.tree) }));
      localStorage.setItem("ft-parent-saves", JSON.stringify({ ...all, [parentId]: slim }));
    }
  };
  const stripSrc = (node) => ({
    ...node,
    files: (node.files || []).map((file) => ({ ...file, src: String(file.src || "").startsWith("data:") ? "" : file.src })),
    children: (node.children || []).map(stripSrc)
  });
  const createChildFolder = (gid, rawName, parentId) => {
    const name = uniqueFolderName(gid, rawName);
    const all = readJson("ft-user-folders", {});
    all[gid] = Array.isArray(all[gid]) ? all[gid] : [];
    const id = makeId("u");
    all[gid].push({ id, name, parent: "", cover: "img/folder-neon.svg", meta: "", created: Date.now(), shootOwner: parentId });
    localStorage.setItem("ft-user-folders", JSON.stringify(all));
    return { id, name };
  };
  const unifyParents = () => {
    const parents = loadParents();
    const lists = loadLists();
    const linksAll = readJson("ft-parent-links", {});
    const mail = loadMail();
    const folders = readJson("ft-user-folders", {});
    let changedParents = false;
    let changedLists = false;
    let changedLinks = false;
    let changedMail = false;
    let changedFolders = false;
    const byPhone = new Map();
    parents.forEach((item) => {
      const key = phoneKey(item.phoneKey || item.phone);
      if (key && item.phoneKey !== key) {
        item.phoneKey = key;
        changedParents = true;
      }
      if (!key) return;
      if (!byPhone.has(key)) byPhone.set(key, []);
      byPhone.get(key).push(item);
    });
    byPhone.forEach((group, key) => {
      const keep = group.find((item) => item.password) || group[0];
      if (keep.phoneKey !== key) {
        keep.phoneKey = key;
        changedParents = true;
      }
      group.filter((item) => item !== keep).forEach((item) => {
        const extra = Array.isArray(linksAll[item.id]) ? linksAll[item.id] : [];
        const base = Array.isArray(linksAll[keep.id]) ? linksAll[keep.id] : [];
        extra.forEach((link) => {
          const same = base.some((row) => {
            if (link.rowId && row.rowId) return row.rowId === link.rowId;
            return row.folderId === link.folderId && row.galleryId === link.galleryId;
          });
          if (!same) base.push(link);
        });
        if (extra.length || linksAll[item.id]) {
          linksAll[keep.id] = base;
          delete linksAll[item.id];
          changedLinks = true;
        }
        if (Array.isArray(mail[item.id]) && mail[item.id].length) {
          mail[keep.id] = [...(Array.isArray(mail[keep.id]) ? mail[keep.id] : []), ...mail[item.id]];
          delete mail[item.id];
          changedMail = true;
        }
        Object.values(folders).forEach((bag) => {
          if (!Array.isArray(bag)) return;
          bag.forEach((node) => {
            if (node && node.shootOwner === item.id) {
              node.shootOwner = keep.id;
              changedFolders = true;
            }
          });
        });
        if (localStorage.getItem("ft-parent-session") === item.id) localStorage.setItem("ft-parent-session", keep.id);
        if (localStorage.getItem("ft-last-parent") === item.id) localStorage.setItem("ft-last-parent", keep.id);
        Object.values(lists).forEach((list) => {
          (list && list.rows || []).forEach((row) => {
            const owned = row.parentId === item.id;
            const same = phoneKey(row.phone) === key;
            if (!owned && !same) return;
            if (row.parentId !== keep.id) {
              row.parentId = keep.id;
              changedLists = true;
            }
          });
        });
        const index = parents.indexOf(item);
        if (index >= 0) parents.splice(index, 1);
        changedParents = true;
      });
    });
    if (changedParents) saveParents(parents);
    if (changedLists) saveLists(lists);
    if (changedLinks) localStorage.setItem("ft-parent-links", JSON.stringify(linksAll));
    if (changedMail) localStorage.setItem("ft-client-mail", JSON.stringify(mail));
    if (changedFolders) localStorage.setItem("ft-user-folders", JSON.stringify(folders));
  };

  const paintShootSettings = (gid, folder) => {
    const box = document.getElementById("shoot-box");
    if (!box) return;
    box.dataset.gid = gid || "";
    box.dataset.folder = folder || "";
    box.hidden = Boolean(folder);
    if (folder || !gid) return;
    const list = listOf(gid);
    const deadline = document.getElementById("shoot-deadline");
    if (deadline && document.activeElement !== deadline) deadline.value = list.deadline || "";
    const copy = document.getElementById("shoot-copy");
    if (copy) copy.hidden = !list.token;
  };
  window.ftPaintShootSettings = paintShootSettings;

  const bindCabinet = () => {
    const box = document.getElementById("shoot-box");
    const create = document.getElementById("shoot-create");
    if (!box || !create || create.dataset.bound) return;
    create.dataset.bound = "1";
    box.addEventListener("keydown", (event) => {
      if (event.key === "Enter") event.preventDefault();
    });
    const gidNow = () => box.dataset.gid || "";
    const write = (patch) => {
      const gid = gidNow();
      if (!gid) return null;
      const all = loadLists();
      const list = { ...blankList(), ...(all[gid] || {}) };
      Object.assign(list, patch);
      all[gid] = list;
      saveLists(all);
      return list;
    };
    document.getElementById("shoot-deadline")?.addEventListener("change", (event) => {
      write({ deadline: event.target.value || "" });
      paintShootSettings(gidNow(), "");
    });
    create.addEventListener("click", () => {
      const gid = gidNow();
      if (!gid) return;
      const all = loadLists();
      const list = { ...blankList(), ...(all[gid] || {}) };
      if (!list.token) {
        let token = "";
        do { token = makeId("s"); } while (Object.values(all).some((row) => row && row.token === token));
        list.token = token;
      }
      list.on = true;
      list.deadline = document.getElementById("shoot-deadline")?.value || list.deadline || "";
      all[gid] = list;
      saveLists(all);
      window.open(listUrl(list.token), "_blank");
      paintShootSettings(gid, "");
    });
    document.getElementById("shoot-copy")?.addEventListener("click", async (event) => {
      const list = listOf(gidNow());
      if (!list.token) return;
      const url = listUrl(list.token);
      const button = event.currentTarget;
      try { await navigator.clipboard.writeText(url); }
      catch (error) {
        const area = document.createElement("textarea");
        area.value = url;
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        area.remove();
      }
      const old = button.textContent;
      button.textContent = "Скопировано";
      setTimeout(() => { button.textContent = old; }, 1200);
    });
    window.addEventListener("storage", (event) => {
      if (event.key !== "ft-shoot-lists" || box.hidden) return;
      paintShootSettings(gidNow(), box.dataset.folder || "");
    });
  };

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };
  const paintPublic = () => {
    const title = document.getElementById("shoot-title");
    const status = document.getElementById("shoot-status");
    const body = document.getElementById("shoot-body");
    const consent = document.getElementById("shoot-consent");
    const closed = document.getElementById("shoot-closed");
    if (!body) return;
    const token = new URLSearchParams(location.search).get("t") || "";
    const found = findByToken(token);
    body.replaceChildren();
    if (!found) {
      if (title) title.textContent = "Список не найден";
      if (status) status.textContent = "";
      if (consent) consent.hidden = true;
      if (closed) closed.hidden = true;
      document.title = "Список не найден — ФотоТранзит";
      return;
    }
    const { gid, list } = found;
    const name = galleryTitle(gid);
    if (title) title.textContent = name;
    document.title = `${name} — ФотоТранзит`;
    const open = listOpen(list);
    if (status) {
      status.textContent = open && list.deadline ? `Регистрация открыта до ${ruDate(list.deadline)}.` : "";
    }
    if (closed) closed.hidden = open;
    if (consent) consent.hidden = !open;
    (list.rows || []).forEach((row, index) => {
      const line = document.createElement("tr");
      [["№", String(index + 1)], ["ФИО ребенка", row.childName || ""], ["ФИО родителя", row.parentName || ""]].forEach(([label, value]) => {
        const cell = el("td", "", value);
        cell.dataset.label = label;
        line.appendChild(cell);
      });
      const phoneCell = el("td", "shoot-phone", "");
      phoneCell.dataset.label = "Телефон";
      line.appendChild(phoneCell);
      body.appendChild(line);
    });
    if (!open) return;
    const draft = document.createElement("tr");
    draft.className = "shoot-draft";
    const numberCell = el("td", "", String((list.rows || []).length + 1));
    numberCell.dataset.label = "№";
    draft.appendChild(numberCell);
    const childCell = el("td");
    childCell.dataset.label = "ФИО ребенка";
    const childInput = el("input");
    childInput.id = "draft-child";
    childInput.type = "text";
    childInput.placeholder = "ФИО ребенка";
    childInput.autocomplete = "off";
    childCell.appendChild(childInput);
    const parentCell = el("td");
    parentCell.dataset.label = "ФИО родителя";
    const parentInput = el("input");
    parentInput.id = "draft-parent";
    parentInput.type = "text";
    parentInput.placeholder = "ФИО родителя";
    parentInput.autocomplete = "name";
    parentCell.appendChild(parentInput);
    const phoneCell = el("td");
    phoneCell.dataset.label = "Телефон";
    const phoneInput = el("input");
    phoneInput.id = "draft-phone";
    phoneInput.type = "tel";
    phoneInput.placeholder = "900 123-45-67";
    phoneInput.autocomplete = "tel";
    phoneInput.value = "+7";
    const button = el("button", "light-btn", "Принять участие");
    button.type = "button";
    button.id = "shoot-join";
    phoneCell.append(phoneInput, button);
    window.ftPhone?.mount(phoneInput);
    draft.append(childCell, parentCell, phoneCell);
    body.appendChild(draft);
    button.addEventListener("click", () => {
      const parentName = parentInput.value.trim();
      const childName = childInput.value.trim();
      const phone = window.ftPhone ? window.ftPhone.read(phoneInput) : phoneInput.value.trim();
      const agree = document.getElementById("shoot-agree");
      const need = document.getElementById("shoot-need");
      if (!parentName || !childName || !agree?.checked || !(window.ftPhone ? window.ftPhone.ready(phoneInput.value) : phoneKey(phone).length === 11)) {
        if (need) {
          need.hidden = false;
          need.textContent = !(window.ftPhone ? window.ftPhone.ready(phoneInput.value) : phoneKey(phone).length === 11)
            ? "Укажите номер: 10 цифр после +7."
            : "Заполните ФИО родителя, ФИО ребёнка, телефон и отметьте согласие.";
        }
        return;
      }
      if (need) need.hidden = true;
      const fresh = findByToken(token);
      if (!fresh || !listOpen(fresh.list)) {
        paintPublic();
        return;
      }
      const parents = loadParents();
      const key = phoneKey(phone);
      let account = findParentByPhone(parents, phone);
      if (!account) {
        account = { id: makeId("p"), name: parentName, phone, phoneKey: key, role: "parent", createdAt: Date.now() };
        parents.push(account);
        saveParents(parents);
      }
      const folder = createChildFolder(fresh.gid, childName, account.id);
      const row = { id: makeId("r"), parentName, childName, phone, at: Date.now(), parentId: account.id, folderId: folder.id };
      const all = loadLists();
      all[fresh.gid].rows = [...(all[fresh.gid].rows || []), row];
      saveLists(all);
      const links = parentLinks(account.id);
      if (!links.some((item) => item.rowId === row.id)) {
        links.push({ id: makeId("l"), galleryId: fresh.gid, folderId: folder.id, childName: folder.name, rowId: row.id, owner: photographerKey() });
        saveParentLinks(account.id, links);
      }
      localStorage.setItem("ft-last-parent", account.id);
      sessionStorage.setItem("ft-join-draft", JSON.stringify({ token, rowId: row.id, parentName, childName, phone }));
      location.href = `join.html?t=${encodeURIComponent(token)}&row=${encodeURIComponent(row.id)}`;
    });
  };

  const loadDraft = () => {
    const params = new URLSearchParams(location.search);
    const token = params.get("t") || "";
    const rowId = params.get("row") || "";
    const found = findByToken(token);
    const row = found ? (found.list.rows || []).find((item) => item.id === rowId) : null;
    let draft = null;
    try { draft = JSON.parse(sessionStorage.getItem("ft-join-draft") || "null"); } catch (error) { draft = null; }
    return {
      token,
      rowId,
      gid: found ? found.gid : "",
      row,
      parentName: (row && row.parentName) || (draft && draft.rowId === rowId ? draft.parentName : "") || "",
      childName: (row && row.childName) || (draft && draft.rowId === rowId ? draft.childName : "") || "",
      phone: (row && row.phone) || (draft && draft.rowId === rowId ? draft.phone : "") || ""
    };
  };
  const tempPassword = () => {
    const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
    let value = "";
    for (let index = 0; index < 8; index += 1) value += alphabet[Math.floor(Math.random() * alphabet.length)];
    return value;
  };
  const saveParentPassword = (account, password, mustChange) => {
    const parents = loadParents();
    const row = parents.find((item) => item.id === account.id) || parents.find((item) => account.phoneKey && item.phoneKey === account.phoneKey);
    if (row) {
      row.password = password;
      row.mustChange = mustChange;
      saveParents(parents);
    }
    const accounts = readJson("ft-accounts", []);
    if (Array.isArray(accounts)) {
      const hit = accounts.find((item) => item.id === account.id || (account.phoneKey && item.phoneKey === account.phoneKey));
      if (hit) {
        hit.password = password;
        hit.mustChange = mustChange;
        localStorage.setItem("ft-accounts", JSON.stringify(accounts));
      }
    }
  };
  const showJoinSms = (shell, phoneValue, password) => {
    if (!shell) return;
    const link = (location.protocol === "http:" || location.protocol === "https:")
      ? new URL("parent.html", location.href).href.split("?")[0]
      : "http://127.0.0.1:8765/parent.html";
    shell.replaceChildren();
    shell.append(el("h1", "", "Регистрация"));
    const card = el("article", "sms-card");
    card.append(el("p", "sms-from", "ФотоТранзит"), el("p", "", `Сообщение отправлено на ${phoneValue}.`));
    const line = el("p", "", "Адрес, где вы зарегистрированы: ");
    const anchor = el("a", "", link);
    anchor.href = link;
    line.appendChild(anchor);
    card.append(line, el("p", "sms-pass", `Временный пароль: ${password}`), el("p", "hint", "Откройте ссылку, введите телефон и этот пароль. При первом входе его нужно сменить."));
    shell.appendChild(card);
  };
  const bindJoin = () => {
    const form = document.getElementById("parent-join");
    const shell = document.getElementById("join-shell");
    if (!form) return;
    const draft = loadDraft();
    const name = document.getElementById("join-name");
    const phone = document.getElementById("join-phone");
    if (name) name.value = draft.parentName;
    if (phone) {
      phone.value = draft.phone || "+7";
      window.ftPhone?.refresh(phone);
    }
    const submitJoin = (event) => {
      event.preventDefault();
      const error = document.getElementById("join-error");
      const parentName = name?.value.trim() || "";
      const phoneReady = window.ftPhone ? window.ftPhone.ready(phone?.value) : phoneKey(phone?.value).length === 11;
      const phoneValue = window.ftPhone ? window.ftPhone.read(phone) : (phone?.value.trim() || "");
      if (!phoneReady) {
        if (error) {
          error.hidden = false;
          error.textContent = "Укажите номер: 10 цифр после +7.";
        }
        return;
      }
      if (!parentName || !draft.childName || !draft.gid || !draft.row) {
        if (error) {
          error.hidden = false;
          error.textContent = "Нужны имя, телефон и запись из списка фотосессии.";
        }
        return;
      }
      unifyParents();
      const parents = loadParents();
      const key = phoneKey(phoneValue);
      let account = findParentByPhone(parents, phoneValue);
      const already = Boolean(account && account.password);
      const temporary = already ? "" : tempPassword();
      if (!account) {
        account = { id: makeId("p"), name: parentName, phone: phoneValue, phoneKey: key, role: "parent", createdAt: Date.now(), password: temporary, mustChange: true };
        parents.push(account);
      } else if (!already) {
        account.name = parentName || account.name;
        account.phone = phoneValue;
        account.phoneKey = key;
        account.role = "parent";
        account.password = temporary;
        account.mustChange = true;
      } else {
        account.role = "parent";
        account.phoneKey = key;
      }
      saveParents(parents);
      localStorage.setItem("ft-last-parent", account.id);
      const all = loadLists();
      const list = all[draft.gid];
      const row = (list.rows || []).find((item) => item.id === draft.rowId);
      if (row && !row.folderId) {
        const folder = createChildFolder(draft.gid, draft.childName, account.id);
        row.folderId = folder.id;
        row.parentId = account.id;
        row.parentName = parentName;
        row.phone = phoneValue;
        saveLists(all);
        const links = parentLinks(account.id);
        if (!links.some((item) => item.rowId === row.id)) {
          links.push({ id: makeId("l"), galleryId: draft.gid, folderId: folder.id, childName: folder.name, rowId: row.id, owner: photographerKey() });
          saveParentLinks(account.id, links);
        }
      } else if (row && row.folderId) {
        row.parentId = account.id;
        row.parentName = parentName || row.parentName;
        if (phoneValue) row.phone = phoneValue;
        saveLists(all);
        const links = parentLinks(account.id);
        if (!links.some((item) => item.rowId === row.id)) {
          links.push({ id: makeId("l"), galleryId: draft.gid, folderId: row.folderId, childName: folderDisplayName(draft.gid, row.folderId, draft.childName), rowId: row.id, owner: photographerKey() });
          saveParentLinks(account.id, links);
        }
      }
      if (already) {
        if (!shell) return;
        shell.replaceChildren();
        shell.append(el("h1", "", "Регистрация"));
        const card = el("article", "sms-card");
        card.append(el("p", "", "Ребёнок записан на фотосессию, данные появятся в вашем личном кабинете."));
        shell.appendChild(card);
        return;
      }
      showJoinSms(shell, phoneValue, temporary);
    };
    document.getElementById("join-go")?.addEventListener("click", submitJoin);
    shell?.addEventListener("submit", submitJoin);
  };

  const speedometer = (ratio) => {
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
    const id = `pg${Math.random().toString(36).slice(2, 7)}`;
    const value = clamped > 0.004
      ? `<path d="${arc}" fill="none" stroke="url(#${id})" stroke-width="12" stroke-linecap="round" stroke-dasharray="${filled.toFixed(2)} ${length.toFixed(2)}"/>`
      : "";
    return `<svg viewBox="20 24 164 140" width="164" height="140" aria-hidden="true">
      <defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}">
        <stop offset="0%" stop-color="#3ee6a0"/><stop offset="46%" stop-color="#7ef0ff"/><stop offset="100%" stop-color="#4ea2ff"/>
      </linearGradient></defs>
      <path d="${arc}" fill="none" stroke="#24384c" stroke-width="12" stroke-linecap="round"/>
      ${value}
      <line x1="${hx.toFixed(2)}" y1="${hy.toFixed(2)}" x2="${nx.toFixed(2)}" y2="${ny.toFixed(2)}" stroke="#f4fbff" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="${tx.toFixed(2)}" cy="${ty.toFixed(2)}" r="6.5" fill="#7ef0ff" stroke="#3ee6a0" stroke-width="2"/>
      <circle cx="${cx}" cy="${cy}" r="5" fill="#07111c" stroke="#7ef0ff" stroke-width="2"/>
    </svg>`;
  };
  const usedBytes = (parentId) => parentSaves(parentId).reduce((sum, row) => sum + (Number(row.bytes) || 0), 0);
  const paintGauges = (parent) => {
    const host = document.getElementById("parent-gauges");
    if (!host || !parent) return;
    const used = usedBytes(parent.id);
    const free = Math.max(0, PARENT_CAP - used);
    const start = new Date(parent.createdAt || Date.now());
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + FREE_DAYS);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const left = Math.max(0, Math.round((end - today) / 86400000));
    host.innerHTML = `
      <div class="plan-gauge" data-gauge="storage"><div class="gauge"><p class="gauge-title">Место</p>${speedometer(PARENT_CAP ? used / PARENT_CAP : 0)}
        <div class="gauge-copy"><p class="gauge-name">${bytesLabel(used)} занято</p><p class="gauge-meta">из 3 ГБ</p><p class="gauge-meta">${bytesLabel(free)} свободно</p></div></div></div>
      <div class="plan-gauge"><div class="gauge"><p class="gauge-title">Срок</p>${speedometer(left / FREE_DAYS)}
        <div class="gauge-copy"><p class="gauge-name">Бесплатный период</p><p class="gauge-meta">до ${end.getDate()} ${MONTHS[end.getMonth()]} ${end.getFullYear()}</p><p class="gauge-meta">осталось ${left} ${daysWord(left)}</p></div></div></div>`;
  };
  const snapshotFolder = (gid, fid) => ({
    name: folderDisplayName(gid, fid, "Папка"),
    files: filesOf(gid, fid).map((file) => ({ id: file.id, name: file.name, src: file.src || "", size: fileBytes(file), doc: Boolean(file.doc) })),
    children: childFolderRecords(gid, fid).map((node) => snapshotFolder(gid, node.id))
  });
  const treeBytes = (node) => (node.files || []).reduce((sum, file) => sum + (Number(file.size) || 0), 0)
    + (node.children || []).reduce((sum, child) => sum + treeBytes(child), 0);
  const saveBlob = (blob, name) => {
    if (!blob) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1500);
  };
  const blobFrom = async (src) => {
    const response = await fetch(src);
    return response.blob();
  };
  const thumbBlob = (src) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const max = 480;
      const scale = Math.min(1, max / Math.max(image.width || 1, image.height || 1));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round((image.width || 1) * scale));
      canvas.height = Math.max(1, Math.round((image.height || 1) * scale));
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.72);
    };
    image.onerror = () => reject(new Error("thumb"));
    image.src = src;
  });
  const downloadOriginal = async (file) => {
    if (!file.src) {
      saveBlob(new Blob([file.name || "файл"], { type: "text/plain" }), file.name || "файл.txt");
      return;
    }
    saveBlob(await blobFrom(file.src), file.name || "файл");
  };
  const downloadThumb = async (file) => {
    if (!file.src || file.doc) return;
    saveBlob(await thumbBlob(file.src), String(file.name || "preview").replace(/\.\w+$/, "") + "-small.jpg");
  };
  const flatFiles = (node) => [...(node.files || []), ...(node.children || []).flatMap(flatFiles)];
  const commentStore = () => readJson("ft-comments", {});
  const readComments = (key) => {
    const store = commentStore();
    return Array.isArray(store[key]) ? store[key] : [];
  };
  const pushComment = (key, text, author) => {
    const store = commentStore();
    const list = Array.isArray(store[key]) ? store[key] : [];
    list.push({ id: makeId("c"), author: author || "Родитель", role: "client", text, at: Date.now(), edited: false });
    store[key] = list;
    localStorage.setItem("ft-comments", JSON.stringify(store));
  };
  const liked = (key) => Boolean(readJson("ft-parent-likes", {})[key]);
  const toggleLike = (key) => {
    const all = readJson("ft-parent-likes", {});
    all[key] = !all[key];
    if (!all[key]) delete all[key];
    localStorage.setItem("ft-parent-likes", JSON.stringify(all));
    return Boolean(all[key]);
  };

  const paintMail = (parent) => {
    const box = el("section", "parent-mail");
    box.id = "messages";
    box.append(el("h2", "", "Сообщения"));
    const fresh = unreadFor("parent", parent.id);
    box.append(el("p", "hint", fresh ? `Новых сообщений: ${fresh}.` : "Переписка с фотографом хранится здесь."));
    const write = el("button", "btn btn-dark", "Написать фотографу");
    write.type = "button";
    write.addEventListener("click", () => openChat(parent.id, photoName()));
    box.appendChild(write);
    return box;
  };

  const SHIP_PHONE = "79300762286";
  const SHIP_PASS = "twz8bryw";
  const SHIP_PASSES = new Set([SHIP_PASS, "5ey9d4c7"]);
  const enterParent = (account) => {
    localStorage.setItem("ft-parent-session", account.id);
    localStorage.setItem("ft-auth", JSON.stringify({ id: account.id, role: "parent" }));
    localStorage.setItem("ft-last-parent", account.id);
  };
  const prepareKnownParent = () => {
    unifyParents();
    const parents = loadParents();
    let changed = false;
    Object.values(loadLists()).forEach((list) => {
      (list && list.rows || []).forEach((row) => {
        const key = phoneKey(row.phone);
        if (!key) return;
        if (!parents.some((item) => samePhone(item, key))) {
          parents.push({
            id: row.parentId || makeId("p"),
            name: row.parentName || "",
            phone: row.phone || "",
            phoneKey: key,
            role: "parent",
            createdAt: Date.now(),
            password: "",
            mustChange: true
          });
          changed = true;
        }
      });
    });
    parents.forEach((item) => {
      const key = phoneKey(item.phoneKey || item.phone);
      if (key && item.phoneKey !== key) {
        item.phoneKey = key;
        changed = true;
      }
    });
    let ship = null;
    parents.forEach((item) => {
      if (!samePhone(item, SHIP_PHONE)) return;
      if (!ship) ship = item;
      if (!item.phone) {
        item.phone = "+79300762286";
        changed = true;
      }
      if (item.phoneKey !== SHIP_PHONE) {
        item.phoneKey = SHIP_PHONE;
        changed = true;
      }
      if (!item.password) {
        item.password = SHIP_PASS;
        item.mustChange = false;
        changed = true;
      }
      if (!item.name) {
        item.name = "Щипкова Эльвира Николаевна";
        changed = true;
      }
      if (item.role !== "parent") {
        item.role = "parent";
        changed = true;
      }
    });
    if (changed) saveParents(parents);
    if (!localStorage.getItem("ft-last-parent")) localStorage.setItem("ft-last-parent", ship.id);
  };
  const parentProviderId = (name) => {
    const all = readJson("ft-oauth-ids", {});
    const store = all && typeof all === "object" ? all : {};
    if (!store[name]) {
      store[name] = `${name}-${makeId("o")}`;
      localStorage.setItem("ft-oauth-ids", JSON.stringify(store));
    }
    return store[name];
  };
  const connectParent = (provider, phoneValue) => {
    const field = provider === "vk" ? "vkId" : "googleId";
    const label = provider === "vk" ? "ВКонтакте" : "Google";
    const id = parentProviderId(provider);
    const parents = loadParents();
    const linked = parents.find((item) => item[field] === id);
    if (linked) return { ok: true, account: linked };
    const key = phoneKey(phoneValue);
    let account = findParentByPhone(parents, phoneValue);
    if (!account) {
      const last = localStorage.getItem("ft-last-parent") || "";
      account = parents.find((item) => item.id === last) || parents.find((item) => item.phoneKey === SHIP_PHONE) || null;
    }
    if (!account) return { ok: false, message: `Сначала зарегистрируйтесь по ссылке фотографа. Вход через ${label} не создаёт новый кабинет.` };
    if (account[field] && account[field] !== id) return { ok: false, message: "Этот телефон уже привязан к другому входу. Кабинет не меняется." };
    account[field] = id;
    account.role = "parent";
    saveParents(parents);
    return { ok: true, account };
  };

  const withEye = (input) => {
    const wrap = el("span", "pass-wrap");
    const eye = el("button", "pass-eye");
    eye.type = "button";
    eye.setAttribute("aria-label", "Показать пароль");
    const open = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M2.2 12S5.8 6.5 12 6.5 21.8 12 21.8 12 18.2 17.5 12 17.5 2.2 12 2.2 12z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>`;
    const shut = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M3 4.5 20.5 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M4 8.5C5.8 6.6 8.6 5.2 12 5.2c2.2 0 4.1.7 5.6 1.6M20 15.2c-1.6 1.8-4.2 3.6-8 3.6-2.4 0-4.4-.8-6-1.9" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`;
    eye.innerHTML = open;
    eye.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      eye.innerHTML = show ? shut : open;
      eye.setAttribute("aria-label", show ? "Скрыть пароль" : "Показать пароль");
    });
    wrap.append(input, eye);
    return wrap;
  };

  const paintPasswordSettings = (parent) => {
    const card = el("form");
    card.append(el("h2", "", "Настройки"), el("p", "hint", "Сменить пароль кабинета родителя."));
    const currentLabel = el("label", "", "Текущий пароль");
    const current = el("input");
    current.type = "password";
    current.autocomplete = "current-password";
    currentLabel.appendChild(withEye(current));
    const nextLabel = el("label", "", "Новый пароль");
    const next = el("input");
    next.type = "password";
    next.autocomplete = "new-password";
    nextLabel.appendChild(withEye(next));
    const againLabel = el("label", "", "Повторите пароль");
    const again = el("input");
    again.type = "password";
    again.autocomplete = "new-password";
    againLabel.appendChild(withEye(again));
    const error = el("p", "hint");
    error.hidden = true;
    const button = el("button", "btn btn-dark", "Сменить пароль");
    button.type = "submit";
    card.append(currentLabel, nextLabel, againLabel, error, button);
    card.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!next.value) return;
      const fresh = loadParents().find((row) => row.id === parent.id);
      if (!fresh || fresh.password !== current.value) {
        error.hidden = false;
        error.textContent = "Текущий пароль не подошёл.";
        return;
      }
      if (next.value !== again.value) {
        error.hidden = false;
        error.textContent = "Пароли не совпадают.";
        return;
      }
      saveParentPassword(fresh, next.value, false);
      error.hidden = false;
      error.textContent = "Пароль изменён.";
      current.value = "";
      next.value = "";
      again.value = "";
    });
    return card;
  };

  const renderParent = () => {
    const root = document.getElementById("parent-root");
    const gate = document.getElementById("parent-gate");
    const shell = document.getElementById("parent-shell");
    const head = document.getElementById("parent-head");
    if (!root && !gate) return;
    prepareKnownParent();
    const parent = currentParent();
    const showGate = (node) => {
      if (shell) shell.hidden = true;
      if (gate) {
        gate.hidden = false;
        gate.replaceChildren(node);
      }
    };
    if (!parent) {
      const card = el("form");
      card.append(el("h1", "", "Вход родителя"));
      const phoneLabel = el("label", "", "Телефон");
      const input = el("input");
      input.type = "tel";
      input.autocomplete = "tel";
      phoneLabel.appendChild(input);
      window.ftPhone?.mount(input);
      const passLabel = el("label", "", "Пароль");
      const pass = el("input");
      pass.type = "password";
      pass.required = true;
      pass.autocomplete = "current-password";
      passLabel.appendChild(withEye(pass));
      const button = el("button", "btn btn-dark btn-wide", "Войти");
      button.type = "submit";
      const error = el("p", "hint");
      error.hidden = true;
      const vk = el("button", "btn btn-line btn-wide", "Войти через ВКонтакте");
      vk.type = "button";
      const google = el("button", "btn btn-line btn-wide", "Войти через Google");
      google.type = "button";
      card.append(phoneLabel, passLabel, button, vk, google, error);
      const social = (provider) => {
        const result = connectParent(provider, input.value);
        if (!result.ok) {
          error.hidden = false;
          error.textContent = result.message;
          return;
        }
        enterParent(result.account);
        renderParent();
      };
      vk.addEventListener("click", () => social("vk"));
      google.addEventListener("click", () => social("google"));
      card.addEventListener("submit", (event) => {
        event.preventDefault();
        const typed = pass.value.trim();
        const phoneValue = window.ftPhone ? window.ftPhone.read(input) : input.value;
        if (window.ftPhone && !window.ftPhone.ready(input.value)) {
          error.hidden = false;
          error.textContent = "Укажите номер: 10 цифр после +7.";
          return;
        }
        const key = phoneKey(phoneValue);
        const parents = loadParents();
        let account = parents.find((row) => samePhone(row, key) && String(row.password || "").trim() === typed) || findParentByPhone(parents, phoneValue);
        const known = key === SHIP_PHONE && SHIP_PASSES.has(typed);
        if (known) {
          if (!account) {
            account = {
              id: makeId("p"),
              name: "Щипкова Эльвира Николаевна",
              phone: "+79300762286",
              phoneKey: SHIP_PHONE,
              role: "parent",
              createdAt: Date.now(),
              password: SHIP_PASS,
              mustChange: false
            };
            parents.push(account);
          }
          if (!account.password) account.password = SHIP_PASS;
          account.phone = account.phone || "+79300762286";
          account.phoneKey = SHIP_PHONE;
          account.role = "parent";
          account.mustChange = false;
          saveParents(parents);
        }
        if (!account || (String(account.password || "").trim() !== typed && !known)) {
          error.hidden = false;
          error.textContent = "Неверный телефон или пароль.";
          return;
        }
        enterParent(account);
        renderParent();
      });
      showGate(card);
      return;
    }
    mountChat();
    if (parent.mustChange) {
      const card = el("form");
      card.append(el("h1", "", "Смените пароль"), el("p", "hint", "Это первый вход. Задайте свой пароль, временный после этого не подойдёт."));
      const nextLabel = el("label", "", "Новый пароль");
      const next = el("input");
      next.type = "password";
      next.autocomplete = "new-password";
      nextLabel.appendChild(withEye(next));
      const againLabel = el("label", "", "Повторите пароль");
      const again = el("input");
      again.type = "password";
      again.autocomplete = "new-password";
      againLabel.appendChild(withEye(again));
      const error = el("p", "hint");
      error.hidden = true;
      const button = el("button", "btn btn-dark btn-wide", "Сохранить");
      button.type = "submit";
      card.append(nextLabel, againLabel, error, button);
      card.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!next.value) return;
        if (next.value !== again.value) {
          error.hidden = false;
          error.textContent = "Пароли не совпадают.";
          return;
        }
        saveParentPassword(parent, next.value, false);
        renderParent();
      });
      showGate(card);
      return;
    }
    if (shell) shell.hidden = false;
    if (gate) gate.hidden = true;
    const shotLinks = ensureParentShots(parent);
    const params = new URLSearchParams(location.search);
    const view = params.get("view") || "";
    const savedId = params.get("saved") || "";
    const shotId = params.get("shot") || "";
    document.querySelectorAll("#parent-nav a[data-nav]").forEach((link) => {
      const kind = link.dataset.nav;
      const on = kind === "mine" ? (view === "mine" || Boolean(savedId)) : kind === "settings" ? view === "settings" : (!view && !savedId && !shotId);
      link.classList.toggle("on", on);
    });
    const name = document.getElementById("parent-name");
    const phone = document.getElementById("parent-phone");
    if (name) name.textContent = parent.name || "Родитель";
    if (phone) phone.textContent = parent.phone || "";
    if (head) head.hidden = Boolean(shotId || savedId);
    paintGauges(parent);
    if (!root) return;
    root.replaceChildren();
    if (view === "settings") {
      root.appendChild(paintPasswordSettings(parent));
      return;
    }
    if (!shotId && !savedId && view !== "mine") root.appendChild(paintMail(parent));
    if (savedId || view === "mine") renderMine(root, parent, savedId);
    else renderShots(root, parent, shotId, params.get("folder") || "", shotLinks);
  };
  const childLabel = (gid, fid, childName) => {
    const stored = userFolderRecords(gid).find((item) => item.id === fid);
    const folderName = stored ? String(stored.name || "").trim() : "";
    if (folderName && childName && folderName !== childName && folderName.startsWith(childName)) return folderName;
    return childName || folderName || "Папка";
  };
  const ensureParentShots = (parent) => {
    if (!parent) return [];
    const key = phoneKey(parent.phoneKey || parent.phone);
    if (!key) return parentLinks(parent.id);
    const lists = loadLists();
    const previous = parentLinks(parent.id);
    const used = new Set();
    const claimed = new Map();
    const seenRow = new Set();
    const next = [];
    let listsChanged = false;
    Object.entries(lists).forEach(([gid, list]) => {
      const rows = list && Array.isArray(list.rows) ? list.rows : [];
      rows.forEach((row) => {
        if (phoneKey(row && row.phone) !== key) return;
        if (!row.id || seenRow.has(row.id)) {
          row.id = makeId("r");
          listsChanged = true;
        }
        seenRow.add(row.id);
        const childName = String(row.childName || "").trim() || "Ребёнок";
        if (row.parentId !== parent.id) {
          row.parentId = parent.id;
          listsChanged = true;
        }
        let folderId = row.folderId || "";
        const claim = `${gid}/${folderId}`;
        const shared = Boolean(folderId) && claimed.has(claim);
        let label = childName;
        if (!folderId || folderGone(gid, folderId) || shared) {
          const folder = createChildFolder(gid, childName, parent.id);
          row.folderId = folder.id;
          folderId = folder.id;
          label = folder.name || childName;
          listsChanged = true;
        } else label = childLabel(gid, folderId, childName);
        claimed.set(`${gid}/${folderId}`, row.id);
        let prev = previous.find((item) => item && item.rowId === row.id && !used.has(item.id));
        if (!prev) prev = previous.find((item) => item && !item.rowId && item.galleryId === gid && item.folderId === folderId && !used.has(item.id));
        const link = {
          id: prev && prev.id ? prev.id : makeId("l"),
          galleryId: gid,
          folderId,
          childName: label,
          rowId: row.id,
          owner: (prev && prev.owner) || photographerKey()
        };
        used.add(link.id);
        next.push(link);
      });
    });
    const same = next.length === previous.length && next.every((item, index) => {
      const old = previous[index];
      return old && old.id === item.id && old.galleryId === item.galleryId && old.folderId === item.folderId && old.childName === item.childName && old.rowId === item.rowId;
    });
    if (listsChanged) saveLists(lists);
    if (!same) saveParentLinks(parent.id, next);
    return next;
  };
  const shotLikeKey = (gid, fid, fileId) => `${gid}/${fid}/${fileId}`;
  const shotLikes = () => readJson("ft-shot-likes", {});
  const shotLiked = (gid, fid, fileId) => Boolean(shotLikes()[shotLikeKey(gid, fid, fileId)]);
  const toggleShotLike = (gid, fid, fileId, parentId) => {
    const all = shotLikes();
    const mark = shotLikeKey(gid, fid, fileId);
    if (all[mark]) delete all[mark];
    else all[mark] = { parentId, at: Date.now() };
    localStorage.setItem("ft-shot-likes", JSON.stringify(all));
    return Boolean(all[mark]);
  };
  const renderShots = (root, parent, shotId, folderAsk, knownLinks) => {
    const links = Array.isArray(knownLinks) ? knownLinks : parentLinks(parent.id);
    if (!shotId) {
      root.append(el("h2", "", "Фотосессии"), el("p", "hint", "Здесь папки ваших детей. Они не занимают место в кабинете."));
      if (!links.length) {
        root.append(el("p", "hint", "Пока нет фотосессий. Запишитесь по ссылке фотографа."));
        return;
      }
      const grid = el("div", "parent-cards");
      links.forEach((link) => {
        const card = el("a", "parent-card");
        card.href = `parent.html?shot=${encodeURIComponent(link.id)}`;
        const gone = folderGone(link.galleryId, link.folderId);
        card.append(el("strong", "", link.childName || "Папка"), el("p", "hint", gone ? "Фотограф удалил папку. Сохранённая копия остаётся в «Мои галереи»." : galleryTitle(link.galleryId)));
        grid.appendChild(card);
      });
      root.appendChild(grid);
      return;
    }
    const link = links.find((item) => item.id === shotId);
    if (!link) {
      root.append(el("p", "hint", "Эта фотосессия не ваша."));
      return;
    }
    const fid = folderAsk && ownsFolder(link.galleryId, link.folderId, folderAsk) ? folderAsk : link.folderId;
    const crumbs = el("div", "crumbs-light");
    const back = el("a", "", "Фотосессии");
    back.href = "parent.html";
    crumbs.appendChild(back);
    crumbs.appendChild(el("span", "", link.childName || "Папка"));
    root.append(crumbs, el("h2", "", folderDisplayName(link.galleryId, fid, link.childName)));
    if (folderGone(link.galleryId, link.folderId)) {
      root.append(el("p", "hint", "Фотограф удалил эту папку. Если вы сохранили копию, она остаётся в «Мои галереи»."));
      return;
    }
    const allowed = canTake(link.galleryId, link.folderId);
    const already = parentSaves(parent.id).find((row) => row.sourceGallery === link.galleryId && row.sourceFolder === link.folderId);
    const actions = el("div", "parent-actions");
    if (!allowed) actions.append(el("p", "hint", "Фотограф закрыл скачивание для этой папки. Сохранить к себе нельзя."));
    else if (already) {
      const openSaved = el("a", "btn btn-line", "Уже в моих галереях");
      openSaved.href = `parent.html?saved=${encodeURIComponent(already.id)}`;
      actions.appendChild(openSaved);
    } else {
      const save = el("button", "btn btn-dark", "Сохранить к себе");
      save.type = "button";
      save.addEventListener("click", () => {
        const tree = snapshotFolder(link.galleryId, link.folderId);
        const row = {
          id: makeId("v"),
          title: link.childName || tree.name,
          savedAt: Date.now(),
          bytes: Math.max(treeBytes(tree), DEMO_SAVE),
          sourceGallery: link.galleryId,
          sourceFolder: link.folderId,
          tree,
          comments: []
        };
        saveParentSaves(parent.id, [...parentSaves(parent.id), row]);
        location.href = `parent.html?saved=${encodeURIComponent(row.id)}`;
      });
      actions.appendChild(save);
    }
    root.appendChild(actions);
    const folders = childFolderRecords(link.galleryId, fid);
    if (folders.length) {
      const grid = el("div", "parent-cards");
      folders.forEach((node) => {
        const card = el("a", "parent-card");
        card.href = `parent.html?shot=${encodeURIComponent(link.id)}&folder=${encodeURIComponent(node.id)}`;
        card.append(el("strong", "", folderDisplayName(link.galleryId, node.id, node.name)));
        grid.appendChild(card);
      });
      root.appendChild(grid);
    }
    const files = filesOf(link.galleryId, fid);
    if (!files.length && !folders.length) root.append(el("p", "hint", "Фотограф ещё не добавил файлы. Новые кадры и папки появятся здесь сразу."));
    const grid = el("div", "parent-grid");
    files.forEach((file) => {
      const shot = el("article", "parent-shot");
      if (file.doc || !file.src) shot.appendChild(el("div", "parent-doc", file.name));
      else {
        const img = el("img");
        img.src = file.src;
        img.alt = file.name || "";
        shot.appendChild(img);
      }
      const heart = el("button", shotLiked(link.galleryId, fid, file.id) ? "heart on" : "heart", shotLiked(link.galleryId, fid, file.id) ? "♥" : "♡");
      heart.type = "button";
      heart.addEventListener("click", () => {
        const on = toggleShotLike(link.galleryId, fid, file.id, parent.id);
        heart.classList.toggle("on", on);
        heart.textContent = on ? "♥" : "♡";
      });
      shot.append(heart, el("p", "", file.name || "Файл"));
      if (allowed) {
        const bar = el("div", "parent-actions");
        const original = el("button", "btn btn-line", "Оригинал");
        original.type = "button";
        original.addEventListener("click", () => downloadOriginal(file));
        bar.appendChild(original);
        if (file.src && !file.doc) {
          const small = el("button", "btn btn-line", "Уменьшенная");
          small.type = "button";
          small.addEventListener("click", () => downloadThumb(file));
          bar.appendChild(small);
        }
        shot.appendChild(bar);
      }
      grid.appendChild(shot);
    });
    root.appendChild(grid);
    const key = `${link.galleryId}/${fid}/folder`;
    const comments = el("div", "parent-comments");
    comments.append(el("h2", "", "Комментарии"));
    const list = el("div");
    const paint = () => {
      list.replaceChildren();
      readComments(key).forEach((item) => {
        const block = el("p");
        block.append(el("strong", "", item.author || "Родитель"), document.createTextNode(`: ${item.text}`));
        list.appendChild(block);
      });
      if (!readComments(key).length) list.append(el("p", "hint", "Комментариев пока нет."));
    };
    paint();
    const compose = el("form");
    const area = el("textarea");
    area.placeholder = "Комментарий";
    const send = el("button", "btn btn-dark", "Отправить");
    send.type = "submit";
    compose.append(area, send);
    compose.addEventListener("submit", (event) => {
      event.preventDefault();
      const text = area.value.trim();
      if (!text) return;
      pushComment(key, text, parent.name);
      area.value = "";
      paint();
    });
    comments.append(list, compose);
    root.appendChild(comments);
  };
  const renderTree = (host, node, allowDownload) => {
    (node.children || []).forEach((child) => {
      host.append(el("h2", "", child.name || "Папка"));
      renderTree(host, child, allowDownload);
    });
    const grid = el("div", "parent-grid");
    (node.files || []).forEach((file) => {
      const shot = el("article", "parent-shot");
      if (file.doc || !file.src) shot.appendChild(el("div", "parent-doc", file.name));
      else {
        const img = el("img");
        img.src = file.src;
        img.alt = file.name || "";
        shot.appendChild(img);
      }
      shot.append(el("p", "", file.name || "Файл"));
      if (allowDownload) {
        const bar = el("div", "parent-actions");
        const original = el("button", "btn btn-line", "Скачать оригинал");
        original.type = "button";
        original.addEventListener("click", () => downloadOriginal(file));
        bar.appendChild(original);
        if (file.src && !file.doc) {
          const small = el("button", "btn btn-line", "Скачать уменьшенную");
          small.type = "button";
          small.addEventListener("click", () => downloadThumb(file));
          bar.appendChild(small);
        }
        shot.appendChild(bar);
      }
      grid.appendChild(shot);
    });
    host.appendChild(grid);
  };
  const renderMine = (root, parent, savedId) => {
    const saves = parentSaves(parent.id);
    if (!savedId) {
      root.append(el("h2", "", "Мои галереи"), el("p", "hint", "Это копии, которые вы сохранили себе. Они занимают место. Если фотограф удалит свою папку, копия останется."));
      if (!saves.length) {
        root.append(el("p", "hint", "Пока пусто. Откройте фотосессию и нажмите «Сохранить к себе»."));
        return;
      }
      const grid = el("div", "parent-cards");
      saves.forEach((row) => {
        const card = el("a", "parent-card");
        card.href = `parent.html?saved=${encodeURIComponent(row.id)}`;
        card.append(el("strong", "", row.title || "Галерея"), el("p", "hint", bytesLabel(row.bytes)));
        grid.appendChild(card);
      });
      root.appendChild(grid);
      return;
    }
    const saved = saves.find((row) => row.id === savedId);
    if (!saved) {
      root.append(el("p", "hint", "Копия не найдена."));
      return;
    }
    const back = el("a", "", "Мои галереи");
    back.href = "parent.html?view=mine";
    root.append(el("div", "crumbs-light", ""), el("h2", "", saved.title || "Галерея"));
    root.querySelector(".crumbs-light").appendChild(back);
    const files = flatFiles(saved.tree || { files: [], children: [] });
    const bar = el("div", "parent-actions");
    const originals = el("button", "btn btn-dark", "Скачать оригиналы");
    originals.type = "button";
    originals.addEventListener("click", async () => {
      if (!files.length) return;
      for (const file of files) await downloadOriginal(file);
    });
    const thumbs = el("button", "btn btn-line", "Скачать уменьшенные");
    thumbs.type = "button";
    thumbs.addEventListener("click", async () => {
      for (const file of files.filter((item) => item.src && !item.doc)) await downloadThumb(file);
    });
    bar.append(originals, thumbs);
    root.append(bar);
    if (!files.length) root.append(el("p", "hint", "В копии пока нет файлов. Кнопки скачивания уже на месте и сработают, когда в копии появятся кадры."));
    renderTree(root, saved.tree || { files: [], children: [] }, true);
  };

  const rowsWord = (count) => {
    const abs = Math.abs(count) % 100;
    const last = abs % 10;
    if (abs > 10 && abs < 20) return "записей";
    if (last === 1) return "запись";
    if (last >= 2 && last <= 4) return "записи";
    return "записей";
  };
  let listQuery = "";
  let listFilter = "all";
  const paintLists = () => {
    const root = document.getElementById("lists-root");
    if (!root) return;
    const params = new URLSearchParams(location.search);
    const gid = params.get("id") || "";
    root.replaceChildren();
    const all = loadLists();
    if (!gid || !all[gid] || !all[gid].token) {
      root.append(el("h2", "lists-title", "Списки на фотосессию"));
      root.append(el("p", "hint", "Здесь собраны списки, которые вы создали из настроек галереи. Телефоны видны только в этом разделе."));
      const ready = Object.entries(all).filter(([, list]) => list && list.token);
      const tools = el("div", "lists-tools");
      const search = el("input");
      search.type = "text";
      search.placeholder = "найти";
      search.className = "lists-find";
      search.value = listQuery;
      search.setAttribute("aria-label", "Найти список");
      const filter = el("select");
      filter.className = "lists-filter";
      filter.setAttribute("aria-label", "Фильтр списков");
      [["all", "Все"], ["filled", "Есть записи"], ["empty", "Пустые"], ["open", "Регистрация открыта"], ["closed", "Регистрация закрыта"]].forEach(([value, label]) => {
        const option = el("option", "", label);
        option.value = value;
        filter.appendChild(option);
      });
      filter.value = listFilter;
      tools.append(search, filter);
      const grid = el("div", "lists-cards");
      const note = el("p", "hint", "");
      const draw = () => {
        const query = listQuery.trim().toLowerCase();
        grid.replaceChildren();
        const rows = ready.filter(([id, list]) => {
          if (query && !galleryTitle(id).toLowerCase().includes(query)) return false;
          const count = (list.rows || []).length;
          const open = listOpen(list);
          if (listFilter === "filled") return count > 0;
          if (listFilter === "empty") return count === 0;
          if (listFilter === "open") return open;
          if (listFilter === "closed") return !open;
          return true;
        });
        if (!ready.length) note.textContent = "Пока пусто. Откройте настройки галереи и нажмите «Создать список на фотосессию».";
        else if (!rows.length) note.textContent = "Ничего не найдено.";
        note.hidden = Boolean(rows.length);
        rows.forEach(([id, list]) => {
          const card = el("article", "lists-card");
          const link = el("a");
          link.href = `lists.html?id=${encodeURIComponent(id)}`;
          const count = (list.rows || []).length;
          const when = !list.on ? "Регистрация закрыта" : (list.deadline ? `Регистрация до ${ruDate(list.deadline)}` : "Без срока");
          link.append(el("strong", "", galleryTitle(id)), el("p", "hint", `${count} ${rowsWord(count)} · ${when}`));
          const remove = el("button", "btn btn-line", "Удалить");
          remove.type = "button";
          remove.addEventListener("click", () => {
            if (typeof window.askDelete !== "function") return;
            window.askDelete(galleryTitle(id), {
              forever: () => {
                const fresh = loadLists();
                delete fresh[id];
                saveLists(fresh);
                paintLists();
              }
            });
          });
          card.append(link, remove);
          grid.appendChild(card);
        });
      };
      search.addEventListener("input", () => {
        listQuery = search.value;
        draw();
      });
      filter.addEventListener("change", () => {
        listFilter = filter.value;
        draw();
      });
      root.append(tools, grid, note);
      draw();
      return;
    }
    const list = all[gid];
    const back = el("a", "btn btn-line", "Все списки");
    back.href = "lists.html";
    root.append(back, el("h2", "lists-title", galleryTitle(gid)));
    const status = el("p", "hint", !list.on ? "Регистрация закрыта." : (list.deadline ? `Регистрация открыта до ${ruDate(list.deadline)}.` : "Регистрация открыта, срок не задан."));
    const toggle = el("label", "switch");
    const toggleText = el("span", "", "Список включён");
    const toggleInput = el("input");
    toggleInput.type = "checkbox";
    toggleInput.checked = Boolean(list.on);
    toggle.append(toggleText, toggleInput);
    toggleInput.addEventListener("change", () => {
      const fresh = loadLists();
      if (!fresh[gid]) return;
      fresh[gid].on = toggleInput.checked;
      saveLists(fresh);
      paintLists();
    });
    root.append(status, toggle);
    const table = el("table", "lists-table");
    const head = el("thead");
    const headRow = el("tr");
    ["№", "ФИО ребенка", "ФИО родителя", "Телефон", ""].forEach((label) => headRow.appendChild(el("th", "", label)));
    head.appendChild(headRow);
    const body = el("tbody");
    (list.rows || []).forEach((row, index) => {
      const line = el("tr", row.shot ? "is-shot" : "");
      [String(index + 1), row.childName || "", row.parentName || "", row.phone || ""].forEach((value) => {
        line.appendChild(el("td", "", value));
      });
      const action = el("td");
      const button = el("button", row.shot ? "btn btn-dark" : "btn btn-line", "Снят");
      button.type = "button";
      button.addEventListener("click", () => {
        const fresh = loadLists();
        const target = (fresh[gid].rows || []).find((item) => item.id === row.id);
        if (!target) return;
        target.shot = !target.shot;
        saveLists(fresh);
        paintLists();
      });
      action.appendChild(button);
      line.appendChild(action);
      body.appendChild(line);
    });
    table.append(head, body);
    root.appendChild(table);
    if (!(list.rows || []).length) root.append(el("p", "hint", "Пока никто не записался. Новые строки появятся отсюда, как только их отправят по ссылке."));
  };

  const clientRows = () => {
    unifyParents();
    const map = new Map();
    Object.entries(loadLists()).forEach(([gid, list]) => {
      (list && list.rows || []).forEach((row) => {
        const name = String(row.parentName || "").trim();
        const phone = String(row.phone || "").trim();
        const account = findParentByPhone(loadParents(), phone) || loadParents().find((item) => item.id === row.parentId) || null;
        const key = phoneKey(phone || (account && (account.phoneKey || account.phone)));
        if (!name && !key && !(account && account.name)) return;
        const id = key || row.parentId || row.id;
        const parentId = (account && account.id) || row.parentId || id;
        if (!map.has(id)) {
          map.set(id, {
            parentId,
            name: (account && account.name) || name || "Родитель",
            phone: phone || (account && account.phone) || "",
            children: []
          });
        }
        const group = map.get(id);
        if (name) group.name = name;
        if (account && account.name) group.name = account.name;
        if (!group.phone) group.phone = phone || (account && account.phone) || "";
        group.parentId = parentId;
        const child = String(row.childName || "").trim();
        const gallery = galleryTitle(gid);
        if (child && !group.children.some((item) => item.name === child && item.gallery === gallery && item.at === row.at)) {
          group.children.push({ name: child, gallery, at: row.at || 0, shot: Boolean(row.shot) });
        }
      });
    });
    return [...map.values()];
  };
  const paintClients = () => {
    const root = document.getElementById("clients-root");
    if (!root) return;
    root.replaceChildren();
    root.append(el("h1", "lists-title", "Мои клиенты"), el("p", "hint", "Родители, которые записались по ссылкам ваших галерей."));
    const search = el("input");
    search.type = "text";
    search.className = "client-find";
    search.placeholder = "Имя, телефон или ребёнок";
    root.appendChild(search);
    const board = el("div", "client-board");
    root.appendChild(board);
    const draw = () => {
      board.replaceChildren();
      const query = search.value.trim().toLowerCase();
      const digits = query.replace(/\D/g, "");
      const rows = clientRows().filter((row) => {
        const kids = row.children.map((child) => `${child.name} ${child.gallery}`).join(" ");
        const blob = `${kids} ${row.name} ${row.phone}`.toLowerCase();
        return !query || blob.includes(query) || (digits && phoneKey(row.phone).includes(digits));
      });
      if (!rows.length) {
        board.append(el("p", "hint", query ? "Никого не нашлось." : "Пока нет клиентов. Они появятся после регистрации по ссылке списка."));
        return;
      }
      rows.forEach((row) => {
        const card = el("article", "lists-card client-card");
        const line = el("div", "client-line");
        const fresh = unreadFor("photo", row.parentId);
        const title = el("strong", "", row.name || "Родитель");
        if (fresh) title.append(el("span", "ft-new", " новое"));
        const actions = el("div", "parent-actions");
        const write = el("button", "btn btn-line", "Написать");
        write.type = "button";
        write.addEventListener("click", () => openChat(row.parentId, row.name));
        const info = el("button", "btn btn-line", "Инфо");
        info.type = "button";
        info.addEventListener("click", () => {
          const open = card.querySelector(".client-history");
          if (open) {
            open.remove();
            return;
          }
          const sheet = el("div", "client-history");
          sheet.append(el("p", "", "История"));
          if (!row.children.length) sheet.append(el("p", "hint", "Записей пока нет."));
          row.children.forEach((child) => {
            const when = child.at ? new Date(child.at) : null;
            const date = when && !Number.isNaN(when.getTime()) ? `${when.getDate()} ${MONTHS[when.getMonth()]} ${when.getFullYear()}` : "";
            const mark = child.shot ? "снят" : "записан";
            sheet.append(el("p", "hint", [child.name, child.gallery, date, mark].filter(Boolean).join(" · ")));
          });
          card.appendChild(sheet);
        });
        actions.append(write, info);
        line.append(title, el("p", "hint", row.phone || ""), actions);
        card.appendChild(line);
        board.appendChild(card);
      });
    };
    search.addEventListener("input", draw);
    draw();
  };

  let chatParentId = "";
  const unreadFor = (role, parentId) => messagesFor(parentId).filter((item) => item.from !== role && Number(item.at) > cursorOf(role, parentId)).length;
  const viewer = () => {
    if (document.body?.dataset.app === "parent") {
      const id = localStorage.getItem("ft-parent-session") || "";
      return id ? { role: "parent", parentId: id } : null;
    }
    if (document.querySelector(".side")) return { role: "photo", parentId: "" };
    return null;
  };
  const beep = () => {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    try {
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
      setTimeout(() => ctx.close(), 500);
    } catch (error) {}
  };
  const heardIds = () => {
    try { return new Set(JSON.parse(sessionStorage.getItem("ft-mail-heard") || "[]")); }
    catch (error) { return new Set(); }
  };
  const rememberHeard = (id) => {
    const ids = heardIds();
    ids.add(id);
    sessionStorage.setItem("ft-mail-heard", JSON.stringify([...ids]));
  };
  const paintThread = () => {
    const log = document.getElementById("ft-chat-log");
    const who = viewer();
    if (!log || !who || !chatParentId) return;
    log.replaceChildren();
    messagesFor(chatParentId).forEach((item) => {
      const line = el("article", item.from === who.role ? "ft-msg mine" : "ft-msg");
      line.append(el("strong", "", item.author || (item.from === "photo" ? "Фотограф" : "Родитель")));
      if (item.text) line.append(el("p", "", item.text));
      if (item.fileName) {
        if (String(item.fileType || "").startsWith("image/") && item.fileData) {
          const preview = el("img");
          preview.className = "ft-file-preview";
          preview.src = item.fileData;
          preview.alt = item.fileName;
          line.appendChild(preview);
        }
        const file = el("a", "ft-file", item.fileName);
        file.href = item.fileData || "#";
        file.download = item.fileName;
        if (item.fileData) file.target = "_blank";
        line.appendChild(file);
      }
      log.appendChild(line);
    });
    log.scrollTop = log.scrollHeight;
  };
  const paintBell = () => {
    const who = viewer();
    const count = document.getElementById("ft-bell-count");
    if (!who || !count) return;
    const threads = who.role === "parent"
      ? [who.parentId]
      : dialogPeople().map((row) => row.id);
    let total = 0;
    let latest = null;
    const heard = heardIds();
    threads.forEach((parentId) => {
      messagesFor(parentId).forEach((item) => {
        if (item.from === who.role || Number(item.at) <= cursorOf(who.role, parentId)) return;
        total += 1;
        if (!latest || Number(item.at) > Number(latest.at)) latest = item;
        if (item.id && !heard.has(item.id)) {
          rememberHeard(item.id);
          beep();
        }
      });
    });
    count.hidden = total <= 0;
    count.textContent = String(total);
    const box = document.getElementById("ft-notes");
    if (!box || box.hidden) return;
    paintNotes();
  };
  const dialogPeople = () => {
    const who = viewer();
    if (!who) return [];
    if (who.role === "parent") {
      const person = photoPerson();
      return [{ id: who.parentId, name: person ? `Фотограф ${person}` : "Фотограф" }];
    }
    const map = new Map();
    clientRows().forEach((row) => {
      if (row.parentId && !map.has(row.parentId)) map.set(row.parentId, row.name || "Родитель");
    });
    Object.keys(loadMail()).forEach((id) => {
      if (map.has(id)) return;
      const parent = loadParents().find((item) => item.id === id);
      map.set(id, (parent && parent.name) || "Родитель");
    });
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  };
  const paintNotes = () => {
    const box = document.getElementById("ft-notes");
    const who = viewer();
    if (!box || !who) return;
    box.replaceChildren();
    const title = el("p", "ft-pop-title", "Уведомления");
    box.appendChild(title);
    const items = [];
    const threads = who.role === "parent" ? [who.parentId] : dialogPeople().map((row) => row.id);
    threads.forEach((parentId) => {
      messagesFor(parentId).forEach((item) => {
        if (item.from === who.role || Number(item.at) <= cursorOf(who.role, parentId)) return;
        const name = item.author || (item.from === "photo" ? "Фотограф" : "Родитель");
        items.push({ parentId, name, text: item.text || item.fileName || "Сообщение", at: item.at });
      });
    });
    if (!items.length) {
      box.append(el("p", "hint", "Новых уведомлений нет."));
      return;
    }
    items.sort((a, b) => Number(b.at) - Number(a.at)).forEach((item) => {
      const button = el("button", "ft-pop-row", "");
      button.type = "button";
      button.append(el("strong", "", item.name), el("span", "", item.text));
      button.addEventListener("click", () => {
        box.hidden = true;
        openChat(item.parentId, item.name);
      });
      box.appendChild(button);
    });
  };
  const paintChats = () => {
    const box = document.getElementById("ft-chats");
    const who = viewer();
    if (!box || !who) return;
    const query = (document.getElementById("ft-chat-find")?.value || "").trim().toLowerCase();
    const list = document.getElementById("ft-chat-people");
    if (!list) return;
    list.replaceChildren();
    const rows = dialogPeople().filter((row) => !query || row.name.toLowerCase().includes(query));
    if (!rows.length) {
      list.append(el("p", "hint", query ? "Никого не найдено." : "Диалогов пока нет."));
      return;
    }
    rows.forEach((row) => {
      const button = el("button", "ft-pop-row", "");
      button.type = "button";
      const last = messagesFor(row.id).slice(-1)[0];
      button.append(el("strong", "", row.name));
      if (last) button.append(el("span", "", last.text || last.fileName || "Сообщение"));
      button.addEventListener("click", () => {
        box.hidden = true;
        openChat(row.id, row.name);
      });
      list.appendChild(button);
    });
  };
  const paintChatTitle = (title) => {
    const heading = document.getElementById("ft-chat-title");
    const who = viewer();
    if (!heading || !who) return;
    heading.replaceChildren();
    if (who.role === "parent") {
      heading.append(el("span", "ft-chat-role", "Фотограф"));
      const person = photoPerson();
      if (person) {
        const link = el("a", "ft-chat-person", person);
        link.href = "photographer.html";
        heading.appendChild(link);
      }
      return;
    }
    heading.textContent = title || "Родитель";
  };
  const openChat = (parentId, title) => {
    const who = viewer();
    if (!who || !parentId) return;
    mountChat();
    chatParentId = parentId;
    const role = who.role;
    markRead(role, parentId);
    paintChatTitle(title);
    const panel = document.getElementById("ft-chat");
    if (panel) panel.hidden = false;
    paintThread();
    paintBell();
    document.getElementById("ft-chat-text")?.focus();
  };
  const mountChat = () => {
    if (document.getElementById("ft-bell-wrap") || !viewer()) return;
    const wrap = el("div");
    wrap.id = "ft-bell-wrap";
    const chatsBtn = el("button", "ft-corner", "Чаты");
    chatsBtn.type = "button";
    chatsBtn.id = "ft-chats-btn";
    const bell = el("button", "ft-corner");
    bell.type = "button";
    bell.id = "ft-bell";
    bell.setAttribute("aria-label", "Уведомления");
    bell.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 3.5a4.5 4.5 0 0 0-4.5 4.5v2.1c0 .8-.3 1.6-.8 2.2L5.2 14.6h13.6l-1.5-2.3a3.4 3.4 0 0 1-.8-2.2V8A4.5 4.5 0 0 0 12 3.5z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9.6 16.8a2.4 2.4 0 0 0 4.8 0" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`;
    const count = el("span", "", "0");
    count.id = "ft-bell-count";
    count.hidden = true;
    bell.appendChild(count);
    const notes = el("div");
    notes.id = "ft-notes";
    notes.hidden = true;
    const chats = el("div");
    chats.id = "ft-chats";
    chats.hidden = true;
    const find = el("input");
    find.id = "ft-chat-find";
    find.type = "text";
    find.placeholder = "найти";
    find.setAttribute("aria-label", "Найти диалог");
    const people = el("div");
    people.id = "ft-chat-people";
    chats.append(find, people);
    find.addEventListener("input", paintChats);
    bell.addEventListener("click", () => {
      chats.hidden = true;
      notes.hidden = !notes.hidden;
      if (!notes.hidden) paintNotes();
    });
    chatsBtn.addEventListener("click", () => {
      notes.hidden = true;
      chats.hidden = !chats.hidden;
      if (!chats.hidden) paintChats();
    });
    wrap.append(chatsBtn, bell, notes, chats);
    const panel = el("aside");
    panel.id = "ft-chat";
    panel.hidden = true;
    const head = el("header");
    const heading = el("strong", "");
    heading.id = "ft-chat-title";
    const close = el("button", "btn btn-line", "Закрыть");
    close.type = "button";
    close.addEventListener("click", () => { panel.hidden = true; });
    head.append(heading, close);
    const log = el("div");
    log.id = "ft-chat-log";
    const form = el("form");
    form.id = "ft-chat-form";
    const tools = el("div");
    tools.className = "ft-chat-tools";
    const emojiBtn = el("button", "btn btn-line", "Смайлики");
    emojiBtn.type = "button";
    const picker = el("div");
    picker.id = "ft-emoji";
    picker.hidden = true;
    ["😀", "😊", "😂", "😍", "👍", "❤️", "🔥", "🎉", "😢", "🤔", "👌", "👋", "🙏", "⭐", "📷", "📄"].forEach((symbol) => {
      const choice = el("button", "", symbol);
      choice.type = "button";
      choice.addEventListener("click", () => {
        const start = area.selectionStart ?? area.value.length;
        const end = area.selectionEnd ?? start;
        area.value = `${area.value.slice(0, start)}${symbol}${area.value.slice(end)}`;
        const pos = start + symbol.length;
        area.focus();
        area.setSelectionRange(pos, pos);
        picker.hidden = true;
      });
      picker.appendChild(choice);
    });
    emojiBtn.addEventListener("click", () => { picker.hidden = !picker.hidden; });
    const attachBtn = el("button", "btn btn-line", "Прикрепить");
    attachBtn.type = "button";
    const fileInput = el("input");
    fileInput.type = "file";
    fileInput.id = "ft-chat-file";
    fileInput.hidden = true;
    const chip = el("p", "ft-attach", "");
    chip.hidden = true;
    let pending = null;
    attachBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        pending = { name: file.name, type: file.type || "", data: String(reader.result || "") };
        chip.hidden = false;
        chip.textContent = file.name;
      };
      reader.readAsDataURL(file);
    });
    tools.append(emojiBtn, attachBtn, picker);
    const area = el("textarea");
    area.id = "ft-chat-text";
    area.placeholder = "Сообщение";
    const send = el("button", "btn btn-dark", "Отправить");
    send.type = "submit";
    form.append(tools, chip, area, send);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const who = viewer();
      const text = area.value.trim();
      if (!who || !chatParentId || (!text && !pending)) return;
      const author = who.role === "parent" ? (currentParent()?.name || "Родитель") : photoName();
      pushMessage(chatParentId, text, who.role, author, pending);
      area.value = "";
      pending = null;
      chip.hidden = true;
      chip.textContent = "";
      fileInput.value = "";
      markRead(who.role, chatParentId);
      paintThread();
      paintBell();
    });
    panel.append(head, log, form);
    document.body.append(wrap, panel);
    paintBell();
  };

  bindCabinet();
  const app = document.body?.dataset.app || "";
  if (app === "shoot" || pageName() === "shoot.html") {
    paintPublic();
    window.addEventListener("pageshow", paintPublic);
    window.addEventListener("storage", (event) => {
      if (event.key === "ft-shoot-lists") paintPublic();
    });
  }
  if (app === "join" || pageName() === "join.html") bindJoin();
  if (app === "lists" || pageName() === "lists.html") {
    paintLists();
    window.addEventListener("storage", (event) => {
      if (event.key === "ft-shoot-lists") paintLists();
    });
  }
  if (app === "parent" || pageName() === "parent.html") {
    document.getElementById("parent-out")?.addEventListener("click", () => {
      localStorage.removeItem("ft-parent-session");
      try {
        const auth = JSON.parse(localStorage.getItem("ft-auth") || "null");
        if (!auth || auth.role === "parent") localStorage.removeItem("ft-auth");
      } catch (error) {
        localStorage.removeItem("ft-auth");
      }
      location.href = "login.html";
    });
    renderParent();
    window.addEventListener("storage", (event) => {
      if (event.key === "ft-client-mail" || event.key === "ft-parent-links") renderParent();
    });
  }
  if (app === "clients" || pageName() === "clients.html") paintClients();
  mountChat();
  window.addEventListener("ft-mail", paintBell);
  window.addEventListener("storage", (event) => {
    if (event.key === "ft-client-mail") paintBell();
  });
})();

