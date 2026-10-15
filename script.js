(function () {
  const parseConfig = (raw) => {
    const config = {};
    raw.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const divider = trimmed.indexOf('=');
      if (divider < 0) return;
      const key = trimmed.slice(0, divider).trim();
      const value = trimmed.slice(divider + 1).trim();
      if (key) config[key] = value;
    });
    return config;
  };

  async function loadSiteConfig() {
    try {
      // Serve the folder over localhost or a web host so the browser can fetch this TXT file.
      const response = await fetch('site-config.txt', { cache: 'no-cache' });
      if (!response.ok) throw new Error('site-config.txt could not be loaded');
      const config = parseConfig(await response.text());

      document.querySelectorAll('[data-config-src]').forEach((element) => {
        const value = config[element.dataset.configSrc];
        if (value) element.setAttribute('src', value);
      });
      document.querySelectorAll('[data-config-href]').forEach((element) => {
        const value = config[element.dataset.configHref];
        if (value) element.setAttribute('href', value);
      });
      document.querySelectorAll('[data-config-text]').forEach((element) => {
        const value = config[element.dataset.configText];
        if (value) element.textContent = value;
      });
      if (config.hero_background) {
        document.documentElement.style.setProperty('--hero-image', `url("${config.hero_background.replace(/"/g, '\\"')}")`);
      }
      if (config.phone_link) {
        document.querySelectorAll('a[data-config-href="phone_link"]').forEach((el) => {
          el.href = config.phone_link.startsWith('tel:') ? config.phone_link : `tel:${config.phone_link.replace(/\s+/g, '')}`;
        });
      }
      if (config.email_link) {
        document.querySelectorAll('a[data-config-href="email_link"]').forEach((el) => {
          el.href = config.email_link.startsWith('mailto:') ? config.email_link : `mailto:${config.email_link}`;
        });
      }
    } catch (error) {
      // Defaults in index.html and style.css keep the site usable when opened directly as a file.
      console.info('Using website defaults. To read site-config.txt, run the site on a local server.', error.message);
    }
  }

  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'إغلاق القائمة' : 'فتح القائمة');
    });
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const track = document.getElementById('portfolio-track');
  document.querySelector('.slider-next')?.addEventListener('click', () => {
    if (track) track.scrollBy({ left: -Math.max(220, track.clientWidth * 0.7), behavior: 'smooth' });
  });
  document.querySelector('.slider-prev')?.addEventListener('click', () => {
    if (track) track.scrollBy({ left: Math.max(220, track.clientWidth * 0.7), behavior: 'smooth' });
  });

  // Update the header's active-section underline while moving through the page.
  const sections = ['home', 'about', 'services', 'work', 'contact']
    .map((id) => document.getElementById(id)).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        document.querySelectorAll('.nav-link').forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: '-25% 0px -60% 0px' });
    sections.forEach((section) => observer.observe(section));
  }

  loadSiteConfig();
})();
