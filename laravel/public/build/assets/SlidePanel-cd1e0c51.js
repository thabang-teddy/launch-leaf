import{r as a,j as e}from"./app-8e83f830.js";function c({open:o,title:i,onClose:t,children:n,width:r=400}){const[l,d]=a.useState(!1);return a.useEffect(()=>{const s=()=>d(window.innerWidth<768);return s(),window.addEventListener("resize",s),()=>window.removeEventListener("resize",s)},[]),o?l?e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
                    @keyframes slideInFromBottom {
                        from { opacity: 0; transform: translateY(40px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                    .slide-panel-mobile { animation: slideInFromBottom 0.25s ease; }
                    .slide-panel-header {
                        position: sticky; top: 0; z-index: 10;
                        background: #fff; border-bottom: 1px solid #ebebeb;
                        padding: 12px 16px;
                        display: flex; align-items: center; justify-content: space-between;
                    }
                `}),e.jsx("div",{onClick:t,style:{position:"fixed",inset:0,zIndex:1040,background:"rgba(0,0,0,0.45)",backdropFilter:"blur(2px)"}}),e.jsxs("div",{className:"slide-panel-mobile card border-0 shadow",style:{position:"fixed",bottom:0,left:0,right:0,zIndex:1045,maxHeight:"82vh",overflowY:"auto",borderRadius:"16px 16px 0 0"},children:[e.jsxs("div",{className:"slide-panel-header",children:[e.jsx("span",{style:{fontWeight:600,fontSize:14},children:i}),e.jsx("button",{type:"button",className:"btn-close",onClick:t,"aria-label":"Close"})]}),e.jsx("div",{style:{padding:"16px"},children:n})]})]}):e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
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
            `}),e.jsxs("div",{className:"slide-panel-root card border-0 shadow",style:{width:r,flexShrink:0,position:"sticky",top:0,maxHeight:"calc(100vh - 106px)",overflowY:"auto",alignSelf:"flex-start"},children:[e.jsxs("div",{className:"slide-panel-header",children:[e.jsx("span",{style:{fontWeight:600,fontSize:14},children:i}),e.jsx("button",{type:"button",className:"btn-close",onClick:t,"aria-label":"Close"})]}),e.jsx("div",{style:{padding:"16px"},children:n})]})]}):null}export{c as S};
