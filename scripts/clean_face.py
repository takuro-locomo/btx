"""
clean_face.py — ベース顔画像の前処理

入力: public/face-photo.png（プロのボツリヌス施術説明イラスト。円・ラベル・
      引き出し線つきで、顔にシワが描き込まれている）
出力: public/face-clean.png（肌を平滑化してシワ・引き出し線を除去した素顔）

やっていること:
  1. 顔の肌領域だけをマスクし（目・眉・唇・鼻・生え際は保護）、
     メディアンフィルタでシワと引き出し線をまとめて除去
  2. 肌にかかる引き出し線の残りを、近傍の肌色でなぞって消す

PatientFaceView はこの face-clean.png を素顔（施術後）として使い、
その上に SVG のシワを重ねて施術前/後を表現する。

再生成: python scripts/clean_face.py
"""
from PIL import Image, ImageDraw, ImageFilter

SRC = "public/face-photo.png"
DST = "public/face-clean.png"


def main() -> None:
    im = Image.open(SRC).convert("RGB")

    def avg(box):
        px = list(im.crop(box).getdata())
        n = len(px)
        return tuple(sum(p[i] for p in px) // n for i in range(3))

    # --- 1. 肌領域を平滑化（特徴部は保護） ---
    mask = Image.new("L", im.size, 0)
    d = ImageDraw.Draw(mask)
    d.ellipse((120, 50, 282, 302), fill=255)           # 顔の肌
    d.ellipse((150, 150, 194, 176), fill=0)            # 左目
    d.ellipse((210, 150, 254, 176), fill=0)            # 右目
    d.rectangle((146, 130, 198, 150), fill=0)          # 左眉
    d.rectangle((206, 130, 258, 150), fill=0)          # 右眉
    d.ellipse((166, 220, 238, 260), fill=0)            # 唇
    d.ellipse((184, 194, 220, 216), fill=0)            # 鼻先
    d.rectangle((120, 50, 282, 64), fill=0)            # 生え際
    mask = mask.filter(ImageFilter.GaussianBlur(3))
    smooth = im.filter(ImageFilter.MedianFilter(7)).filter(ImageFilter.GaussianBlur(1.0))
    im = Image.composite(smooth, im, mask)

    # --- 2. 肌にかかる引き出し線を近傍肌色でなぞる ---
    def paint_line(p0, p1, sample_box, width):
        nonlocal im
        color = avg(sample_box)
        layer = Image.new("RGB", im.size, color)
        m = Image.new("L", im.size, 0)
        ImageDraw.Draw(m).line([p0, p1], fill=255, width=width)
        m = m.filter(ImageFilter.GaussianBlur(3))
        im = Image.composite(layer, im, m)

    paint_line((120, 92), (158, 108), (184, 72, 206, 86), 15)    # 額ラベル
    paint_line((254, 167), (297, 142), (270, 176, 290, 193), 15)  # 目尻ラベル
    paint_line((116, 150), (192, 150), (168, 116, 192, 134), 12)  # 眉間ラベル
    paint_line((100, 258), (193, 182), (148, 236, 180, 258), 15)  # 鼻根部ラベル
    paint_line((210, 266), (297, 270), (226, 274, 252, 286), 14)  # アゴラベル
    paint_line((186, 146), (214, 150), (196, 118, 214, 133), 10)  # 眉間残り

    im.save(DST)
    print("saved", DST)


if __name__ == "__main__":
    main()
