
//$1056 an hour
//0.2933333333 dollars a second
let infobutton;
var dollarsASecond = 1056/3600; //0.2933333333;

var colorArray = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000']
var mapN
var Crafts = []
var CraftData = []
var polylines = []
var jData
var geoJson;

let maxTimeRange = [0,0]
let clickedRange = [0,1920]
let rangeDollars = 0

let craftLines = [] // paths of flight

function preload(){
	jData = loadJSON("collapsedData_mar.json")
	geoJson = loadJSON("la-county-neighborhoods-v6.geojson")
}

function initTimeRange(){ // find the time range from date file
		for (var i = 0; i < dateList.length; i ++) {
		if(i == 0){
			maxTimeRange[0] = int(dateList[i])
		}
		if(  int(dateList[i]) > maxTimeRange[1]){
			 maxTimeRange[1]=int(dateList[i]) 
		}else if(int(dateList[i]) < maxTimeRange[0]){
			 maxTimeRange[0]=int(dateList[i]) 
		}
		// print(jData[i].key)
	}
}

function getCrafts(){// find all crafts from loaded data
	for(let startT = maxTimeRange[0]; startT< maxTimeRange[1]; startT++){
		if(jData[startT]!=null){

			let timeFrame = jData[startT];
			// console.log(timeFrame)
			for(pFound = 0 ; pFound < timeFrame.length; pFound++){
				let craftID = timeFrame[pFound][0]
				// console.log(craftID)
				if(!Crafts.includes(craftID)){
					Crafts.push(craftID)
				}
			}
		}
	}
}




function mousePressed(){
if(mouseY<0){
	return
}

	clickedRange[0] = mouseX
	for(p in polylines){
		polylines[p].remove()
	}

	timelinedraw()

}

function mouseReleased(){

	if(mouseY<0){
	return
}


	let tMin= round(map(min(clickedRange[0], clickedRange[1]), 0, width, maxTimeRange[0], maxTimeRange[1]))
	let tMax= round(map(max(clickedRange[0], clickedRange[1]), 0, width, maxTimeRange[0], maxTimeRange[1]))
	buildCraftPaths(tMin, tMax)

timelinedraw();
}


function mouseDragged(){

	if(mouseY<0){
	return
}

		for(p in polylines){
		polylines[p].remove()
	}
	let tMin= round(map(min(clickedRange[0], clickedRange[1]), 0, width, maxTimeRange[0], maxTimeRange[1]))
	let tMax= round(map(max(clickedRange[0], clickedRange[1]), 0, width, maxTimeRange[0], maxTimeRange[1]))
	buildCraftPaths(tMin, tMax)

	timelinedraw();
}

function draw(){

	// timelinedraw();

}

function timelinedraw(){
	background(30)
	let cBlockHeight = height/(Crafts.length+1)
	if(mouseIsPressed && mouseY>0){
	clickedRange[1] = mouseX
	}
		for(let startT = maxTimeRange[0]; startT< maxTimeRange[1]; startT++){
		if(jData[startT]!=null){
			let xPos = map(startT, maxTimeRange[0], maxTimeRange[1], 0, width)
			
			let timeFrame = jData[startT];
				// console.log(timeFrame)
				for(pFound = 0 ; pFound < timeFrame.length; pFound++){
					let craftID = timeFrame[pFound][0]
					let cindex = Crafts.indexOf(craftID)
					
					rectMode(CORNER)
					noStroke()
					fill(colorArray[cindex])
					rect(xPos,cindex*cBlockHeight,10,cBlockHeight)
				}

		}
	}


	noStroke()
		fill(0,100,200,100)
		rectMode(CORNERS)
	rect(clickedRange[0], 0, clickedRange[1],height)


	let tMin= round(map(min(clickedRange[0], clickedRange[1]), 0, width, maxTimeRange[0], maxTimeRange[1]))
	let tMax= round(map(max(clickedRange[0], clickedRange[1]), 0, width, maxTimeRange[0], maxTimeRange[1]))


	fill(255)
	textAlign(LEFT)
	let startYear = str(tMin).substring(0, 4)
	let startMonth = str(tMin).substring(4, 6)
	let startDay = str(tMin).substring(6, 8)
	let startHour = str(tMin).substring(8,10)
	let startMinute = constrain(str(tMin).substring(10, 12),0,60)


	text(startYear, min(clickedRange[0], clickedRange[1]), 10)
	text(startMonth+'/'+startDay, min(clickedRange[0], clickedRange[1]), 20)
	text(startHour+':'+startMinute, min(clickedRange[0], clickedRange[1]), 30)

	let endYear = str(tMax).substring(0, 4)
	let endMonth = str(tMax).substring(4, 6)
	let endDay = str(tMax).substring(6, 8)
	let endHour = str(tMax).substring(8,10)
	let endMinute = constrain(str(tMax).substring(10, 12),0,60)


	textAlign(RIGHT)
	text(endYear, max(clickedRange[0], clickedRange[1]), height-20)
	text(endMonth+'/'+endDay, max(clickedRange[0], clickedRange[1]), height-10)
	text(endHour+':'+endMinute, max(clickedRange[0], clickedRange[1]), height)

}



function buildCraftPaths(timeMin, timeMax){
	// console.log(timeMin + ' , ' + timeMax)
rangeDollars = 0


		for(let sCid = 0; sCid < Crafts.length; sCid++){ // one craft at a time
		let craftTimeUpSeconds=0;
		craftLines[sCid] = [] // make empty array for this craft
		let craftToFind = Crafts[sCid] // pick the craft id to search for

		let lastTime= 0 // a previous frame

		for(let startT = timeMin; startT< timeMax; startT++){
			// go thru all times
			if(jData[startT]!=null){
				let timeFrame = jData[startT];
				// console.log(timeFrame)
				for(pFound = 0 ; pFound < timeFrame.length; pFound++){
					let craftID = timeFrame[pFound][0]
					let craftData = timeFrame[pFound]
					// console.log(craftData)
					let timeHere = craftData[4]

					if(craftToFind == craftID){ // found craft we wanted
						let lon = float(craftData[5])
						let lat = float(craftData[6])
						// craft found at this datetime
						if(!isNaN(lat)){
							craftLines[sCid].push([lat,lon])
						}
						if(lastTime!=0){
							let timeDiff = timeHere-lastTime

							// console.log(timeHere)
							// console.log(timeDiff)
							if(timeDiff<500){
								craftTimeUpSeconds+=timeDiff
							}
						}
						lastTime = timeHere
					}
				}
				
			}
			
		}


rangeDollars+=craftTimeUpSeconds*dollarsASecond


	}
	// console.log(craftLines)
	// console.log(rangeDollars)

select("#dollarCost").html("$"+rangeDollars.toFixed(2))

	for(let sCid = 0; sCid < Crafts.length; sCid++){
		// craftLines[sCid] = []
		if( craftLines[sCid].length > 0){
			polylines.push( L.polyline(craftLines[sCid], {color: colorArray[sCid]}).bindPopup(Crafts[sCid]).addTo(mapN) );
		}
	}
}




function setup(){

	frameRate(10)
	createCanvas(windowWidth, 150)

infobutton= createButton("Info")
infobutton.position(100,10)
infobutton.style('z-index', 2001)
infobutton.style('font-size','x-large;')

  infobutton.mousePressed(function(){
  	select("#info").toggleClass('hidden')
  });

	clickedRange = [0,width]
		 mapN = L.map('mapView').setView([34.0406929,-118.3120699], 12);

	background(0)
	dateList = Object.keys(jData)
	initTimeRange()
	print(maxTimeRange)
getCrafts()
	print(Crafts)
buildCraftPaths(maxTimeRange[0], maxTimeRange[1])

// console.log()

	L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
	    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	    maxZoom: 18,
	    id: 'mapbox/dark-v10',
	    tileSize: 512,
	    zoomOffset: -1,
	    accessToken: 'pk.eyJ1Ijoibm90ZXZlciIsImEiOiJjbDBrb2pyZ3Mwb2trM2NzNXhwbnFnZDl2In0.vjLxEAKXgw5BeN8V5VlTLg'
	}).addTo(mapN);


	// var neighborhoods = new L.geoJSON(geoJson, {

	// }).addTo(mapN)

// showCraftPaths()
timelinedraw();
}



// var polyline = L.polyline(craftLines[2], {color: 'red'}).addTo(mapN);

// zoom the map to the polyline
// mapN.fitBounds(polyline.getBounds());




// console.log("WORKING")


