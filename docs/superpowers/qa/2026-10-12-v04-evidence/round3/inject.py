import re,subprocess,shutil,os
RC='/tmp/claude-0/qa/wt-rc5'
def run(name,path,fn):
    F=f'{RC}/dist{path}'; B=F+'.bak'; shutil.copy(F,B); h=open(F).read(); open(F,'w').write(fn(h))
    p=subprocess.run(['node','scripts/verify-dist.mjs'],capture_output=True,text=True,cwd=RC); out=(p.stdout+p.stderr).splitlines()
    shutil.move(B,F); print('REJECTED' if p.returncode else 'ACCEPTED!!', name,'|',(out[1].strip() if len(out)>1 else out[0])[:120])
run('external link to an unreviewed host','/ensino-fundamental/index.html',lambda h:h.replace('https://sme.goiania.go.gov.br/','https://evil.example.org/',1))
run('http (not https) resource link','/pre-militar/index.html',lambda h:h.replace('https://www.fab.mil.br/','http://www.fab.mil.br/',1))
run('#fontes filter that does not exist','/index.html',lambda h:h.replace('/buscar/?instituicao=mit-opencourseware','/buscar/?instituicao=yale',1))
run('Superior field emptied','/ensino-superior/index.html',lambda h:(lambda m:h.replace(m.group(0),re.sub(r'\sdata-resource-id="[^"]+"','',m.group(0))))(re.search(r'<section\b[^>]*\sid="biologia"[^>]*>.*?</section>',h,re.S)))
run('nine highlights on a path','/tecnologia/index.html',lambda h:(lambda m:h.replace(m.group(0),re.sub(r'<li\b[^>]*data-resource-id[^>]*>.*?</li>','',m.group(0),count=1,flags=re.S)))(re.search(r'<section\b[^>]*\sdata-featured[\s>=].*?</section>',h,re.S)))
run('ENEM note pointing nowhere','/enem/index.html',lambda h:h.replace('href="#recurso-inep-enem-provas-gabaritos"','href="#recurso-x"',1))
run('anchor duplicated','/pre-militar/index.html',lambda h:h.replace('id="recurso-pm-afa-provas"','id="recurso-pm-epcar-provas"',1))
run('target=_blank without noopener','/ensino-superior/index.html',lambda h:h.replace('rel="noopener noreferrer"','rel="external"',1))
p=subprocess.run(['node','scripts/verify-dist.mjs'],capture_output=True,text=True,cwd=RC); print('restored:',p.stdout.strip().splitlines()[-1])
