class GpAccordion extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }
    color="black";                  
    contentBg = "white";        
    connectedCallback() {
        this.color = this.getAttribute("color") ?? this.color;
        this.contentBg = this.getAttribute("contentBg") ?? this.contentBg;
        this._render();
        this._boot();
    }
    _render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                }
                .header {
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    background: white;
                    border: none;
                    padding: 10px;
                    font-size: 1rem;
                }
                .icon {
                    transition: transform .3s ease;
                }
                .header[aria-expanded="true"] .icon {
                    transform: rotate(180deg);
                }
                .content {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height .3s ease;
                    white-space: normal;
                    word-break: break-word;
                    overflow-wrap: break-word;
                }
                .inner {
                    padding: 10px;
                    background: gray; 
                }
            </style>
            <div id="root">
                <button class="header" aria-expanded="false">
                    <slot name="title"></slot>
                    <span class="icon">▼</span>
                </button>
                <div class="content" id="content">
                    <div class="inner">
                        <slot name="content"></slot>
                    </div>
                </div>
            </div>
        `;
    }

    _boot() {
        const header = this.shadowRoot.querySelector(".header");
        const content = this.shadowRoot.querySelector(".content");
        const inner = this.shadowRoot.querySelector(".inner");
        header.style.color = this.color;
        inner.style.color = this.color;   
        inner.style.background = this.contentBg;              
        header.addEventListener("click", () => {
            const isOpen = header.getAttribute("aria-expanded") === "true";
            if (isOpen) {
                content.style.maxHeight = content.scrollHeight + "px";
                requestAnimationFrame(() => {
                    content.style.maxHeight = "0px";
                });
                header.setAttribute("aria-expanded", "false");
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
                header.setAttribute("aria-expanded", "true");
            }
        });
    }
}

customElements.define("g-p-accordion", GpAccordion);