export type WorkItemIcon = "book" | "clipboard" | "bug" | "none";

export type WorkItemTone = "green" | "amber" | "red";

export interface WorkItem {
	id: string;
	action: string;
	name: string;
	assignment: string;
	/** Multiple booking lines when more than one Figma booking property is enabled. */
	assignments?: string[];
	time: string;
	capacity: string;
	progress: number;
	tone: WorkItemTone;
	icon: WorkItemIcon;
}
