const STORAGE="plantApp"

let plants=JSON.parse(localStorage.getItem(STORAGE)||"[]")

let editId=null

function saveData(){
localStorage.setItem(STORAGE,JSON.stringify(plants))
}

function daysUntil(date){
if(!date) return null
let today=new Date()
let d=new Date(date)
return Math.floor((d-today)/86400000)
}

function nextDate(last,days){
if(!last||!days) return null
let d=new Date(last)
d.setDate(d.getDate()+Number(days))
return d
}

function nextMonth(last,months){
if(!last||!months) return null
let d=new Date(last)
d.setMonth(d.getMonth()+Number(months))
return d
}

function render(){

let dueDiv=document.getElementById("dueList")
let listDiv=document.getElementById("plantList")

dueDiv.innerHTML=""
listDiv.innerHTML=""

plants.forEach(p=>{

let tasks=[]

let w=nextDate(p.lastWater,p.waterEvery)
let m=nextDate(p.lastMist,p.mistEvery)
let f=nextDate(p.lastFert,p.fertEvery)
let r=nextMonth(p.lastRepot,p.repotEvery)

if(w && daysUntil(w)<=0) tasks.push("Water")
if(m && daysUntil(m)<=0) tasks.push("Mist")
if(f && daysUntil(f)<=0) tasks.push("Fertilize")
if(r && daysUntil(r)<=0) tasks.push("Repot")

let card=document.createElement("div")
card.className="card"

let left=document.createElement("div")

left.innerHTML=`<b>${p.name}</b><br>${p.location||""}`

if(p.photo){
let img=document.createElement("img")
img.src=p.photo
img.style.width="60px"
img.style.borderRadius="8px"
card.appendChild(img)
}

card.appendChild(left)

let btn=document.createElement("button")
btn.textContent="Edit"
btn.onclick=()=>openPlant(p.id)

card.appendChild(btn)

listDiv.appendChild(card)

if(tasks.length){

let due=document.createElement("div")
due.className="card"
due.innerHTML=`${p.name}: ${tasks.join(", ")}`

dueDiv.appendChild(due)

}

})

}

function openPlant(id){

document.getElementById("plantModal").style.display="block"

if(!id){
editId=null
return
}

let p=plants.find(x=>x.id==id)
editId=id

plantName.value=p.name
plantLocation.value=p.location
waterEvery.value=p.waterEvery
lastWater.value=p.lastWater
mistEvery.value=p.mistEvery
lastMist.value=p.lastMist
fertEvery.value=p.fertEvery
lastFert.value=p.lastFert
repotEvery.value=p.repotEvery
lastRepot.value=p.lastRepot
notes.value=p.notes
photoPreview.src=p.photo||""

}

function closePlant(){
document.getElementById("plantModal").style.display="none"
}

function savePlant(){

let plant={
id:editId||Date.now(),
name:plantName.value,
location:plantLocation.value,
waterEvery:waterEvery.value,
lastWater:lastWater.value,
mistEvery:mistEvery.value,
lastMist:lastMist.value,
fertEvery:fertEvery.value,
lastFert:lastFert.value,
repotEvery:repotEvery.value,
lastRepot:lastRepot.value,
notes:notes.value,
photo:photoPreview.src
}

if(editId){
plants=plants.map(p=>p.id==editId?plant:p)
}else{
plants.push(plant)
}

saveData()
render()
closePlant()

}

function deletePlant(){

if(!editId) return

plants=plants.filter(p=>p.id!=editId)

saveData()
render()
closePlant()

}

document.getElementById("photoInput").addEventListener("change",function(e){

let file=e.target.files[0]

let reader=new FileReader()

reader.onload=function(){
photoPreview.src=reader.result
}

reader.readAsDataURL(file)

})

render()