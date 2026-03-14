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

    <!-- تحميل -->
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      <span>جاري تحميل الألعاب...</span>
    </div>

    <!-- الألعاب -->
    <div v-else class="games-container">

      <!-- الألعاب المميزة -->
      <div class="featured-row">

        <!-- Chicken -->
        <div
          v-if="chickenGame"
          class="featured-card"
          @click="openGame(chickenGame)"
        >
          <div class="game-image-container featured">
            <img
              v-if="chickenGame.image"
              :src="chickenGame.image"
              :alt="chickenGame.name"
              class="game-image"
            >
            <div v-else class="game-icon featured">
              {{ chickenGame.icon || '🐔' }}
            </div>
          </div>

          <div class="game-info">
            <h3 class="game-name featured">{{ chickenGame.name }}</h3>
          </div>
        </div>

        <!-- Big Wheel -->
        <div
          v-if="bigWheelGame"
          class="featured-card"
          @click="openGame(bigWheelGame)"
        >
          <div class="game-image-container featured">
            <img
              v-if="bigWheelGame.image"
              :src="bigWheelGame.image"
              :alt="bigWheelGame.name"
              class="game-image"
            >
            <div v-else class="game-icon featured">
              {{ bigWheelGame.icon || '🎡' }}
            </div>
          </div>

          <div class="game-info">
            <h3 class="game-name featured">{{ bigWheelGame.name }}</h3>
          </div>
        </div>

      </div>

      <!-- باقي الألعاب -->
      <div v-if="otherGames.length" class="games-grid">
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
            >
            <div v-else class="game-icon">
              {{ game.icon || '🎮' }}
            </div>
          </div>

          <h3 class="game-name">{{ game.name }}</h3>
          <p class="game-description">
            {{ game.description || 'اضغط للعب' }}
          </p>
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
import { shallowRef } from "vue"

export default {

  name: "Tasks",

  setup() {

    /* استيراد الألعاب */
    const gameModules = import.meta.glob(
      "../components/games/*.vue",
      { eager: true }
    )

    /* استيراد الصور */
    const assetImages = import.meta.glob(
      "../assets/*.{png,jpg,jpeg,svg,gif,webp}",
      {
        eager: true,
        import: "default"
      }
    )

    const gamesComponents = []

    for (const path in gameModules) {

      const component = gameModules[path].default

      const fileName = path.split("/").pop().replace(".vue", "")
      const fileNameLower = fileName.toLowerCase()

      let gameImage = null

      for (const imagePath in assetImages) {

        const imageFile = imagePath.split("/").pop().toLowerCase()
        const imageName = imageFile.replace(/\.[^/.]+$/, "")

        if (
          imageName === fileNameLower ||
          imageName.includes(fileNameLower) ||
          fileNameLower.includes(imageName)
        ) {
          gameImage = assetImages[imagePath]
          break
        }
      }

      let gameName = fileName
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, s => s.toUpperCase())

      let gameIcon = "🎮"
      let gameDescription = "اضغط للعب"

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
        type: "",
        icon: "",
        text: ""
      },

      resultTimeout: null
    }
  },

  computed: {

    chickenGame() {
      return this.gamesComponents.find(g =>
        g.name.toLowerCase().includes("chicken")
      )
    },

    bigWheelGame() {
      return this.gamesComponents.find(g =>
        g.name.toLowerCase().includes("wheel")
      )
    },

    otherGames() {

      const ids = []

      if (this.chickenGame) ids.push(this.chickenGame.id)
      if (this.bigWheelGame) ids.push(this.bigWheelGame.id)

      return this.gamesComponents.filter(g => !ids.includes(g.id))
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
        this.loading = false
        return
      }

      try {
        this.balance = await getUserBalance(user.uid)
      }
      catch (e) {
        console.error(e)
      }
      finally {
        this.loading = false
      }

    },

    async updateBalance(newBalance, gameName="", betAmount=0, won=false) {

      const oldBalance = this.balance
      this.balance = newBalance

      const user = auth.currentUser
      if (!user) return

      try {

        const ok = await updateUserBalance(user.uid, newBalance)

        if (ok && gameName && betAmount) {

          await addTransaction(user.uid,{
            gameName,
            betAmount,
            won,
            oldBalance,
            newBalance,
            profit:newBalance-oldBalance
          })

        }

      }
      catch(e){
        console.error(e)
        this.balance = oldBalance
      }

    },

    openGame(game){
      this.selectedGame = game
    },

    closeGame(){
      this.selectedGame = null
    },

    showResult(message,isWin){

      clearTimeout(this.resultTimeout)

      this.resultMessage = {
        show:true,
        type:isWin ? "win":"lose",
        icon:isWin ? "fas fa-trophy":"fas fa-skull",
        text:message
      }

      this.resultTimeout = setTimeout(()=>{
        this.resultMessage.show=false
      },2000)

    }

  },

  beforeUnmount(){
    clearTimeout(this.resultTimeout)
  }

}
</script>

<style scoped>
.games-page{
min-height:100vh;
background:#1a1f2e;
padding:20px;
color:white;
}

.balance-container{
display:flex;
justify-content:center;
margin-bottom:30px;
}

.balance-card{
background:#2a2f42;
padding:15px 40px;
border-radius:50px;
font-size:22px;
}

.games-container{
max-width:1200px;
margin:auto;
}

.featured-row{
display:grid;
grid-template-columns:1fr 1fr;
gap:25px;
margin-bottom:40px;
}

.featured-card{
background:#2a2f42;
border-radius:15px;
padding:20px;
cursor:pointer;
}

.game-image-container{
height:180px;
background:#1e2335;
margin-bottom:10px;
}

.game-image{
width:100%;
height:100%;
object-fit:cover;
}

.game-icon{
display:flex;
align-items:center;
justify-content:center;
height:100%;
font-size:50px;
}

.games-grid{
display:grid;
grid-template-columns:repeat(auto-fill,minmax(250px,1fr));
gap:20px;
}

.game-card{
background:#2a2f42;
padding:15px;
border-radius:12px;
cursor:pointer;
}

.game-name{
font-size:18px;
margin-top:5px;
}

.game-description{
font-size:13px;
color:#aaa;
}

.loading{
display:flex;
flex-direction:column;
align-items:center;
margin-top:100px;
}

.game-modal{
position:fixed;
top:0;
left:0;
right:0;
bottom:0;
background:black;
z-index:1000;
}

.game-modal-header{
display:flex;
gap:10px;
padding:15px;
background:#1e2335;
}

.close-button{
background:none;
border:none;
font-size:24px;
color:#ffd700;
cursor:pointer;
}
</style>
