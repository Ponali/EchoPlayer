const sin=Math.sin;
EchoPlayer.init(16,16,true);
EchoPlayer.integerScalingMaximum=1;
EchoPlayer.draw=(()=>{
    let time=Date.now();
    for(let i=0;i<16*16;i++){
        EchoPlayer.colorMatrix[i].setRGBFloat(sin(i/4+time/800)/2+.5,sin(i/1.8+time/600)/2+.5,sin(i/17.7+time/1100)/2+.5);
    }
    EchoPlayer.codeScroll=sin(time/900)/2+.5;
    EchoPlayer.horizontalCenter=sin(time/1000)+1;
    EchoPlayer.verticalCenter=sin(time/700)+1;
})
EchoPlayer.startLoop();