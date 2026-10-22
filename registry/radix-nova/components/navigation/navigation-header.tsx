"use client";

import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { wrapHugText } from "@/components/ui/hug-text";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	NavigationIcon,
	type NavigationIconName,
} from "@/components/snapp/navigation/navigation-icons";
import { NavigationSearch } from "@/components/snapp/navigation/navigation-panels";

interface AchievementSummaryProps extends React.ComponentProps<"div"> {
	week: React.ReactNode;
	month: React.ReactNode;
	label?: React.ReactNode;
	weekLabel?: React.ReactNode;
	monthLabel?: React.ReactNode;
}

function AchievementSummary({
	week,
	month,
	label = "Finished:",
	weekLabel = "This Week",
	monthLabel = "This Month",
	className,
	...props
}: AchievementSummaryProps) {
	return (
		<div
			className={cn(
				"relative flex h-12 w-84.5 shrink-0 items-center gap-4 bg-snapp-surface-primary pl-4 font-sans text-sm leading-5 font-normal whitespace-nowrap text-snapp-text-brand before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-snapp-border-primary",
				className
			)}
			data-slot="snapp-achievement-summary"
			{...props}
		>
			<NavigationIcon name="headerTrophy1" />
			<span className="flex items-center gap-1">
				<span>{label}</span>
				<span>{weekLabel}</span>
				<strong className="font-bold">{week}</strong>
			</span>
			<span className="flex items-center gap-1">
				<span>{monthLabel}</span>
				<strong className="font-bold">{month}</strong>
			</span>
		</div>
	);
}

interface FeatureHeaderProps
	extends Omit<React.ComponentProps<"header">, "title"> {
	title: React.ReactNode;
	icon?: React.ReactNode;
	achievements?: AchievementSummaryProps;
	onFilter?: () => void;
	onCollapse?: () => void;
	filterLabel?: React.ReactNode;
}

function FeatureHeader({
	title,
	icon,
	achievements,
	onFilter,
	onCollapse,
	filterLabel = "Filter",
	className,
	...props
}: FeatureHeaderProps) {
	return (
		<header
			className={cn(
				"relative flex h-12 min-w-0 items-center bg-snapp-surface-primary pl-4 font-sans text-sm leading-5 font-normal text-snapp-text-brand after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-snapp-border-primary",
				!achievements && "pr-4",
				className
			)}
			data-slot="snapp-feature-header"
			{...props}
		>
			<div className="flex h-full min-w-0 flex-1 items-center gap-4">
				<span className="flex h-full min-w-0 flex-1 items-center gap-3">
					{icon}
					<span className="min-w-0 truncate">{title}</span>
				</span>
				{onFilter ? (
					<button
						className="flex items-center gap-2 rounded-sm px-3 py-2 text-snapp-text-primary ring-1 ring-snapp-border-primary ring-inset outline-none focus-visible:ring-2 focus-visible:ring-snapp-border-highlight"
						onClick={onFilter}
						type="button"
					>
						<NavigationIcon name="headerFilter" />
						{filterLabel}
					</button>
				) : null}
				{onCollapse ? (
					<button
						aria-label="Collapse panel"
						className="flex h-full items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-snapp-border-highlight"
						onClick={onCollapse}
						type="button"
					>
						<NavigationIcon name="headerPanel" />
					</button>
				) : null}
			</div>
			{achievements ? <AchievementSummary {...achievements} /> : null}
		</header>
	);
}

interface HeaderTab {
	value: string;
	label: React.ReactNode;
	icon?: React.ReactNode;
	disabled?: boolean;
	dividerAfter?: boolean;
	mutedWhenInactive?: boolean;
}

interface TabbedHeaderNavigationProps
	extends Omit<React.ComponentProps<"header">, "onChange"> {
	tabs: HeaderTab[];
	value: string;
	onValueChange: (value: string) => void;
	achievements?: AchievementSummaryProps;
}

function TabbedHeaderNavigation({
	tabs,
	value,
	onValueChange,
	achievements,
	className,
	...props
}: TabbedHeaderNavigationProps) {
	return (
		<header
			className={cn(
				"relative flex h-12 min-w-0 items-start bg-snapp-surface-primary pl-4 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-snapp-border-primary",
				className
			)}
			data-slot="snapp-tabbed-header-navigation"
			{...props}
		>
			<Tabs
				className="relative z-1 h-full min-w-0 flex-1 overflow-x-auto"
				onValueChange={onValueChange}
				value={value}
			>
				<TabsList
					aria-label="Sections"
					appearance="header"
					className="h-full justify-start"
					variant="line"
				>
					{tabs.map((tab) => (
						<React.Fragment key={tab.value}>
							<TabsTrigger
								appearance={
									tab.mutedWhenInactive === false
										? "header-emphasis"
										: "header"
								}
								disabled={tab.disabled}
								value={tab.value}
							>
								{tab.icon}
								{tab.label}
							</TabsTrigger>
							{tab.dividerAfter ? (
								<span
									aria-hidden="true"
									className="h-6 w-px shrink-0 bg-snapp-border-primary"
								/>
							) : null}
						</React.Fragment>
					))}
				</TabsList>
			</Tabs>
			{achievements ? <AchievementSummary {...achievements} /> : null}
		</header>
	);
}

interface ExpandedTabProps extends React.ComponentProps<"div"> {
	label: React.ReactNode;
	nextLabel: React.ReactNode;
	onSelect?: () => void;
	onNextSelect?: () => void;
}

function ExpandedTab({
	label,
	nextLabel,
	onSelect,
	onNextSelect,
	className,
	...props
}: ExpandedTabProps) {
	return (
		// biome-ignore lint/a11y/useSemanticElements: This reusable visual/control group is not a form fieldset; retain its ARIA group semantics and public div contract.
		<div
			className={cn(
				"inline-flex h-9 w-fit items-center overflow-hidden rounded-full bg-snapp-surface-secondary font-sans text-sm leading-5 font-normal text-snapp-text-brand",
				className
			)}
			data-slot="snapp-expanded-tab"
			role="group"
			{...props}
		>
			<button
				className="relative z-10 h-full rounded-full bg-snapp-surface-brand px-4 py-2 text-snapp-text-invert shadow-snapp-navigation-panel outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-snapp-border-highlight"
				onClick={onSelect}
				type="button"
			>
				{wrapHugText(label)}
			</button>
			<button
				className="flex h-full items-center gap-2 rounded-full py-2 pr-4 pl-2 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-snapp-border-highlight"
				onClick={onNextSelect}
				type="button"
			>
				<NavigationIcon name="tabItemChevron" />
				{wrapHugText(nextLabel)}
			</button>
		</div>
	);
}

interface HeaderFeatureGroup {
	id: string;
	label?: React.ReactNode;
	prominent?: boolean;
	items: { id: string; label: React.ReactNode; onSelect?: () => void }[];
}

interface HeaderNavigationItem {
	id: string;
	label: React.ReactNode;
	active?: boolean;
	onSelect?: () => void;
	groups?: HeaderFeatureGroup[];
}

interface NavigationApp {
	id: string;
	label: React.ReactNode;
	icon?: React.ReactNode;
	iconName?: NavigationIconName;
	badge?: React.ReactNode;
	selected?: boolean;
	onSelect?: () => void;
}

function NavigationAppGrid({
	apps,
	search = true,
}: {
	apps: NavigationApp[];
	search?: boolean;
}) {
	const [query, setQuery] = React.useState("");
	const filtered = apps.filter(
		(app) =>
			!query ||
			(typeof app.label === "string" &&
				app.label
					.toLocaleLowerCase()
					.includes(query.toLocaleLowerCase()))
	);
	return (
		<div className="flex flex-col gap-4" data-slot="snapp-app-grid">
			{search ? (
				<NavigationSearch
					className="w-108 max-w-full"
					onChange={(event) => setQuery(event.target.value)}
					placeholder="Find Apps"
					value={query}
				/>
			) : null}
			<div
				className={cn(
					"flex flex-wrap items-center gap-2",
					search && "w-108 max-w-full"
				)}
			>
				{filtered.map((app) => (
					<button
						className={cn(
							"relative flex size-20 flex-col items-center justify-center gap-2 rounded-sm font-sans text-xs leading-4 font-normal text-snapp-text-brand outline-none hover:bg-snapp-surface-secondary focus-visible:ring-2 focus-visible:ring-snapp-border-highlight",
							app.selected && "bg-snapp-surface-secondary"
						)}
						key={app.id}
						onClick={app.onSelect}
						type="button"
					>
						{app.icon ??
							(app.iconName ? (
								<NavigationIcon name={app.iconName} />
							) : null)}
						<span className="max-w-full truncate">{app.label}</span>
						{app.badge ? (
							<span className="absolute bottom-2 left-2">
								{app.badge}
							</span>
						) : null}
					</button>
				))}
			</div>
		</div>
	);
}

type NavigationHeaderMenu = "apps" | "area" | "user" | "chat" | string;
interface NavigationHeaderProps
	extends Omit<React.ComponentProps<"header">, "onChange"> {
	variant?: "updated" | "square";
	items: HeaderNavigationItem[];
	onHome?: () => void;
	apps?: NavigationApp[];
	areas?: NavigationApp[];
	userControls?: React.ReactNode;
	chat?: React.ReactNode;
	searchProps?: React.ComponentProps<typeof NavigationSearch> | false;
	openMenu?: NavigationHeaderMenu | null;
	defaultOpenMenu?: NavigationHeaderMenu | null;
	onOpenMenuChange?: (menu: NavigationHeaderMenu | null) => void;
}

const headerNavigationItem = cva(
	"shrink-0 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-snapp-border-highlight"
);
const squareNavigationItem = cva("rounded-full px-4 py-2");
const activeNavigationItem = cva("font-bold");

function NavigationHeader({
	variant = "square",
	items,
	onHome,
	apps = [],
	areas = [],
	userControls,
	chat,
	searchProps,
	openMenu,
	defaultOpenMenu = null,
	onOpenMenuChange,
	className,
	...props
}: NavigationHeaderProps) {
	const [internalOpen, setOpen] = React.useState(defaultOpenMenu);
	const headerRef = React.useRef<HTMLElement | null>(null);
	const actionOpenedWithKeyboard = React.useRef(false);
	const active = openMenu === undefined ? internalOpen : openMenu;
	const updated = variant === "updated";
	const change = React.useCallback(
		(value: NavigationHeaderMenu | null) => {
			if (openMenu === undefined) setOpen(value);
			onOpenMenuChange?.(value);
		},
		[openMenu, onOpenMenuChange]
	);
	React.useEffect(() => {
		if (
			!updated ||
			!active ||
			!items.some((item) => item.id === active && item.groups?.length)
		)
			return;
		const ownerDocument = headerRef.current?.ownerDocument;
		if (!ownerDocument) return;
		const dismiss = (event: PointerEvent) => {
			if (
				!event.composedPath().includes(headerRef.current as HTMLElement)
			)
				change(null);
		};
		const handleEscapeKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.preventDefault();
				change(null);
				[
					...(headerRef.current?.querySelectorAll<HTMLButtonElement>(
						"[data-header-menu]"
					) ?? []),
				]
					.find((button) => button.dataset.headerMenu === active)
					?.focus();
			}
		};
		ownerDocument.addEventListener("pointerdown", dismiss);
		ownerDocument.addEventListener("keydown", handleEscapeKey);
		return () => {
			ownerDocument.removeEventListener("pointerdown", dismiss);
			ownerDocument.removeEventListener("keydown", handleEscapeKey);
		};
	}, [active, change, items, updated]);
	const renderNavigationItem = (item: HeaderNavigationItem) => {
		const itemClass = cn(
			headerNavigationItem(),
			!updated && squareNavigationItem(),
			!updated &&
				(item.active || active === item.id) &&
				activeNavigationItem()
		);
		if (!item.groups?.length)
			return (
				<button
					className={itemClass}
					key={item.id}
					onClick={item.onSelect}
					type="button"
				>
					{item.label}
				</button>
			);
		if (updated)
			return (
				<button
					aria-expanded={active === item.id}
					className={itemClass}
					data-header-menu={item.id}
					key={item.id}
					onClick={() => change(active === item.id ? null : item.id)}
					type="button"
				>
					{item.label}
				</button>
			);
		return (
			<Popover
				key={item.id}
				onOpenChange={(open) => change(open ? item.id : null)}
				open={active === item.id}
			>
				<PopoverTrigger asChild>
					<button className={itemClass} type="button">
						{item.label}
					</button>
				</PopoverTrigger>
				<PopoverContent
					align="start"
					alignOffset={-8}
					appearance="header-navigation"
					sideOffset={16}
				>
					<div className="flex gap-16">
						{item.groups.map((group) => (
							<div className="flex flex-col gap-6" key={group.id}>
								{group.label ? (
									<span>{group.label}</span>
								) : null}
								<div className="flex flex-col gap-3 text-base leading-5">
									{group.items.map((link) => (
										<button
											className="text-left outline-none hover:underline focus-visible:ring-2 focus-visible:ring-snapp-border-highlight"
											key={link.id}
											onClick={() => {
												link.onSelect?.();
												change(null);
											}}
											type="button"
										>
											{link.label}
										</button>
									))}
								</div>
							</div>
						))}
					</div>
				</PopoverContent>
			</Popover>
		);
	};
	const action = (
		id: string,
		label: string,
		iconName: NavigationIconName,
		content: React.ReactNode,
		appearance: React.ComponentProps<
			typeof PopoverContent
		>["appearance"] = "header-action"
	) => (
		<Popover
			key={id}
			onOpenChange={(open) => change(open ? id : null)}
			open={active === id}
		>
			<PopoverTrigger asChild>
				<button
					aria-label={label}
					className={cn(
						"inline-flex shrink-0 items-center justify-center rounded-full outline-none hover:bg-snapp-grey-100 focus-visible:ring-2 focus-visible:ring-snapp-border-highlight",
						updated ? "size-8 rounded-sm" : "size-9",
						active === id && "bg-snapp-grey-100"
					)}
					onKeyDown={(event) => {
						if (event.key === "Enter" || event.key === " ")
							actionOpenedWithKeyboard.current = true;
					}}
					onPointerDown={() => {
						actionOpenedWithKeyboard.current = false;
					}}
					type="button"
				>
					<NavigationIcon name={iconName} />
				</button>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				appearance={appearance}
				onOpenAutoFocus={(event) => {
					event.preventDefault();
					if (
						actionOpenedWithKeyboard.current &&
						event.target instanceof HTMLElement
					) {
						const first = [
							...event.target.querySelectorAll<HTMLElement>(
								'input:not(:disabled):not([type="hidden"]),button:not(:disabled),a[href],select:not(:disabled),textarea:not(:disabled),[tabindex]'
							),
						].find(
							(node) =>
								node.tabIndex >= 0 &&
								node.getAttribute("aria-disabled") !== "true" &&
								node.getClientRects().length > 0 &&
								getComputedStyle(node).visibility !== "hidden"
						);
						// Focusing the owned node also works inside a ShadowRoot.
						first?.focus({ preventScroll: true });
					}
					actionOpenedWithKeyboard.current = false;
				}}
				sideOffset={updated ? 20 : 16}
			>
				{content}
			</PopoverContent>
		</Popover>
	);
	return (
		<header
			className={cn(
				"relative z-10 w-full min-w-0 bg-snapp-surface-primary font-sans text-sm leading-5 font-normal text-snapp-text-brand",
				updated
					? "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-snapp-border-primary"
					: "shadow-snapp-achievement",
				className
			)}
			data-slot="snapp-navigation-header"
			data-variant={variant}
			ref={headerRef}
			{...props}
		>
			<nav
				aria-label="Primary navigation"
				className={cn(
					"flex min-w-0 items-center px-6",
					updated ? "h-14 gap-6" : "h-13 gap-1 py-2"
				)}
			>
				<button
					aria-label="Home"
					className={cn(
						"inline-flex shrink-0 items-center justify-center rounded-full outline-none hover:bg-snapp-surface-secondary focus-visible:ring-2 focus-visible:ring-snapp-border-highlight",
						updated ? "size-8 rounded-sm" : "size-9"
					)}
					onClick={onHome}
					type="button"
				>
					<NavigationIcon
						name={
							updated ? "updatedHeaderHome" : "squareTopMenuHome"
						}
					/>
				</button>
				<div
					className={cn(
						"flex min-w-0 items-center",
						updated ? "flex-1 gap-10" : "gap-1"
					)}
				>
					{items.map(renderNavigationItem)}
				</div>
				{updated && searchProps !== false ? (
					<NavigationSearch
						placeholder="Global Search Element"
						{...searchProps}
						className={cn("w-100 shrink-0", searchProps?.className)}
						inputAppearance="navigation-global"
						rounded
					/>
				) : null}
				<div
					className={cn(
						"flex items-center justify-end",
						updated ? "gap-6" : "min-w-max flex-1 gap-3"
					)}
				>
					{!updated && chat
						? action(
								"chat",
								"Open live support",
								"squareTopMenuChat",
								chat,
								"header-chat"
							)
						: null}
					{!updated && areas.length
						? action(
								"area",
								"Switch area",
								"squareTopMenuArrowAutofit",
								<NavigationAppGrid
									apps={areas}
									search={false}
								/>
							)
						: null}
					{apps.length
						? action(
								"apps",
								"Choose application",
								"updatedHeaderGridDots",
								<NavigationAppGrid apps={apps} />
							)
						: null}
					{!updated && userControls
						? action(
								"user",
								"User controls",
								"squareTopMenuPerson",
								<div className="flex w-25 flex-col items-end gap-2 font-sans text-xs leading-4">
									{userControls}
								</div>,
								"header-user"
							)
						: null}
				</div>
			</nav>
			{updated && items.find((item) => item.id === active)?.groups ? (
				<div
					className="flex gap-12 pt-6 pr-6 pb-12 pl-20 shadow-snapp-tool-menu"
					data-slot="snapp-header-feature-menu"
				>
					{items
						.find((item) => item.id === active)
						?.groups?.map((group, index) => (
							<div
								className={cn(
									"flex flex-col gap-6",
									index === 0 && "mr-4"
								)}
								key={group.id}
							>
								<span>{group.label}</span>
								<div
									className={cn(
										"flex flex-col gap-2 font-bold",
										group.prominent && "text-xl leading-6"
									)}
								>
									{group.items.map((link) => (
										<button
											className="text-left outline-none hover:underline focus-visible:ring-2 focus-visible:ring-snapp-border-highlight"
											key={link.id}
											onClick={() => {
												link.onSelect?.();
												change(null);
											}}
											type="button"
										>
											{link.label}
										</button>
									))}
								</div>
							</div>
						))}
				</div>
			) : null}
		</header>
	);
}

interface ProfileControlsProps extends React.ComponentProps<"header"> {
	onAction?: (
		action:
			| "apps"
			| "search"
			| "recent"
			| "add"
			| "filter"
			| "settings"
			| "help"
			| "profile"
	) => void;
}

interface LiveSupportPanelProps
	extends Omit<React.ComponentProps<"section">, "title" | "onSubmit"> {
	title?: React.ReactNode;
	onSendMessage: (message: string) => void;
	onClose?: () => void;
	onExpand?: () => void;
	placeholder?: string;
	disabled?: boolean;
}

function LiveSupportPanel({
	title = "Live Support",
	onSendMessage,
	onClose,
	onExpand,
	placeholder = "Type your message...",
	disabled,
	children,
	className,
	...props
}: LiveSupportPanelProps) {
	const [draft, setDraft] = React.useState("");
	return (
		<section
			aria-label={typeof title === "string" ? title : "Live support"}
			className={cn(
				"flex h-125 w-92.5 max-w-full flex-col overflow-hidden rounded-lg bg-snapp-surface-primary font-sans text-sm leading-5 text-snapp-text-primary",
				className
			)}
			data-slot="snapp-live-support"
			{...props}
		>
			<header className="flex h-14 shrink-0 items-center justify-between bg-snapp-surface-brand p-4 text-base leading-5 text-snapp-text-invert">
				<span className="flex items-center gap-2">
					<span
						aria-hidden="true"
						className="size-3 rounded-full bg-snapp-surface-accent"
					/>
					{title}
				</span>
				<div className="flex items-center gap-2">
					<button
						aria-label="Expand support"
						className="flex size-6 items-center justify-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-snapp-border-invert"
						onClick={onExpand}
						type="button"
					>
						<span
							aria-hidden="true"
							className="relative size-4 overflow-hidden"
						>
							<NavigationIcon
								className="absolute"
								name="squareTopMenuVector"
								style={{ left: 2, top: 26 / 3 }}
							/>
							<NavigationIcon
								className="absolute"
								name="squareTopMenuVector1"
								style={{ left: 26 / 3, top: 2 }}
							/>
							<NavigationIcon
								className="absolute"
								name="squareTopMenuVector2"
								style={{ left: 26 / 3, top: 4 / 3 }}
							/>
							<NavigationIcon
								className="absolute"
								name="squareTopMenuVector2"
								style={{ left: 4 / 3, top: 26 / 3 }}
							/>
						</span>
					</button>
					<button
						aria-label="Close support"
						className="flex size-6 items-center justify-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-snapp-border-invert"
						onClick={onClose}
						type="button"
					>
						<span
							aria-hidden="true"
							className="relative size-4 overflow-hidden"
						>
							<NavigationIcon
								className="absolute"
								name="squareTopMenuVector3"
								style={{ left: 10 / 3, top: 10 / 3 }}
							/>
							<NavigationIcon
								className="absolute"
								name="squareTopMenuVector4"
								style={{ left: 10 / 3, top: 10 / 3 }}
							/>
						</span>
					</button>
				</div>
			</header>
			<div
				aria-live="polite"
				className="min-h-0 flex-1 overflow-y-auto p-4"
				role="log"
			>
				{children}
			</div>
			<form
				className="relative flex shrink-0 items-start gap-2 p-4 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-snapp-border-primary"
				onSubmit={(event) => {
					event.preventDefault();
					if (!disabled && draft.trim()) {
						onSendMessage(draft.trim());
						setDraft("");
					}
				}}
			>
				<input
					aria-label="Message"
					className="h-10.25 min-w-0 flex-1 rounded-lg bg-snapp-surface-primary px-4 text-sm leading-5 text-snapp-text-primary ring-1 ring-snapp-border-primary ring-inset outline-none placeholder:text-snapp-text-secondary focus-visible:ring-2 focus-visible:ring-snapp-border-highlight"
					disabled={disabled}
					onChange={(event) => setDraft(event.target.value)}
					placeholder={placeholder}
					value={draft}
				/>
				<button
					aria-label="Send message"
					className="flex size-10.25 shrink-0 items-center justify-center rounded-lg bg-snapp-surface-brand outline-none focus-visible:ring-2 focus-visible:ring-snapp-border-highlight disabled:opacity-50"
					disabled={disabled}
					type="submit"
				>
					<NavigationIcon name="squareTopMenuIcon" />
				</button>
			</form>
		</section>
	);
}

function SupportMessage({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"w-fit rounded-lg bg-snapp-surface-primary px-4 py-3 font-snapp-ibm text-base leading-5 font-normal text-snapp-text-primary ring-1 ring-snapp-border-primary ring-inset",
				className
			)}
			data-slot="snapp-support-message"
			{...props}
		/>
	);
}

function ProfileControls({
	onAction,
	className,
	...props
}: ProfileControlsProps) {
	return (
		<header
			className={cn(
				"flex h-12.5 w-full items-center justify-between bg-snapp-surface-brand font-sans text-snapp-text-invert",
				className
			)}
			data-slot="snapp-profile-controls"
			{...props}
		>
			<div className="flex h-full items-center gap-5">
				<button
					aria-label="Applications"
					className="flex size-12.5 items-center justify-center bg-snapp-surface-accent outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-snapp-border-invert"
					onClick={() => onAction?.("apps")}
					type="button"
				>
					<span
						aria-hidden="true"
						className="grid size-4 grid-cols-3 gap-0.5"
					>
						{[
							"profile-dot-r1-c1",
							"profile-dot-r1-c2",
							"profile-dot-r1-c3",
							"profile-dot-r2-c1",
							"profile-dot-r2-c2",
							"profile-dot-r2-c3",
							"profile-dot-r3-c1",
							"profile-dot-r3-c2",
							"profile-dot-r3-c3",
						].map((position) => (
							<span
								className="bg-snapp-icon-invert"
								key={position}
							/>
						))}
					</span>
				</button>
				<NavigationIcon name="profileControlsSnappLogo" />
				<span
					aria-hidden="true"
					className="h-full w-px bg-snapp-border-invert"
				/>
			</div>
			<div className="flex h-full items-center gap-8 px-3">
				<div className="flex items-center gap-8">
					{(["search", "recent", "add", "filter"] as const).map(
						(action, index) => (
							<button
								aria-label={
									action === "recent"
										? "Recent activity"
										: action.charAt(0).toUpperCase() +
											action.slice(1)
								}
								className="relative inline-flex items-center justify-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-snapp-border-invert"
								key={action}
								style={{
									width: index === 3 ? 18 : 15,
									height: index === 3 ? 18 : 15,
								}}
								onClick={() => onAction?.(action)}
								type="button"
							>
								<NavigationIcon
									name={
										[
											"profileControlsIconSearch",
											"profileControlsIconActivity",
											"profileControlsIconAdd",
											"profileControlsIconFilter",
										][index] as NavigationIconName
									}
									style={
										index < 2
											? {
													position: "absolute",
													left:
														index === 0
															? -0.531
															: -0.75,
													top: -0.75,
												}
											: undefined
									}
								/>
							</button>
						)
					)}
				</div>
				<span
					aria-hidden="true"
					className="h-full w-px bg-snapp-border-invert"
				/>
				<button
					aria-label="Settings"
					className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-snapp-border-invert"
					onClick={() => onAction?.("settings")}
					type="button"
				>
					<NavigationIcon name="profileControlsIconSettings" />
				</button>
				<button
					aria-label="Help"
					className="font-snapp-arial text-xl leading-snapp-normal tracking-snapp-tight outline-none focus-visible:ring-2 focus-visible:ring-snapp-border-invert"
					onClick={() => onAction?.("help")}
					type="button"
				>
					?
				</button>
				<button
					aria-label="Profile"
					className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-snapp-border-invert"
					onClick={() => onAction?.("profile")}
					type="button"
				>
					<NavigationIcon name="profileControlsIconProfile" />
				</button>
			</div>
		</header>
	);
}

export {
	AchievementSummary,
	ExpandedTab,
	FeatureHeader,
	LiveSupportPanel,
	NavigationAppGrid,
	NavigationHeader,
	ProfileControls,
	SupportMessage,
	TabbedHeaderNavigation,
};
export type {
	AchievementSummaryProps,
	ExpandedTabProps,
	FeatureHeaderProps,
	HeaderFeatureGroup,
	HeaderNavigationItem,
	HeaderTab,
	LiveSupportPanelProps,
	NavigationApp,
	NavigationHeaderMenu,
	NavigationHeaderProps,
	ProfileControlsProps,
	TabbedHeaderNavigationProps,
};
