// police/wanted.js — Marina Heat: the wanted level.
// Heat fills from crimes (theft, hitting peds, ramming police); each
// full bar adds a star, up to 5. Heat cools when you lay low; the
// safehouse clears it instantly. Stars drive police + heli pressure.

export function addHeat(S, amount) {
  S.heat = Math.min(100, S.heat + amount);
  S.heatCooldown = 4;
}

export function updateWanted(S, dt) {
  S.heatCooldown -= dt;
  if (S.heatCooldown <= 0 && S.heat > 0) {
    S.heat -= dt * 2.2;
    if (S.heat <= 0) {
      S.heat = 0;
      if (S.wanted > 0) { S.wanted--; S.heat = S.wanted > 0 ? 70 : 0; }
    }
  }
  if (S.heat >= 100 && S.wanted < 5) {
    S.wanted++;
    S.heat = S.wanted >= 5 ? 100 : 15;
    if (S.wanted >= 2) showMessage(S, `WANTED LEVEL ${S.wanted} — the Marina PD is on you!`);
  }
  if (S.wanted === 0) S.heat = Math.max(0, S.heat);
}

export function clearWanted(S) {
  S.wanted = 0;
  S.heat = 0;
}

export function showMessage(S, text) {
  S.message = text;
  S.messageTimer = 3.5;
}

// Busted: caught on foot by police, or car destroyed at high wanted.
export function bustPlayer(S) {
  S.stats.busted++;
  const fine = Math.min(S.cash, 100 + S.wanted * 50);
  S.cash -= fine;
  S.player.hp = 100;
  S.player.x = S.safehouse.x;
  S.player.y = S.safehouse.y + 80;
  S.player.onFoot = true;
  S.player.carId = null;
  S.player.angle = -Math.PI / 2;
  S.police = [];
  S.heli.active = false;
  clearWanted(S);
  S.mode = 'busted';
  showMessage(S, `BUSTED — fined $${fine}. You wake up at the safehouse.`);
}
