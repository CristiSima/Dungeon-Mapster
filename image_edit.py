from PIL import Image, ImageDraw, ImageFilter
from constants import IMAGE_DM_OPACITY
opacity_player = 255
opacity_DM = int(255*IMAGE_DM_OPACITY)


def toTuple(x): return tuple((i if not isinstance(i, list) else toTuple(i) for i in x))


def gen_images(base: str, instructions: list[dict]):
    base = Image.open(base)
    DM_a = Image.new("L", base.size, 0)
    PC_a = Image.new("L", base.size, 0)

    DM_draw = ImageDraw.Draw(DM_a)
    PC_draw = ImageDraw.Draw(PC_a)

    DM_draw.rectangle(((0, 0), base.size), fill=opacity_DM)

    for instruction in instructions:
        if instruction['type'] == "rect":
            print(instruction['args'])
            DM_draw.rectangle(toTuple(instruction['args']), fill=255)
            PC_draw.rectangle(toTuple(instruction['args']), fill=255)
        else:
            print("IMPLEMENT NEW INSTRUCTION TYPE")

    DM_a_blurr = DM_a.filter(ImageFilter.GaussianBlur(5))
    PC_a_blurr = PC_a.filter(ImageFilter.GaussianBlur(5))

    img_DM = base.copy()
    img_PC = base.copy()

    img_DM.putalpha(DM_a_blurr)
    img_PC.putalpha(PC_a_blurr)

    return img_DM, img_PC


def save_images(base: str, output: str, instructions: list[dict]):
    img_DM, img_PC = gen_images("static/images/"+base, instructions)
    img_DM.save("static/generated/"+output+"_DM.png")
    img_PC.save("static/generated/"+output+"_PC.png")
