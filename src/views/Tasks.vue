<!-- src/views/Tasks.vue -->
<template>
  <div class="games-page">
    <!-- الرصيد -->
    <div class="balance-container">
      <div class="balance-card">
        <i class="fas fa-coins"></i>
        <span>Balance: ${{ balance.toFixed(2) }}</span>
      </div>
    </div>

    <!-- رسالة النتيجة -->
    <transition name="fade">
      <div v-if="resultMessage.show" class="result-message" :class="resultMessage.type">
        <i :class="resultMessage.icon"></i>
        <span>{{ resultMessage.text }}</span>
      </div>
    </transition>

    <!-- تحميل الألعاب -->
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      <span>جاري تحميل الألعاب...</span>
    </div>

    <!-- عرض الألعاب -->
    <div v-else class="games-container">
      <!-- الصف الأول: Chicken Crash و Big Wheel -->
      <div class="featured-row">
        <!-- لعبة Chicken Crash -->
        <div 
          v-if="chickenGame" 
          class="featured-card chicken-card"
          @click="openGame(chickenGame)"
        >
          <div class="game-image-container featured">
            <img 
              v-if="chickenGame.image" 
              :src="chickenGame.image" 
              :alt="chickenGame.name"
              class="game-image"
              @error="handleImageError($event, chickenGame)"
            >
            <div v-else class="game-icon featured">{{ chickenGame.icon || '🐔' }}</div>
          </div>
          <div class="game-info">
            <h3 class="game-name featured">{{ chickenGame.name }}</h3>
            <div class="game-stats">
              <span class="stat-value">0.000</span>
            </div>
          </div>
        </div>

        <!-- لعبة Big Wheel -->
        <div 
          v-if="bigWheelGame" 
          class="featured-card wheel-card"
          @click="openGame(bigWheelGame)"
        >
          <div class="game-image-container featured">
            <img 
              v-if="bigWheelGame.image" 
              :src="bigWheelGame.image" 
              :alt="bigWheelGame.name"
              class="game-image"
              @error="handleImageError($event, bigWheelGame)"
            >
            <div v-else class="game-icon featured">{{ bigWheelGame.icon || '🎡' }}</div>
          </div>
          <div class="game-info">
            <h3 class="game-name featured">{{ bigWheelGame.name }}</h3>
            <p class="game-subtitle">BIG WHEEL BONUS</p>
          </div>
        </div>
      </div>

      <!-- باقي الألعاب في شبكة -->
      <div v-if="otherGames.length > 0" class="games-grid">
        <div 
          v-for="game in otherGames" 
          :key="game.id"
          class="game-card"
          @click="openGame(game)"
        >
          <div class="game-image-container">
            <img 
              v-if="game.image" 
              :src="game.image" 
              :alt="game.name"
              class="game-image"
              @error="handleImageError($event, game)"
            >
            <div v-else class="game-icon">{{ game.icon || '🎮' }}</div>
          </div>
          <h3 class="game-name">{{ game.name }}</h3>
          <p class="game-description">{{ game.description || 'اضغط للعب' }}</p>
        </div>
      </div>
    </div>

    <!-- نافذة اللعبة -->
    <transition name="slide-up">
      <div v-if="selectedGame" class="game-modal">
        <div class="game-modal-header">
          <button class="close-button" @click="closeGame">
            <i class="fas fa-times"></i>
          </button>
          <h2>{{ selectedGame.name }}</h2>
        </div>
        <div class="game-modal-content">
          <component 
            :is="selectedGame.component"
            :balance="balance"
            @update-balance="updateBalance"
            @show-result="showResult"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { auth, getUserBalance, updateUserBalance, addTransaction } from "../firebase"
import { shallowRef, computed } from 'vue'

export default {
  name: "Tasks",
  
  setup() {
    // استيراد جميع الألعاب تلقائياً من مجلد games
    const gameModules = import.meta.glob('../components/games/*.vue', { eager: true })
    
    // استيراد جميع الصور من مجلد assets
    const assetImages = import.meta.glob('../assets/*.{png,jpg,jpeg,svg,gif,webp}', { 
      eager: true,
      as: 'url'
    })
    
    console.log("📸 الصور الموجودة في assets:", Object.keys(assetImages))
    
    const gamesComponents = []
    
    // تحويل الملفات المستوردة إلى مصفوفة من الكائنات
    for (const path in gameModules) {
      const component = gameModules[path].default
      const fileName = path.split('/').pop().replace('.vue', '')
      const fileNameLower = fileName.toLowerCase()
      
      // البحث عن صورة بنفس اسم اللعبة في مجلد assets
      let gameImage = null
      
      // البحث عن صورة تطابق اسم اللعبة
      for (const imagePath in assetImages) {
        const imageFileName = imagePath.split('/').pop().toLowerCase()
        
        // التحقق مما إذا كان اسم الصورة يحتوي على اسم اللعبة
        if (imageFileName.includes(fileNameLower) || 
            fileNameLower.includes(imageFileName.replace(/\.[^/.]+$/, ""))) {
          gameImage = assetImages[imagePath]
          console.log(`✅ تم العثور على صورة للعبة ${fileName}: ${imagePath}`)
          break
        }
      }
      
      // إذا لم يتم العثور على صورة، حاول استخدام صورة افتراضية
      if (!gameImage) {
        for (const imagePath in assetImages) {
          if (imagePath.endsWith('.jpg') || imagePath.endsWith('.png')) {
            gameImage = assetImages[imagePath]
            console.log(`⚠️ استخدام صورة افتراضية للعبة ${fileName}: ${imagePath}`)
            break
          }
        }
      }
      
      // استخراج اسم اللعبة من الملف أو استخدام اسم الملف
      let gameName = fileName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
      let gameIcon = '🎮'
      let gameDescription = 'اضغط للعب'
      
      // إذا كان المكون يحتوي على خصائص meta، استخدمها
      if (component.meta) {
        gameName = component.meta.name || gameName
        gameIcon = component.meta.icon || gameIcon
        gameDescription = component.meta.description || gameDescription
      }
      
      gamesComponents.push({
        id: fileName,
        name: gameName,
        icon: gameIcon,
        image: gameImage,
        description: gameDescription,
        component: shallowRef(component)
      })
    }
    
    return {
      gamesComponents
    }
  },

  data() {
    return {
      balance: 0,
      loading: true,
      selectedGame: null,
      resultMessage: {
        show: false,
        type: '',
        icon: '',
        text: ''
      },
      resultTimeout: null,
      failedImages: new Set()
    }
  },

  computed: {
    // البحث عن لعبة Chicken Crash
    chickenGame() {
      return this.gamesComponents.find(game => 
        game.name.toLowerCase().includes('chicken') || 
        game.id.toLowerCase().includes('chicken')
      )
    },
    
    // البحث عن لعبة Big Wheel
    bigWheelGame() {
      return this.gamesComponents.find(game => 
        game.name.toLowerCase().includes('wheel') || 
        game.name.toLowerCase().includes('big') ||
        game.id.toLowerCase().includes('wheel') ||
        game.id.toLowerCase().includes('big')
      )
    },
    
    // باقي الألعاب
    otherGames() {
      const featuredIds = []
      if (this.chickenGame) featuredIds.push(this.chickenGame.id)
      if (this.bigWheelGame) featuredIds.push(this.bigWheelGame.id)
      
      return this.gamesComponents.filter(game => !featuredIds.includes(game.id))
    }
  },

  async created() {
    await this.fetchUserBalance()
  },

  methods: {
    async fetchUserBalance() {
      this.loading = true
      const user = auth.currentUser
      
      if (!user) {
        console.log("⚠️ لا يوجد مستخدم مسجل الدخول")
        this.loading = false
        return
      }

      try {
        this.balance = await getUserBalance(user.uid)
        console.log("✅ تم جلب الرصيد:", this.balance)
      } catch (error) {
        console.error("❌ خطأ في جلب الرصيد:", error)
      } finally {
        this.loading = false
      }
    },

    async updateBalance(newBalance, gameName = '', betAmount = 0, won = false) {
      const oldBalance = this.balance
      this.balance = newBalance
      
      const user = auth.currentUser
      if (!user) return

      try {
        const success = await updateUserBalance(user.uid, newBalance)
        
        if (success) {
          console.log(`✅ تم تحديث الرصيد: ${oldBalance} -> ${newBalance}`)
          
          if (gameName && betAmount > 0) {
            await addTransaction(user.uid, {
              gameName,
              betAmount,
              won,
              oldBalance,
              newBalance,
              profit: newBalance - oldBalance
            })
          }
        } else {
          this.balance = oldBalance
          this.showResult('فشل تحديث الرصيد!', false)
        }
      } catch (error) {
        console.error("❌ خطأ في تحديث الرصيد:", error)
        this.balance = oldBalance
      }
    },

    openGame(game) {
      this.selectedGame = game
    },

    closeGame() {
      this.selectedGame = null
    },

    showResult(message, isWin) {
      if (this.resultTimeout) {
        clearTimeout(this.resultTimeout)
      }

      this.resultMessage = {
        show: true,
        type: isWin ? 'win' : 'lose',
        icon: isWin ? 'fas fa-trophy' : 'fas fa-skull',
        text: message
      }

      this.resultTimeout = setTimeout(() => {
        this.resultMessage.show = false
      }, 2000)
    },

    handleImageError(event, game) {
      if (this.failedImages.has(game.id)) return
      
      this.failedImages.add(game.id)
      console.warn(`⚠️ فشل تحميل صورة اللعبة: ${game.name}`)
      
      event.target.style.display = 'none'
      const iconDiv = document.createElement('div')
      iconDiv.className = 'game-icon'
      iconDiv.textContent = game.icon || '🎮'
      event.target.parentNode.appendChild(iconDiv)
    }
  },

  beforeUnmount() {
    if (this.resultTimeout) {
      clearTimeout(this.resultTimeout)
    }
  }
}
</script>

<style scoped>
.games-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1f2e 0%, #2a2f3f 100%);
  padding: 20px;
  font-family: 'Arial', sans-serif;
  color: #ffffff;
}

/* حاوية الرصيد */
.balance-container {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  position: sticky;
  top: 20px;
  z-index: 100;
}

.balance-card {
  background: #2a2f42;
  padding: 15px 40px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 24px;
  color: #ffffff;
  border: 1px solid #3a4055;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.balance-card i {
  color: #ffd700;
  font-size: 28px;
}

.balance-card span {
  color: #ffffff;
}

/* حاوية الألعاب */
.games-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* الصف المميز */
.featured-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  margin-bottom: 40px;
}

/* البطاقات المميزة */
.featured-card {
  background: #2a2f42;
  border-radius: 15px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  text-align: center;
}

.featured-card:hover {
  transform: translateY(-5px);
  border-color: #ffd700;
  box-shadow: 0 10px 30px rgba(255, 215, 0, 0.2);
}

.chicken-card {
  background: #2a2f42;
}

.wheel-card {
  background: #252a3c;
}

.game-image-container.featured {
  width: 100%;
  height: 220px;
  margin-bottom: 15px;
  border-radius: 10px;
  overflow: hidden;
  background: #1e2335;
}

.game-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.featured-card:hover .game-image {
  transform: scale(1.05);
}

.game-icon.featured {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80px;
  background: linear-gradient(135deg, #ffd700, #ffa500);
  color: #1e2335;
}

.game-info {
  margin-top: 10px;
}

.game-name.featured {
  font-size: 24px;
  color: #ffffff;
  margin-bottom: 10px;
  font-weight: bold;
}

.game-stats {
  padding: 10px;
  background: #1e2335;
  border-radius: 8px;
  display: inline-block;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #ffd700;
}

.game-subtitle {
  font-size: 18px;
  color: #ffd700;
  margin: 10px 0 0;
  font-weight: 600;
  text-transform: uppercase;
}

/* شبكة الألعاب */
.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  margin-top: 20px;
}

.game-card {
  background: #2a2f42;
  border-radius: 12px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  text-align: center;
}

.game-card:hover {
  transform: translateY(-3px);
  border-color: #ffd700;
  box-shadow: 0 5px 20px rgba(255, 215, 0, 0.2);
}

.game-image-container {
  width: 100%;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  background: #1e2335;
  margin-bottom: 10px;
}

.game-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50px;
  background: linear-gradient(135deg, #3a4055, #2a2f42);
  color: #ffd700;
}

.game-name {
  font-size: 18px;
  color: #ffffff;
  margin-bottom: 5px;
  font-weight: 600;
}

.game-description {
  color: #a0a0a0;
  font-size: 13px;
  margin: 0;
}

/* رسالة النتيجة */
.result-message {
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 15px 30px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: bold;
  z-index: 1000;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  animation: slideDown 0.3s ease;
}

.result-message.win {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
}

.result-message.lose {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}

@keyframes slideDown {
  from {
    top: 50px;
    opacity: 0;
  }
  to {
    top: 100px;
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

/* التحميل */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #ffffff;
  font-size: 18px;
  gap: 15px;
}

.loading i {
  font-size: 40px;
  color: #ffd700;
}

/* نافذة اللعبة */
.game-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

.game-modal-header {
  background: #1e2335;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  color: white;
  border-bottom: 2px solid #ffd700;
}

.close-button {
  background: #2a2f42;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #ffd700;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: #ffd700;
  color: #1e2335;
  transform: rotate(90deg);
}

.game-modal-header h2 {
  margin: 0;
  font-size: 20px;
  flex: 1;
  color: #ffd700;
}

.game-modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* تحسينات الجوال */
@media (max-width: 768px) {
  .games-page {
    padding: 10px;
  }

  .balance-card {
    font-size: 18px;
    padding: 12px 25px;
  }

  .featured-row {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .game-image-container.featured {
    height: 180px;
  }

  .game-name.featured {
    font-size: 20px;
  }

  .game-subtitle {
    font-size: 16px;
  }

  .games-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .balance-card {
    font-size: 16px;
    padding: 10px 20px;
  }

  .game-image-container.featured {
    height: 150px;
  }

  .game-icon.featured {
    font-size: 60px;
  }

  .games-grid {
    grid-template-columns: 1fr;
  }

  .result-message {
    font-size: 14px;
    padding: 10px 20px;
    top: 80px;
  }

  .game-image-container {
    height: 130px;
  }
}
</style>
