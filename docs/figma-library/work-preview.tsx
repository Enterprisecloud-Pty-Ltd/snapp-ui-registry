import { useState } from "react";
import {
	TaskListItem,
	type TaskListItemState,
} from "@/components/snapp/work-os/task-list-item";
import { CalendarDay } from "@/components/snapp/work-os/calendar-day";
import { WorkItemCard } from "@/components/snapp/work-os/work-item-card";
import { ProductivityPanel } from "@/components/snapp/work-os/productivity-panel";
import { Achievements } from "@/components/snapp/work-os/achievements";
import { CheckItem } from "@/components/snapp/learning/check-item";
import { Course } from "@/components/snapp/learning/course";
import {
	CourseStatus,
	type CourseStatusState,
} from "@/components/snapp/learning/course-status";
import { EmployeeCard } from "@/components/snapp/people/employee-card";
import { InboxCategory } from "@/components/snapp/inbox/inbox-category";
import { InboxItem } from "@/components/snapp/inbox/inbox-item";
import { ActionNode } from "@/components/snapp/data/action-node";
import { CatalogueCard } from "@/components/snapp/data/catalogue-card";
import { BrandMark } from "@/components/snapp/data/brand-mark";
import { DataCellContent, DataTable } from "@/components/snapp/data/data-table";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

const taskStates: [TaskListItemState, string][] = [
	["high", "1:2165"],
	["mid", "1:2182"],
	["low", "1:2198"],
	["dragged", "1:2214"],
	["placing", "1:2224"],
	["minimal", "1:2234"],
	["list", "1:2242"],
	["tiny", "1:2248"],
];
const workIcons = ["bug", "clipboard", "book"] as const;
const courseStatuses: CourseStatusState[] = [
	"default",
	"complete",
	"notice",
	"warning",
];

function EmployeeCourses({
	expanded = false,
	optional = false,
}: {
	expanded?: boolean;
	optional?: boolean;
}) {
	const count = optional ? 4 : expanded ? 5 : 3;
	return (
		<>
			{Array.from({ length: count }, (_, index) => (
				<Course
					key={index}
					variant={index < 2 ? "employee" : "default"}
					title={
						index === 1
							? "Power Platform Fundamentals"
							: "Azure AI Fundamentals"
					}
					code={index === 1 ? "PL-900" : index < 2 ? "AB-900" : "AI-901"}
					date={
						index === 1
							? "Jan 22, 2027"
							: index < 2
								? "Sep 1, 2026"
								: "Sep 29, 2026"
					}
					completed={index < 2}
					className={index === 1 ? "h-5.5" : undefined}
				/>
			))}
		</>
	);
}

/** Visual verification fixture only. Example records are never distributed as registry components. */
function WorkLibraryPreview() {
	const [inboxSelected, setInboxSelected] = useState(false);
	const [selected, setSelected] = useState(false);
	const [complete, setComplete] = useState(false);
	const [courseComplete, setCourseComplete] = useState(false);
	const [panelCollapsed, setPanelCollapsed] = useState(false);
	const [nodeSelected, setNodeSelected] = useState(false);
	const [lastAction, setLastAction] = useState("none");
	const [employeeState, setEmployeeState] = useState<
		"closed" | "expanded" | "minimal"
	>("closed");
	return (
		<div className="flex flex-col items-start gap-8 font-snapp-body">
			<section aria-label="Task list item variants">
				<h2>TaskListItem</h2>
				<div className="flex w-85 flex-col gap-2.5 bg-[#ccc] p-5">
					{taskStates.map(([state, node]) => (
						<div key={state} data-figma-node={node} data-variant={state}>
							<TaskListItem
								state={state}
								recordId="55145"
								title={
									state === "tiny"
										? "Long Item..."
										: "Design System Documentation"
								}
								clientName="Client Name"
								time={state === "minimal" ? "2h 30m" : "6h 30m"}
							/>
						</div>
					))}
				</div>
			</section>
			<section aria-label="Calendar day variants">
				<h2>Day</h2>
				<div className="flex flex-col gap-2.5 bg-[#ccc] p-5">
					{(["dark", "light"] as const).map((version, index) => (
						<div
							key={version}
							data-figma-node={index === 0 ? "1:2290" : "1:2297"}
							data-variant={version}
						>
							<CalendarDay day="1" totalTime="0h 0m" version={version}>
								<TaskListItem
									state="tiny"
									recordId="55145"
									title="Long Item..."
									className="w-full"
								/>
							</CalendarDay>
						</div>
					))}
				</div>
			</section>
			<section aria-label="Work item types">
				<h2>Work Item</h2>
				<div className="flex flex-col gap-2.5 bg-[#ccc] p-5">
					{workIcons.map((icon, index) => (
						<div
							key={icon}
							data-figma-node={["1:2305", "1:2332", "1:2359"][index]}
							data-variant={icon}
						>
							<WorkItemCard
								item={{
									id: "55231",
									action: "Test",
									name: "Bug Name 3",
									assignment: "Unallocated",
									time: "0h 00m",
									capacity: "144 hrs",
									progress: 15.74,
									tone: "green",
									icon,
								}}
							/>
						</div>
					))}
				</div>
			</section>
			<section aria-label="Productivity panel variants">
				<h2>WorkOS Personal Productivity Right Panel</h2>
				<div className="flex items-start gap-2.5 bg-[#ccc] p-5">
					{[false, true].map((collapsed) => (
						<div
							key={String(collapsed)}
							data-figma-node={collapsed ? "1:3077" : "1:3056"}
							data-variant={collapsed ? "collapsed" : "open"}
						>
							<ProductivityPanel
								collapsed={collapsed}
								focusTime="24h 30m"
								overdueTime="09h 00m"
								focusItems={[
									{ id: "55145", name: "Item Name 1", type: "task" },
									{ id: "56743", name: "Item Name 1", type: "bug" },
								]}
								overdueItems={[
									{ id: "55167", name: "Item Name 1", type: "item" },
									{ id: "56743", name: "Item Name 1", type: "bug" },
								]}
							/>
						</div>
					))}
				</div>
			</section>
			<section aria-label="Achievements">
				<h2>Achievements</h2>
				<div data-figma-node="13:960" data-variant="default">
					<Achievements weekCount={6} monthCount={21} />
				</div>
			</section>
			<section aria-label="Check item variants">
				<h2>CheckItem</h2>
				<div className="flex flex-col gap-2.5 bg-[#ccc] p-5">
					{(["default", "selected", "completed"] as const).map(
						(state, index) => (
							<div
								key={state}
								data-figma-node={["48:4695", "48:4697", "48:4712"][index]}
								data-variant={state}
							>
								<CheckItem
									title="Learning Item"
									code="AI-901"
									date="Sep 1, 2026"
									state={state}
								/>
							</div>
						),
					)}
				</div>
			</section>
			<section aria-label="Course variants">
				<h2>Course</h2>
				<div className="flex flex-col gap-2.5 bg-[#ccc] p-5">
					{[true, false].map((completed) => (
						<div
							key={String(completed)}
							data-figma-node={completed ? "49:5409" : "49:4876"}
							data-variant={completed ? "complete" : "incomplete"}
						>
							<Course
								title="Azure AI Fundamentals"
								code="AB-900"
								date="Sep 1, 2026"
								completed={completed}
							/>
						</div>
					))}
				</div>
			</section>
			<section aria-label="Employee card variants">
				<h2>EmployeeCard</h2>
				<div className="flex items-start gap-6 bg-[#ccc] p-5">
					{(["closed", "expanded", "minimal"] as const).map((state, index) => (
						<div
							key={state}
							data-figma-node={["49:4891", "49:4917", "49:4950"][index]}
							data-variant={state}
						>
							<EmployeeCard
								name="Sarah Johnson"
								initials="SJ"
								roleName="Associate Business Applications Consultant"
								completed={2}
								total={3}
								progressPercentage={64.84}
								optionalCompleted={2}
								optionalTotal={3}
								state={state}
								certifications={
									<EmployeeCourses expanded={state === "expanded"} />
								}
								optionalCertifications={<EmployeeCourses optional />}
							/>
						</div>
					))}
				</div>
			</section>
			<section aria-label="Course status variants">
				<h2>CourseStatus</h2>
				<div className="flex flex-col gap-2.5 bg-[#ccc] p-5">
					{courseStatuses.map((state, index) => (
						<div
							key={state}
							data-figma-node={
								["61:6350", "61:6368", "61:6375", "61:6382"][index]
							}
							data-variant={state}
						>
							<CourseStatus
								name="Petrus de Kock"
								date="Sep 1, 2026"
								state={state}
							/>
						</div>
					))}
				</div>
			</section>
			<section aria-label="Table cell variants">
				<h2>TableCell</h2>
				<div className="flex w-84.25 flex-col gap-2.5 bg-[#ccc] p-5">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead data-figma-node="219:2061" data-variant="header">
									Text
								</TableHead>
							</TableRow>
						</TableHeader>
					</Table>
					<Table>
						<TableBody>
							<TableRow>
								<TableCell data-figma-node="219:2063" data-variant="regular">
									Text
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</div>
				<div
					className="w-74.25 bg-snapp-surface-primary p-2"
					data-figma-node="219:2063"
					data-variant="all-properties"
				>
					<DataCellContent documentIcon showChevron secondary="Text">
						Text
					</DataCellContent>
				</div>
			</section>
			<section aria-label="Table row">
				<h2>TableRow</h2>
				<div
					data-figma-node="219:2126"
					data-variant="six-cells"
					className="w-218.5"
				>
					<Table>
						<TableBody>
							<TableRow>
								{Array.from({ length: 6 }, (_, index) => (
									<TableCell
										key={index}
										style={{ width: index === 5 ? 64 : 162 }}
										className={index === 5 ? "text-right" : undefined}
									>
										Text
									</TableCell>
								))}
							</TableRow>
						</TableBody>
					</Table>
				</div>
			</section>
			<section aria-label="Table">
				<h2>Table</h2>
				<div
					data-figma-node="219:2228"
					data-variant="default"
					className="w-162 bg-[#ccc]"
				>
					<DataTable
						columns={[
							{
								id: "name",
								label: "Name",
								render: () => (
									<DataCellContent
										documentIcon
										primarySizing="content"
										secondary="Capacity override — CAS-01012 · Leonard Baxter"
									>
										56743
									</DataCellContent>
								),
							},
							{
								id: "decision",
								label: "Your Decision",
								width: 162,
								render: () => "Approved",
							},
							{
								id: "outcome",
								label: "Outcome",
								width: 162,
								render: () => (
									<span className="text-snapp-text-green">Approved</span>
								),
							},
							{
								id: "date",
								label: "Date",
								width: 162,
								render: () => "20/05/2026",
							},
						]}
						rows={[{ id: "one" }, { id: "two" }]}
						getRowKey={(row) => row.id}
					/>
				</div>
			</section>
			<section aria-label="Inbox category variants">
				<h2>InboxCategory</h2>
				<div className="flex flex-col gap-2.5 bg-[#ccc] p-5">
					{["default", "selected", "disabled"].map((state, index) => (
						<div
							key={state}
							data-figma-node={["226:2360", "228:2377", "228:2383"][index]}
							data-variant={state}
						>
							<InboxCategory
								label="Client Leads"
								count={3}
								selected={state === "selected"}
								disabled={state === "disabled"}
							/>
						</div>
					))}
				</div>
			</section>
			<section aria-label="Inbox item variants">
				<h2>InboxItem</h2>
				<div className="flex flex-col gap-2.5 bg-[#ccc] p-5">
					{[false, true].map((selected) => (
						<div
							key={String(selected)}
							data-figma-node={selected ? "230:2427" : "230:2425"}
							data-variant={selected ? "selected" : "default"}
						>
							<InboxItem
								sender="Sarah Chen"
								initials="SC"
								time="09:14"
								category="APPROVAL"
								priority="HIGH"
								title="Expense Claim - Q3 Cape Town Conference"
								preview="Requesting approval for R2,340 in travel and accommodation expenses."
								selected={selected}
							/>
						</div>
					))}
				</div>
			</section>
			<section aria-label="Action node variants">
				<h2>ActionNode</h2>
				<div className="flex flex-col gap-2.5 bg-[#ccc] p-5">
					{(["action", "condition", "trigger"] as const).flatMap(
						(kind, index) =>
							[false, true].map((selected) => (
								<div
									key={`${kind}:${selected}`}
									data-figma-node={
										[
											["236:2503", "239:2085"],
											["236:2516", "239:2097"],
											["236:2528", "239:2109"],
										][index][Number(selected)]
									}
									data-variant={`${kind}${selected ? "-selected" : ""}`}
								>
									<ActionNode
										kind={kind}
										title={kind.charAt(0).toUpperCase() + kind.slice(1)}
										subtitle="Resource Po..."
										selected={selected}
									/>
								</div>
							)),
					)}
				</div>
			</section>
			<section aria-label="Catalogue card variants">
				<h2>Card</h2>
				<div className="flex flex-col items-start gap-6 bg-snapp-surface-secondary p-5">
					<div data-figma-node="294:2679" data-variant="folder">
						<CatalogueCard
							category="FOLDER GROUP"
							description="Short paragraph describing the underlying / connected servic..."
						/>
					</div>
					<div data-figma-node="294:2689" data-variant="item">
						<CatalogueCard
							variant="item"
							category="ITEM"
							title="Service Name"
							description="Short paragraph describing the underlying / connected servi..."
						/>
					</div>
				</div>
			</section>
			<section aria-label="Brand marks">
				<h2>Brand assets</h2>
				<div className="flex flex-col items-start gap-4 bg-[#ccc] p-5">
					{(["ec-light", "ec-dark", "snapp-logo", "snapp-symbol"] as const).map(
						(mark, index) => (
							<div
								key={mark}
								data-figma-node={
									["49:4981", "49:4986", "267:2185", "279:2228"][index]
								}
								data-variant={mark}
							>
								<BrandMark mark={mark} />
							</div>
						),
					)}
				</div>
			</section>
			<section aria-label="Interaction verification">
				<h2>Interaction verification</h2>
				<output data-work-action="true" aria-live="polite">{lastAction}</output>
				<InboxCategory
					label="Client Leads"
					count={3}
					selected={selected}
					onClick={() => setSelected(!selected)}
				/>
				<CheckItem
					title="Learning Item"
					code="AI-901"
					date="Sep 1, 2026"
					state={complete ? "completed" : "default"}
					onCompletedChange={setComplete}
				/>
				<EmployeeCard
					name="Sarah Johnson"
					initials="SJ"
					roleName="Associate Business Applications Consultant"
					completed={2}
					total={3}
					state={employeeState}
					onStateChange={setEmployeeState}
					certifications={<EmployeeCourses />}
					optionalCertifications={<EmployeeCourses optional />}
				/>
				<TaskListItem recordId="55145" title="Design System Documentation" clientName="Client Name" time="6h 30m" onTimeClick={() => setLastAction("task-time")} onMenuClick={() => setLastAction("task-menu")} />
				<Course title="Interactive course" code="AI-901" date="Sep 1, 2026" completed={courseComplete} onCompletedChange={setCourseComplete} onMoreClick={() => setLastAction("course-more")} dragHandleProps={{ onClick: () => setLastAction("course-drag-handle") }} />
				<ProductivityPanel collapsed={panelCollapsed} onCollapsedChange={setPanelCollapsed} focusTime="24h 30m" overdueTime="09h 00m" focusItems={[{ id: "55145", name: "Item Name 1", type: "task", onClick: () => setLastAction("focus-item") }]} overdueItems={[]} className="min-h-0" />
				<ActionNode kind="condition" title="Condition" subtitle="Resource Po..." selected={nodeSelected} onClick={() => setNodeSelected(!nodeSelected)} onPortClick={port => setLastAction(`node-${port}`)} />
				<CatalogueCard variant="item" category="ITEM" title="Service Name" description="Short paragraph describing the connected service." onClick={() => setLastAction("catalogue-card")} />
				<InboxItem sender="Sarah Chen" initials="SC" time="09:14" category="APPROVAL" title="Interactive inbox item" preview="Requesting approval." selected={inboxSelected} onClick={() => { setInboxSelected(!inboxSelected); setLastAction("inbox-item"); }} />
				<DataTable rows={[{ id: "1" }]} getRowKey={row => row.id} columns={[{ id: "name", label: "Interactive sortable name", render: () => "Record", onSort: () => setLastAction("table-sort") }]} />
			</section>
		</div>
	);
}

export { WorkLibraryPreview };
