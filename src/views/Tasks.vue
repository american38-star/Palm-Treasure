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
      <!-- لعبة عجلة الحظ المحسنة -->
      <div v-if="selectedGame === 'wheel-of-fortune'" class="wheel-card">
        <div class="wheel-header">
          <h2>🎡 WHEEL OF FORTUNE</h2>
          <div class="header-glow"></div>
        </div>

        <div class="wheel-content">
          <!-- العجلة مع عرض المضاعفات -->
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
            <div class="wheel-center">
              <span class="center-text">{{ currentMultiplier }}x</span>
            </div>
          </div>

          <!-- عرض المضاعف الحالي -->
          <div class="multiplier-display">
            <span class="multiplier-label">المضاعف</span>
            <span class="multiplier-value" :class="{ 'zero': currentMultiplier === 0 }">{{ currentMultiplier }}x</span>
          </div>

          <!-- حقل الرهان -->
          <div class="bet-section">
            <div class="bet-input-wrapper">
              <span class="bet-icon">💰</span>
              <input
                type="number"
                v-model.number="betAmount"
                placeholder="أدخل مبلغ الرهان"
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

            <button 
              @click="spinWheel"
              class="spin-btn"
              :disabled="!canSpin || isSpinning"
            >
              <span v-if="!isSpinning">🎡 ابدأ الدوران</span>
              <span v-else>جاري الدوران...</span>
            </button>
          </div>

          <!-- نتيجة الجولة -->
          <div v-if="lastResult" class="last-result" :class="{ 'win': lastResult.isWin, 'lose': !lastResult.isWin }">
            <div class="result-icon">{{ lastResult.isWin ? '🎉' : '😢' }}</div>
            <div class="result-details">
              <span class="result-text">{{ lastResult.message }}</span>
              <span class="result-multiplier">x{{ lastResult.multiplier }}</span>
              <span v-if="lastResult.isWin" class="result-amount">+{{ lastResult.winAmount.toFixed(2) }} USDT</span>
            </div>
          </div>

          <!-- قائمة المضاعفات -->
          <div class="multipliers-list">
            <div v-for="(segment, index) in wheelSegments" 
                 :key="index"
                 class="multiplier-item"
                 :class="[getSegmentColorClass(index), { 'active': index === currentSegmentIndex }]">
              <span class="item-value">{{ segment.value }}x</span>
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
      currentMultiplier: 0,
      currentSegmentIndex: 0,
      
      // أجزاء العجلة (8 أجزاء) - كلها مضاعفات منخفضة
      wheelSegments: [
        { value: 0.1, color: 'red' },    // 0.1x (أحمر) - خسارة كبيرة
        { value: 0.2, color: 'orange' }, // 0.2x (برتقالي) - خسارة
        { value: 0.3, color: 'orange' }, // 0.3x (برتقالي) - خسارة
        { value: 0.5, color: 'yellow' }, // 0.5x (أصفر) - خسارة نصف الرهان
        { value: 0.8, color: 'yellow' }, // 0.8x (أصفر) - خسارة قليلة
        { value: 1.0, color: 'green' },  // 1.0x (أخضر) - استرداد الرهان
        { value: 1.2, color: 'green' },  // 1.2x (أخضر) - ربح قليل
        { value: 1.5, color: 'green' }   // 1.5x (أخضر) - ربح
      ],
      
      lastResult: null
    }
  },
  
  computed: {
    canSpin() {
      return this.betAmount && 
             this.betAmount > 0 && 
             this.betAmount <= this.balance && 
             !this.isSpinning
    }
  },
  
  async created() {
    const user = auth.currentUser
    if (!user) return
    
    const snap = await getDoc(doc(db, "users", user.uid))
    if (snap.exists()) {
      this.balance = Number(snap.data().balance || 0)
    }
    
    // تعيين المضاعف الحالي إلى 0
    this.currentMultiplier = 0
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
      return this.wheelSegments[index].color
    },
    
    resetGame() {
      this.wheelRotation = 0
      this.isSpinning = false
      this.betAmount = null
      this.lastResult = null
      this.gameError = ''
      this.currentMultiplier = 0
      this.currentSegmentIndex = 0
    },
    
    async spinWheel() {
      if (!this.canSpin) return
      
      this.gameError = ''
      this.isSpinning = true
      this.currentMultiplier = 0
      
      // خصم الرهان
      this.balance -= this.betAmount
      await this.updateBalance(this.balance)
      
      // اختيار الجزء الفائز عشوائياً - مع وزن أكبر للخسارة
      const random = Math.random()
      let winningIndex
      
      // 70% فرصة للخسارة (مضاعفات أقل من 1)
      // 20% فرصة للتعادل (مضاعف 1)
      // 10% فرصة للربح (مضاعف أكبر من 1)
      if (random < 0.7) {
        // خسارة - اختيار من أول 4 أجزاء
        const loseIndices = [0, 1, 2, 3]
        winningIndex = loseIndices[Math.floor(Math.random() * loseIndices.length)]
      } else if (random < 0.9) {
        // تعادل - الجزء 4 (1.0x)
        winningIndex = 5
      } else {
        // ربح - اختيار من آخر جزئين
        const winIndices = [6, 7]
        winningIndex = winIndices[Math.floor(Math.random() * winIndices.length)]
      }
      
      const winningSegment = this.wheelSegments[winningIndex]
      
      // دوران العجلة (دورانات متعددة + الجزء الفائز)
      const spins = 8 + Math.floor(Math.random() * 8) // 8-15 دورة
      // تعديل زاوية الدوران لتوقف السهم على الجزء الصحيح
      // السهم في الأعلى (زاوية -90 درجة) نريد أن يتوقف على الجزء المطلوب
      const targetRotation = 360 * spins + (winningIndex * 45) + 90
      
      // أنيميشن الدوران
      const startTime = Date.now()
      const duration = 3000
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // منحنى التباطؤ
        const easeProgress = 1 - Math.pow(1 - progress, 3)
        this.wheelRotation = targetRotation * easeProgress
        
        // تحديث المضاعف الحالي أثناء الدوران (لإظهار التغيير)
        if (progress < 1) {
          const currentAngle = (this.wheelRotation + 90) % 360
          const segmentAngle = 45
          const currentSegment = Math.floor(currentAngle / segmentAngle) % 8
          this.currentMultiplier = this.wheelSegments[currentSegment].value
          this.currentSegmentIndex = currentSegment
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          this.finishSpin(winningIndex, winningSegment)
        }
      }
      
      requestAnimationFrame(animate)
    },
    
    async finishSpin(winningIndex, winningSegment) {
      this.isSpinning = false
      
      // تعيين المضاعف النهائي
      this.currentMultiplier = winningSegment.value
      this.currentSegmentIndex = winningIndex
      
      // حساب الربح/الخسارة
      const multiplier = winningSegment.value
      const winAmount = this.betAmount * multiplier
      
      let isWin = false
      let message = ''
      
      if (multiplier > 1) {
        // فوز
        isWin = true
        this.balance += winAmount
        await this.updateBalance(this.balance)
        message = `فوز! مضاعف x${multiplier}`
        this.showResult(`🎉 ربحت ${winAmount.toFixed(2)} USDT`, true)
      } else if (multiplier === 1) {
        // تعادل (استرداد الرهان)
        isWin = true
        this.balance += this.betAmount
        await this.updateBalance(this.balance)
        message = `تعادل! استرداد الرهان`
        this.showResult(`🤝 استرداد الرهان`, true)
      } else {
        // خسارة
        isWin = false
        if (multiplier === 0) {
          message = `خسارة! خسرت كل الرهان`
        } else {
          message = `خسارة! خسرت ${((1 - multiplier) * 100).toFixed(0)}% من الرهان`
        }
        this.showResult(`😢 خسرت الرهان`, false)
      }
      
      // حفظ النتيجة الأخيرة
      this.lastResult = {
        segmentIndex: winningIndex,
        multiplier: multiplier,
        isWin: isWin,
        winAmount: winAmount,
        message: message
      }
      
      // إعادة تعيين الرهان بعد 3 ثواني
      setTimeout(() => {
        this.betAmount = null
        this.currentMultiplier = 0
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
  max-width: 550px;
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

/* ===== العجلة ===== */
.wheel-container {
  position: relative;
  width: 280px;
  height: 280px;
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
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* ألوان الأجزاء */
.wheel-segment.red {
  background: linear-gradient(135deg, #f44336, #b22222);
}

.wheel-segment.orange {
  background: linear-gradient(135deg, #ff9800, #ff5722);
}

.wheel-segment.yellow {
  background: linear-gradient(135deg, #ffeb3b, #ffc107);
}

.wheel-segment.green {
  background: linear-gradient(135deg, #4caf50, #2e7d32);
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

.wheel-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: linear-gradient(145deg, #ffd700, #b8860b);
  border-radius: 50%;
  border: 3px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.center-text {
  font-size: 20px;
  font-weight: 800;
  color: #0a0f1e;
}

/* ===== عرض المضاعف الحالي ===== */
.multiplier-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50px;
  border: 1px solid rgba(255, 215, 0, 0.2);
  margin: 20px 0;
}

.multiplier-label {
  color: #8a8f9c;
  font-size: 16px;
}

.multiplier-value {
  font-size: 32px;
  font-weight: 800;
  color: #ffd700;
  text-shadow: 0 0 10px #ffd700;
}

.multiplier-value.zero {
  color: #f44336;
  text-shadow: 0 0 10px #f44336;
}

/* ===== قسم الرهان ===== */
.bet-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
  margin-top: 20px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 30px;
  border: 1px solid rgba(255, 215, 0, 0.2);
}

.bet-input-wrapper {
  position: relative;
  width: 100%;
  max-width: 300px;
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
  max-width: 300px;
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
  max-width: 300px;
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

.result-multiplier {
  display: inline-block;
  font-size: 18px;
  font-weight: 700;
  color: #ffd700;
  margin-left: 10px;
}

.result-amount {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #4caf50;
  margin-top: 5px;
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

/* ===== قائمة المضاعفات ===== */
.multipliers-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 20px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 20px;
  border: 1px solid rgba(255, 215, 0, 0.1);
}

.multiplier-item {
  padding: 10px;
  border-radius: 10px;
  text-align: center;
  font-weight: 700;
  transition: all 0.3s;
}

.multiplier-item.red {
  background: rgba(244, 67, 54, 0.3);
  border: 1px solid #f44336;
}

.multiplier-item.orange {
  background: rgba(255, 152, 0, 0.3);
  border: 1px solid #ff9800;
}

.multiplier-item.yellow {
  background: rgba(255, 235, 59, 0.3);
  border: 1px solid #ffeb3b;
}

.multiplier-item.green {
  background: rgba(76, 175, 80, 0.3);
  border: 1px solid #4caf50;
}

.multiplier-item.active {
  transform: scale(1.1);
  box-shadow: 0 0 20px #ffd700;
  border-color: #ffd700;
  z-index: 2;
}

.item-value {
  font-size: 16px;
  font-weight: 700;
  color: white;
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
    width: 220px;
    height: 220px;
  }

  .segment-value {
    font-size: 14px;
  }

  .wheel-center {
    width: 40px;
    height: 40px;
  }

  .center-text {
    font-size: 16px;
  }

  .multiplier-value {
    font-size: 24px;
  }

  .result-icon {
    font-size: 30px;
  }

  .result-multiplier {
    font-size: 16px;
  }

  .multipliers-list {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
