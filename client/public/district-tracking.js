/* Phase 4+/G8: district-page attribution and booking deep links.
   Disabled by default; activated only when /api/public/bootstrap reports
   features.district_pages=true (DISTRICT_PAGES_ENABLED). */
(function () {
  "use strict";

  var GA4_ID = "G-49QW3MXBKP";
  var ADS_ID = "AW-18455265689";
  var DISTRICTS = {
    arid: true,
    gharnatah: true,
    hamra: true,
    hittin: true,
    ishbiliyah: true,
    malqa: true,
    munsiyah: true,
    nadwah: true,
    nafl: true,
    "nakhba-qurtubah": true,
    narjis: true,
    qirawan: true,
    qurtubah: true,
    sahafa: true,
    shuhada: true,
    wadi: true,
    yarmouk: true,
    yasmin: true,
  };
  var ATTRIBUTION_KEYS = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "gclid",
    "gbraid",
    "wbraid",
  ];

  var file = (window.location.pathname.split("/").pop() || "").toLowerCase();
  var district = file
    .replace(/^vet-clinic-/, "")
    .replace(/\.html$/, "")
    .replace(/-riyadh$/, "");
  if (!DISTRICTS[district]) return;
  document.documentElement.setAttribute("data-district-page", district);
  document.documentElement.setAttribute("data-district-pages", "loading");

  function loadGtag() {
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function () {
        window.dataLayer.push(arguments);
      };
    window.gtag("js", new Date());
    window.gtag("config", GA4_ID, { send_page_view: false });
    window.gtag("config", ADS_ID);

    var script = document.createElement("script");
    script.async = true;
    script.src =
      "https://www.googletagmanager.com/gtag/js?id=" +
      encodeURIComponent(GA4_ID);
    document.head.appendChild(script);
  }

  function track(eventName, params) {
    try {
      if (window.gtag) window.gtag("event", eventName, params || {});
    } catch {
      // Analytics must never block navigation or booking.
    }
  }

  function bookingUrl() {
    var target = new URL("/hub/elite", window.location.origin);
    var current = new URLSearchParams(window.location.search);
    target.searchParams.set("district", district);
    ATTRIBUTION_KEYS.forEach(function (key) {
      var value = current.get(key);
      if (value) target.searchParams.set(key, value.slice(0, 200));
    });
    return target;
  }

  function activate() {
    document.documentElement.setAttribute("data-district-pages", "enabled");
    loadGtag();

    track("page_view", {
      page_path: window.location.pathname,
      page_location: window.location.href,
      page_title: document.title,
      district: district,
      district_page: true,
    });

    var target = bookingUrl().toString();
    document.querySelectorAll('a[href*="/book-now"]').forEach(function (link) {
      link.setAttribute("href", target);
      link.setAttribute("data-district-booking-link", district);
      link.addEventListener(
        "click",
        function () {
          track("district_booking_click", {
            brand: "elite",
            district: district,
            link_url: target,
            transport_type: "beacon",
          });
        },
        { passive: true },
      );
    });

    document
      .querySelectorAll('a[href^="tel:"], a[href*="wa.me/"]')
      .forEach(function (link) {
        var method = link.href.indexOf("tel:") === 0 ? "phone" : "whatsapp";
        link.addEventListener(
          "click",
          function () {
            track("district_contact_click", {
              brand: "elite",
              district: district,
              method: method,
              transport_type: "beacon",
            });
          },
          { passive: true },
        );
      });
  }

  fetch("/api/public/bootstrap", {
    cache: "no-store",
    credentials: "same-origin",
  })
    .then(function (response) {
      return response.ok ? response.json() : null;
    })
    .then(function (bootstrap) {
      if (
        bootstrap &&
        bootstrap.features &&
        bootstrap.features.district_pages === true
      ) {
        activate();
      } else {
        document.documentElement.setAttribute(
          "data-district-pages",
          "disabled",
        );
      }
    })
    .catch(function () {
      document.documentElement.setAttribute("data-district-pages", "fallback");
      // Rollback-safe: when the flag cannot be read, links remain on /book-now.
    });
})();
