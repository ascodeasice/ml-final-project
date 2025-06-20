import os
from fastapi import FastAPI, File, UploadFile
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
# TODO: more parameters
@app.post("/generate")
async def generate_images(file: UploadFile = File(...)):
    """
    接收圖片、繪製黑線、回傳 base64 和 UUID，並儲存圖片到 ./images 資料夾。
    """
    # 讀取圖片並轉換為 RGB
    image = Image.open(file.file).convert("RGB")
    width, height = image.size

    # 繪製圖片中間的黑線
    draw = ImageDraw.Draw(image)
    center_x = width // 2
    draw.line([(center_x, 0), (center_x, height)], fill="black", width=3)

    # 產生 UUID 並設定檔名
    image_id = str(uuid.uuid4())
    filename = f"{image_id}.jpg"
    save_dir = "./images"
    os.makedirs(save_dir, exist_ok=True)  # 確保目錄存在
    save_path = os.path.join(save_dir, filename)

    # 儲存圖片到本地
    image.save(save_path, format="JPEG")

    # 將圖片轉為 base64 字串（回傳用）
    buf = io.BytesIO()
    image.save(buf, format="JPEG")
    buf.seek(0)
    base64_image = base64.b64encode(buf.getvalue()).decode("utf-8")

    # 回傳 UUID 和 base64
    return JSONResponse(content={"uuid": image_id, "image_base64": base64_image})


# NOTE: this downloads image but does not show it in img tag
# TODO: store an image and generate uuid for generating
@app.get("/download-image/")
def download_image(uuid: str):
    file_name = f"{uuid}.jpg"
    file_path = f"./images/{file_name}"
    if not os.path.exists(file_path):
        return {"error": "圖片不存在"}

    return FileResponse(path=file_path, media_type="image/jpeg", filename=file_name)
