import os, glob
from pypdf import PdfReader
os.makedirs("tmp_txt", exist_ok=True)
for p in glob.glob("NES_AI_Finance_Insurance_Project_Documentation_Pack/*.pdf"):
    r = PdfReader(p)
    text = "\n".join((pg.extract_text() or "") for pg in r.pages)
    name = os.path.basename(p).replace(".pdf",".txt")
    open(os.path.join("tmp_txt",name),"w",encoding="utf-8").write(text)
    print(name, len(text))
