"""Static release checks. Run after build.py; standard library only."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import sys, json, hashlib, base64, copy
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
import build
from premium import safe_url, Premium

class Page(HTMLParser):
    def __init__(self,text):
        super().__init__();self.tags=[];self.feed(text)
    def handle_starttag(self,tag,attrs):self.tags.append((tag,dict(attrs)))

out=ROOT/'public';headers=(out/'_headers').read_text()
assert 'unsafe-inline' not in headers and 'unsafe-eval' not in headers
assert all(len(line)<=2000 for line in headers.splitlines())
count=0
for lang in ['en','ar']:
    for screen,meta in build.PREMIUM.metadata(lang).items():
        path=out/meta['route'].lstrip('/')/'index.html';text=path.read_text();p=Page(text)
        html=next(a for t,a in p.tags if t=='html')
        assert html['lang']==lang and html['dir']==('rtl' if lang=='ar' else 'ltr')
        assert any(t=='link' and a.get('rel')=='canonical' and a['href']==build.DATA['domain']+meta['route'] for t,a in p.tags)
        assert len([a for t,a in p.tags if t=='link' and a.get('hreflang') in ['en','ar']])==2
        assert any(t=='meta' and a.get('name')=='description' and a['content']==meta['description'] for t,a in p.tags)
        assert any(t=='meta' and a.get('property')=='og:image' for t,a in p.tags)
        assert 'class="os-rescue"' in text and 'mailto:osaa@osaa601.com' in text
        assert 'id="professional-info"' in text
        import re
        rescue=build.PREMIUM.fallback(lang,screen)
        assert 'href="#service/' not in rescue and 'href="#project/' not in rescue
        for tag,a in p.tags:
            if tag=='script':
                assert a.get('src') or a.get('type')=='application/ld+json', (path,a)
            for key in ['src','href']:
                value=a.get(key,'');u=urlsplit(value)
                if not value or value.startswith('#') or u.scheme:continue
                target=(out/u.path.lstrip('/')) if value.startswith('/') else path.parent/unquote(u.path)
                target=target.resolve()
                assert target.is_relative_to(out.resolve()),(path,value)
                assert target.exists(),(path,value)
        for payload in re.findall(r'<script type="application/ld\+json">(.*?)</script>',text,re.S):
            graph=json.loads(payload);assert graph['@context']=='https://schema.org'
            digest=base64.b64encode(hashlib.sha256(payload.encode()).digest()).decode()
            assert "'sha256-"+digest+"'" in headers
            assert all('aggregateRating' not in item and 'award' not in item for item in graph['@graph'])
        ids={a['id'] for t,a in p.tags if a.get('id')}
        for t,a in p.tags:
            if t=='use' and a.get('href','').startswith('#'):assert a['href'][1:] in ids
        count+=1
assert count==42
assert '<meta name="robots" content="noindex">' in (out/'404.html').read_text()
assert (out/'sitemap.xml').read_text().count('<url>')==42
for bad in ['javascript:alert(1)','http://example.com','https://user:secret@example.com','https://example.com\n','//example.com']:
    try:safe_url(bad)
    except ValueError:pass
    else:raise AssertionError(bad)
for bad in ['/assets/../content.json','https://example.com/image.jpg','/assets/a%2fb.png']:
    try:safe_url(bad,True)
    except ValueError:pass
    else:raise AssertionError(bad)
assert safe_url('/assets/hero-day.webp',True)=='/assets/hero-day.webp'
old=build.DATA.get('booking_url')
try:
    for bad in ['',None,'https://evil.example/calendar','https://user@calendar.google.com/a','https://[bad','javascript:alert(1)']:
        build.DATA['booking_url']=bad;assert build.booking_url()==''
    for good in ['https://calendar.app.google/test-public-schedule','https://calendar.google.com/calendar/appointments/schedules/test']:
        build.DATA['booking_url']=good;assert build.booking_url()==good
finally:build.DATA['booking_url']=old
sample={'title':{'en':'<script>bad</script>','ar':'<b>bad</b>'},'description':{'en':'"safe" & escaped','ar':'آمن'},'image':'/assets/hero-day.webp','alt':{'en':'" onerror="bad','ar':'آمن'},'url':'https://example.com/original'}
rendered=build.PREMIUM.media([sample],'en')
assert '<script>bad' not in rendered and '&lt;script&gt;' in rendered
assert 'rel="noopener noreferrer"' in rendered and ' onerror="bad' not in rendered
print(f'PASS {count} bilingual routes: metadata, canonical/alternates, native fallback, links/assets, symbols, schema/CSP, sitemap, safe rendering, and booking validation.')
