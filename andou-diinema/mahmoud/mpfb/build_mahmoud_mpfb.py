"""
MAHMOUD v2 — base humaine MPFB2 (MakeHuman pour Blender, ressources CC0)
+ éléments propres à Mahmoud créés ici : barbe courte, turban, lunettes, qamis.

Prérequis (gratuits) :
  - Blender 5.3 en module Python : pip install bpy==5.3.0
  - extension MPFB 2.0.18 installée (extensions.blender.org)
  - ressources « makehuman_system_assets » (CC0), packs « faceunits01 » et « visemes01 »
Usage :
  python build_mahmoud_mpfb.py --packs <dossier packs> [--outfit emeraude] [--out ../dist]

Les noms des expressions et des animations sont IDENTIQUES au prototype v1 :
le composant React (src/mahmoud) fonctionne sans changement.
Repère : Z vers le haut, Mahmoud regarde vers -Y, sa gauche = +X.
"""
import argparse, math, os, sys
import numpy as np
import bpy, bmesh, addon_utils
from mathutils import Vector, Matrix, Quaternion
from mathutils.bvhtree import BVHTree
from mathutils.kdtree import KDTree

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
ap = argparse.ArgumentParser()
ap.add_argument('--outfit', default='emeraude')
ap.add_argument('--packs', required=True)
ap.add_argument('--out', default=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dist'))
args = ap.parse_args(argv)
OUT = os.path.abspath(args.out); os.makedirs(OUT, exist_ok=True)

# ------------------------------------------------------------------ IDENTITÉ (ne change jamais avec la tenue)
PHENOTYPE = {'gender': 1.0, 'age': 0.54, 'muscle': 0.52, 'weight': 0.40, 'proportions': 0.62, 'height': 0.55,
             'cupsize': 0.5, 'firmness': 0.5, 'race': {'african': 0.55, 'caucasian': 0.30, 'asian': 0.15}}
BODYPARTS = {'eyes': 'high-poly.mhclo', 'eyebrows': 'eyebrow002.mhclo', 'eyelashes': 'eyelashes01.mhclo',
             'teeth': 'teeth_base.mhclo', 'tongue': 'tongue01.mhclo'}
SKIN = 'young_african_male.mhmat'
BEARD_COLOR = (0.045, 0.036, 0.032)
# ------------------------------------------------------------------ TENUES (seuls les vêtements changent)
OUTFITS = {
    'emeraude': {'qamis': (0.02, 0.27, 0.17), 'trim': (0.78, 0.60, 0.28), 'turban': (0.94, 0.93, 0.89), 'shoes': 'shoes01.mhclo', 'base': 'male_casualsuit02.mhclo'},
}
OUTFIT = OUTFITS[args.outfit]

def lin(c): return tuple(((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4) for x in c)
def smoothstep(e0, e1, x):
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t)

bpy.ops.wm.read_factory_settings(use_empty=True)
addon_utils.enable('bl_ext.user_default.mpfb', default_set=True)
from bl_ext.user_default.mpfb.services.humanservice import HumanService
from bl_ext.user_default.mpfb.services.targetservice import TargetService
from bl_ext.user_default.mpfb.services.assetservice import AssetService

# ------------------------------------------------------------------ 1. HUMAIN MPFB
hi = HumanService._create_default_human_info_dict()
hi['phenotype'] = PHENOTYPE
hi.update(BODYPARTS)
hi.update({'rig': 'game_engine', 'skin_mhmat': SKIN, 'skin_material_type': 'GAMEENGINE', 'eyes_material_type': 'GAMEENGINE', 'alternative_materials': {}, 'name': 'Mahmoud'})
st = HumanService.get_default_deserialization_settings(); st['subdiv_levels'] = 0
body = HumanService.deserialize_from_dict(hi, st)
rig = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
for asset in (OUTFIT['shoes'], OUTFIT['base']):
    HumanService.add_mhclo_asset(AssetService.find_asset_absolute_path(asset, 'clothes'), body, asset_type='Clothes', subdiv_levels=0, material_type='GAMEENGINE')
TargetService.bake_targets(body)
body.name = 'Corps'

# teint : texture MPFB éclaircie vers un brun chaud (identique pour toutes les tenues), 1024 px, opaque
SKIN_GAMMA, SKIN_TINT = 0.74, (1.03, 1.0, 0.95)
for m in body.data.materials:
    nt = m.node_tree
    for n in list(nt.nodes):
        if n.type == 'TEX_IMAGE' and n.image and 'alpha' in n.name.lower(): nt.nodes.remove(n)
        elif n.type == 'TEX_IMAGE' and n.image:
            img = n.image.copy(); img.scale(1024, 1024)
            px = np.empty(len(img.pixels), dtype=np.float32); img.pixels.foreach_get(px); px = px.reshape(-1, 4)
            px[:, :3] = np.clip(px[:, :3] ** SKIN_GAMMA * np.array(SKIN_TINT), 0, 1)
            img.pixels.foreach_set(px.ravel()); img.name = 'peau_mahmoud'; img.pack(); n.image = img
    try: m.surface_render_method = 'DITHERED'
    except Exception: pass
    bsdf = nt.nodes.get('Principled BSDF')
    if bsdf:
        for l in list(bsdf.inputs['Alpha'].links): nt.links.remove(l)
        bsdf.inputs['Alpha'].default_value = 1.0; bsdf.inputs['Roughness'].default_value = 0.55
proxies = [o for o in bpy.data.objects if o.type == 'MESH' and o is not body]
def proxy(kind): return next(o for o in proxies if kind in o.name)

# repères anatomiques (cubes d'articulation MPFB) avant suppression des aides
def group_center(name):
    gi = body.vertex_groups[name].index
    pts = [v.co for v in body.data.vertices if any(g.group == gi and g.weight > 0.5 for g in v.groups)]
    return sum(pts, Vector()) / len(pts)
L = {k: group_center('joint-' + k) for k in ('mouth', 'l-eye', 'r-eye', 'head', 'head-2', 'jaw', 'neck', 'l-hand', 'r-hand', 'l-elbow', 'l-shoulder', 'l-upper-leg', 'l-knee', 'l-ankle')}

# ------------------------------------------------------------------ 2. EXPRESSIONS (face units + visèmes → noms du prototype)
FU = os.path.join(args.packs, 'targets', 'faceunits'); VI = os.path.join(args.packs, 'targets', 'visemes')
COMBOS = {
    'Blink': {'eyeBlinkLeft': 1, 'eyeBlinkRight': 1},
    'Smile': {'mouthSmileLeft': 0.75, 'mouthSmileRight': 0.75, 'cheekSquintLeft': 0.35, 'cheekSquintRight': 0.35, 'eyeSquintLeft': 0.15, 'eyeSquintRight': 0.15},
    'Sad': {'mouthFrownLeft': 0.65, 'mouthFrownRight': 0.65, 'mouthShrugLower': 0.2},
    'BrowUp': {'browOuterUpLeft': 0.75, 'browOuterUpRight': 0.75, 'browInnerUp': 0.45},
    'BrowFrown': {'browDownLeft': 0.75, 'browDownRight': 0.75},
    'BrowSad': {'browInnerUp': 0.85},
    'MouthOpen': {'aa_02': 0.65, 'jawOpen': 0.15},
    'MouthWide': {'ey_eh_uh_04': 0.6, 'y_iy_ih_ix_06': 0.45},
    'MouthRound': {'ow_08': 0.7, 'w_uw_07': 0.45},
    'MouthClosed': {'p_b_m_21': 1.0},
}
raw = sorted({k for c in COMBOS.values() for k in c})
for k in raw:
    p = os.path.join(FU, k + '.target')
    if not os.path.exists(p): p = os.path.join(VI, k + '.target')
    TargetService.load_target(body, p, weight=0.0, name=k)
KB = body.data.shape_keys.key_blocks
def set_mix(mix):
    for kb in KB[1:]: kb.value = 0.0
    for k, w in mix.items(): KB[k].value = w
for name, mix in COMBOS.items():
    set_mix(mix); body.shape_key_add(name=name, from_mix=True)
set_mix({})

# les éléments posés sur le visage suivent les expressions : on « cuit » leurs shape keys par Surface Deform
def bake_follow_keys(ob, names=COMBOS):
    if ob.data.shape_keys is None: ob.shape_key_add(name='Basis')
    mod = ob.modifiers.new('suivi', 'SURFACE_DEFORM'); mod.target = body
    with bpy.context.temp_override(object=ob, active_object=ob):
        bpy.ops.object.modifier_move_to_index(modifier='suivi', index=0)
        bpy.ops.object.surfacedeform_bind(modifier='suivi')
    arm = [m for m in ob.modifiers if m.type == 'ARMATURE']
    for m in arm: m.show_viewport = False
    for name in names:
        set_mix({name: 1.0})
        dg = bpy.context.evaluated_depsgraph_get(); ev = ob.evaluated_get(dg)
        coords = [v.co.copy() for v in ev.to_mesh().vertices]; ev.to_mesh_clear()
        sk = ob.shape_key_add(name=name, from_mix=False)
        for i, c in enumerate(coords): sk.data[i].co = c
    set_mix({})
    for m in arm: m.show_viewport = True
    ob.modifiers.remove(mod)

for kind in ('eyebrow', 'eyelashes', 'teeth', 'tongue'):
    bake_follow_keys(proxy(kind))

# ------------------------------------------------------------------ 3. NETTOYAGE DU CORPS (aides MPFB)
for k in raw: body.shape_key_remove(KB[k])
bm = bmesh.new(); bm.from_mesh(body.data)
dl = bm.verts.layers.deform.active
drop = {body.vertex_groups[n].index for n in ('HelperGeometry', 'JointCubes')}
bmesh.ops.delete(bm, geom=[v for v in bm.verts if any(g in drop and w > 0.5 for g, w in v[dl].items())], context='VERTS')
bm.to_mesh(body.data); bm.free()
for m in list(body.modifiers):
    if m.type == 'MASK': body.modifiers.remove(m)
for g in list(body.vertex_groups):
    if g.name not in rig.data.bones: body.vertex_groups.remove(g)

# ------------------------------------------------------------------ outils communs
MATS = {}
def mat(name, color, rough=0.6, metal=0.0, alpha=1.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*lin(color), 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    if alpha < 1:
        b.inputs['Alpha'].default_value = alpha
        try: m.surface_render_method = 'BLENDED'
        except Exception: pass
    MATS[name] = m; return m
mat('barbe', BEARD_COLOR, 0.8)
mat('qamis', OUTFIT['qamis'], 0.78)
mat('finition', OUTFIT['trim'], 0.35, 0.65)
mat('turban', OUTFIT['turban'], 0.92)
mat('turban_ombre', tuple(c * 0.88 for c in OUTFIT['turban']), 0.92)
mat('monture', (0.10, 0.075, 0.06), 0.3, 0.5)
mat('verre', (0.78, 0.88, 0.92), 0.05, 0.0, alpha=0.16)

def new_obj(name, bm, material, smooth=True):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob)
    me.materials.append(MATS[material])
    if smooth:
        for p in me.polygons: p.use_smooth = True
    return ob

def tube(name, pts, radii, material, seg=12, depth=1.0, cap=True):
    bm = bmesh.new(); rings = []
    for k, (p, rad) in enumerate(zip(pts, radii)):
        p = Vector(p); t = (Vector(pts[min(k + 1, len(pts) - 1)]) - Vector(pts[max(k - 1, 0)])).normalized()
        a = Vector((0, 1, 0)) if abs(t.y) < 0.9 else Vector((1, 0, 0))
        u = t.cross(a).normalized(); w = t.cross(u).normalized()
        rings.append([bm.verts.new(p + (u * math.cos(2 * math.pi * i / seg) + w * math.sin(2 * math.pi * i / seg) * depth) * rad) for i in range(seg)])
    for r1, r2 in zip(rings, rings[1:]):
        for i in range(seg): bm.faces.new((r1[i], r1[(i + 1) % seg], r2[(i + 1) % seg], r2[i]))
    if cap: bm.faces.new(list(reversed(rings[0]))); bm.faces.new(rings[-1])
    return new_obj(name, bm, material)

def ring_mesh(name, rings_pts, material, close_bottom=False):
    """rings_pts : liste d'anneaux (même nombre de points) du haut vers le bas."""
    bm = bmesh.new(); R = [[bm.verts.new(p) for p in ring] for ring in rings_pts]; n = len(R[0])
    for r1, r2 in zip(R, R[1:]):
        for i in range(n): bm.faces.new((r1[i], r2[i], r2[(i + 1) % n], r1[(i + 1) % n]))
    if close_bottom: bm.faces.new(R[-1])
    return new_obj(name, bm, material)

def weights_rigid(ob, bone):
    g = ob.vertex_groups.new(name=bone); g.add([v.index for v in ob.data.vertices], 1.0, 'REPLACE')
def attach(ob):
    ob.parent = rig; m = ob.modifiers.new('rig', 'ARMATURE'); m.object = rig

BVH = BVHTree.FromObject(body, bpy.context.evaluated_depsgraph_get())
BV = [v.co.copy() for v in body.data.vertices]
KD = KDTree(len(BV))
for i, c in enumerate(BV): KD.insert(c, i)
KD.balance()
GN = {g.index: g.name for g in body.vertex_groups}
def weights_from_body(ob, k=3):
    """Poids de peau copiés depuis les sommets du corps les plus proches."""
    groups = {}
    for v in ob.data.vertices:
        acc = {}; near = KD.find_n(v.co, k)
        tot = sum(1 / (d + 1e-4) for _, _, d in near)
        for _, idx, d in near:
            for g in body.data.vertices[idx].groups:
                acc[GN[g.group]] = acc.get(GN[g.group], 0) + g.weight * (1 / (d + 1e-4)) / tot
        s = sum(acc.values()) or 1
        for n, w in acc.items():
            if w / s < 0.02: continue
            if n not in groups: groups[n] = ob.vertex_groups.new(name=n)
            groups[n].add([v.index], w / s, 'REPLACE')

def dominant(vi, names):
    best, bw = None, 0
    for g in body.data.vertices[vi].groups:
        if g.weight > bw: best, bw = GN[g.group], g.weight
    return best in names

# ------------------------------------------------------------------ 4. YEUX : os dédiés pour le regard
eyes = proxy('high-poly')
EC = {s: Vector() for s in (1, -1)}; cnt = {1: 0, -1: 0}
for v in eyes.data.vertices:
    s = 1 if v.co.x > 0 else -1; EC[s] += v.co; cnt[s] += 1
for s in EC: EC[s] /= cnt[s]
bpy.context.view_layer.objects.active = rig
bpy.ops.object.mode_set(mode='EDIT')
for s, suf in ((1, 'l'), (-1, 'r')):
    b = rig.data.edit_bones.new(f'eye_{suf}'); b.head = EC[s]; b.tail = EC[s] + Vector((0, -0.03, 0)); b.parent = rig.data.edit_bones['head']
bpy.ops.object.mode_set(mode='OBJECT')
for g in list(eyes.vertex_groups): eyes.vertex_groups.remove(g)
gl, gr = eyes.vertex_groups.new(name='eye_l'), eyes.vertex_groups.new(name='eye_r')
for v in eyes.data.vertices: (gl if v.co.x > 0 else gr).add([v.index], 1.0, 'REPLACE')

EYE_TEX = AssetService.find_asset_absolute_path('brown_eye.png', 'eyes')
for m in eyes.data.materials:
    for n in m.node_tree.nodes:
        if n.type == 'TEX_IMAGE' and n.image and n.name == 'DiffuseTexture': n.image = bpy.data.images.load(EYE_TEX)

def recolor(ob, fn, size=512, opaque=True):
    """Retouche la texture d'un élément (copie redimensionnée, intégrée au fichier) et le rend opaque."""
    for m in ob.data.materials:
        nt = m.node_tree
        for n in nt.nodes:
            if n.type == 'TEX_IMAGE' and n.image and 'alpha' not in n.name.lower():
                img = n.image.copy(); img.scale(size, size)
                px = np.empty(len(img.pixels), dtype=np.float32); img.pixels.foreach_get(px); px = px.reshape(-1, 4)
                px[:, :3] = fn(px[:, :3]); img.pixels.foreach_set(px.ravel()); img.pack(); n.image = img
        if not opaque: continue           # yeux : la cornée transparente doit garder son canal alpha
        b = nt.nodes.get('Principled BSDF')
        for l in list(b.inputs['Alpha'].links): nt.links.remove(l)
        b.inputs['Alpha'].default_value = 1.0
        try: m.surface_render_method = 'DITHERED'
        except Exception: pass
def brown_iris(c):      # iris brun foncé (la texture « brown » de MakeHuman tire sur le rouge)
    lum = c @ np.array([0.3, 0.59, 0.11]); iris = np.clip((c[:, 0] - c[:, 2] - 0.08) * 4, 0, 1)[:, None]
    return c * (1 - iris) + (lum[:, None] * np.array([1.25, 0.85, 0.55])) * iris
recolor(eyes, brown_iris, opaque=False)
recolor(proxy('teeth'), lambda c: np.where((c[:, 0] - c[:, 2] > 0.12)[:, None], c * 0.85, np.clip(c * 1.12 + 0.02, 0, 0.88)))

# ------------------------------------------------------------------ 5. BARBE COURTE ET SOIGNÉE (peinte dans la texture de peau)
# Avantages : bords nets, aucune interpénétration, et la barbe suit toutes les expressions du visage.
TEETH = [v.co for v in proxy('teeth').data.vertices]
MZ = sum(c.z for c in TEETH) / len(TEETH)                 # hauteur de la bouche = centre des dents
EZ = (L['l-eye'].z + L['r-eye'].z) / 2
D = EZ - MZ
HCv = Vector((0, L['head'].y + 0.01, EZ - 0.02))
CHIN_Z = L['jaw'].z - 0.012
H_TOP = np.array([(0, -0.42), (12, -0.36), (19, 0.05), (28, 0.22), (42, 0.30), (58, 0.42), (74, 0.70), (86, 1.00), (96, 1.00), (104, 0.3), (110, -3), (180, -9)])
def beard_amount_np(P):
    phi = np.abs(np.degrees(np.arctan2(P[..., 0], -(P[..., 1] - HCv.y)))); h = (P[..., 2] - MZ) / D
    zb = np.interp(phi, [0, 40, 70, 95, 180], [CHIN_Z - 0.016, CHIN_Z - 0.008, CHIN_Z + 0.022, MZ - 0.004, MZ])
    a = np.minimum(np.interp(phi, H_TOP[:, 0], H_TOP[:, 1]) - h, (P[..., 2] - zb) / D * 1.6)
    lo, hi = 0.07 + 0.0035 * phi, 0.26 - 0.003 * phi                        # moustache posée sur la lèvre
    m = 2.2 * np.minimum(np.minimum(h - lo, hi - h), (27 - phi) / 70)
    return np.where(phi < 27, np.maximum(a, m), a)
def paint_beard():
    me = body.data
    img = next(n.image for m in me.materials for n in m.node_tree.nodes if n.type == 'TEX_IMAGE' and n.image)
    W_, H_ = img.size
    px = np.empty(W_ * H_ * 4, dtype=np.float32); img.pixels.foreach_get(px); px = px.reshape(H_, W_, 4)
    rng = np.random.default_rng(7); noise = rng.random((H_, W_)).astype(np.float32)
    noise = (noise + np.roll(noise, 1, 0) + np.roll(noise, -1, 0) + np.roll(noise, 2, 0)) / 4      # poils courts verticaux
    A = np.zeros((H_, W_), dtype=np.float32)
    co = np.array([v.co[:] for v in me.vertices]); amt_v = beard_amount_np(co)
    uvl = me.uv_layers.active.data; me.calc_loop_triangles()
    for tri in me.loop_triangles:
        vi = list(tri.vertices)
        if amt_v[vi].max() < -0.08: continue
        uv = np.array([uvl[l].uv[:] for l in tri.loops]) * [W_, H_]
        x0, y0 = np.maximum(np.floor(uv.min(0)).astype(int) - 1, 0); x1, y1 = np.minimum(np.ceil(uv.max(0)).astype(int) + 1, [W_ - 1, H_ - 1])
        xs, ys = np.meshgrid(np.arange(x0, x1 + 1), np.arange(y0, y1 + 1))
        a, b, c = uv; v0, v1 = b - a, c - a
        d00, d01, d11 = v0 @ v0, v0 @ v1, v1 @ v1; den = d00 * d11 - d01 * d01
        if abs(den) < 1e-9: continue
        qx, qy = xs + 0.5 - a[0], ys + 0.5 - a[1]
        d20, d21 = qx * v0[0] + qy * v0[1], qx * v1[0] + qy * v1[1]
        bv = (d11 * d20 - d01 * d21) / den; bw = (d00 * d21 - d01 * d20) / den; bu = 1 - bv - bw
        inside = (bu > -0.08) & (bv > -0.08) & (bw > -0.08)
        P = bu[..., None] * co[vi[0]] + bv[..., None] * co[vi[1]] + bw[..., None] * co[vi[2]]
        n = noise[ys, xs]
        al = np.clip((beard_amount_np(P) + 0.05 * (n - 0.5)) / 0.10, 0, 1); al = al * al * (3 - 2 * al) * (0.72 + 0.28 * n) * inside
        A[ys, xs] = np.maximum(A[ys, xs], al)
    hair = np.array(BEARD_COLOR, dtype=np.float32)[None, None, :] * (0.55 + 0.9 * noise[..., None])
    px[..., :3] = px[..., :3] * (1 - A[..., None]) + hair * A[..., None]
    img.pixels.foreach_set(px.ravel()); img.pack()
paint_beard()

# ------------------------------------------------------------------ 6. QAMIS : pull long CC0 (déjà ajusté et pondéré) transformé en qamis
CUT_Z = L['l-upper-leg'].z - 0.06
HAND_BONES = {n for n in rig.data.bones.keys() if any(n.startswith(p) for p in ('hand_', 'index_', 'middle_', 'ring_', 'pinky_', 'thumb_'))}
NECK_Z = L['neck'].z - 0.025
up = proxy('casualsuit'); up.name = 'Qamis'
bm = bmesh.new(); bm.from_mesh(up.data)
bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < CUT_Z + 0.02], context='VERTS')   # on retire le pantalon
bm.to_mesh(up.data); bm.free()
up.data.materials.clear(); up.data.materials.append(MATS['qamis'])
for p in up.data.polygons: p.material_index = 0; p.use_smooth = True
up.data.update()
# encolure resserrée contre le cou (le col la recouvre ensuite)
NC = Vector((0, L['neck'].y, 0))
neck_band = [c for c in BV if abs(c.z - NECK_Z) < 0.01 and abs(c.x) < 0.075 and abs(c.y - L['neck'].y) < 0.09]
NR_ = max((Vector((c.x, c.y, 0)) - NC).length for c in neck_band)
top_z = max(v.co.z for v in up.data.vertices if abs(v.co.x) < 0.1)
for v in up.data.vertices:
    c = v.co; rh = (Vector((c.x, c.y, 0)) - NC).length
    f = (1 - smoothstep(NR_ + 0.01, NR_ + 0.07, rh)) * smoothstep(top_z - 0.11, top_z - 0.03, c.z)
    if f <= 0: continue
    loc, nor, _, _ = BVH.find_nearest(c)
    v.co = c.lerp(loc + nor * 0.007, f)
up.data.update()
LE, LH = L['l-elbow'], L['l-hand']
for v in up.data.vertices:        # manches plus amples vers les poignets, coupe légèrement plus large
    c = v.co; ax = abs(c.x)
    t = smoothstep(LE.x * 0.75, LH.x - 0.03, ax) if c.z > CUT_Z + 0.1 else 0
    v.co = c + v.normal * (0.004 + 0.020 * t)
# jupe (du bassin aux chevilles) : anneaux elliptiques qui englobent les jambes
LEG_BONES = {'pelvis', 'thigh_l', 'thigh_r', 'calf_l', 'calf_r', 'foot_l', 'foot_r', 'ball_l', 'ball_r'}
legs = [c for i, c in enumerate(BV) if c.z < CUT_Z + 0.08 and dominant(i, LEG_BONES)]
ANK = L['l-ankle'].z + 0.055
N = 64; rings = []; prev = None
zs = [CUT_Z + 0.07 - (CUT_Z + 0.07 - ANK) * i / 26 for i in range(27)]
for i, z in enumerate(zs):
    band = [c for c in legs if abs(c.z - z) < 0.03] or legs
    ax = max(abs(c.x) for c in band); y0, y1 = min(c.y for c in band), max(c.y for c in band)
    cy = (y0 + y1) / 2; ay = (y1 - y0) / 2
    k = min(1.0, i / 2)
    ax, ay = ax + 0.006 + 0.022 * k + 0.05 * (i / 26) ** 1.5, ay + 0.006 + 0.020 * k + 0.035 * (i / 26) ** 1.5
    if prev: ax, ay = max(ax, prev[0]), max(ay, prev[1])
    prev = (ax, ay)
    rings.append([Vector((math.cos(2 * math.pi * j / N) * ax, cy + math.sin(2 * math.pi * j / N) * ay, z)) for j in range(N)])
skirt = ring_mesh('Qamis.bas', rings, 'qamis')
skirt.data.materials.append(MATS['finition'])
for p in skirt.data.polygons: p.material_index = 1 if p.center.z < ANK + 0.02 else 0
# col, patte et boutons dorés
UPBVH = BVHTree.FromObject(up, bpy.context.evaluated_depsgraph_get())
def front_point(x, z, off=0.0015):
    hit = UPBVH.ray_cast(Vector((x, -1, z)), Vector((0, 1, 0)))
    return (hit[0] + hit[1] * off) if hit[0] else Vector((x, -0.12, z))
UPV = [v.co.copy() for v in up.data.vertices]
top = [c for c in UPV if c.z > max(c2.z for c2 in UPV if abs(c2.x) < 0.1) - 0.03 and abs(c.x) < 0.1]
nax = max(abs(c.x) for c in top); ny0, ny1 = min(c.y for c in top), max(c.y for c in top); nz = sum(c.z for c in top) / len(top)
neck_b = [c for c in BV if abs(c.z - (nz + 0.035)) < 0.008 and abs(c.x) < 0.075 and abs(c.y - L['neck'].y) < 0.09]
kx = max(abs(c.x) for c in neck_b); ky0, ky1 = min(c.y for c in neck_b), max(c.y for c in neck_b)
def oval(cx_, cy_, rx, ry, z): return [Vector((math.cos(a) * rx, cy_ + math.sin(a) * ry, z)) for a in [2 * math.pi * j / 48 for j in range(48)]]
neck_c = [c for c in BV if abs(c.z - (nz + 0.016)) < 0.008 and abs(c.x) < 0.075 and abs(c.y - L['neck'].y) < 0.09]
kx = max(abs(c.x) for c in neck_c); ky0, ky1 = min(c.y for c in neck_c), max(c.y for c in neck_c); kcy, kry = (ky0 + ky1) / 2, (ky1 - ky0) / 2
def neckline_ring(cy_, n=48):
    """Points du bord réel de l'encolure du pull (arêtes de bord), un par angle autour du cou."""
    me = up.data; cnt = {}
    for e in me.edges:
        for k in (tuple(sorted(e.vertices)),): cnt[k] = cnt.get(k, 0)
    for p_ in me.polygons:
        for k in p_.edge_keys: cnt[k] = cnt.get(k, 0) + 1
    edge_v = {i for k, c in cnt.items() if c == 1 for i in k}
    pts = [me.vertices[i].co.copy() for i in edge_v if abs(me.vertices[i].co.x) < 0.13 and me.vertices[i].co.z > NECK_Z - 0.12]
    ring = []
    for j in range(n):
        a = 2 * math.pi * j / n
        best = min(pts, key=lambda c: abs(math.atan2(c.y - cy_, c.x) - a) if abs(math.atan2(c.y - cy_, c.x) - a) < math.pi else 2 * math.pi - abs(math.atan2(c.y - cy_, c.x) - a))
        ring.append(best + Vector((0, 0, -0.002)))
    return ring
ring = neckline_ring(kcy, 64)
# col rond uni : le bord roulé du pull long sert d'encolure
front_z = min(c.z for c in ring if c.y < kcy)
pz = [front_z - 0.012 - 0.042 * i for i in range(6)]
placket = tube('Patte', [front_point(0, z) for z in pz], [0.0062] * len(pz), 'finition', 10, 0.3)
buttons = []
for i, z in enumerate(pz[1:5]):
    bmb = bmesh.new(); bmesh.ops.create_uvsphere(bmb, u_segments=12, v_segments=8, radius=0.0048)
    c = front_point(0, z, 0.004)
    for v in bmb.verts: v.co = c + Vector((v.co.x, v.co.y * 0.6, v.co.z))
    buttons.append(new_obj(f'Bouton{i}', bmb, 'finition'))
# poignets dorés : anneau à l'extrémité de chaque manche
cuffs = []
for s, suf in ((1, 'L'), (-1, 'R')):
    Hs = Vector((LH.x * s, LH.y, LH.z)); Es = Vector((LE.x * s, LE.y, LE.z))
    d = (Hs - Es).normalized()
    far = sorted([c for c in UPV if c.x * s > 0.15], key=lambda c: -(c - Es).dot(d))[:40]
    cen = sum(far, Vector()) / len(far); rad = sum((c - cen - d * (c - cen).dot(d)).length for c in far) / len(far)
    a = Vector((0, 0, 1)) if abs(d.z) < 0.9 else Vector((1, 0, 0)); u = d.cross(a).normalized(); w = d.cross(u).normalized()
    cuffs.append(ring_mesh(f'Poignet.{suf}', [[cen + d * dd + (u * math.cos(2 * math.pi * j / 32) + w * math.sin(2 * math.pi * j / 32)) * (rad + 0.004) for j in range(32)] for dd in (-0.016, 0.002)], 'finition'))
for ob in [skirt, placket, *buttons, *cuffs]: weights_from_body(ob); attach(ob)

# ------------------------------------------------------------------ 7. TURBAN BLANC (enveloppe ajustée au crâne, tours enroulés)
head_pts = [c for c in BV if c.z > EZ - 0.02]
def section(z):
    band = [c for c in head_pts if abs(c.z - z) < 0.006]
    ax = max(abs(c.x) for c in band); y0, y1 = min(c.y for c in band), max(c.y for c in band)
    return ax, (y0 + y1) / 2, (y1 - y0) / 2
BROW_Z = EZ + 0.040
TCc = Vector((0, L['head'].y + 0.005, EZ + 0.02))
def z_edge(a): return BROW_Z + 0.002 - 0.030 * (1 - math.cos(a)) / 2
def build_turban():
    """Grille (angle autour de la tête × hauteur) : le bord inférieur suit exactement la ligne voulue."""
    NA, NR = 180, 44
    def hit_at(a, e):
        d = Vector((math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e), math.sin(e)))
        h = BVH.ray_cast(TCc + d * 0.4, -d)
        return (h[0], h[1], d) if h[0] else (TCc + d * 0.1, d, d)
    cols = []
    for i in range(NA):
        a = 2 * math.pi * i / NA; ze = z_edge(a)
        lo, hi = -0.6, 1.2
        for _ in range(30):          # élévation où la surface atteint la ligne du bord
            mid = (lo + hi) / 2
            if hit_at(a, mid)[0].z < ze: lo = mid
            else: hi = mid
        e0 = (lo + hi) / 2; col = []
        for j in range(NR):
            t = j / (NR - 1); e = e0 + (math.radians(88) - e0) * (t ** 0.9)
            p, n, d = hit_at(a, e); rel = max(0.0, p.z - ze)
            band = 0.0075 * math.exp(-((rel - 0.007) / 0.009) ** 2)
            fold = 0.0035 * (0.5 + 0.5 * math.sin(2 * math.pi * (rel / 0.017 + a / (2 * math.pi)))) * smoothstep(0.012, 0.03, rel)
            off = 0.0095 + band + fold + 0.016 * smoothstep(0.03, 0.11, rel)
            if j == 0: off = 0.004        # bord rentré contre la peau
            col.append(p + (n * 0.5 + d * 0.5).normalized() * off)
        tuck = col[0] + (TCc - col[0]).normalized() * 0.006 + Vector((0, 0, 0.004))
        cols.append([tuck] + col)
    bm = bmesh.new(); V = [[bm.verts.new(p) for p in c] for c in cols]
    top = bm.verts.new(TCc + Vector((0, 0, max(c[-1].z for c in cols) - TCc.z + 0.002)))
    for i in range(NA):
        A_, B_ = V[i], V[(i + 1) % NA]
        for j in range(len(A_) - 1): bm.faces.new((A_[j], B_[j], B_[j + 1], A_[j + 1]))
        bm.faces.new((A_[-1], B_[-1], top))
    return new_obj('Turban', bm, 'turban')
turban = [build_turban()]
for ob in turban: weights_rigid(ob, 'head'); attach(ob)
shoes = proxy('shoes')
for m in shoes.data.materials:
    b = m.node_tree.nodes.get('Principled BSDF')
    if b and not b.inputs['Base Color'].links: b.inputs['Base Color'].default_value = (*lin((0.18, 0.11, 0.07)), 1)
    elif b:   # assombrit la texture (multiplication exportée en glTF)
        tex = b.inputs['Base Color'].links[0].from_node
        mix = m.node_tree.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.blend_type = 'MULTIPLY'; mix.inputs['Factor'].default_value = 1.0
        mix.inputs[7].default_value = (*lin((0.42, 0.30, 0.24)), 1)
        m.node_tree.links.new(tex.outputs['Color'], mix.inputs[6]); m.node_tree.links.new(mix.outputs[2], b.inputs['Base Color'])

# ------------------------------------------------------------------ 8. LUNETTES
eye_front = min(v.co.y for v in eyes.data.vertices)
glasses = []
for s, suf in ((1, 'L'), (-1, 'R')):
    c = Vector((EC[s].x * 1.02, eye_front - 0.011, EC[s].z - 0.002))
    wrap = Matrix.Rotation(s * 0.16, 3, 'Z')
    ring = [c + wrap @ Vector((math.cos(2 * math.pi * i / 48) * 0.0255, 0, math.sin(2 * math.pi * i / 48) * 0.0205)) for i in range(48)]
    glasses.append(tube(f'Monture.{suf}', ring + [ring[0]], [0.0018] * 49, 'monture', 8, cap=False))
    bmg = bmesh.new(); vs = [bmg.verts.new(p) for p in ring]; bmg.faces.new(vs)
    glasses.append(new_obj(f'Verre.{suf}', bmg, 'verre', smooth=False))
    ax_e, cy_e, _ = section(EC[s].z)
    hinge = c + wrap @ Vector((s * 0.0255, 0, 0.004))
    glasses.append(tube(f'Branche.{suf}', [hinge, hinge + Vector((s * 0.004, 0.02, 0.001)), Vector((s * (ax_e + 0.003), cy_e - 0.02, c.z + 0.003)), Vector((s * (ax_e + 0.001), cy_e + 0.01, c.z - 0.008))], [0.0017] * 4, 'monture', 8))
bz = EC[1].z + 0.003; by = eye_front - 0.012
glasses.append(tube('Pont', [Vector((-0.012, by, bz)), Vector((0, by - 0.002, bz + 0.004)), Vector((0.012, by, bz))], [0.0017] * 3, 'monture', 8))
for ob in glasses: weights_rigid(ob, 'head'); attach(ob)

# ------------------------------------------------------------------ 9. ANIMATIONS (mêmes noms que le prototype)
pb = rig.pose.bones
for b in pb: b.rotation_mode = 'QUATERNION'
REST = {b.name: b.bone.matrix_local.copy() for b in pb}
ORDER = []
def walk(b):
    ORDER.append(b.name)
    for c in b.children: walk(c)
for b in rig.data.bones:
    if b.parent is None: walk(b)
def W(pitch=0, yaw=0, roll=0):
    """Rotation exprimée dans le repère du MONDE (degrés) : pitch>0 baisse la tête, yaw>0 tourne vers sa gauche, roll>0 penche vers sa gauche."""
    return Quaternion((0, 0, 1), math.radians(yaw)) @ Quaternion((1, 0, 0), math.radians(pitch)) @ Quaternion((0, 1, 0), math.radians(-roll))
FINGER_CURL = 12
def solve(dirs, world_rot):
    out, posed = {}, {}
    for name in ORDER:
        b = rig.data.bones[name]
        M0 = (posed[b.parent.name] @ REST[b.parent.name].inverted() @ REST[name]) if b.parent else REST[name]
        r0 = M0.to_quaternion(); q = Quaternion()
        if name in dirs:
            y0 = (M0.to_3x3() @ Vector((0, 1, 0))).normalized()
            q = r0.inverted() @ y0.rotation_difference(Vector(dirs[name]).normalized()) @ r0
        elif name in world_rot:
            q = r0.inverted() @ world_rot[name] @ r0
        elif name in HAND_BONES and not name.startswith('hand_'):
            q = Quaternion((1, 0, 0), math.radians(FINGER_CURL if not name.startswith('thumb') else 4))
        out[name] = q; posed[name] = M0 @ q.to_matrix().to_4x4()
    return out
def mirror(d):
    return Vector((-d[0], d[1], d[2]))
ARMS = {'upperarm_l': (0.20, 0.03, -1), 'lowerarm_l': (0.10, -0.28, -1), 'hand_l': (0.06, -0.30, -1)}
ARMS.update({k.replace('_l', '_r'): mirror(v) for k, v in ARMS.items()})
def pose(dirs=None, head=None, chest=None, neck=None):
    d = dict(ARMS); d.update(dirs or {})
    wr = {}
    if head: wr['head'] = W(*head)
    if neck: wr['neck_01'] = W(*neck)
    if chest: wr['spine_03'] = W(*chest)
    return solve(d, wr)
def R(**kw):  # directions pour le bras droit (côté -X), avec la main dans le prolongement
    out = {}
    for k, v in kw.items():
        out[k + '_r'] = v
    if 'lowerarm' in kw and 'hand' not in kw: out['hand_r'] = kw['lowerarm']
    return out
def Lft(**kw): return {k.replace('_r', '_l'): mirror(v) for k, v in R(**kw).items()}

def action(name, frames):
    act = bpy.data.actions.new(name); rig.animation_data_create(); rig.animation_data.action = act
    for f, P in frames:
        for bn, q in P.items():
            pb[bn].rotation_quaternion = q; pb[bn].keyframe_insert('rotation_quaternion', frame=f)
    act.use_fake_user = True
    tr = rig.animation_data.nla_tracks.new(); tr.name = name; tr.strips.new(name, int(frames[0][0]), act)
    rig.animation_data.action = None

action('Idle', [(1, pose()), (45, pose(head=(-1.5, 2.5, 0.8), chest=(-1.5, 0, 0))), (90, pose(head=(0.5, -2, -0.6), chest=(0.5, 0, 0))), (120, pose())])
wave = R(upperarm=(-0.55, 0.15, 0.55), lowerarm=(-0.12, -0.05, 1), hand=(-0.1, 0.0, 1))
wave2 = R(upperarm=(-0.55, 0.15, 0.55), lowerarm=(-0.45, -0.05, 0.9), hand=(-0.5, 0.0, 0.85))
action('Welcome', [(1, pose()), (14, pose(wave, head=(0, -6, 4))), (22, pose(wave2, head=(-2, -6, 4))), (30, pose(wave, head=(0, -6, 4))), (38, pose(wave2, head=(-2, -5, 3))), (46, pose(wave, head=(0, -4, 2))), (64, pose())])
ex_a = {**Lft(upperarm=(-0.30, -0.25, -0.9), lowerarm=(-0.30, -1, 0.15)), **R(upperarm=(-0.30, -0.25, -0.9), lowerarm=(-0.30, -1, 0.15))}
ex_b = {**Lft(upperarm=(-0.34, -0.2, -0.9), lowerarm=(-0.5, -1, 0.25)), **R(upperarm=(-0.28, -0.3, -0.88), lowerarm=(-0.2, -1, 0.05))}
action('Explain', [(1, pose(ex_a, head=(2, 0, 0))), (30, pose(ex_b, head=(0, 4, 2))), (60, pose(ex_a, head=(2, -3, -1))), (90, pose(ex_a, head=(2, 0, 0)))])
pt = R(upperarm=(-0.85, -0.45, 0.05), lowerarm=(-0.8, -0.6, 0.15))
action('Point', [(1, pose()), (16, pose(pt, head=(0, -14, 0), chest=(0, -6, 0))), (46, pose(pt, head=(-2, -14, 0), chest=(0, -6, 0))), (64, pose())])
th = R(upperarm=(-0.15, -0.45, -0.88), lowerarm=(0.45, -0.55, 0.72), hand=(0.3, -0.6, 0.75))
action('Think', [(1, pose()), (18, pose(th, head=(-6, -6, -6))), (60, pose(th, head=(-8, -8, -8))), (90, pose(th, head=(-6, -6, -6)))])
action('Listen', [(1, pose(head=(4, 0, 7), chest=(4, 0, 0))), (45, pose(head=(6, 3, 8), chest=(5, 0, 0))), (90, pose(head=(4, 0, 7), chest=(4, 0, 0)))])
action('Nod', [(1, pose()), (8, pose(head=(10, 0, 0))), (16, pose(head=(-2, 0, 0))), (24, pose(head=(8, 0, 0))), (34, pose())])
cel = {**Lft(upperarm=(-0.55, -0.1, 0.8), lowerarm=(-0.25, -0.15, 1)), **R(upperarm=(-0.55, -0.1, 0.8), lowerarm=(-0.25, -0.15, 1))}
cel2 = {**Lft(upperarm=(-0.55, -0.1, 0.8), lowerarm=(-0.5, -0.15, 0.9)), **R(upperarm=(-0.55, -0.1, 0.8), lowerarm=(-0.5, -0.15, 0.9))}
action('Celebrate', [(1, pose()), (12, pose(cel, head=(-8, 0, 0), chest=(-6, 0, 0))), (22, pose(cel2, head=(-6, 0, 4), chest=(-4, 0, 0))), (32, pose(cel, head=(-8, 0, -4), chest=(-6, 0, 0))), (52, pose())])
heart = R(upperarm=(-0.1, -0.4, -0.9), lowerarm=(0.9, -0.42, 0.3), hand=(0.85, -0.5, 0.2))
action('Encourage', [(1, pose()), (16, pose(heart, head=(4, 0, 4))), (30, pose(heart, head=(10, 0, 4))), (44, pose(heart, head=(2, 0, 4))), (70, pose())])
tk_a = R(upperarm=(-0.22, -0.25, -0.92), lowerarm=(-0.15, -1, 0.05))
tk_b = Lft(upperarm=(-0.22, -0.25, -0.92), lowerarm=(-0.2, -1, 0.05))
action('Talk', [(1, pose(tk_a, head=(1, 2, 0))), (30, pose(tk_b, head=(0, -3, 1))), (60, pose({**tk_a, **tk_b}, head=(2, 0, -1))), (90, pose(tk_a, head=(1, 2, 0))), (120, pose(tk_a, head=(1, 2, 0)))])
for bn, q in pose().items(): pb[bn].rotation_quaternion = q

# ------------------------------------------------------------------ 10. EXPORT
for o in bpy.data.objects:
    if o.type == 'MESH' and o.data.shape_keys:
        for kb in o.data.shape_keys.key_blocks[1:]: kb.value = 0.0
rig.name = 'Mahmoud'
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, f'mahmoud_v2_{args.outfit}.blend'))
bpy.ops.object.select_all(action='SELECT')
glb = os.path.join(OUT, 'mahmoud_v2_raw.glb')
bpy.ops.export_scene.gltf(filepath=glb, export_format='GLB', use_selection=True, export_apply=False, export_animations=True,
                          export_animation_mode='ACTIONS', export_morph=True, export_skins=True, export_yup=True, export_force_sampling=True,
                          export_image_format='JPEG', export_jpeg_quality=85)
tris = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in bpy.data.objects if o.type == 'MESH')
print(f'OK  objets={len([o for o in bpy.data.objects if o.type == "MESH"])}  triangles={tris}  actions={len(bpy.data.actions)}  -> {glb}')
