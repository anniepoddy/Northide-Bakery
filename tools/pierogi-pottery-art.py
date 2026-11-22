# Polish pottery (Boleslawiec-style) artwork for the pierogi bags (?layout=pottery):
#   PLATE: a cream plate with a brush-stroke folk wreath, rim lettering and a painted pierogi
#   EYES:  the "peacock eye" border strip
# Colors: currentColor = flavor color, var(--paper), var(--t1)/var(--t2) lighter steps.
# Run: python3 tools/pierogi-pottery-art.py out.json  -> paste PLATE and EYES into bag.html
import math, json, sys, random
f = lambda p: f"{p[0]:.1f} {p[1]:.1f}"
C = 150                                    # plate center

def petal(x, y, L, ang, W=.42):
    """A brush-loaded teardrop petal: dark base, lighter wet center."""
    ca, sa = math.cos(ang), math.sin(ang)
    tr = lambda u, v: (x + u*ca - v*sa, y + u*sa + v*ca)
    w = L*W
    d = f"M{f(tr(0,0))}C{f(tr(L*.15,-w*.9))} {f(tr(L*.85,-w*1.1))} {f(tr(L,0))}C{f(tr(L*.85,w*1.1))} {f(tr(L*.15,w*.9))} {f(tr(0,0))}Z"
    hi = f"M{f(tr(L*.35,0))}L{f(tr(L*.8,0))}"
    return (f'<path d="{d}" fill="currentColor"/>'
            f'<path d="{hi}" stroke="var(--t2)" stroke-width="{w*.55:.1f}" stroke-linecap="round" opacity=".75"/>')

def daisy(x, y, R, n=8, rot=0):
    s = "".join(petal(x + math.cos(a)*R*.22, y + math.sin(a)*R*.22, R*.78, a, .45)
                for a in [rot + i*2*math.pi/n for i in range(n)])
    s += f'<circle cx="{x}" cy="{y}" r="{R*.26:.1f}" fill="var(--paper)" stroke="currentColor" stroke-width="2"/>'
    s += f'<circle cx="{x}" cy="{y}" r="{R*.12:.1f}" fill="currentColor"/>'
    return s

def comma(x, y, L, ang, curl=1):
    """A single brush comma stroke: fat head tapering into a curl."""
    ca, sa = math.cos(ang), math.sin(ang)
    tr = lambda u, v: (x + u*ca - v*sa, y + u*sa + v*ca)
    w = L*.22*curl
    d = (f"M{f(tr(0,0))}C{f(tr(L*.1,-w*1.6))} {f(tr(L*.55,-w*1.4))} {f(tr(L,-w*.2))}"
         f"C{f(tr(L*.55,-w*.6))} {f(tr(L*.2,-w*.2))} {f(tr(0,0))}Z")
    return f'<path d="{d}" fill="currentColor"/>'

def scroll(x, y, r, ang, side=1):
    a0 = ang
    pts = [(x + r*(1-t*.7)*math.cos(a0 + side*t*4.2), y + r*(1-t*.7)*math.sin(a0 + side*t*4.2)) for t in [i/14 for i in range(15)]]
    d = "M" + " L".join(f(p) for p in pts)
    return f'<path d="{d}" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>'

def dots(x, y, ang, n=3, gap=6, r0=2.6):
    return "".join(f'<circle cx="{x+math.cos(ang)*gap*i:.1f}" cy="{y+math.sin(ang)*gap*i:.1f}" r="{max(1.1, r0-i*.5):.1f}" fill="currentColor"/>' for i in range(n))

# ---------- wreath ----------
W = []
RW = 93                                    # wreath radius
for k in range(4):                         # big daisies at the cardinal points
    a = -math.pi/2 + k*math.pi/2
    W.append(daisy(C + RW*math.cos(a), C + RW*math.sin(a), 25, 8, a))
for k in range(4):                         # smaller daisies on the diagonals
    a = -math.pi/4 + k*math.pi/2
    W.append(daisy(C + (RW+2)*math.cos(a), C + (RW+2)*math.sin(a), 15, 6, a))
for k in range(8):                         # leaf sprays in each gap, mirrored
    g = -math.pi/2 + math.pi/8 + k*math.pi/4
    gx, gy = C + RW*math.cos(g), C + RW*math.sin(g)
    for side in (1, -1):
        t = g + side*math.pi/2             # along the ring
        W.append(comma(gx + 3*math.cos(t), gy + 3*math.sin(t), 21, t + side*.25, 1.05 if side == 1 else -1.05))
    W.append(petal(C + (RW-13)*math.cos(g), C + (RW-13)*math.sin(g), 13, g + math.pi, .45))
    W.append(dots(C + (RW+12)*math.cos(g), C + (RW+12)*math.sin(g), g, 2, 5, 2.2))
rnd = random.Random(3)
for k in range(40):                        # dot ring just inside the rim
    a = k*2*math.pi/40 + math.pi/40
    W.append(f'<circle cx="{C+113*math.cos(a):.1f}" cy="{C+113*math.sin(a):.1f}" r="2.2" fill="currentColor"/>')

# ---------- painted pierogi (centered) ----------
CX, CY, RX, RY = C, 180, 76, 60
def e(rx, ry, t): return (CX + rx*math.cos(t), CY - ry*math.sin(t))
N = 17
pts = [e(RX, RY, math.pi - math.pi*i/N) for i in range(N+1)]
OUT = f"M{f(pts[0])}"
for a, b in zip(pts, pts[1:]):
    r = math.dist(a, b)*.62
    OUT += f"A{r:.1f} {r:.1f} 0 0 1 {f(b)}"
OUT += f"C{CX+50} {CY+17} {CX-50} {CY+17} {f(pts[0])}Z"
PR, PY = 62, 48
PL = f"M{f(e(PR,PY,math.pi))}A{PR} {PY} 0 0 1 {f(e(PR,PY,0))}"
PILLOW = PL + f"C{CX+44} {CY+14} {CX-44} {CY+14} {f(e(PR,PY,math.pi))}Z"
scal = [((a[0]+b[0])/2, (a[1]+b[1])/2, math.dist(a, b)*.5) for a, b in zip(pts, pts[1:])]
forks = [(e(PR+4, PY+3, math.pi - math.pi*(i+.5)/N), e(RX-5, RY-4, math.pi - math.pi*(i+.5)/N)) for i in range(N)]
P = []
P.append(f'<ellipse cx="{CX}" cy="{CY+10}" rx="{RX}" ry="9" fill="#3a2a1c" opacity=".3" filter="url(#pblur4)"/>')
P.append(f'<path d="{OUT}" fill="url(#pEdge)"/>')
P += [f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r*1.05:.1f}" fill="url(#pScal)" clip-path="url(#pOut)"/>' for x, y, r in scal]
P += [f'<path d="M{f(a)}L{f(b)}" stroke="#a88a5c" stroke-width="2" stroke-linecap="round" opacity=".6"/>' for a, b in forks]
P.append(f'<path d="{PL}" fill="none" stroke="#9c7d50" stroke-width="4" opacity=".45" filter="url(#pblur1)"/>')
P.append(f'<path d="{PILLOW}" fill="url(#pBody)"/><path d="{PILLOW}" fill="url(#pShade)"/>')
P.append(f'<ellipse cx="{CX-22}" cy="{CY-30}" rx="22" ry="10" fill="#fffaf0" opacity=".6" filter="url(#pblur4)" transform="rotate(-16 {CX-22} {CY-30})"/>')
P.append(f'<path d="{PL}" fill="none" stroke="#fff6e4" stroke-width="1" opacity=".85" transform="translate(-.6 -.8)"/>')
P.append(f'<rect x="{CX-RX}" y="{CY-RY}" width="{2*RX}" height="{RY+20}" filter="url(#pGrain)" clip-path="url(#pOut)" opacity=".45"/>')
for _ in range(70):
    a = rnd.uniform(0, math.pi); rr = rnd.uniform(0, 1)**.5
    P.append(f'<circle cx="{CX+RX*.92*rr*math.cos(a):.1f}" cy="{CY-RY*.92*rr*math.sin(a):.1f}" r="{rnd.uniform(.3,.8):.1f}" fill="#fffdf6" opacity=".8"/>')

RIM_TEXT = "HANDMADE BY THE PODEDWORNY FAMILY · POLISH BAKERY · WILLIAMSBURG, BROOKLYN · SINCE 1992 · "
PLATE = f'''<svg class="plate-svg" viewBox="0 0 300 300" aria-hidden="true">
  <defs>
    <filter id="pblur1"><feGaussianBlur stdDeviation="1"/></filter>
    <filter id="pblur4" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="4"/></filter>
    <filter id="pGrain"><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .55  0 0 0 0 .42  0 0 0 0 .26  0 0 0 -1.6 1.05"/></filter>
    <filter id="pbrush"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="8"/><feDisplacementMap in="SourceGraphic" scale="1.6"/></filter>
    <linearGradient id="pEdge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3e3c4"/><stop offset=".7" stop-color="#e2c99c"/><stop offset="1" stop-color="#c9aa77"/></linearGradient>
    <radialGradient id="pScal" cx=".38" cy=".3" r=".7"><stop offset="0" stop-color="#fff9ec" stop-opacity=".85"/><stop offset=".6" stop-color="#f1dfbd" stop-opacity=".2"/><stop offset="1" stop-color="#b8956a" stop-opacity=".35"/></radialGradient>
    <radialGradient id="pBody" cx=".36" cy=".26" r=".85"><stop offset="0" stop-color="#fbf2e1"/><stop offset=".45" stop-color="#efdcba"/><stop offset=".8" stop-color="#ddc196"/><stop offset="1" stop-color="#c7a676"/></radialGradient>
    <linearGradient id="pShade" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#8a6a40" stop-opacity="0"/><stop offset="1" stop-color="#8a6a40" stop-opacity=".45"/></linearGradient>
    <clipPath id="pOut"><path d="{OUT}"/></clipPath>
    <path id="rimPath" d="M{C-131} {C}a131 131 0 1 1 262 0a131 131 0 1 1 -262 0"/>
  </defs>
  <circle cx="{C}" cy="{C}" r="147" fill="currentColor"/>
  <circle cx="{C}" cy="{C}" r="141" fill="var(--paper)"/>
  <circle cx="{C}" cy="{C}" r="121" fill="none" stroke="currentColor" stroke-width="2.4"/>
  <circle cx="{C}" cy="{C}" r="117" fill="var(--paper)" stroke="currentColor" stroke-width=".9"/>
  <text font-family="EB Garamond, Georgia, serif" font-weight="600" font-size="12.5" letter-spacing="1" fill="currentColor"><textPath href="#rimPath" textLength="818" lengthAdjust="spacing">{RIM_TEXT}</textPath></text>
  <g filter="url(#pbrush)">{''.join(W)}</g>
  {''.join(P)}
</svg>'''

# ---------- peacock-eye border tile (34 x 34) ----------
EYES = '''<svg class="eyes-svg" width="100%" height="100%" aria-hidden="true"><defs><pattern id="eyeTile" width="34" height="34" patternUnits="userSpaceOnUse">
  <circle cx="17" cy="17" r="13.5" fill="currentColor"/><circle cx="17" cy="17" r="9.5" fill="var(--paper)"/>
  <circle cx="17" cy="17" r="7" fill="var(--t2)"/><circle cx="17" cy="17" r="3.6" fill="currentColor"/>
  <circle cx="0" cy="17" r="2.2" fill="currentColor"/><circle cx="34" cy="17" r="2.2" fill="currentColor"/>
</pattern></defs><rect width="100%" height="100%" fill="url(#eyeTile)"/></svg>'''
# ---------- flower band tile for the top band (drawn in currentColor; set color to cream) ----------
T = []
T.append(daisy(48, 36, 17, 8, -math.pi/2))
for side in (1, -1):
    T.append(comma(48 + side*20, 38, 17, 0 if side == 1 else math.pi, 1 if side == 1 else -1))
    T.append(comma(48 + side*20, 34, 13, (-.5 if side == 1 else math.pi + .5), 1 if side == 1 else -1))
T.append(dots(0, 36, 0, 1, 6, 3)); T.append(dots(96, 36, 0, 1, 6, 3))
T.append(dots(48, 10, math.pi/2, 1, 5, 2.4)); T.append(dots(48, 62, math.pi/2, 1, 5, 2.4))
MOTIF = ('<svg class="motif-svg" width="100%" height="100%" aria-hidden="true"><defs>'
         '<filter id="mbrush"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="8"/><feDisplacementMap in="SourceGraphic" scale="1.4"/></filter>'
         '<pattern id="motifTile" width="96" height="72" patternUnits="userSpaceOnUse" x="-48">' + ''.join(T) + '</pattern></defs>'
         '<rect width="100%" height="100%" fill="url(#motifTile)" filter="url(#mbrush)"/></svg>')
json.dump({"PLATE": PLATE, "EYES": EYES, "MOTIF": MOTIF}, open(sys.argv[1], "w"))
print(len(PLATE))
