import torch
from PIL import Image
import torchvision.transforms as transforms
from torchvision.utils import save_image, make_grid
import os


# ==== Pix2Pix 論文 U-Net Generator (需與 train.py 完全一致) ====
class UNetBlock(torch.nn.Module):
    def __init__(
        self,
        in_channels,
        out_channels,
        submodule=None,
        outermost=False,
        innermost=False,
        use_dropout=False,
    ):
        super().__init__()
        self.outermost = outermost
        downconv = torch.nn.Conv2d(in_channels, out_channels, 4, 2, 1, bias=False)
        downrelu = torch.nn.LeakyReLU(0.2, True)
        downnorm = torch.nn.BatchNorm2d(out_channels)
        uprelu = torch.nn.ReLU(True)
        upnorm = torch.nn.BatchNorm2d(in_channels)
        if outermost:
            upconv = torch.nn.ConvTranspose2d(out_channels * 2, in_channels, 4, 2, 1)
            down = [downconv]
            up = [uprelu, upconv, torch.nn.Tanh()]
            model = down + [submodule] + up
        elif innermost:
            upconv = torch.nn.ConvTranspose2d(
                out_channels, in_channels, 4, 2, 1, bias=False
            )
            down = [downrelu, downconv]
            up = [uprelu, upconv, upnorm]
            model = down + up
        else:
            upconv = torch.nn.ConvTranspose2d(
                out_channels * 2, in_channels, 4, 2, 1, bias=False
            )
            down = [downrelu, downconv, downnorm]
            up = [uprelu, upconv, upnorm]
            if use_dropout:
                model = down + [submodule] + up + [torch.nn.Dropout(0.5)]
            else:
                model = down + [submodule] + up
        self.model = torch.nn.Sequential(*model)

    def forward(self, x):
        if self.outermost:
            return self.model(x)
        else:
            return torch.cat([x, self.model(x)], 1)


class UNetGenerator(torch.nn.Module):
    def __init__(self, input_nc=3, output_nc=3, num_downs=8):
        super().__init__()
        unet_block = UNetBlock(512, 512, innermost=True)
        for _ in range(num_downs - 5):
            unet_block = UNetBlock(512, 512, submodule=unet_block, use_dropout=True)
        unet_block = UNetBlock(256, 512, submodule=unet_block)
        unet_block = UNetBlock(128, 256, submodule=unet_block)
        unet_block = UNetBlock(64, 128, submodule=unet_block)
        self.model = UNetBlock(input_nc, 64, submodule=unet_block, outermost=True)

    def forward(self, x):
        return self.model(x)


# ==== 測試單張 + 輸出對比圖 ====
def test_and_compare(input_path, model_path, out_path, device="cuda"):
    transform = transforms.Compose(
        [
            transforms.Resize((256, 256)),
            transforms.ToTensor(),
            transforms.Normalize([0.5] * 3, [0.5] * 3),
        ]
    )
    img = Image.open(input_path).convert("RGB")
    x = transform(img).unsqueeze(0).to(device)

    G = UNetGenerator().to(device)
    G.load_state_dict(torch.load(model_path, map_location=device))
    G.eval()

    with torch.no_grad():
        out = G(x)

    both = torch.cat([x.cpu(), out.cpu()], dim=0)
    grid = make_grid(both, nrow=2, normalize=True)
    save_image(grid, out_path)
    print(f"[INFO] 已儲存 input + 生成 對比圖：{out_path}")


def generate_image_from_pil(img: Image.Image, model_path: str, device="cuda"):
    transform = transforms.Compose(
        [
            transforms.Resize((256, 256)),
            transforms.ToTensor(),
            transforms.Normalize([0.5] * 3, [0.5] * 3),
        ]
    )
    x = transform(img).unsqueeze(0).to(device)

    G = UNetGenerator().to(device)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(script_dir, model_path)
    G.load_state_dict(torch.load(model_path, map_location=device))
    G.eval()

    with torch.no_grad():
        out = G(x)

    output_tensor = (out.squeeze(0).cpu() * 0.5 + 0.5).clamp(0, 1)
    output_pil = transforms.ToPILImage()(output_tensor)

    return output_pil


if __name__ == "__main__":
    # ===== 修改這三個路徑 =====
    # input_path = r'C:\Users\USER\Downloads\S__240320566.jpg'   # 你的 input 圖
    input_path = r"C:\Users\USER\Downloads\ty.png"  # 你的 input 圖

    # model_path = r'3D_Cartoon_model.pth'
    model_path = r"comic_model.pth"
    # model_path = r'Beauty_model.pth'
    # 訓練好的模型路徑
    # out_path   = r"myphoto_3D_Cartoon_compare.png"
    out_path = r"myphoto_Comic_compare.png"
    # out_path   = r"myphoto_Beauty_compare.png"                                                                # 輸出對比圖名稱

    # GPU 有的話優先用 GPU，否則自動用 CPU
    device = "cuda" if torch.cuda.is_available() else "cpu"

    test_and_compare(input_path, model_path, out_path, device)
