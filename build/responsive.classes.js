window.rclasses={},function(a){"use strict";function b(){f({xs:{max:600},sm:{min:600,max:960},md:{min:960,max:1280},lg:{min:1280,max:1920},xl:{min:1920}}),j=c(window.innerWidth),window.addEventListener("resize",g)}function c(a){var b,c,d;for(b in k)if(k.hasOwnProperty(b)&&(c=k[b].min,"number"!=typeof k[b].min&&(c=0),d=k[b].max,"number"!=typeof k[b].max&&(d=Number.Infinity),a>=c&&d>=a))return b;throw new Error("Incomplete sizes definition!")}function d(a,b){var c;return"function"==typeof a&&(b?(c=m.indexOf(a),m.splice(c,1)):m.push(a)),i.slice()}function e(a,b){var c;return"function"==typeof a&&(b?(c=l.indexOf(a),l.splice(c,1)):l.push(a)),j}function f(a){function b(a){return a(e)}function c(b){var c=!1;if(b=a[b],b.min>=0&&(c=!0),b.max>=0&&(c=!0),!c)throw new Error("Supplied size MUST have at least 1 min or max value that is a positive number")}function d(b){/[a-z][a-z0-9_\-]/i.test(b)&&(k[b]={min:a[b].min>=0?a[b].min:void 0,max:a[b].max>=0?a[b].max:void 0})}var e;a&&"object"==typeof a&&(Object.keys(a).forEach(c),k={},Object.keys(a).forEach(d),i=Object.keys(a).sort(h),e=i.slice(),m.forEach(b))}function g(){function a(a){return a(j,b)}var b,d=c(window.innerWidth);d!==j&&(b=j,j=d,l.forEach(a))}function h(a,b){return a=k[a].min||0,b=k[b].min||0,a-b}var i,j,k,l=[],m=[];a.registerSizes=f,a.sizes=d,a.currentSize=e,b()}(window.rclasses),function(a,b,c,d){"use strict";function e(){var a;K=[],E=1,F={},G=new d(j),a=c.sizes(s),s(a),J=c.currentSize(t),f()}function f(){G.observe(b.documentElement,{subtree:!0,childList:!0,attributes:!0,attributeOldValue:!0}),n(b.documentElement)}function g(){G.disconnect()}function h(){window.requestAnimationFrame(i)}function i(){if(K.length){for(var a=0;a<K.length;a++)K[a].add?K[a].element.classList.add(K[a]["class"]):K[a].element.classList.remove(K[a]["class"]);K=[]}}function j(a){var b=a.map(l);b=[].concat.apply([],b).filter(y),b.forEach(o),b=a.map(k),b=[].concat.apply([],b).filter(y),b.forEach(n),b=a.map(m).filter(x).filter(w),b.forEach(r),K.length&&h()}function k(a){return Array.prototype.slice.call(a.addedNodes)}function l(a){return Array.prototype.slice.call(a.removedNodes)}function m(a){return"attributes"===a.type&&L.test(a.attributeName)?a.target:void 0}function n(a){var b,c,d;for(d=u(a),b=0;b<d.length;b++)c=d[b].dataset[M],c||(d[b].dataset[M]=E++),F[c]||(F[c]=d[b]),r(d[b])}function o(a){var b,c,d;for(d=u(a),b=0;b<d.length;b++)c=a.dataset[M],c&&delete d[c]}function p(a,b){b&&D(a,!1,q(a,b)),D(a,!0,q(a,J))}function q(a,b){return a.dataset[N+b]}function r(a){function b(a){var b,c,d,e;for(e={},b=0;b<a.attributes.length;b++)c=H.exec(a.attributes[b].name),c&&c[3]&&(d=c[3],e[d]||(e[d]=[]),e[d].push({"class":C(d,a.attributes[b].value),match:c}));return e}function c(a,b){function c(b,c){var d,e,f,g={};for(e=0,d=0;d<I.length;d++)f=a[b],e<f.length&&f[e].match[2]===I[d]?(g[I[d]]=f[e]["class"],f[e].match[1]&&(c=g[I[d]]),e++):g[I[d]]=c;return g}function d(a){return a.match[2]?!0:(e=a["class"],!1)}var e;a[b]=a[b].filter(d).sort(z),B(a[b]),a[b]=c(b,e)}var d,e,f;e=b(a);for(d in e)e.hasOwnProperty(d)&&(f=!0,c(e,d));f&&(A(e,a),p(a))}function s(a){var c,d=a.join("|");c="^rc-(?:(gt-)?("+d+")-)?(.+)$",H=new RegExp(c,"i"),I=a.slice(),r(b.documentElement)}function t(a,b){J=a;for(var c in F)F.hasOwnProperty(c)&&p(F[c],b);h()}function u(a){var b,c=[];return v(a)&&c.push(a),b=Array.prototype.map.call(a.children,u),b=[].concat.apply([],b),c.concat(b)}function v(a){for(var b=0;b<a.attributes.length;b++)if(L.test(a.attributes[b].name))return!0;return!1}function w(a,b,c){return c.indexOf(a)===b}function x(a){return void 0!==a}function y(a){return a.nodeType===b.ELEMENT_NODE}function z(a,b){var c,d;return c=I.indexOf(a[2]),d=I.indexOf(b[2]),c===d?a[1]&&!b[1]?-1:b[1]&&!a[1]?1:-1:c-d}function A(a,b){var c,d,e,f;for(c=0;c<I.length;c++){f=I[c],e=[];for(d in a)a[d][f]&&e.push(a[d][f]);b.dataset[N+f]=e.join(",")}}function B(a){for(var b,c=1;c<a.length;c++)b=a[c-1].match[2],a[c].match[2]===b&&(a.splice(c,1),c--)}function C(a,b){return b?a+"-"+b:a}function D(a,b,c){var d;if(c)for(c=c.split(","),d=0;d<c.length;d++)K.push({element:a,add:b,"class":c[d]})}var E,F,G,H,I,J,K,L=/^rc-/i,M="rcaStorageId",N="rcaStateFor";a.resumeMonitor=f,a.pauseMonitor=g,e()}(window.rclasses,window.document,window.rclasses,window.MutationObserver);