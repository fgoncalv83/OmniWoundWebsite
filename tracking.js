/**
 * OmniWound Tracking Utilities
 * Include on omniwound.net pages for page visit tracking, conversion events, and GA4 integration.
 *
 * Usage:
 * <script src="/tracking.js"></script>
 *
 * Features:
 * - Anonymous visitor tracking via visitor_id cookie
 * - Page visit recording (works with or without lead_id)
 * - Conversion event tracking (form_submit, demo_booked, trial_started, asset_downloaded, qr_scanned)
 * - GA4 event forwarding
 * - UTM parameter extraction from URL
 */
(function () {
  'use strict';

  var API_BASE = 'https://salesapp.simplichart.com';

  // --- Visitor ID (anonymous tracking cookie) ---
  function getVisitorId() {
    var cookieName = 'ow_vid';
    var match = document.cookie.match(new RegExp('(?:^|; )' + cookieName + '=([^;]*)'));
    if (match) return decodeURIComponent(match[1]);

    var vid = 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10);
    var expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = cookieName + '=' + encodeURIComponent(vid) + '; expires=' + expires + '; path=/; SameSite=Lax';
    return vid;
  }

  // --- First-touch referrer capture ---
  // On every page load, if we arrived from an external domain and haven't
  // already stored a referrer this session, save the hostname to sessionStorage.
  // This gives us attribution for organic/dark-social traffic with no UTMs.
  (function () {
    try {
      if (document.referrer && !sessionStorage.getItem('ow_referrer')) {
        var refHost = new URL(document.referrer).hostname;
        var curHost = window.location.hostname;
        if (refHost && refHost !== curHost) {
          sessionStorage.setItem('ow_referrer', refHost);
        }
      }
    } catch (e) {}
  })();

  // --- UTM Parameter Extraction ---
  // UTMs are read from the URL on first touch and persisted to sessionStorage
  // so they carry forward across page navigations within the same session.
  // When no UTMs are present, the first-touch external referrer is returned
  // as a fallback so form submissions still carry some attribution signal.
  function getUTMParams() {
    var params = new URLSearchParams(window.location.search);
    var fromUrl = {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
      utm_content: params.get('utm_content') || undefined,
    };
    if (fromUrl.utm_source) {
      try { sessionStorage.setItem('ow_utms', JSON.stringify(fromUrl)); } catch(e) {}
      return fromUrl;
    }
    try {
      var stored = sessionStorage.getItem('ow_utms');
      if (stored) return JSON.parse(stored);
    } catch(e) {}
    // No UTMs this session — attach first-touch referrer as fallback
    try {
      var ref = sessionStorage.getItem('ow_referrer');
      if (ref) fromUrl.referrer = ref;
    } catch(e) {}
    return fromUrl;
  }

  // --- Get lead_id from URL (for email links and direct mail attribution) ---
  function getLeadId() {
    var params = new URLSearchParams(window.location.search);
    return params.get('utm_lead_id') || params.get('lead_id') || undefined;
  }

  // --- Track Page Visit ---
  function trackPageVisit(overrides) {
    var utmParams = getUTMParams();
    var data = {
      lead_id: getLeadId(),
      visitor_id: getVisitorId(),
      page_url: window.location.pathname + window.location.search,
      referrer: document.referrer || undefined,
      utm_source: utmParams.utm_source,
      utm_medium: utmParams.utm_medium,
      utm_campaign: utmParams.utm_campaign,
      utm_content: utmParams.utm_content,
    };

    if (overrides) {
      for (var key in overrides) {
        if (overrides.hasOwnProperty(key)) data[key] = overrides[key];
      }
    }

    fetch(API_BASE + '/api/track/page-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(function () {});
  }

  // --- Track Conversion Event ---
  function trackConversion(eventType, eventData) {
    var utmParams = getUTMParams();
    var data = {
      event_type: eventType,
      lead_id: getLeadId(),
      visitor_id: getVisitorId(),
      utm_source: utmParams.utm_source,
      utm_medium: utmParams.utm_medium,
      utm_campaign: utmParams.utm_campaign,
      event_data: eventData || undefined,
    };

    fetch(API_BASE + '/api/track/conversion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(function () {});

    fireGA4Event('conversion_' + eventType, {
      event_category: 'conversion',
      event_label: eventType,
      utm_source: utmParams.utm_source,
      utm_campaign: utmParams.utm_campaign,
    });
  }

  // --- GA4 Event Helper ---
  function fireGA4Event(eventName, params) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params || {});
    }
  }

  // --- Expose API globally ---
  window.OmniTrack = {
    getVisitorId: getVisitorId,
    getUTMParams: getUTMParams,
    getLeadId: getLeadId,
    trackPageVisit: trackPageVisit,
    trackConversion: trackConversion,
    fireGA4Event: fireGA4Event,
  };

  // --- Auto-track page visit on load ---
  trackPageVisit();
})();
