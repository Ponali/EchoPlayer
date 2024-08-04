let fs = require("fs");
var UglifyJS = require("uglify-js");
let args=process.argv.slice(2);

function parameterNext(fullStr,shortStr,fallback){
    if(args.includes(shortStr)) return args[args.indexOf(shortStr)+1];
    if(args.includes(fullStr)) return args[args.indexOf(fullStr)+1];
    return fallback;
}
function getInputParameter(){
    return parameterNext("--input","-i");
};
function getOutputParameter(){
    return parameterNext("--output","-o","output.js");
};
function getRunParameter(){
    return parameterNext("--run","-r");
}

if(!getInputParameter()){
    console.log("Missing input file.");
    console.log("Usage: node index.js [--run, -r [node / browser]] [--minify, -m] [--input, -i] inputfile [--output, -o] outputfile");
    process.exit();
};

console.log("getting file contents...");
let contents = fs.readFileSync(getInputParameter());
let apiCode = fs.readFileSync("api.js");

console.log("generating large code...");
let finalLarge=`(_=()=>{ ${apiCode}\n${contents} })()`;

let mincode;
let minify = args.includes("-m")||args.includes("--minify");
if(minify){
    console.log("minifying...");
    let minified = UglifyJS.minify(finalLarge,{toplevel:true,compress:{passes:5}});
    if(minified.error) throw minified.error;
    mincode = minified.code;
} else {
    mincode = finalLarge;
}

console.log("escaping explicit characters...");
let final = mincode.replace(new RegExp("[\x00-\x1f]","g"),((a)=>{
    if(a=="\n"&&(!minify)) return "\n";
    return "\\x"+a.charCodeAt().toString(16).padStart(2,"0");
}));

console.log("writing...");
fs.writeFileSync(getOutputParameter(),final);

console.log("done!");

if(args.includes("-r")||args.includes("--run")){
    let rp = getRunParameter();
    if(rp=="browser"){
        fs.writeFileSync("temp.html",`<script src="${getOutputParameter()}" defer></script>`)
        import("open").then(a=>{
            let open=a.default;
            open("temp.html")
        })
        setTimeout(()=>{
            fs.unlinkSync("temp.html")
        },1000)
    } else {
        (new Function("require",final))(require);
    }
}