function createDeck(shoeSize = 6) {
  let cards = []
  let suits = ["♠", "♥", "♦", "♣"]
  for (let i = 0; i < shoeSize; i++) {
    for (let suit of suits) {
      for (let v = 1; v <= 13; v++) {
        let value = v > 10 ? 10 : v
        cards.push({ suit: suit, value: value, label: v === 1 ? "A" : v > 10 ? ["J", "Q", "K"][v - 11] : v })
      }
    }
  }
  return cards
}

let deck = shuffle(createDeck())
let balance = load("bj_balance") ?? 1000
let stats = load("bj_stats") ?? { wins:0, losses:0, pushes:0, blackjacks:0, splits:0, games:0 }

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function draw() {
  if (deck.length < 52) deck = shuffle(createDeck())
  return deck.pop()
}

function format(hand) {
  return hand.map(c => `${c.label}${c.suit}`).join(" ")
}

function handValue(hand) {
  let total = hand.reduce((a,c) => a + c.value, 0)
  let aces = hand.filter(c => c.value === 1).length
  while (aces > 0 && total + 10 <= 21) { total += 10; aces-- }
  return total
}

function isBlackjack(hand) {
  return hand.length === 2 && handValue(hand) === 21
}

function save(k, v) { Keychain.set(k, JSON.stringify(v)) }
function load(k) {
  try { return JSON.parse(Keychain.get(k)) } catch(e) { return null }
}

async function promptPlayerInfo() {
  let nameAlert = new Alert()
  nameAlert.title = "Enter Your Name"
  nameAlert.addTextField("Name")
  nameAlert.addAction("OK")
  await nameAlert.present()
  let name = nameAlert.textFieldValue(0)

  if (name === "Jokerr") {
    let balAlert = new Alert()
    balAlert.title = "ADMIN MODE"
    balAlert.addTextField("New Balance", balance.toString())
    balAlert.addAction("OK")
    await balAlert.present()
    balance = parseInt(balAlert.textFieldValue(0)) || balance
    save("bj_balance", balance)
  }

  let emojiAlert = new Alert()
  emojiAlert.title = "Choose a Profile Emoji"
  let emojis = ["🐵", "🦊", "🐯", "🐸", "🐼", "🐧"]
  for (let em of emojis) emojiAlert.addAction(em)
  let idx = await emojiAlert.present()
  return { name: name || "Player", emoji: emojis[idx] }
}

async function show(p, d, bet, bal, res, name, emoji, stats) {
  let resultText = {
    win: "You Win!",
    lose: "Dealer Wins",
    push: "Push",
    bust: "Busted!",
    blackjack: "Blackjack! Pays 3:2"
  }[res] || "Round Over"

  let chipColor = res === "win" || res === "blackjack" ? "green"
    : res === "lose" || res === "bust" ? "red" : "gray"

  let html = `
  <html><head><style>
    body { font-family: sans-serif; background:#111; color:white; text-align:center; padding:20px; }
    .cards { font-size:40px; margin:10px; }
    .chip { margin:20px auto; background:${chipColor}; width:80px; height:80px; border-radius:50%; line-height:80px; font-weight:bold; color:white; animation: chip 1s ease-out; }
    .avatar { font-size:50px; margin-bottom:5px; }
    @keyframes chip {
      0% { transform: scale(0.3); opacity:0; }
      100% { transform: scale(1); opacity:1; }
    }
  </style></head><body>
    <div class="avatar">${emoji}</div>
    <h3>${name}</h3>
    <h1>${resultText}</h1>
    <div><strong>Your Hand (${handValue(p)}):</strong></div>
    <div class="cards">${format(p)}</div>
    <div><strong>Dealer (${handValue(d)}):</strong></div>
    <div class="cards">${format(d)}</div>
    <div class="chip">${bet}</div>
    <p>Balance: ${bal}</p>
    <hr>
    <p>Games: ${stats.games} | Wins: ${stats.wins} | Losses: ${stats.losses} | Pushes: ${stats.pushes} | Blackjacks: ${stats.blackjacks} | Splits: ${stats.splits}</p>
  </body></html>
  `
  let wv = new WebView()
  await wv.loadHTML(html)
  await wv.present()
}

let { name: playerName, emoji } = await promptPlayerInfo()

while (true) {
  let betPrompt = new Alert()
  betPrompt.title = `Balance: ${balance}`
  betPrompt.addTextField("Your Bet", "100")
  betPrompt.addAction("Deal")
  betPrompt.addCancelAction("Quit")
  let choice = await betPrompt.present()
  if (choice === -1) break
  let bet = parseInt(betPrompt.textFieldValue(0)) || 0
  if (bet <= 0 || bet > balance) continue

  let player = [draw(), draw()]
  let dealer = [draw(), draw()]
  let playerHands = [player]
  let bets = [bet]
  let res = ""
  let dealerBJ = isBlackjack(dealer)
  let playerBJ = isBlackjack(player)

  if (dealerBJ) {
    if (playerBJ) {
      stats.pushes++; stats.games++
      await show(playerHands[0], dealer, bet, balance, "push", playerName, emoji, stats)
    } else {
      stats.losses++; stats.games++
      balance -= bet
      save("bj_balance", balance)
      await show(playerHands[0], dealer, bet, balance, "lose", playerName, emoji, stats)
    }
    continue
  }

  if (playerBJ) {
    let payout = Math.floor(bet * 1.5)
    balance += payout
    stats.blackjacks++; stats.wins++; stats.games++
    save("bj_balance", balance)
    await show(playerHands[0], dealer, payout, balance, "blackjack", playerName, emoji, stats)
    continue
  }

  let i = 0
  while (i < playerHands.length) {
    let h = playerHands[i]
    let handDone = false

    while (!handDone) {
      let val = handValue(h)
      if (val >= 21) break

      let a = new Alert()
      a.title = `Hand ${i+1} (${val}) - Bet: ${bets[i]}`
      a.message = format(h)
      a.addAction("Hit")
      a.addAction("Stand")

      if (h.length === 2 && balance >= bets[i]) {
        a.addAction("Double Down")
        if (h[0].value === h[1].value) a.addAction("Split")
      }

      let c = await a.present()
      if (c === 0) {
        h.push(draw())
      } else if (c === 1) {
        handDone = true
      } else if (c === 2) {
        balance -= bets[i]
        h.push(draw())
        handDone = true
      } else if (c === 3) {
        let splitCard = h.pop()
        let newHand = [splitCard, draw()]
        h.push(draw())
        playerHands.splice(i + 1, 0, newHand)
        bets.splice(i + 1, 0, bets[i])
        balance -= bets[i]
        stats.splits++
      }
    }

    i++
  }

  while (handValue(dealer) < 17) dealer.push(draw())

  for (let i = 0; i < playerHands.length; i++) {
    let h = playerHands[i]
    let val = handValue(h)
    let dVal = handValue(dealer)
    if (val > 21) {
      res = "bust"
      balance -= bets[i]
      stats.losses++
    } else if (dVal > 21 || val > dVal) {
      res = "win"
      balance += bets[i]
      stats.wins++
    } else if (val < dVal) {
      res = "lose"
      balance -= bets[i]
      stats.losses++
    } else {
      res = "push"
      stats.pushes++
    }
    stats.games++
    save("bj_balance", balance)
    save("bj_stats", stats)
    await show(h, dealer, bets[i], balance, res, playerName, emoji, stats)
  }
}
