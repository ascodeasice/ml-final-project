import { create } from "zustand";

const useUploadedImage = create((set) => ({
  uploadedImage: null,
  setUploadedImage: (newUploadedImage) =>
    set({ uploadedImage: newUploadedImage }),
}));

const useResultImages = create((set) => ({
  resultImages: [],
  addResultImage: (newUploadedImage) =>
    set((state) => ({
      resultImages: [...state.resultImages, newUploadedImage],
    })),
  clearResultImages: () => set(() => ({ resultImages: [] })),
}));

export { useUploadedImage, useResultImages };
