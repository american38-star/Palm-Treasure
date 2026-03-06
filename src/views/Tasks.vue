<template>

<div class="casino-container">

<h1 class="title">Casino Games</h1>

<div class="games-grid">

<div class="game-card" @click="openGame('bigwheel')">

<img
src="@/assets/bigwheel.jpg"
class="game-image"
/>

<p class="game-name">Big Wheel Bonus</p>

</div>

</div>

<div class="game-area" v-if="selectedGame">

<BigWheelGame v-if="selectedGame === 'bigwheel'" />

<button class="close-btn" @click="closeGame">
Close Game
</button>

</div>

</div>

</template>

<script>

import BigWheelGame from "@/components/games/BigWheelGame.vue"

export default {

name:"GamesView",

components:{
BigWheelGame
},

data(){

return{

selectedGame:null

}

},

methods:{

openGame(game){

this.selectedGame = game

},

closeGame(){

this.selectedGame = null

}

}

}

</script>

<style scoped>

.casino-container{

padding:20px;

background:#111;

min-height:100vh;

color:white;

}

.title{

text-align:center;

margin-bottom:30px;

}

.games-grid{

display:grid;

grid-template-columns:repeat(3,1fr);

gap:20px;

}

.game-card{

background:#1a1a1a;

border-radius:10px;

cursor:pointer;

text-align:center;

padding:10px;

transition:0.3s;

}

.game-card:hover{

transform:scale(1.05);

}

.game-image{

width:100%;

border-radius:10px;

}

.game-name{

margin-top:10px;

}

.game-area{

margin-top:30px;

text-align:center;

}

.close-btn{

margin-top:20px;

padding:10px 20px;

background:red;

border:none;

border-radius:8px;

color:white;

cursor:pointer;

}

</style>
