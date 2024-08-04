const width=32;
const height=32;
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
function clearMatrix(){
    drawRect(0,0,width,height,[0,0,0])
};
function clockHand(time,length){
    time+=0.5;
    let x=(Math.sin(-time*Math.PI*2)*length/2+.5)*32;
    let y=(Math.cos(time*Math.PI*2)*length/2+.5)*32;
    drawLine(16-(x>=16),16-(y>=16),x,y,[1,1,1]);
};
function drawCircleOutline(x, y, r, color) {
    let n=Math.ceil(r*Math.PI*2);
    for (let i = 0; i < n; i++) {
        const angle = 2 * Math.PI * i / n; // Calculate angle for current pixel
        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r;
        
        // Round pixel coordinates to nearest integer
        const intPx = Math.round(px);
        const intPy = Math.round(py);
        
        // Check if pixel is within circle's bounds
        try{
            EchoPlayer.colorMatrix.getPixel(intPx,intPy).setRGB(color[0],color[1],color[2]); // Mark pixel as part of outline
        } catch {
            // nothing
        }
    }
}

EchoPlayer.init(width,height);
EchoPlayer.draw=(()=>{
    clearMatrix();
    let time=new Date();
    clockHand(time.getSeconds()/60,0.9);
    clockHand(time.getMinutes()/60,0.75);
    clockHand(time.getHours()/12,0.6);
    drawCircleOutline(15.5,15.5,15.5,[1,1,1]);
});
EchoPlayer.startLoop();