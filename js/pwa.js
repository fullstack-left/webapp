// AvtoSmart — service-worker lifecycle, offline state and safe update flow.
(() => {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") return;

  const updateBanner = document.getElementById("update-banner");
  const updateButton = document.getElementById("apply-update");
  let refreshing = false;
  let waitingWorker = null;

  function hasActiveSession() {
    try {
      return Boolean(JSON.parse(localStorage.getItem("avtosmart:v2"))?.activeSession);
    } catch {
      return false;
    }
  }

  function revealWaitingUpdate() {
    if (updateBanner) updateBanner.hidden = !waitingWorker || hasActiveSession();
  }

  function showUpdate(worker) {
    waitingWorker = worker;
    revealWaitingUpdate();
  }

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("./sw.js", { scope: "./" });

      if (registration.waiting) showUpdate(registration.waiting);
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) showUpdate(worker);
        });
      });

      // Check for a newer shell without blocking first paint.
      window.setTimeout(() => registration.update().catch(() => {}), 4000);
    } catch (error) {
      console.warn("AvtoSmart offline mode could not be registered", error);
    }
  });

  updateButton?.addEventListener("click", () => {
    if (hasActiveSession()) return;
    waitingWorker?.postMessage({ type: "SKIP_WAITING" });
  });

  window.addEventListener("avtosmart:state-change", revealWaitingUpdate);
  window.addEventListener("storage", revealWaitingUpdate);

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    location.reload();
  });
})();
