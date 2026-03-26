<template>
  <div class="game-page">
    <!-- الرصيد -->
    <div class="top-bar">
      <div class="balance-gold">
        <i class="fas fa-coins"></i>
        <span>رصيدك: <strong>{{ balance.toFixed(2) }} USDT</strong></span>
      </div>
    </div>

    <!-- رسالة الفوز/الخسارة - تظهر فقط بعد توقف العجلة -->
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
          <!-- العجلة مع المضاعفات داخلها -->
          <div class="wheel-wrapper">
            <div class="pointer">▼</div>
            <div class="wheel-container">
              <svg 
                class="wheel-svg" 
                viewBox="0 0 200 200"
                :style="{ transform: `rotate(${wheelRotation}deg)` }"
              >
                <!-- رسم القطاعات الدائرية -->
                <g v-for="(segment, index) in wheelSegments" :key="index">
                  <path
                    :d="getSegmentPath(index)"
                    :fill="getSegmentColor(segment.value)"
                    stroke="white"
                    stroke-width="1"
                  />
                  <text
                    :x="getTextX(index)"
                    :y="getTextY(index)"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    :fill="getTextColor(segment.value)"
                    font-size="14"
                    font-weight="bold"
                  >
                    {{ segment.value }}x
                  </text>
                </g>
                
                <!-- الدائرة الداخلية -->
                <circle cx="100" cy="100" r="25" fill="#222" stroke="gold" stroke-width="3" />
              </svg>
            </div>
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
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { auth, db, doc, getDoc, updateDoc, onSnapshot } from "../firebase"

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
      
      // إعدادات النسب من Firebase
      winSettings: {
        lossRate: 40,
        smallWinRate: 35,
        bigWinRate: 25
      },
      
      settingsLoading: false,
      unsubscribeSettings: null,
      
      // أجزاء العجلة (8 أجزاء) - تستخدم فقط للعرض البصري
      wheelSegments: [
        { value: 0, probability: 40 },     // قطاع 0 - 0-45° (خسارة)
        { value: 3, probability: 10 },      // قطاع 1 - 45-90° (ربح كبير)
        { value: 5, probability: 8 },       // قطاع 2 - 90-135° (ربح كبير)
        { value: 10, probability: 5 },      // قطاع 3 - 135-180° (جائزة كبرى)
        { value: 2, probability: 12 },      // قطاع 4 - 180-225° (ربح متوسط)
        { value: 0.5, probability: 25 },    // قطاع 5 - 225-270° (ربح صغير)
        { value: 1, probability: 20 },      // قطاع 6 - 270-315° (تعادل)
        { value: 1.5, probability: 15 }     // قطاع 7 - 315-360° (ربح متوسط)
      ],
      
      lastResult: null,
      
      // أصوات اللعبة
      spinSound: null,
      winSound: null,
      loseSound: null,
      clickSound: null
    }
  },
  
  computed: {
    segmentAngle() {
      return 360 / this.wheelSegments.length // 45 درجة
    },
    
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
    
    // تحميل إعدادات النسب من Firebase
    await this.fetchWheelSettings()
    
    // الاشتراك في التحديثات المباشرة للإعدادات
    this.subscribeToSettings()
    
    // تهيئة الأصوات
    this.initSounds()
  },
  
  beforeUnmount() {
    // إلغاء الاشتراك عند إغلاق المكون
    if (this.unsubscribeSettings) {
      this.unsubscribeSettings()
    }
  },
  
  methods: {
    // دالة لجلب إعدادات العجلة من Firebase
    async fetchWheelSettings() {
      this.settingsLoading = true
      try {
        const settingsRef = doc(db, "settings", "wheel")
        const settingsDoc = await getDoc(settingsRef)
        
        if (settingsDoc.exists()) {
          this.winSettings = settingsDoc.data()
          // تحديث احتمالات القطاعات بناءً على الإعدادات
          this.updateSegmentProbabilities()
        } else {
          // إذا لم تكن الوثيقة موجودة، نقوم بإنشائها بالقيم الافتراضية
          await this.createDefaultSettings()
        }
      } catch (error) {
        console.error("❌ خطأ في جلب إعدادات العجلة:", error)
        // استخدام القيم الافتراضية في حالة الخطأ
      } finally {
        this.settingsLoading = false
      }
    },
    
    // دالة لتحديث احتمالات القطاعات بناءً على الإعدادات
    updateSegmentProbabilities() {
      const { lossRate, smallWinRate, bigWinRate } = this.winSettings
      
      // توزيع النسب على القطاعات
      // الخسارة: قطاع 0
      this.wheelSegments[0].probability = lossRate
      
      // الأرباح الصغيرة: قطاع 0.5 و 1
      const smallWinTotal = smallWinRate
      this.wheelSegments[5].probability = smallWinTotal * 0.5 // 0.5x
      this.wheelSegments[6].probability = smallWinTotal * 0.5 // 1x
      
      // الأرباح الكبيرة: قطاع 1.5, 2, 3, 5, 10
      const bigWinTotal = bigWinRate
      this.wheelSegments[7].probability = bigWinTotal * 0.25 // 1.5x
      this.wheelSegments[4].probability = bigWinTotal * 0.2 // 2x
      this.wheelSegments[1].probability = bigWinTotal * 0.2 // 3x
      this.wheelSegments[2].probability = bigWinTotal * 0.2 // 5x
      this.wheelSegments[3].probability = bigWinTotal * 0.15 // 10x
    },
    
    // دالة لإنشاء الإعدادات الافتراضية
    async createDefaultSettings() {
      try {
        const defaultSettings = {
          lossRate: 40,
          smallWinRate: 35,
          bigWinRate: 25
        }
        const settingsRef = doc(db, "settings", "wheel")
        await updateDoc(settingsRef, defaultSettings)
        this.winSettings = defaultSettings
        this.updateSegmentProbabilities()
      } catch (error) {
        console.error("❌ خطأ في إنشاء الإعدادات الافتراضية:", error)
      }
    },
    
    // الاشتراك في التحديثات المباشرة للإعدادات
    subscribeToSettings() {
      const settingsRef = doc(db, "settings", "wheel")
      this.unsubscribeSettings = onSnapshot(settingsRef, (doc) => {
        if (doc.exists()) {
          this.winSettings = doc.data()
          this.updateSegmentProbabilities()
          console.log("✅ تم تحديث إعدادات العجلة:", this.winSettings)
        }
      }, (error) => {
        console.error("❌ خطأ في الاستماع للإعدادات:", error)
      })
    },
    
    // دالة تحديد النتيجة بناءً على الاحتمالات الموزعة على القطاعات
    getWinningResult() {
      // حساب المجموع الكلي للاحتمالات
      const totalProbability = this.wheelSegments.reduce((sum, segment) => sum + segment.probability, 0)
      
      // توليد رقم عشوائي
      const random = Math.random() * totalProbability
      
      let cumulative = 0
      for (let i = 0; i < this.wheelSegments.length; i++) {
        cumulative += this.wheelSegments[i].probability
        if (random < cumulative) {
          const segment = this.wheelSegments[i]
          let type = ''
          let message = ''
          
          if (segment.value === 0) {
            type = 'loss'
            message = 'خسارة'
          } else if (segment.value === 0.5) {
            type = 'smallWin'
            message = 'ربح صغير'
          } else if (segment.value === 1) {
            type = 'draw'
            message = 'تعادل'
          } else {
            type = 'bigWin'
            message = 'ربح كبير'
          }
          
          console.log(`🎲 النتيجة: ${segment.value}x | الاحتمال: ${segment.probability}% | النوع: ${message}`)
          
          return {
            type: type,
            multiplier: segment.value,
            message: message,
            segmentIndex: i
          }
        }
      }
      
      // افتراضي: العودة إلى القطاع الأول
      return {
        type: 'loss',
        multiplier: 0,
        message: 'خسارة',
        segmentIndex: 0
      }
    },
    
    initSounds() {
      try {
        // صوت الدوران
        this.spinSound = new Audio('data:audio/wav;base64,UklGRlwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVQAAACAgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f38=')
        
        // صوت الفوز
        this.winSound = new Audio('data:audio/wav;base64,UklGRlwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVQAAACAgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f38=')
        
        // صوت الخسارة
        this.loseSound = new Audio('data:audio/wav;base64,UklGRlwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVQAAACAgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f38=')
        
        // صوت النقر
        this.clickSound = new Audio('data:audio/wav;base64,UklGRlwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVQAAACAgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f3+AgICAf39/f39/f38=')
        
        // ضبط مستوى الصوت
        this.spinSound.volume = 0.3
        this.winSound.volume = 0.5
        this.loseSound.volume = 0.4
        this.clickSound.volume = 0.2
        
      } catch (e) {
        console.log('الصوت غير مدعوم في هذا المتصفح')
      }
    },
    
    playSound(sound) {
      if (sound) {
        sound.currentTime = 0
        sound.play().catch(e => console.log('تعذر تشغيل الصوت'))
      }
    },
    
    getSegmentColor(value) {
      if (value === 0) return '#d32f2f' // أحمر (خسارة)
      if (value === 0.5) return '#fb8c00' // برتقالي (ربح صغير)
      if (value === 1) return '#ffa726' // برتقالي فاتح (تعادل)
      if (value === 1.5) return '#ffb74d' // برتقالي غامق
      if (value === 2) return '#66bb6a' // أخضر فاتح
      if (value === 3) return '#4caf50' // أخضر
      if (value === 5) return '#2e7d32' // أخضر غامق
      if (value === 10) return '#ffd700' // ذهبي
      return '#388e3c'
    },
    
    getTextColor(value) {
      if (value === 0 || value === 0.5 || value === 1 || value === 1.5 || value === 2 || value === 3 || value === 5) return 'white'
      if (value === 10) return '#222'
      return 'white'
    },
    
    getSegmentPath(index) {
      const centerX = 100
      const centerY = 100
      const radius = 85
      // SVG: الزاوية 0 على اليمين، 90 للأسفل
      const startAngle = (index * this.segmentAngle) * Math.PI / 180
      const endAngle = ((index + 1) * this.segmentAngle) * Math.PI / 180
      
      const x1 = centerX + radius * Math.cos(startAngle)
      const y1 = centerY + radius * Math.sin(startAngle)
      const x2 = centerX + radius * Math.cos(endAngle)
      const y2 = centerY + radius * Math.sin(endAngle)
      
      return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`
    },
    
    getTextX(index) {
      const centerX = 100
      const radius = 60
      // منتصف القطاع
      const angle = ((index + 0.5) * this.segmentAngle) * Math.PI / 180
      return centerX + radius * Math.cos(angle)
    },
    
    getTextY(index) {
      const centerY = 100
      const radius = 60
      const angle = ((index + 0.5) * this.segmentAngle) * Math.PI / 180
      return centerY + radius * Math.sin(angle)
    },
    
    // دالة لتحديد القطاع بناءً على زاوية الدوران (تستخدم فقط للعرض البصري)
    getCurrentSegmentIndex() {
      // زاوية الدوران المعدلة (0-360)
      let rotation = this.wheelRotation % 360
      if (rotation < 0) rotation += 360
      
      // السهم في الأعلى (زاوية 90 درجة)
      // القطاع الذي يشير إليه السهم هو القطاع الذي تكون زاويته 90 درجة في الاتجاه المعاكس للدوران
      const pointerAngle = 90
      
      // الزاوية الفعلية للقطاع تحت السهم
      const segmentAngleAtPointer = (pointerAngle - rotation + 360) % 360
      
      // تحديد رقم القطاع بناءً على الزاوية
      const segmentSize = this.segmentAngle
      let segmentIndex = Math.floor(segmentAngleAtPointer / segmentSize)
      
      // التأكد من أن المؤشر ضمن النطاق الصحيح
      if (segmentIndex >= this.wheelSegments.length) segmentIndex = this.wheelSegments.length - 1
      
      return segmentIndex
    },
    
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
      }, 3000)
    },
    
    resetGame() {
      this.wheelRotation = 0
      this.isSpinning = false
      this.lastResult = null
      this.gameError = ''
    },
    
    async spinWheel() {
      if (!this.canSpin) return
      
      // التأكد من تحميل الإعدادات
      if (this.settingsLoading) {
        this.gameError = 'جاري تحميل إعدادات اللعبة، يرجى الانتظار...'
        return
      }
      
      // إخفاء أي رسالة سابقة
      this.showResultMessage = false
      
      // تشغيل صوت النقر
      this.playSound(this.clickSound)
      
      this.gameError = ''
      this.isSpinning = true
      
      // خصم الرهان
      this.balance -= this.betAmount
      await this.updateBalance(this.balance)
      
      // تشغيل صوت الدوران
      this.playSound(this.spinSound)
      
      // تحديد النتيجة باستخدام نظام الاحتمالات (مستقل تماماً عن العجلة)
      const result = this.getWinningResult()
      console.log(`🎯 النتيجة المستهدفة: ${result.message} (مضاعف ${result.multiplier}x)`)
      
      // إيجاد القطاع المناسب للعرض البصري بناءً على قيمة المضاعف الناتج
      // البحث في wheelSegments عن قطاع يحمل نفس قيمة المضاعف
      const visualSegmentIndex = this.wheelSegments.findIndex(segment => segment.value === result.multiplier)
      
      let targetSegmentIndex = visualSegmentIndex
      if (targetSegmentIndex === -1) {
        // إذا لم يتم العثور على القطاع (لا يجب أن يحدث)، نستخدم قطاع الخسارة
        targetSegmentIndex = 0
        console.warn(`⚠️ لم يتم العثور على قطاع بمضاعف ${result.multiplier}، استخدام القطاع 0`)
      }
      
      console.log(`🎯 للعرض البصري: سيتوقف على قطاع ${targetSegmentIndex} بقيمة ${this.wheelSegments[targetSegmentIndex].value}x`)
      
      // منتصف القطاع المطلوب للعرض البصري
      const segmentMiddle = (targetSegmentIndex * this.segmentAngle) + (this.segmentAngle / 2)
      
      // السهم في الأعلى (زاوية 90 درجة في نظام SVG)
      // الزاوية المطلوبة لجعل منتصف القطاع تحت السهم = 90 - منتصف القطاع
      let requiredAngle = 90 - segmentMiddle
      
      // تصحيح الزاوية لتكون ضمن 0-360
      if (requiredAngle < 0) requiredAngle += 360
      
      // عدد دورات عشوائي (15-25 دورة) لتبدو طبيعية
      const spins = 15 + Math.floor(Math.random() * 10)
      
      // الزاوية المستهدفة: (360 * عدد الدورات) + الزاوية المطلوبة
      const targetRotation = (360 * spins) + requiredAngle
      
      const start = this.wheelRotation
      const duration = 3500
      const startTime = performance.now()
      
      const animate = (time) => {
        const elapsed = time - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // منحنى التباطؤ الطبيعي (يبدأ سريعًا ثم يبطئ)
        const easeOut = 1 - Math.pow(1 - progress, 3)
        
        this.wheelRotation = start + ((targetRotation - start) * easeOut)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          // التأكد من الزاوية النهائية مضبوطة
          this.wheelRotation = targetRotation
          
          // ننتظر قليلاً ثم ننهي الدوران باستخدام النتيجة المحسوبة مسبقاً
          setTimeout(() => {
            this.finishSpin(result)
          }, 200)
        }
      }
      
      requestAnimationFrame(animate)
    },
    
    async finishSpin(predictedResult) {
      this.isSpinning = false
      
      // استخدام المضاعف من النتيجة المحسوبة مسبقاً (مستقل تماماً عن العجلة)
      const multiplier = predictedResult.multiplier
      const winAmount = this.betAmount * multiplier
      let message = ''
      let isWin = false
      
      console.log(`💰 النتيجة النهائية: مضاعف ${multiplier}x | المبلغ ${winAmount.toFixed(2)} USDT`)
      
      // حساب النتيجة بدقة حسب قيمة المضاعف الفعلية
      if (multiplier === 0) {
        // خسارة كاملة
        message = `😢 خسرت ${this.betAmount.toFixed(2)} USDT`
        this.playSound(this.loseSound)
        isWin = false
      } 
      else if (multiplier === 0.5) {
        // ربح صغير
        this.balance += winAmount
        await this.updateBalance(this.balance)
        message = `🎉 ربحت ${winAmount.toFixed(2)} USDT! (ربح صغير ×${multiplier})`
        this.playSound(this.winSound)
        isWin = true
      }
      else if (multiplier === 1) {
        // تعادل - استرجاع الرهان كاملاً
        this.balance += this.betAmount
        await this.updateBalance(this.balance)
        message = `🤝 تعادل! استرجعت ${this.betAmount.toFixed(2)} USDT`
        this.playSound(this.winSound)
        isWin = true
      }
      else if (multiplier === 1.5) {
        // ربح متوسط
        this.balance += winAmount
        await this.updateBalance(this.balance)
        message = `🎉 ربحت ${winAmount.toFixed(2)} USDT! (ربح متوسط ×${multiplier})`
        this.playSound(this.winSound)
        isWin = true
      }
      else if (multiplier === 2) {
        // ربح جيد
        this.balance += winAmount
        await this.updateBalance(this.balance)
        message = `🎉🎉 ربحت ${winAmount.toFixed(2)} USDT! (ربح جيد ×${multiplier}) 🎉🎉`
        this.playSound(this.winSound)
        isWin = true
      }
      else if (multiplier === 3) {
        // ربح كبير
        this.balance += winAmount
        await this.updateBalance(this.balance)
        message = `🎉🎉🎉 ربحت ${winAmount.toFixed(2)} USDT! (ربح كبير ×${multiplier}) 🎉🎉🎉`
        this.playSound(this.winSound)
        isWin = true
      }
      else if (multiplier === 5) {
        // ربح ممتاز
        this.balance += winAmount
        await this.updateBalance(this.balance)
        message = `🏆🏆🏆 ربحت ${winAmount.toFixed(2)} USDT! (ربح ممتاز ×${multiplier}) 🏆🏆🏆`
        this.playSound(this.winSound)
        isWin = true
      }
      else if (multiplier === 10) {
        // الجائزة الكبرى
        this.balance += winAmount
        await this.updateBalance(this.balance)
        message = `👑👑👑 جائزة كبرى! ربحت ${winAmount.toFixed(2)} USDT! (×${multiplier}) 👑👑👑`
        this.playSound(this.winSound)
        isWin = true
      }
      else {
        // هذا لا يجب أن يحدث أبداً ولكن للاحتياط
        console.error('⚠️ قيمة غير متوقعة!', multiplier)
        this.balance += this.betAmount
        await this.updateBalance(this.balance)
        message = `🔄 استرجعت ${this.betAmount.toFixed(2)} USDT`
        this.playSound(this.winSound)
        isWin = true
      }
      
      // عرض رسالة النتيجة بعد توقف العجلة
      this.showResult(message, isWin)
      
      // حفظ النتيجة الأخيرة
      this.lastResult = {
        multiplier: multiplier,
        isWin: isWin,
        winAmount: winAmount,
        message: message
      }
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
  min-width: 320px;
  justify-content: center;
  text-align: center;
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
.wheel-wrapper {
  position: relative;
  width: 300px;
  height: 300px;
  margin: 20px auto;
}

@media (max-width: 480px) {
  .wheel-wrapper {
    width: 250px;
    height: 250px;
  }
}

.pointer {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 50px;
  color: gold;
  z-index: 10;
  text-shadow: 0 0 20px gold, 0 0 40px rgba(255, 215, 0, 0.5);
  animation: pointerGlow 1.5s infinite;
}

@keyframes pointerGlow {
  0%, 100% { text-shadow: 0 0 15px gold; }
  50% { text-shadow: 0 0 30px gold; }
}

.wheel-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.wheel-svg {
  width: 100%;
  height: 100%;
  transition: transform 3.5s cubic-bezier(0.1, 0.9, 0.2, 1);
  filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.3));
}

/* ===== قسم الرهان ===== */
.bet-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
  margin-top: 30px;
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

  .pointer {
    font-size: 40px;
    top: -10px;
  }

  .bet-section {
    padding: 15px;
  }
}
</style>
