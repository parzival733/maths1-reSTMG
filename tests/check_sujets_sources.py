"""Explicit one-shot remote PDF verification; no copies published or tracked."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from urllib.request import Request, urlopen
import json,hashlib,time
ROOT=Path(__file__).resolve().parents[1]

def check(row):
    result={'id':row['id'],'url':row['url'],'status':'error'}
    for attempt in range(2):
        try:
            request=Request(row['url'],headers={'User-Agent':'Mozilla/5.0 (educational link verification)'})
            with urlopen(request,timeout=25) as response:
                data=response.read(15_000_001)
                assert response.status==200 and len(data)<=15_000_000
            assert data.startswith(b'%PDF-'),'not a PDF'
            digest=hashlib.sha256(data).hexdigest()
            if digest!=row['sha256']:
                # Only the two visually reviewed PDF versions have a text fingerprint.
                # The September file carries a variable technical EN_ marker.
                assert row.get('content_sha256'),'PDF changed since the verified collection'
                from pypdf import PdfReader
                import io,re
                pdf=PdfReader(io.BytesIO(data))
                text='\n'.join(page.extract_text() or '' for page in pdf.pages)
                if row.get('variable_download_marker'):
                    text=re.sub(r'(?m)^EN_[A-Za-z0-9]{40,70}\s*$','',text)
                actual=hashlib.sha256(re.sub(r'\s+','',text).encode()).hexdigest()
                assert len(pdf.pages)==row['pages'] and actual==row['content_sha256'],'PDF content changed'
                result['validation']='complete_text_and_page_count'
            result.update(status='ok',bytes=len(data),sha256=digest)
            return result
        except Exception as error:
            result['error']=str(error)
            if attempt==0:time.sleep(1)
    return result

def main():
    rows=json.loads((ROOT/'donnees/sujets.json').read_text())
    with ThreadPoolExecutor(max_workers=5) as pool:results=list(pool.map(check,rows))
    out=ROOT/'.qa-sujets';out.mkdir(exist_ok=True)
    (out/'sources.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
    failed=[r for r in results if r['status']!='ok']
    print(f'SOURCES: {len(rows)-len(failed)}/{len(rows)} PDFs available; file or complete-text fingerprints checked.')
    if failed:
        print(json.dumps(failed,indent=2));raise SystemExit(1)
if __name__=='__main__':main()
