#!/usr/bin/env python3
"""Catalog of the modular characters (the MTA resource "Clothes": config.lua, barbershop.lua, clothingstore.lua,
acessoriestore.lua), for the client and the gamemode, and the files for the phone.

    python3 look_catalog.py --mta <resource folder> [--gm <gamemodes folder>] [--assets <out folder>]

Writes look/LookCatalog.gen.cpp (client) and, with --gm, SERVER/player/look/look_catalog.inc. Both index the
same lists: an item travels as its index, so the lists must be generated together.
--assets <out> writes what goes on the phone:
    <out>/clothes/...                     the textures (PNG; larger than 512 or not a power of two: resized)
    <out>/modloader/Penampilan/...        male.dff/txd as male01 (skin 7), female as bfori (skin 9)
    <out>/modloader/Penampilan Polisi/... male_police as ryder (skin 271), female_police as forelli (skin 272)

How a model is dressed (config.lua):
  - the model is one skinned mesh with one material per part; the material's texture name ("body.torso1",
    "fantasy_m_torso4", ...) names the part. The model's own textures are 1x1 and transparent: every part shown
    gets its texture from the look, every other part is not drawn;
  - body parts ("body.*") get the skin tone's texture (clothesConfig[skin].body[tone]), the head of the head
    shape (body.head1..5) the tone's head texture; eyebrows / beard / make-up are drawn on body.eyebrownN /
    body.beardsN / body.makeupN of that head shape; the hair is fantasy_?_hairS of the hair style;
  - a piece of clothing shows its modelName, hides its removeParts and shows its applyParts (body parts only);
  - a tattoo shows its modelName unless a worn piece of clothing is one of its notApply.
"""
import argparse
import os
import re
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import luatable  # noqa: E402

SLOTS = [
    # key, label, source, category
    ('hair', 'Rambut', 'hair', None),
    ('beard', 'Jenggot', 'face', 'beards'),
    ('makeup', 'Riasan', 'face', 'makeup'),
    ('eyebrow', 'Alis', 'face', 'eyebrown'),
    ('shirt', 'Baju', 'clothes', 't-shirts'),
    ('pants', 'Celana', 'clothes', 'pants'),
    ('shoes', 'Sepatu', 'clothes', 'boot'),
    ('hat', 'Topi', 'clothes', 'hat'),
    ('glasses', 'Kacamata', 'clothes', 'glasse'),
    ('mask', 'Topeng', 'clothes', 'mask'),
    ('necklace', 'Kalung', 'clothes', 'necklace'),
    ('watch', 'Jam tangan', 'clothes', 'clock'),
    ('earring', 'Anting', 'clothes', 'ear'),
    ('bag', 'Tas', 'clothes', 'backpack'),
    ('vest', 'Rompi', 'clothes', 'vest'),
    ('belt', 'Sabuk', 'clothes', 'belt'),
    ('tat_arm_l', 'Tato lengan kiri', 'tattoo', 'tattooarml'),
    ('tat_arm_r', 'Tato lengan kanan', 'tattoo', 'tattooarmr'),
    ('tat_shoulder_l', 'Tato bahu kiri', 'tattoo', 'tattooshoulderl'),
    ('tat_shoulder_r', 'Tato bahu kanan', 'tattoo', 'tattooshoulderr'),
    ('tat_chest', 'Tato dada', 'tattoo', 'tattootorsofront'),
    ('tat_back', 'Tato punggung', 'tattoo', 'tattootorsoback'),
    ('tat_leg_l', 'Tato kaki kiri', 'tattoo', 'tattoolegl'),
    ('tat_leg_r', 'Tato kaki kanan', 'tattoo', 'tattoolegr'),
]
SLOT_INDEX = {s[0]: i for i, s in enumerate(SLOTS)}
CLOTHES_SLOT = {s[3]: i for i, s in enumerate(SLOTS) if s[2] == 'clothes'}

KINDS = [
    # key, label, skin, female, trait skin (hair, face, tattoos), model file, marker, hair material, hidden by default,
    # modloader name, modloader folder, required slots
    dict(key='male', label='Laki-laki', skin=7, female=False, traits=7, dff='male', marker='fantasy_m_torso1',
         hair='fantasy_m_hair', hidden='', ml='male01', folder='Penampilan', required=['pants']),
    dict(key='female', label='Perempuan', skin=9, female=True, traits=9, dff='female', marker='fantasy_f_torso1',
         hair='fantasy_f_hair', hidden='body.feets2', ml='bfori', folder='Penampilan', required=['shirt', 'pants']),
    dict(key='male_police', label='Polisi laki-laki', skin=271, female=False, traits=7, dff='male_police',
         marker='fantasy_m_cop_torso1', hair='fantasy_m_hair', hidden='', ml='ryder', folder='Penampilan Polisi',
         required=['pants']),
    dict(key='female_police', label='Polisi perempuan', skin=272, female=True, traits=9, dff='female_police',
         marker='fantasy_f_cop_torso1', hair='fantasy_f_hair', hidden='body.feets2', ml='forelli',
         folder='Penampilan Polisi', required=['shirt', 'pants']),
]
TONES = 6
HEADS = 5
MAX_TEXTURE = 512

WORDS = {
    'tshirts': 'Kaos', 'longsleeveshirt': 'Kaos lengan panjang', 'regatta': 'Kaos kutung', 'sweatshirt': 'Sweater',
    'brassiere': 'Bra', 'cropped': 'Crop top', 'croppedblouse': 'Blus crop', 'croppedwithneckline': 'Crop leher V',
    'cargopants': 'Celana kargo', 'halfcinnamonpants': 'Celana 3/4', 'shorts': 'Celana pendek',
    'sweatpants': 'Celana training', 'trousers': 'Celana panjang', 'underwear': 'Celana dalam', 'jeans': 'Jeans',
    'panties': 'Celana dalam', 'rippedpants': 'Celana sobek', 'boot': 'Sepatu bot', 'slipper': 'Sandal jepit',
    'slipperslide': 'Sandal selop', 'slipperslidewithsock': 'Sandal + kaus kaki', 'slideslipper': 'Sandal selop',
    'slideslipperwithsock': 'Sandal + kaus kaki', 'sneakers': 'Sneakers', 'tennisregular': 'Sepatu kets',
    'tennisshoes': 'Sepatu olahraga', 'jump': 'Sepatu hak', 'backpack': 'Tas ransel', 'shoulderbag': 'Tas selempang',
    'travelbag': 'Tas travel', 'clock': 'Jam tangan', 'ear': 'Anting', 'glasse': 'Kacamata', 'hat': 'Topi',
    'mask': 'Topeng', 'necklace': 'Kalung',
}
BRANDS = {'lv': 'LV', 'versace': 'Versace'}
# Police uniforms (Portuguese / Brazilian forces in the resource): the words of their names.
POLICE_WORDS = {
    'template': 'polos', 'training': 'latihan', 'bombeiro': 'pemadam', 'inem': 'medis', 'mec': 'mekanik',
    'municipal': 'kota', 'maritima': 'maritim', 'cerimonia': 'upacara', 'negociador': 'negosiator',
    'transito': 'lalu lintas', 'boina': 'baret', 'chapeu': '', 'colete': '', 'calcas': '', 'calcas2': '2',
    'blusa': 'kemeja', 'blusa2': 'kemeja 2', 'blusa3': 'kemeja 3', 'tshirt': 'kaos', 'botas': '',
    'gnr2': 'GNR 2', 'psp2': 'PSP 2', 'psp3': 'PSP 3',
}
POLICE_AGENCIES = {'psp', 'gnr', 'goe', 'bope', 'eb', 'pcerj', 'pf', 'pmerj', 'prf', 'recom', 'rota'}
CATEGORY_WORDS = {'tshirts', 'pants', 'boot', 'hat', 'vest', 'belt'}


def natural(name):
    return [int(t) if t.isdigit() else t for t in re.split(r'(\d+)', name)]


def split_name(name):
    """('lv_tshirts', 3) for 'lv_tshirts_3'; (name, None) without a number."""
    m = re.match(r'^(.*)_(\d+)$', name)
    return (m.group(1), int(m.group(2))) if m else (name, None)


def group_label(base, slot_label, police):
    if base.startswith('tattoo') or base.startswith('lv_tattoo'):
        return 'Tato LV' if base.startswith('lv_') else 'Tato'
    if police and base not in WORDS:
        words = []
        for token in base.split('_'):
            if re.match(r'^(torso|pants|hat|vest|boot|belt)\d+$', token) or token in CATEGORY_WORDS:
                continue
            if token in POLICE_AGENCIES:
                words.append(token.upper())
            elif token in POLICE_WORDS:
                if POLICE_WORDS[token]:
                    words.append(POLICE_WORDS[token])
            else:
                words.append(token)
        return (slot_label + ' ' + ' '.join(words)).strip()
    brand = None
    head, _, rest = base.partition('_')
    if head in BRANDS and rest:
        brand, base = BRANDS[head], rest
    label = WORDS.get(base, base.replace('_', ' ').capitalize())
    return label + (' ' + brand if brand else '')


def mat(name):
    if name.startswith('body_'):
        return 'body.' + name[5:]
    if name.startswith('hairs_'):
        return name[6:]
    return name


def as_list(v):
    if v is None:
        return []
    if isinstance(v, dict):
        return [v[k] for k in sorted(v)] if v else []
    return list(v)


def tex_path(p):
    p = p.replace('\\', '/')
    for prefix in ('files/clothes/', 'clothes/'):
        if p.startswith(prefix):
            return p[len(prefix):]
    raise ValueError('texture outside files/clothes: ' + p)


class Catalog:
    def __init__(self, mta):
        names = ['config.lua', 'barbershop.lua', 'clothingstore.lua', 'acessoriestore.lua']
        env = luatable.parse_files([os.path.join(mta, n) for n in names])
        self.mta = mta
        self.cfg = env['config']
        self.textures = set()
        self.colors = {}
        self.kinds = [self.build_kind(k) for k in KINDS]

    # ---- texture colours (the fallback while a texture loads) --------------------------------------------
    def color_of(self, path):
        if path in self.colors:
            return self.colors[path]
        color = 0x808080FF
        try:
            from PIL import Image
            with Image.open(os.path.join(self.mta, 'files', 'clothes', path)) as im:
                raw = im.convert('RGBA').resize((16, 16)).tobytes()
                px = [tuple(raw[i:i + 4]) for i in range(0, len(raw), 4)]
                px = [p for p in px if p[3] > 32]
                if px:
                    r = sum(p[0] for p in px) // len(px)
                    g = sum(p[1] for p in px) // len(px)
                    b = sum(p[2] for p in px) // len(px)
                    color = (r << 24) | (g << 16) | (b << 8) | 0xFF
        except Exception:
            pass
        self.colors[path] = color
        return color

    def texture(self, raw):
        p = tex_path(raw)
        if not os.path.exists(os.path.join(self.mta, 'files', 'clothes', p)):
            return None
        self.textures.add(p)
        return p

    # ---- order of the items: the shops' lists, then the rest -------------------------------------------------
    def shop_order(self, gender):
        order = []
        for store in ('clothingStore', 'acessorieStore'):
            sub = self.cfg.get(store, {}).get('subCategories', {}).get(gender, {})
            for cat in (sub.values() if isinstance(sub, dict) else []):
                for group in as_list(cat):
                    for entry in as_list(group.get('Table')):
                        name = entry.get('clotheName')
                        if isinstance(name, str):
                            order.append(split_name(name)[0])
        create = self.cfg.get('createCharacter', {}).get('subCategories', {}).get(gender, {})
        for cat in (create.values() if isinstance(create, dict) else []):
            for group in as_list(cat):
                if isinstance(group, dict):
                    for entry in as_list(group.get('Table')):
                        name = entry.get('clotheName') if isinstance(entry, dict) else None
                        if isinstance(name, str):
                            order.append(split_name(name)[0])
        seen, out = set(), []
        for base in order:
            if base not in seen:
                seen.add(base)
                out.append(base)
        return out

    def ordered(self, names, gender):
        rank = {b: i for i, b in enumerate(self.shop_order(gender))}

        def key(n):
            base, number = split_name(n)
            plain = base.split('_', 1)[1] if base.split('_', 1)[0] in BRANDS and '_' in base else base
            return (rank.get(plain, 10_000), plain, base != plain, base, number if number is not None else 0, natural(n))
        return sorted(names, key=key)

    # ---- one kind --------------------------------------------------------------------------------------
    def build_kind(self, k):
        cfg = self.cfg
        skin, traits = k['skin'], k['traits']
        gender = 'female' if k['female'] else 'male'
        manage = cfg['clothesManage'][skin]
        conf = cfg['clothesConfig'][skin]
        tconf = cfg['clothesConfig'][traits]
        police = skin != traits
        rules, rule_index = [], {}

        def rule(show, remove=(), apply=(), covers=()):
            key = (' '.join(show), ' '.join(remove), ' '.join(apply), ' '.join(covers))
            if key not in rule_index:
                rule_index[key] = len(rules)
                rules.append(key)
            return rule_index[key]

        slots = []
        for key, label, source, cat in SLOTS:
            slot = dict(key=key, label=label, items=[], groups=[], required=key in k['required'] or key == 'eyebrow',
                        default=0xFFFF, rule=0xFFFF)
            group_of = {}

            def add(name, texture, rule_id=0xFFFF, style=0, color=None, number_label=True):
                base, number = split_name(name)
                glabel = group_label(base, label, police and source == 'clothes')
                if glabel not in group_of:
                    group_of[glabel] = len(slot['groups'])
                    slot['groups'].append(glabel)
                ilabel = glabel + (' %d' % number if number is not None and number_label else '')
                slot['items'].append(dict(name=name, label=ilabel, texture=texture, rule=rule_id,
                                          group=group_of[glabel], style=style,
                                          color=color if color is not None else self.color_of(texture)))

            if source == 'hair':
                groups = as_list(cfg['barberShop']['subCategories'][gender]['hairs_colors'])
                hairs = tconf['hairs']
                for s, group in enumerate(groups, 1):
                    for c, entry in enumerate(as_list(group), 1):
                        tex = self.texture(hairs[entry['hairName']])
                        if not tex:
                            continue
                        before = len(slot['items'])
                        add(entry['hairName'], tex, style=s)
                        item = slot['items'][before]
                        item['label'] = 'Warna %d' % c
                        item['group'] = s - 1
                slot['groups'] = ['Gaya %d' % (s + 1) for s in range(len(groups))]
            elif source == 'face':
                family = tconf['faceshapes'].get(cat)
                if family:
                    for name in sorted(family, key=natural):
                        tex = self.texture(family[name])
                        if tex:
                            add(name, tex)
                    for item in slot['items']:
                        item['group'] = 0
                    slot['groups'] = [label]
                    for item in slot['items']:
                        item['label'] = '%s %s' % (label, split_name(item['name'])[1])
            elif source == 'clothes':
                items = manage['clothes'].get(cat, {})
                textures = conf.get('clothes', {}).get(cat, {})
                for name in self.ordered(list(items), gender):
                    raw = textures.get(name)
                    tex = self.texture(raw) if raw else None
                    if not tex:
                        continue
                    it = items[name]
                    rid = rule([it['modelName']] if isinstance(it['modelName'], str) else as_list(it['modelName']),
                               [mat(p) for p in as_list(it.get('removeParts'))],
                               [mat(p) for p in as_list(it.get('applyParts'))])
                    add(name, tex, rid)
            elif source == 'tattoo':
                manage_t = manage.get('tattoo', {}).get(cat)
                textures = tconf.get('tattoo', {}).get(cat, {})
                if manage_t and textures:
                    first = manage_t[sorted(manage_t, key=natural)[0]]
                    slot['rule'] = rule(as_list(first['modelName']), covers=as_list(first.get('notApply')))
                    for name in self.ordered(list(textures), gender):
                        tex = self.texture(textures[name])
                        if tex:
                            add(name, tex)
            if slot['required'] and not slot['items']:
                slot['required'] = False
            slots.append(slot)

        # Defaults: config.defaultClothes, hair 1 and eyebrows 1.
        for entry in as_list(cfg['defaultClothes'][skin]['clothes']):
            s = CLOTHES_SLOT.get(entry['clotheType'])
            if s is None:
                continue
            for i, item in enumerate(slots[s]['items']):
                if item['name'] == entry['clotheName']:
                    slots[s]['default'] = i
        for key in ('hair', 'eyebrow'):
            s = slots[SLOT_INDEX[key]]
            if s['items']:
                s['default'] = 0
        for s in slots:
            if s['required'] and s['default'] == 0xFFFF:
                s['default'] = 0

        tones, heads, tone_colors = [], [], []
        create = cfg['createCharacter']['subCategories'][gender]
        tone_list = as_list(create.get('tones'))
        for t in range(TONES):
            body = as_list(tconf['body'])[t]
            parts = []
            for part in sorted(body):
                tex = self.texture(body[part])
                if tex:
                    parts.append(('body.%s' % part, tex))
            tones.append(parts)
            head = as_list(tconf['heads'])[t]
            heads.append(self.texture(head[sorted(head)[0]]) or '')
            c = tone_list[t].get('Color') if t < len(tone_list) else None
            c = c['args'] if isinstance(c, dict) and '__call' in c else as_list(c) or [150, 110, 90]
            tone_colors.append((int(c[0]) << 24) | (int(c[1]) << 16) | (int(c[2]) << 8) | 0xFF)
        return dict(k, rules=rules, slots=slots, tones=tones, heads=heads, tone_colors=tone_colors)


# ---- writers ---------------------------------------------------------------------------------------------
def cstr(s):
    return '"' + s.replace('\\', '\\\\').replace('"', '\\"') + '"'


def write_cpp(cat, path):
    out = ['// Generated by look/tools/look_catalog.py from the MTA resource "Clothes" (config.lua and the shops):',
           '// do not edit. The gamemode\'s SERVER/player/look/look_catalog.inc indexes the same lists.',
           '#include "LookCatalog.h"', '', 'namespace look {', '', 'namespace {', '']
    shared = {}
    for ki, k in enumerate(cat.kinds, 1):
        out.append('const CatalogRule kRules%d[] = {' % ki)
        for r in k['rules']:
            out.append('    {%s},' % ', '.join(cstr(x) for x in r))
        out.append('};')
        for si, s in enumerate(k['slots']):
            if not s['items']:
                continue
            sig = repr([(i['name'], i['texture'], i['rule'], i['group'], i['style'], i['label']) for i in s['items']]) + repr(s['groups'])
            if sig in shared:
                s['array'] = shared[sig]
                continue
            name = 'k%s_%s' % (k['key'].title().replace('_', ''), s['key'].title().replace('_', ''))
            shared[sig] = name
            s['array'] = name
            out.append('const char* const %sGroups[] = {%s};' % (name, ', '.join(cstr(g) for g in s['groups'])))
            out.append('const CatalogItem %s[] = {' % name)
            for i in s['items']:
                out.append('    {%s, %s, %d, %d, %d, 0x%08Xu},' % (cstr(i['label']), cstr(i['texture']),
                                                                    i['rule'], i['group'], i['style'], i['color']))
            out.append('};')
        for t, parts in enumerate(k['tones']):
            out.append('const CatalogTexture k%sTone%d[] = {' % (k['key'].title().replace('_', ''), t))
            for part, tex in parts:
                out.append('    {%s, %s},' % (cstr(part), cstr(tex)))
            out.append('};')
        out.append('')
    out += ['}  // namespace', '']
    out.append('const char* const kSlotNames[kSlots] = {%s};' % ', '.join(cstr(s[1]) for s in SLOTS))
    out.append('')
    out.append('const CatalogKind kCatalog[kKinds] = {')
    out.append('    {"", "Skin biasa", 0, false, "", "", "", nullptr, 0, {}, {}, {}, {}, {}},')
    for ki, k in enumerate(cat.kinds, 1):
        out.append('    {%s, %s, %d, %s, %s, %s, %s, kRules%d, %d,' % (
            cstr(k['key']), cstr(k['label']), k['skin'], 'true' if k['female'] else 'false', cstr(k['marker']),
            cstr(k['hair']), cstr(k['hidden']), ki, len(k['rules'])))
        out.append('     {')
        for s in k['slots']:
            if s['items']:
                out.append('         {%s, %d, %sGroups, %d, %s, %d, %d},' % (
                    s['array'], len(s['items']), s['array'], len(s['groups']), 'true' if s['required'] else 'false',
                    s['default'], s['rule']))
            else:
                out.append('         {nullptr, 0, nullptr, 0, false, kNoItem, kNoItem},')
        out.append('     },')
        name = k['key'].title().replace('_', '')
        out.append('     {%s},' % ', '.join('k%sTone%d' % (name, t) for t in range(TONES)))
        out.append('     {%s},' % ', '.join(str(len(t)) for t in k['tones']))
        out.append('     {%s},' % ', '.join(cstr(h) for h in k['heads']))
        out.append('     {%s}},' % ', '.join('0x%08Xu' % c for c in k['tone_colors']))
    out.append('};')
    out.append('')
    out.append('}  // namespace look')
    with open(path, 'w', newline='\n') as f:
        f.write('\n'.join(out) + '\n')


def write_inc(cat, path):
    kinds = len(cat.kinds) + 1
    counts = [[0] * len(SLOTS)] + [[len(s['items']) for s in k['slots']] for k in cat.kinds]
    required = [[False] * len(SLOTS)] + [[s['required'] for s in k['slots']] for k in cat.kinds]
    defaults = [[0xFFFF] * len(SLOTS)] + [[s['default'] for s in k['slots']] for k in cat.kinds]
    rows = lambda m, f: ',\n    '.join('{' + ', '.join(f(v) for v in row) + '}' for row in m)  # noqa: E731
    text = '''/* Generated by look/tools/look_catalog.py (client JNI): do not edit.
   The items of every slot of every kind of model, the same lists as the client's look/LookCatalog.gen.cpp:
   items travel as their index. Kind 0: an ordinary skin (only height and weight). */
#if defined _eagle_look_catalog
    #endinput
#endif
#define _eagle_look_catalog

#define LOOK_KINDS (%d)
#define LOOK_SLOTS (%d)
#define LOOK_TONES (%d)
#define LOOK_HEADS (%d)
#define LOOK_NO_ITEM (65535)

// Kind 1..4: male, female, male police, female police. Skins the models replace (the modloader files' names).
stock const gLookKindSkin[LOOK_KINDS] = {0, %s};
stock const bool:gLookKindFemale[LOOK_KINDS] = {false, %s};
stock const bool:gLookKindPolice[LOOK_KINDS] = {false, %s};

stock const gLookSlotCount[LOOK_KINDS][LOOK_SLOTS] = {
    %s
};
stock const bool:gLookSlotRequired[LOOK_KINDS][LOOK_SLOTS] = {
    %s
};
stock const gLookSlotDefault[LOOK_KINDS][LOOK_SLOTS] = {
    %s
};
''' % (kinds, len(SLOTS), TONES, HEADS,
       ', '.join(str(k['skin']) for k in cat.kinds),
       ', '.join('true' if k['female'] else 'false' for k in cat.kinds),
       ', '.join('true' if k['skin'] != k['traits'] else 'false' for k in cat.kinds),
       rows(counts, str), rows(required, lambda v: 'true' if v else 'false'), rows(defaults, str))
    slot_enum = '\n'.join('#define LOOK_SLOT_%s (%d)' % (s[0].upper(), i) for i, s in enumerate(SLOTS))
    with open(path, 'w', newline='\n') as f:
        f.write(text + '\n' + slot_enum + '\n')


def write_assets(cat, out):
    from PIL import Image
    src_root = os.path.join(cat.mta, 'files', 'clothes')
    dst_root = os.path.join(out, 'clothes')
    resized = 0
    for rel in sorted(cat.textures):
        src = os.path.join(src_root, rel)
        dst = os.path.join(dst_root, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        with Image.open(src) as im:
            w, h = im.size

            def pot(v):
                p = 1
                while p * 2 <= min(v, MAX_TEXTURE):
                    p *= 2
                # nearest power of two not above the limit
                return p * 2 if p * 2 <= MAX_TEXTURE and (p * 2 - v) < (v - p) else p
            nw, nh = pot(w), pot(h)
            if (nw, nh) == (w, h):
                shutil.copyfile(src, dst)
                continue
            rgba = im.convert('RGBA').resize((nw, nh), Image.LANCZOS)
            if rgba.getchannel('A').getextrema() == (255, 255):
                rgba = rgba.convert('RGB')
            rgba.save(dst, optimize=True)
            resized += 1
    with open(os.path.join(dst_root, 'look.txt'), 'w', newline='\n') as f:
        f.write('Tekstur penampilan (look/). %d file.\n' % len(cat.textures))
    for k in cat.kinds:
        folder = os.path.join(out, 'modloader', k['folder'])
        os.makedirs(folder, exist_ok=True)
        for ext in ('dff', 'txd'):
            shutil.copyfile(os.path.join(cat.mta, 'files', 'model', '%s.%s' % (k['dff'], ext)),
                            os.path.join(folder, '%s.%s' % (k['ml'], ext)))
    return resized


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--mta', required=True, help='folder of the MTA resource (config.lua, files/)')
    ap.add_argument('--gm', help='gamemodes folder: writes SERVER/player/look/look_catalog.inc')
    ap.add_argument('--assets', help='writes the textures and models for TESTLIT here')
    ap.add_argument('--cpp', default=os.path.join(HERE, '..', 'LookCatalog.gen.cpp'))
    a = ap.parse_args()
    cat = Catalog(a.mta)
    write_cpp(cat, a.cpp)
    print('client:', os.path.normpath(a.cpp))
    if a.gm:
        inc = os.path.join(a.gm, 'SERVER', 'player', 'look', 'look_catalog.inc')
        write_inc(cat, inc)
        print('gamemode:', inc)
    for k in cat.kinds:
        print('%-14s %s' % (k['key'], ', '.join('%s %d' % (s['key'], len(s['items'])) for s in k['slots'] if s['items'])))
    print('textures:', len(cat.textures))
    if a.assets:
        n = write_assets(cat, a.assets)
        print('assets:', a.assets, '(%d resized)' % n)


if __name__ == '__main__':
    main()
