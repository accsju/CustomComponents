class GpCarousel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }
    currentIndex = 0;
    isAnimating = false;
    autoPlayTimer = null;
    autoPlayFlag = null
    AUTO_PLAY_INTERVAL = 3000;
    autoPlay = "on";             
    list = 5;
    slideButton = "on"
    controller = "on"
    aspectRatio = "3 / 2";
    border = "none";
    borderRadius = "none";
    background = "white";
    connectedCallback() {
        this.AUTO_PLAY_INTERVAL = Number(this.getAttribute("interval")) ?? this.AUTO_PLAY_INTERVAL
        this.autoPlay = this.getAttribute("autoPlay") ?? this.autoPlay;               
        this.autoPlayFlag = this.autoPlay === "on" ? true : false; 
        this.list = Number(this.getAttribute("list")) ?? this.list;                 
        this.slideButton = this.getAttribute("slideButton") ?? this.slideButton;
        this.controller = this.getAttribute("controller") ?? this.controller;            

        this.aspectRatio = this.getAttribute("aspect-ratio") ?? this.aspectRatio;     
        this.border = this.getAttribute("border") ?? this.border;
        this.borderRadius = this.getAttribute("borderRadius") ?? this.borderRadius;
        this.background = this.getAttribute("background") ?? this.background;

        this._render();
        this._boot();
        this._setPointer();
    }
    disconnectedCallback() {
        this._stopAutoPlay();
    }
    _render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                }
                .carousel {
                    width: 100%;
                    overflow: hidden;
                    position: relative;
                }
                .item-container {
                    display: flex;
                    width: 100%;
                    height: 100%;
                    transition: .3s ease;
                }
                slot {
                    display: block;
                    width: 100%;
                    height: 100%;
                    flex: 0 0 100%;
                }
                ::slotted(*) {
                    width: 100%;
                    height: 100%;
                    flex-shrink: 0;
                    word-break: break-word;
                }
                .prev,
                .next {
                    border: none;
                    outline: none;
                    background: transparent;
                }
                .prev {
                    position: absolute;
                    top: 50%;
                    left: 0;
                    transform: translateY(-50%);
                }
                .next {
                    position: absolute;
                    top: 50%;
                    right: 0;
                    transform: translateY(-50%);
                }
                .controller > div {
                    display: grid;
                    place-items: center;
                }
                .focus-btns button {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: gray;
                    border: none;
                    margin: 1px;
                }     
                .play-btn {
                    display: grid;
                    place-items: center;
                    padding: 5px 0 5px 0;
                }
                .play-btn button {
                    position: relative;
                    width: 31px;
                    height: 31px;
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    background: black;
                }
                .play::before {
                    content: "";
                    position: absolute;
                    top: 16px;
                    left: 17px;
                    transform: translate(-50%, -50%);
                    width: 0;
                    height: 0;
                    border-top: 8px solid transparent;
                    border-bottom: 8px solid transparent;
                    border-left: 15px solid white;
                }
                .pause::before {
                    content: "";
                    position: absolute;
                    top: 16px;
                    left: 11px;
                    transform: translate(-50%, -50%);
                    width: 5px;
                    height: 15px;
                    background: white;
                    box-shadow: 8px 0 0 white;
                }
                .play-btn button::before {
                    transition: all 0.2s ease;
                }
            </style>
            <div id="root">
                <div class="carousel" id="carousel">
                    <div class="item-container" id="item-container">
                    </div>
                    <button class="prev">
                        <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#1f1f1f"><path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/></svg>
                    </button>
                    <button class="next">
                        <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#1f1f1f"><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/></svg>
                    </button>
                </div>
                <div class="controller">
                    <div>
                        <div class="focus-btns">                
                        </div>        
                    </div>
                    <div class="play-btn">
                        <button id="play-btn"></button>
                    </div>
                </div>
            </div>
        `;

        const list = this.list;
        const itemContainer = this.shadowRoot.querySelector(".item-container");
        const focus = this.shadowRoot.querySelector(".focus-btns");
        for (let i=0;i<list;i++) {
            const item = document.createElement("slot");
            item.className = "item";
            item.name = `item-${i+1}`;
            itemContainer.append(item);
            const btn = document.createElement("button");
            btn.dataset.index = i;
            focus.append(btn);
        }
    }
    _boot() {
        const carousel = this.shadowRoot.querySelector(".carousel");
        const playBtn = this.shadowRoot.getElementById("play-btn");
        
        carousel.style.aspectRatio = this.aspectRatio;
        carousel.style.border = this.border;
        carousel.style.borderRadius = this.borderRadius;
        carousel.style.background = this.background;
        if (this.autoPlayFlag) {
            playBtn.classList.add("play");
        } else {
            playBtn.classList.add("pause");
        }
        playBtn.addEventListener("click", () => {
            if (this.autoPlayFlag) {
                this.autoPlayFlag = false;  
                this._stopAutoPlay();
                playBtn.classList.remove("play");
                playBtn.classList.add("pause"); 
            } else {
                this.autoPlayFlag = true;
                this._startAutoPlay();
                playBtn.classList.remove("pause");
                playBtn.classList.add("play");
            }
        });     
        const prev = this.shadowRoot.querySelector(".prev");
        const next = this.shadowRoot.querySelector(".next"); 
        
        if (this.slideButton==="off") {
            prev.style.display = "none";
            next.style.display = "none";
        } else {
            prev.addEventListener("click", () => {
                let index = this.currentIndex-1;
                if (index<0) {
                    index = this.list - 1;
                } 
                this.currentIndex = index;
                this._setPointer(index);
                this._move("left");
            });
            next.addEventListener("click", () => {
                let index = this.currentIndex+1;
                if (index>=this.list) {
                    index = 0;
                }
                this.currentIndex = index;
                this._setPointer(index);
                this._move();
            });
        }
  
        const controller = this.shadowRoot.querySelector(".controller");
        if (this.controller==="off") {
            controller.style.display = "none";
        }

        const focusBtns = this.shadowRoot.querySelectorAll(".focus-btns button");
        focusBtns.forEach((btn) => {
            btn.addEventListener("click", (e) => {
                this._clickFocusBtn(e);
            });
        });
        if (this.autoPlay!=="off") {
            this._startAutoPlay();
        }
        this._setSwipe();
    }
    async _clickFocusBtn(e) {
        if (this.isAnimating) return;
        this._stopAutoPlay();
        this.isAnimating = true;
        const choiceIndex = Number(e.currentTarget.dataset.index);
        const diff = choiceIndex - this.currentIndex;
        const steps = Math.abs(diff);
        this.currentIndex = choiceIndex;
        this._setPointer(choiceIndex);
        if (steps > 0) {
            const direction = diff < 0 ? "left" : "right";
            for (let i = 0; i < steps; i++) {
                await this._move(direction);
            }
            if (this.autoPlayFlag) {
                this._startAutoPlay();
            }
        }
        this.isAnimating = false;
    }
    _move(direction="right", delay=400) {
        if (direction!=="right"&&direction!=="left") return;
        if (delay<0) return;
        return new Promise(resolve => {
            const carousel = this.shadowRoot.getElementById("carousel");
            const itemContainer = this.shadowRoot.getElementById("item-container");
            const w = carousel.clientWidth;

            switch (direction) {
                case "right":
                    itemContainer.style.transform = `translateX(${-w}px)`;
                    itemContainer.addEventListener(
                        "transitionend",
                        () => {
                            itemContainer.append(itemContainer.firstElementChild);
                            itemContainer.style.transition = "none";
                            itemContainer.style.transform = "translateX(0)";
                            itemContainer.offsetHeight;
                            itemContainer.style.transition = `transform ${delay/1000}s ease`;
                            resolve();
                        },
                        {
                            once: true
                        }
                    );
                    break;  
                case "left":
                    itemContainer.style.transition = "none";
                    itemContainer.prepend(itemContainer.lastElementChild);
                    itemContainer.style.transform = `translateX(${-w}px)`;
                    itemContainer.offsetHeight;
                    itemContainer.style.transition = `transform ${delay/1000}s ease`;
                    itemContainer.style.transform = "translateX(0)";
                    itemContainer.addEventListener(
                        "transitionend",
                        () => resolve(),
                        {
                            once: true
                        }
                    );
                    break;  
            }
        });           
    }
    _startAutoPlay() {
        if (this.autoPlayTimer) return;
        const l = this.shadowRoot.querySelectorAll(".focus-btns button").length - 1;
        const AUTO_PLAY_INTERVAL = this.AUTO_PLAY_INTERVAL;
        this.autoPlayTimer = setInterval(async () => {
            if (this.isAnimating) return;
            this.isAnimating = true;
            try {
                await this._move();
                if (this.currentIndex<l) {
                    this.currentIndex++;
                } else {
                    this.currentIndex = 0;
                }
                this._setPointer(this.currentIndex);
            } finally {
                this.isAnimating = false;
            }
        }, AUTO_PLAY_INTERVAL);
    }
    _stopAutoPlay() {
        clearInterval(this.autoPlayTimer);
        this.autoPlayTimer = null;
    }
    _setPointer(index = 0) {
        const btns = this.shadowRoot.querySelectorAll(".focus-btns button");
        const l = btns.length;    
        for (let i=0;i<l;i++) {
            btns[i].style.background = "gray";
        }
        btns[index].style.background = "#3E7A38";
    }
    _setSwipe() {
        const carousel = this.shadowRoot.getElementById("carousel");
        let startX = 0;
        let isDragging = false;
        carousel.addEventListener("touchstart", (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            this._stopAutoPlay();
        });
        carousel.addEventListener("touchend", async (e) => {
            if (!isDragging) return;
            isDragging = false;

            const endX = e.changedTouches[0].clientX;
            await this._handleSwipe(endX - startX);
        });
        carousel.addEventListener("pointerdown", (e) => {
            startX = e.clientX;
            isDragging = true;
            this._stopAutoPlay();
        });
        document.addEventListener("pointerup", async (e) => {
            if (!isDragging) return;
            isDragging = false;

            const endX = e.clientX;
            await this._handleSwipe(endX - startX);
        });
        carousel.addEventListener("mouseleave", () => {
            isDragging = false;
        });
        carousel.addEventListener("dragstart", (e) => {
            e.preventDefault();
        });
    }
    async _handleSwipe(diff) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        const threshold = 25;
        if (Math.abs(diff) < threshold) {
            this.isAnimating = false;
            return;
        }

        if (diff > 0) {
            let index = this.currentIndex - 1;
            if (index < 0) index = this.list - 1;
            this.currentIndex = index;
            this._setPointer(index);
            await this._move("left");
        } else {
            let index = this.currentIndex + 1;  
            if (index >= this.list) index = 0;
            this.currentIndex = index;
            this._setPointer(index);
            await this._move();
        }
        this.isAnimating = false;
        if (this.autoPlay!=="off") {
            this._startAutoPlay();
        } 
    }
}

customElements.define("g-p-carousel", GpCarousel);

// ReadMe

// where .html
// <g-p-carousel
//     interval="5000"
//     autoPlay="off"
//     list="3"
//     slideButton="on"
//     controller="off"
//     aspect-ratio="5 / 2"
//     border="2px solid blue"
//     borderRadius="none"
//     background="pink"
// >
//     <div slot="item-1">1</div>
//     <div slot="item-2">2</div>
//     <div slot="item-3">3</div>
// </g-p-carousel>
