import os
from typing import List
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from PIL import Image, ImageDraw
import io
import uuid
import base64


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


# TODO: use real models
@app.post("/generate")
async def generate_images(file: UploadFile = File(...), styles: List[str] = Form(...)):
    """
    根據 styles 清單產生多張圖片，每種風格一張，回傳 UUID 和 base64 列表。
    """
    original_image = Image.open(file.file).convert("RGB")
    width, height = original_image.size

    results = []  # 存每張處理後圖片的 base64 和 UUID

    for style in styles:
        image = original_image.copy()
        draw = ImageDraw.Draw(image)

        # 根據風格進行不同處理（範例處理）
        if style == "cartoon3D":
            draw.line([(width // 4, 0), (width // 4, height)], fill="red", width=5)
        elif style == "beauty":
            draw.line([(width // 2, 0), (width // 2, height)], fill="pink", width=5)
        elif style == "comic":
            draw.line(
                [(3 * width // 4, 0), (3 * width // 4, height)], fill="blue", width=5
            )
        else:
            # 預設處理方式
            draw.line([(0, 0), (width, height)], fill="black", width=3)

        # 儲存圖片 + 編碼為 base64
        image_id = str(uuid.uuid4())
        filename = f"{image_id}.jpg"
        save_dir = "./images"
        os.makedirs(save_dir, exist_ok=True)
        save_path = os.path.join(save_dir, filename)
        image.save(save_path, format="JPEG")

        buf = io.BytesIO()
        image.save(buf, format="JPEG")
        buf.seek(0)
        base64_image = base64.b64encode(buf.getvalue()).decode("utf-8")

        results.append(base64_image)

    return JSONResponse(content={"results": results})


# NOTE: this downloads image but does not show it in img tag
# TODO: store an image and generate uuid for generating
@app.get("/download-image/")
def download_image(uuid: str):
    file_name = f"{uuid}.jpg"
    file_path = f"./images/{file_name}"
    if not os.path.exists(file_path):
        return {"error": "圖片不存在"}

    return FileResponse(path=file_path, media_type="image/jpeg", filename=file_name)
