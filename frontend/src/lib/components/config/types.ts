export type NavItem = {
	title: string;
	url: string;
	isActive?: boolean;
};

export type NavGroup = {
	title: string;
	url?: string;
	items: NavItem[];
};
