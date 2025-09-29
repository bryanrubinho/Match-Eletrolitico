document.addEventListener('DOMContentLoaded', () => {
  // elementos DOM
  const grid = document.querySelector('.grid');
  const mask = document.querySelector('.mask');
  const input1 = document.querySelector('.player1');
  const input2 = document.querySelector('.player2');
  const startBtn = document.querySelector('.startBtn');
  const player1El = document.getElementById('player1');
  const player2El = document.getElementById('player2');
  const vezEl = document.getElementById('vez');
  const turnIndicator = document.querySelector('.turn-indicator');

  // popups
  const popupPar = document.getElementById('popupPar');
  const popupParContent = popupPar.querySelector('.popup-content');
  const popupParBody = popupParContent.querySelector('.popup-body');
  const popupParClose = popupParContent.querySelector('.close-btn');

  const popupFinal = document.getElementById('popupFinal');
  const popupFinalContent = popupFinal.querySelector('.popup-content');
  const popupFinalClose = popupFinalContent.querySelector('.close-btn');
  const winnerTextEl = popupFinal.querySelector('#winner-text');
  const playAgainBtn = popupFinalContent.querySelector('.play-again');
  const creditsBtn = popupFinalContent.querySelector('.credits');

  // pares
  const pares = [
    { base: 'calcio', matches: ['calciocont1', 'calciocont2'] },
    { base: 'cloro', matches: ['clorocont1', 'clorocont2'] },
    { base: 'fosforo', matches: ['fosforocont1', 'fosforocont2'] },
    { base: 'magnesio', matches: ['magnesiocont1', 'magnesiocont2'] },
    { base: 'potasio', matches: ['potasiocont1', 'potasiocont2'] },
    { base: 'sodio', matches: ['sodiocont1', 'sodiocont2'] },
  ];

  const fluxogramas = {
    calcio_calciocont1: 'fluxocalcio',
    calcio_calciocont2: 'fluxocalcio2',
    cloro_clorocont1: 'fluxocloro',
    cloro_clorocont2: 'fluxocloro2',
    fosforo_fosforocont1: 'fluxofosforo',
    fosforo_fosforocont2: 'fluxofosforo2',
    magnesio_magnesiocont1: 'fluxomagnesio',
    magnesio_magnesiocont2: 'fluxomagnesio2',
    potasio_potasiocont1: 'fluxopotassio',
    potasio_potasiocont2: 'fluxopotassio2',
    sodio_sodiocont1: 'fluxosodio',
    sodio_sodiocont2: 'fluxosodio2',
  };

  const conteudos = [];
  pares.forEach(p => {
    conteudos.push(p.base, p.base, p.matches[0], p.matches[1]);
  });

  // estado do jogo
  let players = [];
  let scores = {};
  let currentPlayer = 0;
  let firstCard = null;
  let secondCard = null;

  /* ------------ utilitários ------------ */
  function apenasLetras(str) {
    return /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(str.trim());
  }

  function validarInputs() {
    const n1 = input1.value.trim();
    const n2 = input2.value.trim();
    startBtn.disabled = !(n1 && n2 && n1 !== n2 && apenasLetras(n1) && apenasLetras(n2));
  }
  input1.addEventListener('input', validarInputs);
  input2.addEventListener('input', validarInputs);

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function createCard(conteudo) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.conteudo = conteudo;

    const front = document.createElement('div');
    front.className = 'face front';
    front.style.backgroundImage = `url('./assets/imagens/${conteudo}.png')`;

    const back = document.createElement('div');
    back.className = 'face back';

    card.appendChild(front);
    card.appendChild(back);
    card.addEventListener('click', () => onCardClick(card));
    return card;
  }

  function loadGame() {
    grid.innerHTML = '';
    const baralho = shuffle(conteudos);
    baralho.forEach(item => grid.appendChild(createCard(item)));
  }

  function isPair(c1, c2) {
    if (c1 === c2) return false;
    return pares.some(p =>
      (c1 === p.base && p.matches.includes(c2)) ||
      (c2 === p.base && p.matches.includes(c1))
    );
  }

  /* ------------ lógica de clique / combinação ------------ */
  function onCardClick(card) {
    if (popupPar.classList.contains('active') || popupFinal.classList.contains('active')) return;
    if (card.classList.contains('reveal-card') || card.classList.contains('matched')) return;
    if (secondCard) return;

    card.classList.add('reveal-card');

    if (!firstCard) {
      firstCard = card;
      return;
    }

    secondCard = card;
    checkMatch();
  }

  function mostrarPopupPar(conteudoNome, fluxogramaNome) {
    popupParBody.innerHTML = `
      <img class="card-popup" src="./assets/imagens/${conteudoNome}.png" alt="${conteudoNome}">
      <img class="card-popup" src="./assets/fluxogramas/${fluxogramaNome}.png" alt="${fluxogramaNome}">
    `;
    popupPar.classList.add('active');
  }

  function checkMatch() {
    const c1 = firstCard.dataset.conteudo;
    const c2 = secondCard.dataset.conteudo;

    if (isPair(c1, c2)) {
      firstCard.classList.add('matched');
      secondCard.classList.add('matched');

      const nomeAtual = players[currentPlayer];
      scores[nomeAtual] = (scores[nomeAtual] || 0) + 10;
      updateScoreboard();

      const conteudo = c1.includes('cont') ? c1 : c2;
      const base = c1.includes('cont') ? c2 : c1;
      const fluxKey = `${base}_${conteudo}`;
      const fluxograma = fluxogramas[fluxKey] || fluxogramas[`${conteudo}_${base}`] || 'fluxograma_padrao';

      mostrarPopupPar(conteudo, fluxograma);

      firstCard = null;
      secondCard = null;
    } else {
      setTimeout(() => {
        firstCard.classList.remove('reveal-card');
        secondCard.classList.remove('reveal-card');
        firstCard = null;
        secondCard = null;
        currentPlayer = 1 - currentPlayer;
        updateScoreboard();
      }, 800);
    }
  }

  function updateScoreboard() {
    if (players[0]) player1El.textContent = `${players[0]}: ${scores[players[0]] || 0}`;
    if (players[1]) player2El.textContent = `${players[1]}: ${scores[players[1]] || 0}`;
    if (vezEl && players.length === 2) vezEl.textContent = `Vez de: ${players[currentPlayer]}`;
  }

  /* ------------ popup final ------------ */
  function mostrarPopupFinal() {
    const p1 = scores[players[0]] || 0;
    const p2 = scores[players[1]] || 0;
    let texto = '';
    if (p1 > p2) texto = `${players[0]} venceu com ${p1} pontos!`;
    else if (p2 > p1) texto = `${players[1]} venceu com ${p2} pontos!`;
    else texto = `Empate! Ambos com ${p1} pontos!`;

    if (winnerTextEl) winnerTextEl.textContent = texto;
    popupFinal.classList.add('active');
  }

  function checkEndGame() {
    const matchedCount = grid.querySelectorAll('.matched').length;
    if (matchedCount === conteudos.length) {
      // só mostra o popup final quando o popupPar for fechado
      const esperarFecharPopup = () => {
        if (!popupPar.classList.contains('active')) {
          setTimeout(() => mostrarPopupFinal(), 300);
          document.removeEventListener('click', esperarFecharPopup);
        }
      };

      // escuta quando popupPar for fechado
      document.addEventListener('click', esperarFecharPopup);
    }
  }

  /* ------------ listeners ------------ */
  if (popupParClose) popupParClose.addEventListener('click', () => {
    popupPar.classList.remove('active');
    checkEndGame();
  });

  popupPar.addEventListener('click', e => {
    if (e.target === popupPar) {
      popupPar.classList.remove('active');
      checkEndGame();
    }
  });

  if (popupFinalClose) popupFinalClose.addEventListener('click', () => popupFinal.classList.remove('active'));

  popupFinal.addEventListener('click', e => {
    if (e.target === popupFinal) popupFinal.classList.remove('active');
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (popupPar.classList.contains('active')) {
        popupPar.classList.remove('active');
        checkEndGame();
      }
      popupFinal.classList.remove('active');
    }
  });

  if (playAgainBtn) playAgainBtn.addEventListener('click', () => location.reload());
  if (creditsBtn) {
    creditsBtn.addEventListener('click', () => {
      window.location.href = 'creditos.html';
    });
  }

  startBtn.addEventListener('click', () => {
    const n1 = input1.value.trim() || 'Jogador 1';
    const n2 = input2.value.trim() || 'Jogador 2';
    players = [n1, n2];
    scores = { [n1]: 0, [n2]: 0 };
    currentPlayer = 0;
    firstCard = null;
    secondCard = null;

    if (mask) mask.style.display = 'none';
    if (turnIndicator) turnIndicator.style.display = 'block';
    if (grid) grid.style.display = 'grid';

    updateScoreboard();
    loadGame();
  });

  // teste rápido
  window.testarPopup = function() {
    mostrarPopupPar('clorocont1', 'fluxocloro');
  };
  window.testarPopupFinal = function() {
    scores[players[0]] = 10;
    scores[players[1]] = 5;
    mostrarPopupFinal();
  };

  validarInputs();
});
