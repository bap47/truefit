# Tự đồng bộ danh sách "Sắp xếp thứ tự": bỏ mục đã xoá, thêm mục mới vào cuối.
import os, re, glob

def ngay(p):
    try:
        m = re.search(r'^ngay_tao:\s*"?([^"\n]+)', open(p, encoding='utf-8').read(), re.M)
        return m.group(1).strip() if m else ''
    except Exception:
        return ''

def doc(path):
    ds, cur = {}, None
    if os.path.exists(path):
        for line in open(path, encoding='utf-8'):
            m = re.match(r'^([a-z_]+):\s*(\[\])?\s*$', line)
            if m:
                cur = m.group(1); ds[cur] = []; continue
            m = re.match(r'^\s*-\s*(?:muc:\s*)?["\']?([^"\'\n]+?)["\']?\s*$', line)
            if m and cur:
                ds[cur].append(m.group(1))
    return ds

def ghi(path, tieu_de, ds, thu_tu):
    out = ['# ' + tieu_de]
    for k in thu_tu:
        out.append(k + ':' + ('' if ds[k] else ' []'))
        out += ['  - ' + x for x in ds[k]]
    s = '\n'.join(out) + '\n'
    if not os.path.exists(path) or open(path, encoding='utf-8').read() != s:
        open(path, 'w', encoding='utf-8').write(s)
        print('cap nhat', path)

for file, goc, thu_tu in [('_data/sap_xep_san_pham.yml', '_san_pham', ['dong_phuc', 'qua_tang']),
                          ('_data/sap_xep_doi_tac.yml', '_khach_hang', ['qua_tang', 'dong_phuc'])]:
    ds = doc(file)
    for k in thu_tu:
        thu_muc = goc + '/' + k.replace('_', '-')
        co = sorted(glob.glob(thu_muc + '/*.md'), key=lambda p: (ngay(p), p))
        cu = [x for x in dict.fromkeys(ds.get(k, [])) if x in co]
        ds[k] = cu + [x for x in co if x not in cu]
    ghi(file, 'Thứ tự – kéo ⋮⋮ trong CMS để đổi vị trí. Tự cập nhật khi thêm/xoá mục.', ds, thu_tu)
