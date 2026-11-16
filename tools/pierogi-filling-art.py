# Draws the pierogi filling illustrations used on the bags (?layout=circle-art).
# Run: python3 tools/pierogi-filling-art.py out.json  -> paste the JSON into FILLINGS in packaging/pierogi-bag/bag.html
# One big pierogi, cut away to show its filling, plus a few whole ingredients beside it.
# Colors: currentColor = flavor ink, var(--paper), var(--t1) light tint, var(--t2) mid tint, var(--t0) faint tint.
import math, random, json, sys
INK = 'currentColor'
def ell(cx, cy, rx, ry, t): return (cx + rx*math.cos(t), cy - ry*math.sin(t))
def f(p): return f"{p[0]:.1f} {p[1]:.1f}"
CX, CY = 200, 182
def outline():
    n = 21
    pts = [ell(CX, CY, 162, 128, math.pi - math.pi*i/n) for i in range(n+1)]
    d = f"M{f(pts[0])}"
    for a, b in zip(pts, pts[1:]):
        r = math.dist(a, b)*0.6
        d += f"A{r:.1f} {r:.1f} 0 0 1 {f(b)}"
    d += f"C{CX+110} {CY+34} {CX-110} {CY+34} {pts[0][0]:.1f} {pts[0][1]:.1f}Z"
    forks = ""
    for i in range(n):
        t = math.pi - math.pi*(i+.5)/n
        forks += f"M{f(ell(CX,CY,140,108,t))}L{f(ell(CX,CY,154,120,t))}"
    pillow = f"M{f(ell(CX,CY,134,102,math.pi))}A134 102 0 0 1 {f(ell(CX,CY,134,102,0))}C{CX+96} {CY+30} {CX-96} {CY+30} {f(ell(CX,CY,134,102,math.pi))}Z"
    return d, forks, pillow
OUT, FORKS, PILLOW = outline()

def P(d, fill="none", sw=1.8, stroke=INK, extra=""):
    return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"{extra}/>'

def blob(x, y, r, n=7, jit=.28, rnd=None):
    rnd = rnd or random
    pts = []
    for i in range(n):
        a = 2*math.pi*i/n + rnd.uniform(-.2, .2)
        rr = r*(1 + rnd.uniform(-jit, jit))
        pts.append((x + rr*math.cos(a), y + rr*math.sin(a)))
    d = f"M{f(((pts[-1][0]+pts[0][0])/2, (pts[-1][1]+pts[0][1])/2))}"
    for i, p in enumerate(pts):
        q = pts[(i+1) % n]
        d += f"Q{f(p)} {f(((p[0]+q[0])/2, (p[1]+q[1])/2))}"
    return d + "Z"

def berry(x, y, r, crown=True):
    s = f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="var(--t2)" stroke="{INK}" stroke-width="1.7"/>'
    s += P(f"M{x-r*.62:.1f} {y-r*.05:.1f}A{r*.62:.1f} {r*.62:.1f} 0 0 1 {x-r*.1:.1f} {y-r*.6:.1f}", "none", 1.5, "var(--paper)")
    if crown:
        cx, cy, k = x + r*.3, y - r*.3, r*.3
        d = "".join(f"M{cx:.1f} {cy:.1f}l{k*math.cos(a):.1f} {k*math.sin(a):.1f}" for a in [i*2*math.pi/5 - math.pi/2 for i in range(5)])
        s += P(d, "none", 1.3)
    return s

def leaf(x, y, L, ang, fill="var(--t1)", W=.36, veins=4):
    ca, sa = math.cos(ang), math.sin(ang)
    def tr(u, v): return (x + u*ca - v*sa, y + u*sa + v*ca)
    w = L*W
    d = f"M{f(tr(0,0))}C{f(tr(L*.25,-w))} {f(tr(L*.75,-w*.9))} {f(tr(L,0))}C{f(tr(L*.75,w*.9))} {f(tr(L*.25,w))} {f(tr(0,0))}Z"
    s = P(d, fill, 1.8)
    s += P(f"M{f(tr(-L*.12,0))}L{f(tr(L*.92,0))}", "none", 1.5)
    vd = ""
    for i in range(1, veins+1):
        u = L*i/(veins+1.2)
        vd += f"M{f(tr(u,0))}L{f(tr(u+L*.13,-w*.62))}M{f(tr(u,0))}L{f(tr(u+L*.13,w*.62))}"
    return s + P(vd, "none", 1.1)

def crumb(x, y, r, rnd):
    s = P(blob(x, y, r, 6, .38, rnd), "var(--paper)", 1.5)
    return s + f'<circle cx="{x+rnd.uniform(-r*.3,r*.3):.1f}" cy="{y+rnd.uniform(-r*.3,r*.3):.1f}" r=".9" fill="{INK}"/>'

def potato(x, y, rx, ry, rot, half=False):
    g = f'<g transform="rotate({rot} {x} {y})">'
    d = f"M{x-rx} {y}C{x-rx} {y-ry*1.15} {x+rx*.2} {y-ry*1.05} {x+rx*.6} {y-ry*.85}C{x+rx*1.1} {y-ry*.55} {x+rx*1.05} {y+ry*.9} {x+rx*.1} {y+ry}C{x-rx*.7} {y+ry*1.05} {x-rx} {y+ry*.6} {x-rx} {y}Z"
    if half:
        g += P(d, "var(--paper)", 2.2)
        g += P(blob(x, y, min(rx, ry)*.62, 9, .12, random.Random(3)), "var(--t1)", 1.2, "var(--t2)")
    else:
        g += P(d, "var(--t1)", 2.2)
        g += P(f"M{x-rx*.4} {y-ry*.3}q4 -3 8 0M{x+rx*.25} {y-ry*.45}q3 -3 7 0M{x+rx*.05} {y+ry*.35}q4 -3 8 0", "none", 1.5)
        g += f'<ellipse cx="{x+rx*.35}" cy="{y+ry*.35}" rx="{rx*.55}" ry="{ry*.45}" fill="url(#fst-ruskie)"/>'
    return g + "</g>"

def mushroom(x, y, s, rot=0, slice_=False):
    g = f'<g transform="translate({x} {y}) rotate({rot}) scale({s})">'
    cap = "M-26 0C-26 -22 -12 -32 0 -32S26 -22 26 0C14 4 -14 4 -26 0Z"
    stem = "M-9 2C-11 14 -12 24 -9 32C-3 35 3 35 9 32C12 24 11 14 9 2"
    if slice_:
        g += P(cap + "M-9 2C-11 14 -12 24 -9 32H9C12 24 11 14 9 2", "var(--paper)", 2/s)
        g += P("M-20 -2C-12 -14 12 -14 20 -2M-4 8v18M4 8v18", "none", 1.1/s)
    else:
        g += P(cap, "var(--t2)", 2.2/s) + P(stem, "var(--paper)", 2.2/s)
        g += P("M-18 -14c4-6 10-10 16-11M-22 -6c1-2 2-4 3-5", "none", 1.4/s, "var(--paper)")
        g += P("M-22 1h44", "none", 1.3/s)
    return g + "</g>"

def strand(x, y, L, ang, rnd):
    ca, sa = math.cos(ang), math.sin(ang)
    pts = []
    for i in range(6):
        u = L*i/5; v = math.sin(i*1.7 + rnd.random()*2)*3
        pts.append((x + u*ca - v*sa, y + u*sa + v*ca))
    d = f"M{f(pts[0])}" + "".join(f"L{f(p)}" for p in pts[1:])
    return P(d, "none", 4.6, "currentColor") + P(d, "none", 2.6, "var(--paper)")

def fill_art(kind):
    rnd = random.Random({"ruskie":1,"szpinak":2,"kapusta":3,"jagody":4}[kind])
    s = []
    if kind == "jagody":
        s.append(f'<path d="{PILLOW}" fill="var(--t1)"/>')
        pts = []
        for row in range(9):
            for col in range(15):
                x = 62 + col*19 + (row % 2)*9 + rnd.uniform(-4, 4); y = 82 + row*16 + rnd.uniform(-4, 4)
                pts.append((x, y, rnd.uniform(10, 13.5)))
        pts.sort(key=lambda p: p[1])
        for x, y, r in pts: s.append(berry(x, y, r, rnd.random() < .45))
    else:
        s.append(f'<path d="{PILLOW}" fill="var(--t1)"/>')
        s.append(f'<rect x="60" y="70" width="280" height="150" fill="url(#fst2-{kind})"/>')
        if kind == "ruskie":
            for _ in range(26):
                x, y = rnd.uniform(72, 328), rnd.uniform(92, 205)
                s.append(P(f"M{x:.0f} {y:.0f}c5-7 15-7 19 0s-6 8-11 4", "none", 1.2))
            for _ in range(20):
                x, y, k, rot = rnd.uniform(80, 320), rnd.uniform(98, 202), rnd.uniform(8, 12), rnd.uniform(0, 90)
                s.append(f'<g transform="rotate({rot:.0f} {x:.0f} {y:.0f})"><rect x="{x-k:.1f}" y="{y-k:.1f}" width="{2*k:.1f}" height="{2*k:.1f}" rx="{k*.45:.1f}" fill="var(--paper)" stroke="currentColor" stroke-width="1.5"/><path d="M{x-k*.5:.1f} {y+k*.55:.1f}h{k:.1f}" stroke="currentColor" stroke-width="1" fill="none"/></g>')
            for _ in range(30):
                s.append(crumb(rnd.uniform(78, 322), rnd.uniform(92, 205), rnd.uniform(4.5, 7.5), rnd))
            for _ in range(10):
                x, y = rnd.uniform(85, 315), rnd.uniform(100, 200)
                s.append(P(f"M{x:.0f} {y:.0f}q4 -6 9 -2", "none", 1.6))
        if kind == "szpinak":
            for _ in range(20):
                s.append(leaf(rnd.uniform(70, 300), rnd.uniform(92, 200), rnd.uniform(34, 50), rnd.uniform(0, 2*math.pi), "var(--t2)", .34, 3))
            for _ in range(18):
                s.append(crumb(rnd.uniform(80, 320), rnd.uniform(95, 205), rnd.uniform(4.5, 7), rnd))
        if kind == "kapusta":
            for _ in range(70):
                s.append(strand(rnd.uniform(65, 300), rnd.uniform(88, 205), rnd.uniform(30, 52), rnd.uniform(-.9, .9), rnd))
            for _ in range(9):
                s.append(mushroom(rnd.uniform(90, 310), rnd.uniform(105, 195), rnd.uniform(.48, .62), rnd.uniform(-30, 30), True))
    return "\n".join(s)

def outside(kind):
    s = []
    if kind == "jagody":
        for (x, y) in [(46, 118), (64, 136), (38, 140), (352, 112), (338, 132), (362, 134)]:
            s.append(berry(x, y, 11.5))
        s.append(leaf(30, 104, 40, -2.4, "var(--t1)")); s.append(leaf(366, 98, 40, -.7, "var(--t1)"))
    if kind == "ruskie":
        s.append(potato(48, 128, 26, 19, -14)); s.append(potato(352, 122, 24, 18, 18, True))
        r = random.Random(9)
        for (x, y) in [(340, 150), (362, 148)]: s.append(crumb(x, y, 6, r))
    if kind == "szpinak":
        s.append(leaf(20, 132, 52, -.7, "var(--t2)")); s.append(leaf(380, 130, 52, math.pi + .7, "var(--t2)"))
        s.append(leaf(42, 150, 38, -.2, "var(--t1)", .34, 3))
        r = random.Random(5)
        for (x, y) in [(346, 152)]: s.append(crumb(x, y, 6, r))
    if kind == "kapusta":
        s.append(mushroom(50, 128, .95, -10)); s.append(mushroom(350, 126, .85, 12))
        r = random.Random(7)
    return "\n".join(s)

def svg(kind):
    return f'''<svg class="filling-svg" viewBox="0 0 400 236" aria-hidden="true">
  <defs>
    <filter id="fhand-{kind}"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="5"/><feDisplacementMap in="SourceGraphic" scale="1.6"/></filter>
    <pattern id="fst-{kind}" width="4.5" height="4.5" patternUnits="userSpaceOnUse"><circle cx="1.2" cy="1.2" r=".8" fill="currentColor"/><circle cx="3.4" cy="3.4" r=".55" fill="currentColor"/></pattern>
    <pattern id="fst2-{kind}" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".6" fill="currentColor" opacity=".55"/><circle cx="5.5" cy="5" r=".45" fill="currentColor" opacity=".55"/></pattern>
    <clipPath id="fpill-{kind}"><path d="{PILLOW}"/></clipPath>
  </defs>
  <rect width="400" height="236" fill="var(--t0)"/>
  <g filter="url(#fhand-{kind})">
    <ellipse cx="200" cy="216" rx="150" ry="13" fill="url(#fst-{kind})" opacity=".7"/>
    {P(OUT, "var(--paper)", 3.2)}
    {P(FORKS, "none", 1.7)}
    <g clip-path="url(#fpill-{kind})">
{fill_art(kind)}
      <path d="{PILLOW}" fill="none" stroke="var(--paper)" stroke-width="13"/>
    </g>
    {P(PILLOW, "none", 2.8)}
    {P(f"M{CX-122} {CY+14}C{CX-60} {CY+34} {CX+60} {CY+34} {CX+122} {CY+14}", "none", 1.3, extra=' stroke-dasharray="6 6"')}
{outside(kind)}
  </g>
</svg>'''

out = {k: svg(k) for k in ["ruskie", "szpinak", "kapusta", "jagody"]}
json.dump(out, open(sys.argv[1], "w"))
print({k: len(v) for k, v in out.items()})
