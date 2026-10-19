import * as React from "react";
import { cn } from "@/lib/utils";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { PortalContainerContext } from "@/runtime/PortalContainer";
import { NavigationIcon } from "@/components/snapp/navigation/navigation-icons";
import {
	Tree,
	TreeBuilder,
	TreeFolder,
	TreeItem,
	TreeRow,
	TreeRowTitle,
	TreeSectionLabel,
	type TreeItemVariant,
	type TreeNode,
} from "@/components/snapp/navigation/tree";
import {
	BrandedSidebar,
	DynamicsMenu,
	NavigationPanel,
	SideMenu,
	TreeMenu,
} from "@/components/snapp/navigation/navigation-panels";
import {
	ExpandedTab,
	FeatureHeader,
	LiveSupportPanel,
	NavigationHeader,
	ProfileControls,
	SupportMessage,
	TabbedHeaderNavigation,
	type HeaderNavigationItem,
	type NavigationApp,
} from "@/components/snapp/navigation/navigation-header";
import {
	EditorToolbar,
	type EditorAlignment,
	type EditorFormat,
} from "@/components/snapp/navigation/editor-toolbar";
import { ToolMenu } from "@/components/snapp/navigation/tool-menu";

function Fixture({
	id,
	variant = "Default",
	width,
	height,
	children,
}: {
	id: string;
	variant?: string;
	width: number;
	height?: number;
	children: React.ReactNode;
}) {
	const [portal, setPortal] = React.useState<HTMLDivElement | null>(null);
	return (
		<div
			className="relative my-2 bg-[#ccc]"
			data-figma-node={id}
			data-variant={variant}
			style={{ width, height, minHeight: height, transform: "translateZ(0)" }}
		>
			<PortalContainerContext.Provider value={portal}>
				{children}
				<div
					className="pointer-events-none absolute inset-0 z-50 [&>*]:pointer-events-auto"
					ref={setPortal}
				/>
			</PortalContainerContext.Provider>
		</div>
	);
}

function Family({
	id,
	name,
	children,
}: {
	id: string;
	name: string;
	children: React.ReactNode;
}) {
	return (
		<section className="mb-10" data-figma-family={id}>
			<h2 className="mb-3 font-sans text-base font-bold">{name}</h2>
			{children}
		</section>
	);
}

const itemVariants: TreeItemVariant[] = [
	"default",
	"selected",
	"unselectable",
	"drop-indicator",
	"add",
	"notification",
];
const itemIds = ["1:2573", "1:2587", "1:2601", "1:2615", "39:4571", "312:2880"];
const folderIds = [
	"1:2618",
	"1:2629",
	"1:2640",
	"1:2651",
	"39:4591",
	"312:2904",
];
const treeNodes: TreeNode[] = [
	{
		id: "domain",
		label: "BIL Sales",
		sectionLabel: "BUSINESS DOMAIN",
		menu: true,
		children: [
			{
				id: "capability",
				label: "BIL Sales",
				sectionLabel: "CAPABILITY",
				menu: true,
				children: [
					{
						id: "request1",
						label: "4 Request System Access",
						sectionLabel: "SERVICE OFFERING",
						iconName: "treeDocument",
					},
					{
						id: "request2",
						label: "4 Request System Access",
						iconName: "treeDocument",
					},
					{
						id: "offering",
						label: "BIL Sales",
						menu: true,
						children: [
							{
								id: "catalogue",
								label: "4 Request System Access",
								sectionLabel: "SERVICE CATALOGUE ITEM",
								iconName: "treeDocument",
							},
							{
								id: "nested",
								label: "",
								variant: "drop-indicator",
								folder: false,
								children: [
									{
										id: "nested-first",
										label: "5 Auto Provision System Access",
										iconName: "treeDocument",
									},
									{
										id: "nested-item",
										label: "5 Auto Provision System Access",
										iconName: "treeDocument",
									},
									{
										id: "nested-add",
										label: "Add Service Catalogue Item",
										variant: "add",
									},
								],
							},
							{
								id: "auto",
								label: "4 Auto Provision System Access",
								iconName: "treeDocument",
							},
							{
								id: "add",
								label: "Add Service Catalogue Item",
								variant: "add",
							},
						],
					},
					{ id: "more1", label: "BIL Sales", folder: true, menu: true },
					{ id: "more2", label: "BIL Sales", folder: true, showChevron: false },
				],
			},
			{ id: "more3", label: "BIL Sales", folder: true, menu: true },
		],
	},
	{ id: "locked", label: "BIL Sales", folder: true, locked: true, menu: true },
	{ id: "last1", label: "BIL Sales", folder: true, menu: true },
	{ id: "last2", label: "BIL Sales", folder: true, menu: true },
];

function TreeExample({ builder = false }: { builder?: boolean }) {
	if (builder) return <TreeBuilderExample />;
	return <HierarchyExample />;
}

function HierarchyExample() {
	const [selected, setSelected] = React.useState(
		undefined as string | undefined,
	);
	return (
		<Tree
			defaultExpandedIds={["domain", "capability", "offering", "nested"]}
			nodes={treeNodes}
			onNodeMenuSelect={() => {}}
			onSelect={(node) => setSelected(node.id)}
			selectedId={selected}
		/>
	);
}

// The builder intentionally composes the library primitives: Figma mixes
// fixed catalogue cards with full-width editable rows in the same hierarchy.
function TreeBuilderExample() {
	const [selected, setSelected] = React.useState("fixed-identity");
	const [expanded, setExpanded] = React.useState(true);
	const [lastMenu, setLastMenu] = React.useState("");
	const row = (
		id: string,
		label: string,
		options: Partial<React.ComponentProps<typeof TreeItem>> = {},
	) => (
		<TreeItem
			aria-level={options.folder ? 2 : 4}
			iconName="treeBuilderDocument1"
			label={label}
			onClick={() => setSelected(id)}
			onMenuSelect={options.menu ? () => setLastMenu(id) : undefined}
			tabIndex={selected === id ? 0 : -1}
			variant={selected === id ? "selected" : "default"}
			{...options}
		/>
	);
	const connector = (
		offset: number,
		children: React.ReactNode,
		compact = true,
	) => (
		<div
			className={cn(
				"relative flex min-w-0 flex-col before:absolute before:inset-y-0 before:left-0 before:w-px",
				compact
					? "gap-1 py-0.5 pl-2.5 before:bg-snapp-text-primary/15"
					: "px-2 before:bg-snapp-border-primary",
			)}
			style={{ marginLeft: offset }}
		>
			{children}
		</div>
	);
	const label = (text: string, inset: number) => (
		<TreeSectionLabel
			className="text-snapp-text-primary/50 opacity-70"
			style={{ paddingLeft: inset }}
		>
			{text}
		</TreeSectionLabel>
	);
	return (
		<TreeBuilder nodes={[]} data-last-menu={lastMenu}>
			<li className="m-0 list-none p-0" role="none">
				{label("BUSINESS DOMAIN", 8)}
				<TreeFolder
					aria-level={1}
					chevron
					expanded={expanded}
					iconName="treeBuilderFolder"
					label="BIL Sales"
					menu
					onClick={() => setExpanded((value) => !value)}
					onMenuSelect={() => setLastMenu("domain")}
					tabIndex={expanded ? -1 : 0}
				/>
				{expanded ? (
					<>
						{label("CAPABILITY", 34)}
						{connector(
							16,
							row("capability", "BIL Sales", {
								folder: true,
								menu: true,
								iconName: "treeBuilderFolder",
								expanded: true,
							}),
							false,
						)}
						{label("SERVICE OFFERING", 62)}
						<div className="relative">
							{connector(
								40,
								row("offering", "BIL Sales", {
									"aria-level": 3,
									folder: true,
									iconName: "treeBuilderFolder",
									style: { width: 268 },
								}),
								false,
							)}
							<button
								aria-label="More options for service offering"
								className="absolute top-1.5 right-0 size-5"
								onClick={() => setLastMenu("offering")}
								type="button"
							>
								<NavigationIcon name="treeBuilderMore1" />
							</button>
						</div>
						{label("SERVICE CATALOGUE ITEM", 90)}
						<div className="relative ml-16 flex w-fit flex-col gap-1 px-2 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-snapp-border-primary">
							{[
								["fixed-request", "Request System Access"],
								["fixed-identity", "Identity and Access"],
								["fixed-auto", "Auto Provision System Access"],
								["fixed-add", "Service Catalogue Item"],
							].map(([id, text]) => (
								<TreeItem
									aria-level={4}
									aria-selected={selected === id}
									className={cn(
										"w-67",
										selected === id && "rounded-sm bg-snapp-surface-secondary",
									)}
									iconName={
										id === "fixed-add"
											? "treeBuilderAdd"
											: "treeBuilderDocument"
									}
									identifier={text}
									key={id}
									label="Item Name 1"
									onClick={() => setSelected(id)}
									tabIndex={selected === id ? 0 : -1}
									truncateLabel={false}
									variant={id === "fixed-add" ? "add" : "default"}
								/>
							))}
						</div>
						{connector(
							70,
							<>
								{row("wide-request", "Request System Access", {
									size: "compact",
									menu: true,
									menuIconName: "treeBuilderMore2",
								})}
								<div className="rounded-sm bg-snapp-text-primary/5">
									{row("wide-identity", "Identity and Access", {
										size: "compact",
										menu: true,
										menuIconName: "treeBuilderMore2",
									})}
								</div>
							</>,
						)}
						{connector(
							70,
							row("wide-auto", "Auto Provision System Access", {
								size: "compact",
								menu: true,
								menuIconName: "treeBuilderMore2",
							}),
						)}
						{connector(
							70,
							row("wide-add", "Service Catalogue Item", {
								size: "compact",
								variant: "add",
								iconName: "treeBuilderAdd1",
							}),
						)}
						{connector(
							40,
							row("offering2", "BIL Sales", {
								"aria-level": 3,
								folder: true,
								iconName: "treeBuilderFolder",
								style: { width: 268 },
							}),
							false,
						)}
						{connector(
							42,
							row("remove", "Remove System Access", {
								"aria-level": 3,
								size: "compact",
								iconName: "treeBuilderFolderOpen",
								menu: true,
								menuIconName: "treeBuilderMore2",
							}),
						)}
						{connector(
							40,
							row("offering3", "BIL Sales", {
								"aria-level": 3,
								folder: true,
								iconName: "treeBuilderFolder",
								style: { width: 268 },
							}),
							false,
						)}
						{connector(
							42,
							row("add-offering", "Add Service Offering", {
								"aria-level": 3,
								size: "compact",
								variant: "add",
								iconName: "treeBuilderAdd1",
							}),
						)}
						{connector(
							14,
							row("computing", "End User Computing", {
								"aria-level": 2,
								size: "compact",
								iconName: "treeBuilderGrid",
								menu: true,
								menuIconName: "treeBuilderMore2",
							}),
						)}
						{connector(
							14,
							row("support", "Application Support", {
								"aria-level": 2,
								size: "compact",
								iconName: "treeBuilderGrid",
								locked: true,
								lockIconName: "treeBuilderLock",
								menu: true,
								menuIconName: "treeBuilderMore2",
							}),
						)}
						{connector(
							14,
							row("add-capability", "Add Capability", {
								"aria-level": 2,
								size: "compact",
								variant: "add",
								iconName: "treeBuilderAdd1",
							}),
						)}
					</>
				) : null}
			</li>
			{["Human Resources", "Finance"].map((text) => (
				<li className="m-0 list-none p-0" key={text} role="none">
					<TreeFolder
						aria-level={1}
						chevron
						iconName="treeBuilderNotebook"
						label={text}
						locked={text === "Finance"}
						lockIconName="treeBuilderLock"
						menu
						menuIconName="treeBuilderMore2"
						onClick={() => setSelected(text)}
						onMenuSelect={() => setLastMenu(text)}
						tabIndex={selected === text ? 0 : -1}
					/>
				</li>
			))}
		</TreeBuilder>
	);
}

const assignedNodes: TreeNode[] = [
	{
		id: "sales1",
		label: "BIL Sales",
		children: [
			{
				id: "55145",
				label: "Item Name 1",
				identifier: "55145",
				draggable: true,
			},
			{
				id: "55167",
				label: "Item Name 1",
				identifier: "55167",
				draggable: true,
				iconName: "treeItemBook",
			},
			{
				id: "55231",
				label: "Item Name 1",
				identifier: "55231",
				draggable: true,
				iconName: "treeItemBug",
			},
		],
	},
	{
		id: "sales2",
		label: "BIL Sales",
		children: [
			{
				id: "56234",
				label: "Item Name 1",
				identifier: "56234",
				draggable: true,
				iconName: "treeItemBook",
			},
			{
				id: "56743",
				label: "Item Name 1",
				identifier: "56743",
				draggable: true,
				iconName: "treeItemBug",
			},
		],
	},
	{
		id: "sales3",
		label: "BIL Sales",
		children: [
			{
				id: "57346",
				label: "Item Name 1",
				identifier: "57346",
				draggable: true,
			},
		],
	},
	{
		id: "sales4",
		label: "BIL Sales",
		children: [
			{
				id: "58123",
				label: "Item Name 1",
				identifier: "58123",
				draggable: true,
			},
			{
				id: "58124",
				label: "Item Name 1",
				identifier: "58124",
				draggable: true,
				iconName: "treeItemBook",
			},
		],
	},
];

const dynamicsPrimary = [
	{
		id: "home",
		label: "Home",
		iconName: "dynamicsMenuHome" as const,
		expanded: false,
	},
	{
		id: "recent",
		label: "Recent",
		iconName: "dynamicsMenuAppRecent" as const,
		expanded: false,
	},
	{
		id: "pinned",
		label: "Pinned",
		iconName: "dynamicsMenuPin" as const,
		expanded: false,
	},
];
const dynamicsGroups = [
	{
		id: "accounts",
		label: "Key Accounts",
		items: [
			{
				id: "designer",
				label: "Catalogue Experience Designer",
				iconName: "dynamicsMenuBoard" as const,
				active: true,
			},
			{
				id: "headset",
				label: "Menu Item",
				iconName: "dynamicsMenuHeadset" as const,
			},
			{
				id: "toolbox",
				label: "Menu Item",
				iconName: "dynamicsMenuToolbox" as const,
			},
		],
	},
	{
		id: "actions",
		label: "Title",
		items: [
			{ id: "a1", label: "Actions", iconName: "dynamicsMenuToolbox" as const },
			{ id: "a2", label: "Actions", iconName: "dynamicsMenuToolbox" as const },
		],
	},
];

const apps: NavigationApp[] = [
	{
		id: "book",
		label: "App Name",
		iconName: "updatedHeaderBook",
		selected: true,
	},
	{
		id: "buildings",
		label: "App Name",
		iconName: "updatedHeaderBuildingMultiple",
	},
	{ id: "tree", label: "App Name", iconName: "updatedHeaderTreeDeciduous" },
	{
		id: "screens",
		label: "App Name",
		iconName: "updatedHeaderDualScreenDesktop",
	},
	{ id: "car", label: "App Name", iconName: "updatedHeaderVehicleCarProfile" },
	{ id: "globe", label: "App Name", iconName: "updatedHeaderGlobe" },
	{ id: "help", label: "App Name", iconName: "updatedHeaderHeadset" },
	{ id: "airplane", label: "App Name", iconName: "updatedHeaderAirplane" },
	{
		id: "lighthouse",
		label: "App Name",
		iconName: "updatedHeaderBuildingLighthouse",
	},
	{ id: "apps", label: "More Apps", iconName: "updatedHeaderApps" },
];

const headerItems: HeaderNavigationItem[] = [
	{ id: "alegra", label: "Alegra" },
	{
		id: "features",
		label: "Service Management",
		groups: [
			{
				id: "primary",
				label: "Employee Self-service",
				items: [
					{ id: "applications", label: "Applications" },
					{ id: "finances", label: "My Finances" },
					{ id: "support", label: "Get Support" },
					{ id: "access", label: "Get Access" },
					{ id: "join", label: "Join the Company" },
				],
			},
		],
	},
	{ id: "requests", label: "My Service Requests" },
	{ id: "inbox", label: "My Inbox" },
];

function HeaderExample({
	variant = "square",
	open = null,
}: {
	variant?: "square" | "updated";
	open?: string | null;
}) {
	const [menu, setMenu] = React.useState(open);
	const [messages, setMessages] = React.useState([
		"Hello! How can I help you today?",
	]);
	const items: HeaderNavigationItem[] =
		variant === "square"
			? headerItems.map((item) => ({
					...item,
					active: item.id === "features" && open === "chat",
				}))
			: [
					{ id: "alegra", label: "Alegra" },
					{
						id: "features",
						label: "Feature Group",
						groups: [
							{
								id: "g1",
								label: "Feature Group",
								prominent: true,
								items: Array.from({ length: 4 }, (_, id) => ({
									id: String(id),
									label: "Feature Name",
								})),
							},
							{
								id: "g2",
								label: "Feature Group",
								items: Array.from({ length: 3 }, (_, id) => ({
									id: String(id),
									label: "Feature Name",
								})),
							},
							{
								id: "g3",
								label: "Feature Group",
								items: Array.from({ length: 2 }, (_, id) => ({
									id: String(id),
									label: "Feature Name",
								})),
							},
						],
					},
					{ id: "help", label: "Get Help" },
					{ id: "requests", label: "My Service Requests" },
					{ id: "inbox", label: "My Inbox" },
				];
	return (
		<NavigationHeader
			apps={apps}
			areas={apps.slice(0, 4).map((app, index) => ({
				...app,
				label: "Area Name",
				iconName:
					index === 0
						? "squareTopMenuPuzzlePiece"
						: "squareTopMenuPuzzlePiece1",
			}))}
			chat={
				<LiveSupportPanel
					onClose={() => setMenu(null)}
					onSendMessage={(message) =>
						setMessages((previous) => [...previous, message])
					}
				>
					{messages.map((message, index) => (
						<SupportMessage className="mb-2" key={index}>
							{message}
						</SupportMessage>
					))}
				</LiveSupportPanel>
			}
			items={items}
			onOpenMenuChange={setMenu}
			openMenu={menu}
			userControls={
				<>
					<button type="button">Bob Bobertson</button>
					<button type="button">Settings</button>
					<button type="button">Log Out</button>
				</>
			}
			variant={variant}
		/>
	);
}

function TabsExample({ selected }: { selected: string }) {
	const [value, setValue] = React.useState(selected);
	const approval = Number(selected) > 3;
	const tabs = approval
		? [
				{ value: "4", label: "Open Approvals" },
				{ value: "5", label: "Completed Approvals" },
				{ value: "6", label: "Approval Policies" },
			]
		: [
				{
					value: "tasks",
					label: "My Tasks",
					dividerAfter: true,
					mutedWhenInactive: false,
				},
				{ value: "1", label: "My Work" },
				{ value: "3", label: "Completed" },
			];
	return (
		<TabbedHeaderNavigation
			achievements={{ week: 6, month: 21 }}
			onValueChange={setValue}
			tabs={tabs}
			value={value}
		/>
	);
}

function EditorExample() {
	const [formats, setFormats] = React.useState<EditorFormat[]>([]);
	const [alignment, setAlignment] = React.useState<EditorAlignment>("center");
	return (
		<EditorToolbar
			alignment={alignment}
			formats={formats}
			onAlignmentChange={setAlignment}
			onFormatsChange={setFormats}
		/>
	);
}

function SidebarExample() {
	const [filters, setFilters] = React.useState(["Expired", "Overdue"]);
	const [query, setQuery] = React.useState("");
	const nodes: TreeNode[] = [
		{
			id: "solutions",
			label: "Business Solutions 3/5",
			folder: true,
			showChevron: false,
			iconName: "sidebarFlag",
			menu: true,
		},
		{
			id: "applications",
			label: "Business Applications Specialization 1/2",
			folder: true,
			iconName: "sidebarTargetArrow",
		},
		{
			id: "goal1",
			label: "Learning Goal",
			folder: true,
			iconName: "sidebarTargetArrow",
		},
		{
			id: "goal2",
			label: "Learning Goal",
			folder: true,
			iconName: "sidebarTargetArrow",
		},
		{ id: "addgoal", label: "Add Goal", variant: "add" },
	];
	return (
		<NavigationPanel
			filters={
				<div className="flex items-center gap-1">
					{filters.map((filter) => (
						<button
							className="flex h-9 items-center gap-2 rounded-full bg-snapp-surface-secondary px-4 py-2 font-sans text-sm leading-5 text-snapp-text-secondary"
							key={filter}
							onClick={() =>
								setFilters((previous) =>
									previous.filter((value) => value !== filter),
								)
							}
							type="button"
						>
							{filter}
							<NavigationIcon name="sidebarDismiss" />
						</button>
					))}
					<button
						className="ml-auto text-xs leading-4"
						onClick={() => setFilters([])}
						type="button"
					>
						Clear Filter
					</button>
				</div>
			}
			iconName="sidebarClipboardTask"
			searchProps={{
				value: query,
				onChange: (event) => setQuery(event.target.value),
			}}
			title="Learning Goals"
		>
			<Tree
				defaultExpandedIds={["applications"]}
				nodes={nodes.filter((node) =>
					node.label.toLowerCase().includes(query.toLowerCase()),
				)}
			/>
		</NavigationPanel>
	);
}

export function NavigationLibraryPreview({ family }: { family?: string }) {
	const show = (id: string) => !family || family === id;
	return (
		<div className="p-5 font-sans">
			{show("1:2386") ? (
				<Family id="1:2386" name="Tabbed Header Navigation">
					{["1", "3", "4", "5", "6"].map((selected, index) => (
						<Fixture
							id={["1:2387", "1:2427", "1:2447", "1:2464", "1:2481"][index]}
							key={selected}
							variant={"Tab Selected=" + selected}
							width={1652}
						>
							<TabsExample selected={selected} />
						</Fixture>
					))}
				</Family>
			) : null}
			{show("1:2498") ? (
				<Family id="1:2498" name="Tree Menu">
					<Fixture height={1031} id="1:2498" width={300}>
						<TreeMenu onCollapse={() => {}} title="Assigned Tasks">
							<Tree
								defaultExpandedIds={["sales1", "sales2", "sales3", "sales4"]}
								nodes={assignedNodes}
								recipe="menu"
							/>
						</TreeMenu>
					</Fixture>
				</Family>
			) : null}
			{show("1:2549") ? (
				<Family id="1:2549" name="Row">
					<Fixture id="1:2549" width={961}>
						<TreeRow
							category="Category"
							date="20/05/2026"
							identifier="55167"
							label="Task Name 2"
							progress={27.5}
							progressLabel="144"
							status="Status"
						/>
					</Fixture>
				</Family>
			) : null}
			{show("1:2567") ? (
				<Family id="1:2567" name="Row Title">
					<Fixture id="1:2567" width={985}>
						<TreeRowTitle label="BIL Sales" />
					</Fixture>
				</Family>
			) : null}
			{show("1:2572") ? (
				<Family id="1:2572" name="Tree Item">
					{itemVariants.map((variant, index) => (
						<Fixture
							id={itemIds[index]}
							key={variant}
							variant={variant}
							width={268}
						>
							<TreeItem
								date="02/06/26"
								identifier={variant === "add" ? undefined : "55145"}
								label={variant === "add" ? "55145" : "Item Name 1"}
								notification="1"
								variant={variant}
							/>
						</Fixture>
					))}
				</Family>
			) : null}
			{show("1:2617") ? (
				<Family id="1:2617" name="Tree Folder">
					{itemVariants.map((variant, index) => (
						<Fixture
							id={folderIds[index]}
							key={variant}
							variant={variant}
							width={268}
						>
							<TreeFolder
								date="02/06/26"
								label={variant === "add" ? "Add" : "BIL Sales"}
								notification="1"
								variant={variant}
							/>
						</Fixture>
					))}
				</Family>
			) : null}
			{show("1:2655") ? (
				<Family id="1:2655" name="Pagination">
					<Fixture id="1:2655" width={413}>
						<Pagination>
							<PaginationContent>
								<PaginationItem>
									<PaginationPrevious href="#" text="" />
								</PaginationItem>
								{["Week 1 - 3", "Week 4 - 6", "Week 7 - 8"].map(
									(label, index) => (
										<PaginationItem key={label}>
											<PaginationLink
												href="#"
												isActive={index === 0}
												size="default"
											>
												{label}
											</PaginationLink>
										</PaginationItem>
									),
								)}
								<PaginationItem>
									<PaginationEllipsis />
								</PaginationItem>
								<PaginationItem>
									<PaginationNext href="#" />
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					</Fixture>
				</Family>
			) : null}
			{show("1:2675") ? (
				<Family id="1:2675" name="Tree">
					<Fixture id="1:2675" width={499}>
						<TreeExample />
					</Fixture>
				</Family>
			) : null}
			{show("1:2790") ? (
				<Family id="1:2790" name="Tree Builder">
					<Fixture id="1:2790" width={1322}>
						<TreeExample builder />
					</Fixture>
				</Family>
			) : null}
			{show("1:3029") ? (
				<Family id="1:3029" name="Profile Controls">
					<Fixture id="1:3029" width={1920}>
						<ProfileControls />
					</Fixture>
				</Family>
			) : null}
			{show("1:3098") ? (
				<Family id="1:3098" name="Left Menu">
					<Fixture height={864} id="1:3098" width={268}>
						<BrandedSidebar
							areas={[
								{ id: "area1", label: "Area Selection" },
								{ id: "area2", label: "Area Selection" },
							]}
							groups={[
								{
									id: "g1",
									label: "Feature Group",
									itemGap: 8,
									items: [
										{
											id: "alegra",
											label: "Alegra",
											iconName: "leftMenuChatMultiple",
										},
										{
											id: "inbox",
											label: "My Inbox",
											iconName: "leftMenuMailUnread",
										},
									],
								},
								{
									id: "g2",
									label: "Feature Group",
									items: [
										{
											id: "knowledge",
											label: "Browse Knowledge Base",
											iconName: "leftMenuBookOpen",
										},
										{
											id: "catalogue",
											label: "Experience Catalogue",
											iconName: "leftMenuNotebook",
										},
										{
											id: "tasks",
											label: "My Tasks",
											iconName: "leftMenuTrophy",
										},
									],
								},
								{
									id: "g3",
									label: "Feature Group",
									items: [
										{
											id: "log",
											label: "Log Service Request",
											iconName: "leftMenuFrame634093",
										},
										{
											id: "manage",
											label: "Manage Service Requests",
											iconName: "leftMenuTag",
										},
										{
											id: "learning",
											label: "Learning Management",
											iconName: "leftMenuHatGraduation",
										},
										{
											id: "approvals",
											label: "Approvals",
											iconName: "leftMenuApprovalsApp",
										},
									],
								},
							]}
							onSignOut={() => {}}
							selectedArea={{ initials: "SM", label: "Service Management" }}
							title="App Name"
						/>
					</Fixture>
				</Family>
			) : null}
			{show("13:934") ? (
				<Family id="13:934" name="Header">
					<Fixture id="1:2536" variant="Achievements" width={1650}>
						<FeatureHeader
							achievements={{ week: 6, month: 21 }}
							title="My Timesheets"
						/>
					</Fixture>
					<Fixture id="13:935" variant="Standard" width={1650}>
						<FeatureHeader title="My Timesheets" />
					</Fixture>
				</Family>
			) : null}
			{show("13:1199") ? (
				<Family id="13:1199" name="Dynamics Menu">
					<Fixture height={1030} id="13:1199" width={201}>
						<DynamicsMenu
							groups={dynamicsGroups}
							primaryItems={dynamicsPrimary}
						/>
					</Fixture>
				</Family>
			) : null}
			{show("50:5887") ? (
				<Family id="50:5887" name="Side Menu">
					<Fixture height={1280} id="50:5887" width={770}>
						<SideMenu>
							<DynamicsMenu
								groups={dynamicsGroups.map((group) => ({
									...group,
									items: group.items.map((item) =>
										item.id === "designer"
											? { ...item, label: "Form Builder" }
											: item,
									),
								}))}
								primaryItems={dynamicsPrimary}
							/>
							<NavigationPanel
								iconName="sideMenuFormMultiple"
								onCollapse={() => {}}
								title="Form Manager"
							>
								<Tree
									defaultExpandedIds={["incident"]}
									nodes={[
										{
											id: "incident",
											label: "Incident",
											children: [
												{
													id: "ticket",
													label: "Ticket",
													iconName: "sideMenuForm",
													menu: true,
												},
												{
													id: "form1",
													label: "Generic Form Name",
													iconName: "sideMenuForm",
													menu: true,
												},
												{
													id: "form2",
													label: "Generic Form Name",
													iconName: "sideMenuForm",
													menu: true,
												},
												{ id: "add", label: "Add New Form", variant: "add" },
											],
										},
										{ id: "opportunity", label: "Opportunity", folder: true },
										{ id: "hr", label: "HR Request", folder: true },
									]}
									selectedId="ticket"
								/>
							</NavigationPanel>
							<NavigationPanel
								iconName="sideMenuTaskList"
								searchProps={false}
								title="Form Elements"
							>
								<Tree
									nodes={[
										"Headings",
										"HTML Text",
										"Sections",
										"Fields",
										"Download",
									].map((label, id) => ({
										id: String(id),
										label,
										draggable: true,
										iconName: "sideMenuTetrisApp",
									}))}
								/>
							</NavigationPanel>
						</SideMenu>
					</Fixture>
				</Family>
			) : null}
			{show("74:9562") ? (
				<Family id="74:9562" name="Editor Toolbar">
					<Fixture id="74:9562" width={349}>
						<EditorExample />
					</Fixture>
				</Family>
			) : null}
			{show("74:9647") ? (
				<Family id="74:9647" name="Sidebar">
					<Fixture height={1080} id="74:9647" width={537}>
						<SidebarExample />
					</Fixture>
				</Family>
			) : null}
			{show("281:2267") ? (
				<Family id="281:2267" name="Updated Header">
					{[null, "features", "apps"].map((open, index) => (
						<Fixture
							height={open === "features" ? 292 : open === "apps" ? 310 : 56}
							id={["279:2191", "281:2268", "283:2327"][index]}
							key={String(open)}
							variant={["Default", "Open Menu", "Select App"][index]}
							width={1562}
						>
							<HeaderExample open={open} variant="updated" />
						</Fixture>
					))}
				</Family>
			) : null}
			{show("300:2763") ? (
				<Family id="300:2763" name="Tab Item">
					<Fixture id="300:2762" variant="Default" width={60}>
						<Tabs value="other">
							<TabsList className="bg-transparent p-0">
								<TabsTrigger value="item">Item</TabsTrigger>
							</TabsList>
						</Tabs>
					</Fixture>
					<Fixture id="300:2764" variant="Selected" width={60}>
						<Tabs value="item">
							<TabsList className="bg-transparent p-0">
								<TabsTrigger value="item">Item</TabsTrigger>
							</TabsList>
						</Tabs>
					</Fixture>
					<Fixture id="307:2840" variant="Expanded" width={132}>
						<ExpandedTab label="Item" nextLabel="Item" />
					</Fixture>
				</Family>
			) : null}
			{show("300:2784") ? (
				<Family id="300:2784" name="Tabbed Menu">
					<Fixture id="300:2784" width={524}>
						<Tabs defaultValue="0">
							<TabsList>
								{Array.from({ length: 8 }, (_, id) => (
									<TabsTrigger key={id} value={String(id)}>
										Item
									</TabsTrigger>
								))}
							</TabsList>
						</Tabs>
					</Fixture>
				</Family>
			) : null}
			{show("334:2201") ? (
				<Family id="334:2201" name="Square Top Menu">
					{[null, "apps", "area", "user", "features", "chat"].map(
						(open, index) => (
							<Fixture
								height={open === "chat" ? 570 : open ? 320 : 52}
								id={
									[
										"348:2227",
										"334:2535",
										"334:2623",
										"334:2718",
										"334:2769",
										"342:2403",
									][index]
								}
								key={String(open)}
								variant={
									[
										"Default",
										"Select App",
										"Area Switcher",
										"User Controls",
										"Menu Open 1 level",
										"AI Chat",
									][index]
								}
								width={1562}
							>
								<HeaderExample open={open} />
							</Fixture>
						),
					)}
				</Family>
			) : null}
			{show("347:2904") ? (
				<Family id="347:2904" name="Tool Menu">
					{Array.from({ length: 7 }, (_, depth) => (
						<Fixture
							id={
								[
									"347:2903",
									"347:2905",
									"347:3029",
									"347:3077",
									"347:3125",
									"347:3173",
									"347:3223",
								][depth]
							}
							key={depth}
							variant={"Depth=" + (depth + 1)}
							width={1510}
						>
							<ToolMenu
								items={Array.from({ length: depth + 1 }, (_, level) => ({
									id: String(level),
									label:
										level +
										1 +
										(level === 0
											? "st"
											: level === 1
												? "nd"
												: level === 2
													? "rd"
													: "th") +
										" Level",
								}))}
							/>
						</Fixture>
					))}
				</Family>
			) : null}
		</div>
	);
}
