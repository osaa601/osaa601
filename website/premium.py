"""Source-backed client journey and static-page rendering. No runtime dependency."""
import html,json,re
from urllib.parse import quote,urlsplit
E=lambda value:html.escape(str(value),quote=True)
def safe_url(value,local=False):
    if not isinstance(value,str) or any(ord(c)<32 for c in value):raise ValueError('Invalid URL')
    u=urlsplit(value)
    if local:
        if re.fullmatch(r'/assets/[A-Za-z0-9_./-]+',value) and '..' not in value:return value
        raise ValueError('Media images must be local /assets/ files')
    if u.scheme=='https' and u.hostname and not u.username and not u.password:return value
    raise ValueError('Use an HTTPS URL or a local /assets/ file')

class Premium:
    def __init__(self,data,icon):self.d=data;self.icon=icon
    def w(self,lang,en,ar):return en if lang=='en' else ar
    def mail(self,lang,topic):
        body=self.w(lang,'Project / organization:\nWhat I need:\nDesired deliverables:\nTimeline and timezone:\nRelevant public links:\n','المشروع / المؤسسة:\nما أحتاج إليه:\nالمخرجات المطلوبة:\nالجدول الزمني والمنطقة الزمنية:\nروابط عامة ذات صلة:\n')
        return 'mailto:'+self.d['email']+'?subject='+quote(topic+' — OSAA601')+'&body='+quote(body)
    def metadata(self,lang):
        home='/'+('ar/' if lang=='ar' else '')
        roots=[('profile','',self.d[lang]['title'],self.d[lang]['description']),('services','services/','Work with me','Three ways to collaborate: cybersecurity and GRC, infrastructure and security operations, and media production.'),('work','projects/','Selected work','Professional responsibilities, academic work, and independent experiments with clear roles and status.'),('creative','studio/','Studio','Video editing, content production, and creative experiments.'),('journal','journal/','Journal','Security notes, creative ideas, and the story behind the OSAA601 desktop.'),('journeys','journeys/','Future Journeys','The future creative direction of OSAA601 Adventures. No completed travel series is claimed.'),('contact','contact/','Contact & consultation','Discuss a scoped remote project or monthly advisory engagement with Osama Waer.')]
        arabic={'services':('اعمل معي','ثلاثة مسارات للتعاون: الأمن السيبراني والحوكمة والبنية التحتية والعمليات الأمنية والإنتاج المرئي.'),'work':('أعمال مختارة','مسؤوليات مهنية وأعمال أكاديمية وتجارب مستقلة مع توضيح الأدوار وحالة كل عمل.'),'creative':('الاستوديو','مونتاج الفيديو وإنتاج المحتوى والتجارب الإبداعية.'),'journal':('اليوميات','ملاحظات أمنية وأفكار إبداعية وقصة سطح مكتب OSAA601.'),'journeys':('رحلات مستقبلية','الرؤية الإبداعية المستقبلية لمغامرات OSAA601 دون ادعاء وجود سلسلة سفر مكتملة.'),'contact':('التواصل والاستشارة','ناقش مشروعاً محدد النطاق عن بُعد أو تعاوناً استشارياً شهرياً مع أسامة واعر.')}
        result={}
        for key,path,title,desc in roots:
            if lang=='ar' and key in arabic:title,desc=arabic[key]
            result[key]={'route':home+path,'title':title if key=='profile' else title+' · OSAA601','description':desc}
        for kind,collection,path in [('project',self.d['projects'],'work/'),('service',self.d['service_groups'],'services/'),('note',self.d['journal'],'journal/')]:
            for item in collection:
                result[kind+'/'+item['slug']]={'route':home+path+item['slug']+'/','title':item['title'][lang]+' · OSAA601','description':item.get('summary',item.get('intro',item.get('excerpt')))[lang]}
        return result
    def meta_templates(self,lang):
        return ''.join(f'<template data-page-meta="{E(key)}" data-route="{E(x["route"])}" data-title="{E(x["title"])}" data-description="{E(x["description"])}"></template>' for key,x in self.metadata(lang).items())
    def remote(self,lang):
        W=lambda en,ar:self.w(lang,en,ar)
        steps=[('Discovery','التعارف','Understand the problem, context, and desired outcome.','فهم المشكلة والسياق والنتيجة المطلوبة.'),('Scope','النطاق','Agree the boundaries, access, and responsibilities.','تحديد الحدود والوصول والمسؤوليات.'),('Proposal','العرض','Confirm deliverables, estimate, review points, and terms.','تأكيد المخرجات والتقدير والمراجعات والشروط.'),('Delivery','التنفيذ','Work through the scope with agreed progress updates.','تنفيذ النطاق مع تحديثات تقدم متفق عليها.'),('Handover','التسليم','Explain the findings, leave usable material, and agree next steps.','شرح النتائج وتسليم مواد قابلة للاستخدام والاتفاق على الخطوات التالية.')]
        flow=''.join(f'<li><span>{i:02d}</span><h4>{W(en,ar)}</h4><p>{W(te,ta)}</p></li>' for i,(en,ar,te,ta) in enumerate(steps,1))
        return f'<section class="remote-engagement"><span class="eyebrow">{W("FROM FIRST MESSAGE TO HANDOVER","من أول رسالة إلى التسليم")}</span><h3>{W("A clear way to work remotely.","مسار واضح للعمل عن بُعد.")}</h3><ol class="engagement-steps">{flow}</ol><div class="engagement-options"><article><h4>{W("A defined project","مشروع محدد")}</h4><p>{W("A bounded review, documentation phase, infrastructure task, or editing brief with agreed outputs.","مراجعة أو مرحلة توثيق أو مهمة بنية تحتية أو موجز مونتاج محدد بمخرجات متفق عليها.")}</p></article><article><h4>{W("Limited monthly advisory","استشارة شهرية محددة")}</h4><p>{W("An agreed number of review sessions, advisory hours, or content deliverables. Capacity and response expectations are confirmed in the proposal; this is not a 24/7 response service.","عدد متفق عليه من جلسات المراجعة أو ساعات الاستشارة أو مخرجات المحتوى. تُحدد القدرة المتاحة وتوقعات الاستجابة في العرض؛ ليست خدمة استجابة على مدار الساعة.")}</p></article></div><p class="scope-note">{W("Timing is an estimate, subject to scope, access, feedback, and scheduling. Fees are proposed after discovery. Outcomes and certification are not guaranteed.","المدة تقديرية وتعتمد على النطاق والوصول والملاحظات وجدولة العمل. تُقترح الأتعاب بعد فهم المتطلبات دون ضمان نتائج أو شهادات.")}</p><a class="button primary" href="{E(self.mail(lang,W('Monthly advisory inquiry','استفسار عن الاستشارة الشهرية')))}">{self.icon('contact')} {W("Discuss an engagement","ناقش التعاون")}</a></section>'
    def catalog(self,lang):
        W=lambda en,ar:self.w(lang,en,ar);groups=[]
        for i,group in enumerate(self.d['commercial_groups'],1):
            cards=[]
            for g in self.d['service_groups']:
                if g['slug'] not in group['services']:continue
                cards.append(f'<a class="service service-category" href="#service/{E(g["slug"])}"><div class="service-icon">{self.icon(g["icon"])}</div><h4>{E(g["title"][lang])}</h4><p>{E(g["problem"][lang])}</p><span class="text-link">{W("Explore scope & deliverables","استكشف النطاق والمخرجات")} {self.icon("forward")}</span></a>')
            groups.append(f'<section class="commercial-group" data-commercial-group="{group["slug"]}"><header><span class="commercial-index">0{i}</span><div><h3>{E(group["title"][lang])}</h3><p>{E(group["summary"][lang])}</p></div>{self.icon(group["icon"])}</header><div class="service-grid">'+''.join(cards)+'</div></section>')
        return '<div class="commercial-catalog">'+''.join(groups)+'</div>'+self.remote(lang)
    def service_detail(self,lang,g):
        W=lambda en,ar:self.w(lang,en,ar)
        offers=''.join(f'<article class="service-offer"><h3>{E(o["title"][lang])}</h3><p>{E(o["description"][lang])}</p></article>' for o in g['offers'])
        sections=''.join(f'<section><h3>{title}</h3><ul>'+''.join(f'<li>{E(x)}</li>' for x in g[field][lang])+'</ul></section>' for field,title in [('deliverables',W('Example deliverables','أمثلة المخرجات')),('starting',W('What we need to start','ما نحتاج إليه للبدء'))])
        return f'<section class="service-detail" itemscope itemtype="https://schema.org/Service"><a class="text-link" href="#services">{self.icon("back")} {W("All services","كل الخدمات")}</a><span class="eyebrow">{W("WORK WITH ME","اعمل معي")}</span><h2>{self.icon(g["icon"])} {E(g["title"][lang])}</h2><p class="lead" itemprop="description">{E(g["problem"][lang])}</p><p>{E(g["intro"][lang])}</p><div class="service-brief"><section><h3>{W("Who it suits","لمن تناسب")}</h3><p>{E(g["fit"][lang])}</p></section><section><h3>{W("Duration · estimate","المدة · تقدير")}</h3><p>{E(g["duration"][lang])}</p></section></div><p>{E(g["engagement"][lang])}</p><div class="scope-cta"><a class="button primary" href="{E(self.mail(lang,g["title"][lang]))}">{self.icon("contact")} {W("Discuss this scope","ناقش هذا النطاق")}</a><a class="text-link" href="#contact">{W("Consultation options","خيارات الاستشارة")}</a></div><h3 class="service-list-title">{W("What I can provide","ما يمكنني تقديمه")}</h3><div class="service-offer-grid">{offers}</div><div class="service-delivery-grid">{sections}</div><p class="scope-note">{E(self.d[lang]['services_scope'])}</p><a class="button primary" href="{E(self.mail(lang,g["title"][lang]))}">{W("Start with a conversation","ابدأ بمحادثة")}</a></section>'
    def media(self,items,lang):
        W=lambda en,ar:self.w(lang,en,ar);cards=[]
        for item in items:
            image=''
            if item.get('image'):image=f'<img src="{E(safe_url(item["image"],True))}" alt="{E(item["alt"][lang])}" loading="lazy" decoding="async" width="{int(item.get("width",1200))}" height="{int(item.get("height",675))}">'
            link=f'<a class="text-link" href="{E(safe_url(item["url"]))}" target="_blank" rel="noopener noreferrer">{W("Open original","افتح الأصل")} {self.icon("external")}</a>' if item.get('url') else ''
            cards.append(f'<figure class="verified-media">{image}<figcaption><h3>{E(item["title"][lang])}</h3><p>{E(item["description"][lang])}</p>{link}</figcaption></figure>')
        return '<div class="media-grid">'+''.join(cards)+'</div>' if cards else ''
    def case(self,lang,p):
        W=lambda en,ar:self.w(lang,en,ar);project=self.d['projects'];n=project[(project.index(p)+1)%len(project)]
        facts=''.join(f'<section><h3>{title}</h3><p>{E(p[field][lang])}</p></section>' for field,title in [('objective',W('Objective','الهدف')),('role',W('My role & contribution','دوري ومساهمتي')),('stage_detail',W('Verified status & evidence','الحالة والأدلة المتاحة'))])
        tags=''.join(f'<span>{E(x)}</span>' for x in p['tags']);focus=''.join(f'<li>{E(x)}</li>' for x in p['focus'][lang])
        return f'<article class="case-study wrap" itemscope itemtype="https://schema.org/CreativeWork"><a class="back-link" href="#work">{self.icon("back")} {W("Project archive","أرشيف المشاريع")}</a><header class="case-header"><span class="eyebrow">{E(p["category"][lang])}</span><h1 itemprop="name">{E(p["title"][lang])}</h1><p class="lead" itemprop="description">{E(p["summary"][lang])}</p><p class="case-stage">{E(p["status"][lang])}</p></header><div class="case-facts">{facts}</div><div class="case-layout"><section><h3>{W("Approach & focus","المنهج ومجالات التركيز")}</h3><p>{E(p["overview"][lang])}</p><ul class="case-list">{focus}</ul></section><aside class="stage-panel"><h3>{W("Technologies & methods","التقنيات والأساليب")}</h3><div class="tags">{tags}</div><p>{W("This page describes the documented scope and status. No private operational records or unverified business metrics are published.","تصف الصفحة النطاق والحالة الموثقين دون نشر سجلات تشغيلية خاصة أو مؤشرات أعمال غير موثقة.")}</p></aside></div>{self.media(p.get("media",[]),lang)}<nav class="case-next" aria-label="{W("Related work","أعمال ذات صلة")}"><a class="button primary" href="#service/{E(p["related_service"])}">{W("Explore related services","استكشف الخدمات المرتبطة")}</a><a class="text-link" href="#project/{E(n["slug"])}">{W("Next project","المشروع التالي")}: {E(n["title"][lang])} {self.icon("forward")}</a></nav></article>'
    def journeys(self,lang):
        W=lambda en,ar:self.w(lang,en,ar);d=self.d['journeys']
        formats=''.join(f'<article><span class="eyebrow">{W("FUTURE FORMAT","صيغة مستقبلية")}</span><h3>{E(x["title"][lang])}</h3><p>{E(x["text"][lang])}</p></article>' for x in d['formats'])
        series=''.join(f'<article class="journey-series"><span class="eyebrow">{E(x["country"][lang])}</span><h3>{E(x["title"][lang])}</h3><p>{E(x["description"][lang])}</p><p class="scope-note">{E(x["status"][lang])}</p></article>' for x in d.get('series',[]))
        episodes=self.media(d.get('episodes',[]),lang);gallery=self.media(d.get('gallery',[]),lang)
        return f'<section id="journeys" class="section wrap"><div class="journey-hero"><span class="eyebrow">OSAA601 ADVENTURES</span><h2>{E(d["title"][lang])}</h2><span class="journey-status">{E(d["status"][lang])}</span><p>{E(d["intro"][lang])}</p><svg class="journey-path" viewBox="0 0 600 100" fill="none" aria-hidden="true"><path d="M10 80C120 80 85 20 190 30S290 90 360 50 440 10 590 30" stroke="currentColor" stroke-width="2" stroke-dasharray="5 9"/><circle cx="10" cy="80" r="6" fill="currentColor"/><circle cx="590" cy="30" r="6" fill="currentColor"/></svg></div><p class="journey-honesty">{E(d["note"][lang])}</p><div class="journey-formats">{formats}</div>{series}{episodes}{gallery}<div class="journey-actions"><a class="button secondary" href="#creative">{self.icon("creative")} {W("Explore the Studio","استكشف الاستوديو")}</a><a class="text-link" href="{E(self.mail(lang,W('Content-production partnership','شراكة إنتاج محتوى')))}">{W("Discuss a production collaboration","ناقش تعاوناً في الإنتاج")}</a></div></section>'
    def inquiries(self,lang):
        W=lambda en,ar:self.w(lang,en,ar)
        cards=''.join(f'<a class="inquiry-option" href="{E(self.mail(lang,x["title"][lang]))}">{self.icon("contact")}<span>{E(x["title"][lang])}</span>{self.icon("forward")}</a>' for x in self.d['inquiries'])
        return f'<section class="inquiry-paths"><h3>{W("What would you like to discuss?","ما الذي ترغب في مناقشته؟")}</h3><p>{W("Choose a topic to open an email draft. Nothing is sent until you send it from your email app.","اختر الموضوع لفتح مسودة بريد. لا تُرسل أي رسالة حتى ترسلها من تطبيق بريدك.")}</p><div class="inquiry-grid">{cards}</div><a class="text-link" href="/assets/osaa601-contact.vcf" download="osaa601-contact.vcf">{self.icon("contact")} {W("Save my business contact","احفظ بيانات التواصل المهني")}</a><p class="contact-privacy">{W("Start with a high-level brief. Do not email credentials or confidential customer records. Secure access arrangements can be agreed during scoping.","ابدأ بموجز عام دون إرسال بيانات دخول أو سجلات عملاء سرية بالبريد. يمكن الاتفاق على ترتيبات الوصول الآمن عند تحديد النطاق.")}</p></section>'
    def fallback(self,lang,screen):
        W=lambda en,ar:self.w(lang,en,ar);meta=self.metadata(lang);m=meta.get(screen,meta['profile']);detail=''
        if screen.startswith('service/'):detail=self.service_detail(lang,next(x for x in self.d['service_groups'] if x['slug']==screen.split('/')[1]))
        elif screen.startswith('project/'):detail=self.case(lang,next(x for x in self.d['projects'] if x['slug']==screen.split('/')[1])).replace('<h1','<h2').replace('</h1>','</h2>')
        elif screen.startswith('note/'):
            n=next(x for x in self.d['journal'] if x['slug']==screen.split('/')[1]);detail='<article class="journal-prose">'+''.join(f'<p>{E(x)}</p>' for x in n['paragraphs'][lang])+'</article>'
        elif screen=='journeys':detail=self.journeys(lang).replace('id="journeys"','')
        elif screen=='creative':detail=self.media(self.d.get('studio_media',[]),lang)
        links=''.join(f'<a href="{E(x["route"])}">{E(x["title"].split(" · ")[0])}</a>' for key,x in meta.items() if key in ['profile','services','work','creative','journal','journeys','contact'])
        catalog=''.join(f'<li><a href="{E(meta["service/"+g["slug"]]["route"])}">{E(g["title"][lang])}</a><p>{E(g["problem"][lang])}</p></li>' for g in self.d['service_groups'])
        work=''.join(f'<li><a href="{E(meta["project/"+p["slug"]]["route"])}">{E(p["title"][lang])}</a><p>{E(p["status"][lang])}</p></li>' for p in self.d['projects'])
        journals=''.join(f'<li><a href="{E(meta["note/"+n["slug"]]["route"])}">{E(n["title"][lang])}</a><p>{E(n["excerpt"][lang])}</p></li>' for n in self.d['journal'])
        result=f'<section class="os-rescue" aria-label="{W("Professional information","المعلومات المهنية")}"><header><span class="eyebrow">OSAA601 / {W("PERSONAL DESKTOP","سطح مكتب شخصي")}</span><h1>{E(m["title"].split(" · ")[0])}</h1><p>{E(m["description"])}</p><a class="button primary" href="mailto:{E(self.d["email"])}">{E(self.d["email"])}</a></header><nav>{links}</nav>{detail}<section><h2>{W("Work with me","اعمل معي")}</h2><ul>{catalog}</ul></section><section><h2>{W("Selected work","أعمال مختارة")}</h2><ul>{work}</ul></section><section><h2>{W("From the journal","من اليوميات")}</h2><ul>{journals}</ul></section>{self.inquiries(lang)}</section>'
        for key,value in meta.items():result=result.replace('href="#'+key+'"','href="'+E(value['route'])+'"')
        return result
    def schema(self,lang,screen):
        person={'@type':'Person','@id':self.d['domain']+'/#osama','name':self.d['name'],'alternateName':self.d['handle'],'url':self.d['domain'],'jobTitle':'Information Security Engineer','sameAs':[safe_url(u) for k,u in self.d['socials'].items() if k!='Website']}
        graph=[person,{'@type':'WebSite','name':'OSAA601','url':self.d['domain'],'inLanguage':['en','ar'],'publisher':{'@id':person['@id']}}]
        return json.dumps({'@context':'https://schema.org','@graph':graph},ensure_ascii=False).replace('<','\\u003c')
