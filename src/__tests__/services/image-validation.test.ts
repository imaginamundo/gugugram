import { describe, it, expect, vi, beforeEach } from "vitest";

// `image-size` is the dimension reader used by checkImage — control it per test.
vi.mock("image-size", () => ({ imageSize: vi.fn() }));

// Stub the blob storage so uploadImage() never hits the network.
vi.mock("../../infra/storage", () => ({
	storage: {
		upload: vi.fn().mockResolvedValue({ data: { ufsUrl: "https://example.com/img.png" } }),
		delete: vi.fn().mockResolvedValue(undefined),
	},
}));

vi.mock("../../repositories/community", () => ({
	communityRepository: {
		getCommunityBySlug: vi.fn(),
		insertCommunity: vi.fn().mockResolvedValue(undefined),
		insertSubscriber: vi.fn().mockResolvedValue(undefined),
	},
}));

vi.mock("../../repositories/userProfile", () => ({
	userProfileRepository: {
		getUserById: vi.fn(),
		updateUser: vi.fn().mockResolvedValue(undefined),
	},
}));

import { imageSize } from "image-size";
import { storage } from "../../infra/storage";
import { communityRepository } from "../../repositories/community";
import { userProfileRepository } from "../../repositories/userProfile";
import { checkImage } from "../../services/uploadImage/uploadImage";
import { createCommunity } from "../../services/community";
import { updateProfileData } from "../../services/user/profile";
import { ImageUploadErrors, ProfileErrors } from "../../types/errors";

type Mock = ReturnType<typeof vi.fn>;

// A tiny, well-formed base64 data URL — small enough to pass the size check so
// the dimension branch (driven by the mocked imageSize) is what's exercised.
const tinyPngDataUrl = "data:image/png;base64,iVBORw0KGgo=";
const makeFile = (bytes: number) =>
	new File([new Uint8Array(bytes)], "img.png", { type: "image/png" });

describe("checkImage", () => {
	beforeEach(() => vi.clearAllMocks());

	it("rejects files larger than the size limit", async () => {
		await expect(checkImage(makeFile(1024 * 201))).rejects.toThrow(
			ImageUploadErrors.FILE_TOO_LARGE,
		);
	});

	it("rejects files with no readable dimensions", async () => {
		(imageSize as Mock).mockReturnValue({});
		await expect(checkImage(makeFile(10))).rejects.toThrow(ImageUploadErrors.INVALID_IMAGE_FILE);
	});

	it("rejects dimensions outside the allowed set", async () => {
		(imageSize as Mock).mockReturnValue({ width: 7, height: 7 });
		await expect(checkImage(makeFile(10))).rejects.toThrow(
			ImageUploadErrors.INVALID_IMAGE_DIMENSIONS,
		);
	});

	it.each(["5x5", "10x10", "15x15", "30x30", "60x60"])(
		"accepts the allowed dimension %s",
		async (dim) => {
			const [width, height] = dim.split("x").map(Number);
			(imageSize as Mock).mockReturnValue({ width, height });
			await expect(checkImage(makeFile(10))).resolves.toBeUndefined();
		},
	);
});

// Regression coverage for the "checkImage was not awaited" bug: an invalid
// image must reject BEFORE anything is uploaded or persisted, in every path
// that accepts a user-supplied image.
describe("createCommunity image validation", () => {
	beforeEach(() => vi.clearAllMocks());

	it("rejects an invalid image without uploading or inserting", async () => {
		(communityRepository.getCommunityBySlug as Mock).mockResolvedValue(undefined);
		(imageSize as Mock).mockReturnValue({ width: 7, height: 7 });

		await expect(createCommunity("user-1", "Valid Title", null, tinyPngDataUrl)).rejects.toThrow(
			ImageUploadErrors.INVALID_IMAGE_DIMENSIONS,
		);

		expect(storage.upload).not.toHaveBeenCalled();
		expect(communityRepository.insertCommunity).not.toHaveBeenCalled();
	});

	it("uploads and inserts when the image is valid", async () => {
		(communityRepository.getCommunityBySlug as Mock)
			.mockResolvedValueOnce(undefined)
			.mockResolvedValueOnce({ id: "c-1", slug: "valid-title" });
		(imageSize as Mock).mockReturnValue({ width: 30, height: 30 });

		await createCommunity("user-1", "Valid Title", null, tinyPngDataUrl);

		expect(storage.upload).toHaveBeenCalledTimes(1);
		expect(communityRepository.insertCommunity).toHaveBeenCalledTimes(1);
	});
});

describe("updateProfileData image validation", () => {
	beforeEach(() => vi.clearAllMocks());

	it("rejects an invalid image without uploading or updating", async () => {
		(userProfileRepository.getUserById as Mock).mockResolvedValue({ id: "user-1", image: null });
		(imageSize as Mock).mockReturnValue({ width: 7, height: 7 });

		await expect(
			updateProfileData("user-1", {
				username: "user",
				email: "user@example.com",
				profileImage: tinyPngDataUrl,
			}),
		).rejects.toThrow(ProfileErrors.IMAGE_PROCESSING_FAILED);

		expect(storage.upload).not.toHaveBeenCalled();
		expect(userProfileRepository.updateUser).not.toHaveBeenCalled();
	});

	it("uploads and updates when the image is valid", async () => {
		(userProfileRepository.getUserById as Mock).mockResolvedValue({ id: "user-1", image: null });
		(imageSize as Mock).mockReturnValue({ width: 30, height: 30 });

		await updateProfileData("user-1", {
			username: "user",
			email: "user@example.com",
			profileImage: tinyPngDataUrl,
		});

		expect(storage.upload).toHaveBeenCalledTimes(1);
		expect(userProfileRepository.updateUser).toHaveBeenCalledTimes(1);
		const [, updatePayload] = (userProfileRepository.updateUser as Mock).mock.calls[0];
		expect(updatePayload.image).toBe("https://example.com/img.png");
	});
});
