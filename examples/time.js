const width=21;
const height=11;
let dayTest = new Date();
const UTCDelay = dayTest.getHours() - dayTest.getUTCHours();
const digits=[
    0b111101101101111,
    0b010110010010111,
    0b111001111100111,
    0b111001111001111,
    0b101101111001001,
    0b111100111001111,
    0b111100111101111,
    0b111001001001001,
    0b111101111101111,
    0b111101111001111
];
const pixel = EchoPlayer.colorMatrix.getPixel;
function drawRect(x,y,w,h,color){
    for(let j=y;j<y+h;j++){
        for(let i=x;i<x+w;i++){
            try{
                pixel(i,j).setRGB(color[0],color[1],color[2]);
            } catch {
                /* lets just do nothing */
            }
        }
    }
}
function clearMatrix(){
    drawRect(0,0,width,height,[0,0,0])
}
function drawDigit(x,y,digit){
    let bin=digits[digit].toString(2).padStart(3*5,"0").match(/.{1,3}/g);
    for(let i=0;i<bin.length;i++){
        let line=bin[i];
        for(let j=0;j<line.length;j++){
            if(line[j]=="1"){
                try{
                    pixel(j+x,i+y).setRGB(1,1,1);
                } catch {
                    /* out of bounds! */
                }
            }
        }
    }
};
function drawNumber(x,y,num){
    for(let i=0;i<num.length;i++){
        drawDigit(x+i*4,y,num[i]);
    }
}
EchoPlayer.init(width,height);
EchoPlayer.draw=(()=>{
    clearMatrix();
    let time=Date.now()/1000 + UTCDelay*60*60;

    drawNumber(0,0,Math.floor((time/60/60)%24).toString().padStart(2,"0"));
    pixel(8,1).setFull(7);
    pixel(8,3).setFull(7);
    drawNumber(10,0,Math.floor((time/60)%60).toString().padStart(2,"0"));

    drawNumber(0,6,Math.floor(time%60).toString().padStart(2,"0"));
    pixel(8,10).setFull(7);
    drawNumber(10,6,Math.floor((time*1000)%1000).toString().padStart(3,"0"));
});
EchoPlayer.startLoop();