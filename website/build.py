#!/usr/bin/env python3
"""Build a dependency-free bilingual portfolio from editable content.json."""
from pathlib import Path
import html, json, shutil, hashlib, base64
from urllib.parse import quote, urlparse
from premium import Premium, safe_url

HERE = Path(__file__).resolve().parent
OUT = HERE / 'public'
DATA = json.loads((HERE / 'content.json').read_text())
ICONS = json.loads((HERE / 'assets/icons.json').read_text())

def esc(value): return html.escape(str(value), quote=True)
def icon(name): return f'<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#icon-{esc(name)}"></use></svg>'
PREMIUM = Premium(DATA,icon)

def home_path(lang): return 'ar/' if lang == 'ar' else ''
def project_path(lang, slug): return home_path(lang) + 'work/' + slug + '/'
def booking_url():
    url=DATA.get('booking_url','');url=url if isinstance(url,str) else '';
    try:parsed=urlparse(url)
    except ValueError:return ''
    return url if parsed.scheme=='https' and parsed.hostname in ('calendar.app.google','calendar.google.com') and not parsed.username and not parsed.password and not any(ord(c)<32 for c in url) else ''
def root_prefix(route): return '../' * len([p for p in route.split('/') if p]) or './'

def desktop_source(lang, route, body, screen=""):
    t=DATA[lang];other='ar' if lang=='en' else 'en'
    alt_route=home_path(other)+route.removeprefix(home_path(lang))
    initial=route.split('work/',1)[1].strip('/') if 'work/' in route else ''
    return f'''<div class="os-preferences-source" hidden><a class="language-switch" href="/{esc(alt_route)}" lang="{other}" hreflang="{other}">{'EN' if lang=='ar' else 'العربية'}</a><button class="theme-button" type="button" aria-label="{esc(t['theme_switch'])}" aria-pressed="false" data-light="{esc(t['theme_light'])}" data-dark="{esc(t['theme_dark'])}"><span class="theme-glyph" aria-hidden="true">◐</span><span data-theme-label>{esc(t['theme_dark'])}</span></button></div><main id="main" data-initial-project="{esc(initial)}" data-initial-screen="{esc(screen)}" hidden>{body}</main>'''

def shell(lang, route, title, description, body, detail=False, screen="profile"):
    t = DATA[lang]
    root = root_prefix(route)
    home_link = root + home_path(lang)
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
    nav = ''.join(f'<a href="{esc(home_link)}#{anchor}">{esc(label)}</a>' for anchor,label in zip(['about','services','work','creative','contact'],t['nav']))
    localized=''
    if desktop:
        project=next((p for p in DATA['projects'] if p['slug']==initial),None)
        for locale in (lang,other):
            meta=PREMIUM.metadata(locale).get(screen,PREMIUM.metadata(locale)['profile'])
            page_title=meta['title'];page_description=meta['description'];page_route=meta['route'].lstrip('/')
            source='' if locale==lang else home(locale,project,source_only=True,initial_screen=screen,route_override=page_route)
            localized+=f'<template data-desktop-language="{locale}" data-route="/{esc(page_route)}" data-title="{esc(page_title)}" data-description="{esc(page_description)}" data-skip="{esc(DATA[locale]["skip"])}">{source}</template>'
    source=desktop_source(lang,route,body,screen if screen!='profile' else '') if desktop else f'<div class="os-preferences-source" hidden><a class="language-switch" href="{esc(root+alt_route)}" lang="{other}" hreflang="{other}">{"EN" if lang=="ar" else "العربية"}</a></div><main id="main" class="os-error-window">{body}</main>'
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
<link rel="stylesheet" href="{root}assets/premium.css">
<script type="application/ld+json">{PREMIUM.schema(lang,screen)}</script>
<script src="{root}assets/site.js" defer></script>
<script src="{root}assets/desktop-state.js" defer></script>
<script src="{root}assets/desktop-extras.js" defer></script>
<script src="{root}assets/premium-ui.js" defer></script>
<script src="{root}assets/audio.js" defer></script>
<script src="{root}assets/starfall-engine.js" defer></script>
<script src="{root}assets/starfall-game.js" defer></script>
<script src="{root}assets/desktop.js" defer></script>
</head>
<body class="portfolio-desktop">
{sprite}
<a class="skip-link" href="#professional-info">{esc(t['skip'])}</a>
{source}
{PREMIUM.fallback(lang,screen).replace('class="os-rescue"','id="professional-info" class="os-rescue"') if desktop else ""}
{localized}

</body></html>'''

def home(lang, initial_project=None, source_only=False, initial_screen=None, route_override=None):
    t=DATA[lang];screen=initial_screen or ('project/'+initial_project['slug'] if initial_project else 'profile');route=route_override if route_override is not None else project_path(lang,initial_project['slug']) if initial_project else home_path(lang);root='/';email=DATA['email']
    experience=''.join(f'<li><h4>{esc(a)}</h4><span class="experience-meta">{esc(b)}</span><p>{esc(c)}</p></li>' for a,b,c in t['experience'])
    services=''.join(f'<a class="service service-category" href="#service/{esc(g["slug"])}"><div class="service-icon">{icon(g["icon"])}</div><h3>{esc(g["title"][lang])}</h3><p>{esc(g["intro"][lang])}</p><span class="text-link">{esc(t["service_open"])} {icon("forward")}</span></a>' for g in DATA['service_groups'])
    profile_details='<div class="profile-details">'+''.join(f'<section><h3>{esc(title)}</h3><p>{esc(text)}</p></section>' for title,text in t['profile_sections'])+'</div>'
    profile_details+=f'<section class="profile-tools"><h3>{esc(t["tools_title"])}</h3><div class="profile-tool-grid">'+''.join(f'<div><h4>{esc(title)}</h4><p>{esc(text)}</p></div>' for title,text in t['tool_groups'])+'</div></section>'
    work=''
    for i,p in enumerate(DATA['projects']):
        tags=''.join(f'<span>{esc(tag)}</span>' for tag in p['tags'])
        work+=f'''<article class="project-card" data-project-kind="{esc(p["kind"])}"><div class="project-band band-{i}" aria-hidden="true"><span class="project-index">{i+1:02d}</span><span class="project-symbol">{icon(['activity','server','document','game'][i%4])}</span></div><div class="project-content"><span class="eyebrow">{esc(p['category'][lang])}</span><h3><a href="{root}{project_path(lang,p['slug'])}">{esc(p['title'][lang])}</a></h3><p>{esc(p['summary'][lang])}</p><div class="tags">{tags}</div><span class="project-status">{esc(p['status'][lang])}</span><a class="text-link" href="{root}{project_path(lang,p['slug'])}">{esc(t['read_case'])} {icon('forward')}</a></div></article>'''
    creative=''
    for label,title,text,cta,target in t['creative_blocks']:
        url=(root+project_path(lang,target)) if target=='wedding' else DATA['socials'][target]
        ext='' if target=='wedding' else ' target="_blank" rel="noopener noreferrer"'
        creative+=f'<article class="creative-card"><span class="eyebrow">{esc(label)}</span><h3>{esc(title)}</h3><p>{esc(text)}</p><a class="text-link" href="{esc(url)}"{ext}>{esc(cta)} {icon('external' if ext else 'game')}</a></article>'
    socials=''.join(f'<a class="social-card" href="{esc(url)}" target="_blank" rel="noopener noreferrer">{icon(label)}<span>{esc(label)}</span>{icon("external")}</a>' for label,url in DATA['socials'].items())
    body=f'''
<section class="hero wrap" aria-labelledby="hero-title">
<div class="hero-copy"><div class="os-personal-emblem" aria-hidden="true">{icon('identity')}<span dir="ltr">O601</span></div><span class="eyebrow">{esc(t['hero_label'])}</span><h1 id="hero-title">{esc(DATA['arabic_name'] if lang=='ar' else DATA['name'])}</h1><p class="hero-alias"><span dir="ltr">Osaa601</span><span class="alias-line" aria-hidden="true"></span></p><p class="hero-intro">{esc(t['hero_text'])}</p><div class="identity-focus"><span>{'Cybersecurity' if lang=='en' else 'الأمن السيبراني'}</span><span>{'Networks & systems' if lang=='en' else 'الشبكات والأنظمة'}</span><span>{'Video & stories' if lang=='en' else 'الفيديو والقصص'}</span></div><div class="hero-actions"><a class="button primary" href="#services">{icon('contact')} {esc(t['hero_contact'])}</a><a class="button secondary" href="#work">{icon('work')} {esc(t['hero_work'])}</a></div><p class="location">{esc(t['hero_location'])}</p></div>
<figure class="hero-art"><div class="art-frame"><img id="hero-art" src="{root}assets/hero-day.webp" data-day="{root}assets/hero-day.webp" data-night="{root}assets/hero-night.webp" alt="" width="1536" height="1024" fetchpriority="high"><div class="art-border" aria-hidden="true"></div></div><figcaption><span class="pixel-star" aria-hidden="true">✦</span>{esc(t['art_caption'])}</figcaption></figure>
</section>
<div class="chapter-ribbon" aria-hidden="true"><div class="wrap"><span>SECURITY</span><span class="ribbon-dot">◆</span><span>GAMES & WORLDS</span><span class="ribbon-dot">◆</span><span>VISUAL STORIES</span><span class="ribbon-dot">◆</span><span>OSAA601</span></div></div>
<section id="about" class="section wrap"><div class="section-heading"><span class="eyebrow">{esc(t['about_label'])}</span><h2>{esc(t['about_title'])}</h2></div><div class="about-grid"><div class="about-copy"><p class="lead">{esc(t['about_intro'])}</p><p>{esc(t['about_body'])}</p><div class="personal-note"><span class="pixel-star" aria-hidden="true">✦</span><p>{esc(t['about_personal'])}</p></div></div><aside class="experience"><h3>{esc(t['experience_title'])}</h3><ol>{experience}</ol></aside></div>{profile_details}</section>
<section id="services" class="section services-section"><div class="wrap"><div class="section-heading"><span class="eyebrow">{esc(t['services_label'])}</span><h2>{esc(t['services_title'])}</h2><p>{esc(t['services_intro'])}</p></div>{PREMIUM.catalog(lang)}<p class="scope-note">{esc(t['services_scope'])}</p></div></section>
<section id="work" class="section wrap"><div class="section-heading"><span class="eyebrow">{esc(t['work_label'])}</span><h2>{esc(t['work_title'])}</h2><p>{esc(t['work_intro'])}</p></div><div class="project-filters"><button type="button" data-project-filter="all" aria-pressed="true">{'All work' if lang=='en' else 'كل الأعمال'}</button><button type="button" data-project-filter="professional" aria-pressed="false">{'Professional' if lang=='en' else 'مهني'}</button><button type="button" data-project-filter="academic" aria-pressed="false">{'Academic' if lang=='en' else 'أكاديمي'}</button><button type="button" data-project-filter="experiment" aria-pressed="false">{'Experiments' if lang=='en' else 'تجارب'}</button></div><div class="project-grid">{work}</div><p class="scope-note"><a href="#creative">{'Explore media & creative work in Studio' if lang=='en' else 'استكشف الإنتاج المرئي والإبداع في الاستوديو'}</a></p></section>
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
    body=body.replace('<div class="creative-grid">'+creative+'</div>', '<div class="creative-grid">'+creative+'</div>'+PREMIUM.media(DATA.get('studio_media',[]),lang)+f'<section class="studio-direction"><h3>{"Footage → story → final cut" if lang=="en" else "اللقطات ← القصة ← النسخة النهائية"}</h3><p>{"Bring a clear brief and footage you can share. We agree the edit, review rounds, captions, formats, and handover. Specialist motion graphics or VFX are scoped only against demonstrated samples." if lang=="en" else "أحضر موجزاً واضحاً ولقطات يمكن مشاركتها. نتفق على المونتاج وجولات المراجعة والترجمة والصيغ والتسليم. تُحدد المؤثرات البصرية والموشن المتخصصة وفق عينات مثبتة."}</p><a class="button primary" href="#service/video-media">{"Explore production services" if lang=="en" else "استكشف خدمات الإنتاج"}</a><a class="text-link" href="#journeys">{"The next chapter: Adventures" if lang=="en" else "الفصل التالي: المغامرات"}</a></section>')
    body=body.replace(book_markup,PREMIUM.inquiries(lang)+book_markup)
    featured=DATA['projects'][1] if len(DATA['projects'])>1 else DATA['projects'][0]
    note=DATA['journal'][0]
    body+=PREMIUM.journeys(lang)+f'<section id="profile-brief" class="desk-brief"><span class="eyebrow">{"INSIDE THIS DESKTOP" if lang=="en" else "داخل سطح المكتب"}</span><div><a href="#project/{esc(featured["slug"])}"><small>{"FEATURED PROJECT" if lang=="en" else "مشروع مختار"}</small><strong>{esc(featured["title"][lang])}</strong>{icon("forward")}</a><a href="#note/{esc(note["slug"])}"><small>{"FROM THE JOURNAL" if lang=="en" else "من اليوميات"}</small><strong>{esc(note["title"][lang])}</strong>{icon("journal")}</a><a href="#journeys"><small>{"FUTURE JOURNEYS" if lang=="en" else "رحلات مستقبلية"}</small><strong>{"Stories beyond the screen" if lang=="en" else "قصص تتجاوز الشاشة"}</strong>{icon("journeys")}</a></div></section>'+PREMIUM.meta_templates(lang)
    # Project overviews share the Projects window and its local history.
    for p in DATA['projects']:
        case_body=case_markup(lang,p)
        case_body=case_body.replace('<h1','<h2').replace('</h1>','</h2>')
        body+=f'<template data-case="{esc(p["slug"])}" data-title="{esc(p["title"][lang])}">{case_body}</template>'
    for g in DATA['service_groups']:
        body+=f'<template data-service="{esc(g["slug"])}" data-title="{esc(g["title"][lang])}">{service_markup(lang,g)}</template>'
    meta=PREMIUM.metadata(lang).get(screen,PREMIUM.metadata(lang)['profile']);title=meta['title'];description=meta['description']
    if source_only:return desktop_source(lang,route,body,screen)+PREMIUM.fallback(lang,screen).replace('class="os-rescue"','id="professional-info" class="os-rescue"')
    return shell(lang,route,title,description,body,bool(initial_project),screen)

def home_page_source(lang,project=None):return home(lang,project,source_only=True)

def service_markup(lang,g):return PREMIUM.service_detail(lang,g)
def case_markup(lang,p):return PREMIUM.case(lang,p)

def project(lang,p): return home(lang,p)

def write(route,text):
    file=OUT/route/'index.html';file.parent.mkdir(parents=True,exist_ok=True);file.write_text(text)

def build():
    import re
    if not re.fullmatch(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}',DATA['email']):raise ValueError('Invalid business email')
    safe_url(DATA['domain'])
    for collection in ['projects','service_groups','journal']:
        seen=set()
        for entry in DATA[collection]:
            if not re.fullmatch(r'[a-z0-9-]{1,80}',entry['slug']) or entry['slug'] in seen:raise ValueError('Invalid or duplicate '+collection+' slug')
            seen.add(entry['slug'])
    for group in DATA['commercial_groups']:
        if not set(group['services']).issubset({g['slug'] for g in DATA['service_groups']}):raise ValueError('Unknown commercial service')
    media_lists=[DATA.get('studio_media',[]),DATA['journeys'].get('episodes',[]),DATA['journeys'].get('gallery',[])]+[p.get('media',[]) for p in DATA['projects']]
    for items in media_lists:
        for item in items:
            if item.get('image'):
                image=safe_url(item['image'],True)
                if not (HERE/image.lstrip('/')).is_file():raise ValueError('Missing media image: '+image)
            if item.get('url'):safe_url(item['url'])
    if OUT.exists(): shutil.rmtree(OUT)
    OUT.mkdir(exist_ok=True)
    shutil.copytree(HERE/'assets',OUT/'assets',dirs_exist_ok=True)
    routes=[]
    for lang in ['en','ar']:
        for screen,meta in PREMIUM.metadata(lang).items():
            route=meta['route'].lstrip('/')
            case=next((p for p in DATA['projects'] if screen=='project/'+p['slug']),None)
            write(route,home(lang,case,initial_screen=screen,route_override=route));routes.append(route)
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
    # Hash each exact page's JSON-LD: no unsafe-inline exception.
    import re
    hashes=set()
    for page in OUT.rglob('*.html'):
        for payload in re.findall(r'<script type="application/ld\+json">(.*?)</script>',page.read_text(),re.S):
            hashes.add("'sha256-"+base64.b64encode(hashlib.sha256(payload.encode()).digest()).decode()+"'")
    headers=(OUT/'_headers').read_text().replace("script-src 'self'","script-src 'self' "+' '.join(sorted(hashes)))
    if any(len(line)>2000 for line in headers.splitlines()):raise ValueError('Cloudflare header line exceeds 2000 characters')
    (OUT/'_headers').write_text(headers)
    print(f'Built {len(routes)} pages, 404, sitemap, and static assets in {OUT}')

if __name__=='__main__': build()
