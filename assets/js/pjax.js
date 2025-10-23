// assets/js/pjax.js
(function () {
  const containerSelector = "#main";
  const container = document.querySelector(containerSelector);
  if (!container) return;

  async function loadPage(url, pushToHistory = true) {
    try {
      container.classList.add("loading");
      const res = await fetch(url, { headers: { "X-PJAX": "true" } });
      if (!res.ok) throw new Error(res.statusText);

      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const newContent = doc.querySelector(containerSelector);
      const newTitle = doc.querySelector("title")?.innerText;
      const newDesc = doc
        .querySelector('meta[name="description"]')
        ?.getAttribute("content");

      if (newContent) {
        container.innerHTML = newContent.innerHTML;
        document.title = newTitle || document.title;
        if (newDesc) {
          let meta = document.querySelector('meta[name="description"]');
          if (!meta) {
            meta = document.createElement("meta");
            meta.name = "description";
            document.head.appendChild(meta);
          }
          meta.setAttribute("content", newDesc);
        }

        if (pushToHistory) history.pushState({ url }, "", url);
        container.classList.remove("loading");
        container.focus();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        window.location.href = url; // fallback
      }
    } catch (err) {
      console.error("PJAX load failed:", err);
      window.location.href = url;
    }
  }

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[data-pjax]");
    if (!link) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const href = link.getAttribute("href");
    loadPage(href);
  });

  window.addEventListener("popstate", (e) => {
    const url = e.state && e.state.url ? e.state.url : location.pathname;
    loadPage(url, false);
  });

  // Initialize current state
  history.replaceState(
    { url: location.pathname },
    document.title,
    location.href
  );
})();
