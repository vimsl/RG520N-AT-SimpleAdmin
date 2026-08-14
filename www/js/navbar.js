// CPE Pro Navbar - exact copy of new version dashboard navbar
(function() {
  var DARK_KEY = 'cpe_dashboard_dark';
  var LANG_KEY = 'cpe_dashboard_lang';

  function getActivePage() {
    var path = window.location.pathname;
    if (path.includes('new/')) return 'overview';
    if (path === '/' || path === '/index.html') return 'origOverview';
    if (path.includes('network.html')) return 'netLock';
    if (path.includes('settings.html')) return 'advSettings';
    if (path.includes('sms.html')) return 'sms';
    if (path.includes('deviceinfo.html')) return 'devInfo';
    if (path.includes('firmware.html')) return 'firmware';
    if (path.includes('fan.html')) return 'fan';
    return 'origOverview';
  }

  function getLang() { return localStorage.getItem(LANG_KEY) || 'zh'; }
  function getDark() {
    var v = localStorage.getItem(DARK_KEY);
    if (v === null) return window.matchMedia('(prefers-color-scheme: dark)').matches;
    return v === 'true';
  }

  function applyTheme(d) {
    var html = document.documentElement;
    if (d) {
      html.classList.add('dark');
      html.setAttribute('data-bs-theme', 'dark');
    } else {
      html.classList.remove('dark');
      html.setAttribute('data-bs-theme', 'light');
    }
  }

  function doToggleDark() {
    var next = !getDark();
    localStorage.setItem(DARK_KEY, String(next));
    applyTheme(next);
    updateNavbarIcons();
  }

  function doToggleLang() {
    var next = getLang() === 'zh' ? 'en' : 'zh';
    localStorage.setItem(LANG_KEY, next);
    location.reload();
  }

  var LANG_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>';
  var MOON_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
  var SUN_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>';

  function updateNavbarIcons() {
    var isDark = getDark();
    var lang = getLang();
    var themeBtn = document.getElementById('cpe-theme-btn');
    var langCode = document.getElementById('cpe-lang-code');
    if (themeBtn) {
      themeBtn.innerHTML = isDark ? SUN_ICON : MOON_ICON;
      themeBtn.title = isDark ? '切换白天模式' : '切换暗黑模式';
    }
    if (langCode) {
      langCode.textContent = lang === 'zh' ? 'zh' : 'en';
    }
  }

  function buildNavbar() {
    var lang = getLang();
    var isDark = getDark();
    var active = getActivePage();

    var dict = {
      zh: { brand: 'CPE Pro', sub: '', overview: '新版首页', origOverview: '首页', netLock: '网络', advSettings: '设置', sms: '短信', devInfo: '设备信息', firmware: '固件管理', fan: '风扇管理' },
      en: { brand: 'CPE Pro', sub: '', overview: 'Overview', origOverview: 'Original UI', netLock: 'Net Lock', advSettings: 'Advanced', sms: 'SMS', devInfo: 'Device Info', firmware: 'Firmware', fan: 'Fan Control' }
    }[lang];

    var items = [
      { key: 'overview', href: 'new/index.html' },
      { key: 'origOverview', href: '/' },
      { key: 'netLock', href: '/network.html' },
      { key: 'advSettings', href: '/settings.html' },
      { key: 'sms', href: '/sms.html' },
      { key: 'devInfo', href: '/deviceinfo.html' },
      { key: 'firmware', href: '/firmware.html' },
      { key: 'fan', href: '/fan.html' }
    ];

    var navLinks = items.map(function(item) {
      var isActive = active === item.key;
      var cls = isActive ? 'cpe-nav-item cpe-nav-active' : 'cpe-nav-item';
      return '<a href="' + item.href + '" class="' + cls + '">' + dict[item.key] + '</a>';
    }).join('');

    return '' +
      '<nav class="cpe-nav">' +
      '  <div class="cpe-nav-container">' +
      '    <div class="cpe-nav-left">' +
      '      ' +
      '    </div>' +
      '    <div class="cpe-nav-links">' + navLinks + '</div>' +
      '    <div class="cpe-nav-right">' +
      '      <button class="cpe-nav-icon-btn" id="cpe-lang-btn" onclick="window.__cpeToggleLang()" title="Switch Language">' + LANG_ICON + '<span class="cpe-nav-lang-code" id="cpe-lang-code">' + (lang === 'zh' ? 'zh' : 'en') + '</span></button>' +
      '      <button class="cpe-nav-icon-btn" id="cpe-theme-btn" onclick="window.__cpeToggleDark()" title="' + (isDark ? 'Light mode' : 'Dark mode') + '">' + (isDark ? SUN_ICON : MOON_ICON) + '</button>' +
      '    </div>' +
      '  </div>' +
      '</nav>';
  }

  // Expose toggle functions globally so onclick works
  window.__cpeToggleDark = doToggleDark;
  window.__cpeToggleLang = doToggleLang;

  function injectNavbar() {
    applyTheme(getDark());
    var navbar = document.createElement('div');
    navbar.id = 'cpe-navbar';
    navbar.innerHTML = buildNavbar();
    document.body.insertBefore(navbar, document.body.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNavbar);
  } else {
    injectNavbar();
  }

  // Cross-tab sync
  window.addEventListener('storage', function(e) {
    if (e.key === DARK_KEY) {
      applyTheme(e.newValue === 'true');
      updateNavbarIcons();
    }
    if (e.key === LANG_KEY) location.reload();
  });
})();