import { storage } from "@infra/storage";

export function deleteImage(key: string) {
	return storage.delete(key);
}
