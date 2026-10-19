/*!
 * @phucbm/scroll-direction 0.1.1
 * https://github.com/phucbm/scroll-direction
 *
 * @license MIT
 * @author: phucbm, https://github.com/phucbm
 */
var p=r=>typeof r=="function"?r():r,v=(r={})=>{let d={target:document.body,prefix:"is-scroll-",topOffset:80,bottomOffset:100,directionThreshold:10,...r},{target:l,prefix:c}=d,n=null,e="none",i=window.scrollY,s=window.scrollY,a=!1,u=!1,S=t=>{let o=document.documentElement.scrollHeight-window.innerHeight;return t<p(d.topOffset)?"top":o-t<p(d.bottomOffset)?"bottom":"middle"},w=t=>{let o=d.directionThreshold;return e==="down"&&t>i&&(i=t),e==="up"&&t<i&&(i=t),e!=="down"&&t-i>o?(i=t,"down"):e!=="up"&&i-t>o?(i=t,"up"):e},m=()=>{if(u)return;s=window.scrollY;let t=S(s),o=w(s);if(t===n&&o===e)return;t!==n&&(n&&l.classList.remove(c+n),l.classList.add(c+t)),o!==e&&(e!=="none"&&l.classList.remove(c+e),o!=="none"&&l.classList.add(c+o)),n=t,e=o;let D={position:n,direction:e,scrollY:s};document.dispatchEvent(new CustomEvent("scrolldirection",{detail:D}))},f=()=>{a||(a=!0,window.requestAnimationFrame(()=>{a=!1,m()}))};return window.addEventListener("scroll",f,{passive:!0}),window.addEventListener("resize",f,{passive:!0}),m(),{getState(){return{position:n,direction:e,scrollY:s}},update:m,destroy(){u||(u=!0,window.removeEventListener("scroll",f),window.removeEventListener("resize",f),["top","middle","bottom","up","down"].forEach(t=>l.classList.remove(c+t)))}}},g=v;export{v as createScrollDirection,g as default};
//# sourceMappingURL=index.js.map