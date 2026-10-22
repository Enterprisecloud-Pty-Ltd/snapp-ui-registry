"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
	NavigationIcon,
	type NavigationIconName,
} from "@/components/snapp/navigation/navigation-icons";

interface NavigationSearchProps
	extends Omit<React.ComponentProps<typeof Input>, "size"> {
	iconPosition?: "start" | "end";
	rounded?: boolean;
	inputClassName?: string;
	inputAppearance?: React.ComponentProps<typeof Input>["appearance"];
}

function NavigationSearch({
	id,
	className,
	inputClassName,
	inputAppearance = "navigation",
	iconPosition = "end",
	rounded = false,
	...props
}: NavigationSearchProps) {
	const generatedId = React.useId();
	const inputId = id ?? generatedId;
	return (
		<label
			htmlFor={inputId}
			className={cn(
				"flex h-10.25 w-full min-w-0 items-center gap-1 rounded-lg bg-snapp-surface-primary px-4 ring-1 ring-snapp-border-primary ring-inset focus-within:ring-2 focus-within:ring-snapp-border-highlight",
				rounded && "h-auto gap-3 rounded-full py-2",
				className
			)}
			data-slot="snapp-navigation-search"
		>
			{iconPosition === "start" ? (
				<NavigationIcon name="treeMenuSearch" />
			) : null}
			<Input
				id={inputId}
				aria-label="Search"
				appearance={inputAppearance}
				className={inputClassName}
				placeholder="Search"
				type="search"
				{...props}
			/>
			{iconPosition === "end" ? (
				<NavigationIcon name="treeMenuSearch" />
			) : null}
		</label>
	);
}

interface NavigationPanelProps
	extends Omit<React.ComponentProps<"aside">, "title"> {
	title: React.ReactNode;
	icon?: React.ReactNode;
	iconName?: NavigationIconName;
	searchProps?: NavigationSearchProps | false;
	filters?: React.ReactNode;
	onCollapse?: () => void;
}

function NavigationPanel({
	title,
	icon,
	iconName,
	searchProps,
	filters,
	onCollapse,
	children,
	className,
	...props
}: NavigationPanelProps) {
	return (
		<aside
			className={cn(
				"relative flex h-full min-h-0 w-134.25 max-w-full flex-col gap-3 overflow-hidden after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-snapp-border-primary bg-snapp-surface-primary font-sans text-sm leading-5 font-normal text-snapp-text-brand",
				className
			)}
			data-slot="snapp-navigation-panel"
			{...props}
		>
			<div className="relative flex h-12 shrink-0 items-center gap-3 px-4 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-snapp-border-primary">
				{icon ?? (iconName ? <NavigationIcon name={iconName} /> : null)}
				<span className="min-w-0 flex-1 truncate">{title}</span>
				{onCollapse ? (
					<button
						aria-label="Collapse panel"
						className="inline-flex h-full shrink-0 items-center justify-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-snapp-border-highlight"
						onClick={onCollapse}
						type="button"
					>
						<NavigationIcon name="headerPanel" />
					</button>
				) : null}
			</div>
			<div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto px-4">
				{searchProps === false ? null : (
					<NavigationSearch {...searchProps} />
				)}
				{filters}
				{children}
			</div>
		</aside>
	);
}

function TreeMenu({
	title,
	icon,
	iconName = "treeMenuClipboardTask",
	searchProps,
	onCollapse,
	children,
	className,
	filters,
	...props
}: NavigationPanelProps) {
	return (
		<aside
			className={cn(
				"relative flex h-full min-h-0 w-75 max-w-full flex-col gap-3 overflow-hidden after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-snapp-border-primary bg-snapp-surface-primary px-4 py-3 font-sans text-sm leading-5 font-normal text-snapp-text-brand",
				className
			)}
			data-slot="snapp-tree-menu"
			{...props}
		>
			<div className="relative flex shrink-0 flex-col gap-3 pb-3 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-snapp-border-primary">
				<div className="flex h-8 items-center gap-2">
					{icon ?? <NavigationIcon name={iconName} />}
					<span className="min-w-0 flex-1 truncate">{title}</span>
					{onCollapse ? (
						<button
							aria-label="Collapse tree menu"
							className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-snapp-border-highlight"
							onClick={onCollapse}
							type="button"
						>
							<NavigationIcon name="treeMenuPanel" />
						</button>
					) : null}
				</div>
			</div>
			{searchProps === false ? null : (
				<NavigationSearch
					iconPosition="start"
					{...searchProps}
					inputAppearance="navigation-tree"
				/>
			)}
			{filters}
			<div className="min-h-0 w-full flex-1 overflow-auto">
				{children}
			</div>
		</aside>
	);
}

interface NavigationLink {
	id: string;
	label: React.ReactNode;
	icon?: React.ReactNode;
	iconName?: NavigationIconName;
	active?: boolean;
	disabled?: boolean;
	expanded?: boolean;
	onSelect?: () => void;
}

interface NavigationGroup {
	id: string;
	label?: React.ReactNode;
	itemGap?: 4 | 8;
	items: NavigationLink[];
}

interface BrandedSidebarProps
	extends Omit<React.ComponentProps<"aside">, "title"> {
	title: React.ReactNode;
	groups: NavigationGroup[];
	onAppSelect?: () => void;
	onSignOut?: () => void;
	signOutLabel?: React.ReactNode;
	areas?: NavigationLink[];
	selectedArea?: {
		label: React.ReactNode;
		initials: React.ReactNode;
		onSelect?: () => void;
	};
	logo?: React.ReactNode;
}

function BrandedSidebar({
	title,
	groups,
	onAppSelect,
	onSignOut,
	signOutLabel = "Sign Out",
	areas = [],
	selectedArea,
	logo,
	children,
	className,
	...props
}: BrandedSidebarProps) {
	return (
		<aside
			className={cn(
				"flex h-full min-h-0 w-67 max-w-full flex-col gap-6 bg-snapp-surface-brand font-sans text-sm leading-5 font-normal text-snapp-text-invert",
				className
			)}
			data-slot="snapp-branded-sidebar"
			{...props}
		>
			<div className="relative flex shrink-0 flex-col gap-1 px-4 pt-6 pb-4 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-snapp-border-subtle">
				<div className="flex h-12 items-center px-2">
					{logo ?? <NavigationIcon name="leftMenuSnappLogo" />}
				</div>
				<button
					className="flex h-6 w-55 items-center gap-2 rounded-sm px-2 py-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-snapp-border-accent"
					onClick={onAppSelect}
					type="button"
				>
					<NavigationIcon name="leftMenuChevron" />
					{title}
				</button>
			</div>
			<nav
				aria-label="Main navigation"
				className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4"
			>
				{groups.map((group) => (
					<section className="flex flex-col gap-2" key={group.id}>
						{group.label != null ? (
							<div className="flex min-h-5 items-center px-2 py-0.5 text-xs leading-4">
								{group.label}
							</div>
						) : null}
						<ul
							className={cn(
								"m-0 flex list-none flex-col gap-1 p-0",
								group.itemGap === 8 && "gap-2"
							)}
						>
							{group.items.map((item) => (
								<li key={item.id}>
									<button
										aria-current={
											item.active ? "page" : undefined
										}
										className={cn(
											"flex min-h-7 w-full items-center gap-2 rounded-sm px-2 py-1 text-left outline-none hover:bg-snapp-border-subtle focus-visible:ring-2 focus-visible:ring-snapp-border-accent disabled:opacity-50",
											item.active &&
												"bg-snapp-border-subtle"
										)}
										disabled={item.disabled}
										onClick={item.onSelect}
										type="button"
									>
										{item.icon ??
											(item.iconName ? (
												<NavigationIcon
													name={item.iconName}
												/>
											) : null)}
										<span className="min-w-0 flex-1 truncate">
											{item.label}
										</span>
									</button>
								</li>
							))}
						</ul>
					</section>
				))}
				{children}
			</nav>
			<div className="shrink-0">
				{onSignOut ? (
					<div className="flex h-15.5 items-center p-4">
						<button
							className="flex h-12 w-full items-center gap-2 rounded-snapp-course-status p-3 text-left outline-none hover:bg-snapp-border-subtle focus-visible:ring-2 focus-visible:ring-snapp-border-accent"
							onClick={onSignOut}
							type="button"
						>
							<NavigationIcon name="leftMenuSignOut" />
							{signOutLabel}
						</button>
					</div>
				) : null}
				{areas.length ? (
					<div className="relative flex flex-col gap-1 p-4 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-snapp-border-subtle">
						{areas.map((area) => (
							<button
								className="flex h-7.5 items-center rounded-sm p-3 text-left text-xs leading-4 outline-none hover:bg-snapp-border-subtle focus-visible:ring-2 focus-visible:ring-snapp-border-accent"
								key={area.id}
								onClick={area.onSelect}
								type="button"
							>
								{area.label}
							</button>
						))}
					</div>
				) : null}
				{selectedArea ? (
					<button
						className="relative flex h-20.25 w-full items-center gap-3 px-6 text-left before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-snapp-border-subtle outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-snapp-border-accent"
						onClick={selectedArea.onSelect}
						type="button"
					>
						<span className="inline-flex size-8 shrink-0 items-center justify-center rounded-sm bg-snapp-surface-accent">
							{selectedArea.initials}
						</span>
						<span className="min-w-0 flex-1 truncate">
							{selectedArea.label}
						</span>
						<NavigationIcon name="leftMenuChevronUpDown" />
					</button>
				) : null}
			</div>
		</aside>
	);
}

interface DynamicsMenuProps extends React.ComponentProps<"nav"> {
	groups: NavigationGroup[];
	primaryItems?: NavigationLink[];
	onCollapse?: () => void;
}

function DynamicsMenu({
	groups,
	primaryItems = [],
	onCollapse,
	className,
	...props
}: DynamicsMenuProps) {
	const links = (items: NavigationLink[]) => (
		<ul className="m-0 list-none p-0">
			{items.map((item) => (
				<li key={item.id}>
					<button
						aria-current={item.active ? "page" : undefined}
						aria-expanded={item.expanded}
						className="flex min-h-10 w-full items-center gap-0.5 py-0 pr-3 pl-1.5 text-left font-sans text-sm leading-5 font-normal text-snapp-text-primary outline-none hover:bg-snapp-surface-secondary focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-snapp-border-highlight disabled:opacity-50"
						disabled={item.disabled}
						onClick={item.onSelect}
						type="button"
					>
						<span className="flex w-1 shrink-0 items-center self-stretch py-2.5">
							<span
								className={cn(
									"h-5 w-1 rounded-lg",
									item.active && "bg-snapp-surface-accent"
								)}
							/>
						</span>
						<span className="flex min-w-0 flex-1 items-center gap-2">
							{item.icon ??
								(item.iconName ? (
									<NavigationIcon name={item.iconName} />
								) : null)}
							<span className="min-w-0 flex-1">{item.label}</span>
						</span>
						{item.expanded !== undefined ? (
							<NavigationIcon
								className={cn(
									"transition-transform",
									item.expanded && "rotate-180"
								)}
								name="dynamicsMenuChevron"
							/>
						) : null}
					</button>
				</li>
			))}
		</ul>
	);
	return (
		<nav
			aria-label="Dynamics navigation"
			className={cn(
				"relative flex h-full min-h-0 w-50.25 shrink-0 flex-col gap-6 overflow-y-auto bg-snapp-surface-primary pt-3.5 pr-0.5 ring-1 ring-snapp-border-primary ring-inset after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-snapp-border-primary font-sans text-sm leading-5 text-snapp-text-primary",
				className
			)}
			data-slot="snapp-dynamics-menu"
			{...props}
		>
			<div className="flex flex-col gap-2">
				<button
					aria-label="Collapse navigation"
					className="flex h-2.25 w-full items-center pr-3.5 pl-4 outline-none focus-visible:ring-2 focus-visible:ring-snapp-border-highlight"
					onClick={onCollapse}
					type="button"
				>
					<span
						aria-hidden="true"
						className="relative h-2.25 w-4 border-y border-snapp-border-brand before:absolute before:inset-x-0 before:top-0.75 before:border-t before:border-snapp-border-brand"
					/>
				</button>
				{links(primaryItems)}
			</div>
			{groups.map((group) => (
				<section className="flex flex-col gap-2" key={group.id}>
					{group.label ? (
						<h2 className="m-0 px-3.5 font-sans text-sm leading-snapp-normal font-bold">
							{group.label}
						</h2>
					) : null}
					{links(group.items)}
				</section>
			))}
		</nav>
	);
}

function SideMenu({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"flex h-full min-h-0 min-w-0 items-stretch bg-snapp-surface-primary ring-1 ring-snapp-border-primary ring-inset *:data-[slot=snapp-navigation-panel]:w-71 *:data-[slot=snapp-navigation-panel]:shrink-0 [&>[data-slot=snapp-navigation-panel]+[data-slot=snapp-navigation-panel]]:ml-px",
				className
			)}
			data-slot="snapp-side-menu"
			{...props}
		/>
	);
}

export {
	BrandedSidebar,
	DynamicsMenu,
	NavigationPanel,
	NavigationSearch,
	SideMenu,
	TreeMenu,
};
export type {
	BrandedSidebarProps,
	DynamicsMenuProps,
	NavigationGroup,
	NavigationLink,
	NavigationPanelProps,
	NavigationSearchProps,
};
