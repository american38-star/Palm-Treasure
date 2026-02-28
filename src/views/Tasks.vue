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
        :class="{active: game==='chicken'}" 
        @click="switchGame('chicken')"
      >
        <span class="tab-icon">🐔</span>
        <span class="tab-text">Chicken Road</span>
      </button>
      <button 
        :class="{active: game==='plinko'}" 
        @click="switchGame('plinko')"
      >
        <span class="tab-icon">🔴</span>
        <span class="tab-text">Plinko</span>
      </button>
    </div>

    <!-- ================= CHICKEN ROAD ================= -->
    <div v-if="game==='chicken'" class="card chicken-card">
      <div class="card-header">
        <h2>🐔 Chicken Road</h2>
        <div class="header-glow"></div>
      </div>

      <!-- شكل الدجاج الكامل -->
      <div class="chicken-container">
        <div class="chicken-glow"></div>
        <div class="chicken">🐔</div>
      </div>

      <!-- الطريق مع المضاعفات -->
      <div v-if="started" class="road">
        <div
          v-for="(step, i) in steps"
          :key="i"
          class="step"
          :class="{
            active: i === position,
            'gold-step': step.multiplier >= 3,
            'silver-step': step.multiplier >= 2 && step.multiplier < 3
          }"
        >
          <span class="multiplier">x{{ step.multiplier.toFixed(2) }}</span>
          <div v-if="i === position" class="chicken-icon">🐔</div>
          <div v-if="i < position" class="step-check">✓</div>
        </div>
      </div>

      <!-- حقل الرهان وزر ابدأ الآن -->
      <div class="bet-section">
        <div v-if="!started" class="bet-controls">
          <div class="input-gold-wrapper">
            <input
              type="number"
              v-model.number="bet"
              placeholder="أدخل المبلغ"
              class="gold-input"
              @input="clearChickenError"
            />
            <span class="input-currency">USDT</span>
          </div>
          <div v-if="chickenErrorMessage" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            {{ chickenErrorMessage }}
          </div>
          <button 
            @click="validateAndStartChicken"
            class="gold-button"
            :disabled="!bet || bet <= 0"
          >
            <i class="fas fa-play"></i>
            ابدأ الآن
          </button>
        </div>

        <!-- عناصر التحكم أثناء اللعبة -->
        <div v-if="started" class="game-controls">
          <div class="profit-display">
            <span class="profit-label">الربح المحتمل:</span>
            <span class="profit-value">{{ currentProfit.toFixed(2) }} USDT</span>
          </div>
          <div class="action-buttons">
            <button @click="goNext" class="action-btn gold">
              <i class="fas fa-arrow-right"></i>
              تقدم
            </button>
            <button @click="cashOutChicken" class="action-btn green">
              <i class="fas fa-hand-holding-usd"></i>
              سحب
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= PLINKO ================= -->
    <div v-if="game==='plinko'" class="card plinko-card">
      <div class="card-header">
        <h2>🔴 Plinko</h2>
        <div class="header-glow"></div>
      </div>

      <!-- اللوحة والمضاعفات -->
      <div class="plinko-container">
        <div class="plinko-board">
          <div v-for="(row, r) in rows" :key="r" class="row">
            <span v-for="n in row" :key="n" class="dot"></span>
          </div>
        </div>

        <!-- المضاعفات -->
        <div class="multipliers-row">
          <div 
            v-for="(mult, index) in plinkoMultipliers" 
            :key="index"
            class="multiplier-item"
            :class="multiplierClass(mult)"
          >
            x{{ mult }}
          </div>
        </div>

        <!-- الكرات النشطة -->
        <div 
          v-for="ball in activeBalls" 
          :key="ball.id"
          class="ball" 
          :style="{ 
            top: ball.y + 'px', 
            left: ball.x + 'px',
            backgroundColor: ball.color,
            boxShadow: `0 0 15px ${ball.color}`
          }"
        ></div>
      </div>

      <!-- حقل الرهان وزر ابدأ الآن -->
      <div class="bet-section">
        <div class="bet-controls">
          <div class="input-gold-wrapper">
            <input
              type="number"
              v-model.number="plinkoBet"
              placeholder="أدخل المبلغ"
              class="gold-input"
              @input="clearError"
            />
            <span class="input-currency">USDT</span>
          </div>
          <div v-if="errorMessage" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            {{ errorMessage }}
          </div>
          <button 
            @click="validateAndStart"
            class="gold-button"
            :disabled="!plinkoBet || plinkoBet <= 0"
          >
            <i class="fas fa-play"></i>
            ابدأ الآن
          </button>
        </div>
      </div>
    </div>

    <!-- نتيجة اللعبة -->
    <div v-if="result" class="result-popup" :class="result.includes('ربحت') ? 'win' : 'lose'">
      <i :class="result.includes('ربحت') ? 'fas fa-trophy' : 'fas fa-skull'"></i>
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
      balance: 0,    
      result: "",    
      errorMessage: "",    
      chickenErrorMessage: "",    
    
      /* ===== Chicken Road ===== */    
      bet: null,    
      started: false,    
      position: 0,    
      steps: [    
        { multiplier: 1.0 },    
        { multiplier: 1.1 },    
        { multiplier: 1.3 },    
        { multiplier: 1.5 },    
        { multiplier: 2.0 },    
        { multiplier: 3.0 },    
        { multiplier: 5.0 },    
      ],    
    
      /* ===== Plinko ===== */    
      plinkoBet: null,    
      rows: [3,4,5,6,7,8,9,10],    
      plinkoMultipliers: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],    
      activeBalls: [],
      dropIntervals: {},
      ballCounter: 0,
    };    
  },    
    
  computed: {    
    currentProfit() {    
      if (!this.bet) return 0;    
      return this.bet * this.steps[this.position].multiplier;    
    },    
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
      this.started = false;    
      this.activeBalls = [];
      this.game = g;    
      this.errorMessage = "";    
      this.chickenErrorMessage = "";    
      
      Object.values(this.dropIntervals).forEach(interval => {
        clearInterval(interval);
      });
      this.dropIntervals = {};
      this.ballCounter = 0;
    },    
    
    /* ===== Chicken Road ===== */    
    validateAndStartChicken() {    
      if (!this.bet || this.bet <= 0) {    
        this.chickenErrorMessage = "الرجاء إدخال مبلغ الرهان";    
        return;    
      }    
      
      if (this.bet > this.balance) {    
        this.chickenErrorMessage = "الرصيد غير كافي";    
        return;    
      }    
      
      this.chickenErrorMessage = "";    
      this.startChicken();    
    },    
    
    async startChicken() {    
      this.balance -= this.bet;    
      await updateDoc(doc(db, "users", auth.currentUser.uid), {    
        balance: this.balance,    
      });    
    
      this.started = true;    
      this.position = 0;    
      this.result = "";    
    },    
    
    goNext() {    
      const loseChance = 0.4 + this.position * 0.07;    
      if (Math.random() < loseChance) {    
        this.result = "💥 للأسف خسرت الرهان";    
        this.started = false;    
        return;    
      }    
    
      if (this.position < this.steps.length - 1) {    
        this.position++;    
      } else {    
        this.cashOutChicken();    
      }    
    },    
    
    async cashOutChicken() {    
      const profit = this.currentProfit;    
      this.balance += profit;    
    
      await updateDoc(doc(db, "users", auth.currentUser.uid), {    
        balance: this.balance,    
      });    
    
      this.result = `🎉 مبروك! ربحت ${profit.toFixed(2)} USDT`;    
      this.started = false;    
    },    
    
    clearChickenError() {    
      this.chickenErrorMessage = "";    
    },    
    
    /* ===== Plinko ===== */    
    validateAndStart() {    
      if (!this.plinkoBet || this.plinkoBet <= 0) {    
        this.errorMessage = "الرجاء إدخال مبلغ الرهان";    
        return;    
      }    
      
      if (this.plinkoBet > this.balance) {    
        this.errorMessage = "الرصيد غير كافي";    
        return;    
      }    
      
      this.errorMessage = "";    
      this.startPlinko();    
    },    
    
    async startPlinko() {    
      this.balance -= this.plinkoBet;    
      await updateDoc(doc(db, "users", auth.currentUser.uid), {    
        balance: this.balance,    
      });    
    
      const ballId = ++this.ballCounter;
      const colors = ['#D4AF37', '#F6E27A', '#C5A028', '#B8962E'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      const newBall = {
        id: ballId,
        x: 150,
        y: 0,
        color: randomColor,
        multiplier: null,
        multiplierIndex: null,
        finalX: null,
        active: true
      };
      
      this.activeBalls.push(newBall);
      this.dropBall(ballId);
    },    
    
    dropBall(ballId) {    
      const ballIndex = this.activeBalls.findIndex(b => b.id === ballId);
      if (ballIndex === -1) return;
      
      const ball = this.activeBalls[ballIndex];
      
      const multiplierIndex = this.calculateFinalMultiplierIndex();    
      const multiplier = this.plinkoMultipliers[multiplierIndex];    
      
      ball.multiplier = multiplier;
      ball.multiplierIndex = multiplierIndex;
      ball.finalX = this.getMultiplierPosition(multiplierIndex);
      
      let currentStep = 0;  
      const totalSteps = 40;  
      const startX = 150;  
      const startY = 0;  
      const finalY = 280;  
      const finalX = ball.finalX;
      
      this.dropIntervals[ballId] = setInterval(async () => {    
        currentStep++;  
        const progress = Math.min(currentStep / totalSteps, 1);  
        
        ball.y = startY + (finalY - startY) * progress;  
        
        if (progress < 0.4) {  
          ball.x = startX + (Math.random() - 0.5) * 60;  
        } else if (progress < 0.8) {  
          const phaseProgress = (progress - 0.4) / 0.4;  
          ball.x = startX + (finalX - startX) * phaseProgress * 0.5;  
        } else {  
          const finalProgress = (progress - 0.8) / 0.2;  
          ball.x = finalX - 10 + finalProgress * 10;  
        }  
        
        ball.x = Math.max(30, Math.min(370, ball.x));  
        
        if (progress >= 1) {  
          clearInterval(this.dropIntervals[ballId]);  
          delete this.dropIntervals[ballId];
          
          ball.x = finalX;  
          ball.y = finalY;  
          
          setTimeout(async () => {  
            ball.active = false;  
            
            const win = this.plinkoBet * multiplier;    
            this.balance += win;    
  
            await updateDoc(doc(db, "users", auth.currentUser.uid), {    
              balance: this.balance,    
            });    
  
            this.result = `🎯 ربحت ${win.toFixed(2)} USDT (x${multiplier})`;  
            
            setTimeout(() => {
              const index = this.activeBalls.findIndex(b => b.id === ballId);
              if (index !== -1) {
                this.activeBalls.splice(index, 1);
              }
            }, 2000);
          }, 400);  
        }    
      }, 50);  
    },    
    
    calculateFinalMultiplierIndex() {    
      const random = Math.random();    
      
      if (random < 0.02) {  
        return Math.random() > 0.5 ? 0 : 8;  
      } else if (random < 0.07) {  
        return Math.random() > 0.5 ? 1 : 7;  
      } else if (random < 0.17) {  
        return Math.random() > 0.5 ? 2 : 6;  
      } else if (random < 0.47) {  
        return Math.random() > 0.5 ? 3 : 5;  
      } else {  
        return 4;  
      }    
    },    
    
    getMultiplierPosition(index) {    
      const positions = [30, 75, 120, 165, 210, 255, 300, 345, 390];    
      return positions[index];    
    },    
    
    clearError() {    
      this.errorMessage = "";    
    },    
    
    multiplierClass(m) {    
      if (m >= 10) return "high";    
      if (m <= 0.3) return "low";    
      return "mid";    
    },    
  },    
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
  justify-content: center;
  gap: 15px;
  margin-bottom: 25px;
}

.tabs button {
  padding: 12px 25px;
  border-radius: 50px;
  background: #11151C;
  color: #ffffff;
  border: 1px solid rgba(212, 175, 55, 0.2);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
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
  font-size: 20px;
}

/* البطاقات */
.card {
  background: #11151C;
  border-radius: 30px;
  padding: 25px;
  max-width: 500px;
  margin: 0 auto;
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
  margin-bottom: 20px;
}

.card-header h2 {
  font-size: 28px;
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

/* ===== Chicken Road Styles ===== */
.chicken-card .chicken-container {
  margin: 30px auto;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.chicken {
  font-size: 100px;
  animation: bounce 2s infinite;
  position: relative;
  z-index: 2;
}

.chicken-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%);
  filter: blur(20px);
  border-radius: 50%;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.road {
  display: flex;
  justify-content: space-between;
  margin: 25px 0;
  background: #1A1F2A;
  padding: 20px;
  border-radius: 20px;
  gap: 8px;
}

.step {
  flex: 1;
  background: #1E2430;
  border-radius: 12px;
  padding: 15px 5px;
  font-size: 14px;
  position: relative;
  min-height: 80px;
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
  font-size: 16px;
}

.step-check {
  position: absolute;
  top: 5px;
  left: 5px;
  color: #22c55e;
  font-size: 16px;
}

.chicken-icon {
  font-size: 28px;
  margin-top: 5px;
  filter: drop-shadow(0 5px 10px rgba(0, 0, 0, 0.3));
}

/* قسم الرهان */
.bet-section {
  margin-top: 25px;
  padding-top: 20px;
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

/* ===== Plinko Styles ===== */
.plinko-card .plinko-container {
  position: relative;
  margin: 20px auto;
  padding: 10px;
}

.plinko-board {
  position: relative;
  height: 320px;
  background: linear-gradient(180deg, #1A1F2A 0%, #11151C 100%);
  border-radius: 20px;
  padding: 15px;
}

.row {
  display: flex;
  justify-content: center;
  margin: 5px 0;
}

.dot {
  width: 10px;
  height: 10px;
  background: #D4AF37;
  border-radius: 50%;
  margin: 8px 12px;
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
  transition: all 0.3s ease;
}

.dot:hover {
  transform: scale(1.2);
  box-shadow: 0 0 15px #D4AF37;
}

.ball {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  top: 0;
  left: 150px;
  transform: translateX(-50%);
  z-index: 10;
  transition: left 0.05s linear, top 0.05s linear;
  filter: drop-shadow(0 0 10px currentColor);
}

.multipliers-row {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
  gap: 5px;
  padding: 10px;
  background: #1A1F2A;
  border-radius: 16px;
}

.multiplier-item {
  padding: 6px 8px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 12px;
  min-width: 40px;
  text-align: center;
  transition: all 0.3s ease;
}

.multiplier-item.high {
  background: linear-gradient(135deg, #D4AF37, #F6E27A);
  color: #0A0C10;
}

.multiplier-item.mid {
  background: linear-gradient(135deg, #C5A028, #B8962E);
  color: #0A0C10;
}

.multiplier-item.low {
  background: linear-gradient(135deg, #1A1F2A, #11151C);
  color: #D4AF37;
  border: 1px solid #D4AF37;
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

/* تحسينات للجوال */
@media (max-width: 480px) {
  .game-page {
    padding: 15px;
  }

  .tabs button {
    padding: 10px 15px;
    font-size: 14px;
  }

  .card {
    padding: 20px;
  }

  .card-header h2 {
    font-size: 24px;
  }

  .step {
    padding: 10px 3px;
    font-size: 12px;
  }

  .multiplier-item {
    min-width: 35px;
    font-size: 10px;
    padding: 4px 2px;
  }

  .result-popup {
    padding: 15px 25px;
    font-size: 16px;
  }
}
</style>
