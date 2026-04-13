/**
 * Listings Model
 *
 * Data layer for furniture listings. Currently returns mock data that mirrors
 * the Supabase schema shape. Replace getListings() with a real API call to the
 * FastAPI backend once backend endpoints are wired up to Supabase.
 *
 * Schema reference:
 *   listings  → item (title, condition_level, origin_type)
 *             → location (city, state)
 *             → item_images (primary_image_url)
 *
 * condition_level enum: like_new | good | fair | poor
 * origin_type enum:     owned | street_find
 * status enum:          available | reserved | completed | gone | archived
 */

const MOCK_LISTINGS = [
	{
		id: "1",
		status: "available",
		item: {
			title: "Wooden Dining Table",
			condition_level: "good",
			// origin_type: "owned",
		},
		location: { city: "Amherst", state: "MA" },
		primary_image_url: null,
	},
	{
		id: "2",
		status: "available",
		item: {
			title: "Leather Armchair",
			condition_level: "like_new",
			// origin_type: "owned",
		},
		location: { city: "Northampton", state: "MA" },
		primary_image_url: null,
	},
	{
		id: "3",
		status: "available",
		item: {
			title: "IKEA Bookshelf",
			condition_level: "fair",
			// origin_type: "street_find",
		},
		location: { city: "Hadley", state: "MA" },
		primary_image_url: null,
	},
	{
		id: "4",
		status: "available",
		item: {
			title: "Glass Coffee Table",
			condition_level: "good",
			// origin_type: "owned",
		},
		location: { city: "Amherst", state: "MA" },
		primary_image_url: null,
	},
	{
		id: "5",
		status: "available",
		item: {
			title: "Office Chair",
			condition_level: "poor",
			// origin_type: "street_find",
		},
		location: { city: "South Hadley", state: "MA" },
		primary_image_url: null,
	},
	{
		id: "6",
		status: "available",
		item: {
			title: "Queen Bed Frame",
			condition_level: "like_new",
			// origin_type: "owned",
		},
		location: { city: "Northampton", state: "MA" },
		primary_image_url: null,
	},
	{
		id: "7",
		status: "available",
		item: {
			title: "Standing Lamp",
			condition_level: "good",
			// origin_type: "street_find",
		},
		location: { city: "Amherst", state: "MA" },
		primary_image_url: null,
	},
	{
		id: "8",
		status: "available",
		item: {
			title: "3-Drawer Dresser",
			condition_level: "fair",
			// origin_type: "owned",
		},
		location: { city: "Belchertown", state: "MA" },
		primary_image_url: null,
	},
];

// /**
//  * Fetch available listings, optionally filtered by a search query.
//  *
//  * @param {Object} params
//  * @param {string} [params.search=""] - Filters results by item title (case-insensitive).
//  * @returns {Promise<Array>} Resolves to an array of listing objects.
//  */
// export async function getListings({ search = "" } = {}) {
// 	await new Promise((resolve) => setTimeout(resolve, 150));

// 	let results = MOCK_LISTINGS.filter((l) => l.status === "available");

// 	if (search.trim()) {
// 		const query = search.trim().toLowerCase();
// 		results = results.filter((l) =>
// 			l.item.title.toLowerCase().includes(query),
// 		);
// 	}

// 	return results;
// }

import api from "../api/axios";

export async function fetchListings() {
  const response = await api.get("/listings");
  return response.data;
}
