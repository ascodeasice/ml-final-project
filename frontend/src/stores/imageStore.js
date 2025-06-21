import { create } from "zustand";

const useUploadedImage = create((set) => ({
  uploadedImage: null,
  setUploadedImage: (newUploadedImage) =>
    set({ uploadedImage: newUploadedImage }),
}));

export { useUploadedImage };
