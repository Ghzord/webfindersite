(function () {
  // ==========================================================================
  // CONTROLE EXCLUSIVO DE ZOOM VIA MENU (PADRÃO 80% E SINCRONIZADO ENTRE ABAS)
  // ==========================================================================
  var zoomPadrao = '80%';
  var zoomSalvo = localStorage.getItem('webfinder-zoom') || zoomPadrao;

  // Canal para comunicação instantânea entre abas
  var canalZoom = null;
  try {
    if ('BroadcastChannel' in window) {
      canalZoom = new BroadcastChannel('webfinder_zoom_sync');
      canalZoom.onmessage = function (ev) {
        if (ev.data) {
          aplicarZoom(ev.data, false);
        }
      };
    }
  } catch (e) {
    console.warn(e);
  }

  function aplicarZoom(nivel, propagar) {
    document.body.style.zoom = nivel;

    // Atualiza o select da aba atual
    var selects = document.querySelectorAll('#zoom-select');
    selects.forEach(function (sel) {
      sel.value = nivel;
    });

    if (propagar !== false) {
      localStorage.setItem('webfinder-zoom', nivel);
      if (canalZoom) {
        canalZoom.postMessage(nivel);
      }
    }
  }

  // Aplica o valor salvo (ou 80%) assim que a página abre
  aplicarZoom(zoomSalvo, false);

  // Modificação manual feita através do menu <select>
  document.addEventListener('change', function (e) {
    if (e.target && e.target.id === 'zoom-select') {
      aplicarZoom(e.target.value, true);
    }
  });

  // Sincroniza abas que estejam em segundo plano ou caso o BroadcastChannel oscile
  window.addEventListener('storage', function (e) {
    if (e.key === 'webfinder-zoom' && e.newValue) {
      aplicarZoom(e.newValue, false);
    }
  });

  // Bloqueia o zoom nativo via teclado (Ctrl +, Ctrl -, Ctrl 0) para forçar o uso do menu
  window.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey) {
      if (
        e.key === '+' || e.key === '=' || e.key === 'Add' || e.code === 'NumpadAdd' ||
        e.key === '-' || e.key === '_' || e.key === 'Subtract' || e.code === 'NumpadSubtract' ||
        e.key === '0' || e.code === 'Digit0' || e.code === 'Numpad0'
      ) {
        e.preventDefault();
      }
    }
  }, { passive: false });

  // Bloqueia o zoom nativo via Ctrl + Roda do Mouse
  window.addEventListener('wheel', function (e) {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
    }
  }, { passive: false });

  // ==========================================================================
  // MENU HAMBÚRGUER
  // ==========================================================================
  var toggle = document.getElementById('menu-toggle');
  var menu = document.getElementById('nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.classList.toggle('active', open);
      toggle.setAttribute('aria-expanded', open);
    });
  }

  // ==========================================================================
  // CARROSSEL
  // ==========================================================================
  var car = document.getElementById('carousel');
  if (car) {
    var track = car.querySelector('.carousel-track');
    var slides = car.querySelectorAll('.carousel-slide');
    var dotsBox = car.querySelector('.carousel-dots');
    var i = 0, timer, startX = null;

    slides.forEach(function (_, n) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Ir para o slide ' + (n + 1));
      b.addEventListener('click', function () { go(n, true); });
      dotsBox.appendChild(b);
    });

    function go(n, user) {
      i = (n + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + i * 100 + '%)';
      dotsBox.querySelectorAll('button').forEach(function (d, k) { d.classList.toggle('active', k === i); });
      if (user) restart();
    }

    function restart() {
      clearInterval(timer);
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        timer = setInterval(function () { go(i + 1); }, 6000);
      }
    }

    var prevBtn = car.querySelector('.prev');
    var nextBtn = car.querySelector('.next');
    if (prevBtn) prevBtn.addEventListener('click', function () { go(i - 1, true); });
    if (nextBtn) nextBtn.addEventListener('click', function () { go(i + 1, true); });

    car.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') go(i - 1, true);
      if (e.key === 'ArrowRight') go(i + 1, true);
    });

    car.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    car.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1), true);
      startX = null;
    });

    car.addEventListener('mouseenter', function () { clearInterval(timer); });
    car.addEventListener('mouseleave', restart);

    go(0);
    restart();
  }

  // ==========================================================================
  // FLASHCARDS INTERATIVOS 3D
  // ==========================================================================
  var flashcards = document.querySelectorAll('.flashcard');
  flashcards.forEach(function (card) {
    card.addEventListener('click', function () {
      card.classList.toggle('flipped');
    });

    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('flipped');
      }
    });
  });

  // ==========================================================================
  // VLIBRAS
  // ==========================================================================
  if (window.VLibras) new window.VLibras.Widget('https://vlibras.gov.br/app');
})();