<template>

<div class="game">

<div class="topbar">

<div class="logo">1XBET</div>

<div class="balance">
$ {{ balance.toFixed(2) }}
</div>

</div>

<div class="game-area">

<canvas ref="canvas" width="360" height="360"></canvas>

</div>

<div class="panel">

<button class="play-btn" @click="startGame">
PLAY
</button>

<div class="bet-box">

<div class="label">BET AMOUNT</div>

<div class="bet-row">

<input type="number" v-model.number="bet" min="0.1"/>

<button @click="halfBet">1/2</button>
<button @click="doubleBet">x2</button>
<button @click="maxBet">Max</button>

</div>

</div>

<div class="risk-box">

<div class="label">RISK</div>

<div class="risk-buttons">

<button :class="{active:risk=='low'}" @click="risk='low'">LOW</button>
<button :class="{active:risk=='medium'}" @click="risk='medium'">MEDIUM</button>
<button :class="{active:risk=='high'}" @click="risk='high'">HIGH</button>

</div>

</div>

<div class="multiplier">

x {{ multiplier.toFixed(2) }}

</div>

</div>

</div>

</template>

<script>

export default{

name:"ChickenRoadGame",

data(){

return{

balance:1000,

bet:0.1,

risk:"medium",

multiplier:1,

running:false,

canvas:null,

ctx:null,

chicken:{
x:40,
y:170,
w:30,
h:30
},

cars:[]

}

},

mounted(){

this.canvas=this.$refs.canvas

this.ctx=this.canvas.getContext("2d")

this.loop()

},

methods:{

startGame(){

if(this.running) return

if(this.bet>this.balance){
alert("Not enough balance")
return
}

this.balance-=this.bet

this.multiplier=1

this.running=true

this.cars=[]

},

halfBet(){

this.bet=this.bet/2

},

doubleBet(){

this.bet=this.bet*2

},

maxBet(){

this.bet=this.balance

},

spawnCar(){

let speed=2

if(this.risk=="medium") speed=3
if(this.risk=="high") speed=4

this.cars.push({

x:360,

y:Math.random()*300+20,

w:40,

h:20,

speed:speed

})

},

drawRoad(){

this.ctx.fillStyle="#333"

this.ctx.fillRect(0,0,360,360)

this.ctx.strokeStyle="#777"

for(let i=0;i<6;i++){

this.ctx.beginPath()

this.ctx.moveTo(i*60,0)

this.ctx.lineTo(i*60,360)

this.ctx.stroke()

}

},

drawChicken(){

this.ctx.fillStyle="yellow"

this.ctx.fillRect(

this.chicken.x,

this.chicken.y,

this.chicken.w,

this.chicken.h

)

},

drawCars(){

this.ctx.fillStyle="red"

this.cars.forEach(car=>{

this.ctx.fillRect(

car.x,

car.y,

car.w,

car.h

)

})

},

updateCars(){

this.cars.forEach(car=>{

car.x-=car.speed

})

this.cars=this.cars.filter(car=>car.x>-50)

},

checkCollision(){

for(let car of this.cars){

if(

this.chicken.x < car.x + car.w &&
this.chicken.x + this.chicken.w > car.x &&
this.chicken.y < car.y + car.h &&
this.chicken.y + this.chicken.h > car.y

){

this.crash()

}

}

},

crash(){

this.running=false

this.multiplier=1

alert("CRASH 💥")

},

win(){

let win=this.bet*this.multiplier

this.balance+=win

this.running=false

alert("YOU WIN "+win.toFixed(2))

},

updateGame(){

if(!this.running) return

this.multiplier+=0.01

if(Math.random()<0.03){
this.spawnCar()
}

this.updateCars()

this.checkCollision()

if(this.multiplier>=10){
this.win()
}

},

loop(){

this.ctx.clearRect(0,0,360,360)

this.drawRoad()

this.drawChicken()

this.drawCars()

this.updateGame()

requestAnimationFrame(this.loop)

}

}

}

</script>

<style scoped>

.game{
background:#111;
color:white;
font-family:Arial;
padding:10px;
}

.topbar{
display:flex;
justify-content:space-between;
background:#000;
padding:10px;
border-radius:6px;
margin-bottom:10px;
}

.logo{
font-weight:bold;
color:#3fa9f5;
}

.balance{
font-size:18px;
}

.game-area{
display:flex;
justify-content:center;
}

canvas{
background:#222;
border-radius:10px;
}

.panel{
margin-top:10px;
}

.play-btn{
width:100%;
background:#1e88e5;
border:none;
padding:15px;
font-size:18px;
color:white;
border-radius:8px;
margin-bottom:10px;
}

.bet-box{
margin-bottom:10px;
}

.bet-row{
display:flex;
gap:5px;
}

.bet-row input{
width:80px;
padding:5px;
}

.bet-row button{
padding:5px 10px;
}

.risk-buttons{
display:flex;
gap:10px;
}

.risk-buttons button{
flex:1;
padding:8px;
background:#333;
color:white;
border:none;
}

.risk-buttons .active{
background:#f5c400;
color:black;
}

.multiplier{
text-align:center;
font-size:24px;
margin-top:10px;
color:#00ff9d;
}

</style>
