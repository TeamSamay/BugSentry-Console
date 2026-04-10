from PIL import Image
import numpy as np
import os

img_path = "public/logo.png"
if not os.path.exists(img_path):
    print("Logo not found!")
    exit(1)

img = Image.open(img_path).convert("RGBA")
data = np.array(img)

# Any pixel that is very dark (RGB max < 25) becomes transparent
max_rgb = np.max(data[:,:,:3], axis=2)
mask = max_rgb < 25
data[mask, 3] = 0

# Also find the bounding box ignoring small noise. 
# We'll use the alpha channel to find the bbox of significant content (alpha > 0)
img_alpha = Image.fromarray(data)
bbox = img_alpha.getbbox()

if bbox:
    # crop out the background
    img_cropped = img_alpha.crop(bbox)
    img_cropped.save(img_path)
    print("Cropped and removed background successfully.")
else:
    print("Image was completely black?")
