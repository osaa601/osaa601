let testWidth=1024;
const voids=new Set(['img','meta','link','input','br','hr','source','area','wbr']);
class Element {
 constructor(tag='div',text=''){this.tag=tag;this.text=text;this.attrs={};this.children=[];this.parent=null;this.style={};this.events={};if(tag==='template')this.content=new Element('fragment');}
 get dataset(){return new Proxy({}, {get:(_,k)=>this.attrs['data-'+String(k).replace(/[A-Z]/g,c=>'-'+c.toLowerCase())],set:(_,k,v)=>{this.attrs['data-'+String(k).replace(/[A-Z]/g,c=>'-'+c.toLowerCase())]=String(v);return true;}});}
 get classList(){const e=this;return {contains:c=>e.className.split(/\s+/).includes(c),add(...cs){e.className=[...new Set(e.className.split(/\s+/).filter(Boolean).concat(cs))].join(' ');},remove(...cs){e.className=e.className.split(/\s+/).filter(c=>!cs.includes(c)).join(' ');},toggle(c,force){const has=this.contains(c);const yes=force===undefined?!has:force;if(yes)this.add(c);else this.remove(c);return yes;}};}
 get className(){return this.attrs.class||'';}set className(v){this.attrs.class=v;}
 get id(){return this.attrs.id;}set id(v){this.attrs.id=v;}
 get lang(){return this.attrs.lang;}set lang(v){this.attrs.lang=v;}
 get dir(){return this.attrs.dir;}set dir(v){this.attrs.dir=v;}
 get href(){return this.attrs.href;}set href(v){this.attrs.href=v;}
 get hreflang(){return this.attrs.hreflang;}set hreflang(v){this.attrs.hreflang=v;}
 get target(){return this.attrs.target;}
 get hidden(){return 'hidden'in this.attrs;}set hidden(v){if(v)this.attrs.hidden='';else delete this.attrs.hidden;}
 get textContent(){return this.text+this.children.map(c=>c.textContent).join('');}set textContent(v){this.text=String(v);this.children=[];}
 get clientWidth(){return this.tag==='fragment'?0:testWidth;}get clientHeight(){return this.classList.contains('os-stage')?565:680;}
 setAttribute(k,v){this.attrs[k]=String(v);}getAttribute(k){return this.attrs[k]??null;}
 append(...nodes){for(let n of nodes){if(n==null)continue;if(typeof n==='string')n=new Element('text',n);if(n.tag==='fragment'){this.append(...[...n.children]);continue;}if(n.parent)n.parent.children=n.parent.children.filter(c=>c!==n);n.parent=this;this.children.push(n);}}
 replaceChildren(...nodes){this.children=[];this.text='';this.append(...nodes);}
 replaceWith(n){const p=this.parent,i=p.children.indexOf(this);p.children[i]=n;n.parent=p;this.parent=null;}
 cloneNode(deep){const n=new Element(this.tag,this.text);n.attrs={...this.attrs};if(deep){for(const c of this.children)n.append(c.cloneNode(true));if(this.content)n.content=this.content.cloneNode(true);}return n;}
 set innerHTML(html){this.replaceChildren(...parse(html).children);}
 matches(sel){
  for(const [,inner]of sel.matchAll(/:not\(([^)]+)\)/g))if(this.matches(inner))return false;
  sel=sel.replace(/:not\([^)]+\)/g,'');
  if(sel.includes(','))return sel.split(',').some(s=>this.matches(s.trim()));
  const attrs=[...sel.matchAll(/\[([^=\]]+)(?:=['"]?([^'"\]]+)['"]?)?\]/g)];
  for(const [,k,v]of attrs)if(!(k in this.attrs)||(v!==undefined&&this.attrs[k]!==v))return false;
  sel=sel.replace(/\[[^\]]*\]/g,'');const id=sel.match(/#([\w-]+)/);if(id&&this.id!==id[1])return false;
  for(const [,c]of sel.matchAll(/\.([\w-]+)/g))if(!this.classList.contains(c))return false;
  const tag=sel.match(/^[\w-]+/);return !tag||this.tag===tag[0];
 }
 closest(sel){for(let n=this;n;n=n.parent)if(n.matches(sel))return n;return null;}
 querySelectorAll(sel){
  if(sel.includes(','))return [...new Set(sel.split(',').flatMap(s=>this.querySelectorAll(s.trim())))];
  const parts=sel.split(/\s+/),last=parts.pop(),list=[];
  const visit=n=>{for(const c of n.children){if(c.matches(last)){let a=c.parent,j=parts.length-1;while(a&&j>=0){if(a.matches(parts[j]))j--;a=a.parent;}if(j<0)list.push(c);}visit(c);}};visit(this);return list;
 }
 querySelector(sel){return this.querySelectorAll(sel)[0]||null;}
 remove(){if(this.parent){this.parent.children=this.parent.children.filter(c=>c!==this);this.parent=null;}}
 removeEventListener(type,fn){this.events[type]=(this.events[type]||[]).filter(item=>item!==fn);}
 addEventListener(type,fn){(this.events[type]||=[]).push(fn);}
 dispatchEvent(e){e.target??=this;for(const fn of this.events[e.type]||[])fn(e);if(e.bubbles&&this.parent)this.parent.dispatchEvent(e);return true;}
 click(){this.dispatchEvent({type:'click',target:this,bubbles:true,detail:1,preventDefault(){this.defaultPrevented=true;}});}
 focus(){}setPointerCapture(){}
}
function parse(html){
 const root=new Element('fragment'),stack=[root];
 for(const token of html.match(/<!--[\s\S]*?-->|<[^>]*>|[^<]+/g)||[]){
  if(token.startsWith('<!--'))continue;
  if(token.startsWith('</')){stack.pop();continue;}
  if(token.startsWith('<')){const tag=token.match(/^<([\w-]+)/)?.[1];if(!tag)continue;const n=new Element(tag);for(const [,k,q,v,bare]of token.slice(tag.length+1,-1).matchAll(/([\w:-]+)(?:\s*=\s*(?:(["'])(.*?)\2|([^\s>]+)))?/g))n.attrs[k]=v??bare??'';stack.at(-1).append(n);if(!voids.has(tag)&&!token.endsWith('/>'))stack.push(n.content||n);}
  else stack.at(-1).append(new Element('text',token));
 }
 return root;
}

module.exports={Element,parse,setWidth:width=>{testWidth=width;}};
