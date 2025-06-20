from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from PIL import Image, ImageDraw
import io


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
    # 讀取圖片
    image = Image.open(file.file).convert("RGB")
    width, height = image.size

    # 繪製黑線（垂直線）
    draw = ImageDraw.Draw(image)
    center_x = width // 2
    draw.line([(center_x, 0), (center_x, height)], fill="black", width=3)

    # 儲存修改後圖片到記憶體
    buf = io.BytesIO()
    image.save(buf, format="JPEG")
    buf.seek(0)

    return StreamingResponse(buf, media_type="image/jpeg")
