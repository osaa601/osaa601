const assert=require('assert/strict');
const {Archive,normalize}=require('../assets/desktop-extras.js'),State=require('../assets/desktop-state.js');
const saved=new Map(),storage={getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)};
const archive=new Archive(storage);assert(!archive.wallpaper('purple'));assert(!archive.wallpaper('starlight'));
for(const id of ['profile','services','work'])assert(archive.collect(id));assert(!archive.collect('profile'));assert(!archive.collect('unknown'));assert(archive.wallpaper('blue'));
assert(!archive.wallpaper('purple'));archive.collect('creative');archive.collect('journal');assert(archive.wallpaper('purple'));archive.bookmark('clear-security-reports');archive.finish();assert(archive.wallpaper('starlight'));
const restored=new Archive(storage);assert.deepEqual(restored.state,archive.state);restored.bookmark('clear-security-reports');assert.equal(restored.state.favorites.length,0);
saved.set('osaa601-archive','{"seals":["x"],"favorites":[4,"../secret","valid"],"wallpaper":"purple"}');const sanitized=new Archive(storage);assert.deepEqual(sanitized.state.seals,[]);assert.deepEqual(sanitized.state.favorites,['valid']);assert.equal(sanitized.state.wallpaper,'fantasy');
const blocked=new Archive({getItem(){throw Error();},setItem(){throw Error();}});blocked.collect('profile');assert.equal(blocked.state.seals.length,1);
assert.equal(normalize('الأَمْن السِّيبراني'),'الامن السيبراني');assert.equal(normalize('  Royal  BLUE  '),'royal blue');
for(const width of [320,700,768,1024,1280,1920,2560]){const device=State.deviceForWidth(width),height=565;const b=State.bounds(device,width,height,{x:9999,y:9999,width:9999,height:9999});assert(b.width<=width);assert(b.height<=height);assert(b.x>=0&&b.x+b.width<=width);assert(b.y>=0&&b.y+b.height<=height);if(device!=='mobile'){const left=State.snap(device,width,height,'left'),right=State.snap(device,width,height,'right');assert(left.x+left.width<right.x);assert(right.x+right.width<=width);const upper=State.snap(device,width,height,'upper'),lower=State.snap(device,width,height,'lower');assert(upper.y+upper.height<lower.y);assert(lower.y+lower.height<=height);}}
console.log('PASS archive persistence, reward locks, bookmarks, blocked/corrupt storage, bilingual search normalization, and clamped/snap geometry.');
