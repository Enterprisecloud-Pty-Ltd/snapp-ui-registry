import type { ComponentProps, ReactNode } from "react";
import arrowSort from "@/assets/snapp/work/ea056.svg";
import documentPerson from "@/assets/snapp/work/acc9b.svg";
import chevron from "@/assets/snapp/work/33162.svg";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataCellContentProps extends ComponentProps<"div"> {
	secondary?: ReactNode;
	icon?: ReactNode;
	documentIcon?: boolean;
	showChevron?: boolean;
	/** Master cells share text space equally; compact record instances may size the primary text to content. */
	primarySizing?: "fill" | "content";
}
function DataCellContent({
	children,
	secondary,
	icon,
	documentIcon = false,
	showChevron = false,
	primarySizing = "fill",
	className,
	...props
}: DataCellContentProps) {
	return (
		<div
			data-slot="snapp-data-cell-content"
			className={cn(
				"flex items-center gap-2 font-snapp-body text-snapp-sm leading-snapp-xs font-normal",
				className,
			)}
			{...props}
		>
			{icon ??
				(documentIcon && (
					<img
						src={documentPerson}
						alt=""
						width={20}
						height={20}
						className="shrink-0"
					/>
				))}
			{children !== undefined && (
				<span
					className={cn(
						secondary === undefined || primarySizing === "fill"
							? "min-w-0 flex-1"
							: "shrink-0",
						"text-snapp-text-primary",
					)}
				>
					{children}
				</span>
			)}
			{secondary !== undefined && (
				<span className="min-w-0 flex-1 text-snapp-text-secondary">
					{secondary}
				</span>
			)}
			{showChevron && (
				<img src={chevron} alt="" width={16} height={16} className="shrink-0" />
			)}
		</div>
	);
}

interface DataColumn<T> {
	id: string;
	label: ReactNode;
	width?: number | string;
	render: (row: T) => ReactNode;
	onSort?: () => void;
	sortDirection?: "ascending" | "descending";
}
interface DataTableProps<T> {
	columns: DataColumn<T>[];
	rows: T[];
	getRowKey: (row: T) => string;
	caption?: string;
	className?: string;
	emptyMessage?: ReactNode;
}

/** Semantic table with caller-owned querying, sorting, selection and paging. */
function DataTable<T>({
	columns,
	rows,
	getRowKey,
	caption,
	className,
	emptyMessage,
}: DataTableProps<T>) {
	return (
		<Table data-slot="snapp-data-table" className={className}>
			{caption && <caption className="sr-only">{caption}</caption>}
			<colgroup>
				{columns.map((column) => (
					<col key={column.id} style={{ width: column.width }} />
				))}
			</colgroup>
			<TableHeader>
				<TableRow>
					{columns.map((column) => (
						<TableHead key={column.id} aria-sort={column.sortDirection}>
							{column.onSort ? (
								<button
									type="button"
									onClick={column.onSort}
									className="flex w-full items-center gap-2.5 text-left focus-visible:outline-2 focus-visible:outline-snapp-border-highlight"
								>
									<span className="min-w-0 flex-1">{column.label}</span>
									<img
										src={arrowSort}
										alt=""
										width={16}
										height={16}
										className="shrink-0"
									/>
								</button>
							) : (
								column.label
							)}
						</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody className="bg-transparent">
				{rows.map((row) => (
					<TableRow key={getRowKey(row)}>
						{columns.map((column) => (
							<TableCell key={column.id} className="bg-transparent p-0">
								<div className="bg-snapp-surface-primary p-2">{column.render(row)}</div>
							</TableCell>
						))}
					</TableRow>
				))}
				{rows.length === 0 && emptyMessage !== undefined && (
					<TableRow>
						<TableCell colSpan={columns.length}>{emptyMessage}</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}

export { DataTable, DataCellContent };
export type { DataTableProps, DataColumn, DataCellContentProps };
