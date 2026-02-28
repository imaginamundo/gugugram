type ImageUploadModalType = {
  open: boolean;
};


class UploadImageModalStore {
  open = $state<ImageUploadModalType>();
}

export const uploadImageModalStore = new UploadImageModalStore();