//设置常量
const updateTime = 20;
const SRshort = Math.min(screen.width,screen.height);//屏幕短边的实际长度 SRshort:screen_real_short
const nS = screen.width / screen.height;//屏幕宽高比
//颜色
const colors = [[120,0,200],[0, 100, 255]];
const c1 = colors[0];const c2 = colors[1];//简写
const cv = [[0,0,0],[0,0,0]];//颜色向量
const ccm = 0.1;//Color Change Max
for(let i=0;i<colors.length;i++){for(let j=0;j<3;j++){cv[i][j]= (Math.random()-0.5)*ccm;}}
//动画参数
const areaW_scale = 0.04;//单个区域在全屏状态下所占屏幕短距的比例
const areaRW_full = SRshort * areaW_scale;//单个区域在全屏状态下的实际宽度.RW:real width

const w = Math.ceil(screen.width / areaRW_full);
const h = Math.ceil(screen.height / areaRW_full);
const short = Math.min(w,h);
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

//真正重要的代码从这里开始
//动画核心——质量点
const massPoints = [];
    //第一类质量点:质量在一定范围内波动,平滑移动.碰到边缘会反弹
const massPoints_1 = [];//质量点数组
const mP1_mass = [short/7,short/2.5];//质量范围
const mP1_speed = [short/10,short/5];//速度范围(单位距离/1000ms)
const mP1_square_max=1.6;//允许占用的最大面积
var mP1_square_canBeUsed = w * h * mP1_square_max;
    //创建P1
function createMassPoint_1(){
    const mass = Math.random() * (mP1_mass[1] - mP1_mass[0]) + mP1_mass[0];
    const speed = Math.random() * (mP1_speed[1] - mP1_speed[0]) + mP1_speed[0];
    const x = Math.random() * w;
    const y = Math.random() * h;
    const angle = Math.random() * 2 * Math.PI;
    const vx = speed * Math.cos(angle);
    const vy = speed * Math.sin(angle);

    const point = [[x,y],[vx,vy],mass];
    massPoints_1.push(point);
    massPoints.push(point);
    mP1_square_canBeUsed -= Math.PI*mass*mass;
}
while(mP1_square_canBeUsed > 0){
    createMassPoint_1();
}
    //移动P1
function moveMassPoints_1(){
    for(let i = 0;i < massPoints_1.length;i++){
        const point = massPoints_1[i];
        point[0][0] +=point[1][0]/1000*updateTime;
        point[0][1] +=point[1][1]/1000*updateTime;
        //碰到边缘反弹
        if(point[0][0] < 0){point[1][0] = Math.abs(point[1][0]);}
        if(point[0][0] > w){point[1][0] = -Math.abs(point[1][0]);}
        if(point[0][1]< 0){point[1][1] = Math.abs(point[1][1]);}
        if(point[0][1] > h){point[1][1] = -Math.abs(point[1][1]);}
        //质量交换
        for(let j = i+1;j < massPoints_1.length;j++){
            const point2 = massPoints_1[j];
            const dx = point[0][0] - point2[0][0];
            const dy = point[0][1] - point2[0][1];
            const d = Math.sqrt(dx*dx + dy*dy);

            if(d < (point[2] + point2[2])*0.01){
                const max_exchange = (point[2] + point2[2]) *0.001;
                const p1Add = max_exchange * Math.random() - max_exchange/2;
                const p2Add = max_exchange - p1Add;
                point[2] += p1Add;
                point2[2] += p2Add;
            }
        }
    }
}

//变换背景颜色
const Dt = 0;//darkest
const Lt = 255;//lightest
function moveBGColor(){
    for(let i=0;i<colors.length;i++){
        for(let j=0;j<3;j++){
            colors[i][j] += cv[i][j]/1000*updateTime;
            if(colors[i][j] > Lt){colors[i][j] = Lt;cv[i][j] = -Math.abs(Math.random()*ccm/2);}
            if(colors[i][j] < Dt){colors[i][j] = Dt;cv[i][j] = Math.abs(Math.random()*ccm/2);}
        }
    }
}
//更新内存中的数据
function computeAll(){
    moveBGColor();
    moveMassPoints_1();
}
//空间_数据
const min_r = 0.3;
const max_r = 0.8;
//绘制
function drawAll(){
    buffer.clearRect(0,0,bufferEl.width,bufferEl.height);

    for(let x = 0;x < w;x++){
        for(let y = 0;y < h;y++){
            var r=0;
            //通过与质量点的距离决定大小
            for(let i = 0;i < massPoints.length;i++){
                const point = massPoints[i];
                const dx = point[0][0] -x;
                const dy = point[0][1] -y;
                const d = Math.sqrt(dx*dx + dy*dy);
                if(d < point[2]){
                    let n = 1-d/point[2];
                    if(n>r){r = n;}
                }
            }
            r = (max_r-min_r)*r+min_r;

            const areaRcenter = [(x+0.5)*areaRW,(y+0.5)*areaRW];//area Real center
            
            const Rr = r*areaRW/2;//Rr: real radius

            buffer.beginPath();
            buffer.arc(areaRcenter[0],areaRcenter[1],Rr,0,2*Math.PI);
            buffer.closePath();
            //渐变
            const gradient = buffer.createLinearGradient(0,0,bufferEl.width,bufferEl.height);
            gradient.addColorStop(0,`rgb(${c1[0]},${c1[1]},${c1[2]})`);
            gradient.addColorStop(1,`rgb(${c2[0]},${c2[1]},${c2[2]})`);
            buffer.fillStyle = gradient;

            buffer.fill();
        }
    }
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
var animationInterval = setInterval(mainLoop,updateTime);
//全屏
function fullScreen(){
if(document.fullscreenElement)
{document.exitFullscreen();}
else{cvsEl.requestFullscreen();}}
cvsEl.addEventListener("click",fullScreen);

//当用户离开页面时清除interval以减少算力浪费
document.addEventListener('visibilitychange',() => {
    if(document.visibilityState === 'hidden'){
        clearInterval(animationInterval);
        animationInterval = null;
    }else if(document.visibilityState === 'visible'){
        if(!animationInterval){
            animationInterval = setInterval(mainLoop,updateTime);
        }
    }
});