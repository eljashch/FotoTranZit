(() => {
  const national = (value) => {
    let digits = String(value || "").replace(/\D/g, "");
    if (digits.startsWith("8") && digits.length >= 11) digits = `7${digits.slice(1)}`;
    if (digits.startsWith("7")) digits = digits.slice(1);
    return digits.slice(0, 10);
  };
  const full = (value) => {
    const rest = national(value);
    return rest ? `+7${rest}` : "+7";
  };
  const ready = (value) => national(value).length === 10;
  const refresh = (input) => {
    if (!input) return;
    const next = national(input.value);
    if (input.value !== next) input.value = next;
  };
  const mount = (input) => {
    if (!input || input.dataset.phoneReady === "1") {
      refresh(input);
      return input;
    }
    input.dataset.phoneReady = "1";
    input.type = "tel";
    input.inputMode = "numeric";
    input.maxLength = 10;
    input.placeholder = "900 123-45-67";
    if (!input.autocomplete) input.autocomplete = "tel";
    const wrap = document.createElement("span");
    wrap.className = "phone-field";
    const prefix = document.createElement("span");
    prefix.className = "phone-prefix";
    prefix.textContent = "+7";
    input.parentNode.insertBefore(wrap, input);
    wrap.append(prefix, input);
    input.addEventListener("input", () => refresh(input));
    input.addEventListener("blur", () => refresh(input));
    refresh(input);
    return input;
  };
  const read = (input) => full(input && input.value);
  const mountAll = () => {
    document.querySelectorAll("#reg-phone, #join-phone, #pf-phone, #consent-phone, input[type='tel']").forEach((input) => mount(input));
  };
  window.ftPhone = { national, full, ready, refresh, mount, read, mountAll, note: "Укажите номер: 10 цифр после +7." };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountAll);
  else mountAll();
})();
