from PIL import Image
import os

img_path = r"C:\Users\hares\.gemini\antigravity-ide\brain\330a69be-a310-4d9d-a891-72a25320bec8\tempo_logo_concept_1787758419265.jpg"
public_dir = r"c:\Users\hares\OneDrive\Desktop\CS_Projects\TempoADHDassist\public"

# Ensure public directory exists
os.makedirs(public_dir, exist_ok=True)

# Open image
img = Image.open(img_path)

# Ensure it's square (crop from center if not)
width, height = img.size
new_size = min(width, height)
left = (width - new_size) / 2
top = (height - new_size) / 2
right = (width + new_size) / 2
bottom = (height + new_size) / 2
img_square = img.crop((left, top, right, bottom))

# Save as icon.png (512x512)
img_png = img_square.resize((512, 512), Image.Resampling.LANCZOS)
img_png.save(os.path.join(public_dir, "icon.png"))

# Save as favicon.ico (32x32, 16x16, 64x64)
img_ico = img_square.resize((64, 64), Image.Resampling.LANCZOS)
img_ico.save(os.path.join(public_dir, "favicon.ico"), format="ICO", sizes=[(16, 16), (32, 32), (64, 64)])

print("Successfully created icon.png and favicon.ico in public/")
