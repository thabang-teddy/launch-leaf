import{j as e}from"./app-a390796e.js";function o({open:t,title:s,onClose:i,children:a,width:n=400}){return t?e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
                @keyframes slideInFromRight {
                    from { opacity: 0; transform: translateX(18px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                .slide-panel-root { animation: slideInFromRight 0.22s ease; }
                .slide-panel-header {
                    position: sticky; top: 0; z-index: 10;
                    background: #fff; border-bottom: 1px solid #ebebeb;
                    padding: 12px 16px;
                    display: flex; align-items: center; justify-content: space-between;
                }
            `}),e.jsxs("div",{className:"slide-panel-root card border-0 shadow",style:{width:n,flexShrink:0,position:"sticky",top:0,maxHeight:"calc(100vh - 106px)",overflowY:"auto",alignSelf:"flex-start"},children:[e.jsxs("div",{className:"slide-panel-header",children:[e.jsx("span",{style:{fontWeight:600,fontSize:14},children:s}),e.jsx("button",{type:"button",className:"btn-close",onClick:i,"aria-label":"Close"})]}),e.jsx("div",{style:{padding:"16px"},children:a})]})]}):null}export{o as S};
