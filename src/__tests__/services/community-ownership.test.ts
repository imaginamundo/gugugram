// Feature: communities, Property 4: Criador é automaticamente assinante
// Feature: communities, Property 14: Transferência de propriedade — invariante de papéis
// Feature: communities, Property 18: Assinatura e cancelamento são operações inversas
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";

vi.mock("../../infra/storage", () => ({
	storage: {
		upload: vi.fn().mockResolvedValue({ data: { ufsUrl: "https://example.com/img.png" } }),
		delete: vi.fn().mockResolvedValue(undefined),
	},
}));

vi.mock("../../repositories/community", () => ({
	communityRepository: {
		getCommunityBySlug: vi.fn(),
		getCommunityById: vi.fn(),
		insertCommunity: vi.fn().mockResolvedValue(undefined),
		insertSubscriber: vi.fn().mockResolvedValue(undefined),
		deleteSubscriber: vi.fn().mockResolvedValue(undefined),
		getSubscriber: vi.fn(),
		getAdmin: vi.fn(),
		insertAdmin: vi.fn().mockResolvedValue(undefined),
		deleteAdmin: vi.fn().mockResolvedValue(undefined),
		updateCommunityOwner: vi.fn().mockResolvedValue(undefined),
	},
}));

import { communityRepository } from "../../repositories/community";
import {
	createCommunity,
	transferOwnership,
	subscribeToCommunity,
	unsubscribeFromCommunity,
} from "../../services/community";
import { CommunityErrors } from "../../types/errors";

async function captureError(fn: () => Promise<unknown>): Promise<Error> {
	try {
		await fn();
	} catch (e) {
		expect(e instanceof Error).toBe(true);
		return e as Error;
	}
	throw new Error("Expected function to throw but it did not");
}

describe("Property 4: Criador é automaticamente assinante", () => {
	beforeEach(() => vi.clearAllMocks());

	it("insertSubscriber é chamado com o ownerId após criação bem-sucedida", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 1 }),
				fc.string({ minLength: 3, maxLength: 100 }),
				async (ownerId, title) => {
					vi.clearAllMocks();
					const communityId = "c-" + Math.random().toString(36).slice(2);
					(communityRepository.getCommunityBySlug as ReturnType<typeof vi.fn>)
						.mockResolvedValueOnce(undefined)
						.mockResolvedValueOnce({ id: communityId, slug: "slug" });
					(communityRepository.insertCommunity as ReturnType<typeof vi.fn>).mockResolvedValue(
						undefined,
					);
					(communityRepository.insertSubscriber as ReturnType<typeof vi.fn>).mockResolvedValue(
						undefined,
					);

					await createCommunity(ownerId, title, null, null);

					const subscriberCalls = (communityRepository.insertSubscriber as ReturnType<typeof vi.fn>)
						.mock.calls;
					expect(subscriberCalls.length).toBeGreaterThanOrEqual(1);
					const calledWithOwner = subscriberCalls.some(([, userId]) => userId === ownerId);
					expect(calledWithOwner).toBe(true);
				},
			),
			{ numRuns: 100 },
		);
	});
});

describe("Property 14: Transferência de propriedade — invariante de papéis", () => {
	beforeEach(() => vi.clearAllMocks());

	it("após transferência: updateCommunityOwner chamado com newOwnerId e deleteAdmin chamado para remover novo owner de admins", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 1 }),
				fc.string({ minLength: 1 }),
				fc.string({ minLength: 1 }),
				async (communityId, ownerId, newOwnerId) => {
					vi.clearAllMocks();
					(communityRepository.getCommunityById as ReturnType<typeof vi.fn>).mockResolvedValue({
						id: communityId,
						ownerId,
					});
					(communityRepository.getAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({
						id: "admin-1",
					});
					(communityRepository.updateCommunityOwner as ReturnType<typeof vi.fn>).mockResolvedValue(
						undefined,
					);
					(communityRepository.deleteAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(
						undefined,
					);
					(communityRepository.getSubscriber as ReturnType<typeof vi.fn>).mockResolvedValue({
						id: "sub-1",
					});

					await transferOwnership(ownerId, communityId, newOwnerId);

					// newOwnerId must become the new owner
					const updateCalls = (communityRepository.updateCommunityOwner as ReturnType<typeof vi.fn>)
						.mock.calls;
					expect(updateCalls.length).toBe(1);
					expect(updateCalls[0][0]).toBe(communityId);
					expect(updateCalls[0][1]).toBe(newOwnerId);

					// newOwnerId must be removed from admins
					const deleteAdminCalls = (communityRepository.deleteAdmin as ReturnType<typeof vi.fn>)
						.mock.calls;
					expect(deleteAdminCalls.length).toBe(1);
					expect(deleteAdminCalls[0][1]).toBe(newOwnerId);
				},
			),
			{ numRuns: 100 },
		);
	});

	it("após transferência: antigo owner permanece como subscriber (insertSubscriber chamado se não era subscriber)", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 1 }),
				fc.string({ minLength: 1 }),
				fc.string({ minLength: 1 }),
				async (communityId, ownerId, newOwnerId) => {
					vi.clearAllMocks();
					(communityRepository.getCommunityById as ReturnType<typeof vi.fn>).mockResolvedValue({
						id: communityId,
						ownerId,
					});
					(communityRepository.getAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({
						id: "admin-1",
					});
					(communityRepository.updateCommunityOwner as ReturnType<typeof vi.fn>).mockResolvedValue(
						undefined,
					);
					(communityRepository.deleteAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(
						undefined,
					);
					// Old owner is NOT a subscriber yet
					(communityRepository.getSubscriber as ReturnType<typeof vi.fn>).mockResolvedValue(null);
					(communityRepository.insertSubscriber as ReturnType<typeof vi.fn>).mockResolvedValue(
						undefined,
					);

					await transferOwnership(ownerId, communityId, newOwnerId);

					const insertSubCalls = (communityRepository.insertSubscriber as ReturnType<typeof vi.fn>)
						.mock.calls;
					const oldOwnerSubscribed = insertSubCalls.some(([, userId]) => userId === ownerId);
					expect(oldOwnerSubscribed).toBe(true);
				},
			),
			{ numRuns: 100 },
		);
	});
});

describe("Property 18: Assinatura e cancelamento são operações inversas", () => {
	beforeEach(() => vi.clearAllMocks());

	it("assinar e depois cancelar resulta em deleteSubscriber sendo chamado", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 1 }),
				fc.string({ minLength: 1 }),
				async (userId, communityId) => {
					vi.clearAllMocks();
					// Setup for subscribe
					(communityRepository.getCommunityById as ReturnType<typeof vi.fn>).mockResolvedValue({
						id: communityId,
					});
					(communityRepository.getSubscriber as ReturnType<typeof vi.fn>)
						.mockResolvedValueOnce(null) // not subscribed yet → subscribe succeeds
						.mockResolvedValueOnce({ id: "sub-1" }); // now subscribed → unsubscribe succeeds
					(communityRepository.insertSubscriber as ReturnType<typeof vi.fn>).mockResolvedValue(
						undefined,
					);
					(communityRepository.deleteSubscriber as ReturnType<typeof vi.fn>).mockResolvedValue(
						undefined,
					);

					await subscribeToCommunity(userId, communityId);
					await unsubscribeFromCommunity(userId, communityId);

					expect(communityRepository.insertSubscriber).toHaveBeenCalledWith(communityId, userId);
					expect(communityRepository.deleteSubscriber).toHaveBeenCalledWith(communityId, userId);
				},
			),
			{ numRuns: 100 },
		);
	});

	it("cancelar sem ter assinado retorna NOT_SUBSCRIBER", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 1 }),
				fc.string({ minLength: 1 }),
				async (userId, communityId) => {
					vi.clearAllMocks();
					(communityRepository.getCommunityById as ReturnType<typeof vi.fn>).mockResolvedValue({
						id: communityId,
					});
					(communityRepository.getSubscriber as ReturnType<typeof vi.fn>).mockResolvedValue(null);

					const err = await captureError(() => unsubscribeFromCommunity(userId, communityId));
					expect(err.message).toBe(CommunityErrors.NOT_SUBSCRIBER);
				},
			),
			{ numRuns: 100 },
		);
	});

	it("assinar duas vezes retorna ALREADY_SUBSCRIBER", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 1 }),
				fc.string({ minLength: 1 }),
				async (userId, communityId) => {
					vi.clearAllMocks();
					(communityRepository.getCommunityById as ReturnType<typeof vi.fn>).mockResolvedValue({
						id: communityId,
					});
					(communityRepository.getSubscriber as ReturnType<typeof vi.fn>).mockResolvedValue({
						id: "sub-1",
					});

					const err = await captureError(() => subscribeToCommunity(userId, communityId));
					expect(err.message).toBe(CommunityErrors.ALREADY_SUBSCRIBER);
				},
			),
			{ numRuns: 100 },
		);
	});
});
