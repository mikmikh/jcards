import * as jrng from "./utils/rng.js";

const ICONS = {
  attack: ["⚔️", "🔪", "💥", "🗡️", "🔫", "🔥", "🎯"],
  defense: ["🔰", "🧱", "🛡️"],
  heal: ["💚", "❤️‍🩹", "🩹", "💊", "🍎"],
  effect: ["✨", "⚡", "🔮"],
  player: ["🧙", "👤"],
  enemy: ["👹", "🐉", "🧌", "👾", "🦇", "👻", "🕷️"],
};
const BLESSING_TYPE = {
  ENHENCE: "✨",
  SHUFFLE: "♻️",
  RESTORE: "💚",
};
const TURN_TYPE = {
  COMBAT: "⚔️",
  BLESSING: "🔮",
  ELITE: "🐉",
};
const CARD_TYPE = {
  ATTACK: "🗡️",
  DEFENSE: "🛡️",
  HEAL: "💊",
};
const cards = [
  { type: CARD_TYPE.ATTACK, value: 2 },
  { type: CARD_TYPE.DEFENSE, value: 2 },
  { type: CARD_TYPE.HEAL, value: 2 },
];
const enemyCards = [
  { type: CARD_TYPE.ATTACK, value: 2 },
  { type: CARD_TYPE.DEFENSE, value: 2 },
];

function main() {
  const state = {
    turns: [],
    turnIdx: null,
    player: { hp: 20 },
    enemy: { hp: 20 },
    turnCardIdx: null,
    enemyCard: { type: "attack", value: 2 },
    hand: [],
    deck: [],
    stash: [],
    blessings: [],
    blessingIdx: null,
  };

  const rng = new jrng.JRngMulberry32(42);

  const modalEl = document.querySelector(".modal");
  const blessingsEl = document.querySelector(".blessings");
  const blessingsBtn = document.querySelector(".blessing-btn");
  const turnsEl = document.querySelector(".turns");
  const playerEl = document.querySelector(".player");
  const enemyEl = document.querySelector(".enemy");
  const messageEl = document.querySelector(".message");
  const actionBtn = document.querySelector(".action-btn");
  const handEl = document.querySelector(".hand");
  const deckEl = document.querySelector(".deck");

  actionBtn.addEventListener("click", () => {
    handleTurn();
  });
  blessingsBtn.addEventListener("click", () => {
    handleTurn();
  });

  function handleRunStart() {
    const turns = [
      TURN_TYPE.COMBAT,
      TURN_TYPE.BLESSING,
      TURN_TYPE.COMBAT,
      TURN_TYPE.BLESSING,
      TURN_TYPE.ELITE,
    ];
    state.turns = turns;
    state.turnIdx = 0;

    state.player = { hp: 8 };
    const cardTypes = [CARD_TYPE.DEFENSE, CARD_TYPE.ATTACK, CARD_TYPE.HEAL];
    const deck = [];
    for (let i = 0; i < 16; i++) {
      const card = {
        type: cardTypes[jrng.randInt(0, cardTypes.length, rng)],
        value: jrng.randInt(2, 5, rng),
      };
      deck.push(card);
    }
    state.deck = deck;
    setUpHand();
    // const hand = [];
    // for (let i = 0; i < 4; i++) {
    //   const idx = jrng.randInt(0, deck.length, rng);
    //   hand.push(deck[idx]);
    //   deck.splice(idx, 1);
    // }
    // state.hand = hand;
    // state.deck = deck;
    // state.stash = [];

    state.blessings = Object.values(BLESSING_TYPE);

    setUpTurn();

    render();
  }
  function setUpHand() {
    const deck = [...state.deck];
    deck.push(...state.stash);
    const hand = [];
    for (let i = 0; i < 4; i++) {
      const idx = jrng.randInt(0, deck.length, rng);
      hand.push(deck[idx]);
      deck.splice(idx, 1);
    }
    state.hand = hand;
    state.deck = deck;
    state.stash = [];
  }
  function setUpEnemy(elite = false) {
    state.enemy = { hp: elite ? 4 : 2 };
    const enemyCardTypes = [CARD_TYPE.DEFENSE, CARD_TYPE.ATTACK];
    state.enemyCard = {
      type: enemyCardTypes[jrng.randInt(0, enemyCardTypes.length, rng)],
      value: jrng.randInt(2, 5, rng),
    };
  }
  function handleTurn() {
    const turn = state.turns[state.turnIdx];
    if (turn === TURN_TYPE.BLESSING) {
      handleTurnBlessing();
    } else {
      handleTurnCombat();
    }
  }
  function setUpTurn() {
    const turn = state.turns[state.turnIdx];

    if (turn === TURN_TYPE.BLESSING) {
      if (modalEl.classList.contains("hide")) {
        modalEl.classList.remove("hide");
      }
    } else {
      if (!modalEl.classList.contains("hide")) {
        modalEl.classList.add("hide");
      }
      const elite = turn === TURN_TYPE.ELITE;
      setUpEnemy(elite);
    }
  }
  function handleTurnBlessing() {
    if (state.blessingIdx === null) {
      // alert("Select blessing");
      return;
    }
    modalEl.classList.remove("hide");
    modalEl.classList.add("hide");
    const blessing = state.blessings[state.blessingIdx];
    if (blessing === BLESSING_TYPE.ENHENCE) {
      state.hand.forEach((card) => {
        card.value += 1;
      });
    } else if (blessing === BLESSING_TYPE.RESTORE) {
      state.player.hp += 4;
    } else if (blessing === BLESSING_TYPE.SHUFFLE) {
      setUpHand();
    }
    state.blessingIdx = null;
    state.turnIdx++;
    setUpTurn();
    render();
  }
  function handleTurnCombat() {
    if (state.turnCardIdx === null) {
      // alert("Select card");
      return;
    }
    if (checkRunEnd()) {
      handleRunStart();
      return;
    }
    // get card by idx from hand
    const playerCard = state.hand[state.turnCardIdx];
    state.stash.push(playerCard);
    // remove from hand
    const handCardEls = Array.from(handEl.querySelectorAll(".card"));
    state.hand.splice(state.turnCardIdx, 1);
    handCardEls[state.turnCardIdx].remove();
    state.turnCardIdx = null;
    // get enemy card
    const enemyCard = state.enemyCard;
    state.enemyCard = null;
    // handle turn
    // - use player card
    if (playerCard.type === CARD_TYPE.ATTACK) {
      let dmg = playerCard.value;
      if (enemyCard.type === CARD_TYPE.DEFENSE) {
        dmg = Math.max(0, dmg - enemyCard.value);
      }
      state.enemy.hp -= dmg;
    } else if (playerCard.type === CARD_TYPE.HEAL) {
      state.player.hp += playerCard.value;
    }
    // - use enemy card
    if (enemyCard.type === CARD_TYPE.ATTACK) {
      let dmg = enemyCard.value;
      if (playerCard.type === CARD_TYPE.DEFENSE) {
        dmg = Math.max(0, dmg - playerCard.value);
      }
      state.player.hp -= dmg;
    } else if (enemyCard.type === CARD_TYPE.HEAL) {
      state.enemy.hp += enemyCard.value;
    }
    render();
    // check if run end
    if (checkTurnEnd()) {
      state.turnIdx++;
      setUpTurn();
      render();
      // return;
    }
    if (checkRunEnd()) {
      handleRunStart();
      return;
    }
    // select enemy card
    const enemyCardTypes = [CARD_TYPE.DEFENSE, CARD_TYPE.ATTACK];
    state.enemyCard = {
      type: enemyCardTypes[jrng.randInt(0, enemyCardTypes.length, rng)],
      value: jrng.randInt(2, 5, rng),
    };
    // get random card from deck

    if (!state.deck.length) {
      state.deck = state.stash;
      state.stash = [];
    }
    const idx = jrng.randInt(0, state.deck.length, rng);
    state.hand.push(state.deck[idx]);
    state.deck.splice(idx, 1);
    render();
  }
  function checkRunEnd() {
    if (state.player.hp <= 0) {
      alert("You lost");
      return true;
    }
    if (state.turnIdx >= state.turns.length) {
      alert("You won");
      return true;
    }
    return false;
  }
  function checkTurnEnd() {
    if (state.enemy.hp <= 0) {
      return true;
    }
    return false;
  }
  function render() {
    renderBlessings();
    renderTurns();
    renderBattle();
    renderCards();
  }
  function card2str(card) {
    return card && `${card.type}${card.value}`;
  }
  function renderBlessings() {
    blessingsEl.innerHTML = "";
    state.blessings.forEach((blessing, i) => {
      const div = document.createElement("div");
      div.textContent = blessing;
      div.classList.add("card");
      if (state.blessingIdx === i) {
        div.classList.add("active");
      }
      div.addEventListener("click", () => {
        if (state.blessingIdx === i) {
          state.blessingIdx = null;
        } else {
          state.blessingIdx = i;
        }
        renderBlessings();
      });
      blessingsEl.appendChild(div);
    });
    if (state.blessingIdx !== null) {
      blessingsBtn.classList.remove("active");
      blessingsBtn.classList.add("active");
    } else {
      blessingsBtn.classList.remove("active");
    }
  }
  function renderTurns() {
    turnsEl.innerHTML = "";
    state.turns.forEach((turn, i) => {
      const div = document.createElement("div");
      div.textContent = turn;
      div.classList.add("turn");
      if (state.turnIdx === i) {
        div.classList.add("active");
      }
      turnsEl.appendChild(div);
    });
  }
  function renderBattle() {
    const enemyIcon = state.turns[state.turnIdx] === TURN_TYPE.ELITE ? '🐉' : '🦇';
    playerEl.textContent = `🧙 HP:${state.player.hp}`;
    enemyEl.textContent = `${enemyIcon} HP:${state.enemy.hp}`;
    messageEl.textContent = `${enemyIcon} about to: [${card2str(state.enemyCard)}]`;
  }
  function renderCards() {
    handEl.innerHTML = "";
    state.hand.forEach((card, i) => {
      const div = document.createElement("div");
      div.classList.add("card");
      if (state.turnCardIdx === i) {
        div.classList.add("active");
      }
      div.textContent = card2str(card);
      div.addEventListener("click", () => {
        if (state.turnCardIdx === i) {
          state.turnCardIdx = null;
        } else {
          state.turnCardIdx = i;
        }
        // TODO: update selection
        renderCards();
      });
      handEl.appendChild(div);
    });

    if (state.turnCardIdx === null) {
      handEl.classList.remove("active");
      handEl.classList.add("active");
    } else {
      handEl.classList.remove("active");
    }

    deckEl.innerHTML = "";
    state.deck.forEach((card) => {
      const div = document.createElement("div");
      div.classList.add("card");
      div.textContent = card2str(card);
      deckEl.appendChild(div);
    });

    if (state.turnCardIdx !== null) {
      actionBtn.classList.remove("active");
      actionBtn.classList.add("active");
    } else {
      actionBtn.classList.remove("active");
    }
  }

  handleRunStart();
}

main();
