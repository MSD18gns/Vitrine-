"""
MAHMOUD — compagnon d'ANDOU DIINEMA
Construction procédurale complète avec Blender (bpy) :
  modèle stylisé, matériaux, squelette, poids, expressions (shape keys),
  animations corporelles, export GLB + fichier source .blend.

Usage :
  python build_mahmoud.py [--outfit emeraude] [--out ../dist]

Repère : Z vers le haut, le personnage regarde vers -Y. Sa gauche = +X (suffixe .L).
Le visage, le corps et les proportions sont définis UNE seule fois ici ;
les tenues ne changent que les matériaux / pièces de vêtement (voir OUTFITS).
"""
import argparse, math, os, sys
import bpy, bmesh
from mathutils import Vector, Matrix, Quaternion

# ---------------------------------------------------------------- paramètres
ap = argparse.ArgumentParser()
ap.add_argument('--outfit', default='emeraude')
ap.add_argument('--out', default=os.path.join(os.path.dirname(__file__), '..', 'dist'))
args = ap.parse_args([a for a in sys.argv[1:] if a.startswith('--') or not a.endswith('.py')] if '--' not in sys.argv else sys.argv[sys.argv.index('--') + 1:])
OUT = os.path.abspath(args.out); os.makedirs(OUT, exist_ok=True)

HC = Vector((0, 0, 1.52))          # centre de la tête
SKIN = (0.69, 0.47, 0.35)          # teint chaleureux (sRGB)
BEARD = (0.10, 0.075, 0.065)
# Tenues : seules ces couleurs/réglages changent — jamais la morphologie
OUTFITS = {
    'emeraude': {'qamis': (0.03, 0.30, 0.20), 'trim': (0.80, 0.64, 0.33), 'turban': (0.95, 0.94, 0.90), 'shoes': (0.20, 0.12, 0.07)},
}
OUTFIT = OUTFITS[args.outfit]

def srgb_to_lin(c):
    return tuple(((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4) for x in c)

# ---------------------------------------------------------------- scène vide
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.fps = 30

# ---------------------------------------------------------------- matériaux
MATS = {}
def mat(name, color, rough=0.6, metal=0.0, alpha=1.0, emission=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*srgb_to_lin(color), 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if alpha < 1:
        b.inputs['Alpha'].default_value = alpha
        m.blend_method = 'BLEND' if hasattr(m, 'blend_method') else None
        try: m.surface_render_method = 'BLENDED'
        except Exception: pass
    MATS[name] = m
    return m

mat('peau', SKIN, 0.55)
mat('peau_ombre', tuple(c * 0.82 for c in SKIN), 0.6)
mat('blanc_oeil', (0.96, 0.95, 0.93), 0.25)
mat('iris', (0.24, 0.14, 0.07), 0.3)
mat('pupille', (0.02, 0.02, 0.02), 0.2)
mat('reflet', (1, 1, 1), 0.1)
mat('barbe', BEARD, 0.85)
mat('levres', (0.55, 0.30, 0.25), 0.5)
mat('bouche', (0.22, 0.07, 0.07), 0.6)
mat('dents', (0.96, 0.95, 0.92), 0.3)
mat('qamis', OUTFIT['qamis'], 0.82)
mat('finition', OUTFIT['trim'], 0.35, 0.6)
mat('turban', OUTFIT['turban'], 0.9)
mat('turban_ombre', tuple(c * 0.86 for c in OUTFIT['turban']), 0.9)
mat('monture', (0.12, 0.09, 0.07), 0.35, 0.4)
mat('verre', (0.75, 0.88, 0.92), 0.05, 0.0, alpha=0.18)
mat('chaussures', OUTFIT['shoes'], 0.55)

# ---------------------------------------------------------------- utilitaires
def new_obj(name, bm, material, smooth=True):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    me.materials.append(MATS[material])
    if smooth:
        for p in me.polygons: p.use_smooth = True
    return ob

def sphere(name, r, loc, scale=(1, 1, 1), material='peau', segs=32, rings=16, deform=None, keep=None):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segs, v_segments=rings, radius=r)
    for v in bm.verts:
        v.co = Vector((v.co.x * scale[0], v.co.y * scale[1], v.co.z * scale[2])) + Vector(loc)
        if deform: v.co = deform(v.co)
    if keep:
        bmesh.ops.delete(bm, geom=[f for f in bm.faces if not all(keep(v.co) for v in f.verts)], context='FACES')
    return new_obj(name, bm, material)

def torus(name, R, r, loc, rot=(0, 0, 0), scale=(1, 1, 1), material='turban', seg=48, rseg=12, deform=None):
    bm = bmesh.new()
    for i in range(seg):
        for j in range(rseg):
            a, b = 2 * math.pi * i / seg, 2 * math.pi * j / rseg
            p = Vector(((R + r * math.cos(b)) * math.cos(a), (R + r * math.cos(b)) * math.sin(a), r * math.sin(b)))
            bm.verts.new(p)
    bm.verts.ensure_lookup_table()
    for i in range(seg):
        for j in range(rseg):
            a = i * rseg + j; b = ((i + 1) % seg) * rseg + j
            c = ((i + 1) % seg) * rseg + (j + 1) % rseg; d = i * rseg + (j + 1) % rseg
            bm.faces.new((bm.verts[a], bm.verts[b], bm.verts[c], bm.verts[d]))
    M = Matrix.Translation(loc) @ Matrix.Rotation(rot[2], 4, 'Z') @ Matrix.Rotation(rot[1], 4, 'Y') @ Matrix.Rotation(rot[0], 4, 'X') @ Matrix.Diagonal((*scale, 1))
    for v in bm.verts:
        v.co = M @ v.co
        if deform: v.co = deform(v.co)
    return new_obj(name, bm, material)

def tube(name, pts, radii, material, seg=24, depth=1.0, cap=True):
    """Tube lissé le long d'une polyligne (manches, cou, doigts)."""
    bm = bmesh.new(); rings = []
    for k, (p, rad) in enumerate(zip(pts, radii)):
        p = Vector(p)
        t = (Vector(pts[min(k + 1, len(pts) - 1)]) - Vector(pts[max(k - 1, 0)])).normalized()
        a = Vector((0, 1, 0)) if abs(t.y) < 0.9 else Vector((1, 0, 0))
        u = t.cross(a).normalized(); w = t.cross(u).normalized()
        ring = [bm.verts.new(p + (u * math.cos(2 * math.pi * i / seg) + w * math.sin(2 * math.pi * i / seg) * depth) * rad) for i in range(seg)]
        rings.append(ring)
    for r1, r2 in zip(rings, rings[1:]):
        for i in range(seg):
            bm.faces.new((r1[i], r1[(i + 1) % seg], r2[(i + 1) % seg], r2[i]))
    if cap:
        bm.faces.new(list(reversed(rings[0]))); bm.faces.new(rings[-1])
    return new_obj(name, bm, material)

def lathe(name, profile, material, seg=48, depth=0.62, front=0.0, cap_bottom=True):
    """Révolution elliptique : profile = [(z, demi_largeur)] du haut vers le bas."""
    bm = bmesh.new(); rings = []
    for z, w in profile:
        ring = []
        for i in range(seg):
            a = 2 * math.pi * i / seg
            x, y = math.cos(a) * w, math.sin(a) * w * depth
            if y < 0: y *= (1 + front)      # léger volume de poitrine à l'avant
            ring.append(bm.verts.new((x, y, z)))
        rings.append(ring)
    for r1, r2 in zip(rings, rings[1:]):
        for i in range(seg):
            bm.faces.new((r1[i], r2[i], r2[(i + 1) % seg], r1[(i + 1) % seg]))
    if cap_bottom: bm.faces.new(rings[-1])
    return new_obj(name, bm, material)

def subdivide(ob, levels=1):
    mod = ob.modifiers.new('subd', 'SUBSURF'); mod.levels = levels; mod.render_levels = levels
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.modifier_apply(modifier='subd')
    ob.select_set(False)

def smoothstep(e0, e1, x):
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t)

# ---------------------------------------------------------------- TÊTE
from mathutils.bvhtree import BVHTree
HR = 0.125
EYE_X, EYE_Z = 0.041, 0.014          # position des yeux (par rapport au centre de la tête)
def head_shape(co):
    p = co - HC
    zn = p.z / (HR * 1.1)
    # mâchoire qui s'affine, menton légèrement avancé
    if zn < 0:
        k = 1 - 0.22 * (-zn) ** 1.9
        p.x *= k
        if p.y < 0: p.y *= 1 - 0.10 * (-zn) ** 2
        if zn < -0.55 and p.y < 0: p.y -= 0.010 * smoothstep(-0.55, -0.95, zn) * smoothstep(0, -0.06, p.y)
    # pommettes
    p.x *= 1 + 0.04 * math.exp(-((zn + 0.05) / 0.25) ** 2)
    # front un peu plus plat, arrière du crâne arrondi
    if p.y < 0 and zn > 0.2: p.y *= 1 - 0.06 * smoothstep(0.2, 0.9, zn)
    if p.y > 0: p.y *= 1.06
    if p.y < -0.04:
        # orbites : creux qui logent les yeux
        for sx in (-1, 1):
            d = ((p.x - sx * EYE_X) / 0.030) ** 2 + ((p.z - EYE_Z) / 0.024) ** 2
            p.y += 0.011 * math.exp(-d)
        # arête du nez et léger relief sous les yeux
        p.y -= 0.004 * math.exp(-(p.x / 0.012) ** 2) * math.exp(-((p.z + 0.005) / 0.03) ** 2)
    return HC + p

head = sphere('Tete', HR, HC, (0.86, 0.95, 1.10), 'peau', 72, 48, head_shape)
_bvh = BVHTree.FromObject(head, bpy.context.evaluated_depsgraph_get())
def surf(x, z, off=0.0):
    """Point de la surface AVANT du visage à (x, z) (z absolu), décalé selon la normale."""
    loc, nor, _, _ = _bvh.ray_cast(Vector((x, -1.0, z)), Vector((0, 1, 0)))
    if loc is None: return Vector((x, -0.1, z)), Vector((0, -1, 0))
    return loc + nor * off, nor

def cap(name, c, R, ang, material, segs=40, rings=8, fwd=Vector((0, -1, 0))):
    """Calotte sphérique parfaitement circulaire orientée vers l'avant (iris, pupille)."""
    bm = bmesh.new(); q = Vector((0, 0, 1)).rotation_difference(fwd)
    pole = bm.verts.new(c + q @ Vector((0, 0, R))); prev = None
    for k in range(1, rings + 1):
        a = math.radians(ang) * k / rings
        ring = [bm.verts.new(c + q @ Vector((R * math.sin(a) * math.cos(2 * math.pi * i / segs), R * math.sin(a) * math.sin(2 * math.pi * i / segs), R * math.cos(a)))) for i in range(segs)]
        if prev is None:
            for i in range(segs): bm.faces.new((pole, ring[i], ring[(i + 1) % segs]))
        else:
            for i in range(segs): bm.faces.new((prev[i], ring[i], ring[(i + 1) % segs], prev[(i + 1) % segs]))
        prev = ring
    return new_obj(name, bm, material)

# ---- yeux (blanc, iris, pupille, reflet) — rattachés aux os eye.L / eye.R
EYE_R = 0.0225
EYES = {}
for s in (1, -1):
    loc, _ = surf(s * EYE_X, HC.z + EYE_Z)
    EYES[s] = Vector((s * EYE_X, loc.y + EYE_R * 0.42, HC.z + EYE_Z))   # l'œil dépasse d'environ 60 % de son rayon
eye_parts = {1: [], -1: []}
for s, c in EYES.items():
    suf = 'L' if s > 0 else 'R'
    eye_parts[s] += [
        sphere(f'Oeil.{suf}', EYE_R, c, (1, 1, 1), 'blanc_oeil', 32, 20),
        cap(f'IrisBord.{suf}', c, EYE_R * 1.003, 37, 'pupille'),
        cap(f'Iris.{suf}', c, EYE_R * 1.006, 33, 'iris'),
        cap(f'Pupille.{suf}', c, EYE_R * 1.010, 14, 'pupille', 24, 4),
        sphere(f'Reflet.{suf}', EYE_R * 0.11, c + Vector((s * 0.0045, -EYE_R * 1.02, 0.0055)), (1, 0.4, 1), 'reflet', 12, 6),
    ]

# ---- paupières : coque supérieure + ligne de cils, shape key « Blink »
def lid_rot(c, ang):
    R = Matrix.Rotation(math.radians(ang), 3, 'X')
    return lambda co: c + R @ (co - c)
lids, lashes = {}, {}
for s, c in EYES.items():
    suf = 'L' if s > 0 else 'R'
    lid = sphere(f'Paupiere.{suf}', EYE_R * 1.07, c, (1.03, 1, 1), 'peau', 40, 24, keep=lambda co, c=c: (co - c).z > -0.0002)
    lash_pts = [c + Vector((EYE_R * 1.09 * math.sin(math.radians(a)), -EYE_R * 1.09 * math.cos(math.radians(a)), 0)) for a in range(-80, 81, 10)]
    lash = tube(f'Cils.{suf}', lash_pts, [0.0011 + 0.0007 * math.cos(math.radians(a)) for a in range(-80, 81, 10)], 'barbe', 8)
    for ob in (lid, lash):
        opn, cls = lid_rot(c, -27), lid_rot(c, 52)      # ouvert : bord au-dessus de l'iris ; fermé : œil couvert
        base = [v.co.copy() for v in ob.data.vertices]
        for v, b in zip(ob.data.vertices, base): v.co = opn(b)
        ob.shape_key_add(name='Basis'); sk = ob.shape_key_add(name='Blink')
        for i, b in enumerate(base): sk.data[i].co = cls(b)
    lids[s], lashes[s] = lid, lash

# ---- sourcils (BrowUp / BrowFrown / BrowSad), posés sur la peau
def brow(s):
    suf = 'L' if s > 0 else 'R'; pts, radii = [], []
    for i in range(11):
        t = i / 10; x = s * (EYE_X - 0.021 + 0.045 * t)
        z = HC.z + EYE_Z + 0.033 + 0.006 * math.sin(math.pi * min(1, t * 1.25)) - 0.004 * t
        pts.append(surf(x, z, 0.0025)[0]); radii.append(0.0036 * (1.15 - 0.6 * t) if t > 0.2 else 0.0036 * (0.75 + 1.5 * t))
    ob = tube(f'Sourcil.{suf}', pts, radii, 'barbe', 10, 0.6)
    ob.shape_key_add(name='Basis')
    inner = lambda co: max(0.0, 1 - (abs(co.x) - (EYE_X - 0.021)) / 0.045)
    for name, fn in {
        'BrowUp': lambda co: co + Vector((0, 0, 0.0065)),
        'BrowFrown': lambda co: co + Vector((-s * 0.0025 * inner(co), 0, -0.0055 * inner(co))),
        'BrowSad': lambda co: co + Vector((0, 0, 0.0065 * inner(co) - 0.0015)),
    }.items():
        sk = ob.shape_key_add(name=name)
        for i, v in enumerate(ob.data.vertices): sk.data[i].co = fn(v.co.copy())
    return ob
brows = [brow(1), brow(-1)]

# ---- nez : arête, bout arrondi, ailes
tip, _ = surf(0, HC.z - 0.026)
nose = [
    tube('Nez.arete', [surf(0, HC.z + 0.010, -0.0045)[0], surf(0, HC.z - 0.010, -0.002)[0], tip + Vector((0, -0.003, 0.004))], [0.0060, 0.0082, 0.0098], 'peau', 20, 0.75),
    sphere('Nez.bout', 0.0115, tip + Vector((0, -0.006, 0.0)), (1, 0.95, 0.9), 'peau', 24, 16),
] + [sphere(f'Nez.aile{s}', 0.0072, surf(s * 0.0115, HC.z - 0.029)[0] + Vector((0, -0.0015, 0)), (1, 0.9, 0.8), 'peau', 16, 10) for s in (1, -1)]
ears = [sphere(f'Oreille.{"L" if s > 0 else "R"}', 0.03, (s * 0.103, 0.004, HC.z - 0.006), (0.35, 0.75, 1.15), 'peau', 20, 12) for s in (1, -1)]

# ---- bouche : décalque épousant la peau (intérieur sombre + dents + lèvre inférieure)
MZ = HC.z - 0.066
MOUTH = {   # (demi-largeur, bord haut, bord bas, relèvement des coins)
    'Basis': (0.0195, 0.0009, -0.0009, 0.0034),
    'MouthOpen': (0.0175, 0.0045, -0.0125, 0.0010),     # « A »
    'MouthWide': (0.0235, 0.0028, -0.0050, 0.0018),     # « E / I »
    'MouthRound': (0.0105, 0.0050, -0.0080, 0.0),       # « O / OU »
    'MouthClosed': (0.0185, 0.0001, -0.0001, 0.0012),   # « M B P »
    'Smile': (0.0235, 0.0018, -0.0036, 0.0105),
    'Sad': (0.0185, 0.0006, -0.0006, -0.0045),
}
NC, NR = 26, 4
def mouth_points(a, top, bot, c):
    ts = [-1 + 2 * i / (NC - 1) for i in range(NC)]
    edge = lambda t, h: MZ + h * math.sqrt(max(0.0, 1 - t * t)) + c * t * t
    pts = []
    for k in range(NR + 1):                                  # intérieur sombre
        for t in ts: pts.append(surf(a * t, edge(t, bot) + (edge(t, top) - edge(t, bot)) * k / NR, 0.0007)[0])
    for k in range(2):                                       # dents (haut de l'ouverture)
        for t in ts:
            tt = 0.78 * t; e_t, e_b = edge(tt, top) - 0.0003, edge(tt, bot)
            pts.append(surf(a * tt, e_t - (e_t - e_b) * 0.38 * (1 - k), 0.0011)[0])
    lip = [surf(a * 0.86 * t, edge(0.86 * t, bot) - 0.0030, 0.0012)[0] for t in ts]
    return pts, lip
def build_mouth():
    pts, lip = mouth_points(*MOUTH['Basis'])
    bm = bmesh.new(); V = [bm.verts.new(p) for p in pts]
    for rows, off, mi in ((NR + 1, 0, 0), (2, (NR + 1) * NC, 1)):
        for k in range(rows - 1):
            for i in range(NC - 1):
                a = off + k * NC + i
                f = bm.faces.new((V[a], V[a + 1], V[a + NC + 1], V[a + NC])); f.material_index = mi
    ob = new_obj('Bouche', bm, 'bouche')
    ob.data.materials.append(MATS['dents'])
    lip_ob = tube('Levre', lip, [0.0012 + 0.0016 * math.sin(math.pi * i / (NC - 1)) for i in range(NC)], 'levres', 10, 0.7)
    for o in (ob, lip_ob): o.shape_key_add(name='Basis')
    for name, prm in MOUTH.items():
        if name == 'Basis': continue
        p2, l2 = mouth_points(*prm)
        sk = ob.shape_key_add(name=name)
        for i, p in enumerate(p2): sk.data[i].co = p
        # la lèvre est un tube : on déplace chaque anneau comme son centre
        sk2 = lip_ob.shape_key_add(name=name); seg = 10
        for j, (c0, c1) in enumerate(zip(lip, l2)):
            for i in range(seg):
                idx = j * seg + i; sk2.data[idx].co = lip_ob.data.vertices[idx].co + (c1 - c0)
    return ob, lip_ob
mouth_ob, lip_ob = build_mouth()

# ---- barbe courte et soignée : coque qui épouse la mâchoire, bords effilés
W_TOP = [(0, -0.66), (10, -0.64), (16, -0.48), (24, -0.43), (40, -0.45), (58, -0.38), (76, -0.22), (90, -0.04), (100, -0.06), (108, -0.5), (112, -0.9)]
def w_top(phi):
    phi = abs(phi)
    if phi >= W_TOP[-1][0]: return -9
    for (p0, w0), (p1, w1) in zip(W_TOP, W_TOP[1:]):
        if p0 <= phi <= p1: return w0 + (w1 - w0) * (phi - p0) / (p1 - p0)
def beard_amount(co):
    p = co - HC
    phi = math.degrees(math.atan2(p.x, -p.y)); w = p.z / (HR * 1.1)
    return w_top(phi) - w
def build_beard():
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=144, v_segments=96, radius=1)
    lay = bm.verts.layers.float.new('amt')
    for v in bm.verts:
        d = v.co.normalized()
        hit = _bvh.ray_cast(HC + d * 0.3, -d)
        if hit[0] is None: hit = (HC + d * HR, d)
        amt = beard_amount(hit[0])
        # épaisseur continue de part et d'autre du bord : le bord visible suit exactement la courbe (pas d'escalier)
        th = 0.0011 + (0.0042 * smoothstep(0.0, 0.08, amt) if amt > 0 else 0.05 * amt)
        v.co = hit[0] + hit[1] * th
        v[lay] = amt
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if min(v[lay] for v in f.verts) < -0.06], context='FACES')
    return new_obj('Barbe', bm, 'barbe')
beard = build_beard()
mustache = tube('Moustache', [surf(x * 0.031, MZ + 0.0085 - 0.0075 * x * x, 0.0018)[0] for x in (-1, -0.75, -0.45, -0.15, 0.15, 0.45, 0.75, 1)],
                [0.0020, 0.0034, 0.0042, 0.0040, 0.0040, 0.0042, 0.0034, 0.0020], 'barbe', 12, 0.65)
mustache.scale = (1, 1, 1)

# ---- lunettes élégantes (monture fine, verres légèrement teintés)
glasses = []
LZ = HC.z + EYE_Z - 0.001
for s, c in EYES.items():
    suf = 'L' if s > 0 else 'R'
    fc = Vector((s * 0.0445, c.y - EYE_R - 0.009, LZ))
    wrap = Matrix.Rotation(s * 0.20, 3, 'Z')     # les verres suivent la courbure du visage
    glasses.append(torus(f'Monture.{suf}', 0.0245, 0.0019, fc, (math.pi / 2, 0, s * 0.20), (1.16, 1, 0.88), 'monture', 48, 8))
    bm = bmesh.new(); bmesh.ops.create_circle(bm, cap_ends=True, segments=40, radius=0.0245)
    for v in bm.verts: v.co = fc + wrap @ Matrix.Rotation(math.pi / 2, 3, 'X') @ Vector((v.co.x * 1.16, v.co.y * 0.88, 0))
    glasses.append(new_obj(f'Verre.{suf}', bm, 'verre', smooth=False))
    glasses.append(tube(f'Branche.{suf}', [fc + Vector((s * 0.027, 0.006, 0.004)), Vector((s * 0.093, -0.06, LZ + 0.005)), Vector((s * 0.101, 0.002, LZ - 0.004))], [0.0017] * 3, 'monture', 8))
bz = LZ + 0.004; by = EYES[1].y - EYE_R - 0.011
glasses.append(tube('Pont', [(-0.0155, by, bz), (0, by - 0.003, bz + 0.003), (0.0155, by, bz)], [0.0017] * 3, 'monture', 8))

# ---- turban blanc enroulé (au-dessus des sourcils)
TC = HC + Vector((0, 0.008, 0.040))
turban_parts = [sphere('Turban.dome', HR * 0.98, TC, (0.92, 0.99, 0.80), 'turban', 48, 28, keep=lambda co: co.z > HC.z + 0.075)]
for k, (dz, R, r, tilt, m) in enumerate([(0.074, 0.103, 0.0200, -0.10, 'turban_ombre'), (0.096, 0.099, 0.0195, 0.12, 'turban'), (0.116, 0.089, 0.0180, -0.07, 'turban_ombre'), (0.133, 0.072, 0.0160, 0.10, 'turban')]):
    turban_parts.append(torus(f'Turban.tour{k}', R, r, HC + Vector((0, 0.010, dz)), (tilt, 0, 0.35 * k), (0.95, 1.04, 1), m, 64, 14))
turban_parts.append(sphere('Turban.pli', 0.024, HC + Vector((0.012, -0.094, 0.103)), (1.25, 0.42, 0.85), 'turban_ombre', 20, 12))

neck = tube('Cou', [(0, 0.004, 1.30), (0, 0.004, 1.36), (0, 0.006, HC.z - 0.085)], [0.044, 0.042, 0.040], 'peau', 24)

# ---------------------------------------------------------------- QAMIS
qamis = lathe('Qamis', [(1.362, 0.050), (1.345, 0.085), (1.322, 0.150), (1.300, 0.190), (1.270, 0.205), (1.20, 0.200),
                         (1.08, 0.180), (0.95, 0.175), (0.80, 0.188), (0.55, 0.220), (0.30, 0.250), (0.10, 0.272), (0.05, 0.276)],
              'qamis', 56, 0.60, front=0.08)
subdivide(qamis, 1)
collar = lathe('Col', [(1.392, 0.047), (1.360, 0.050)], 'finition', 40, 0.95, cap_bottom=False)
hem = lathe('Ourlet', [(0.075, 0.279), (0.050, 0.281)], 'finition', 56, 0.61, front=0.08, cap_bottom=False)
PROFILE = [(1.362, 0.050), (1.345, 0.085), (1.322, 0.150), (1.300, 0.190), (1.270, 0.205), (1.20, 0.200), (1.08, 0.180), (0.95, 0.175)]
def front_y(z):   # avant du qamis à la hauteur z (même formule que lathe)
    for (z0, w0), (z1, w1) in zip(PROFILE, PROFILE[1:]):
        if z1 <= z <= z0: return -(w0 + (w1 - w0) * (z0 - z) / (z0 - z1)) * 0.60 * 1.08
    return -0.12
placket = tube('Patte', [(0, front_y(z) - 0.0015, z) for z in (1.355, 1.335, 1.30, 1.25, 1.19, 1.13)], [0.0075] * 6, 'finition', 12, 0.25)
buttons = [sphere(f'Bouton{i}', 0.0052, (0, front_y(z) - 0.004, z), (1, 0.6, 1), 'finition', 12, 8) for i, z in enumerate((1.325, 1.27, 1.21, 1.15))]

# bras (manches), mains, chaussures — position de repos en « A »
SH = {s: Vector((s * 0.195, 0.0, 1.275)) for s in (1, -1)}
EL = {s: Vector((s * 0.265, 0.012, 1.035)) for s in (1, -1)}
WR = {s: Vector((s * 0.305, -0.015, 0.825)) for s in (1, -1)}
sleeves, cuffs, hands = [], [], []
for s in (1, -1):
    suf = 'L' if s > 0 else 'R'
    pts = [SH[s] + Vector((-s * 0.07, 0, -0.04)), SH[s] + Vector((-s * 0.02, 0, -0.01)), SH[s].lerp(EL[s], 0.5), EL[s], EL[s].lerp(WR[s], 0.55), WR[s] + (WR[s] - EL[s]).normalized() * 0.01]
    sleeves.append(tube(f'Manche.{suf}', pts, [0.050, 0.060, 0.053, 0.049, 0.054, 0.064], 'qamis', 28))
    sleeves.append(sphere(f'Epaule.{suf}', 0.056, SH[s] + Vector((-s * 0.022, 0, -0.016)), (1, 0.85, 0.88), 'qamis', 28, 16))
    d = (WR[s] - EL[s]).normalized()
    cuffs.append(tube(f'Poignet.{suf}', [WR[s] - d * 0.006, WR[s] + d * 0.012], [0.065, 0.066], 'finition', 28, cap=False))
    hc = WR[s] + d * 0.040
    hands.append(sphere(f'Main.{suf}', 0.043, hc, (0.52, 0.92, 1.0), 'peau', 24, 16))
    side = Vector((0, -1, 0))
    for f in range(4):
        base = hc + d * 0.034 + side * (0.024 - 0.016 * f) + Vector((-s * 0.002, 0, 0))
        ln = 0.050 - 0.007 * abs(f - 1.2)
        hands.append(tube(f'Doigt{f}.{suf}', [base, base + d * ln * 0.55 + Vector((-s * 0.003, 0, 0)), base + d * ln + Vector((-s * 0.008, 0, 0))], [0.0098, 0.0090, 0.0080], 'peau', 12))
    tb = hc + side * 0.033 + d * -0.008 + Vector((-s * 0.006, 0, 0))
    hands.append(tube(f'Pouce.{suf}', [tb, tb + (d * 0.5 + side * 0.7).normalized() * 0.026, tb + (d * 0.8 + side * 0.6).normalized() * 0.045], [0.0110, 0.0100, 0.0088], 'peau', 12))
shoes = [sphere(f'Chaussure.{"L" if s > 0 else "R"}', 0.05, (s * 0.078, -0.065, 0.026), (0.85, 1.6, 0.55), 'chaussures', 24, 12) for s in (1, -1)]

# ---------------------------------------------------------------- SQUELETTE
arm_data = bpy.data.armatures.new('MahmoudRig')
rig = bpy.data.objects.new('Mahmoud', arm_data)
bpy.context.collection.objects.link(rig)
bpy.context.view_layer.objects.active = rig
bpy.ops.object.mode_set(mode='EDIT')
eb = arm_data.edit_bones
def bone(name, head, tail, parent=None, connect=False):
    b = eb.new(name); b.head = head; b.tail = tail; b.roll = 0
    if parent: b.parent = eb[parent]; b.use_connect = connect
    return b
bone('root', (0, 0, 0), (0, 0, 0.25))
bone('spine', (0, 0, 0.92), (0, 0, 1.14), 'root')
bone('chest', (0, 0, 1.14), (0, 0, 1.32), 'spine', True)
bone('neck', (0, 0, 1.32), (0, 0, HC.z - 0.085), 'chest', True)
bone('head', (0, 0, HC.z - 0.085), (0, 0, HC.z + 0.17), 'neck', True)
for s in (1, -1):
    suf = 'L' if s > 0 else 'R'
    c = EYES[s]
    bone(f'eye.{suf}', c, c + Vector((0, -0.04, 0)), 'head')
    bone(f'shoulder.{suf}', (s * 0.04, 0, 1.30), SH[s], 'chest')
    bone(f'upperarm.{suf}', SH[s], EL[s], f'shoulder.{suf}', True)
    bone(f'forearm.{suf}', EL[s], WR[s], f'upperarm.{suf}', True)
    bone(f'hand.{suf}', WR[s], WR[s] + (WR[s] - EL[s]).normalized() * 0.09, f'forearm.{suf}', True)
bpy.ops.object.mode_set(mode='OBJECT')

# ---------------------------------------------------------------- POIDS
def bind(ob, weights_fn):
    """weights_fn(co) -> {bone: poids} ; normalisé ensuite."""
    groups = {}
    for v in ob.data.vertices:
        w = weights_fn(ob.matrix_world @ v.co)
        tot = sum(w.values()) or 1
        for bn, x in w.items():
            if x <= 0: continue
            if bn not in groups: groups[bn] = ob.vertex_groups.new(name=bn)
            groups[bn].add([v.index], x / tot, 'REPLACE')
    ob.parent = rig
    mod = ob.modifiers.new('rig', 'ARMATURE'); mod.object = rig

def rigid(bn): return lambda co: {bn: 1.0}

for ob in [head, *nose, mouth_ob, lip_ob, beard, mustache, *ears, *brows, *glasses, *turban_parts, *lids.values(), *lashes.values()]:
    bind(ob, rigid('head'))
for s, parts in eye_parts.items():
    for ob in parts: bind(ob, rigid(f'eye.{"L" if s > 0 else "R"}'))
bind(neck, lambda co: {'neck': smoothstep(1.30, 1.40, co.z), 'chest': 1 - smoothstep(1.30, 1.40, co.z)})

def seg_t(co, a, b):
    ab = b - a; return max(0.0, min(1.0, (co - a).dot(ab) / ab.length_squared))
def arm_weights(s):
    suf = 'L' if s > 0 else 'R'
    def fn(co):
        t1 = seg_t(co, SH[s], EL[s]); t2 = seg_t(co, EL[s], WR[s])
        d1 = (co - SH[s].lerp(EL[s], t1)).length; d2 = (co - EL[s].lerp(WR[s], t2)).length
        if d2 < d1 or t1 > 0.98:
            f = smoothstep(0.0, 0.25, t2)
            return {f'forearm.{suf}': f, f'upperarm.{suf}': 1 - f}
        f = smoothstep(0.0, 0.2, t1)
        return {f'upperarm.{suf}': f, f'shoulder.{suf}': (1 - f) * 0.7, 'chest': (1 - f) * 0.3}
    return fn
for ob in sleeves: bind(ob, arm_weights(1 if ob.name.endswith('L') else -1))
for ob in cuffs + hands: bind(ob, rigid(f'hand.{ob.name[-1]}') if not ob.name.startswith('Poignet') else rigid(f'forearm.{ob.name[-1]}'))

def body_weights(co):
    w = {}
    up = smoothstep(1.06, 1.22, co.z)
    w['chest'] = up; w['spine'] = (1 - up) * smoothstep(0.55, 0.95, co.z); w['root'] = 1 - up - w['spine']
    for s in (1, -1):   # épaules du qamis qui suivent un peu les bras
        suf = 'L' if s > 0 else 'R'
        k = smoothstep(0.13, 0.20, s * co.x) * smoothstep(1.18, 1.27, co.z)
        if k > 0:
            w[f'shoulder.{suf}'] = 0.6 * k; w[f'upperarm.{suf}'] = 0.25 * k
            for kk in ('chest', 'spine', 'root'): w[kk] *= (1 - 0.85 * k)
    return w
for ob in [qamis, collar, hem, placket, *buttons]: bind(ob, body_weights)
for ob in shoes: bind(ob, rigid('root'))

# ---------------------------------------------------------------- ANIMATIONS
pb = rig.pose.bones
for b in pb: b.rotation_mode = 'QUATERNION'
REST = {b.name: b.bone.matrix_local.copy() for b in pb}

def basis_for_dirs(dirs, extra=None):
    """dirs : {os: direction monde souhaitée}. Calcule les rotations locales (chaîne parent → enfant)."""
    out, posed = {}, {}
    order = ['root', 'spine', 'chest', 'neck', 'head'] + [f'{n}.{s}' for s in ('L', 'R') for n in ('shoulder', 'upperarm', 'forearm', 'hand', 'eye')]
    for name in order:
        b = rig.data.bones[name]
        M0 = (posed[b.parent.name] @ REST[b.parent.name].inverted() @ REST[name]) if b.parent else REST[name]
        q = Quaternion()
        if extra and name in extra: q = extra[name]
        if name in dirs:
            y0 = (M0.to_3x3() @ Vector((0, 1, 0))).normalized()
            qa = y0.rotation_difference(Vector(dirs[name]).normalized())
            r0 = M0.to_quaternion()
            q = r0.inverted() @ qa @ r0
        out[name] = q
        posed[name] = M0 @ q.to_matrix().to_4x4()
    return out

def E(x=0, y=0, z=0):  # Euler (degrés) dans le repère local de l'os
    return Quaternion((1, 0, 0), math.radians(x)) @ Quaternion((0, 1, 0), math.radians(y)) @ Quaternion((0, 0, 1), math.radians(z))

ARMS_DOWN = {'upperarm.L': (0.13, 0.02, -1), 'forearm.L': (0.06, -0.12, -1), 'upperarm.R': (-0.13, 0.02, -1), 'forearm.R': (-0.06, -0.12, -1)}
def pose(dirs=None, extra=None):
    d = dict(ARMS_DOWN); d.update(dirs or {})
    return basis_for_dirs(d, extra)

def action(name, frames, loop=False):
    """frames : [(frame, pose_dict)] — crée une action dédiée."""
    act = bpy.data.actions.new(name)
    rig.animation_data_create(); rig.animation_data.action = act
    for f, P in frames:
        for bn, q in P.items():
            pb[bn].rotation_quaternion = q
            pb[bn].keyframe_insert('rotation_quaternion', frame=f)
    # interpolation douce
    try:
        for fc in act.fcurves:
            for kp in fc.keyframe_points: kp.interpolation = 'BEZIER'; kp.easing = 'AUTO'
    except Exception:
        pass
    act.use_fake_user = True
    track = rig.animation_data.nla_tracks.new(); track.name = name
    track.strips.new(name, int(frames[0][0]), act)
    rig.animation_data.action = None
    return act

H = lambda x=0, y=0, z=0: {'head': E(x, y, z)}
def merge(*ds):
    o = {}
    for d in ds: o.update(d)
    return o

# Repos / respiration (boucle)
action('Idle', [
    (1, pose(extra=merge({'chest': E(0), 'spine': E(0)}, H()))),
    (45, pose(extra=merge({'chest': E(-1.8), 'spine': E(0, 0, 0.6)}, H(-1.5, 2.5, 0.8)))),
    (90, pose(extra=merge({'chest': E(0.3), 'spine': E(0, 0, -0.5)}, H(0.5, -2, -0.6)))),
    (120, pose(extra=merge({'chest': E(0), 'spine': E(0)}, H()))),
])
# Bienvenue : la main droite se lève et salue
up_r = {'upperarm.R': (-0.55, -0.25, 0.55), 'forearm.R': (-0.15, -0.35, 1)}
action('Welcome', [
    (1, pose()),
    (14, pose(up_r, H(0, 6, 4))),
    (22, pose({**up_r, 'forearm.R': (-0.45, -0.3, 0.9)}, H(-2, 6, 4))),
    (30, pose({**up_r, 'forearm.R': (0.12, -0.35, 1)}, H(0, 6, 4))),
    (38, pose({**up_r, 'forearm.R': (-0.45, -0.3, 0.9)}, H(-2, 5, 3))),
    (46, pose(up_r, H(0, 4, 2))),
    (64, pose()),
])
# Explication : mains ouvertes vers l'avant, mouvement posé
ex_a = {'upperarm.L': (0.30, -0.35, -0.9), 'forearm.L': (0.35, -1, 0.10), 'upperarm.R': (-0.30, -0.35, -0.9), 'forearm.R': (-0.35, -1, 0.10)}
ex_b = {'upperarm.L': (0.34, -0.30, -0.9), 'forearm.L': (0.55, -1, 0.25), 'upperarm.R': (-0.28, -0.40, -0.88), 'forearm.R': (-0.25, -1, 0.0)}
action('Explain', [(1, pose(ex_a, H(2, 0, 0))), (30, pose(ex_b, H(0, -4, 2))), (60, pose(ex_a, H(2, 3, -1))), (90, pose(ex_a, H(2, 0, 0)))])
# Désignation : bras droit vers un élément (à sa droite, vers l'avant)
action('Point', [
    (1, pose()),
    (16, pose({'upperarm.R': (-0.85, -0.45, 0.05), 'forearm.R': (-0.8, -0.6, 0.15)}, merge(H(0, -14, 0), {'chest': E(0, -6, 0)}))),
    (46, pose({'upperarm.R': (-0.85, -0.45, 0.08), 'forearm.R': (-0.8, -0.6, 0.18)}, merge(H(-2, -14, 0), {'chest': E(0, -6, 0)}))),
    (64, pose()),
])
# Réflexion : main au menton, tête inclinée
th = {'upperarm.R': (-0.18, -0.5, -0.85), 'forearm.R': (0.45, -0.55, 0.72)}
action('Think', [(1, pose()), (18, pose(th, H(-6, 6, -6))), (60, pose(th, H(-8, 8, -8))), (90, pose(th, H(-6, 6, -6)))])
# Écoute : légère inclinaison vers l'avant, tête penchée
action('Listen', [(1, pose(extra=merge({'chest': E(4)}, H(4, 0, 7)))), (45, pose(extra=merge({'chest': E(5)}, H(6, 3, 8)))), (90, pose(extra=merge({'chest': E(4)}, H(4, 0, 7))))])
# Hochement de tête (acquiescement)
action('Nod', [(1, pose()), (8, pose(extra=H(10))), (16, pose(extra=H(-2))), (24, pose(extra=H(8))), (34, pose())])
# Réussite : bras levés avec joie, puis retour
cel = {'upperarm.L': (0.55, -0.15, 0.8), 'forearm.L': (0.3, -0.2, 1), 'upperarm.R': (-0.55, -0.15, 0.8), 'forearm.R': (-0.3, -0.2, 1)}
action('Celebrate', [(1, pose()), (12, pose(cel, merge({'chest': E(-6)}, H(-8)))), (22, pose({**cel, 'forearm.L': (0.5, -0.2, 0.9), 'forearm.R': (-0.5, -0.2, 0.9)}, merge({'chest': E(-4)}, H(-6, 0, 4)))), (32, pose(cel, merge({'chest': E(-6)}, H(-8, 0, -4)))), (52, pose())])
# Encouragement : main sur le cœur, hochement bienveillant
heart = {'upperarm.R': (-0.12, -0.45, -0.88), 'forearm.R': (0.9, -0.45, 0.32)}
action('Encourage', [(1, pose()), (16, pose(heart, H(4, 0, 4))), (30, pose(heart, H(10, 0, 4))), (44, pose(heart, H(2, 0, 4))), (70, pose())])
# Parole : gestes légers en boucle (la bouche est animée à part)
tk_a = {'upperarm.R': (-0.22, -0.3, -0.92), 'forearm.R': (-0.15, -1, 0.0)}
tk_b = {'upperarm.L': (0.22, -0.3, -0.92), 'forearm.L': (0.2, -1, 0.05)}
action('Talk', [(1, pose(tk_a, H(1, 2))), (30, pose(tk_b, H(0, -3, 1))), (60, pose({**tk_a, **tk_b}, H(2, 0, -1))), (90, pose(tk_a, H(1, 2))), (120, pose(tk_a, H(1, 2)))])

# position de repos du rig = bras le long du corps (pour l'affichage sans animation)
for bn, q in pose().items(): pb[bn].rotation_quaternion = q

# ---------------------------------------------------------------- EXPORT
# Blender 5 crée les shape keys avec une valeur de 1 : expressions neutres par défaut
for o in bpy.data.objects:
    if o.type == 'MESH' and o.data.shape_keys:
        for kb in o.data.shape_keys.key_blocks[1:]: kb.value = 0.0
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, f'mahmoud_{args.outfit}.blend'))
bpy.ops.object.select_all(action='SELECT')
glb = os.path.join(OUT, 'mahmoud_raw.glb')
bpy.ops.export_scene.gltf(filepath=glb, export_format='GLB', use_selection=True, export_apply=False,
                          export_animations=True, export_animation_mode='ACTIONS', export_nla_strips=True,
                          export_morph=True, export_skins=True, export_yup=True, export_force_sampling=True,
                          export_frame_range=False)
tris = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in bpy.data.objects if o.type == 'MESH')
print(f'OK  objets={len([o for o in bpy.data.objects if o.type == "MESH"])}  triangles={tris}  actions={len(bpy.data.actions)}  -> {glb}')
