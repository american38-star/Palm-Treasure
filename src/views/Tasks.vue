<template>    
  <div class="game-page">    
    <!-- الرصيد -->
    <div class="top-bar">
      <div class="balance-gold">
        <i class="fas fa-coins"></i>
        <span>رصيدك: <strong>{{ balance.toFixed(2) }} USDT</strong></span>
      </div>
    </div>

    <!-- التبويبات -->
    <div class="tabs">
      <button 
        v-for="tab in gamesList" 
        :key="tab.id"
        :class="{active: game===tab.id}" 
        @click="switchGame(tab.id)"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-text">{{ tab.name }}</span>
      </button>
    </div>

    <!-- عرض اللعبة المختارة -->
    <div class="game-container">
      <!-- Chicken Road -->
      <div v-if="game==='chicken'" class="card chicken-card">
        <div class="card-header">
          <h2>🐔 Chicken Road</h2>
          <div class="header-glow"></div>
        </div>

        <div class="chicken-container">
          <div class="chicken-glow"></div>
          <div class="chicken">🐔</div>
        </div>

        <div v-if="chickenStarted" class="road">
          <div
            v-for="(step, i) in chickenSteps"
            :key="i"
            class="step"
            :class="{
              active: i === chickenPosition,
              'gold-step': step.multiplier >= 3,
              'silver-step': step.multiplier >= 2 && step.multiplier < 3
            }"
          >
            <span class="multiplier">x{{ step.multiplier.toFixed(2) }}</span>
            <div v-if="i === chickenPosition" class="chicken-icon">🐔</div>
            <div v-if="i < chickenPosition" class="step-check">✓</div>
          </div>
        </div>

        <div class="bet-section">
          <div v-if="!chickenStarted" class="bet-controls">
            <div class="input-gold-wrapper">
              <input
                type="number"
                v-model.number="chickenBet"
                placeholder="أدخل المبلغ"
                class="gold-input"
                @input="clearGameError"
              />
              <span class="input-currency">USDT</span>
            </div>
            <div v-if="gameError" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ gameError }}
            </div>
            <button 
              @click="startChicken"
              class="gold-button"
              :disabled="!chickenBet || chickenBet <= 0"
            >
              <i class="fas fa-play"></i>
              ابدأ الآن
            </button>
          </div>

          <div v-if="chickenStarted" class="game-controls">
            <div class="profit-display">
              <span class="profit-label">الربح المحتمل:</span>
              <span class="profit-value">{{ chickenProfit.toFixed(2) }} USDT</span>
            </div>
            <div class="action-buttons">
              <button @click="chickenNext" class="action-btn gold">
                <i class="fas fa-arrow-right"></i>
                تقدم
              </button>
              <button @click="chickenCashOut" class="action-btn green">
                <i class="fas fa-hand-holding-usd"></i>
                سحب
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Dice -->
      <div v-if="game==='dice'" class="card game-card">
        <div class="card-header">
          <h2>🎲 Dice</h2>
          <div class="header-glow"></div>
        </div>
        
        <div class="game-icon">🎲</div>
        
        <div class="game-controls-full">
          <div class="slider-container">
            <label>نسبة الفوز: {{ diceChance }}%</label>
            <input 
              type="range" 
              v-model.number="diceChance" 
              min="1" 
              max="95" 
              step="1"
              class="gold-slider"
              :disabled="diceStarted"
            >
          </div>
          
          <div class="multiplier-display">
            <span>المضاعف: x{{ (95 / diceChance).toFixed(2) }}</span>
          </div>
          
          <div v-if="!diceStarted" class="bet-controls">
            <div class="input-gold-wrapper">
              <input
                type="number"
                v-model.number="diceBet"
                placeholder="أدخل المبلغ"
                class="gold-input"
                @input="clearGameError"
              />
              <span class="input-currency">USDT</span>
            </div>
            <div v-if="gameError" class="error-message">{{ gameError }}</div>
            <button @click="startDice" class="gold-button" :disabled="!diceBet || diceBet <= 0">
              <i class="fas fa-play"></i> رمي النرد
            </button>
          </div>
          
          <div v-if="diceStarted" class="result-box">
            <div class="dice-result">{{ diceRoll }}</div>
            <div class="result-text">{{ diceResultText }}</div>
          </div>
        </div>
      </div>

      <!-- Mines -->
      <div v-if="game==='mines'" class="card game-card">
        <div class="card-header">
          <h2>💣 Mines</h2>
          <div class="header-glow"></div>
        </div>
        
        <div class="game-icon">💣</div>
        
        <div class="game-controls-full">
          <div class="slider-container">
            <label>عدد الألغام: {{ minesCount }}</label>
            <input 
              type="range" 
              v-model.number="minesCount" 
              min="1" 
              max="10" 
              step="1"
              class="gold-slider"
              :disabled="minesStarted"
            >
          </div>
          
          <div v-if="!minesStarted" class="bet-controls">
            <div class="input-gold-wrapper">
              <input
                type="number"
                v-model.number="minesBet"
                placeholder="أدخل المبلغ"
                class="gold-input"
                @input="clearGameError"
              />
              <span class="input-currency">USDT</span>
            </div>
            <div v-if="gameError" class="error-message">{{ gameError }}</div>
            <button @click="startMines" class="gold-button" :disabled="!minesBet || minesBet <= 0">
              <i class="fas fa-play"></i> ابدأ
            </button>
          </div>
          
          <div v-if="minesStarted" class="mines-grid">
            <button 
              v-for="(cell, index) in minesCells" 
              :key="index"
              class="mine-cell"
              :class="{
                'revealed': cell.revealed,
                'mine': cell.mine && cell.revealed,
                'safe': !cell.mine && cell.revealed
              }"
              @click="revealMine(index)"
              :disabled="cell.revealed || minesGameOver"
            >
              {{ cell.revealed ? (cell.mine ? '💣' : '💎') : '?' }}
            </button>
          </div>
          
          <div v-if="minesStarted && !minesGameOver" class="action-buttons">
            <button @click="minesCashOut" class="action-btn green">
              <i class="fas fa-hand-holding-usd"></i> سحب ({{ minesProfit.toFixed(2) }} USDT)
            </button>
          </div>
        </div>
      </div>

      <!-- Crash -->
      <div v-if="game==='crash'" class="card game-card">
        <div class="card-header">
          <h2>🚀 Crash</h2>
          <div class="header-glow"></div>
        </div>
        
        <div class="game-icon">🚀</div>
        
        <div class="game-controls-full">
          <div v-if="!crashStarted" class="bet-controls">
            <div class="input-gold-wrapper">
              <input
                type="number"
                v-model.number="crashBet"
                placeholder="أدخل المبلغ"
                class="gold-input"
                @input="clearGameError"
              />
              <span class="input-currency">USDT</span>
            </div>
            <div class="input-gold-wrapper">
              <input
                type="number"
                v-model.number="crashAutoCashout"
                placeholder="السحب عند"
                class="gold-input"
                step="0.1"
                min="1.1"
              />
              <span class="input-currency">x</span>
            </div>
            <div v-if="gameError" class="error-message">{{ gameError }}</div>
            <button @click="startCrash" class="gold-button" :disabled="!crashBet || crashBet <= 0">
              <i class="fas fa-play"></i> إطلاق
            </button>
          </div>
          
          <div v-if="crashStarted" class="crash-display">
            <div class="multiplier-box" :class="{ 'crashed': crashCrashed }">
              x{{ crashMultiplier.toFixed(2) }}
            </div>
            <div class="rocket" :class="{ 'launched': crashStarted, 'crashed': crashCrashed }">🚀</div>
            <progress class="crash-progress" :value="crashProgress" max="100"></progress>
          </div>
          
          <div v-if="crashStarted && !crashCrashed" class="action-buttons">
            <button @click="crashCashOut" class="action-btn green">
              <i class="fas fa-hand-holding-usd"></i> سحب ({{ (crashBet * crashMultiplier).toFixed(2) }} USDT)
            </button>
          </div>
        </div>
      </div>

      <!-- Limbo -->
      <div v-if="game==='limbo'" class="card game-card">
        <div class="card-header">
          <h2>🎯 Limbo</h2>
          <div class="header-glow"></div>
        </div>
        
        <div class="game-icon">🎯</div>
        
        <div class="game-controls-full">
          <div v-if="!limboStarted" class="bet-controls">
            <div class="input-gold-wrapper">
              <input
                type="number"
                v-model.number="limboBet"
                placeholder="أدخل المبلغ"
                class="gold-input"
                @input="clearGameError"
              />
              <span class="input-currency">USDT</span>
            </div>
            <div class="input-gold-wrapper">
              <input
                type="number"
                v-model.number="limboTarget"
                placeholder="المضاعف المستهدف"
                class="gold-input"
                step="0.1"
                min="1.01"
              />
              <span class="input-currency">x</span>
            </div>
            <div v-if="gameError" class="error-message">{{ gameError }}</div>
            <button @click="startLimbo" class="gold-button" :disabled="!limboBet || limboBet <= 0">
              <i class="fas fa-play"></i> ابدأ
            </button>
          </div>
          
          <div v-if="limboStarted" class="limbo-display">
            <div class="result-number">{{ limboResult.toFixed(2) }}x</div>
            <div class="result-text" :class="limboWon ? 'win-text' : 'lose-text'">
              {{ limboWon ? '🎉 فوز!' : '💥 خسارة' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Blackjack -->
      <div v-if="game==='blackjack'" class="card game-card">
        <div class="card-header">
          <h2>🃏 Blackjack</h2>
          <div class="header-glow"></div>
        </div>
        
        <div class="game-icon">🃏</div>
        
        <div class="game-controls-full">
          <div v-if="!blackjackStarted" class="bet-controls">
            <div class="input-gold-wrapper">
              <input
                type="number"
                v-model.number="blackjackBet"
                placeholder="أدخل المبلغ"
                class="gold-input"
                @input="clearGameError"
              />
              <span class="input-currency">USDT</span>
            </div>
            <div v-if="gameError" class="error-message">{{ gameError }}</div>
            <button @click="startBlackjack" class="gold-button" :disabled="!blackjackBet || blackjackBet <= 0">
              <i class="fas fa-play"></i> توزيع
            </button>
          </div>
          
          <div v-if="blackjackStarted" class="blackjack-table">
            <div class="dealer-hand">
              <span>الموزع: </span>
              <span v-for="(card, i) in dealerHand" :key="i" class="card">
                {{ i === 1 && !dealerRevealed ? '?' : card }}
              </span>
              <span v-if="!dealerRevealed"> ?</span>
            </div>
            <div class="player-hand">
              <span>أنت: </span>
              <span v-for="card in playerHand" :key="card" class="card">{{ card }}</span>
              <span> ({{ playerScore }})</span>
            </div>
            
            <div v-if="!blackjackGameOver" class="action-buttons">
              <button @click="blackjackHit" class="action-btn gold">ضرب</button>
              <button @click="blackjackStand" class="action-btn green">وقف</button>
            </div>
            
            <div v-if="blackjackGameOver" class="result-text" :class="blackjackWon ? 'win-text' : 'lose-text'">
              {{ blackjackResult }}
            </div>
          </div>
        </div>
      </div>

      <!-- Slot Machine -->
      <div v-if="game==='slot'" class="card game-card">
        <div class="card-header">
          <h2>🎰 Slot Machine</h2>
          <div class="header-glow"></div>
        </div>
        
        <div class="game-icon">🎰</div>
        
        <div class="game-controls-full">
          <div v-if="!slotStarted" class="bet-controls">
            <div class="input-gold-wrapper">
              <input
                type="number"
                v-model.number="slotBet"
                placeholder="أدخل المبلغ"
                class="gold-input"
                @input="clearGameError"
              />
              <span class="input-currency">USDT</span>
            </div>
            <div v-if="gameError" class="error-message">{{ gameError }}</div>
            <button @click="startSlot" class="gold-button" :disabled="!slotBet || slotBet <= 0">
              <i class="fas fa-play"></i> لعب
            </button>
          </div>
          
          <div v-if="slotStarted" class="slot-machine">
            <div class="slot-row">
              <div class="slot-reel">{{ slotReels[0] }}</div>
              <div class="slot-reel">{{ slotReels[1] }}</div>
              <div class="slot-reel">{{ slotReels[2] }}</div>
            </div>
            <div class="result-text" :class="slotWon ? 'win-text' : 'lose-text'">
              {{ slotResult }}
            </div>
          </div>
        </div>
      </div>

      <!-- Coinflip -->
      <div v-if="game==='coinflip'" class="card game-card">
        <div class="card-header">
          <h2>🪙 Coinflip</h2>
          <div class="header-glow"></div>
        </div>
        
        <div class="game-icon">🪙</div>
        
        <div class="game-controls-full">
          <div v-if="!coinflipStarted" class="bet-controls">
            <div class="input-gold-wrapper">
              <input
                type="number"
                v-model.number="coinflipBet"
                placeholder="أدخل المبلغ"
                class="gold-input"
                @input="clearGameError"
              />
              <span class="input-currency">USDT</span>
            </div>
            <div class="choice-buttons">
              <button 
                @click="coinflipChoice = 'صورة'" 
                class="choice-btn" 
                :class="{active: coinflipChoice === 'صورة'}"
              >
                🪙 صورة
              </button>
              <button 
                @click="coinflipChoice = 'كتابة'" 
                class="choice-btn" 
                :class="{active: coinflipChoice === 'كتابة'}"
              >
                📝 كتابة
              </button>
            </div>
            <div v-if="gameError" class="error-message">{{ gameError }}</div>
            <button @click="startCoinflip" class="gold-button" :disabled="!coinflipBet || coinflipBet <= 0 || !coinflipChoice">
              <i class="fas fa-play"></i> اقلب
            </button>
          </div>
          
          <div v-if="coinflipStarted" class="coinflip-result">
            <div class="coin" :class="{ 'flipping': coinflipFlipping }">{{ coinflipResult }}</div>
            <div class="result-text" :class="coinflipWon ? 'win-text' : 'lose-text'">
              {{ coinflipWon ? '🎉 فوز!' : '💥 خسارة' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Wheel Spin -->
      <div v-if="game==='wheel'" class="card game-card">
        <div class="card-header">
          <h2>🎯 Wheel Spin</h2>
          <div class="header-glow"></div>
        </div>
        
        <div class="game-icon">🎡</div>
        
        <div class="game-controls-full">
          <div v-if="!wheelStarted" class="bet-controls">
            <div class="input-gold-wrapper">
              <input
                type="number"
                v-model.number="wheelBet"
                placeholder="أدخل المبلغ"
                class="gold-input"
                @input="clearGameError"
              />
              <span class="input-currency">USDT</span>
            </div>
            <div v-if="gameError" class="error-message">{{ gameError }}</div>
            <button @click="startWheel" class="gold-button" :disabled="!wheelBet || wheelBet <= 0">
              <i class="fas fa-play"></i> دوّر
            </button>
          </div>
          
          <div v-if="wheelStarted" class="wheel-container">
            <div class="wheel" :style="{ transform: `rotate(${wheelRotation}deg)` }">
              <div v-for="n in 8" :key="n" class="wheel-segment" :class="`segment-${n}`">
                {{ wheelMultipliers[n-1] }}x
              </div>
            </div>
            <div class="wheel-pointer">▼</div>
            <div class="result-text">{{ wheelResult }}</div>
          </div>
        </div>
      </div>

      <!-- Keno -->
      <div v-if="game==='keno'" class="card game-card">
        <div class="card-header">
          <h2>🧨 Keno</h2>
          <div class="header-glow"></div>
        </div>
        
        <div class="game-icon">🎱</div>
        
        <div class="game-controls-full">
          <div v-if="!kenoStarted" class="bet-controls">
            <div class="input-gold-wrapper">
              <input
                type="number"
                v-model.number="kenoBet"
                placeholder="أدخل المبلغ"
                class="gold-input"
                @input="clearGameError"
              />
              <span class="input-currency">USDT</span>
            </div>
            <div v-if="gameError" class="error-message">{{ gameError }}</div>
            <button @click="startKeno" class="gold-button" :disabled="!kenoBet || kenoBet <= 0">
              <i class="fas fa-play"></i> ابدأ
            </button>
          </div>
          
          <div v-if="kenoStarted" class="keno-grid">
            <div 
              v-for="n in 40" 
              :key="n"
              class="keno-cell"
              :class="{
                'selected': kenoSelected.includes(n),
                'drawn': kenoDrawn.includes(n),
                'match': kenoSelected.includes(n) && kenoDrawn.includes(n)
              }"
              @click="toggleKenoNumber(n)"
            >
              {{ n }}
            </div>
          </div>
          
          <div v-if="kenoStarted && kenoSelected.length > 0" class="action-buttons">
            <button @click="drawKeno" class="action-btn gold">
              <i class="fas fa-dice"></i> سحب ({{ kenoSelected.length }} أرقام)
            </button>
          </div>
        </div>
      </div>

      <!-- Bowling -->
      <div v-if="game==='bowling'" class="card game-card">
        <div class="card-header">
          <h2>🎳 Bowling</h2>
          <div class="header-glow"></div>
        </div>
        
        <div class="game-icon">🎳</div>
        
        <div class="game-controls-full">
          <div v-if="!bowlingStarted" class="bet-controls">
            <div class="input-gold-wrapper">
              <input
                type="number"
                v-model.number="bowlingBet"
                placeholder="أدخل المبلغ"
                class="gold-input"
                @input="clearGameError"
              />
              <span class="input-currency">USDT</span>
            </div>
            <div v-if="gameError" class="error-message">{{ gameError }}</div>
            <button @click="startBowling" class="gold-button" :disabled="!bowlingBet || bowlingBet <= 0">
              <i class="fas fa-play"></i> ارمِ
            </button>
          </div>
          
          <div v-if="bowlingStarted" class="bowling-alley">
            <div class="pins">
              <div v-for="pin in 10" :key="pin" class="pin" :class="{ knocked: bowlingKnocked.includes(pin) }">
                🎳
              </div>
            </div>
            <div class="bowling-ball" :class="{ rolling: bowlingRolling }">⚫</div>
            <div class="result-text">{{ bowlingResult }}</div>
          </div>
        </div>
      </div>

      <!-- Puzzle -->
      <div v-if="game==='puzzle'" class="card game-card">
        <div class="card-header">
          <h2>🧩 Puzzle</h2>
          <div class="header-glow"></div>
        </div>
        
        <div class="game-icon">🧩</div>
        
        <div class="game-controls-full">
          <div v-if="!puzzleStarted" class="bet-controls">
            <div class="input-gold-wrapper">
              <input
                type="number"
                v-model.number="puzzleBet"
                placeholder="أدخل المبلغ"
                class="gold-input"
                @input="clearGameError"
              />
              <span class="input-currency">USDT</span>
            </div>
            <div v-if="gameError" class="error-message">{{ gameError }}</div>
            <button @click="startPuzzle" class="gold-button" :disabled="!puzzleBet || puzzleBet <= 0">
              <i class="fas fa-play"></i> ابدأ
            </button>
          </div>
          
          <div v-if="puzzleStarted" class="puzzle-grid">
            <div 
              v-for="(piece, index) in puzzlePieces" 
              :key="index"
              class="puzzle-piece"
              :class="{ empty: piece === null }"
              @click="movePuzzle(index)"
            >
              {{ piece !== null ? piece : '' }}
            </div>
          </div>
          
          <div v-if="puzzleStarted" class="result-text" :class="puzzleSolved ? 'win-text' : ''">
            {{ puzzleSolved ? '🎉 أحسنت! حل اللغز' : 'حرك القطع لترتيب الأرقام' }}
          </div>
        </div>
      </div>

      <!-- Target Shot -->
      <div v-if="game==='target'" class="card game-card">
        <div class="card-header">
          <h2>🎯 Target Shot</h2>
          <div class="header-glow"></div>
        </div>
        
        <div class="game-icon">🎯</div>
        
        <div class="game-controls-full">
          <div v-if="!targetStarted" class="bet-controls">
            <div class="input-gold-wrapper">
              <input
                type="number"
                v-model.number="targetBet"
                placeholder="أدخل المبلغ"
                class="gold-input"
                @input="clearGameError"
              />
              <span class="input-currency">USDT</span>
            </div>
            <div v-if="gameError" class="error-message">{{ gameError }}</div>
            <button @click="startTarget" class="gold-button" :disabled="!targetBet || targetBet <= 0">
              <i class="fas fa-play"></i> صوّب
            </button>
          </div>
          
          <div v-if="targetStarted" class="target-container">
            <div class="target">
              <div class="target-circle bullseye" @click="shootTarget(10)">🎯</div>
              <div class="target-circle middle" @click="shootTarget(5)"></div>
              <div class="target-circle outer" @click="shootTarget(2)"></div>
            </div>
            <div class="result-text">{{ targetResult }}</div>
          </div>
        </div>
      </div>

      <!-- Lucky Number -->
      <div v-if="game==='lucky'" class="card game-card">
        <div class="card-header">
          <h2>🎮 Lucky Number</h2>
          <div class="header-glow"></div>
        </div>
        
        <div class="game-icon">🎲</div>
        
        <div class="game-controls-full">
          <div v-if="!luckyStarted" class="bet-controls">
            <div class="input-gold-wrapper">
              <input
                type="number"
                v-model.number="luckyBet"
                placeholder="أدخل المبلغ"
                class="gold-input"
                @input="clearGameError"
              />
              <span class="input-currency">USDT</span>
            </div>
            <div class="input-gold-wrapper">
              <input
                type="number"
                v-model.number="luckyNumber"
                placeholder="رقم الحظ"
                class="gold-input"
                min="1"
                max="100"
              />
              <span class="input-currency">#</span>
            </div>
            <div v-if="gameError" class="error-message">{{ gameError }}</div>
            <button @click="startLucky" class="gold-button" :disabled="!luckyBet || luckyBet <= 0 || !luckyNumber">
              <i class="fas fa-play"></i> جرب حظك
            </button>
          </div>
          
          <div v-if="luckyStarted" class="lucky-display">
            <div class="drawn-number">{{ luckyDrawn }}</div>
            <div class="result-text" :class="luckyWon ? 'win-text' : 'lose-text'">
              {{ luckyWon ? '🎉 رقم محظوظ!' : '😢 حظ أوفر المرة الجاية' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Mystery Box -->
      <div v-if="game==='mystery'" class="card game-card">
        <div class="card-header">
          <h2>🎁 Mystery Box</h2>
          <div class="header-glow"></div>
        </div>
        
        <div class="game-icon">📦</div>
        
        <div class="game-controls-full">
          <div v-if="!mysteryStarted" class="bet-controls">
            <div class="input-gold-wrapper">
              <input
                type="number"
                v-model.number="mysteryBet"
                placeholder="أدخل المبلغ"
                class="gold-input"
                @input="clearGameError"
              />
              <span class="input-currency">USDT</span>
            </div>
            <div v-if="gameError" class="error-message">{{ gameError }}</div>
            <button @click="startMystery" class="gold-button" :disabled="!mysteryBet || mysteryBet <= 0">
              <i class="fas fa-play"></i> افتح الصندوق
            </button>
          </div>
          
          <div v-if="mysteryStarted" class="mystery-box-container">
            <div class="box" @click="openMysteryBox" :class="{ opened: mysteryOpened }">
              {{ mysteryOpened ? mysteryPrize : '🎁' }}
            </div>
            <div class="result-text">{{ mysteryResult }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- نتيجة اللعبة -->
    <div v-if="result" class="result-popup" :class="result.includes('ربحت') || result.includes('فوز') ? 'win' : 'lose'">
      <i :class="result.includes('ربحت') || result.includes('فوز') ? 'fas fa-trophy' : 'fas fa-skull'"></i>
      <span>{{ result }}</span>
    </div>
  </div>    
</template>    
    
<script>    
import { auth, db } from "../firebase";    
import { doc, getDoc, updateDoc } from "firebase/firestore";    
    
export default {    
  name: "Games",    
    
  data() {    
    return {    
      game: "chicken",
      gamesList: [
        { id: 'chicken', name: 'Chicken Road', icon: '🐔' },
        { id: 'dice', name: 'Dice', icon: '🎲' },
        { id: 'mines', name: 'Mines', icon: '💣' },
        { id: 'crash', name: 'Crash', icon: '🚀' },
        { id: 'limbo', name: 'Limbo', icon: '🎯' },
        { id: 'blackjack', name: 'Blackjack', icon: '🃏' },
        { id: 'slot', name: 'Slot', icon: '🎰' },
        { id: 'coinflip', name: 'Coinflip', icon: '🪙' },
        { id: 'wheel', name: 'Wheel', icon: '🎡' },
        { id: 'keno', name: 'Keno', icon: '🎱' },
        { id: 'bowling', name: 'Bowling', icon: '🎳' },
        { id: 'puzzle', name: 'Puzzle', icon: '🧩' },
        { id: 'target', name: 'Target', icon: '🎯' },
        { id: 'lucky', name: 'Lucky Number', icon: '🎮' },
        { id: 'mystery', name: 'Mystery Box', icon: '🎁' }
      ],
      balance: 0,    
      result: "",    
      gameError: "",    
    
      /* Chicken Road */
      chickenBet: null,
      chickenStarted: false,
      chickenPosition: 0,
      chickenSteps: [
        { multiplier: 1.0 },
        { multiplier: 1.1 },
        { multiplier: 1.3 },
        { multiplier: 1.5 },
        { multiplier: 2.0 },
        { multiplier: 3.0 },
        { multiplier: 5.0 },
      ],
      
      /* Dice */
      diceBet: null,
      diceStarted: false,
      diceChance: 50,
      diceRoll: null,
      diceResultText: "",
      
      /* Mines */
      minesBet: null,
      minesStarted: false,
      minesCount: 3,
      minesCells: [],
      minesGameOver: false,
      minesRevealed: 0,
      
      /* Crash */
      crashBet: null,
      crashStarted: false,
      crashMultiplier: 1.0,
      crashCrashed: false,
      crashProgress: 0,
      crashAutoCashout: 2.0,
      crashInterval: null,
      
      /* Limbo */
      limboBet: null,
      limboStarted: false,
      limboTarget: 2.0,
      limboResult: 0,
      limboWon: false,
      
      /* Blackjack */
      blackjackBet: null,
      blackjackStarted: false,
      blackjackGameOver: false,
      blackjackWon: false,
      blackjackResult: "",
      dealerHand: [],
      playerHand: [],
      dealerRevealed: false,
      deck: [],
      
      /* Slot Machine */
      slotBet: null,
      slotStarted: false,
      slotReels: ['🍒', '🍒', '🍒'],
      slotWon: false,
      slotResult: "",
      slotSymbols: ['🍒', '🍋', '🍊', '7', '💎', '🔔'],
      
      /* Coinflip */
      coinflipBet: null,
      coinflipStarted: false,
      coinflipChoice: "",
      coinflipResult: "",
      coinflipWon: false,
      coinflipFlipping: false,
      
      /* Wheel */
      wheelBet: null,
      wheelStarted: false,
      wheelRotation: 0,
      wheelResult: "",
      wheelMultipliers: [2, 5, 1.5, 10, 1.2, 3, 20, 1.1],
      
      /* Keno */
      kenoBet: null,
      kenoStarted: false,
      kenoSelected: [],
      kenoDrawn: [],
      kenoMatches: 0,
      
      /* Bowling */
      bowlingBet: null,
      bowlingStarted: false,
      bowlingKnocked: [],
      bowlingRolling: false,
      bowlingResult: "",
      
      /* Puzzle */
      puzzleBet: null,
      puzzleStarted: false,
      puzzlePieces: [],
      puzzleSolved: false,
      
      /* Target */
      targetBet: null,
      targetStarted: false,
      targetResult: "",
      targetScore: 0,
      
      /* Lucky Number */
      luckyBet: null,
      luckyStarted: false,
      luckyNumber: null,
      luckyDrawn: null,
      luckyWon: false,
      
      /* Mystery Box */
      mysteryBet: null,
      mysteryStarted: false,
      mysteryOpened: false,
      mysteryPrize: "",
      mysteryResult: ""
    };    
  },    
    
  computed: {    
    chickenProfit() {    
      if (!this.chickenBet) return 0;    
      return this.chickenBet * this.chickenSteps[this.chickenPosition].multiplier;    
    },
    
    minesProfit() {
      if (!this.minesBet) return 0;
      let multiplier = 1 + (this.minesRevealed * 0.5);
      return this.minesBet * multiplier;
    }
  },    
    
  async created() {    
    const user = auth.currentUser;    
    if (!user) return;    
    const snap = await getDoc(doc(db, "users", user.uid));    
    if (snap.exists()) {    
      this.balance = Number(snap.data().balance || 0);    
    }    
  },    
    
  methods: {    
    switchGame(g) {    
      this.result = "";    
      this.gameError = "";
      
      // إيقاف جميع الألعاب
      this.chickenStarted = false;
      this.diceStarted = false;
      this.minesStarted = false;
      if (this.crashInterval) clearInterval(this.crashInterval);
      this.crashStarted = false;
      this.limboStarted = false;
      this.blackjackStarted = false;
      this.slotStarted = false;
      this.coinflipStarted = false;
      this.wheelStarted = false;
      this.kenoStarted = false;
      this.bowlingStarted = false;
      this.puzzleStarted = false;
      this.targetStarted = false;
      this.luckyStarted = false;
      this.mysteryStarted = false;
      
      this.game = g;    
    },
    
    clearGameError() {
      this.gameError = "";
    },
    
    async updateBalance(newBalance) {
      this.balance = newBalance;
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        balance: this.balance,
      });
    },
    
    /* ===== Chicken Road ===== */
    async startChicken() {
      if (!this.chickenBet || this.chickenBet <= 0) {
        this.gameError = "الرجاء إدخال مبلغ الرهان";
        return;
      }
      if (this.chickenBet > this.balance) {
        this.gameError = "الرصيد غير كافي";
        return;
      }
      
      this.gameError = "";
      this.balance -= this.chickenBet;
      await this.updateBalance(this.balance);
      
      this.chickenStarted = true;
      this.chickenPosition = 0;
    },
    
    chickenNext() {
      const loseChance = 0.4 + this.chickenPosition * 0.07;
      if (Math.random() < loseChance) {
        this.result = "💥 للأسف خسرت الرهان";
        this.chickenStarted = false;
        return;
      }
      
      if (this.chickenPosition < this.chickenSteps.length - 1) {
        this.chickenPosition++;
      } else {
        this.chickenCashOut();
      }
    },
    
    async chickenCashOut() {
      const profit = this.chickenProfit;
      this.balance += profit;
      await this.updateBalance(this.balance);
      this.result = `🎉 مبروك! ربحت ${profit.toFixed(2)} USDT`;
      this.chickenStarted = false;
    },
    
    /* ===== Dice ===== */
    async startDice() {
      if (!this.diceBet || this.diceBet <= 0) {
        this.gameError = "الرجاء إدخال مبلغ الرهان";
        return;
      }
      if (this.diceBet > this.balance) {
        this.gameError = "الرصيد غير كافي";
        return;
      }
      
      this.gameError = "";
      this.balance -= this.diceBet;
      await this.updateBalance(this.balance);
      
      this.diceStarted = true;
      this.diceRoll = Math.floor(Math.random() * 100) + 1;
      
      const win = this.diceRoll <= this.diceChance;
      const multiplier = 95 / this.diceChance;
      const profit = this.diceBet * multiplier;
      
      if (win) {
        this.balance += profit;
        await this.updateBalance(this.balance);
        this.diceResultText = `🎉 فوز! ربحت ${profit.toFixed(2)} USDT`;
        this.result = this.diceResultText;
      } else {
        this.diceResultText = `😢 خسارة! الرقم كان ${this.diceRoll}`;
        this.result = this.diceResultText;
      }
      
      setTimeout(() => {
        this.diceStarted = false;
      }, 3000);
    },
    
    /* ===== Mines ===== */
    async startMines() {
      if (!this.minesBet || this.minesBet <= 0) {
        this.gameError = "الرجاء إدخال مبلغ الرهان";
        return;
      }
      if (this.minesBet > this.balance) {
        this.gameError = "الرصيد غير كافي";
        return;
      }
      
      this.gameError = "";
      this.balance -= this.minesBet;
      await this.updateBalance(this.balance);
      
      this.minesStarted = true;
      this.minesGameOver = false;
      this.minesRevealed = 0;
      
      // إنشاء حقل الألغام
      this.minesCells = [];
      for (let i = 0; i < 25; i++) {
        this.minesCells.push({ revealed: false, mine: false });
      }
      
      // وضع الألغام
      let minesPlaced = 0;
      while (minesPlaced < this.minesCount) {
        const index = Math.floor(Math.random() * 25);
        if (!this.minesCells[index].mine) {
          this.minesCells[index].mine = true;
          minesPlaced++;
        }
      }
    },
    
    revealMine(index) {
      if (this.minesGameOver || this.minesCells[index].revealed) return;
      
      this.minesCells[index].revealed = true;
      
      if (this.minesCells[index].mine) {
        this.minesGameOver = true;
        this.result = "💥 انفجر لغم! خسرت الرهان";
      } else {
        this.minesRevealed++;
      }
    },
    
    async minesCashOut() {
      const profit = this.minesProfit;
      this.balance += profit;
      await this.updateBalance(this.balance);
      this.result = `🎉 ربحت ${profit.toFixed(2)} USDT`;
      this.minesStarted = false;
    },
    
    /* ===== Crash ===== */
    async startCrash() {
      if (!this.crashBet || this.crashBet <= 0) {
        this.gameError = "الرجاء إدخال مبلغ الرهان";
        return;
      }
      if (this.crashBet > this.balance) {
        this.gameError = "الرصيد غير كافي";
        return;
      }
      
      this.gameError = "";
      this.balance -= this.crashBet;
      await this.updateBalance(this.balance);
      
      this.crashStarted = true;
      this.crashCrashed = false;
      this.crashMultiplier = 1.0;
      this.crashProgress = 0;
      
      const crashPoint = 1 + Math.random() * 5;
      
      this.crashInterval = setInterval(() => {
        if (this.crashCrashed) return;
        
        this.crashMultiplier += 0.01;
        this.crashProgress = (this.crashMultiplier - 1) * 20;
        
        if (this.crashMultiplier >= crashPoint) {
          this.crashCrashed = true;
          clearInterval(this.crashInterval);
          this.result = "💥 انفجرت الصاروخ!";
          this.crashStarted = false;
        }
        
        if (this.crashMultiplier >= this.crashAutoCashout && !this.crashCrashed) {
          this.crashCashOut();
        }
      }, 100);
    },
    
    async crashCashOut() {
      if (this.crashCrashed) return;
      
      clearInterval(this.crashInterval);
      const profit = this.crashBet * this.crashMultiplier;
      this.balance += profit;
      await this.updateBalance(this.balance);
      this.result = `🎉 سحبت قبل الانفجار! ربحت ${profit.toFixed(2)} USDT`;
      this.crashStarted = false;
    },
    
    /* ===== Limbo ===== */
    async startLimbo() {
      if (!this.limboBet || this.limboBet <= 0) {
        this.gameError = "الرجاء إدخال مبلغ الرهان";
        return;
      }
      if (this.limboBet > this.balance) {
        this.gameError = "الرصيد غير كافي";
        return;
      }
      
      this.gameError = "";
      this.balance -= this.limboBet;
      await this.updateBalance(this.balance);
      
      this.limboStarted = true;
      this.limboResult = 1 + Math.random() * 10;
      this.limboWon = this.limboResult >= this.limboTarget;
      
      if (this.limboWon) {
        const profit = this.limboBet * this.limboResult;
        this.balance += profit;
        await this.updateBalance(this.balance);
        this.result = `🎉 فوز! المضاعف ${this.limboResult.toFixed(2)}x ربحت ${profit.toFixed(2)} USDT`;
      } else {
        this.result = `😢 خسارة! المضاعف ${this.limboResult.toFixed(2)}x`;
      }
      
      setTimeout(() => {
        this.limboStarted = false;
      }, 3000);
    },
    
    /* ===== Blackjack ===== */
    createDeck() {
      const suits = ['♥', '♦', '♣', '♠'];
      const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
      const deck = [];
      for (let suit of suits) {
        for (let value of values) {
          deck.push(value + suit);
        }
      }
      return this.shuffle(deck);
    },
    
    shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    },
    
    getCardValue(card) {
      const value = card.slice(0, -1);
      if (value === 'A') return 11;
      if (['K', 'Q', 'J'].includes(value)) return 10;
      return parseInt(value);
    },
    
    calculateHand(hand) {
      let sum = 0;
      let aces = 0;
      for (let card of hand) {
        const value = this.getCardValue(card);
        if (value === 11) aces++;
        sum += value;
      }
      while (sum > 21 && aces > 0) {
        sum -= 10;
        aces--;
      }
      return sum;
    },
    
    async startBlackjack() {
      if (!this.blackjackBet || this.blackjackBet <= 0) {
        this.gameError = "الرجاء إدخال مبلغ الرهان";
        return;
      }
      if (this.blackjackBet > this.balance) {
        this.gameError = "الرصيد غير كافي";
        return;
      }
      
      this.gameError = "";
      this.balance -= this.blackjackBet;
      await this.updateBalance(this.balance);
      
      this.blackjackStarted = true;
      this.blackjackGameOver = false;
      this.dealerRevealed = false;
      this.deck = this.createDeck();
      
      this.playerHand = [this.deck.pop(), this.deck.pop()];
      this.dealerHand = [this.deck.pop(), this.deck.pop()];
    },
    
    blackjackHit() {
      this.playerHand.push(this.deck.pop());
      if (this.calculateHand(this.playerHand) > 21) {
        this.blackjackStand();
      }
    },
    
    async blackjackStand() {
      this.dealerRevealed = true;
      
      while (this.calculateHand(this.dealerHand) < 17) {
        this.dealerHand.push(this.deck.pop());
      }
      
      const playerScore = this.calculateHand(this.playerHand);
      const dealerScore = this.calculateHand(this.dealerHand);
      
      this.blackjackGameOver = true;
      
      if (playerScore > 21) {
        this.blackjackWon = false;
        this.blackjackResult = "😢 خسرت! نقاطك تجاوزت 21";
        this.result = this.blackjackResult;
      } else if (dealerScore > 21) {
        this.blackjackWon = true;
        const profit = this.blackjackBet * 2;
        this.balance += profit;
        await this.updateBalance(this.balance);
        this.blackjackResult = `🎉 فوز! الموزع خسر ربحت ${profit.toFixed(2)} USDT`;
        this.result = this.blackjackResult;
      } else if (playerScore > dealerScore) {
        this.blackjackWon = true;
        const profit = this.blackjackBet * 2;
        this.balance += profit;
        await this.updateBalance(this.balance);
        this.blackjackResult = `🎉 فوز! ${playerScore} ضد ${dealerScore} ربحت ${profit.toFixed(2)} USDT`;
        this.result = this.blackjackResult;
      } else if (playerScore < dealerScore) {
        this.blackjackWon = false;
        this.blackjackResult = `😢 خسارة! ${playerScore} ضد ${dealerScore}`;
        this.result = this.blackjackResult;
      } else {
        this.blackjackWon = true;
        this.balance += this.blackjackBet;
        await this.updateBalance(this.balance);
        this.blackjackResult = `🤝 تعادل! استرداد الرهان`;
        this.result = this.blackjackResult;
      }
    },
    
    /* ===== Slot Machine ===== */
    async startSlot() {
      if (!this.slotBet || this.slotBet <= 0) {
        this.gameError = "الرجاء إدخال مبلغ الرهان";
        return;
      }
      if (this.slotBet > this.balance) {
        this.gameError = "الرصيد غير كافي";
        return;
      }
      
      this.gameError = "";
      this.balance -= this.slotBet;
      await this.updateBalance(this.balance);
      
      this.slotStarted = true;
      
      let spins = 0;
      const spinInterval = setInterval(() => {
        this.slotReels = [
          this.slotSymbols[Math.floor(Math.random() * this.slotSymbols.length)],
          this.slotSymbols[Math.floor(Math.random() * this.slotSymbols.length)],
          this.slotSymbols[Math.floor(Math.random() * this.slotSymbols.length)]
        ];
        spins++;
        
        if (spins >= 10) {
          clearInterval(spinInterval);
          this.checkSlotWin();
        }
      }, 100);
    },
    
    async checkSlotWin() {
      const [a, b, c] = this.slotReels;
      this.slotWon = a === b && b === c;
      
      if (this.slotWon) {
        let multiplier = 1;
        if (a === '7') multiplier = 10;
        else if (a === '💎') multiplier = 8;
        else if (a === '🔔') multiplier = 5;
        else multiplier = 3;
        
        const profit = this.slotBet * multiplier;
        this.balance += profit;
        await this.updateBalance(this.balance);
        this.slotResult = `🎉 فوز! ربحت ${profit.toFixed(2)} USDT`;
        this.result = this.slotResult;
      } else {
        this.slotResult = "😢 للأسف لا فوز";
        this.result = this.slotResult;
      }
      
      setTimeout(() => {
        this.slotStarted = false;
      }, 3000);
    },
    
    /* ===== Coinflip ===== */
    async startCoinflip() {
      if (!this.coinflipBet || this.coinflipBet <= 0) {
        this.gameError = "الرجاء إدخال مبلغ الرهان";
        return;
      }
      if (!this.coinflipChoice) {
        this.gameError = "اختر صورة أو كتابة";
        return;
      }
      if (this.coinflipBet > this.balance) {
        this.gameError = "الرصيد غير كافي";
        return;
      }
      
      this.gameError = "";
      this.balance -= this.coinflipBet;
      await this.updateBalance(this.balance);
      
      this.coinflipStarted = true;
      this.coinflipFlipping = true;
      
      setTimeout(() => {
        this.coinflipResult = Math.random() < 0.5 ? "صورة" : "كتابة";
        this.coinflipWon = this.coinflipResult === this.coinflipChoice;
        this.coinflipFlipping = false;
        
        if (this.coinflipWon) {
          const profit = this.coinflipBet * 2;
          this.balance += profit;
          this.updateBalance(this.balance);
          this.result = `🎉 فوز! ربحت ${profit.toFixed(2)} USDT`;
        } else {
          this.result = `😢 خسارة! كانت النتيجة ${this.coinflipResult}`;
        }
      }, 2000);
    },
    
    /* ===== Wheel Spin ===== */
    async startWheel() {
      if (!this.wheelBet || this.wheelBet <= 0) {
        this.gameError = "الرجاء إدخال مبلغ الرهان";
        return;
      }
      if (this.wheelBet > this.balance) {
        this.gameError = "الرصيد غير كافي";
        return;
      }
      
      this.gameError = "";
      this.balance -= this.wheelBet;
      await this.updateBalance(this.balance);
      
      this.wheelStarted = true;
      const spins = 5 + Math.floor(Math.random() * 10);
      const targetIndex = Math.floor(Math.random() * 8);
      const targetRotation = 360 * spins + (targetIndex * 45);
      
      this.wheelRotation = 0;
      const interval = setInterval(() => {
        this.wheelRotation += 15;
        if (this.wheelRotation >= targetRotation) {
          clearInterval(interval);
          const multiplier = this.wheelMultipliers[targetIndex];
          const profit = this.wheelBet * multiplier;
          this.balance += profit;
          this.updateBalance(this.balance);
          this.wheelResult = `🎉 وقفت على x${multiplier} ربحت ${profit.toFixed(2)} USDT`;
          this.result = this.wheelResult;
        }
      }, 20);
    },
    
    /* ===== Keno ===== */
    async startKeno() {
      if (!this.kenoBet || this.kenoBet <= 0) {
        this.gameError = "الرجاء إدخال مبلغ الرهان";
        return;
      }
      if (this.kenoBet > this.balance) {
        this.gameError = "الرصيد غير كافي";
        return;
      }
      
      this.gameError = "";
      this.balance -= this.kenoBet;
      await this.updateBalance(this.balance);
      
      this.kenoStarted = true;
      this.kenoSelected = [];
      this.kenoDrawn = [];
    },
    
    toggleKenoNumber(n) {
      if (this.kenoDrawn.length > 0) return;
      
      const index = this.kenoSelected.indexOf(n);
      if (index === -1) {
        if (this.kenoSelected.length < 10) {
          this.kenoSelected.push(n);
        }
      } else {
        this.kenoSelected.splice(index, 1);
      }
    },
    
    async drawKeno() {
      if (this.kenoSelected.length === 0) return;
      
      this.kenoDrawn = [];
      const numbers = Array.from({ length: 40 }, (_, i) => i + 1);
      
      for (let i = 0; i < 20; i++) {
        const index = Math.floor(Math.random() * numbers.length);
        this.kenoDrawn.push(numbers[index]);
        numbers.splice(index, 1);
      }
      
      this.kenoMatches = this.kenoSelected.filter(n => this.kenoDrawn.includes(n)).length;
      
      const multipliers = [0, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
      const multiplier = multipliers[this.kenoMatches] || 0;
      
      if (multiplier > 0) {
        const profit = this.kenoBet * multiplier;
        this.balance += profit;
        await this.updateBalance(this.balance);
        this.result = `🎉 ${this.kenoMatches} أرقام متطابقة! ربحت ${profit.toFixed(2)} USDT`;
      } else {
        this.result = `😢 ${this.kenoMatches} أرقام متطابقة. لا فوز`;
      }
    },
    
    /* ===== Bowling ===== */
    async startBowling() {
      if (!this.bowlingBet || this.bowlingBet <= 0) {
        this.gameError = "الرجاء إدخال مبلغ الرهان";
        return;
      }
      if (this.bowlingBet > this.balance) {
        this.gameError = "الرصيد غير كافي";
        return;
      }
      
      this.gameError = "";
      this.balance -= this.bowlingBet;
      await this.updateBalance(this.balance);
      
      this.bowlingStarted = true;
      this.bowlingRolling = true;
      this.bowlingKnocked = [];
      
      setTimeout(() => {
        const knocked = Math.floor(Math.random() * 11);
        this.bowlingKnocked = Array.from({ length: knocked }, (_, i) => i + 1);
        this.bowlingRolling = false;
        
        let multiplier = 1;
        if (knocked === 10) multiplier = 3;
        else if (knocked >= 8) multiplier = 2;
        else if (knocked >= 5) multiplier = 1.5;
        
        const profit = this.bowlingBet * multiplier;
        this.balance += profit;
        this.updateBalance(this.balance);
        
        if (knocked === 10) {
          this.bowlingResult = `🎳 سترايك! ربحت ${profit.toFixed(2)} USDT`;
        } else {
          this.bowlingResult = `🎳 ضربت ${knocked} قوارير ربحت ${profit.toFixed(2)} USDT`;
        }
        this.result = this.bowlingResult;
      }, 2000);
    },
    
    /* ===== Puzzle ===== */
    async startPuzzle() {
      if (!this.puzzleBet || this.puzzleBet <= 0) {
        this.gameError = "الرجاء إدخال مبلغ الرهان";
        return;
      }
      if (this.puzzleBet > this.balance) {
        this.gameError = "الرصيد غير كافي";
        return;
      }
      
      this.gameError = "";
      this.balance -= this.puzzleBet;
      await this.updateBalance(this.balance);
      
      this.puzzleStarted = true;
      this.puzzleSolved = false;
      
      let pieces = [1, 2, 3, 4, 5, 6, 7, 8, null];
      pieces = this.shuffle(pieces);
      this.puzzlePieces = pieces;
    },
    
    movePuzzle(index) {
      if (this.puzzleSolved) return;
      
      const emptyIndex = this.puzzlePieces.indexOf(null);
      const validMoves = [
        emptyIndex - 1, emptyIndex + 1,
        emptyIndex - 3, emptyIndex + 3
      ];
      
      if (validMoves.includes(index)) {
        this.puzzlePieces[emptyIndex] = this.puzzlePieces[index];
        this.puzzlePieces[index] = null;
      }
      
      if (JSON.stringify(this.puzzlePieces) === JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, null])) {
        this.puzzleSolved = true;
        const profit = this.puzzleBet * 5;
        this.balance += profit;
        this.updateBalance(this.balance);
        this.result = `🧩 أحسنت! حللت اللغز وربحت ${profit.toFixed(2)} USDT`;
      }
    },
    
    /* ===== Target Shot ===== */
    async startTarget() {
      if (!this.targetBet || this.targetBet <= 0) {
        this.gameError = "الرجاء إدخال مبلغ الرهان";
        return;
      }
      if (this.targetBet > this.balance) {
        this.gameError = "الرصيد غير كافي";
        return;
      }
      
      this.gameError = "";
      this.balance -= this.targetBet;
      await this.updateBalance(this.balance);
      
      this.targetStarted = true;
      this.targetScore = 0;
    },
    
    async shootTarget(score) {
      const hit = Math.random() < 0.7;
      
      if (hit) {
        this.targetScore += score;
        this.targetResult = `🎯 أصابت الهدف! +${score} نقطة`;
      } else {
        this.targetResult = "😢 أخطأت الهدف";
      }
      
      if (this.targetScore >= 20) {
        const multiplier = 2 + (this.targetScore / 10);
        const profit = this.targetBet * multiplier;
        this.balance += profit;
        await this.updateBalance(this.balance);
        this.targetResult = `🎉 فوز! مجموع النقاط ${this.targetScore} ربحت ${profit.toFixed(2)} USDT`;
        this.result = this.targetResult;
        this.targetStarted = false;
      }
    },
    
    /* ===== Lucky Number ===== */
    async startLucky() {
      if (!this.luckyBet || this.luckyBet <= 0) {
        this.gameError = "الرجاء إدخال مبلغ الرهان";
        return;
      }
      if (!this.luckyNumber || this.luckyNumber < 1 || this.luckyNumber > 100) {
        this.gameError = "أدخل رقم بين 1 و 100";
        return;
      }
      if (this.luckyBet > this.balance) {
        this.gameError = "الرصيد غير كافي";
        return;
      }
      
      this.gameError = "";
      this.balance -= this.luckyBet;
      await this.updateBalance(this.balance);
      
      this.luckyStarted = true;
      this.luckyDrawn = Math.floor(Math.random() * 100) + 1;
      this.luckyWon = this.luckyDrawn === this.luckyNumber;
      
      if (this.luckyWon) {
        const profit = this.luckyBet * 50;
        this.balance += profit;
        await this.updateBalance(this.balance);
        this.result = `🎉 رقم محظوظ! ربحت ${profit.toFixed(2)} USDT`;
      } else {
        this.result = `😢 الرقم المسحوب ${this.luckyDrawn}`;
      }
      
      setTimeout(() => {
        this.luckyStarted = false;
      }, 3000);
    },
    
    /* ===== Mystery Box ===== */
    async startMystery() {
      if (!this.mysteryBet || this.mysteryBet <= 0) {
        this.gameError = "الرجاء إدخال مبلغ الرهان";
        return;
      }
      if (this.mysteryBet > this.balance) {
        this.gameError = "الرصيد غير كافي";
        return;
      }
      
      this.gameError = "";
      this.balance -= this.mysteryBet;
      await this.updateBalance(this.balance);
      
      this.mysteryStarted = true;
      this.mysteryOpened = false;
    },
    
    async openMysteryBox() {
      if (this.mysteryOpened) return;
      
      this.mysteryOpened = true;
      
      const prizes = [0.5, 1, 1.5, 2, 3, 5, 10];
      const weights = [0.2, 0.3, 0.2, 0.15, 0.1, 0.04, 0.01];
      
      let random = Math.random();
      let cumulative = 0;
      let multiplier = 1;
      
      for (let i = 0; i < weights.length; i++) {
        cumulative += weights[i];
        if (random < cumulative) {
          multiplier = prizes[i];
          break;
        }
      }
      
      const profit = this.mysteryBet * multiplier;
      this.balance += profit;
      await this.updateBalance(this.balance);
      
      if (multiplier >= 1) {
        this.mysteryPrize = `💰 ${profit.toFixed(2)} USDT`;
        this.mysteryResult = `🎉 ربحت ${profit.toFixed(2)} USDT!`;
      } else {
        this.mysteryPrize = `😢 ${profit.toFixed(2)} USDT`;
        this.mysteryResult = `😢 خسرت جزء من الرهان`;
      }
      
      this.result = this.mysteryResult;
    }
  }
};    
</script>    
    
<style scoped>    
/* الخلفية الرئيسية - أسود فاخر */
.game-page {    
  background: #0A0C10;
  min-height: 100vh;    
  color: #ffffff;    
  padding: 20px;    
  text-align: center;    
  direction: rtl;
  font-family: 'Cairo', sans-serif;
}    

/* الشريط العلوي */
.top-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 25px;
}

.balance-gold {
  background: #11151C;
  padding: 12px 25px;
  border-radius: 50px;
  border: 1px solid #D4AF37;
  box-shadow: 0 5px 20px rgba(212, 175, 55, 0.2);
  display: flex;
  align-items: center;
  gap: 10px;
}

.balance-gold i {
  color: #D4AF37;
  font-size: 20px;
}

.balance-gold strong {
  color: #D4AF37;
  font-size: 18px;
  margin-right: 5px;
}

/* التبويبات */
.tabs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-bottom: 25px;
  max-height: 200px;
  overflow-y: auto;
  padding: 10px;
  background: #11151C;
  border-radius: 20px;
  scrollbar-width: thin;
  scrollbar-color: #D4AF37 #1A1F2A;
}

.tabs::-webkit-scrollbar {
  width: 8px;
}

.tabs::-webkit-scrollbar-track {
  background: #1A1F2A;
  border-radius: 10px;
}

.tabs::-webkit-scrollbar-thumb {
  background: #D4AF37;
  border-radius: 10px;
}

.tabs button {
  padding: 10px 15px;
  border-radius: 50px;
  background: #1A1F2A;
  color: #ffffff;
  border: 1px solid rgba(212, 175, 55, 0.2);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.tabs button:hover {
  border-color: #D4AF37;
  transform: translateY(-2px);
}

.tabs .active {
  background: linear-gradient(135deg, #D4AF37, #F6E27A, #C5A028);
  color: #0A0C10;
  border: none;
  box-shadow: 0 5px 20px rgba(212, 175, 55, 0.3);
}

.tab-icon {
  font-size: 18px;
}

.tab-text {
  font-size: 12px;
}

/* البطاقات */
.game-container {
  max-width: 500px;
  margin: 0 auto;
}

.card {
  background: #11151C;
  border-radius: 30px;
  padding: 20px;
  border: 1px solid rgba(212, 175, 55, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.03) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.card-header {
  position: relative;
  margin-bottom: 15px;
}

.card-header h2 {
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #D4AF37, #F6E27A, #C5A028);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  z-index: 1;
}

.header-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, transparent 70%);
  filter: blur(30px);
  z-index: 0;
}

.game-icon {
  font-size: 60px;
  margin: 20px 0;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* ===== Chicken Road Styles ===== */
.chicken-card .chicken-container {
  margin: 20px auto;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.chicken {
  font-size: 80px;
  animation: bounce 2s infinite;
  position: relative;
  z-index: 2;
}

.chicken-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%);
  filter: blur(20px);
  border-radius: 50%;
}

.road {
  display: flex;
  justify-content: space-between;
  margin: 20px 0;
  background: #1A1F2A;
  padding: 15px;
  border-radius: 20px;
  gap: 5px;
}

.step {
  flex: 1;
  background: #1E2430;
  border-radius: 12px;
  padding: 10px 2px;
  font-size: 12px;
  position: relative;
  min-height: 70px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px solid rgba(212, 175, 55, 0.1);
  transition: all 0.3s ease;
}

.step.active {
  background: linear-gradient(135deg, #D4AF37, #F6E27A);
  color: #0A0C10;
  transform: scale(1.05);
  box-shadow: 0 10px 25px rgba(212, 175, 55, 0.3);
}

.gold-step {
  border-color: #D4AF37;
}

.silver-step {
  border-color: #C0C0C0;
}

.multiplier {
  font-weight: 700;
  font-size: 14px;
}

.step-check {
  position: absolute;
  top: 2px;
  left: 2px;
  color: #22c55e;
  font-size: 14px;
}

.chicken-icon {
  font-size: 24px;
  margin-top: 5px;
  filter: drop-shadow(0 5px 10px rgba(0, 0, 0, 0.3));
}

/* قسم الرهان */
.bet-section {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid rgba(212, 175, 55, 0.2);
}

.bet-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}

.input-gold-wrapper {
  position: relative;
  width: 200px;
}

.gold-input {
  width: 100%;
  padding: 12px 20px;
  border-radius: 50px;
  background: #1A1F2A;
  color: #ffffff;
  border: 2px solid rgba(212, 175, 55, 0.3);
  font-size: 16px;
  text-align: center;
  transition: all 0.3s ease;
}

.gold-input:focus {
  outline: none;
  border-color: #D4AF37;
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
}

.input-currency {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #D4AF37;
  font-weight: 600;
}

.gold-button {
  background: linear-gradient(135deg, #D4AF37, #F6E27A, #C5A028);
  color: #0A0C10;
  border: none;
  padding: 12px 35px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 5px 20px rgba(212, 175, 55, 0.3);
}

.gold-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(212, 175, 55, 0.4);
}

.gold-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* عناصر التحكم أثناء اللعبة */
.game-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.game-controls-full {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profit-display {
  background: #1A1F2A;
  padding: 15px;
  border-radius: 16px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.profit-label {
  color: rgba(255, 255, 255, 0.7);
  margin-left: 10px;
}

.profit-value {
  color: #D4AF37;
  font-size: 20px;
  font-weight: 800;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 12px 25px;
  border-radius: 50px;
  border: none;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn.gold {
  background: linear-gradient(135deg, #D4AF37, #F6E27A);
  color: #0A0C10;
}

.action-btn.green {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
}

/* رسائل الخطأ */
.error-message {
  color: #ef4444;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(239, 68, 68, 0.1);
  padding: 5px 12px;
  border-radius: 20px;
  border: 1px solid #ef4444;
}

/* نتيجة اللعبة */
.result-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #11151C;
  padding: 20px 40px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 20px;
  font-weight: 700;
  z-index: 1000;
  border: 2px solid;
  animation: popIn 0.3s ease;
}

.result-popup.win {
  border-color: #D4AF37;
  box-shadow: 0 0 30px rgba(212, 175, 55, 0.3);
}

.result-popup.win i {
  color: #D4AF37;
}

.result-popup.lose {
  border-color: #ef4444;
  box-shadow: 0 0 30px rgba(239, 68, 68, 0.3);
}

.result-popup.lose i {
  color: #ef4444;
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: translate(-50%, -40%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

/* Dice */
.slider-container {
  width: 100%;
  text-align: center;
  color: #D4AF37;
  font-weight: 600;
}

.gold-slider {
  width: 100%;
  height: 8px;
  border-radius: 10px;
  background: #1A1F2A;
  outline: none;
  -webkit-appearance: none;
}

.gold-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #D4AF37;
  cursor: pointer;
  box-shadow: 0 0 10px #D4AF37;
}

.multiplier-display {
  font-size: 24px;
  font-weight: 800;
  color: #D4AF37;
  text-align: center;
  margin: 10px 0;
}

.dice-result {
  font-size: 60px;
  font-weight: 800;
  color: #D4AF37;
  text-align: center;
  animation: roll 0.5s ease;
}

@keyframes roll {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.result-text {
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  margin-top: 10px;
}

.result-box {
  background: #1A1F2A;
  padding: 20px;
  border-radius: 20px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.win-text {
  color: #22c55e;
}

.lose-text {
  color: #ef4444;
}

/* Mines */
.mines-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin: 15px 0;
}

.mine-cell {
  aspect-ratio: 1;
  background: #1E2430;
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #D4AF37;
}

.mine-cell:hover:not(:disabled) {
  background: #2A2F3A;
  transform: scale(1.05);
  border-color: #D4AF37;
}

.mine-cell.revealed {
  background: #2A2F3A;
}

.mine-cell.mine {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.mine-cell.safe {
  background: #22c55e;
  color: white;
  border-color: #22c55e;
}

.mine-cell:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

/* Crash */
.crash-display {
  text-align: center;
  padding: 20px;
  background: #1A1F2A;
  border-radius: 20px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.multiplier-box {
  font-size: 48px;
  font-weight: 800;
  color: #D4AF37;
  margin-bottom: 15px;
  transition: all 0.3s ease;
}

.multiplier-box.crashed {
  color: #ef4444;
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.rocket {
  font-size: 40px;
  margin: 10px 0;
  transition: all 0.3s ease;
}

.rocket.launched {
  transform: translateY(-20px);
}

.rocket.crashed {
  transform: translateY(20px) rotate(90deg);
  opacity: 0.5;
}

.crash-progress {
  width: 100%;
  height: 10px;
  border-radius: 10px;
  background: #1E2430;
}

.crash-progress::-webkit-progress-value {
  background: linear-gradient(90deg, #22c55e, #D4AF37, #ef4444);
  border-radius: 10px;
}

/* Blackjack */
.blackjack-table {
  background: #1E2430;
  padding: 20px;
  border-radius: 20px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.dealer-hand, .player-hand {
  margin: 10px 0;
  padding: 10px;
  background: #11151C;
  border-radius: 10px;
  font-size: 18px;
}

.card {
  display: inline-block;
  padding: 5px 10px;
  margin: 0 3px;
  background: white;
  color: #0A0C10;
  border-radius: 5px;
  font-weight: 700;
}

/* Slot Machine */
.slot-machine {
  background: #1E2430;
  padding: 20px;
  border-radius: 20px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.slot-row {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.slot-reel {
  width: 80px;
  height: 80px;
  background: #11151C;
  border: 2px solid #D4AF37;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  animation: spin 0.1s linear infinite;
}

@keyframes spin {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* Coinflip */
.choice-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.choice-btn {
  padding: 10px 20px;
  border-radius: 50px;
  background: #1A1F2A;
  color: white;
  border: 1px solid rgba(212, 175, 55, 0.2);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
}

.choice-btn.active {
  background: linear-gradient(135deg, #D4AF37, #F6E27A);
  color: #0A0C10;
  border: none;
}

.coin {
  font-size: 80px;
  text-align: center;
  margin: 20px 0;
  animation: flip 0.5s ease;
}

@keyframes flip {
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(360deg); }
}

.coin.flipping {
  animation: flip 0.2s linear infinite;
}

/* Wheel */
.wheel-container {
  position: relative;
  height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 0;
}

.wheel {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: #1E2430;
  border: 3px solid #D4AF37;
  position: relative;
  transition: transform 2s cubic-bezier(0.25, 0.1, 0.15, 1);
}

.wheel-segment {
  position: absolute;
  width: 50%;
  height: 50%;
  transform-origin: bottom right;
  left: 50%;
  top: 50%;
  margin-left: -50%;
  margin-top: -50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #D4AF37;
}

.wheel-segment:nth-child(1) { transform: rotate(0deg) translateX(-50%) translateY(-50%); }
.wheel-segment:nth-child(2) { transform: rotate(45deg) translateX(-50%) translateY(-50%); }
.wheel-segment:nth-child(3) { transform: rotate(90deg) translateX(-50%) translateY(-50%); }
.wheel-segment:nth-child(4) { transform: rotate(135deg) translateX(-50%) translateY(-50%); }
.wheel-segment:nth-child(5) { transform: rotate(180deg) translateX(-50%) translateY(-50%); }
.wheel-segment:nth-child(6) { transform: rotate(225deg) translateX(-50%) translateY(-50%); }
.wheel-segment:nth-child(7) { transform: rotate(270deg) translateX(-50%) translateY(-50%); }
.wheel-segment:nth-child(8) { transform: rotate(315deg) translateX(-50%) translateY(-50%); }

.wheel-pointer {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 30px;
  color: #D4AF37;
  z-index: 10;
}

/* Keno */
.keno-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 5px;
  margin: 15px 0;
}

.keno-cell {
  aspect-ratio: 1;
  background: #1E2430;
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
}

.keno-cell.selected {
  background: #D4AF37;
  color: #0A0C10;
}

.keno-cell.drawn {
  background: #22c55e;
  color: white;
}

.keno-cell.match {
  background: #D4AF37;
  color: #0A0C10;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* Bowling */
.bowling-alley {
  background: #1E2430;
  padding: 20px;
  border-radius: 20px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.pins {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
  margin-bottom: 30px;
}

.pin {
  font-size: 24px;
  text-align: center;
  opacity: 1;
  transition: all 0.5s ease;
}

.pin.knocked {
  opacity: 0.3;
  transform: rotate(90deg);
}

.bowling-ball {
  font-size: 30px;
  text-align: center;
  transition: transform 1s ease;
}

.bowling-ball.rolling {
  transform: translateX(100px);
}

/* Puzzle */
.puzzle-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
  margin: 20px 0;
  background: #1E2430;
  padding: 10px;
  border-radius: 10px;
}

.puzzle-piece {
  aspect-ratio: 1;
  background: #D4AF37;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: #0A0C10;
  cursor: pointer;
  transition: all 0.3s ease;
}

.puzzle-piece.empty {
  background: #1E2430;
  border: 1px dashed #D4AF37;
}

.puzzle-piece:hover:not(.empty) {
  transform: scale(1.05);
  box-shadow: 0 0 15px #D4AF37;
}

/* Target */
.target-container {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.target {
  position: relative;
  width: 200px;
  height: 200px;
}

.target-circle {
  position: absolute;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.target-circle:hover {
  transform: scale(1.1);
}

.bullseye {
  width: 60px;
  height: 60px;
  background: #ef4444;
  top: 70px;
  left: 70px;
  font-size: 30px;
}

.middle {
  width: 100px;
  height: 100px;
  background: #22c55e;
  top: 50px;
  left: 50px;
  border: 2px solid #D4AF37;
}

.outer {
  width: 140px;
  height: 140px;
  background: #1E2430;
  top: 30px;
  left: 30px;
  border: 2px solid #D4AF37;
}

/* Lucky Number */
.lucky-display {
  background: #1E2430;
  padding: 20px;
  border-radius: 20px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.drawn-number {
  font-size: 60px;
  font-weight: 800;
  color: #D4AF37;
  margin-bottom: 15px;
}

/* Mystery Box */
.mystery-box-container {
  text-align: center;
  margin: 20px 0;
}

.box {
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, #D4AF37, #C5A028);
  margin: 0 auto 20px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  cursor: pointer;
  transition: all 0.5s ease;
  box-shadow: 0 10px 30px rgba(212, 175, 55, 0.3);
}

.box:hover {
  transform: scale(1.05);
  box-shadow: 0 15px 40px rgba(212, 175, 55, 0.4);
}

.box.opened {
  background: #1E2430;
  border: 2px solid #D4AF37;
  font-size: 24px;
  color: #D4AF37;
}

/* تحسينات للجوال */
@media (max-width: 480px) {
  .game-page {
    padding: 10px;
  }

  .tabs {
    padding: 5px;
  }

  .tabs button {
    padding: 8px 12px;
    font-size: 12px;
  }

  .card {
    padding: 15px;
  }

  .card-header h2 {
    font-size: 20px;
  }

  .game-icon {
    font-size: 50px;
  }

  .step {
    padding: 8px 1px;
    font-size: 10px;
    min-height: 60px;
  }

  .multiplier {
    font-size: 12px;
  }

  .result-popup {
    padding: 15px 25px;
    font-size: 16px;
  }

  .input-gold-wrapper {
    width: 100%;
  }

  .gold-button {
    width: 100%;
    justify-content: center;
  }

  .action-btn {
    flex: 1;
    justify-content: center;
  }

  .slot-reel {
    width: 60px;
    height: 60px;
    font-size: 30px;
  }

  .mines-grid {
    gap: 5px;
  }

  .mine-cell {
    font-size: 16px;
  }

  .keno-cell {
    font-size: 12px;
  }
}
</style>
