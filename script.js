//设置常量
const updateTime = 20;
const SRshort = Math.min(screen.width,screen.height);//屏幕短边的实际长度 SRshort:screen_real_short
const nS = screen.width / screen.height;//屏幕宽高比
//颜色
const colors = [[120,0,200],[217, 0, 255]];
//动画参数
const areaW_scale = 0.1;//单个区域在全屏状态下所占屏幕短距的比例
const areaRW_full = SRshort * areaW_scale;//单个区域在全屏状态下的实际宽度.RW:real width

const w = Math.ceil(screen.width / areaRW_full);
const h = Math.ceil(screen.height / areaRW_full);
//动画变量
var areaRW;
//更新动画变量
function updateAnimationVariables(){
    //此函数需在setCVS()之后调用
    const cvsRS = Math.min(cvsEl.width,cvsEl.height);//canvas的短边长度 cvs_RS:canvas_real_short
    areaRW = cvsRS * areaW_scale;
}
//cvs
const cvsEl = document.getElementById("mass-space");
const ctx = cvsEl.getContext("2d");
const bufferEl = document.createElement("canvas");
const buffer = bufferEl.getContext("2d");
function setCVS(){
    function setSize(){
        const nW = window.innerWidth/window.innerHeight;
        if(nW > nS){
            cvsEl.width = window.innerWidth;cvsEl.height = cvsEl.width / nS;
            bufferEl.width = cvsEl.width;bufferEl.height = cvsEl.height;
        }else{
            cvsEl.height = window.innerHeight;cvsEl.width = cvsEl.height * nS;
            bufferEl.height = cvsEl.height;bufferEl.width = cvsEl.width;
        }
    }
    function setPos(){
        cvsEl.style.left = (window.innerWidth - cvsEl.width)/2 + "px";
        cvsEl.style.top = (window.innerHeight - cvsEl.height)/2 + "px";
    }
    setSize();
    setPos();
}
function setSomethingAboutSize(){
    setCVS();
    updateAnimationVariables();
}
setSomethingAboutSize();

//更新内存中的数据
function computeAll(){}
//绘制
function drawAll(){
    buffer.clearRect(0,0,bufferEl.width,bufferEl.height);
}

//渲染一帧
function renderFrame(){
    drawAll();
    ctx.clearRect(0,0,cvsEl.width,cvsEl.height);
    ctx.drawImage(bufferEl,0,0,cvsEl.width,cvsEl.height);
}
//主循环
function mainLoop(){
    computeAll();
    renderFrame();
}
window.addEventListener("resize",()=>{
    setSomethingAboutSize();
    renderFrame();
});
setInterval(mainLoop,updateTime);