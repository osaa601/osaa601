#!/usr/bin/env python3
"""Build a dependency-free bilingual portfolio from editable content.json."""
from pathlib import Path
import html, json, shutil, hashlib, base64
from urllib.parse import quote, urlparse

HERE = Path(__file__).resolve().parent
OUT = HERE / 'public'
DATA = json.loads((HERE / 'content.json').read_text())
ICONS = json.loads((HERE / 'assets/icons.json').read_text())

def esc(value): return html.escape(str(value), quote=True)
def icon(name): return f'<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#icon-{esc(name)}"></use></svg>'
def home_path(lang): return 'ar/' if lang == 'ar' else ''
def project_path(lang, slug): return home_path(lang) + 'work/' + slug + '/'
def booking_url():
    url=DATA.get('booking_url','');parsed=urlparse(url)
    return url if parsed.scheme=='https' and parsed.hostname in ('calendar.app.google','calendar.google.com') else ''
def root_prefix(route): return '../' * len([p for p in route.split('/') if p]) or './'

def desktop_source(lang, route, body):
    t=DATA[lang];other='ar' if lang=='en' else 'en'
    alt_route=home_path(other)+route.removeprefix(home_path(lang))
    initial=route.split('work/',1)[1].strip('/') if 'work/' in route else ''
    return f'''<div class="os-preferences-source" hidden><a class="language-switch" href="/{esc(alt_route)}" lang="{other}" hreflang="{other}">{'EN' if lang=='ar' else 'العربية'}</a><button class="theme-button" type="button" aria-label="{esc(t['theme_switch'])}" aria-pressed="false" data-light="{esc(t['theme_light'])}" data-dark="{esc(t['theme_dark'])}"><span class="theme-glyph" aria-hidden="true">◐</span><span data-theme-label>{esc(t['theme_dark'])}</span></button></div><main id="main" data-initial-project="{esc(initial)}" hidden>{body}</main>'''

def shell(lang, route, title, description, body, detail=False):
    t = DATA[lang]
    root = root_prefix(route)
    home = root + home_path(lang)
    other = 'ar' if lang == 'en' else 'en'
    alt_route = home_path(other) + route.removeprefix(home_path(lang))
    if route in ('', 'ar/'): alt_route = home_path(other)
    canonical = DATA['domain'] + '/' + route
    desktop = 'class="hero wrap"' in body
    initial = route.split('work/',1)[1].strip('/') if 'work/' in route else ''
    sprite = '<svg class="icon-definitions" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">' + ''.join(f'<symbol id="icon-{esc(name)}" viewBox="0 0 24 24">{paths}</symbol>' for name,paths in ICONS.items()) + '</svg>'
    person = {'@context':'https://schema.org','@type':'Person','name':DATA['name'],
              'alternateName':DATA['handle'],'url':DATA['domain'],
              'jobTitle':'Information Security Engineer','sameAs':[url for name,url in DATA['socials'].items() if name!='Website']}
    nav = ''.join(f'<a href="{esc(home)}#{anchor}">{esc(label)}</a>' for anchor,label in zip(['about','services','work','creative','contact'],t['nav']))
    localized=''
    if desktop:
        project=next((p for p in DATA['projects'] if p['slug']==initial),None)
        for locale in (lang,other):
            page_title=project['title'][locale]+' · Osaa601' if project else DATA[locale]['title']
            page_description=project['summary'][locale] if project else DATA[locale]['description']
            page_route=project_path(locale,initial) if project else home_path(locale)
            source='' if locale==lang else home_page_source(locale,project)
            localized+=f'<template data-desktop-language="{locale}" data-route="/{esc(page_route)}" data-title="{esc(page_title)}" data-description="{esc(page_description)}" data-skip="{esc(DATA[locale]["skip"])}">{source}</template>'
    source=desktop_source(lang,route,body) if desktop else f'<div class="os-preferences-source" hidden><a class="language-switch" href="{esc(root+alt_route)}" lang="{other}" hreflang="{other}">{"EN" if lang=="ar" else "العربية"}</a></div><main id="main" class="os-error-window">{body}</main>'
    return f'''<!doctype html>
<html lang="{lang}" dir="{'rtl' if lang == 'ar' else 'ltr'}" data-theme="light">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title><meta name="description" content="{esc(description)}">
<meta name="theme-color" content="#f2f3fc"><meta name="color-scheme" content="light dark">
<link rel="canonical" href="{esc(canonical)}">
<link rel="alternate" hreflang="en" href="{DATA['domain']}/{route.removeprefix('ar/')}">
<link rel="alternate" hreflang="ar" href="{DATA['domain']}/ar/{route.removeprefix('ar/')}">
<link rel="alternate" hreflang="x-default" href="{DATA['domain']}/{route.removeprefix('ar/')}">
<meta property="og:type" content="{'article' if detail else 'website'}"><meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(description)}"><meta property="og:url" content="{esc(canonical)}">
<meta property="og:site_name" content="Osaa601"><meta property="og:locale" content="{'ar_LY' if lang == 'ar' else 'en_US'}">
<meta property="og:image" content="{DATA['domain']}/assets/social.jpg"><meta property="og:image:alt" content="{esc(t['art_alt'])}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="{DATA['domain']}/assets/social.jpg"><meta name="twitter:creator" content="@osaa601">
<meta name="twitter:title" content="{esc(title)}"><meta name="twitter:description" content="{esc(description)}">
<link rel="icon" href="{root}assets/favicon.svg" type="image/svg+xml">
<script src="{root}assets/theme-init.js"></script>
<link rel="stylesheet" href="{root}assets/style.css">
<link rel="stylesheet" href="{root}assets/desktop.css">
<script type="application/ld+json">{json.dumps(person,ensure_ascii=False)}</script>
<script src="{root}assets/site.js" defer></script>
<script src="{root}assets/desktop-state.js" defer></script>
<script src="{root}assets/desktop-extras.js" defer></script>
<script src="{root}assets/audio.js" defer></script>
<script src="{root}assets/starfall-engine.js" defer></script>
<script src="{root}assets/starfall-game.js" defer></script>
<script src="{root}assets/desktop.js" defer></script>
</head>
<body class="portfolio-desktop">
{sprite}
<a class="skip-link" href="#main">{esc(t['skip'])}</a>
{source}
{localized}
{'<noscript><section class="os-noscript"><h2>Osaa601</h2><p>Enable JavaScript to open the desktop apps.</p><a class="button primary" href="mailto:'+esc(DATA['email'])+'">'+esc(DATA['email'])+'</a><a class="text-link" href="'+esc(DATA['socials']['Linktree'])+'">Linktree</a></section></noscript>' if desktop else ''}
</body></html>'''

def home(lang, initial_project=None, source_only=False):
    t=DATA[lang]; route=project_path(lang,initial_project['slug']) if initial_project else home_path(lang);root='/';email=DATA['email']
    experience=''.join(f'<li><h4>{esc(a)}</h4><span class="experience-meta">{esc(b)}</span><p>{esc(c)}</p></li>' for a,b,c in t['experience'])
    services=''.join(f'<a class="service service-category" href="#service/{esc(g["slug"])}"><div class="service-icon">{icon(g["icon"])}</div><h3>{esc(g["title"][lang])}</h3><p>{esc(g["intro"][lang])}</p><span class="text-link">{esc(t["service_open"])} {icon("forward")}</span></a>' for g in DATA['service_groups'])
    profile_details='<div class="profile-details">'+''.join(f'<section><h3>{esc(title)}</h3><p>{esc(text)}</p></section>' for title,text in t['profile_sections'])+'</div>'
    profile_details+=f'<section class="profile-tools"><h3>{esc(t["tools_title"])}</h3><div class="profile-tool-grid">'+''.join(f'<div><h4>{esc(title)}</h4><p>{esc(text)}</p></div>' for title,text in t['tool_groups'])+'</div></section>'
    work=''
    for i,p in enumerate(DATA['projects']):
        tags=''.join(f'<span>{esc(tag)}</span>' for tag in p['tags'])
        work+=f'''<article class="project-card"><div class="project-band band-{i}" aria-hidden="true"><span class="project-index">{i+1:02d}</span><span class="project-symbol">{icon(['activity','server','document','game'][i])}</span></div><div class="project-content"><span class="eyebrow">{esc(p['category'][lang])}</span><h3><a href="{root}{project_path(lang,p['slug'])}">{esc(p['title'][lang])}</a></h3><p>{esc(p['summary'][lang])}</p><div class="tags">{tags}</div><span class="project-status">{esc(p['status'][lang])}</span><a class="text-link" href="{root}{project_path(lang,p['slug'])}">{esc(t['read_case'])} {icon('forward')}</a></div></article>'''
    creative=''
    for label,title,text,cta,target in t['creative_blocks']:
        url=(root+project_path(lang,target)) if target=='wedding' else DATA['socials'][target]
        ext='' if target=='wedding' else ' target="_blank" rel="noopener noreferrer"'
        creative+=f'<article class="creative-card"><span class="eyebrow">{esc(label)}</span><h3>{esc(title)}</h3><p>{esc(text)}</p><a class="text-link" href="{esc(url)}"{ext}>{esc(cta)} {icon('external' if ext else 'game')}</a></article>'
    socials=''.join(f'<a class="social-card" href="{esc(url)}" target="_blank" rel="noopener noreferrer">{icon(label)}<span>{esc(label)}</span>{icon("external")}</a>' for label,url in DATA['socials'].items())
    body=f'''
<section class="hero wrap" aria-labelledby="hero-title">
<div class="hero-copy"><div class="os-personal-emblem" aria-hidden="true">{icon('identity')}<span dir="ltr">O601</span></div><span class="eyebrow">{esc(t['hero_label'])}</span><h1 id="hero-title">{esc(DATA['arabic_name'] if lang=='ar' else DATA['name'])}</h1><p class="hero-alias"><span dir="ltr">Osaa601</span><span class="alias-line" aria-hidden="true"></span></p><p class="hero-intro">{esc(t['hero_text'])}</p><div class="identity-focus"><span>{'Cybersecurity' if lang=='en' else 'الأمن السيبراني'}</span><span>{'Networks & systems' if lang=='en' else 'الشبكات والأنظمة'}</span><span>{'Video & stories' if lang=='en' else 'الفيديو والقصص'}</span></div><div class="hero-actions"><a class="button primary" href="#contact">{icon('contact')} {esc(t['hero_contact'])}</a><a class="button secondary" href="#work">{icon('work')} {esc(t['hero_work'])}</a></div><p class="location">{esc(t['hero_location'])}</p></div>
<figure class="hero-art"><div class="art-frame"><img id="hero-art" src="{root}assets/hero-day.webp" data-day="{root}assets/hero-day.webp" data-night="{root}assets/hero-night.webp" alt="" width="1536" height="1024" fetchpriority="high"><div class="art-border" aria-hidden="true"></div></div><figcaption><span class="pixel-star" aria-hidden="true">✦</span>{esc(t['art_caption'])}</figcaption></figure>
</section>
<div class="chapter-ribbon" aria-hidden="true"><div class="wrap"><span>SECURITY</span><span class="ribbon-dot">◆</span><span>GAMES & WORLDS</span><span class="ribbon-dot">◆</span><span>VISUAL STORIES</span><span class="ribbon-dot">◆</span><span>OSAA601</span></div></div>
<section id="about" class="section wrap"><div class="section-heading"><span class="eyebrow">{esc(t['about_label'])}</span><h2>{esc(t['about_title'])}</h2></div><div class="about-grid"><div class="about-copy"><p class="lead">{esc(t['about_intro'])}</p><p>{esc(t['about_body'])}</p><div class="personal-note"><span class="pixel-star" aria-hidden="true">✦</span><p>{esc(t['about_personal'])}</p></div></div><aside class="experience"><h3>{esc(t['experience_title'])}</h3><ol>{experience}</ol></aside></div>{profile_details}</section>
<section id="services" class="section services-section"><div class="wrap"><div class="section-heading"><span class="eyebrow">{esc(t['services_label'])}</span><h2>{esc(t['services_title'])}</h2><p>{esc(t['services_intro'])}</p></div><div class="service-grid">{services}</div><p class="scope-note">{esc(t['services_scope'])}</p></div></section>
<section id="work" class="section wrap"><div class="section-heading"><span class="eyebrow">{esc(t['work_label'])}</span><h2>{esc(t['work_title'])}</h2><p>{esc(t['work_intro'])}</p></div><div class="project-grid">{work}</div></section>
<section id="creative" class="section creative-section"><div class="wrap"><div class="section-heading"><span class="eyebrow">{esc(t['creative_label'])}</span><h2>{esc(t['creative_title'])}</h2><p>{esc(t['creative_intro'])}</p></div><div class="creative-grid">{creative}</div></div></section>
<section id="contact" class="section contact wrap"><span class="eyebrow">{esc(t['contact_label'])}</span><h2>{esc(t['contact_title'])}</h2><p>{esc(t['contact_text'])}</p><div class="contact-actions"><a class="button primary" href="mailto:{esc(email)}?subject={quote('Project inquiry — Osaa601')}">{icon('contact')} {esc(t['email_button'])}</a><a class="button secondary" href="{esc(DATA['socials']['LinkedIn'])}" target="_blank" rel="noopener noreferrer">{icon('LinkedIn')} {esc(t['linkedin_button'])}</a></div><div class="email-row"><a class="email-address" href="mailto:{esc(email)}" dir="ltr">{esc(email)}</a><button class="copy-button" type="button" data-copy-email="{esc(email)}" data-success="{esc(t['copied'])}" data-fallback="{esc(t['copy_failed'])}">{icon('copy')} {esc(t['copy'])}</button><span class="copy-status" role="status" aria-live="polite"></span></div><details class="social-details"><summary>{esc(t['all_links'])}</summary><div class="social-list">{socials}</div></details></section>'''
    body=body.replace('<details class="social-details"><summary>'+esc(t['all_links'])+'</summary><div class="social-list">'+socials+'</div></details>',f'<a class="text-link" href="#links">{icon("links")} {esc(t["all_links"])}</a>')
    body+=f'<section id="links" class="section wrap"><div class="section-heading"><span class="eyebrow">{"AROUND THE INTERNET" if lang=="en" else "حول الإنترنت"}</span><h2>{"Find me around the internet." if lang=="en" else "تجدني في هذه المنصات."}</h2><p>{"My channels, communities, and social profiles." if lang=="en" else "قنواتي ومجتمعاتي وحساباتي على منصات التواصل."}</p></div><div class="social-grid">{socials}</div></section>'
    labels={'security':('Security','الأمن'),'creative':('Creative','الإبداع'),'site':('Desktop','الموقع')};ar=lang=='ar'
    cards=''.join(f'<article class="journal-card" data-note="{esc(n["slug"])}" data-category="{esc(n["category"])}"><span class="eyebrow">{esc(labels[n["category"]][ar])}</span><h3><a href="#note/{esc(n["slug"])}">{esc(n["title"][lang])}</a></h3><p>{esc(n["excerpt"][lang])}</p><div class="journal-card-actions"><a class="text-link" href="#note/{esc(n["slug"])}">{"Read note" if not ar else "اقرأ الملاحظة"} {icon("forward")}</a><button type="button" class="journal-bookmark" data-bookmark="{esc(n["slug"])}" aria-pressed="false">{icon("star")}<span>{"Bookmark" if not ar else "حفظ"}</span></button></div></article>' for n in DATA['journal'])
    filters=''.join(f'<button type="button" data-journal-filter="{key}" aria-pressed="{str(key=="all").lower()}">{en if not ar else arabic}</button>' for key,en,arabic in [('all','All notes','كل الملاحظات'),('security','Security','الأمن'),('creative','Creative','الإبداع'),('site','Desktop','الموقع'),('saved','Bookmarked','المحفوظة')])
    body+=f'<section id="journal" class="section wrap"><div class="section-heading"><span class="eyebrow">{"NOTES FROM MY DESK" if not ar else "ملاحظات من مكتبي"}</span><h2>{"The Osaa601 journal." if not ar else "يوميات Osaa601."}</h2><p>{"Practical security notes, creative ideas, and updates to this little desktop." if not ar else "ملاحظات أمنية عملية وأفكار إبداعية وتحديثات لهذا العالم الصغير."}</p></div><div class="journal-filters">{filters}</div><div class="journal-grid">{cards}</div><p class="journal-empty" hidden>{"No notes in this collection yet." if not ar else "لا توجد ملاحظات في هذه المجموعة بعد."}</p></section>'
    for note in DATA['journal']:
        paragraphs=''.join(f'<p>{esc(p)}</p>' for p in note['paragraphs'][lang])
        body+=f'<template data-note-page="{esc(note["slug"])}" data-title="{esc(note["title"][lang])}"><article class="journal-note"><span class="eyebrow">{esc(labels[note["category"]][ar])}</span><h2>{esc(note["title"][lang])}</h2><div class="note-byline">{esc(DATA["arabic_name"] if ar else DATA["name"])} · Osaa601<button type="button" data-bookmark="{esc(note["slug"])}" aria-pressed="false">{icon("star")}<span>{"Bookmark" if not ar else "حفظ"}</span></button></div><div class="journal-prose">{paragraphs}</div><a class="text-link" href="#{esc(note["related"])}">{"Explore this topic" if not ar else "استكشف هذا الموضوع"} {icon("forward")}</a></article></template>'
    book=booking_url();subject='Consultation request' if not ar else 'طلب استشارة';message='Topic:\nWhat I need:\nPreferred dates/times:\nTimezone:\n' if not ar else 'الموضوع:\nما أحتاج إليه:\nالتواريخ والأوقات المناسبة:\nالمنطقة الزمنية:\n'
    book_href=book or f'mailto:{email}?subject={quote(subject)}&body={quote(message)}'
    book_markup=f'<section class="consultation-card">{icon("contact")}<div><h3>{"Let’s talk about your project." if not ar else "لنتحدث عن مشروعك."}</h3><p>{("Choose a time for a consultation." if book else "Tell me what you need and which times suit you.") if not ar else ("اختر وقتاً للاستشارة." if book else "أخبرني بما تحتاج إليه والأوقات المناسبة لك.")}</p><a class="button primary consultation-booking" href="{esc(book_href)}"'+(' target="_blank" rel="noopener noreferrer"' if book else '')+f'>{("Book a consultation" if book else "Request a consultation") if not ar else ("احجز استشارة" if book else "اطلب استشارة")}</a></div></section>'
    body=body.replace('<a class="text-link" href="#links">'+icon('links')+' '+esc(t['all_links'])+'</a></section>', '<a class="text-link" href="#links">'+icon('links')+' '+esc(t['all_links'])+'</a>'+book_markup+'</section>')
    # Project overviews share the Projects window and its local history.
    for p in DATA['projects']:
        case_body=case_markup(lang,p)
        case_body=case_body.replace('<h1>','<h2>').replace('</h1>','</h2>')
        body+=f'<template data-case="{esc(p["slug"])}" data-title="{esc(p["title"][lang])}">{case_body}</template>'
    for g in DATA['service_groups']:
        body+=f'<template data-service="{esc(g["slug"])}" data-title="{esc(g["title"][lang])}">{service_markup(lang,g)}</template>'
    title=initial_project['title'][lang]+' · Osaa601' if initial_project else t['title']
    description=initial_project['summary'][lang] if initial_project else t['description']
    if source_only:return desktop_source(lang,route,body)
    return shell(lang,route,title,description,body,bool(initial_project))

def home_page_source(lang,project=None):return home(lang,project,source_only=True)

def service_markup(lang,g):
    t=DATA[lang]
    offers=''.join(f'<article class="service-offer"><h3>{esc(o["title"][lang])}</h3><p>{esc(o["description"][lang])}</p></article>' for o in g['offers'])
    deliverables=''.join(f'<li>{esc(item)}</li>' for item in g['deliverables'][lang])
    starting=''.join(f'<li>{esc(item)}</li>' for item in g['starting'][lang])
    subject=quote('Service inquiry: '+g['title'][lang]+' — Osaa601')
    return f'''<section class="service-detail"><a class="text-link" href="#services">{icon('back')} {esc(t['service_back'])}</a><span class="eyebrow">{esc(t['services_label'])}</span><h2>{icon(g['icon'])} {esc(g['title'][lang])}</h2><p class="lead">{esc(g['intro'][lang])}</p><p>{esc(g['fit'][lang])}</p><h3 class="service-list-title">{esc(t['service_includes'])}</h3><div class="service-offer-grid">{offers}</div><div class="service-delivery-grid"><section><h3>{esc(t['service_deliverables'])}</h3><ul>{deliverables}</ul></section><section><h3>{esc(t['service_starting'])}</h3><ul>{starting}</ul></section></div><p class="scope-note">{esc(t['services_scope'])}</p><a class="button primary" href="mailto:{esc(DATA['email'])}?subject={subject}">{icon('contact')} {esc(t['service_contact'])}</a></section>'''

def case_markup(lang,p):
    route=project_path(lang,p['slug']);root='/';t=DATA[lang]
    bullets=''.join(f'<li>{esc(x)}</li>' for x in p['focus'][lang])
    tags=''.join(f'<span>{esc(tag)}</span>' for tag in p['tags'])
    body=f'''<article class="case-study wrap"><a class="back-link" href="{root}{home_path(lang)}#work">{esc(t['back'])}</a><header class="case-header"><span class="eyebrow">{esc(p['category'][lang])}</span><h1>{esc(p['title'][lang])}</h1><p class="lead">{esc(p['summary'][lang])}</p><div class="tags">{tags}</div><p class="case-stage">{esc(p['status'][lang])}</p></header><div class="case-layout"><div><section><h2>{esc(t['overview'])}</h2><p>{esc(p['overview'][lang])}</p></section><section><h2>{esc(t['focus'])}</h2><ul class="case-list">{bullets}</ul></section></div><aside class="stage-panel"><span class="eyebrow">{esc(t['stage'])}</span><p>{esc(p['stage_detail'][lang])}</p><a class="button secondary" href="{root}{home_path(lang)}#contact">{esc(t['discuss'])}</a></aside></div></article>'''
    return body

def project(lang,p): return home(lang,p)

def write(route,text):
    file=OUT/route/'index.html';file.parent.mkdir(parents=True,exist_ok=True);file.write_text(text)

def build():
    if OUT.exists(): shutil.rmtree(OUT)
    OUT.mkdir(exist_ok=True)
    shutil.copytree(HERE/'assets',OUT/'assets',dirs_exist_ok=True)
    routes=[]
    for lang in ['en','ar']:
        write(home_path(lang),home(lang));routes.append(home_path(lang))
        for p in DATA['projects']:
            route=project_path(lang,p['slug']);write(route,project(lang,p));routes.append(route)
    t=DATA['en']
    not_found=shell('en','',t['not_found']+' · Osaa601',t['not_found_body'],f'<section class="not-found wrap"><span class="eyebrow">404 / UNEXPLORED PATH</span><h1>{esc(t["not_found"])}</h1><p>{esc(t["not_found_body"])}</p><a class="button primary" href="/">{esc(t["home"])}</a></section>')
    not_found=not_found.replace('href="./','href="/').replace('src="./','src="/')
    not_found=not_found.replace('<head>','<head>\n<meta name="robots" content="noindex">')
    (OUT/'404.html').write_text(not_found)
    urls=''.join(f'<url><loc>{DATA["domain"]}/{route}</loc></url>' for route in routes)
    (OUT/'sitemap.xml').write_text(f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{urls}</urlset>')
    (OUT/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: '+DATA['domain']+'/sitemap.xml\n')
    for name in ['_headers','_redirects']:
        shutil.copyfile(HERE/name,OUT/name)
    # Permit only the exact structured-data payload, not arbitrary inline scripts.
    person={'@context':'https://schema.org','@type':'Person','name':DATA['name'],
            'alternateName':DATA['handle'],'url':DATA['domain'],
            'jobTitle':'Information Security Engineer','sameAs':[url for name,url in DATA['socials'].items() if name!='Website']}
    digest=base64.b64encode(hashlib.sha256(json.dumps(person,ensure_ascii=False).encode()).digest()).decode()
    headers=(OUT/'_headers').read_text().replace("script-src 'self'",f"script-src 'self' 'sha256-{digest}'")
    (OUT/'_headers').write_text(headers)
    print(f'Built {len(routes)} pages, 404, sitemap, and static assets in {OUT}')

if __name__=='__main__': build()
