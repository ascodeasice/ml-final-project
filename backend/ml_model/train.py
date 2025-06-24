import os
import torch
from torch.utils.data import Dataset, DataLoader
from PIL import Image
import torchvision.transforms as transforms
from torchvision.utils import save_image
import torch.nn as nn
import torch.nn.utils as nn_utils
import torch.optim as optim
import matplotlib.pyplot as plt
from torchvision.models import vgg19, VGG19_Weights

# ==== EarlyStopping 類別 ====
class EarlyStopping:
    def __init__(self, patience=10, min_delta=0.1):
        self.patience = patience
        self.min_delta = min_delta
        self.best_loss = None
        self.counter = 0
        self.early_stop = False

    def __call__(self, current_loss):
        if self.best_loss is None:
            self.best_loss = current_loss
        elif current_loss < self.best_loss - self.min_delta:
            self.best_loss = current_loss
            self.counter = 0
        else:
            self.counter += 1
            if self.counter >= self.patience:
                self.early_stop = True


# ==== 單風格資料集 class ====
class SingleStyleDataset(Dataset):
    def __init__(self, input_dir, label_dir, transform=None):
        self.input_dir = input_dir
        self.label_dir = label_dir
        self.transform = transform
        input_files = set([f for f in os.listdir(input_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
        label_files = set([f for f in os.listdir(label_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
        self.filenames = sorted(list(input_files & label_files))
        print(f"[DEBUG] 訓練圖片數量: {len(self.filenames)}")

    def __len__(self):
        return len(self.filenames)

    def __getitem__(self, idx):
        fname = self.filenames[idx]
        input_path = os.path.join(self.input_dir, fname)
        label_path = os.path.join(self.label_dir, fname)
        input_img = Image.open(input_path).convert('RGB')
        label_img = Image.open(label_path).convert('RGB')
        if self.transform:
            input_img = self.transform(input_img)
            label_img = self.transform(label_img)
        return input_img, label_img

# ==== UNet Generator ====
class UNetBlock(nn.Module):
    def __init__(self, in_channels, out_channels, submodule=None, outermost=False, innermost=False, use_dropout=False):
        super().__init__()
        self.outermost = outermost
        downconv = nn.Conv2d(in_channels, out_channels, 4, 2, 1, bias=False)
        downrelu = nn.LeakyReLU(0.2, True)
        downnorm = nn.BatchNorm2d(out_channels)
        uprelu = nn.ReLU(True)
        upnorm = nn.BatchNorm2d(in_channels)
        if outermost:
            upconv = nn.ConvTranspose2d(out_channels*2, in_channels, 4, 2, 1)
            down = [downconv]
            up = [uprelu, upconv, nn.Tanh()]
            model = down + [submodule] + up
        elif innermost:
            upconv = nn.ConvTranspose2d(out_channels, in_channels, 4, 2, 1, bias=False)
            down = [downrelu, downconv]
            up = [uprelu, upconv, upnorm]
            model = down + up
        else:
            upconv = nn.ConvTranspose2d(out_channels*2, in_channels, 4, 2, 1, bias=False)
            down = [downrelu, downconv, downnorm]
            up = [uprelu, upconv, upnorm]
            if use_dropout:
                model = down + [submodule] + up + [nn.Dropout(0.5)]
            else:
                model = down + [submodule] + up
        self.model = nn.Sequential(*model)

    def forward(self, x):
        if self.outermost:
            return self.model(x)
        else:
            return torch.cat([x, self.model(x)], 1)

class UNetGenerator(nn.Module):
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

# ==== PatchGAN Discriminator with SpectralNorm ====
class PatchDiscriminator(nn.Module):
    def __init__(self, in_channels=3):
        super().__init__()
        self.net = nn.Sequential(
            nn_utils.spectral_norm(nn.Conv2d(in_channels * 2, 64, 4, 2, 1)),
            nn.LeakyReLU(0.2, True),
            nn_utils.spectral_norm(nn.Conv2d(64, 128, 4, 2, 1, bias=False)),
            nn.BatchNorm2d(128),
            nn.LeakyReLU(0.2, True),
            nn_utils.spectral_norm(nn.Conv2d(128, 256, 4, 2, 1, bias=False)),
            nn.BatchNorm2d(256),
            nn.LeakyReLU(0.2, True),
            nn_utils.spectral_norm(nn.Conv2d(256, 512, 4, 1, 1, bias=False)),
            nn.BatchNorm2d(512),
            nn.LeakyReLU(0.2, True),
            nn_utils.spectral_norm(nn.Conv2d(512, 1, 4, 1, 1))
        )
    def forward(self, x, y):
        inp = torch.cat([x, y], dim=1)
        return self.net(inp)
    
# ==== VGG Perceptual Loss ====
class VGGPerceptualLoss(nn.Module):
    def __init__(self):
        super().__init__()
        vgg = vgg19(weights=VGG19_Weights.IMAGENET1K_V1).features[:16].eval()
        for p in vgg.parameters():
            p.requires_grad = False
        self.vgg = vgg
        self.mean = torch.tensor([0.485, 0.456, 0.406]).view(1,3,1,1)
        self.std = torch.tensor([0.229, 0.224, 0.225]).view(1,3,1,1)
    def forward(self, fake, real):
        fake_vgg = (fake + 1) / 2
        real_vgg = (real + 1) / 2
        fake_vgg = (fake_vgg - self.mean.to(fake.device)) / self.std.to(fake.device)
        real_vgg = (real_vgg - self.mean.to(real.device)) / self.std.to(real.device)
        f_fake = self.vgg(fake_vgg)
        f_real = self.vgg(real_vgg)
        return nn.functional.l1_loss(f_fake, f_real)


# ==== 訓練主程式 ====
def train(input_dir, label_dir, model_save_path, results_dir, epochs=50, batch_size=8, device='cuda'):
    print(f"[INFO] Input dir: {input_dir}")
    print(f"[INFO] Label dir: {label_dir}")
    # ==== Data Augmentation  ====
    transform = transforms.Compose([
        transforms.Resize((512,512)),
        #transforms.RandomHorizontalFlip(),
        #transforms.ColorJitter(brightness=0.1, contrast=0.1, saturation=0.1, hue=0.05),
        transforms.ToTensor(),
        transforms.Normalize([0.5]*3, [0.5]*3)
    ])
    dataset = SingleStyleDataset(input_dir, label_dir, transform)
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True, num_workers=4, pin_memory=True)
    G = UNetGenerator().to(device)
    D = PatchDiscriminator().to(device)
    optim_G = optim.Adam(G.parameters(), lr=2e-4, betas=(0.5, 0.999))
    optim_D = optim.Adam(D.parameters(), lr=1e-4, betas=(0.5, 0.999))
    adversarial_loss = nn.BCEWithLogitsLoss()
    l1_loss = nn.L1Loss()
    perceptual_loss = VGGPerceptualLoss().to(device)
    os.makedirs(results_dir, exist_ok=True)

    G_losses, D_losses, L1_losses, Adv_losses = [], [], [], []
    early_stopper = EarlyStopping(patience=15, min_delta=0.1)

    for epoch in range(epochs):
        g_loss_sum = d_loss_sum = l1_loss_sum = adv_loss_sum = 0
        count = 0
        for input_img, label_img in dataloader:
            input_img = input_img.to(device)
            label_img = label_img.to(device)
            fake_img = G(input_img)
            D_real = D(input_img, label_img)
            D_fake = D(input_img, fake_img.detach())
            valid = torch.ones_like(D_real)*0.9
            fake = torch.zeros_like(D_fake)+0.1
            loss_D = (adversarial_loss(D_real, valid) + adversarial_loss(D_fake, fake)) / 2
            optim_D.zero_grad()
            loss_D.backward()
            optim_D.step()

            D_fake = D(input_img, fake_img)
            valid = torch.ones_like(D_fake)
            loss_G_adv = adversarial_loss(D_fake, valid)
            loss_G_l1 = l1_loss(fake_img, label_img)
            loss_G_perc = perceptual_loss(fake_img, label_img)
            loss_G = loss_G_adv + loss_G_l1 * 10 + loss_G_perc*2
            optim_G.zero_grad()
            loss_G.backward()
            optim_G.step()

            g_loss_sum += loss_G.item()
            d_loss_sum += loss_D.item()
            l1_loss_sum += loss_G_l1.item()
            adv_loss_sum += loss_G_adv.item()
            count += 1

        G_losses.append(g_loss_sum / count)
        D_losses.append(d_loss_sum / count)
        L1_losses.append(l1_loss_sum / count)
        Adv_losses.append(adv_loss_sum / count)

        print(f"[Epoch {epoch+1}] D: {loss_D.item():.3f}, G: {loss_G.item():.3f}")
        save_image(fake_img[:4], f'{results_dir}/fake_{epoch+1}.png', nrow=2, normalize=True)

        early_stopper(G_losses[-1])
        if early_stopper.early_stop:
            print(f"[EARLY STOPPING] G loss 未改善達 {early_stopper.patience} 次，提早終止於 epoch {epoch+1}")
            break

    torch.save(G.state_dict(), model_save_path)
    print(f"模型已存為 {model_save_path}")

    # ==== 繪製 Loss Curve ====
    plt.figure(figsize=(12,8))
    #plt.suptitle("Training Loss Curves of 3D_Cartoon model", fontsize=16)
    plt.suptitle("Training Loss Curves of Comic model", fontsize=16)
    #plt.suptitle("Training Loss Curves of Beauty model", fontsize=16)
    

    plt.subplot(2,2,1)
    plt.plot(G_losses, label='G Loss')
    plt.xlabel('Epoch')
    plt.ylabel('G Loss')
    plt.title('Generator Loss')
    plt.grid(True)

    plt.subplot(2,2,2)
    plt.plot(D_losses, label='D Loss', color='orange')
    plt.xlabel('Epoch')
    plt.ylabel('D Loss')
    plt.title('Discriminator Loss')
    plt.grid(True)

    plt.subplot(2,2,3)
    plt.plot(L1_losses, label='L1 Loss', color='green')
    plt.xlabel('Epoch')
    plt.ylabel('L1 Loss')
    plt.title('L1 Loss')
    plt.grid(True)

    plt.subplot(2,2,4)
    plt.plot(Adv_losses, label='Adversarial Loss', color='red')
    plt.xlabel('Epoch')
    plt.ylabel('Adv. Loss')
    plt.title('Adversarial Loss')
    plt.grid(True)

    plt.tight_layout()
    #plt.savefig(os.path.join(results_dir, "loss_subplots_3D.png"))
    plt.savefig(os.path.join(results_dir, "loss_subplots_Comic.png"))
    #plt.savefig(os.path.join(results_dir, "loss_subplots_Beauty.png"))
    plt.show()

if __name__ == '__main__':
    #3D Rendered Cartoon Style 訓練 （900 pictures）
    # train(
    #     input_dir=r'C:\Users\USER\Desktop\mlclass\dataset\dataset\3D Rendered Cartoon Style\train\input',
    #     label_dir=r'C:\Users\USER\Desktop\mlclass\dataset\dataset\3D Rendered Cartoon Style\train\label',
    #     model_save_path="3D_Cartoon_model.pth",
    #     results_dir="results_3D_Cartoon",
    #     epochs=100,
    #     batch_size=32,
    #     device='cuda'
    # )

    # Comic Style 訓練（9501 pictures）
     train(
        input_dir=r'C:\Users\USER\Desktop\mlclass\dataset\dataset\Comic Style\train\input',
        label_dir=r'C:\Users\USER\Desktop\mlclass\dataset\dataset\Comic Style\train\label',
        model_save_path="comic_model.pth",
        results_dir="results_comic",
        epochs=100,
        batch_size=4,
        device='cuda'
    )

    # # Beauty Filter Style 訓練（2500 pictures）
    # train(
    #    input_dir= r'C:\Users\USER\Desktop\mlclass\dataset\dataset\Beauty Filter Style\train\input',
    #    label_dir= r'C:\Users\USER\Desktop\mlclass\dataset\dataset\Beauty Filter Style\train\label',
    #    model_save_path="Beauty_model.pth",
    #    results_dir="results_Beauty",
    #    epochs=100,
    #    batch_size=32,
    #    device='cuda'
    # )

