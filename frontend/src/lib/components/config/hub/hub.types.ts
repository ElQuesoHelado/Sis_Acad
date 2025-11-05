import type { Component } from 'svelte';

/**
 * Represents a navigation item for a "Hub" section
 * (e.g., a card in a landing/dashboard hub page).
 */
export type HubItem = {
	title: string;
	description: string;
	url: string;
	icon?: Component; // Optional Svelte component icon
};

/**
 * Represents a group of related hub items
 * (e.g., "Academic Management").
 */
export type HubGroup = {
	title: string;
	items: HubItem[];
};
