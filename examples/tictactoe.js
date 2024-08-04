let width = 4*7-1 + 6;
let height = 4*7-1;
const icons=[
    [0b10001
    ,0b01010
    ,0b00100
    ,0b01010
    ,0b10001],
    
    [0b01110
    ,0b10001
    ,0b10001
    ,0b10001
    ,0b01110],
];
function drawRect(x,y,w,h,color){
    for(let j=y;j<y+h;j++){
        for(let i=x;i<x+w;i++){
            try{
                EchoPlayer.colorMatrix.getPixel(i,j).setRGB(color[0],color[1],color[2]);
            } catch {
                /* lets just do nothing */
            }
        }
    }
}
function drawLine(x1,y1,x2,y2,color){
    x1 |= 0; y1 |= 0; x2 |= 0; y2 |= 0; //no float values!
    var dx = x2 - x1, dy = y2 - y1; //find delta x,y
    var sx = (dx > 0) - (dx < 0), sy = (dy > 0) - (dy < 0); //sign of delta values +1 or 0 or -1
    dx *= sx; dy *= sy; //convert dx,dy to abs values use the multiple with sign

    EchoPlayer.colorMatrix.getPixel(x1,y1).setRGB(color[0],color[1],color[2]); //start point draw always
    if( !(dx || dy) )return;    //if no any delta dx or dy stop
    var d = 0, x = x1, y = y1, v;
    if(dy < dx) //if abs delta Y less then abs delta X - iterate by X += sign of delta X (+1 or -1)
      for(v = 0 | (dy << 15) / dx * sy; x ^ x2; x += sx, d &= 32767) //v is Tan() = y/x scaled by * 32768 (sub grid step) 
        EchoPlayer.colorMatrix.getPixel(x, y += (d += v) >> 15).setRGB(color[0],color[1],color[2]); //d accumulate += grid step, so Y take +1px for each 32768 steps.
    else //else if abs delta X less then abs delta Y - iterate by Y += sign of delta Y (+1 or -1)
      for(v = 0 | (dx << 15) / dy * sx; y ^ y2; y += sy, d &= 32767) //v is Ctn() = x/y scaled by * 32768 (sub grid step)
        EchoPlayer.colorMatrix.getPixel(x += (d += v) >> 15, y).setRGB(color[0],color[1],color[2]); // d &= 32767 is accumulator partial emptyer
};
function clearMatrix(){
    drawRect(0,0,width,height,[0,0,0])
}
function drawGrid(){
    for(let i=0;i<4;i++){
        drawLine(1+i*8,1,1+i*8,26,[1,1,1])
    };
    for(let i=0;i<4;i++){
        drawLine(1,1+i*8,26,1+i*8,[1,1,1])
    };
};
function placeCursor(){
    let gridIdx=playerCursor[0]+playerCursor[1]*3;
    if(gridContents[gridIdx]==0){
        gridContents[gridIdx]=player+1;
        playerCursor=[1,1];
        player=(player+1)%2;
    }
};
function drawIcon(iconX,iconY,iconIdx){
    let icon = icons[iconIdx];
    for(let y=0;y<icon.length;y++){
        let line=icon[y].toString(2).padStart(5,"0");
        for(let x=0;x<5;x++){
            if(line[x]=="1")
                EchoPlayer.colorMatrix.getPixel(x+iconX,y+iconY).setFull(7);
        }
    }
};
function isArrayUniform(arr) {
    const referenceValue = arr[0];
    return arr.every(element => (element === referenceValue && element != 0));
}
function gameOverCheck(){
    for(let i=0;i<3;i++){
        if(isArrayUniform(gridContents.slice(i*3,i*3+3))) return [i*3,i*3+2];
    }
    for(let i=0;i<3;i++){
        if(isArrayUniform([gridContents[i],gridContents[i+3],gridContents[i+6]])) return [i,i+6];
    }
    if(isArrayUniform([gridContents[0],gridContents[4],gridContents[8]])) return [0,8];
    if(isArrayUniform([gridContents[2],gridContents[4],gridContents[6]])) return [2,6];
    if(!gridContents.includes(0)) return "tie" // if everything's taken, it's a tie.
};
function getXYPositionFromIndex(idx){
    return [idx%3,Math.floor(idx/3)];
}
let playerCursor=[1,1];
let gridContents=Array(9).fill(0);
let player=+(Math.random()>0.5);
EchoPlayer.init(width,height);
EchoPlayer.listenForKeypress(key=>{
    if(key.sequence=="\x03") process.exit();
    switch(key.name){
        case "left": playerCursor[0]-=1;break;
        case "right":playerCursor[0]+=1;break;
        case "up":   playerCursor[1]-=1;break;
        case "down": playerCursor[1]+=1;break;
        case "return":
        case "space":
            placeCursor();break;
    };
    playerCursor[0]=Math.min(Math.max(playerCursor[0],0),2);
    playerCursor[1]=Math.min(Math.max(playerCursor[1],0),2);
});
let gameOverDisplayed=false;
EchoPlayer.draw=(()=>{
    if(gameOverDisplayed) EchoPlayer.exit(true);
    clearMatrix();
    drawGrid();
    drawRect(2+playerCursor[0]*8,2+playerCursor[1]*8,7,7,[0,0,1]);
    for(let i=0;i<9;i++){
        let cell=gridContents[i];
        let x=i%3;
        let y=Math.floor(i/3);
        if(cell!=0){
            drawIcon(3+x*8,3+y*8,cell-1);
        }
    };
    drawIcon(27,1,player);
    let gmCheck=gameOverCheck();
    if(gmCheck){
        if(gmCheck!="tie"){
            let pointA = getXYPositionFromIndex(gmCheck[0]);
            let pointB = getXYPositionFromIndex(gmCheck[1]);
            drawLine(5+pointA[0]*8,5+pointA[1]*8,5+pointB[0]*8,5+pointB[1]*8,[1,0,0]);
        }
        gameOverDisplayed=true;
    }
});
EchoPlayer.startLoop();