"""Generate original comic-style test panels (speech bubbles on flat backgrounds)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent.parent / "test" / "fixtures"
OUT.mkdir(parents=True, exist_ok=True)
FONT = "C:/Windows/Fonts/comic.ttf"


def bubble(d, box, lines, size, fill="white", fg="black"):
    x0, y0, x1, y1 = box
    d.ellipse(box, fill=fill, outline="black", width=4)
    font = ImageFont.truetype(FONT, size)
    lh = int(size * 1.25)
    top = (y0 + y1) / 2 - lh * len(lines) / 2
    for i, line in enumerate(lines):
        w = d.textlength(line, font=font)
        d.text(((x0 + x1) / 2 - w / 2, top + i * lh), line, font=font, fill=fg)


def panel(name, bg, bubbles, size=(900, 1300)):
    img = Image.new("RGB", size, bg)
    d = ImageDraw.Draw(img)
    for box, lines, fs, *style in bubbles:
        bubble(d, box, lines, fs, *style)
    img.save(OUT / name)


# 1: normal mixed-case dialogue
panel("panel1.png", (120, 170, 220), [
    ((60, 80, 560, 330), ["Where are you going", "so early this morning?"], 36),
    ((330, 520, 840, 770), ["I heard there is a", "strange noise coming", "from the old library."], 34),
    ((80, 960, 500, 1160), ["Then let's go", "check it together!"], 36),
])

# 2: ALL CAPS dialogue (typical comic lettering) + a dark bubble
panel("panel2.png", (240, 200, 120), [
    ((60, 100, 520, 330), ["WAIT FOR ME!", "I CAN'T RUN", "THAT FAST."], 38),
    ((400, 620, 850, 860), ["DON'T WORRY,", "WE'RE ALMOST", "THERE."], 38),
    ((100, 1000, 560, 1220), ["It was only a", "cat all along."], 38, "#222", "white"),
])

# 3: tall webtoon-style strip to exercise slicing
tall = Image.new("RGB", (800, 3200), (200, 220, 200))
d = ImageDraw.Draw(tall)
for i, (box, lines) in enumerate([
    ((50, 150, 520, 380), ["Did you finish", "the report?"]),
    ((280, 900, 760, 1130), ["Almost. I only need", "to add the last chart."]),
    ((60, 1700, 540, 1930), ["Good. We present", "tomorrow at nine."]),
    ((260, 2600, 750, 2850), ["Then I should", "get some sleep."]),
]):
    bubble(d, box, lines, 34)
tall.save(OUT / "strip.png")
print("wrote", sorted(p.name for p in OUT.glob("*.png")))


# ---- CJK panels: horizontal bubbles (ja/ko/zh) and vertical Japanese columns ----
FONTS = {
    "ja": "C:/Windows/Fonts/msgothic.ttc",
    "ko": "C:/Windows/Fonts/malgun.ttf",
    "zh": "C:/Windows/Fonts/msyh.ttc",
}


def hbubble(d, box, lines, lang, size):
    d.ellipse(box, fill="white", outline="black", width=4)
    font = ImageFont.truetype(FONTS[lang], size)
    lh = int(size * 1.35)
    x0, y0, x1, y1 = box
    top = (y0 + y1) / 2 - lh * len(lines) / 2
    for i, line in enumerate(lines):
        w = d.textlength(line, font=font)
        d.text(((x0 + x1) / 2 - w / 2, top + i * lh), line, font=font, fill="black")


def vbubble(d, box, columns, size):
    """Japanese vertical text: characters stacked, columns read right to left."""
    d.ellipse(box, fill="white", outline="black", width=4)
    font = ImageFont.truetype(FONTS["ja"], size)
    x0, y0, x1, y1 = box
    cw = int(size * 1.4)
    total_w = cw * len(columns)
    right = (x0 + x1) / 2 + total_w / 2 - cw
    for ci, col in enumerate(columns):
        h = len(col) * size
        top = (y0 + y1) / 2 - h / 2
        for k, ch in enumerate(col):
            w = d.textlength(ch, font=font)
            d.text((right - ci * cw + (size - w) / 2, top + k * size), ch, font=font, fill="black")


def cjk_panel(name, bg, items, size=(900, 1300)):
    img = Image.new("RGB", size, bg)
    d = ImageDraw.Draw(img)
    for it in items:
        if it[0] == "v":
            vbubble(d, it[1], it[2], it[3])
        else:
            hbubble(d, it[1], it[2], it[3], it[4])
    img.save(OUT / name)


cjk_panel("ja.png", (150, 190, 160), [
    ("h", (60, 80, 620, 330), ["どこへ行くの？", "こんな朝早くに。"], "ja", 40),
    ("h", (300, 560, 850, 810), ["図書館から変な音が", "聞こえてくるんだ。"], "ja", 38),
    ("v", (640, 900, 860, 1240), ["一緒に行こう！", "待ってよ。"], 38),
])
cjk_panel("ko.png", (190, 160, 210), [
    ("h", (60, 80, 600, 330), ["어디 가는 거야?", "이렇게 이른 아침에."], "ko", 40),
    ("h", (300, 560, 850, 810), ["도서관에서 이상한", "소리가 들려."], "ko", 40),
    ("h", (80, 940, 520, 1160), ["같이 가 보자!"], "ko", 42),
])
cjk_panel("zh.png", (220, 190, 170), [
    ("h", (60, 80, 600, 330), ["你要去哪里？", "这么早的早上。"], "zh", 40),
    ("h", (300, 560, 850, 810), ["图书馆里传来了", "奇怪的声音。"], "zh", 40),
    ("h", (80, 940, 520, 1160), ["那我们一起去看看吧！"], "zh", 34),
])
print("wrote CJK panels")
