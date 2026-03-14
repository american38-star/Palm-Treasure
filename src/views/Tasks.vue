<template>
  <div class="game-page">
    <!-- الرصيد -->
    <div class="top-bar">
      <div class="balance-gold">
        <i class="fas fa-coins"></i>
        <span>رصيدك: <strong>{{ balance.toFixed(2) }} USDT</strong></span>
      </div>
    </div>

    <!-- رسالة الفوز/الخسارة -->
    <transition name="slide-fade">
      <div v-if="showResultMessage" class="result-message" :class="resultType">
        <i :class="resultIcon"></i>
        <span>{{ resultText }}</span>
      </div>
    </transition>

    <!-- زر الرجوع عندما تكون اللعبة مفتوحة -->
    <div v-if="gameOpened" class="back-button-container">
      <button @click="closeGame" class="back-button">
        <i class="fas fa-arrow-right"></i>
        رجوع إلى الألعاب
      </button>
    </div>

    <!-- التبويبات - تظهر فقط عندما لا تكون اللعبة مفتوحة -->
    <div v-if="!gameOpened" class="tabs">
      <button 
        v-for="tab in gamesList" 
        :key="tab.id"
        :class="{active: selectedGame === tab.id}" 
        @click="openGame(tab.id)"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-text">{{ tab.name }}</span>
      </button>
    </div>

    <!-- عرض اللعبة المختارة - تظهر بملء الشاشة -->
    <div v-if="gameOpened" class="game-fullscreen">
      <!-- لعبة عجلة الحظ -->
      <div v-if="selectedGame === 'wheel-of-fortune'" class="wheel-card">
        <div class="wheel-header">
          <h2>🎡 WHEEL OF FORTUNE</h2>
          <div class="header-glow"></div>
        </div>

        <div class="wheel-content">
          <!-- العجلة -->
          <div class="wheel-container">
            <div class="wheel" :style="{ transform: `rotate(${wheelRotation}deg)` }">
              <div v-for="(segment, index) in wheelSegments" 
                   :key="index"
                   class="wheel-segment"
                   :style="{ transform: `rotate(${index * 45}deg)` }"
                   :class="getSegmentColorClass(index)">
                <span class="segment-value">{{ segment.value }}x</span>
              </div>
            </div>
            <div class="wheel-pointer">▼</div>
          </div>

          <!-- معلومات الجائزة الكبرى -->
          <div class="jackpot-info" v-if="showJackpot">
            <div class="jackpot-glow"></div>
            <span class="jackpot-label">الجائزة الكبرى</span>
            <span class="jackpot-value">{{ jackpotAmount.toFixed(2) }} USDT</span>
          </div>

          <!-- لوحة الرهان -->
          <div class="betting-board">
            <div class="segment-selector">
              <button 
                v-for="(segment, index) in wheelSegments" 
                :key="index"
                @click="selectSegment(index)"
                :class="['segment-btn', getSegmentColorClass(index), { active: selectedSegment === index }]"
              >
                <span class="segment-multiplier">{{ segment.value }}x</span>
                <span class="segment-chance">{{ segment.chance }}%</span>
              </button>
            </div>

            <!-- حقل الرهان -->
            <div class="bet-section">
              <div class="bet-input-wrapper">
                <span class="bet-icon">💰</span>
                <input
                  type="number"
                  v-model.number="betAmount"
                  placeholder="مبلغ الرهان"
                  class="bet-input"
                  min="0.01"
                  step="0.01"
                  :disabled="isSpinning"
                />
                <span class="bet-currency">USDT</span>
              </div>

              <div v-if="betAmount > balance" class="error-message">
                ❌ الرصيد غير كافي
              </div>

              <div v-if="gameError" class="error-message">
                ❌ {{ gameError }}
              </div>

              <div class="multiplier-info" v-if="selectedSegment !== null">
                <span>المضاعف المحتمل:</span>
                <span class="multiplier-value">{{ wheelSegments[selectedSegment].value }}x</span>
              </div>

              <button 
                @click="spinWheel"
                class="spin-btn"
                :disabled="!canSpin || isSpinning"
              >
                <span v-if="!isSpinning">🎡 دير العجلة</span>
                <span v-else>جاري الدوران...</span>
              </button>
            </div>

            <!-- نتيجة الجولة -->
            <div v-if="lastResult" class="last-result" :class="{ 'win': lastResult.isWin, 'lose': !lastResult.isWin }">
              <div class="result-icon">{{ lastResult.isWin ? '🎉' : '😢' }}</div>
              <div class="result-details">
                <span class="result-text">{{ lastResult.message }}</span>
                <span v-if="lastResult.isWin" class="result-amount">+{{ lastResult.winAmount.toFixed(2) }} USDT</span>
                <span v-else class="result-segment">x{{ lastResult.segmentValue }}</span>
              </div>
            </div>

            <!-- إحصائيات -->
            <div class="statistics">
              <div class="stat-item">
                <span class="stat-label">أعلى مضاعف</span>
                <span class="stat-value">{{ maxMultiplier }}x</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">أقل مضاعف</span>
                <span class="stat-value">{{ minMultiplier }}x</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">فرصة الفوز</span>
                <span class="stat-value">{{ winChance }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { auth, db } from "../firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"

export default {
  name: "Games",
  
  data() {
    return {
      gameOpened: false,
      selectedGame: "wheel-of-fortune",
      showResultMessage: false,
      resultType: '',
      resultIcon: '',
      resultText: '',
      resultTimeout: null,
      
      gamesList: [
        { id: 'wheel-of-fortune', name: 'Wheel of Fortune', icon: '🎡' }
      ],
      
      balance: 0,
      gameError: "",
      
      // بيانات عجلة الحظ
      wheelRotation: 0,
      isSpinning: false,
      betAmount: null,
      selectedSegment: null,
      
      // أجزاء العجلة (8 أجزاء)
      wheelSegments: [
        { value: 10, chance: 5 },   // 10x (نادر)
        { value: 5, chance: 10 },    // 5x
        { value: 3, chance: 15 },    // 3x
        { value: 2, chance: 20 },    // 2x
        { value: 1.5, chance: 20 },  // 1.5x
        { value: 1, chance: 15 },    // 1x
        { value: 0.5, chance: 10 },  // 0.5x
        { value: 0.2, chance: 5 }    // 0.2x (خسارة كبيرة)
      ],
      
      lastResult: null,
      
      // الجائزة الكبرى
      showJackpot: true,
      jackpotAmount: 10000,
      
      // ألوان الأجزاء
      segmentColors: ['gold', 'silver', 'bronze', 'blue', 'green', 'purple', 'orange', 'red']
    }
  },
  
  computed: {
    canSpin() {
      return this.betAmount && 
             this.betAmount > 0 && 
             this.betAmount <= this.balance && 
             this.selectedSegment !== null && 
             !this.isSpinning
    },
    
    maxMultiplier() {
      return Math.max(...this.wheelSegments.map(s => s.value))
    },
    
    minMultiplier() {
      return Math.min(...this.wheelSegments.map(s => s.value))
    },
    
    winChance() {
      // حساب فرصة الفوز (المضاعف >= 1)
      const winSegments = this.wheelSegments.filter(s => s.value >= 1)
      const totalChance = winSegments.reduce((sum, s) => sum + s.chance, 0)
      return totalChance
    }
  },
  
  async created() {
    const user = auth.currentUser
    if (!user) return
    
    const snap = await getDoc(doc(db, "users", user.uid))
    if (snap.exists()) {
      this.balance = Number(snap.data().balance || 0)
    }
    
    // تحديث الجائزة الكبرى بشكل عشوائي
    this.updateJackpot()
    setInterval(() => this.updateJackpot(), 30000) // كل 30 ثانية
  },
  
  methods: {
    openGame(gameId) {
      this.selectedGame = gameId
      this.gameOpened = true
      this.gameError = ""
      this.resetGame()
    },
    
    closeGame() {
      this.gameOpened = false
    },
    
    async updateBalance(newBalance) {
      this.balance = newBalance
      const user = auth.currentUser
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          balance: this.balance
        })
      }
    },
    
    showResult(message, isWin) {
      if (this.resultTimeout) clearTimeout(this.resultTimeout)
      
      this.resultText = message
      this.resultType = isWin ? 'win-message' : 'lose-message'
      this.resultIcon = isWin ? 'fas fa-trophy' : 'fas fa-skull'
      this.showResultMessage = true
      
      this.resultTimeout = setTimeout(() => {
        this.showResultMessage = false
      }, 2000)
    },
    
    // دوال عجلة الحظ
    getSegmentColorClass(index) {
      return this.segmentColors[index % this.segmentColors.length]
    },
    
    selectSegment(index) {
      this.selectedSegment = index
    },
    
    updateJackpot() {
      // تحديث الجائزة الكبرى بشكل عشوائي
      this.jackpotAmount = 5000 + Math.floor(Math.random() * 15000)
    },
    
    resetGame() {
      this.wheelRotation = 0
      this.isSpinning = false
      this.betAmount = null
      this.selectedSegment = null
      this.lastResult = null
      this.gameError = ''
    },
    
    async spinWheel() {
      if (!this.canSpin) return
      
      this.gameError = ''
      this.isSpinning = true
      
      // خصم الرهان
      this.balance -= this.betAmount
      await this.updateBalance(this.balance)
      
      // اختيار الجزء الفائز بناءً على النسب المئوية
      const winningIndex = this.getWinningSegment()
      const winningSegment = this.wheelSegments[winningIndex]
      
      // دوران العجلة
      const spins = 5 + Math.floor(Math.random() * 8)
      const targetRotation = 360 * spins + (winningIndex * 45)
      
      // أنيميشن الدوران
      const startTime = Date.now()
      const duration = 3000
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // منحنى التباطؤ
        const easeProgress = 1 - Math.pow(1 - progress, 3)
        this.wheelRotation = targetRotation * easeProgress
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          this.finishSpin(winningIndex, winningSegment)
        }
      }
      
      requestAnimationFrame(animate)
    },
    
    getWinningSegment() {
      // اختيار جزء بناءً على النسب المئوية
      const random = Math.random() * 100
      let cumulative = 0
      
      for (let i = 0; i < this.wheelSegments.length; i++) {
        cumulative += this.wheelSegments[i].chance
        if (random < cumulative) {
          return i
        }
      }
      
      return 0 // افتراضي
    },
    
    async finishSpin(winningIndex, winningSegment) {
      this.isSpinning = false
      
      // التحقق من الفوز
      const isWin = winningSegment.value >= 1
      const winAmount = this.betAmount * winningSegment.value
      
      // تحديث الرصيد في حالة الفوز
      if (isWin) {
        this.balance += winAmount
        await this.updateBalance(this.balance)
        
        // فرصة للجائزة الكبرى (إذا كان المضاعف 10x)
        if (winningSegment.value === 10) {
          this.balance += this.jackpotAmount
          await this.updateBalance(this.balance)
          this.showResult(`🎉 جاكبوت! ربحت ${(winAmount + this.jackpotAmount).toFixed(2)} USDT`, true)
        } else {
          this.showResult(`🎉 ربحت ${winAmount.toFixed(2)} USDT`, true)
        }
      } else {
        this.showResult(`😢 خسرت الرهان`, false)
      }
      
      // حفظ النتيجة الأخيرة
      this.lastResult = {
        segmentIndex: winningIndex,
        segmentValue: winningSegment.value,
        isWin,
        winAmount,
        message: isWin ? `فوز x${winningSegment.value}` : `خسارة x${winningSegment.value}`
      }
      
      // إعادة تعيين الرهان بعد 3 ثواني
      setTimeout(() => {
        this.betAmount = null
        this.selectedSegment = null
      }, 3000)
    }
  }
}
</script>

<style scoped>
/* ===== التصميم العام ===== */
.game-page {
  background: linear-gradient(135deg, #0a0f1e 0%, #1a1f2f 100%);
  min-height: 100vh;
  color: #ffffff;
  padding: 15px;
  text-align: center;
  direction: rtl;
  font-family: 'Montserrat', 'Cairo', sans-serif;
  position: relative;
  overflow-x: hidden;
}

/* ===== الشريط العلوي ===== */
.top-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  z-index: 10;
  position: relative;
}

.balance-gold {
  background: linear-gradient(145deg, #1e2333, #131826);
  padding: 12px 30px;
  border-radius: 100px;
  border: 1px solid #ffd700;
  box-shadow: 0 5px 20px rgba(255, 215, 0, 0.2), inset 0 0 10px rgba(255, 215, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
  backdrop-filter: blur(10px);
}

.balance-gold i {
  color: #ffd700;
  font-size: 22px;
  filter: drop-shadow(0 0 8px #ffd700);
}

.balance-gold strong {
  color: #ffd700;
  font-size: 20px;
  margin-right: 5px;
  text-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
}

/* ===== رسالة النتيجة ===== */
.result-message {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 15px 30px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 700;
  z-index: 9999;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border: 1px solid;
  backdrop-filter: blur(10px);
  min-width: 280px;
  justify-content: center;
}

.win-message {
  background: linear-gradient(145deg, #1a2f1a, #0f1f0f);
  border-color: #4caf50;
  box-shadow: 0 0 30px rgba(76, 175, 80, 0.3);
  color: #4caf50;
}

.win-message i {
  color: #4caf50;
  filter: drop-shadow(0 0 8px #4caf50);
}

.lose-message {
  background: linear-gradient(145deg, #2f1a1a, #1f0f0f);
  border-color: #f44336;
  box-shadow: 0 0 30px rgba(244, 67, 54, 0.3);
  color: #f44336;
}

.lose-message i {
  color: #f44336;
  filter: drop-shadow(0 0 8px #f44336);
}

.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-50%) translateY(-20px);
  opacity: 0;
}

/* ===== زر الرجوع ===== */
.back-button-container {
  margin-bottom: 20px;
  text-align: right;
}

.back-button {
  background: linear-gradient(145deg, #1e2333, #131826);
  color: #ffd700;
  border: 1px solid #ffd700;
  padding: 10px 25px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.back-button:hover {
  background: linear-gradient(135deg, #ffd700, #ffed4a);
  color: #0a0f1e;
  transform: translateX(-5px);
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
}

/* ===== التبويبات ===== */
.tabs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-bottom: 25px;
  max-height: 200px;
  overflow-y: auto;
  padding: 15px;
  background: rgba(30, 35, 51, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 215, 0, 0.2);
  scrollbar-width: thin;
  scrollbar-color: #ffd700 #1e2333;
}

.tabs button {
  padding: 12px 20px;
  border-radius: 50px;
  background: linear-gradient(145deg, #1e2333, #131826);
  color: #ffffff;
  border: 1px solid rgba(255, 215, 0, 0.3);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.tabs button:hover {
  border-color: #ffd700;
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
}

.tabs .active {
  background: linear-gradient(135deg, #ffd700, #ffed4a);
  color: #0a0f1e;
  border: none;
  box-shadow: 0 5px 25px rgba(255, 215, 0, 0.5);
}

/* ===== وضع ملء الشاشة ===== */
.game-fullscreen {
  min-height: calc(100vh - 150px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 10px 0;
}

/* ===== بطاقة عجلة الحظ ===== */
.wheel-card {
  background: rgba(20, 25, 40, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 40px;
  padding: 25px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  border: 1px solid rgba(255, 215, 0, 0.3);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), inset 0 0 50px rgba(255, 215, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.wheel-header {
  position: relative;
  margin-bottom: 25px;
  text-align: center;
}

.wheel-header h2 {
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, #ffd700, #ffed4a, #ffd700);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  z-index: 1;
  letter-spacing: 2px;
}

.header-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%);
  filter: blur(40px);
  z-index: 0;
}

/* ===== عجلة الحظ ===== */
.wheel-container {
  position: relative;
  width: 300px;
  height: 300px;
  margin: 20px auto;
}

.wheel {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(145deg, #2a2f3a, #1a1f2a);
  border: 4px solid #ffd700;
  position: relative;
  transition: transform 3s cubic-bezier(0.25, 0.1, 0.15, 1);
  box-shadow: 0 0 40px rgba(255, 215, 0, 0.3);
  overflow: hidden;
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
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.wheel-segment.gold {
  background: linear-gradient(135deg, #ffd700, #b8860b);
}

.wheel-segment.silver {
  background: linear-gradient(135deg, #c0c0c0, #808080);
}

.wheel-segment.bronze {
  background: linear-gradient(135deg, #cd7f32, #8b4513);
}

.wheel-segment.blue {
  background: linear-gradient(135deg, #4169e1, #1e3c72);
}

.wheel-segment.green {
  background: linear-gradient(135deg, #32cd32, #228b22);
}

.wheel-segment.purple {
  background: linear-gradient(135deg, #9370db, #4b0082);
}

.wheel-segment.orange {
  background: linear-gradient(135deg, #ffa500, #ff8c00);
}

.wheel-segment.red {
  background: linear-gradient(135deg, #f44336, #b22222);
}

.segment-value {
  transform: rotate(45deg);
  font-size: 18px;
  font-weight: 700;
  color: white;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.wheel-pointer {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 40px;
  color: #ffd700;
  filter: drop-shadow(0 0 10px #ffd700);
  z-index: 10;
  animation: pointerPulse 1.5s infinite;
}

@keyframes pointerPulse {
  0%, 100% { transform: translateX(-50%) scale(1); }
  50% { transform: translateX(-50%) scale(1.1); }
}

/* ===== الجائزة الكبرى ===== */
.jackpot-info {
  position: relative;
  text-align: center;
  margin: 20px 0;
  padding: 15px;
  background: linear-gradient(145deg, #2a1f0a, #1a150a);
  border-radius: 50px;
  border: 2px solid #ffd700;
  overflow: hidden;
}

.jackpot-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
  filter: blur(20px);
  animation: jackpotPulse 2s infinite;
}

@keyframes jackpotPulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.jackpot-label {
  display: block;
  color: #ffd700;
  font-size: 14px;
  margin-bottom: 5px;
  position: relative;
  z-index: 1;
}

.jackpot-value {
  display: block;
  color: #ffd700;
  font-size: 28px;
  font-weight: 800;
  text-shadow: 0 0 20px #ffd700;
  position: relative;
  z-index: 1;
}

/* ===== لوحة الرهان ===== */
.betting-board {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 30px;
  padding: 20px;
  border: 1px solid rgba(255, 215, 0, 0.2);
}

.segment-selector {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.segment-btn {
  padding: 15px 5px;
  border-radius: 15px;
  border: 2px solid transparent;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.segment-btn.gold {
  background: linear-gradient(135deg, #ffd700, #b8860b);
  color: #000;
}

.segment-btn.silver {
  background: linear-gradient(135deg, #c0c0c0, #808080);
  color: #000;
}

.segment-btn.bronze {
  background: linear-gradient(135deg, #cd7f32, #8b4513);
  color: #fff;
}

.segment-btn.blue {
  background: linear-gradient(135deg, #4169e1, #1e3c72);
  color: #fff;
}

.segment-btn.green {
  background: linear-gradient(135deg, #32cd32, #228b22);
  color: #000;
}

.segment-btn.purple {
  background: linear-gradient(135deg, #9370db, #4b0082);
  color: #fff;
}

.segment-btn.orange {
  background: linear-gradient(135deg, #ffa500, #ff8c00);
  color: #000;
}

.segment-btn.red {
  background: linear-gradient(135deg, #f44336, #b22222);
  color: #fff;
}

.segment-btn.active {
  transform: scale(1.05);
  box-shadow: 0 0 20px #ffd700;
  border-color: #ffd700;
  z-index: 2;
}

.segment-multiplier {
  font-size: 18px;
  font-weight: 800;
}

.segment-chance {
  font-size: 12px;
  opacity: 0.9;
}

/* ===== قسم الرهان ===== */
.bet-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 215, 0, 0.2);
}

.bet-input-wrapper {
  position: relative;
  width: 100%;
  max-width: 280px;
}

.bet-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  z-index: 2;
  color: #ffd700;
}

.bet-input {
  width: 100%;
  padding: 15px 45px 15px 70px;
  border-radius: 50px;
  background: linear-gradient(145deg, #1e2333, #131826);
  border: 2px solid rgba(255, 215, 0, 0.3);
  color: white;
  font-size: 16px;
  text-align: center;
  transition: all 0.3s;
}

.bet-input:focus {
  outline: none;
  border-color: #ffd700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
}

.bet-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bet-currency {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #ffd700;
  font-weight: 600;
  font-size: 14px;
}

.multiplier-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 280px;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50px;
  border: 1px solid rgba(255, 215, 0, 0.2);
  color: #8a8f9c;
}

.multiplier-value {
  color: #ffd700;
  font-size: 18px;
  font-weight: 700;
}

.spin-btn {
  background: linear-gradient(135deg, #ffd700, #ffed4a, #ffd700);
  color: #0a0f1e;
  border: none;
  padding: 15px 35px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
  max-width: 280px;
  box-shadow: 0 10px 25px rgba(255, 215, 0, 0.4);
}

.spin-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(255, 215, 0, 0.6);
}

.spin-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  color: #f44336;
  font-size: 14px;
  padding: 10px 20px;
  background: rgba(244, 67, 54, 0.1);
  border-radius: 50px;
  border: 1px solid #f44336;
  width: 100%;
  max-width: 280px;
  text-align: center;
}

/* ===== نتيجة الجولة ===== */
.last-result {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-radius: 20px;
  margin-top: 20px;
  animation: slideUp 0.5s;
}

.last-result.win {
  background: rgba(76, 175, 80, 0.15);
  border: 1px solid #4caf50;
}

.last-result.lose {
  background: rgba(244, 67, 54, 0.15);
  border: 1px solid #f44336;
}

.result-icon {
  font-size: 40px;
}

.result-details {
  flex: 1;
  text-align: right;
}

.result-text {
  display: block;
  font-size: 14px;
  color: #8a8f9c;
  margin-bottom: 5px;
}

.result-amount {
  font-size: 18px;
  font-weight: 700;
  color: #4caf50;
}

.result-segment {
  font-size: 18px;
  font-weight: 700;
  color: #f44336;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== إحصائيات ===== */
.statistics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 215, 0, 0.2);
}

.stat-item {
  text-align: center;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 15px;
  border: 1px solid rgba(255, 215, 0, 0.1);
}

.stat-label {
  display: block;
  color: #8a8f9c;
  font-size: 12px;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  color: #ffd700;
  font-size: 18px;
  font-weight: 700;
}

/* ===== تحسينات الجوال ===== */
@media (max-width: 480px) {
  .game-page {
    padding: 10px;
  }

  .tabs button {
    padding: 10px 15px;
    font-size: 12px;
  }

  .wheel-card {
    padding: 15px;
  }

  .wheel-header h2 {
    font-size: 22px;
  }

  .wheel-container {
    width: 250px;
    height: 250px;
  }

  .segment-value {
    font-size: 14px;
  }

  .segment-selector {
    grid-template-columns: repeat(2, 1fr);
  }

  .jackpot-value {
    font-size: 22px;
  }

  .statistics {
    grid-template-columns: repeat(3, 1fr);
    gap: 5px;
  }

  .stat-value {
    font-size: 14px;
  }

  .result-icon {
    font-size: 30px;
  }
}
</style>
