// https://github.com/mattdesl/mp4-h264/blob/cfd8e1ca99c88f2af9d6ca07d0531324587618cb/build/mp4-encoder.js


var loadEncoder = (function() {
    // var _scriptDir = import.meta.url;
    var _scriptDir = 'https://19521178.github.io/jsFFNet/client/utils/mp4-encoder.js';
    
    return (
  function(Module) {
    Module = Module || {};
  
  
  var e;e||(e=typeof Module !== 'undefined' ? Module : {});var aa,ba;e.ready=new Promise(function(a,b){aa=a;ba=b});function ca(){let a=0,b=0,c=new Uint8Array(256);return{contents:function(){return c.slice(0,b)},seek:function(d){a=d},write:function(d,f,g){var k=a+g,h=c.length;h>=k||(k=Math.max(k,h*(1048576>h?2:1.125)>>>0),0!=h&&(k=Math.max(k,256)),h=c,c=new Uint8Array(k),0<b&&c.set(h.subarray(0,b),0));c.set(d.subarray(f,f+g),a);a+=g;b=Math.max(b,a);return g}}}
  e.create=function(a={}){function b(){null!=h||p||(h=e.create_buffer(d*f*3/2));return h}function c(){null!=l||p||(l=e.create_buffer(d*f*g));return l}const d=a.width,f=a.height,g=a.stride||4;if(!d||!f)throw Error("width and height must be > 0");const k=ca();let h=null,l=null,p=!1;a=Object.assign({},a);delete a.stride;const q=e.create_encoder(a,function(m,r,u){k.seek(u);return k.write(e.HEAPU8,m,r)!=r});return{memory:function(){return e.HEAPU8},getYUVPointer:b,getRGBPointer:c,end:function(){if(p)throw Error("Attempting to end() an encoder that is already finished");
  p=!0;e.finalize_encoder(q);null!=h&&e.free_buffer(h);null!=l&&e.free_buffer(l);return k.contents()},encodeRGBPointer:function(){const m=c(),r=b();e.encode_rgb(q,m,g,r)},encodeYUVPointer:function(){const m=b();e.encode_yuv(q,m)},encodeRGB:function(m){if(m.length!==d*f*g)throw Error("Expected buffer to be sized (width * height * "+g+")");const r=c(),u=b();e.HEAPU8.set(m,r);e.encode_rgb(q,r,g,u)},encodeYUV:function(m){if(m.length!==d*f*3/2)throw Error("Expected buffer to be sized (width * height * 3) / 2");
  const r=b();e.HEAPU8.set(m,r);e.encode_yuv(q,r)}}};e.locateFile=function(a,b){e.simd&&(a=a.replace(/\.wasm$/i,".simd.wasm"));return e.getWasmPath?e.getWasmPath(a,b,e.simd):b+a};var t={},v;for(v in e)e.hasOwnProperty(v)&&(t[v]=e[v]);var da=!1,w=!1;da="object"===typeof window;w="function"===typeof importScripts;var x="",ea;
  if(da||w)w?x=self.location.href:"undefined"!==typeof document&&document.currentScript&&(x=document.currentScript.src),_scriptDir&&(x=_scriptDir),0!==x.indexOf("blob:")?x=x.substr(0,x.lastIndexOf("/")+1):x="",w&&(ea=function(a){var b=new XMLHttpRequest;b.open("GET",a,!1);b.responseType="arraybuffer";b.send(null);return new Uint8Array(b.response)});var y=e.printErr||console.warn.bind(console);for(v in t)t.hasOwnProperty(v)&&(e[v]=t[v]);t=null;var z;e.wasmBinary&&(z=e.wasmBinary);var noExitRuntime;
  e.noExitRuntime&&(noExitRuntime=e.noExitRuntime);"object"!==typeof WebAssembly&&A("no native wasm support detected");var B,fa=!1;
  function C(a,b){var c=D;b=a+b;for(var d="";!(a>=b);){var f=c[a++];if(!f)break;if(f&128){var g=c[a++]&63;if(192==(f&224))d+=String.fromCharCode((f&31)<<6|g);else{var k=c[a++]&63;f=224==(f&240)?(f&15)<<12|g<<6|k:(f&7)<<18|g<<12|k<<6|c[a++]&63;65536>f?d+=String.fromCharCode(f):(f-=65536,d+=String.fromCharCode(55296|f>>10,56320|f&1023))}}else d+=String.fromCharCode(f)}return d}
  function ha(a,b,c){var d=D;if(0<c){c=b+c-1;for(var f=0;f<a.length;++f){var g=a.charCodeAt(f);if(55296<=g&&57343>=g){var k=a.charCodeAt(++f);g=65536+((g&1023)<<10)|k&1023}if(127>=g){if(b>=c)break;d[b++]=g}else{if(2047>=g){if(b+1>=c)break;d[b++]=192|g>>6}else{if(65535>=g){if(b+2>=c)break;d[b++]=224|g>>12}else{if(b+3>=c)break;d[b++]=240|g>>18;d[b++]=128|g>>12&63}d[b++]=128|g>>6&63}d[b++]=128|g&63}}d[b]=0}}
  function ia(a,b){for(var c="",d=0;!(d>=b/2);++d){var f=E[a+2*d>>1];if(0==f)break;c+=String.fromCharCode(f)}return c}function ja(a,b,c){void 0===c&&(c=2147483647);if(2>c)return 0;c-=2;var d=b;c=c<2*a.length?c/2:a.length;for(var f=0;f<c;++f)E[b>>1]=a.charCodeAt(f),b+=2;E[b>>1]=0;return b-d}function ka(a){return 2*a.length}
  function la(a,b){for(var c=0,d="";!(c>=b/4);){var f=F[a+4*c>>2];if(0==f)break;++c;65536<=f?(f-=65536,d+=String.fromCharCode(55296|f>>10,56320|f&1023)):d+=String.fromCharCode(f)}return d}function ma(a,b,c){void 0===c&&(c=2147483647);if(4>c)return 0;var d=b;c=d+c-4;for(var f=0;f<a.length;++f){var g=a.charCodeAt(f);if(55296<=g&&57343>=g){var k=a.charCodeAt(++f);g=65536+((g&1023)<<10)|k&1023}F[b>>2]=g;b+=4;if(b+4>c)break}F[b>>2]=0;return b-d}
  function na(a){for(var b=0,c=0;c<a.length;++c){var d=a.charCodeAt(c);55296<=d&&57343>=d&&++c;b+=4}return b}var G,oa,D,E,pa,F,H,qa,ra;function sa(a){G=a;e.HEAP8=oa=new Int8Array(a);e.HEAP16=E=new Int16Array(a);e.HEAP32=F=new Int32Array(a);e.HEAPU8=D=new Uint8Array(a);e.HEAPU16=pa=new Uint16Array(a);e.HEAPU32=H=new Uint32Array(a);e.HEAPF32=qa=new Float32Array(a);e.HEAPF64=ra=new Float64Array(a)}var ta=e.INITIAL_MEMORY||16777216;
  e.wasmMemory?B=e.wasmMemory:B=new WebAssembly.Memory({initial:ta/65536,maximum:32768});B&&(G=B.buffer);ta=G.byteLength;sa(G);var I,ua=[],va=[],wa=[],xa=[];function ya(){var a=e.preRun.shift();ua.unshift(a)}var K=0,za=null,L=null;e.preloadedImages={};e.preloadedAudios={};function A(a){if(e.onAbort)e.onAbort(a);y(a);fa=!0;a=new WebAssembly.RuntimeError("abort("+a+"). Build with -s ASSERTIONS=1 for more info.");ba(a);throw a;}
  function Aa(){var a=M;return String.prototype.startsWith?a.startsWith("data:application/octet-stream;base64,"):0===a.indexOf("data:application/octet-stream;base64,")}var M="mp4-encoder.wasm";if(!Aa()){var Ba=M;M=e.locateFile?e.locateFile(Ba,x):x+Ba}function Ca(){try{if(z)return new Uint8Array(z);if(ea)return ea(M);throw"both async and sync fetching of the wasm failed";}catch(a){A(a)}}
  function Da(){return z||!da&&!w||"function"!==typeof fetch?Promise.resolve().then(Ca):fetch(M,{credentials:"same-origin"}).then(function(a){if(!a.ok)throw"failed to load wasm binary file at '"+M+"'";return a.arrayBuffer()}).catch(function(){return Ca()})}function N(a){for(;0<a.length;){var b=a.shift();if("function"==typeof b)b(e);else{var c=b.K;"number"===typeof c?void 0===b.H?I.get(c)():I.get(c)(b.H):c(void 0===b.H?null:b.H)}}}
  function Ea(a){switch(a){case 1:return 0;case 2:return 1;case 4:return 2;case 8:return 3;default:throw new TypeError("Unknown type size: "+a);}}var Fa=void 0;function P(a){for(var b="";D[a];)b+=Fa[D[a++]];return b}var Q={},R={},S={};function Ga(a){if(void 0===a)return"_unknown";a=a.replace(/[^a-zA-Z0-9_]/g,"$");var b=a.charCodeAt(0);return 48<=b&&57>=b?"_"+a:a}
  function Ha(a,b){a=Ga(a);return(new Function("body","return function "+a+'() {\n    "use strict";    return body.apply(this, arguments);\n};\n'))(b)}function Ia(a){var b=Error,c=Ha(a,function(d){this.name=a;this.message=d;d=Error(d).stack;void 0!==d&&(this.stack=this.toString()+"\n"+d.replace(/^Error(:[^\n]*)?\n/,""))});c.prototype=Object.create(b.prototype);c.prototype.constructor=c;c.prototype.toString=function(){return void 0===this.message?this.name:this.name+": "+this.message};return c}
  var Ja=void 0;function T(a){throw new Ja(a);}var Ka=void 0;function La(a,b){function c(h){h=b(h);if(h.length!==d.length)throw new Ka("Mismatched type converter count");for(var l=0;l<d.length;++l)U(d[l],h[l])}var d=[];d.forEach(function(h){S[h]=a});var f=Array(a.length),g=[],k=0;a.forEach(function(h,l){R.hasOwnProperty(h)?f[l]=R[h]:(g.push(h),Q.hasOwnProperty(h)||(Q[h]=[]),Q[h].push(function(){f[l]=R[h];++k;k===g.length&&c(f)}))});0===g.length&&c(f)}
  function U(a,b,c){c=c||{};if(!("argPackAdvance"in b))throw new TypeError("registerType registeredInstance requires argPackAdvance");var d=b.name;a||T('type "'+d+'" must have a positive integer typeid pointer');if(R.hasOwnProperty(a)){if(c.L)return;T("Cannot register type '"+d+"' twice")}R[a]=b;delete S[a];Q.hasOwnProperty(a)&&(b=Q[a],delete Q[a],b.forEach(function(f){f()}))}var Ma=[],V=[{},{value:void 0},{value:null},{value:!0},{value:!1}];
  function Na(a){4<a&&0===--V[a].I&&(V[a]=void 0,Ma.push(a))}function W(a){switch(a){case void 0:return 1;case null:return 2;case !0:return 3;case !1:return 4;default:var b=Ma.length?Ma.pop():V.length;V[b]={I:1,value:a};return b}}function Qa(a){return this.fromWireType(H[a>>2])}function Ra(a){if(null===a)return"null";var b=typeof a;return"object"===b||"array"===b||"function"===b?a.toString():""+a}
  function Sa(a,b){switch(b){case 2:return function(c){return this.fromWireType(qa[c>>2])};case 3:return function(c){return this.fromWireType(ra[c>>3])};default:throw new TypeError("Unknown float type: "+a);}}function Ta(a){var b=Function;if(!(b instanceof Function))throw new TypeError("new_ called with constructor type "+typeof b+" which is not a function");var c=Ha(b.name||"unknownFunctionName",function(){});c.prototype=b.prototype;c=new c;a=b.apply(c,a);return a instanceof Object?a:c}
  function Ua(a){for(;a.length;){var b=a.pop();a.pop()(b)}}function Va(a,b){var c=e;if(void 0===c[a].F){var d=c[a];c[a]=function(){c[a].F.hasOwnProperty(arguments.length)||T("Function '"+b+"' called with an invalid number of arguments ("+arguments.length+") - expects one of ("+c[a].F+")!");return c[a].F[arguments.length].apply(this,arguments)};c[a].F=[];c[a].F[d.J]=d}}
  function Wa(a,b,c){e.hasOwnProperty(a)?((void 0===c||void 0!==e[a].F&&void 0!==e[a].F[c])&&T("Cannot register public name '"+a+"' twice"),Va(a,a),e.hasOwnProperty(c)&&T("Cannot register multiple overloads of a function with the same number of arguments ("+c+")!"),e[a].F[c]=b):(e[a]=b,void 0!==c&&(e[a].N=c))}function Xa(a,b){for(var c=[],d=0;d<a;d++)c.push(F[(b>>2)+d]);return c}
  function Ya(a,b){0<=a.indexOf("j")||A("Assertion failed: getDynCaller should only be called with i64 sigs");var c=[];return function(){c.length=arguments.length;for(var d=0;d<arguments.length;d++)c[d]=arguments[d];var f;-1!=a.indexOf("j")?f=c&&c.length?e["dynCall_"+a].apply(null,[b].concat(c)):e["dynCall_"+a].call(null,b):f=I.get(b).apply(null,c);return f}}
  function Za(a,b){a=P(a);var c=-1!=a.indexOf("j")?Ya(a,b):I.get(b);"function"!==typeof c&&T("unknown function pointer with signature "+a+": "+b);return c}var $a=void 0;function ab(a){a=bb(a);var b=P(a);X(a);return b}function cb(a,b){function c(g){f[g]||R[g]||(S[g]?S[g].forEach(c):(d.push(g),f[g]=!0))}var d=[],f={};b.forEach(c);throw new $a(a+": "+d.map(ab).join([", "]));}
  function db(a,b,c){switch(b){case 0:return c?function(d){return oa[d]}:function(d){return D[d]};case 1:return c?function(d){return E[d>>1]}:function(d){return pa[d>>1]};case 2:return c?function(d){return F[d>>2]}:function(d){return H[d>>2]};default:throw new TypeError("Unknown integer type: "+a);}}function Y(a){a||T("Cannot use deleted val. handle = "+a);return V[a].value}function eb(a,b){var c=R[a];void 0===c&&T(b+" has unknown type "+ab(a));return c}
  for(var fb={},gb=Array(256),Z=0;256>Z;++Z)gb[Z]=String.fromCharCode(Z);Fa=gb;Ja=e.BindingError=Ia("BindingError");Ka=e.InternalError=Ia("InternalError");e.count_emval_handles=function(){for(var a=0,b=5;b<V.length;++b)void 0!==V[b]&&++a;return a};e.get_first_emval=function(){for(var a=5;a<V.length;++a)if(void 0!==V[a])return V[a];return null};$a=e.UnboundTypeError=Ia("UnboundTypeError");va.push({K:function(){hb()}});
  var jb={b:function(a,b,c,d){A("Assertion failed: "+(a?C(a,void 0):"")+", at: "+[b?b?C(b,void 0):"":"unknown filename",c,d?d?C(d,void 0):"":"unknown function"])},v:function(a,b,c,d,f){var g=Ea(c);b=P(b);U(a,{name:b,fromWireType:function(k){return!!k},toWireType:function(k,h){return h?d:f},argPackAdvance:8,readValueFromPointer:function(k){if(1===c)var h=oa;else if(2===c)h=E;else if(4===c)h=F;else throw new TypeError("Unknown boolean type size: "+b);return this.fromWireType(h[k>>g])},G:null})},u:function(a,
  b){b=P(b);U(a,{name:b,fromWireType:function(c){var d=V[c].value;Na(c);return d},toWireType:function(c,d){return W(d)},argPackAdvance:8,readValueFromPointer:Qa,G:null})},p:function(a,b,c){c=Ea(c);b=P(b);U(a,{name:b,fromWireType:function(d){return d},toWireType:function(d,f){if("number"!==typeof f&&"boolean"!==typeof f)throw new TypeError('Cannot convert "'+Ra(f)+'" to '+this.name);return f},argPackAdvance:8,readValueFromPointer:Sa(b,c),G:null})},l:function(a,b,c,d,f,g){var k=Xa(b,c);a=P(a);f=Za(d,
  f);Wa(a,function(){cb("Cannot call "+a+" due to unbound types",k)},b-1);La(k,function(h){var l=a,p=a;h=[h[0],null].concat(h.slice(1));var q=f,m=h.length;2>m&&T("argTypes array size mismatch! Must at least get return value and 'this' types!");for(var r=null!==h[1]&&!1,u=!1,n=1;n<h.length;++n)if(null!==h[n]&&void 0===h[n].G){u=!0;break}var Oa="void"!==h[0].name,J="",O="";for(n=0;n<m-2;++n)J+=(0!==n?", ":"")+"arg"+n,O+=(0!==n?", ":"")+"arg"+n+"Wired";p="return function "+Ga(p)+"("+J+") {\nif (arguments.length !== "+
  (m-2)+") {\nthrowBindingError('function "+p+" called with ' + arguments.length + ' arguments, expected "+(m-2)+" args!');\n}\n";u&&(p+="var destructors = [];\n");var Pa=u?"destructors":"null";J="throwBindingError invoker fn runDestructors retType classParam".split(" ");q=[T,q,g,Ua,h[0],h[1]];r&&(p+="var thisWired = classParam.toWireType("+Pa+", this);\n");for(n=0;n<m-2;++n)p+="var arg"+n+"Wired = argType"+n+".toWireType("+Pa+", arg"+n+"); // "+h[n+2].name+"\n",J.push("argType"+n),q.push(h[n+2]);r&&
  (O="thisWired"+(0<O.length?", ":"")+O);p+=(Oa?"var rv = ":"")+"invoker(fn"+(0<O.length?", ":"")+O+");\n";if(u)p+="runDestructors(destructors);\n";else for(n=r?1:2;n<h.length;++n)m=1===n?"thisWired":"arg"+(n-2)+"Wired",null!==h[n].G&&(p+=m+"_dtor("+m+"); // "+h[n].name+"\n",J.push(m+"_dtor"),q.push(h[n].G));Oa&&(p+="var ret = retType.fromWireType(rv);\nreturn ret;\n");J.push(p+"}\n");h=Ta(J).apply(null,q);n=b-1;if(!e.hasOwnProperty(l))throw new Ka("Replacing nonexistant public symbol");void 0!==e[l].F&&
  void 0!==n?e[l].F[n]=h:(e[l]=h,e[l].J=n);return[]})},k:function(a,b,c,d,f){function g(p){return p}b=P(b);-1===f&&(f=4294967295);var k=Ea(c);if(0===d){var h=32-8*c;g=function(p){return p<<h>>>h}}var l=-1!=b.indexOf("unsigned");U(a,{name:b,fromWireType:g,toWireType:function(p,q){if("number"!==typeof q&&"boolean"!==typeof q)throw new TypeError('Cannot convert "'+Ra(q)+'" to '+this.name);if(q<d||q>f)throw new TypeError('Passing a number "'+Ra(q)+'" from JS side to C/C++ side to an argument of type "'+
  b+'", which is outside the valid range ['+d+", "+f+"]!");return l?q>>>0:q|0},argPackAdvance:8,readValueFromPointer:db(b,k,0!==d),G:null})},i:function(a,b,c){function d(g){g>>=2;var k=H;return new f(G,k[g+1],k[g])}var f=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array][b];c=P(c);U(a,{name:c,fromWireType:d,argPackAdvance:8,readValueFromPointer:d},{L:!0})},q:function(a,b){b=P(b);var c="std::string"===b;U(a,{name:b,fromWireType:function(d){var f=H[d>>2];if(c)for(var g=
  d+4,k=0;k<=f;++k){var h=d+4+k;if(k==f||0==D[h]){g=g?C(g,h-g):"";if(void 0===l)var l=g;else l+=String.fromCharCode(0),l+=g;g=h+1}}else{l=Array(f);for(k=0;k<f;++k)l[k]=String.fromCharCode(D[d+4+k]);l=l.join("")}X(d);return l},toWireType:function(d,f){f instanceof ArrayBuffer&&(f=new Uint8Array(f));var g="string"===typeof f;g||f instanceof Uint8Array||f instanceof Uint8ClampedArray||f instanceof Int8Array||T("Cannot pass non-string to std::string");var k=(c&&g?function(){for(var p=0,q=0;q<f.length;++q){var m=
  f.charCodeAt(q);55296<=m&&57343>=m&&(m=65536+((m&1023)<<10)|f.charCodeAt(++q)&1023);127>=m?++p:p=2047>=m?p+2:65535>=m?p+3:p+4}return p}:function(){return f.length})(),h=ib(4+k+1);H[h>>2]=k;if(c&&g)ha(f,h+4,k+1);else if(g)for(g=0;g<k;++g){var l=f.charCodeAt(g);255<l&&(X(h),T("String has UTF-16 code units that do not fit in 8 bits"));D[h+4+g]=l}else for(g=0;g<k;++g)D[h+4+g]=f[g];null!==d&&d.push(X,h);return h},argPackAdvance:8,readValueFromPointer:Qa,G:function(d){X(d)}})},n:function(a,b,c){c=P(c);
  if(2===b){var d=ia;var f=ja;var g=ka;var k=function(){return pa};var h=1}else 4===b&&(d=la,f=ma,g=na,k=function(){return H},h=2);U(a,{name:c,fromWireType:function(l){for(var p=H[l>>2],q=k(),m,r=l+4,u=0;u<=p;++u){var n=l+4+u*b;if(u==p||0==q[n>>h])r=d(r,n-r),void 0===m?m=r:(m+=String.fromCharCode(0),m+=r),r=n+b}X(l);return m},toWireType:function(l,p){"string"!==typeof p&&T("Cannot pass non-string to C++ string type "+c);var q=g(p),m=ib(4+q+b);H[m>>2]=q>>h;f(p,m+4,q+b);null!==l&&l.push(X,m);return m},
  argPackAdvance:8,readValueFromPointer:Qa,G:function(l){X(l)}})},w:function(a,b){b=P(b);U(a,{M:!0,name:b,argPackAdvance:0,fromWireType:function(){},toWireType:function(){}})},f:function(a,b,c){a=Y(a);b=eb(b,"emval::as");var d=[],f=W(d);F[c>>2]=f;return b.toWireType(d,a)},m:function(a,b,c,d){a=Y(a);for(var f=Array(b),g=0;g<b;++g)f[g]=eb(F[(c>>2)+g],"parameter "+g);c=Array(b);for(g=0;g<b;++g){var k=f[g];c[g]=k.readValueFromPointer(d);d+=k.argPackAdvance}a=a.apply(void 0,c);return W(a)},c:Na,g:function(a,
  b){a=Y(a);b=Y(b);return W(a[b])},d:function(a){4<a&&(V[a].I+=1)},h:function(a){var b=fb[a];return W(void 0===b?P(a):b)},e:function(a){Ua(V[a].value);Na(a)},j:function(a,b){a=eb(a,"_emval_take_value");a=a.readValueFromPointer(b);return W(a)},r:function(a){a=Y(a);return W(typeof a)},o:function(){A()},s:function(a,b,c){D.copyWithin(a,b,b+c)},t:function(a){a>>>=0;var b=D.length;if(2147483648<a)return!1;for(var c=1;4>=c;c*=2){var d=b*(1+.2/c);d=Math.min(d,a+100663296);d=Math.max(16777216,a,d);0<d%65536&&
  (d+=65536-d%65536);a:{try{B.grow(Math.min(2147483648,d)-G.byteLength+65535>>>16);sa(B.buffer);var f=1;break a}catch(g){}f=void 0}if(f)return!0}return!1},a:B};
  (function(){function a(f){e.asm=f.exports;I=e.asm.x;K--;e.monitorRunDependencies&&e.monitorRunDependencies(K);0==K&&(null!==za&&(clearInterval(za),za=null),L&&(f=L,L=null,f()))}function b(f){a(f.instance)}function c(f){return Da().then(function(g){return WebAssembly.instantiate(g,d)}).then(f,function(g){y("failed to asynchronously prepare wasm: "+g);A(g)})}var d={a:jb};K++;e.monitorRunDependencies&&e.monitorRunDependencies(K);if(e.instantiateWasm)try{return e.instantiateWasm(d,a)}catch(f){return y("Module.instantiateWasm callback failed with error: "+
  f),!1}(function(){return z||"function"!==typeof WebAssembly.instantiateStreaming||Aa()||"function"!==typeof fetch?c(b):fetch(M,{credentials:"same-origin"}).then(function(f){return WebAssembly.instantiateStreaming(f,d).then(b,function(g){y("wasm streaming compile failed: "+g);y("falling back to ArrayBuffer instantiation");return c(b)})})})().catch(ba);return{}})();
  var hb=e.___wasm_call_ctors=function(){return(hb=e.___wasm_call_ctors=e.asm.y).apply(null,arguments)},ib=e._malloc=function(){return(ib=e._malloc=e.asm.z).apply(null,arguments)},X=e._free=function(){return(X=e._free=e.asm.A).apply(null,arguments)},bb=e.___getTypeName=function(){return(bb=e.___getTypeName=e.asm.B).apply(null,arguments)};e.___embind_register_native_and_builtin_types=function(){return(e.___embind_register_native_and_builtin_types=e.asm.C).apply(null,arguments)};
  e.dynCall_ijiii=function(){return(e.dynCall_ijiii=e.asm.D).apply(null,arguments)};var kb;L=function lb(){kb||mb();kb||(L=lb)};
  function mb(){function a(){if(!kb&&(kb=!0,e.calledRun=!0,!fa)){N(va);N(wa);aa(e);if(e.onRuntimeInitialized)e.onRuntimeInitialized();if(e.postRun)for("function"==typeof e.postRun&&(e.postRun=[e.postRun]);e.postRun.length;){var b=e.postRun.shift();xa.unshift(b)}N(xa)}}if(!(0<K)){if(e.preRun)for("function"==typeof e.preRun&&(e.preRun=[e.preRun]);e.preRun.length;)ya();N(ua);0<K||(e.setStatus?(e.setStatus("Running..."),setTimeout(function(){setTimeout(function(){e.setStatus("")},1);a()},1)):a())}}
  e.run=mb;if(e.preInit)for("function"==typeof e.preInit&&(e.preInit=[e.preInit]);0<e.preInit.length;)e.preInit.pop()();noExitRuntime=!0;mb();
  
  
    return Module.ready
  }
  );
  })();