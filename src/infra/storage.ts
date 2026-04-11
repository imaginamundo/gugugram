import { utapi } from "./uploadthing";

export const storage = {
	upload: (file: File) => utapi.uploadFiles(file),
	delete: (key: string) => utapi.deleteFiles(key),
};
