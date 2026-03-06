<template>

<div class="wheel-container">

<h2 class="game-title">Big Wheel Bonus</h2>

<div class="wheel-box">

<img
src="@/assets/bigwheel.jpg"
class="wheel-image"
:class="{ spinning: spinning }"
/>

</div>

<button
class="spin-button"
@click="spinWheel"
:disabled="spinning"
>

Spin Wheel

</button>

<div class="result" v-if="result">

<p>You Won: {{ result }}</p>

</div>

</div>

</template>

<script>

export default {

name: "BigWheelGame",

data(){

return{

spinning:false,

result:null,

rewards:[
"10 Coins",
"20 Coins",
"50 Coins",
"100 Coins",
"200 Coins",
"500 Coins"
]

}

},

methods:{

spinWheel(){

if(this.spinning) return

this.spinning = true

this.result = null

setTimeout(()=>{

const random =
Math.floor(Math.random() * this.rewards.length)

this.result = this.rewards[random]

this.spinning = false

},3000)

}

}

}

</script>

<style scoped>

.wheel-container{

text-align:center;

padding:30px;

background:#0e0e0e;

border-radius:12px;

color:white;

}

.game-title{

margin-bottom:20px;

font-size:28px;

}

.wheel-box{

display:flex;

justify-content:center;

margin-bottom:20px;

}

.wheel-image{

width:300px;

transition:transform 3s;

}

.spinning{

animation: spin 3s linear;

}

@keyframes spin{

0%{

transform:rotate(0deg);

}

100%{

transform:rotate(1080deg);

}

}

.spin-button{

background:#00c853;

border:none;

padding:12px 25px;

font-size:18px;

border-radius:8px;

cursor:pointer;

color:white;

}

.spin-button:disabled{

background:gray;

cursor:not-allowed;

}

.result{

margin-top:20px;

font-size:20px;

color:#ffd700;

}

</style>
