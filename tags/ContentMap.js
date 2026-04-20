class ContentMap extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }
    list = 5;
    bg = "#0D1425";
    color = "green";
    defaultIndex = 0;
    connectedCallback() {
        this.list = Number(this.getAttribute("list")) ?? this.list;
        this.bg = this.getAttribute("bg") ?? this.bg; 
        this.color = this.getAttribute("color") ?? this.color;
        this.defaultIndex = this.getAttribute("defaultIndex") ?? this.defaultIndex;
        this._render();
    }
    _render() {
        const bg = this.bg; 
        const color = this.color;
        const defaultIndex = this.defaultIndex;
        this.shadowRoot.innerHTML = `
            <style>
                #root {
                    display: grid;
                    grid-template-columns: 100px auto;
                    width: 100%;
                    background: ${bg};
                    color: white;
                    padding: 10px 0;
                }
                .chronology {
                }                
                .titles,
                .line-block {
                    display: grid;
                    grid-template-columns: 30px 1fr;
                    align-items: center;
                    justify-content: start;
                }
                .point {
                    width: 3px;
                    height: 3px;
                    border-radius: 50%;
                    border: 2px solid white;
                    margin-left: auto;
                    margin-right: auto;
                }
                .title-wrap {
                    background: transparents;
                    border-radius: 5px;
                    padding: 5px 10px;
                    text-align: center;         
                    border: 2px solid ${color};          
                    position: relative;
                }  
                .title-wrap.active {
                    background: ${color};
                }
                .point.active {
                    border: 2px solid ${color};                 
                }
                .line-block {
                    width: 100%;
                }
                .line {
                    width: 2px;
                    height: 30px;
                    background: ${color};
                    margin-left: auto;
                    margin-right: auto;
                    position: relative;
                }
                .line::before {
                    content: "";
                    width: 2px;
                    height: 10px;
                    background: ${color};
                    display: block;
                    position: absolute;
                    top: -10px;
                }
                .line::after {
                    content: "";
                    width: 2px;
                    height: 10px;
                    background: ${color};
                    display: block;
                    position: absolute;
                    bottom: -10px;
                }
                .title-line {
                    background: ${color};
                    width: 2px;
                    height: 30px;
                    text-align: center;
                    margin-left: auto;
                    margin-right: auto;
                }
                .contents { 
                    position: relative;
                }
                .content-wrap {
                    position: absolute; 
                    width: 100%;
                    height: 100%;
                    display: none;
                }   
                .content-wrap.active {
                    display: block;
                }          
            </style>
            <div id="root">
            </div>
        `;

        const list = this.list;
        const title = (i, hasLine, defaultIndex) => {
            let line = `
                <div class="line-block">
                    <div class="line">
                    </div>
                </div>
            `
            line = hasLine ? "" : line;
            let isActive = i === defaultIndex ? " active" : "";                  
            let template = `
                <div class="titles">
                    <div class="point${isActive}">
                    </div>
                    <div class="title-wrap${isActive}" data-index="${i}">
                        <slot name="title-${i+1}"></slot>
                    </div>
                </div>    
                ${line}
            `;              
            return template;                                
        }
        const content = (i, defaultIndex) => {
            let isActive = i === defaultIndex ? " active" : "";
            let template = `
                <div class="content-wrap${isActive}">
                    <slot name="content-${i+1}"></slot>
                </div>
            `;
            return template;
        }
        let titleAll = "";
        let contentAll = "";
        for (let i=0;i<list;i++) {
            i<(list-1) ? titleAll += title(i, false, defaultIndex) : titleAll += title(i, true, defaultIndex); 
            contentAll += content(i, defaultIndex);
        }
        let body = `
            <div class="chronology"> 
                ${titleAll}      
            </div>
            <div class="contents">
                ${contentAll}
            </div>
        `;
        const root = this.shadowRoot.getElementById("root");
        root.innerHTML = body;
        const titleWraps = this.shadowRoot.querySelectorAll(".title-wrap");
        titleWraps.forEach((titleWrap) => {
            titleWrap.addEventListener("click", (e) => {
                this._clickTitle(e);
            });
        });
    }
    _clickTitle(e) {
        const titleWraps = this.shadowRoot.querySelectorAll(".title-wrap");
        titleWraps.forEach((titleWrap) => {
            titleWrap.classList.remove("active");
        });
        const points = this.shadowRoot.querySelectorAll(".point");
        points.forEach((point) => {
            point.classList.remove("active");
        });
        const titleWrap = e.currentTarget;
        titleWrap.classList.add("active");
        const index = Number(titleWrap.dataset.index);
        const point = points[index];
        point.classList.add("active");
        const contentWraps = this.shadowRoot.querySelectorAll(".content-wrap");
        contentWraps.forEach((contentWrap) => {
            contentWrap.classList.remove("active");
        });
        const contentWrap = contentWraps[index];
        contentWrap.classList.add("active");
    }
}

customElements.define("content-map", ContentMap);

// <content-map list="3" bg="#0D1425" color="green" defaultIndex="0">
//     <div slot="title-1">
//         <p>2026</p>
//     </div>
//     <div slot="title-2">
//         <p>2025</p>
//     </div>
//     <div slot="title-3">
//         <p>2024</p>
//     </div>
//     <div slot="content-1" style="padding:10px;">
//         <p>dfkal;sasdfasdfadfa</p>
//     </div>
//     <div slot="content-2">
//         <p>dfkal;sdfa</p>
//     </div>
//     <div slot="content-3">
//         <p>dfkalasdaddddddddddddd;sdfa</p>
//     </div>
// </content-map>