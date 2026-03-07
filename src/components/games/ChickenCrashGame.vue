<template>
  <div class="chicken-game-container">
    <!-- رأس اللعبة -->
    <div class="game-header">
      <h2>🐔 CHICKEN ROAD GAME</h2>
      <div class="header-glow"></div>
    </div>

    <!-- محتوى اللعبة -->
    <div class="game-content">
      <div class="chicken-area">
        <div class="chicken">🐔</div>
        <div class="road">
          <div 
            v-for="(step, index) in steps" 
            :key="index"
            class="road-step"
            :class="{ 'active': currentStep === index, 'passed': index < currentStep }"
          >
            <span class="step-multiplier">x{{ step }}</span>
          </div>
        </div>
      </div>

      <!-- منطقة الرهان -->
      <div class="bet-area">
        <div class="balance-info">
          <span>رصيدك: {{ balance }} USDT</span>
        </div>

        <div v-if="!gameActive" class="bet-controls">
          <input 
            type="number" 
            v-model="betAmount" 
            placeholder="مبلغ الرهان"
            class="bet-input"
          >
          <button 
            @click="startGame" 
            class="start-btn"
            :disabled="!betAmount || betAmount <= 0 || betAmount > balance"
          >
            ابدأ اللعبة
          </button>
        </div>

        <div v-if="gameActive" class="game-controls">
          <div class="current-multiplier">
            المضاعف الحالي: x{{ currentMultiplier }}
          </div>
          <div class="action-buttons">
            <button @click="nextStep" class="next-btn">الخطوة التالية</button>
            <button @click="cashOut" class="cashout-btn">سحب الأرباح</button>
          </div>
        </div>

        <div v-if="gameOver" class="game-over" :class="{ 'win': gameWon, 'lose': !gameWon }">
          {{ gameMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChickenRoadGame',
  props: {
    balance: {
      type: Number,
      required: true
    }
  },
  emits: ['update-balance', 'show-result'],
  data() {
    return {
      betAmount: null,
      gameActive: false,
      gameOver: false,
      gameWon: false,
      gameMessage: '',
      currentStep: 0,
      currentMultiplier: 1.0,
      steps: [1.0, 1.2, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0, 8.0, 10.0],
      crashProbability: 0.3
    }
  },
  methods: {
    startGame() {
      if (!this.betAmount || this.betAmount <= 0) {
        this.$emit('show-result', 'الرجاء إدخال مبلغ الرهان', false)
        return
      }
      if (this.betAmount > this.balance) {
        this.$emit('show-result', 'الرصيد غير كافي', false)
        return
      }

      // خصم الرهان
      const newBalance = this.balance - this.betAmount
      this.$emit('update-balance', newBalance)

      // بدء اللعبة
      this.gameActive = true
      this.gameOver = false
      this.currentStep = 0
      this.currentMultiplier = this.steps[0]
    },

    nextStep() {
      // حساب فرصة الخسارة
      const loseChance = this.crashProbability + (this.currentStep * 0.05)
      
      if (Math.random() < loseChance) {
        // خسارة
        this.gameActive = false
        this.gameOver = true
        this.gameWon = false
        this.gameMessage = '💥 انفجرت! خسرت الرهان'
        this.$emit('show-result', this.gameMessage, false)
      } else {
        // الانتقال للخطوة التالية
        if (this.currentStep < this.steps.length - 1) {
          this.currentStep++
          this.currentMultiplier = this.steps[this.currentStep]
        } else {
          // وصل للنهاية
          this.cashOut()
        }
      }
    },

    cashOut() {
      const profit = this.betAmount * this.currentMultiplier
      const newBalance = this.balance + profit
      
      this.$emit('update-balance', newBalance)
      
      this.gameActive = false
      this.gameOver = true
      this.gameWon = true
      this.gameMessage = `🎉 ربحت ${profit.toFixed(2)} USDT`
      
      this.$emit('show-result', this.gameMessage, true)
    }
  }
}
</script>

<style scoped>
.chicken-game-container {
  background: linear-gradient(145deg, #1a1f30, #0f1422);
  border-radius: 30px;
  padding: 25px;
  border: 1px solid rgba(255, 215, 0, 0.3);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  max-width: 500px;
  margin: 0 auto;
}

.game-header {
  position: relative;
  margin-bottom: 25px;
  text-align: center;
}

.game-header h2 {
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #ffd700, #ffed4a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
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
  background: radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%);
  filter: blur(30px);
  z-index: 0;
}

.game-content {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.chicken-area {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  padding: 20px;
  border: 1px solid rgba(255, 215, 0, 0.2);
}

.chicken {
  font-size: 80px;
  text-align: center;
  margin-bottom: 20px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.road {
  display: flex;
  gap: 5px;
  overflow-x: auto;
  padding: 10px 0;
  white-space: nowrap;
}

.road-step {
  min-width: 60px;
  height: 80px;
  background: linear-gradient(145deg, #252b3d, #1a1f30);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 215, 0, 0.2);
  transition: all 0.3s;
}

.road-step.active {
  background: linear-gradient(135deg, #ffd700, #ffed4a);
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.road-step.passed {
  border-color: #4caf50;
  opacity: 0.7;
}

.step-multiplier {
  font-weight: 700;
  color: #ffd700;
}

.road-step.active .step-multiplier {
  color: #0a0f1e;
}

.bet-area {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 20px;
  padding: 20px;
}

.balance-info {
  text-align: center;
  margin-bottom: 15px;
  color: #ffd700;
  font-weight: 600;
}

.bet-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}

.bet-input {
  width: 100%;
  max-width: 250px;
  padding: 12px 20px;
  border-radius: 50px;
  background: linear-gradient(145deg, #1e2333, #131826);
  border: 2px solid rgba(255, 215, 0, 0.3);
  color: white;
  font-size: 16px;
  text-align: center;
}

.bet-input:focus {
  outline: none;
  border-color: #ffd700;
}

.start-btn {
  background: linear-gradient(135deg, #ffd700, #ffed4a);
  color: #0a0f1e;
  border: none;
  padding: 12px 30px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
  max-width: 250px;
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(255, 215, 0, 0.4);
}

.start-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.game-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}

.current-multiplier {
  font-size: 24px;
  font-weight: 800;
  color: #ffd700;
  text-shadow: 0 0 10px #ffd700;
}

.action-buttons {
  display: flex;
  gap: 15px;
  width: 100%;
  justify-content: center;
}

.next-btn, .cashout-btn {
  padding: 12px 25px;
  border: none;
  border-radius: 50px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  flex: 1;
  max-width: 150px;
}

.next-btn {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  color: white;
}

.cashout-btn {
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
}

.next-btn:hover, .cashout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.game-over {
  text-align: center;
  padding: 15px;
  border-radius: 50px;
  font-weight: 700;
  animation: slideUp 0.5s;
}

.game-over.win {
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid #4caf50;
  color: #4caf50;
}

.game-over.lose {
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid #f44336;
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

@media (max-width: 480px) {
  .chicken-game-container {
    padding: 15px;
  }

  .game-header h2 {
    font-size: 20px;
  }

  .chicken {
    font-size: 60px;
  }

  .road-step {
    min-width: 50px;
    height: 70px;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .next-btn, .cashout-btn {
    width: 100%;
    max-width: none;
  }
}
</style>
