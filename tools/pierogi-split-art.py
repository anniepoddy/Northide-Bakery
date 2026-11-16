# Draws the half-realistic, half-folk-art pierogi used on the bags (?layout=circle-split).
# Run: python3 tools/pierogi-split-art.py out.svg  -> paste the SVG into SPLIT in packaging/pierogi-bag/bag.html
# One pierogi split down the middle: left half painted realistically, right half flat folk art,
# framed by symmetrical folk foliage (leaves, sprigs, dots) in the flavor color.
import math, sys, random
OUTF = sys.argv[1]
CX, CY = 300, 246          # center of the pierogi's straight edge
RX, RY = 206, 166          # crimp ellipse
def ell(rx, ry, t): return (CX + rx*math.cos(t), CY - ry*math.sin(t))
f = lambda p: f"{p[0]:.1f} {p[1]:.1f}"
N = 23
pts = [ell(RX, RY, math.pi - math.pi*i/N) for i in range(N+1)]
OUT = f"M{f(pts[0])}"
for a, b in zip(pts, pts[1:]):
    r = math.dist(a, b)*0.62
    OUT += f"A{r:.1f} {r:.1f} 0 0 1 {f(b)}"
OUT += f"C{CX+150} {CY+48} {CX-150} {CY+48} {f(pts[0])}Z"
PR, PY = 170, 134           # pillow ellipse
PILLOW = f"M{f(ell(PR,PY,math.pi))}A{PR} {PY} 0 0 1 {f(ell(PR,PY,0))}C{CX+130} {CY+40} {CX-130} {CY+40} {f(ell(PR,PY,math.pi))}Z"
PILLOW_LINE = f"M{f(ell(PR,PY,math.pi))}A{PR} {PY} 0 0 1 {f(ell(PR,PY,0))}"
forks = []
for i in range(N):
    t = math.pi - math.pi*(i+.5)/N
    forks.append((ell(PR+10, PY+8, t), ell(RX-14, RY-12, t), t))
scal = [((a[0]+b[0])/2, (a[1]+b[1])/2, math.dist(a, b)*.5) for a, b in zip(pts, pts[1:])]

# ---------- realistic half (left) ----------
real = []
real.append(f'<ellipse cx="{CX}" cy="{CY+30}" rx="{RX*1.0:.0f}" ry="22" fill="#3a2a1c" opacity=".35" filter="url(#blur8)"/>')
real.append(f'<path d="{OUT}" fill="url(#doughEdge)"/>')
for (x, y, r) in scal:   # light on each scallop of the crimp
    real.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r*1.05:.1f}" fill="url(#scallopLight)" clip-path="url(#outClip)"/>')
for (p1, p2, t) in forks:  # pressed fork marks
    real.append(f'<path d="M{f(p1)}L{f(p2)}" stroke="#a88a5c" stroke-width="5" stroke-linecap="round" opacity=".55" filter="url(#blur1)"/>')
    real.append(f'<path d="M{p1[0]-1.5:.1f} {p1[1]-1.5:.1f}L{p2[0]-1.5:.1f} {p2[1]-1.5:.1f}" stroke="#fff8ea" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>')
real.append(f'<path d="{PILLOW_LINE}" fill="none" stroke="#9c7d50" stroke-width="10" opacity=".45" filter="url(#blur3)"/>')
real.append(f'<path d="{PILLOW}" fill="url(#pillowBody)"/>')
real.append(f'<path d="{PILLOW}" fill="url(#pillowShade)"/>')
real.append(f'<ellipse cx="{CX-62}" cy="{CY-84}" rx="60" ry="30" fill="#fffaf0" opacity=".55" filter="url(#blur8)" transform="rotate(-18 {CX-62} {CY-84})"/>')
real.append(f'<path d="{PILLOW_LINE}" fill="none" stroke="#fff6e4" stroke-width="2" opacity=".8" transform="translate(-1.5 -2)"/>')
real.append(f'<path d="M{CX-196} {CY+8}C{CX-130} {CY+40} {CX+130} {CY+40} {CX+196} {CY+8}" fill="none" stroke="#8d6e44" stroke-width="6" opacity=".4" filter="url(#blur3)"/>')
real.append(f'<rect x="0" y="0" width="600" height="340" filter="url(#doughGrain)" clip-path="url(#outClip)" opacity=".5"/>')
rnd = random.Random(2)
flour = ""
for _ in range(160):
    a = rnd.uniform(math.pi*.5, math.pi); rr = rnd.uniform(0, 1)**.5
    x, y = CX + RX*.95*rr*math.cos(a), CY - RY*.95*rr*math.sin(a)
    flour += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{rnd.uniform(.5,1.6):.1f}" fill="#fffdf6" opacity="{rnd.uniform(.4,.9):.2f}"/>'
real.append(flour)

# ---------- folk art half (right) ----------
art = []
art.append(f'<path d="{OUT}" fill="var(--paper)"/>')
art.append(f'<path d="M{CX+34} {CY-108}C{CX+78} {CY-124} {CX+122} {CY-106} {CX+140} {CY-76}M{CX+52} {CY-84}C{CX+78} {CY-94} {CX+102} {CY-85} {CX+113} {CY-66}" fill="none" stroke="var(--t1)" stroke-width="9" stroke-linecap="round"/>')
art.append(f'<path d="{PILLOW_LINE}" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>')
art.append("".join(f'<path d="M{f(p1)}L{f(p2)}" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/>' for (p1, p2, t) in forks))
art.append(f'<path d="{OUT}" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round"/>')
art.append(f'<path d="M{CX+60} {CY+26}C{CX+105} {CY+28} {CX+150} {CY+20} {CX+176} {CY+10}" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>')

# ---------- folk foliage, mirror-symmetric ----------
def leaf(x, y, L, ang, W=.36, fill="var(--t2)"):
    ca, sa = math.cos(ang), math.sin(ang)
    tr = lambda u, v: (x + u*ca - v*sa, y + u*sa + v*ca)
    w_ = L*W
    d = f"M{f(tr(0,0))}C{f(tr(L*.3,-w_))} {f(tr(L*.78,-w_*.78))} {f(tr(L,0))}C{f(tr(L*.78,w_*.78))} {f(tr(L*.3,w_))} {f(tr(0,0))}Z"
    v = f"M{f(tr(-L*.12,0))}L{f(tr(L*.86,0))}"
    for i in range(1, 6):
        u = L*i/6.4
        v += f"M{f(tr(u,0))}L{f(tr(u+L*.13,-w_*.62))}M{f(tr(u,0))}L{f(tr(u+L*.13,w_*.62))}"
    return (f'<path d="{d}" fill="{fill}" stroke="currentColor" stroke-width="3.4" stroke-linejoin="round"/>'
            f'<path d="{v}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>')
def sprig(x, y, L, ang, n=6):
    ca, sa = math.cos(ang), math.sin(ang)
    s = f'<path d="M{x:.1f} {y:.1f}l{L*ca:.1f} {L*sa:.1f}" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/>'
    for i in range(1, n+1):
        px, py = x + L*ca*i/(n+1), y + L*sa*i/(n+1)
        for sg in (1, -1):
            a2 = ang + sg*1.0; ex, ey = px + 9*math.cos(a2), py + 9*math.sin(a2)
            s += f'<ellipse cx="{ex:.1f}" cy="{ey:.1f}" rx="8" ry="3.6" transform="rotate({math.degrees(a2):.0f} {ex:.1f} {ey:.1f})" fill="currentColor"/>'
    return s + f'<ellipse cx="{x+L*ca:.1f}" cy="{y+L*sa:.1f}" rx="5" ry="8" transform="rotate({math.degrees(ang)+90:.0f} {x+L*ca:.1f} {y+L*sa:.1f})" fill="currentColor"/>'
deco = []
for side in (1, -1):
    X = lambda x: CX + side*x
    A = lambda a: a if side == 1 else math.pi - a
    deco += [leaf(X(250), 300, 84, A(-2.3)), leaf(X(262), 236, 74, A(-1.85)), leaf(X(250), 172, 60, A(-1.4), .34),
             leaf(X(170), 310, 80, A(-.3), .32), sprig(X(246), 116, 60, A(-1.75), 5)]
    for (dx, dy, rr) in [(244, 76, 5), (276, 150, 4.5), (214, 118, 3.5), (278, 316, 5), (110, 326, 4), (226, 252, 3.5)]:
        deco.append(f'<circle cx="{X(dx):.0f}" cy="{dy}" r="{rr}" fill="currentColor"/>')
deco.append(leaf(CX, 324, 30, -math.pi/2, .4, "var(--t1)"))

svg = f'''<svg class="split-svg" viewBox="0 0 600 340" aria-hidden="true">
  <defs>
    <filter id="blur1"><feGaussianBlur stdDeviation="1"/></filter>
    <filter id="blur3"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="blur8" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="doughGrain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="4"/><feColorMatrix values="0 0 0 0 .55  0 0 0 0 .42  0 0 0 0 .26  0 0 0 -1.6 1.05"/></filter>
    <filter id="fhand"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="11"/><feDisplacementMap in="SourceGraphic" scale="1.5"/></filter>
    <linearGradient id="doughEdge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3e3c4"/><stop offset=".7" stop-color="#e2c99c"/><stop offset="1" stop-color="#c9aa77"/></linearGradient>
    <radialGradient id="scallopLight" cx=".38" cy=".3" r=".7"><stop offset="0" stop-color="#fff9ec" stop-opacity=".85"/><stop offset=".6" stop-color="#f1dfbd" stop-opacity=".2"/><stop offset="1" stop-color="#b8956a" stop-opacity=".35"/></radialGradient>
    <radialGradient id="pillowBody" cx=".36" cy=".26" r=".85"><stop offset="0" stop-color="#fbf2e1"/><stop offset=".45" stop-color="#efdcba"/><stop offset=".8" stop-color="#ddc196"/><stop offset="1" stop-color="#c7a676"/></radialGradient>
    <linearGradient id="pillowShade" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#8a6a40" stop-opacity="0"/><stop offset="1" stop-color="#8a6a40" stop-opacity=".45"/></linearGradient>
    <clipPath id="outClip"><path d="{OUT}"/></clipPath>
    <clipPath id="leftHalf"><rect x="0" y="0" width="{CX}" height="340"/></clipPath>
    <clipPath id="rightHalf"><rect x="{CX}" y="0" width="{600-CX}" height="340"/></clipPath>
  </defs>
  <g filter="url(#fhand)">{''.join(deco)}</g>
  <g clip-path="url(#leftHalf)">{''.join(real)}</g>
  <g clip-path="url(#rightHalf)" filter="url(#fhand)">{''.join(art)}</g>
  <path d="M{CX} {CY-RY-6}V{CY+44}" stroke="currentColor" stroke-width="2.2" stroke-dasharray="7 6" opacity=".7"/>
</svg>'''
open(OUTF, 'w').write(svg)
print(len(svg))
