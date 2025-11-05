import type { Component } from 'svelte';

/**
 * Represents a single navigation item.
 */
export type NavItem = {
	title: string;
	url: string;
	icon?: Component; // Optional icon component
	isActive?: boolean;
};

/**
 * Represents a group of related navigation items.
 * A group may optionally define its own URL.
 */
export type NavGroup = {
	title?: string;
	url?: string;
	items: NavItem[];
};

export type Crumb = {
	label: string;
	href?: string;
};
