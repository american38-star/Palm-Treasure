<template>
<div class="games-page">

<!-- top bar -->
<div class="top-bar">

<div class="balance">
رصيدك :
<strong>{{ balance.toFixed(2) }} $</strong>
</div>

</div>

<!-- games grid -->
<div class="games-grid">

<div
v-for="game in games"
:key="game.id"
class="game-card"
@click="openGame(game.id)"
>

<img :src="game.image" class="game-image"/>

<div class="game-name">
{{ game.name }}
</div>

</div>

</div>

<!-- game screen -->
<div v-if="currentGame" class="game-screen">

<button class="back-btn" @click="closeGame">
رجوع
</button>

<ChickenRoadGame
v-if="currentGame === 'chickenroad'"
:balance="balance"
@updateBalance="updateBalance"
/>

<BigWheelGame
v-if="currentGame === 'bigwheel'"
:balance="balance"
@updateBalance="updateBalance"
/>

</div>

</div>
</template>

<script>

import ChickenRoadGame from "@/components/games/ChickenRoadGame.vue"
import BigWheelGame from "@/components/games/BigWheelGame.vue"

export default {

name:"Tasks",

components:{
ChickenRoadGame,
BigWheelGame
},

data(){
return{

balance:1000,

currentGame:null,

games:[

{
id:"chickenroad",
name:"Chicken Crash",
image:"/games/chicken.jpg"
},

{
id:"bigwheel",
name:"Big Wheel",
image:"/games/bigwheel.jpg"
}

]

}
},

methods:{

openGame(id){
this.currentGame=id
},

closeGame(){
this.currentGame=null
},

updateBalance(newBalance){
this.balance=newBalance
}

}

}

</script>

<style scoped>

.games-page{
padding:15px;
background:#111;
min-height:100vh;
color:white;
}

.top-bar{
display:flex;
justify-content:space-between;
margin-bottom:15px;
}

.balance{
font-size:18px;
}

.games-grid{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:10px;
}

.game-card{
background:#222;
border-radius:10px;
padding:5px;
text-align:center;
cursor:pointer;
}

.game-image{
width:100%;
border-radius:8px;
}

.game-name{
margin-top:5px;
font-size:14px;
}

.game-screen{
margin-top:10px;
}

.back-btn{
background:#333;
color:white;
border:none;
padding:10px;
margin-bottom:10px;
border-radius:8px;
}

</style>
