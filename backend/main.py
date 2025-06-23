import os
from typing import List
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from PIL import Image
import io
import uuid
import base64

import torch
from ml_model.test import generate_image_from_pil


app = FastAPI()

origins = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/generate")
async def generate_images(file: UploadFile = File(...), styles: List[str] = Form(...)):
    original_image = Image.open(file.file).convert("RGB")
    device = "cuda" if torch.cuda.is_available() else "cpu"

    style_to_model = {
        "comic": "comic_model.pth",
        "cartoon3D": "3D_Cartoon_model.pth",
        "beauty": "Beauty_model.pth",
    }

    results = []

    for style in styles:
        if style not in style_to_model:
            continue  # 忽略不支援的風格

        model_path = style_to_model[style]
        output_img = generate_image_from_pil(original_image, model_path, device)

        buffer = io.BytesIO()
        output_img.save(buffer, format="PNG") # save to buffer
        base64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")

        results.append(base64_str)

    return {"results": results}


# NOTE: this downloads image but does not show it in img tag
# TODO: store an image and generate uuid for generating
@app.get("/download-image/")
def download_image(uuid: str):
    file_name = f"{uuid}.jpg"
    file_path = f"./images/{file_name}"
    if not os.path.exists(file_path):
        return {"error": "圖片不存在"}

    return FileResponse(path=file_path, media_type="image/jpeg", filename=file_name)
