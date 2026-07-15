// js/auth.js – mock client-side authentication (prototype only)
// Uses localStorage key 'loggedIn' = 'true' / absent

(function () {
  /* ── Core helpers ──────────────────────────────────────── */

  function isLoggedIn() {
    // Hack for file:// protocol local storage isolation:
    // If the URL passes the login state, we sync it to this file's localStorage
    if (window.location.search.includes('logged=1')) {
      localStorage.setItem('loggedIn', 'true');
    } else if (window.location.search.includes('logged=0')) {
      localStorage.removeItem('loggedIn');
    }
    return localStorage.getItem('loggedIn') === 'true';
  }

  function login(email) {
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('userEmail', email || '');
  }

  function logout() {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('userEmail');
    // Propagate logout state via URL to bypass file:// isolation
    window.location.replace('index.html?logged=0');
  }

  /* ── Navigation update ─────────────────────────────────── */

  function updateNav() {
    var navLogin      = document.getElementById('nav-login');
    var navLogout     = document.getElementById('nav-logout');
    var navOcorrencia = document.getElementById('nav-ocorrencia');
    var logged = isLoggedIn();

    if (navLogin)      navLogin.style.display      = logged ? 'none'         : 'inline-block';
    if (navLogout)     navLogout.style.display     = logged ? 'inline-block' : 'none';
    if (navOcorrencia) navOcorrencia.style.display = logged ? 'inline-block' : 'none';
  }

  /* ── Page guard (protected pages only) ────────────────── */

  function requireLogin() {
    if (!isLoggedIn()) {
      window.location.replace('login.html?logged=0');
    }
  }

  /* ── Wire logout button + update nav on every page load ── */

  document.addEventListener('DOMContentLoaded', function () {
    // 1. Update navigation visuals
    updateNav();

    // 2. Wire logout functionality
    var logoutBtn = document.getElementById('nav-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        logout();
      });
    }

    // 3. Hack to propagate auth state across files when opened locally via file://
    if (window.location.protocol === 'file:') {
      document.body.addEventListener('click', function(e) {
        var a = e.target.closest('a');
        // Intercept internal link clicks
        if (a && a.href && a.href.startsWith('file://') && !a.getAttribute('href').startsWith('#')) {
          if (a.id === 'nav-logout') return; // handled above
          
          var isLogged = isLoggedIn();
          var param = isLogged ? 'logged=1' : 'logged=0';
          
          if (!a.href.includes(param)) {
            e.preventDefault();
            // Remove any old logged param if present
            var cleanHref = a.href.replace(/([&?])logged=[01]/, '');
            var sep = cleanHref.includes('?') ? '&' : '?';
            window.location.href = cleanHref + sep + param;
          }
        }
      });
    }

  });

  /* ── Expose to global scope ────────────────────────────── */
  window.isLoggedIn   = isLoggedIn;
  window.login        = login;
  window.logout       = logout;
  window.updateNav    = updateNav;
  window.requireLogin = requireLogin;

}());
