class Color3{
    constructor(r,g,b){
        if(typeof(g)=="undefined"&&typeof(b)=="undefined"){
            if(typeof(r)=="undefined"){
                this.setFull(0);
            };
            this.setFull(r);
        } else {
            this.setRGB(r,g,b);
        }
    }
    setRGB(r,g,b){
        [this.r,this.g,this.b]=[r,g,b].map(a=>a&1);
        this._updateFull();
    }
    setRGBFloat(r,g,b){
        [r,g,b]=[r,g,b].map(a=>Math.round(Math.min(Math.max(a,0),1)));
        this.setRGB(r,g,b)
    }
    setFull(fullInt){
        this.full=fullInt&0b111;
        this._updateRGB()
    }
    _updateFull(){
        this.full = (this.r << 2)|(this.g << 1)|this.b;
    }
    _updateRGB(){
        this.r = this.full >> 2;
        this.g = (this.full >> 1) & 1;
        this.b = this.full & 1;
    }
}
class Color24{
    constructor(r,g,b){
        if(typeof(g)=="undefined"&&typeof(b)=="undefined"){
            if(typeof(r)=="undefined"){
                this.setFull(0);
            };
            this.setFull(r);
        } else {
            this.setRGB(r,g,b);
        }
    }
    setRGB(r,g,b){
        [this.r,this.g,this.b]=[r,g,b].map(a=>a&255);
        this._updateFull();
    }
    setRGBFloat(r,g,b){
        [r,g,b]=[r,g,b].map(a=>Math.round(Math.min(Math.max(a*255,0),255)));
        this.setRGB(r,g,b)
    }
    setFull(fullInt){
        this.full=fullInt&0xffffff;
        this._updateRGB()
    }
    _updateFull(){
        this.full = (this.r << 16)|(this.g << 8)|this.b;
    }
    _updateRGB(){
        this.r = this.full >> 16;
        this.g = (this.full >> 8) & 255;
        this.b = this.full & 255;
    }
}
const EchoPlayer = (()=>{
    const usingBrowser=(typeof(process)=="undefined")&&(typeof(document)!="undefined");
    let thisCode=`(_=${_})()`.replace(new RegExp("\n","g"),"").replace(new RegExp("\t","g"),"");
    if(usingBrowser) thisCode=`<script>${thisCode}</script>`;
    const CSI="\x1b[";
    let initiated=false;
    let forceExit=false;
    let DOMElement;
    let matrixWidth = 0;
    let matrixHeight = 0;
    let charSize;
    function getBrowserCharSize(elemParent){
        let testElem=document.createElement("span");
        testElem.innerText="W";
        testElem.style="font-family:monospace;";
        elemParent.appendChild(testElem);
        let size=testElem.getBoundingClientRect();
        testElem.remove();
        return size;
    }
    if(!usingBrowser){
        var readline = require('readline');
        readline.emitKeypressEvents(process.stdin);
        if (process.stdin.isTTY) process.stdin.setRawMode(true);
        process.stdin.on('keypress', (chunk, key) => {
            if (key && key.sequence == "\x03"){
                process.stdout.write(CSI+"2J"+CSI+"1;1f");
                process.exit();
            };
        });
    }
    const functionLoop = (()=>{
        if(!initiated) throw new Error("Please initialise before using the startLoop function.")
        if(forceExit) return;
        engine.draw();
        render();
        setTimeout(functionLoop,1000/engine.framerate);
    });
    let engine = {
        init,
        listenForKeypress,
        startLoop:functionLoop,
        exit,
        draw: (()=>{}),
        framerate: 60,
        colorMatrix:[],
        codeScroll:0,
        horizontalCenter:1,
        verticalCenter:1,
        loopCode:false,
        integerScalingMaximum:2,
    };
    engine.colorMatrix.getPixel=(x,y)=>{
        [x,y]=[x,y].map(a=>Math.round(a));
        if(x>=0&&y>=0&&x<matrixWidth&&y<matrixHeight){
            return engine.colorMatrix[x+y*matrixWidth];
        } else {
            return undefined;
        }
    };
    function exit(showLastFrame){
        if(usingBrowser){
            forceExit=true;
            if(!showLastFrame) DOMElement.remove();
        } else {
            if(!showLastFrame) process.stdout.write(CSI+"2J"+CSI+"1;1f");
            process.exit();
        }
    }
    function init(width,height,use24bitColor){
        matrixWidth = width;
        matrixHeight = height;
        for(let i=0;i<width*height;i++){
            let fillColor;
            if(use24bitColor){
                fillColor=new Color24();
            } else {
                fillColor=new Color3();
            };
            engine.colorMatrix.push(fillColor);
        };
        if(usingBrowser){
            DOMElement=document.createElement("div");
            DOMElement.style="position:absolute;top:0px;left:0px;width:100%;height:100%;font-family:monospace;white-space:pre;background:#000;"
            document.body.appendChild(DOMElement);
            charSize=getBrowserCharSize(DOMElement);
        };
        initiated=true;
    };
    function getBrowserSequence(key){
        switch(key.key){
            case "Enter":return "\r";
            case "Space": return " ";
            case "ArrowLeft":  return "\x1B[D"
            case "ArrowUp":    return "\x1B[A"
            case "ArrowRight": return "\x1B[C"
            case "ArrowDown":  return "\x1B[B"
        }
        if(key.ctrl){
            return String.fromCharCode(key.name.charCodeAt()-96);
        } else {
            let name = key.key;
            if(key.shift){
                name=name.toString().toUpperCase();
            } else {
                name=name.toString().toLowerCase();
            };
            return name;
        }
    };
    function getBrowserName(key){
        switch(key.code){
            case "Enter":return "return";
            case "Space":return "space";
            case "ArrowLeft":  return "left";
            case "ArrowUp":    return "up";
            case "ArrowRight": return "right";
            case "ArrowDown":  return "down";
            default: return key.key.toLowerCase();
        }
    }
    function listenForKeypress(callback){
        if(usingBrowser){
            addEventListener("keydown",e=>{
                callback({sequence:getBrowserSequence(e),name:getBrowserName(e),ctrl:e.ctrlKey,meta:e.metaKey,shift:e.shiftKey})
            })
        } else {
            process.stdin.on('keypress', (chunk, key) => {
                callback(key);
            });
        }
    }
    function colorLightness(color){
        let lightness = color.r + color.g + color.b;
        if(color instanceof Color24){
            lightness/=255;
        };
        lightness/=3;
        return lightness;
    };
    function renderChar(x,y,width,height){
        let codeHeight=Math.ceil(thisCode.length/width);
        let charIdx=(x+(y+Math.round(engine.codeScroll*(codeHeight-height)))*width);
        if(engine.loopCode) charIdx%=(width*codeHeight);
        let codeChar=thisCode[charIdx];
        if(!codeChar) codeChar=" ";
        let colorZoom=Math.min(Math.max(1,Math.floor(Math.min(width/matrixWidth,height/matrixHeight))),engine.integerScalingMaximum);
        let colorX = Math.round((x-(width-matrixWidth*colorZoom+colorZoom-1)/2*engine.horizontalCenter)/colorZoom);
        let colorY = Math.round((y-(height-matrixHeight*colorZoom+colorZoom-1)/2*engine.verticalCenter)/colorZoom);
        let color;
        if(colorX>=0&&colorY>=0&&colorX<matrixWidth&&colorY<matrixHeight){
            color = engine.colorMatrix[colorX+colorY*matrixWidth];
        };
        return [codeChar,color];
    }
    function render(){
        if(usingBrowser){
            renderBrowser();
        } else {
            renderNode();
        }
    };
    function getColorHex(color){
        let r,g,b;
        [r,g,b]=[color.r,color.g,color.b];
        if(color instanceof Color3){
            return "#"+[r,g,b].map(a=>"0f"[a]).join("");
        } else {
            return "#"+[r,g,b].map(a=>a.toString(16).padStart(2,"0")).join("");
        }
    };
    let renderWidthBef=0;
    let renderHeightBef=0;
    let renderScrollBef=0;
    function getColorStyling(color){
        let styling="";
        if(color){
            styling="background:"+getColorHex(color)+";";
            if(colorLightness(color)>0.5){
                styling+="color:#000;"
            } else {
                styling+="color:#fff;"
            }
        } else {
            styling="background:#000;color:#888;"
        };
        return styling;
    }
    function browserChangeSize(width,height){
        let out = [];
        for(let y=0;y<height;y++){
            let lineElem=document.createElement("div");
            lineElem.style="margin:0;padding:0;";
            for(let x=0;x<width;x++){
                let charElem=document.createElement("span");
                let data = renderChar(x,y,width,height);
                let codeChar = data[0];
                let color = data[1];
                let styling=getColorStyling(color);
                charElem.innerText=codeChar;
                charElem.style=styling;
                lineElem.appendChild(charElem);
            }
            out.push(lineElem);
        };
        DOMElement.innerHTML="";
        for(id in out){
            DOMElement.appendChild(out[id]);
        }
    };
    function areStylingsSame(str,elemB){
        let elemA=document.createElement("span");
        elemA.style=str;
        let styleA=elemA.style, styleB=elemB.style;
        if(styleA.color==styleB.color && styleA.backgroundColor==styleB.backgroundColor){
            return true;
        } else {
            return false;
        }
    }
    function renderBrowser(){
        let width = Math.floor(innerWidth/charSize.width);
        let height = Math.floor(innerHeight/charSize.height);
        if(width!=renderWidthBef||height!=renderHeightBef||engine.codeScroll!=renderScrollBef){
            browserChangeSize(width,height);
        } else {
            for(let y=0;y<height;y++){
                for(let x=0;x<width;x++){
                    let data = renderChar(x,y,width,height);
                    let color = data[1];
                    let elemBef = DOMElement.children[y].children[x];
                    let styling=getColorStyling(color);
                    if(!areStylingsSame(styling,elemBef)){
                        elemBef.style=styling;
                    }
                }
            };
        };
        renderWidthBef=width;
        renderHeightBef=height;
        renderScrollBef=engine.codeScroll;
    }
    function renderNode(){
        let width = process.stdout.columns;
        let height = process.stdout.rows;
        let out = "";
        for(let y=0;y<height;y++){
            for(let x=0;x<width;x++){
                let data = renderChar(x,y,width,height);
                let codeChar = data[0];
                let color = data[1];
                if(color){
                    if(color instanceof Color3){
                        if(color.full==0){
                            out+=CSI+"49m";
                        } else {
                            out+=CSI+(40+(color.r+(color.g*2)+(color.b*4)))+"m";
                        }
                    } else if(color instanceof Color24){
                        out+=`${CSI}48;2;${color.r};${color.g};${color.b}m`;
                    } else {
                        throw new Error("Cannot render: one of the colors in the color matrix is not an instance of Color3 or Color24.");
                    };
                    if(colorLightness(color)>0.5){
                        out+=CSI+"30m";
                    } else {
                        out+=CSI+"39m";
                    }
                } else {
                    out+=CSI+"49m"+CSI+"38;2;127;127;127m";
                }
                out+=codeChar;
            }
        };
        process.stdout.write(CSI+"1;1f"+out);
    }

    return engine;
})();