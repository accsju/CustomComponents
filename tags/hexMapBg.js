class HexMapBg extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }
    autoPlay = "on";
    mapState = null;
    connectedCallback() {
        const autoPlay = this.getAttribute("autoPlay") ?? this.autoPlay;
        this._render();
        this._createHexMap();
        if (autoPlay==="on") {
            this._scatterHex();
        }                
        this._resize();
    }
    _render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                }
                #root {
                    position: relative;
                    width: 100%;
                }
                .background {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: #0D1425;
                    z-index: 1;    
                }
                .background::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 50%;
                    height: 50%;
                    transform: translate(-50%, -50%);
                    background: orange;
                    border-radius: 50%;
                    filter: blur(110px);   
                    opacity: .3;               
                }
                path {
                    transition: fill 0.6s ease, opacity 0.6s ease;
                }
                .content {
                    position: relative;
                    z-index: 2; 
                }
            </style>
            <div id="root">
                <div class="background">
                    <svg id="hexmap">
                    </svg>
                </div>
                <div class="content">
                    <slot name="content"></slot>       
                </div>
            </div>          
        `
    }
    _resize() {
        window.onresize = () => {
            this._createHexMap();
            this._scatterHex();
        }
    }
    _createHexMap() {
        const rect = this.shadowRoot.querySelector("#root").getBoundingClientRect();
        const background = this.shadowRoot.querySelector(".background");
        const svg = this.shadowRoot.getElementById("hexmap");

        const width = Number(rect.width);
        const height = Number(rect.height);        
        const a = 30;

        const w = Math.floor(width / (a*(3/2))) + 1;
        const h = Math.floor(height / (a*2)) + 1;

        background.style.height = `${height}px`;
        svg.innerHTML = "";                     
        svg.setAttribute("width", `${width}`);                          
        svg.setAttribute("height", `${height}`);
        let initX = 0;
        let initY = 0;

        const mapState = [];
        for (let i=1;i<h+1;i++) {
            for (let j=1;j<w+1;j++) {
                const hex = {
                    w: j-1,
                    h: i-1,
                    d: `M${initX+a/2} ${initY} L${initX} ${initY+Math.sqrt(3)*a/2} L${initX+a/2} ${initY+Math.sqrt(3)*a} L${initX+3*a/2} ${initY+Math.sqrt(3)*a} L${initX+2*a} ${initY+Math.sqrt(3)*a/2} L${initX+3*a/2} ${initY} Z`,
                }
                mapState.push(hex);
                if (j%2) {
                    initX += 3*a/2;
                    initY += Math.sqrt(3)*a/2;
                    continue;
                }
                initX += 3*a/2;
                initY -= Math.sqrt(3)*a/2;
            }
            initX = 0;
            initY = 2*i*Math.sqrt(3)*a/2;
        }
        this.mapState = mapState;
        for (let i=0;i<w*h;i++) {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", mapState[i].d);
            path.setAttribute("stroke", "orange");
            path.setAttribute("stroke-width", "1");
            path.setAttribute("opacity", .1)
            path.setAttribute("fill", "transparent");
            svg.appendChild(path);

        }
    }
    _scatterHex() {
        const paths = this.shadowRoot.querySelectorAll("path");
        let t = 0;
        const animate = () => {
            paths.forEach((p, i) => {
                const wave = Math.sin(i * 0.3 + t);
                if (wave > 0.8) {
                    p.setAttribute("fill", "orange");
                } else {
                    p.setAttribute("fill", "transparent");
                }
            });

            t += 0.1;
            requestAnimationFrame(animate);
        };
        animate();
    }
}

customElements.define("hex-map-bg", HexMapBg);

