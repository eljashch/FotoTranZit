(() => {
  const readJson = (key, fallback) => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return value == null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  };
  const phoneKey = (value) => {
    let digits = String(value || "").replace(/\D/g, "");
    if (digits.length > 10) digits = digits.slice(-10);
    if (digits.length === 10) return `7${digits}`;
    return digits;
  };
  const PARENT_PHONE = "79300762286";
  const PARENT_PASSES = new Set(["twz8bryw", "5ey9d4c7"]);
  const PHOTO_EMAIL = "hello@fototranzit.ru";
  const PHOTO_PASS = "foto2026";
  const emailKey = (value) => String(value || "").trim().toLowerCase();
  const makeId = (prefix) => prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const loadAccounts = () => {
    const list = readJson("ft-accounts", []);
    return Array.isArray(list) ? list : [];
  };
  const fullName = (row) => row.name || [row.first, row.last].filter(Boolean).join(" ");

  const known = () => {
    const map = new Map();
    const put = (row) => {
      if (!row || !row.id) return;
      map.set(row.id, row);
    };
    const parents = readJson("ft-parents", []);
    if (Array.isArray(parents)) {
      parents.forEach((row) => put({
        id: row.id,
        role: "parent",
        name: row.name || "",
        first: row.first || "",
        last: row.last || "",
        phone: row.phone || "",
        phoneKey: row.phoneKey || phoneKey(row.phone),
        email: row.email || "",
        emailKey: row.emailKey || emailKey(row.email),
        password: row.password || "",
        vkId: row.vkId || "",
        googleId: row.googleId || "",
        createdAt: row.createdAt || 0
      }));
    }
    const user = readJson("ft-user", null);
    const profile = readJson("ft-profile", null);
    if (user && (user.email || user.phone)) {
      const phone = user.phone || (profile && profile.phone) || "";
      put({
        id: user.accountId || "photo-main",
        role: "photo",
        first: user.first || "",
        last: user.last || "",
        name: fullName(user),
        email: user.email || "",
        emailKey: emailKey(user.email),
        phone,
        phoneKey: phoneKey(phone),
        password: user.password || "",
        vkId: user.vkId || "",
        googleId: user.googleId || "",
        createdAt: user.createdAt || 0
      });
    }
    loadAccounts().forEach(put);
    return [...map.values()];
  };

  const findByContact = (value) => {
    const email = emailKey(value);
    const phone = phoneKey(value);
    const rows = known();
    if (email.includes("@")) return rows.find((row) => row.emailKey === email) || null;
    if (phone.length >= 10) return rows.find((row) => row.phoneKey === phone) || null;
    return null;
  };

  const saveAccount = (account) => {
    if (account.role === "parent") {
      const list = readJson("ft-parents", []);
      const parents = Array.isArray(list) ? list : [];
      const idx = parents.findIndex((row) => row.id === account.id || (account.phoneKey && row.phoneKey === account.phoneKey));
      if (idx >= 0) account.id = parents[idx].id;
      const row = {
        id: account.id,
        name: fullName(account),
        first: account.first || "",
        last: account.last || "",
        phone: account.phone || "",
        phoneKey: account.phoneKey || phoneKey(account.phone),
        email: account.email || "",
        emailKey: account.emailKey || emailKey(account.email),
        password: account.password || "",
        role: "parent",
        vkId: account.vkId || "",
        googleId: account.googleId || "",
        createdAt: account.createdAt || Date.now()
      };
      if (idx >= 0) parents[idx] = { ...parents[idx], ...row, id: parents[idx].id };
      else parents.push(row);
      localStorage.setItem("ft-parents", JSON.stringify(parents));
    } else {
      const prev = readJson("ft-user", {}) || {};
      localStorage.setItem("ft-user", JSON.stringify({
        ...prev,
        first: account.first || prev.first || "",
        last: account.last || prev.last || "",
        email: account.email || prev.email || "",
        phone: account.phone || prev.phone || "",
        password: account.password || prev.password || "",
        vkId: account.vkId || "",
        googleId: account.googleId || "",
        accountId: account.id,
        accountRole: "photo",
        createdAt: account.createdAt || prev.createdAt || Date.now()
      }));
    }
    const all = loadAccounts().filter((row) => row.id !== account.id);
    all.push(account);
    localStorage.setItem("ft-accounts", JSON.stringify(all));
  };

  const enter = (account) => {
    localStorage.setItem("ft-auth", JSON.stringify({ id: account.id, role: account.role }));
    if (account.role === "photo") {
      localStorage.removeItem("ft-parent-session");
      const prev = readJson("ft-user", {}) || {};
      localStorage.setItem("ft-user", JSON.stringify({
        ...prev,
        first: account.first || prev.first || "",
        last: account.last || prev.last || "",
        email: account.email || prev.email || "",
        phone: account.phone || prev.phone || "",
        password: account.password || prev.password || "",
        vkId: account.vkId || prev.vkId || "",
        googleId: account.googleId || prev.googleId || "",
        accountId: account.id,
        accountRole: "photo"
      }));
      return "cabinet.html";
    }
    localStorage.setItem("ft-parent-session", account.id);
    return "parent.html";
  };

  const providerId = (name) => {
    const all = readJson("ft-oauth-ids", {});
    const store = all && typeof all === "object" ? all : {};
    if (!store[name]) {
      store[name] = `${name}-${makeId("o")}`;
      localStorage.setItem("ft-oauth-ids", JSON.stringify(store));
    }
    return store[name];
  };

  const providerLabel = (name) => (name === "vk" ? "ВКонтакте" : "Google");

  const login = (contact, password) => {
    const phone = phoneKey(contact);
    const email = emailKey(contact);
    let found = findByContact(contact);
    const readyParent = phone === PARENT_PHONE && PARENT_PASSES.has(password);
    const readyPhoto = email === PHOTO_EMAIL && password === PHOTO_PASS;
    if (!found && readyParent) {
      found = {
        id: makeId("p"),
        role: "parent",
        name: "Щипкова Эльвира Николаевна",
        first: "Эльвира",
        last: "Щипкова",
        phone: "+79300762286",
        phoneKey: PARENT_PHONE,
        email: "",
        emailKey: "",
        password: "twz8bryw",
        createdAt: Date.now()
      };
      saveAccount(found);
    }
    if (!found && readyPhoto) {
      found = {
        id: "photo-main",
        role: "photo",
        first: "",
        last: "",
        name: "",
        email: PHOTO_EMAIL,
        emailKey: PHOTO_EMAIL,
        phone: "",
        phoneKey: "",
        password: PHOTO_PASS,
        createdAt: Date.now()
      };
      saveAccount(found);
    }
    if (!found) {
      return { ok: false, message: "Такого аккаунта нет. Зарегистрируйтесь и укажите роль: фотограф или пользователь." };
    }
    const parentOk = found.role === "parent" && (found.phoneKey === PARENT_PHONE || phone === PARENT_PHONE) && PARENT_PASSES.has(password);
    const photoOk = found.role === "photo" && emailKey(found.email) === PHOTO_EMAIL && password === PHOTO_PASS;
    if (found.password && found.password !== password && !parentOk && !photoOk) return { ok: false, message: "Неверный пароль." };
    return { ok: true, url: enter(found) };
  };

  const connect = (provider, contact) => {
    const field = provider === "vk" ? "vkId" : "googleId";
    const label = providerLabel(provider);
    const id = providerId(provider);
    const linked = known().find((row) => row[field] === id);
    if (linked) return { ok: true, url: enter(linked) };
    if (!known().length) {
      return { ok: false, message: `Сначала зарегистрируйтесь. Вход через ${label} не создаёт аккаунт.` };
    }
    const found = contact ? findByContact(contact) : null;
    if (!found) {
      return { ok: false, message: "Укажите телефон или почту уже зарегистрированного аккаунта. Новый кабинет не создаётся." };
    }
    if (found[field] && found[field] !== id) {
      return { ok: false, message: "Этот аккаунт уже привязан к другому входу. Кабинет не меняется." };
    }
    const next = { ...found, [field]: id };
    saveAccount(next);
    return { ok: true, url: enter(next) };
  };

  const register = (data) => {
    const role = data.role === "photo" ? "photo" : data.role === "parent" ? "parent" : "";
    if (!role) return { ok: false, message: "Выберите роль: фотограф или пользователь." };
    if (!data.password || String(data.password).length < 8) return { ok: false, message: "Пароль — минимум 8 символов." };
    if (data.password !== data.password2) return { ok: false, message: "Пароли не совпадают." };
    const email = emailKey(data.email);
    const phone = phoneKey(data.phone);
    if (email && !email.includes("@")) return { ok: false, message: "Проверьте почту или оставьте поле пустым." };
    if (phone.length !== 11) return { ok: false, message: "Укажите номер: 10 цифр после +7." };
    if (!data.first && !data.last) return { ok: false, message: "Укажите имя." };
    if ((email && findByContact(email)) || findByContact(data.phone)) {
      return { ok: false, message: "Этот телефон или почта уже есть. Войдите — роль не спрашиваем, кабинет останется прежним." };
    }
    const account = {
      id: makeId(role === "photo" ? "ph" : "p"),
      role,
      first: data.first,
      last: data.last,
      name: [data.first, data.last].filter(Boolean).join(" "),
      email,
      emailKey: email,
      phone: phone.length === 11 ? `+${phone}` : String(data.phone || "").trim(),
      phoneKey: phone,
      password: data.password,
      vkId: "",
      googleId: "",
      createdAt: Date.now()
    };
    saveAccount(account);
    if (role === "photo") {
      localStorage.setItem("ft-ask-card", "1");
      const ref = new URLSearchParams(location.search).get("ref");
      if (ref) {
        const user = readJson("ft-user", {}) || {};
        user.referredBy = ref;
        localStorage.setItem("ft-user", JSON.stringify(user));
        const book = readJson("ft-ref-book", { codes: {} });
        const row = book.codes[ref] || { count: 0, bonus: 0, people: [] };
        row.count += 1;
        if (email && !row.people.includes(email)) row.people.push(email);
        book.codes[ref] = row;
        localStorage.setItem("ft-ref-book", JSON.stringify(book));
      }
    }
    return { ok: true, url: enter(account) };
  };

  const show = (id, text) => {
    const node = document.getElementById(id);
    if (!node) return;
    node.hidden = !text;
    node.textContent = text || "";
  };

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const result = login(document.getElementById("login-id")?.value || "", document.getElementById("login-pass")?.value || "");
      if (!result.ok) {
        show("login-error", result.message);
        return;
      }
      location.href = result.url;
    });
    const bindProvider = (id, provider) => {
      document.getElementById(id)?.addEventListener("click", () => {
        const result = connect(provider, document.getElementById("login-id")?.value || "");
        if (!result.ok) {
          show("oauth-note", result.message);
          return;
        }
        location.href = result.url;
      });
    };
    bindProvider("via-vk", "vk");
    bindProvider("via-google", "google");
  }

  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const role = registerForm.querySelector("input[name='role']:checked")?.value || "";
      const result = register({
        role,
        first: document.getElementById("reg-first")?.value.trim() || "",
        last: document.getElementById("reg-last")?.value.trim() || "",
        email: document.getElementById("reg-email")?.value.trim() || "",
        phone: window.ftPhone ? window.ftPhone.read(document.getElementById("reg-phone")) : (document.getElementById("reg-phone")?.value.trim() || ""),
        password: registerForm.querySelector("[name='password']")?.value || "",
        password2: registerForm.querySelector("[name='password2']")?.value || ""
      });
      if (!result.ok) {
        show("reg-error", result.message);
        return;
      }
      location.href = result.url;
    });
  }

  window.ftAuth = { phoneKey, findByContact, enter, login, connect, register };
})();
