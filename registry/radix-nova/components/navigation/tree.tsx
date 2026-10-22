"use client";

import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import {
	NavigationIcon,
	type NavigationIconName,
} from "@/components/snapp/navigation/navigation-icons";

type TreeItemVariant =
	| "default"
	| "selected"
	| "unselectable"
	| "drop-indicator"
	| "add"
	| "notification";

const builderRootLabel = cva("px-2 text-snapp-text-primary/50 opacity-70");
const builderChildLabel = cva("px-2.5 text-snapp-text-primary/50 opacity-70");
const hierarchyRootLabel = cva("opacity-70");
const hierarchySecondLabel = cva("px-3.5");
const hierarchyChildLabel = cva("px-3");
const hierarchyRootGroup = cva("py-0 pl-1.5");
const hierarchySecondGroup = cva("ml-4.5 py-0 pl-2");
const nestedGroup = cva("py-0 pl-2");
const groupWithSectionLabel = cva("before:top-8");

const disabledIconNames: Partial<
	Record<NavigationIconName, NavigationIconName>
> = {
	treeItemClipboardTask: "treeItemClipboardTask1",
	treeItemBook: "treeItemBook1",
	treeItemBug: "treeItemBug1",
	treeFolderFolder: "treeFolderFolder1",
	treeFolderFolderOpen: "treeFolderFolderOpen1",
};
type TreeItemProps = Omit<React.ComponentProps<"button">, "children"> & {
	label: React.ReactNode;
	identifier?: React.ReactNode;
	icon?: React.ReactNode;
	iconName?: NavigationIconName;
	variant?: TreeItemVariant;
	locked?: boolean;
	chevron?: boolean;
	expanded?: boolean;
	time?: React.ReactNode;
	notification?: React.ReactNode;
	date?: React.ReactNode;
	menu?: boolean;
	menuIconName?: NavigationIconName;
	lockIconName?: NavigationIconName;
	truncateLabel?: boolean;
	onMenuSelect?: (event: React.MouseEvent<HTMLButtonElement>) => void;
	menuLabel?: string;
	dragHandle?: React.ReactNode;
	folder?: boolean;
	size?: "default" | "compact";
};

function TreeItem({
	label,
	identifier,
	icon,
	iconName,
	variant = "default",
	locked,
	chevron,
	expanded,
	time,
	notification,
	date,
	menu,
	menuIconName,
	lockIconName,
	truncateLabel = true,
	onMenuSelect,
	menuLabel,
	dragHandle,
	folder = false,
	size = "default",
	draggable,
	disabled,
	className,
	...props
}: TreeItemProps) {
	const unavailable = disabled || variant === "unselectable";
	const resolvedIconName =
		unavailable && iconName
			? (disabledIconNames[iconName] ?? iconName)
			: iconName;
	const prefix = folder ? "treeFolder" : "treeItem";
	if (variant === "drop-indicator") {
		return (
			<div
				aria-hidden="true"
				className={cn("relative h-8 overflow-hidden", className)}
				data-slot="snapp-tree-drop-indicator"
			>
				{/* Keep the exported arrow at its natural size; only the rule grows. */}
				<NavigationIcon
					className="absolute inset-y-0 left-0 w-6 justify-start overflow-hidden"
					name={
						folder
							? "treeFolderTypeDropIndicator"
							: "treeItemTypeDropIndicator"
					}
				/>
				<span className="absolute top-1/2 right-3 left-6 h-0.5 -translate-y-1/2 bg-snapp-text-blue" />
			</div>
		);
	}
	const defaultIcon: NavigationIconName = folder
		? expanded
			? unavailable
				? "treeFolderFolderOpen1"
				: "treeFolderFolderOpen"
			: unavailable
				? "treeFolderFolder1"
				: "treeFolderFolder"
		: unavailable
			? "treeItemClipboardTask1"
			: "treeItemClipboardTask";
	return (
		<div
			className={cn(
				"relative h-8 w-full min-w-0",
				size === "compact" && "h-7",
				className
			)}
		>
			<button
				aria-disabled={unavailable || undefined}
				aria-expanded={
					folder || expanded !== undefined
						? (expanded ?? false)
						: undefined
				}
				aria-selected={variant === "selected"}
				className={cn(
					"group/tree-item flex h-8 w-full min-w-0 items-center border-0 bg-transparent p-0 text-left font-sans text-sm leading-5 font-normal outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-snapp-border-highlight",
					size === "compact" && "h-7"
				)}
				data-slot={folder ? "snapp-tree-folder" : "snapp-tree-item"}
				data-variant={variant}
				disabled={unavailable}
				draggable={draggable}
				role="treeitem"
				type="button"
				{...props}
			>
				<span
					className={cn(
						"flex h-7 w-full min-w-0 items-center gap-2 rounded-sm px-2 py-1 text-snapp-text-primary",
						folder && "text-snapp-text-brand",
						(variant === "selected" ||
							variant === "notification") &&
							"bg-snapp-surface-secondary",
						unavailable &&
							"bg-snapp-surface-disabled text-snapp-text-disabled",
						variant === "add" && "text-snapp-text-blue",
						!unavailable &&
							"group-hover/tree-item:bg-snapp-surface-secondary",
						menu && onMenuSelect && "pr-9"
					)}
				>
					{dragHandle ??
						(draggable ? (
							<NavigationIcon
								name={
									unavailable
										? folder
											? "treeFolderDraggable1"
											: "treeItemDraggable1"
										: folder
											? "treeFolderDraggable"
											: "treeItemDraggable"
								}
							/>
						) : null)}
					{icon ?? (
						<NavigationIcon
							name={
								resolvedIconName ??
								(variant === "add"
									? folder
										? "treeFolderAdd"
										: "treeItemAdd"
									: defaultIcon)
							}
						/>
					)}
					{identifier != null && variant !== "notification" ? (
						<span className="shrink-0 whitespace-nowrap">
							{identifier}
						</span>
					) : null}
					<span className="flex min-w-0 flex-1 items-center gap-2">
						<span
							className={cn(
								"min-w-0 whitespace-nowrap",
								truncateLabel && "truncate"
							)}
						>
							{label}
						</span>
						{variant === "notification" ? (
							<>
								<span className="ml-auto flex min-w-4.5 shrink-0 items-center justify-center rounded-full bg-snapp-surface-red-soft px-1 py-0.5 font-snapp-ibm text-snapp-micro leading-snapp-normal font-normal text-snapp-text-red">
									{notification}
								</span>
								{date != null ? (
									<span className="shrink-0 whitespace-nowrap text-snapp-micro leading-3 text-snapp-text-secondary">
										{date}
									</span>
								) : null}
							</>
						) : null}
						{locked ? (
							<NavigationIcon
								name={
									lockIconName ??
									((prefix +
										(unavailable
											? "Lock1"
											: "Lock")) as NavigationIconName)
								}
							/>
						) : null}
					</span>
					{chevron ? (
						<NavigationIcon
							className={cn(
								"transition-transform",
								expanded && "rotate-180"
							)}
							name={
								(prefix +
									(unavailable
										? "Chevron1"
										: "Chevron")) as NavigationIconName
							}
						/>
					) : null}
					{time != null ? (
						<span
							className={cn(
								"shrink-0 whitespace-nowrap text-right text-snapp-text-secondary",
								unavailable && "text-snapp-text-disabled"
							)}
						>
							{time}
						</span>
					) : null}
					{menu && !onMenuSelect ? (
						<NavigationIcon
							name={
								menuIconName ??
								((prefix +
									(unavailable
										? "More1"
										: "More")) as NavigationIconName)
							}
						/>
					) : null}
				</span>
			</button>
			{menu && onMenuSelect ? (
				<button
					aria-label={
						menuLabel ??
						(typeof label === "string"
							? `More options for ${label}`
							: "More options")
					}
					className={cn(
						"absolute top-1.5 right-2 flex size-5 items-center justify-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-snapp-border-highlight",
						size === "compact" && "top-1"
					)}
					disabled={unavailable}
					onClick={onMenuSelect}
					type="button"
				>
					<NavigationIcon
						name={
							menuIconName ??
							((prefix +
								(unavailable
									? "More1"
									: "More")) as NavigationIconName)
						}
					/>
				</button>
			) : null}
		</div>
	);
}

function TreeFolder(props: Omit<TreeItemProps, "folder">) {
	return <TreeItem {...props} folder />;
}

function TreeGroup({ className, ...props }: React.ComponentProps<"ul">) {
	return (
		// biome-ignore lint/a11y/useSemanticElements: APG treeviews require role group on the nested ul; a fieldset is not a tree group.
		<ul
			role="group"
			data-slot="snapp-tree-group"
			className={cn(
				"relative m-0 ml-4 list-none py-0.5 pr-0 pl-2.5 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-snapp-border-primary",
				className
			)}
			{...props}
		/>
	);
}

function TreeSectionLabel({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"flex min-h-8 items-center px-2 py-1 font-sans text-xs leading-4 font-normal text-snapp-text-soft",
				className
			)}
			data-slot="snapp-tree-section-label"
			{...props}
		/>
	);
}

interface TreeNode {
	id: string;
	label: string;
	identifier?: React.ReactNode;
	icon?: React.ReactNode;
	iconName?: NavigationIconName;
	children?: TreeNode[];
	folder?: boolean;
	disabled?: boolean;
	locked?: boolean;
	variant?: TreeItemVariant;
	time?: React.ReactNode;
	notification?: React.ReactNode;
	date?: React.ReactNode;
	menu?: boolean;
	draggable?: boolean;
	sectionLabel?: string;
	showChevron?: boolean;
}

interface TreeProps extends Omit<React.ComponentProps<"ul">, "onSelect"> {
	nodes: TreeNode[];
	selectedId?: string;
	defaultSelectedId?: string;
	expandedIds?: string[];
	defaultExpandedIds?: string[];
	onSelect?: (node: TreeNode) => void;
	onExpandedChange?: (ids: string[]) => void;
	onNodeDragStart?: (
		node: TreeNode,
		event: React.DragEvent<HTMLButtonElement>
	) => void;
	onNodeMenuSelect?: (node: TreeNode) => void;
	recipe?: "hierarchy" | "menu" | "builder";
}

function Tree({
	nodes,
	selectedId,
	defaultSelectedId,
	expandedIds,
	defaultExpandedIds = [],
	onSelect,
	onExpandedChange,
	onNodeDragStart,
	onNodeMenuSelect,
	recipe = "hierarchy",
	className,
	children,
	onKeyDown,
	...props
}: TreeProps) {
	const [internalSelected, setSelected] = React.useState(defaultSelectedId);
	const [internalExpanded, setExpanded] = React.useState(defaultExpandedIds);
	const selected = selectedId ?? internalSelected;
	const expanded = expandedIds ?? internalExpanded;
	const [focusedId, setFocusedId] = React.useState<string | undefined>(
		defaultSelectedId
	);
	const visibleIds: string[] = [];
	const collectVisible = (items: TreeNode[]) => {
		for (const node of items) {
			if (
				!node.disabled &&
				node.variant !== "unselectable" &&
				node.variant !== "drop-indicator"
			)
				visibleIds.push(node.id);
			if (expanded.includes(node.id) && node.children)
				collectVisible(node.children);
		}
	};
	collectVisible(nodes);
	const tabbableId =
		focusedId && visibleIds.includes(focusedId)
			? focusedId
			: selected && visibleIds.includes(selected)
				? selected
				: visibleIds[0];
	const toggle = (id: string) => {
		const next = expanded.includes(id)
			? expanded.filter((value) => value !== id)
			: [...expanded, id];
		if (expandedIds === undefined) setExpanded(next);
		onExpandedChange?.(next);
	};
	const renderNodes = (items: TreeNode[], level: number): React.ReactNode =>
		items.map((node, index) => {
			const isBranch = node.folder || node.children !== undefined;
			const isFolder = node.folder ?? node.children !== undefined;
			const open = expanded.includes(node.id);
			return (
				<li className="m-0 list-none p-0" key={node.id} role="none">
					{node.sectionLabel ? (
						<TreeSectionLabel
							className={cn(
								recipe === "builder"
									? level === 1
										? builderRootLabel()
										: builderChildLabel()
									: level === 1
										? hierarchyRootLabel()
										: level === 2
											? hierarchySecondLabel()
											: hierarchyChildLabel()
							)}
						>
							{node.sectionLabel}
						</TreeSectionLabel>
					) : null}
					<TreeItem
						aria-selected={selected === node.id}
						aria-level={level}
						aria-posinset={index + 1}
						aria-setsize={items.length}
						chevron={
							node.showChevron ?? (isBranch && recipe !== "menu")
						}
						data-tree-label={node.label}
						date={node.date}
						disabled={node.disabled}
						draggable={node.draggable}
						expanded={isBranch ? open : undefined}
						folder={isFolder}
						icon={node.icon}
						iconName={
							node.iconName ??
							(isFolder
								? node.disabled ||
									node.variant === "unselectable"
									? "treeFolderFolder1"
									: "treeFolderFolder"
								: undefined)
						}
						identifier={node.identifier}
						label={node.label}
						locked={node.locked}
						menu={node.menu}
						notification={node.notification}
						onClick={() => {
							if (isBranch) toggle(node.id);
							if (selectedId === undefined) setSelected(node.id);
							onSelect?.(node);
						}}
						onDragStart={(event) => onNodeDragStart?.(node, event)}
						onFocus={() => setFocusedId(node.id)}
						onMenuSelect={
							onNodeMenuSelect
								? () => onNodeMenuSelect(node)
								: undefined
						}
						size={
							recipe === "menu" && !isFolder
								? "compact"
								: "default"
						}
						tabIndex={tabbableId === node.id ? 0 : -1}
						time={node.time}
						variant={
							node.disabled || node.variant === "unselectable"
								? "unselectable"
								: selected === node.id
									? node.variant === "notification"
										? "notification"
										: "selected"
									: node.variant
						}
					/>
					{isBranch && open && node.children?.length ? (
						<TreeGroup
							className={cn(
								recipe === "hierarchy"
									? level === 1
										? hierarchyRootGroup()
										: level === 2
											? hierarchySecondGroup()
											: nestedGroup()
									: recipe === "builder"
										? nestedGroup()
										: undefined,
								recipe === "builder" &&
									node.children[0]?.sectionLabel &&
									groupWithSectionLabel()
							)}
						>
							{renderNodes(node.children, level + 1)}
						</TreeGroup>
					) : null}
				</li>
			);
		});
	return (
		<ul
			aria-label="Tree"
			className={cn(
				"m-0 flex w-full min-w-0 list-none flex-col p-0 font-sans",
				recipe === "menu" && "gap-1",
				className
			)}
			data-slot="snapp-tree"
			onKeyDown={(event) => {
				onKeyDown?.(event);
				if (
					event.defaultPrevented ||
					!(event.target instanceof HTMLElement)
				)
					return;
				const current =
					event.target.closest<HTMLButtonElement>(
						'[role="treeitem"]'
					);
				if (!current) return;
				const visible = [
					...event.currentTarget.querySelectorAll<HTMLButtonElement>(
						'[role="treeitem"]:not(:disabled)'
					),
				];
				const position = visible.indexOf(current);
				let target: HTMLButtonElement | undefined;
				if (event.key === "ArrowDown")
					target =
						visible[Math.min(visible.length - 1, position + 1)];
				else if (event.key === "ArrowUp")
					target = visible[Math.max(0, position - 1)];
				else if (event.key === "Home") target = visible[0];
				else if (event.key === "End")
					target = visible[visible.length - 1];
				else if (
					event.key === "ArrowRight" &&
					current.hasAttribute("aria-expanded")
				) {
					if (current.getAttribute("aria-expanded") === "false")
						current.click();
					else if (
						Number(
							visible[position + 1]?.getAttribute("aria-level")
						) > Number(current.getAttribute("aria-level"))
					)
						target = visible[position + 1];
				} else if (event.key === "ArrowLeft") {
					if (current.getAttribute("aria-expanded") === "true")
						current.click();
					else
						target = visible
							.slice(0, position)
							.reverse()
							.find(
								(item) =>
									Number(item.getAttribute("aria-level")) <
									Number(current.getAttribute("aria-level"))
							);
				} else if (
					event.key.length === 1 &&
					!event.ctrlKey &&
					!event.metaKey &&
					!event.altKey &&
					event.key !== " "
				) {
					const ordered = [
						...visible.slice(position + 1),
						...visible.slice(0, position + 1),
					];
					target = ordered.find((item) =>
						item.dataset.treeLabel
							?.toLocaleLowerCase()
							.startsWith(event.key.toLocaleLowerCase())
					);
				} else return;
				event.preventDefault();
				if (target) {
					current.tabIndex = -1;
					target.tabIndex = 0;
					target.focus();
				}
			}}
			// biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: APG treeviews use ul role tree with roving focus on their treeitems.
			role="tree"
			{...props}
		>
			{children ?? renderNodes(nodes, 1)}
		</ul>
	);
}

function TreeBuilder(props: TreeProps) {
	return <Tree {...props} data-slot="snapp-tree-builder" recipe="builder" />;
}

interface TreeRowProps extends React.ComponentProps<"div"> {
	icon?: React.ReactNode;
	identifier?: React.ReactNode;
	label?: React.ReactNode;
	category?: React.ReactNode;
	progress?: number;
	progressLabel?: React.ReactNode;
	date?: React.ReactNode;
	status?: React.ReactNode;
	onStatusClick?: () => void;
	trailing?: React.ReactNode;
}

function TreeRow({
	className,
	children,
	icon,
	identifier,
	label,
	category,
	progress,
	progressLabel,
	date,
	status,
	onStatusClick,
	trailing,
	...props
}: TreeRowProps) {
	return (
		<div
			className={cn(
				"flex h-7 min-w-0 items-center gap-2 rounded-md px-2 font-sans text-sm leading-5 font-normal text-snapp-text-primary",
				className
			)}
			data-slot="snapp-tree-row"
			{...props}
		>
			{children ?? (
				<>
					{icon ?? <NavigationIcon name="rowBook" />}
					{identifier != null ? (
						<span className="shrink-0">{identifier}</span>
					) : null}
					<span className="min-w-0 flex-1 truncate">{label}</span>
					{category != null ? (
						<span className="w-43 shrink-0">{category}</span>
					) : null}
					{progress != null ? (
						<span className="flex w-41 shrink-0 items-center gap-2">
							<Progress
								aria-label="Progress"
								appearance="green"
								className="w-30 shrink-0"
								value={progress}
							/>
							<span className="text-snapp-text-secondary">
								{progressLabel}
							</span>
						</span>
					) : null}
					{date != null ? (
						<span className="w-22.5 shrink-0">{date}</span>
					) : null}
					{status != null ? (
						<button
							className="flex w-25 shrink-0 items-center gap-1 rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-snapp-border-highlight"
							onClick={onStatusClick}
							type="button"
						>
							<span className="underline decoration-from-font underline-offset-auto">
								{status}
							</span>
							<NavigationIcon name="rowChevron" />
						</button>
					) : null}
					{trailing ?? <NavigationIcon name="rowFlashlight" />}
				</>
			)}
		</div>
	);
}

function TreeRowTitle({
	className,
	children,
	label,
	icon,
	...props
}: Omit<React.ComponentProps<"div">, "title"> & {
	label?: React.ReactNode;
	icon?: React.ReactNode;
}) {
	return (
		<div
			className={cn(
				"relative flex h-8 min-w-0 items-center gap-2 p-2 font-sans text-sm leading-5 font-normal text-snapp-text-brand after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-snapp-border-primary",
				className
			)}
			data-slot="snapp-tree-row-title"
			{...props}
		>
			{children ?? (
				<>
					{icon ?? <NavigationIcon name="rowTitleFolderOpen" />}
					<span className="min-w-0 flex-1 truncate">{label}</span>
					<span
						aria-hidden="true"
						className="h-4.5 w-22.5 shrink-0"
					/>
					<span aria-hidden="true" className="h-4.5 w-5 shrink-0" />
				</>
			)}
		</div>
	);
}

export {
	Tree,
	TreeBuilder,
	TreeFolder,
	TreeGroup,
	TreeItem,
	TreeRow,
	TreeRowTitle,
	TreeSectionLabel,
};
export type {
	TreeItemProps,
	TreeItemVariant,
	TreeNode,
	TreeProps,
	TreeRowProps,
};
