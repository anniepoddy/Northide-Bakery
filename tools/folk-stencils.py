# Original Polish folk brush-stroke stencils (Boleslawiec / folk-painting tradition).
# One solid color, no gradients, so each works as a stencil, a Canva element, a stamp or a vinyl cut.
# Run: python3 tools/folk-stencils.py   -> images/stencils/*.svg
import math, os
OUT = "images/stencils"
f = lambda p: f"{p[0]:.1f} {p[1]:.1f}"
def tr(x, y, ang):
    ca, sa = math.cos(ang), math.sin(ang)
    return lambda u, v: (x + u*ca - v*sa, y + u*sa + v*ca)

def petal(x, y, L, ang, W=.42):
    t = tr(x, y, ang); w = L*W
    KNOCK.append(f'<path d="M{f(t(L*.4,0))}L{f(t(L*.78,0))}" stroke-width="{max(1.2,w*.28):.1f}"/>')
    return f'<path d="M{f(t(0,0))}C{f(t(L*.1,-w*.8))} {f(t(L*.8,-w*1.15))} {f(t(L,0))}C{f(t(L*.8,w*1.15))} {f(t(L*.1,w*.8))} {f(t(0,0))}Z"/>'
def leaf(x, y, L, ang, W=.3, bend=.25):
    t = tr(x, y, ang); w = L*W; b = L*bend
    KNOCK.append(f'<path d="M{f(t(L*.18,-b*.05))}Q{f(t(L*.55,-w*.25-b*.55))} {f(t(L*.85,-b*.85))}" stroke-width="{max(1.3,w*.16):.1f}" fill="none"/>')
    return f'<path d="M{f(t(0,0))}C{f(t(L*.3,-w-b))} {f(t(L*.8,-w*.6-b))} {f(t(L,-b))}C{f(t(L*.7,w*.3-b*.6))} {f(t(L*.3,w*.9-b*.2))} {f(t(0,0))}Z"/>'
def comma(x, y, L, ang, side=1):
    t = tr(x, y, ang); w = L*.22*side
    return f'<path d="M{f(t(0,0))}C{f(t(L*.1,-w*1.7))} {f(t(L*.6,-w*1.5))} {f(t(L,-w*.15))}C{f(t(L*.55,-w*.55))} {f(t(L*.18,-w*.15))} {f(t(0,0))}Z"/>'
def scroll(x, y, r, ang, side=1, sw=4.2, turns=4.0):
    pts = [(x + r*(1-k*.72)*math.cos(ang + side*k*turns), y + r*(1-k*.72)*math.sin(ang + side*k*turns)) for k in [i/24 for i in range(25)]]
    return f'<path d="M{" L".join(f(p) for p in pts)}" fill="none" stroke="currentColor" stroke-width="{sw}" stroke-linecap="round"/>'
def stem(d, sw=3.4): return f'<path d="{d}" fill="none" stroke="currentColor" stroke-width="{sw}" stroke-linecap="round"/>'
def dot(x, y, r): return f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}"/>'
def ring(x, y, r): return f'<circle cx="{x}" cy="{y}" r="{r}" fill="none" stroke="currentColor" stroke-width="{r*.45:.1f}"/>'
def daisy(x, y, R, n=8, rot=-math.pi/2, center="ring"):
    s = "".join(petal(x + math.cos(a)*R*.3, y + math.sin(a)*R*.3, R*.7, a, .3) for a in [rot + i*2*math.pi/n for i in range(n)])
    return s + (ring(x, y, R*.17) if center == "ring" else dot(x, y, R*.18))
def double_daisy(x, y, R):
    s = "".join(petal(x + math.cos(a)*R*.52, y + math.sin(a)*R*.52, R*.48, a, .36) for a in [i*2*math.pi/12 for i in range(12)])
    s += "".join(petal(x + math.cos(a)*R*.17, y + math.sin(a)*R*.17, R*.27, a, .4) for a in [math.pi/8 + i*2*math.pi/8 for i in range(8)])
    return s + dot(x, y, R*.1)
def tulip(x, y, L, ang):
    t = tr(x, y, ang); s = ""
    for a, l in [(-.55, .75), (0, 1), (.55, .75)]:
        s += petal(*t(0, 0), L*l, ang + a, .3)
    return s + dot(*t(-L*.05, 0), L*.09)
def dots_line(x, y, ang, n, gap, r0):
    return "".join(dot(x + math.cos(ang)*gap*i, y + math.sin(ang)*gap*i, max(1.2, r0 - i*.45)) for i in range(n))
def mirror(svg_inner, cx):
    return f'{svg_inner}<g transform="translate({2*cx} 0) scale(-1 1)">{svg_inner}</g>'

KNOCK = []
M = {}
KN = {}
# 1. Daisy on a curving stem with leaves and scrolls
s = stem("M100 290C96 240 104 190 100 120") + daisy(100, 82, 42)
s += leaf(99, 230, 62, -2.5, .3, .2) + leaf(101, 200, 56, -.55, .3, -.2) + leaf(99, 160, 40, -2.3, .3, .2)
s += comma(100, 262, 36, -.25, 1) + comma(100, 262, 36, math.pi + .25, -1)
s += scroll(60, 250, 18, 0, 1) + scroll(142, 226, 16, math.pi, -1) + dots_line(150, 150, -1.2, 3, 9, 3.6)
M["daisy-stem"] = (s, (0, 20, 200, 290))
KN["daisy-stem"] = "".join(KNOCK); KNOCK.clear()
# 2. Symmetric medallion: double daisy in a scroll frame with a teardrop crown and dot spine
s1 = scroll(70, 150, 22, -1.6, -1, 4) + leaf(98, 210, 56, -2.55, .3, .18) + comma(98, 250, 30, math.pi - .4, -1) + dot(60, 112, 4) + dot(52, 196, 3.5)
s = mirror(s1, 100) + double_daisy(100, 150, 44) + tulip(100, 92, 36, -math.pi/2) + dots_line(100, 200, math.pi/2, 4, 12, 5.5) + dot(100, 262, 8)
M["medallion"] = (s, (20, 30, 160, 250))
KN["medallion"] = "".join(KNOCK); KNOCK.clear()
# 3. Tulip spray (diagonal) with leaves and a dot trail
s = stem("M40 260C80 220 120 170 150 90") + tulip(150, 90, 52, -1.2)
s += leaf(66, 232, 54, -1.9, .32, .2) + leaf(92, 206, 58, -.25, .3, -.2) + leaf(116, 172, 46, -1.7, .3, .2) + leaf(130, 148, 40, -.2, .3, -.2)
s += scroll(58, 196, 17, 0, 1) + dots_line(176, 112, .9, 4, 9, 4)
M["tulip-spray"] = (s, (20, 30, 190, 250))
KN["tulip-spray"] = "".join(KNOCK); KNOCK.clear()
# 4. Simple daisy with a leaf pair (small accent)
s = stem("M100 270C98 230 102 200 100 150") + daisy(100, 106, 46, 8, -math.pi/2, "dot")
s += leaf(99, 230, 66, -2.7, .3, .16) + leaf(101, 214, 50, -.5, .3, -.18) + dots_line(132, 196, -.6, 3, 10, 4)
M["daisy-leaves"] = (s, (30, 50, 150, 230))
KN["daisy-leaves"] = "".join(KNOCK); KNOCK.clear()
# 5. Tall flower with scrolling leaves (mirror of #1 with a double daisy)
s = stem("M110 300C120 250 90 200 104 120") + double_daisy(104, 80, 40)
s += leaf(112, 260, 60, -.4, .3, -.2) + leaf(105, 220, 60, -2.6, .3, .2) + leaf(100, 180, 44, -.6, .3, -.2)
s += scroll(152, 268, 18, math.pi, -1) + scroll(56, 198, 16, 0, 1) + dots_line(60, 140, -1.9, 3, 9, 3.6)
M["double-daisy-stem"] = (s, (20, 30, 180, 300))
KN["double-daisy-stem"] = "".join(KNOCK); KNOCK.clear()
# 6. Symmetric spray: stacked brush commas with a bud and dot crown
s1 = comma(96, 220, 66, -2.05, -1) + comma(96, 196, 52, -2.25, -1) + comma(96, 172, 38, -2.45, -1) + scroll(58, 232, 14, 0, 1) + dot(52, 160, 4)
s = mirror(s1, 100) + stem("M100 250V120") + petal(100, 118, 40, -math.pi/2, .34) + dots_line(100, 66, -math.pi/2, 3, 10, 4.6) + dot(100, 254, 7)
M["spray"] = (s, (25, 30, 150, 240))
KN["spray"] = "".join(KNOCK); KNOCK.clear()
# 7. Peacock eye (Boleslawiec "oko pawia") single motif
s = '<circle cx="100" cy="100" r="40"/><circle cx="100" cy="100" r="28" fill="#fff" fill-opacity="0" stroke="none"/>'
s = ('<path fill-rule="evenodd" d="M100 60a40 40 0 1 1 0 80a40 40 0 1 1 0-80ZM100 72a28 28 0 1 0 0 56a28 28 0 1 0 0-56Z"/>'
     '<path fill-rule="evenodd" d="M100 78a22 22 0 1 1 0 44a22 22 0 1 1 0-44ZM100 88a12 12 0 1 0 0 24a12 12 0 1 0 0-24Z"/>' + dot(100, 100, 6)
     + "".join(dot(100 + 50*math.cos(a), 100 + 50*math.sin(a), 3.6) for a in [i*math.pi/6 for i in range(12)]))
M["peacock-eye"] = (s, (40, 40, 120, 120))
KN["peacock-eye"] = "".join(KNOCK); KNOCK.clear()

os.makedirs(OUT, exist_ok=True)
for name, (inner, (x, y, w, h)) in M.items():
    knock = KN.get(name, '')
    for cname, col in (("navy", "#22338F"), ("black", "#000000")):
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x} {y} {w} {h}" width="{w*4}" height="{h*4}">'
               f'<title>Folk {name.replace("-", " ")} stencil</title>'
               f'<defs><mask id="m"><rect x="-999" y="-999" width="3000" height="3000" fill="#fff"/>'
               f'<g stroke="#000" stroke-linecap="round" fill="none">{knock}</g></mask></defs>'
               f'<g fill="{col}" color="{col}" mask="url(#m)">{inner}</g></svg>\n')
        open(f"{OUT}/folk-{name}-{cname}.svg", "w").write(svg)
print(list(M))
