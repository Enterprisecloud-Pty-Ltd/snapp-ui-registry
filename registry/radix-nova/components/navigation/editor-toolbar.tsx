"use client";

import type * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { NavigationIcon } from "@/components/snapp/navigation/navigation-icons";

type EditorFormat =
	| "bold"
	| "italic"
	| "underline"
	| "ordered-list"
	| "unordered-list";
type EditorAlignment = "left" | "center" | "right";
interface EditorToolbarProps extends React.ComponentProps<"div"> {
	formats: EditorFormat[];
	alignment: EditorAlignment;
	onFormatsChange: (formats: EditorFormat[]) => void;
	onAlignmentChange: (alignment: EditorAlignment) => void;
	disabled?: boolean;
}

const editorButton = cva(
	"size-9.5 rounded-none border-0 bg-snapp-grey-100 p-2.75 font-normal shadow-none not-last:-mr-px group-data-[spacing=0]/toggle-group:px-2.75 group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-l-sm group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-r-sm data-[state=on]:bg-snapp-grey-300 hover:bg-snapp-grey-200 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-snapp-border-highlight",
);

function EditorToolbar({
	formats,
	alignment,
	onFormatsChange,
	onAlignmentChange,
	disabled,
	className,
	...props
}: EditorToolbarProps) {
	const formatGroup = (
		values: EditorFormat[],
		label: string,
		children: React.ReactNode,
	) => (
		<ToggleGroup
			aria-label={label}
			className="gap-0 rounded-sm"
			disabled={disabled}
			onValueChange={(next) =>
				onFormatsChange([
					...formats.filter((format) => !values.includes(format)),
					...(next as EditorFormat[]),
				])
			}
			spacing={0}
			type="multiple"
			value={formats.filter((format) => values.includes(format))}
		>
			{children}
		</ToggleGroup>
	);
	return (
		<div
			aria-label="Text editor formatting"
			className={cn(
				"inline-flex w-fit items-center gap-2 rounded-lg bg-snapp-surface-primary p-2 drop-shadow-[0_4px_6px_#00000040]",
				className,
			)}
			data-slot="snapp-editor-toolbar"
			role="toolbar"
			{...props}
		>
			{formatGroup(
				["bold", "italic", "underline"],
				"Text emphasis",
				<>
					<ToggleGroupItem
						aria-label="Bold"
						className={editorButton()}
						value="bold"
					>
						<NavigationIcon name="editorBold" />
					</ToggleGroupItem>
					<ToggleGroupItem
						aria-label="Italic"
						className={editorButton()}
						value="italic"
					>
						<NavigationIcon name="editorItalic" />
					</ToggleGroupItem>
					<ToggleGroupItem
						aria-label="Underline"
						className={editorButton()}
						value="underline"
					>
						<NavigationIcon name="editorUnderline" />
					</ToggleGroupItem>
				</>,
			)}
			<span aria-hidden="true" className="h-7 w-px bg-snapp-border-primary" />
			{formatGroup(
				["ordered-list", "unordered-list"],
				"Lists",
				<>
					<ToggleGroupItem
						aria-label="Numbered list"
						className={editorButton()}
						value="ordered-list"
					>
						<NavigationIcon name="editorListOrdered" />
					</ToggleGroupItem>
					<ToggleGroupItem
						aria-label="Bulleted list"
						className={editorButton()}
						value="unordered-list"
					>
						<NavigationIcon name="editorListUnordered" />
					</ToggleGroupItem>
				</>,
			)}
			<span aria-hidden="true" className="h-7 w-px bg-snapp-border-primary" />
			<ToggleGroup
				aria-label="Text alignment"
				className="gap-0 rounded-sm"
				disabled={disabled}
				onValueChange={(next) => {
					if (next) onAlignmentChange(next as EditorAlignment);
				}}
				spacing={0}
				type="single"
				value={alignment}
			>
				<ToggleGroupItem
					aria-label="Align left"
					className={editorButton()}
					value="left"
				>
					<NavigationIcon name="editorAlignLeft" />
				</ToggleGroupItem>
				<ToggleGroupItem
					aria-label="Align center"
					className={editorButton()}
					value="center"
				>
					<NavigationIcon name="editorAlignCenter" />
				</ToggleGroupItem>
				<ToggleGroupItem
					aria-label="Align right"
					className={editorButton()}
					value="right"
				>
					<NavigationIcon name="editorAlignRight" />
				</ToggleGroupItem>
			</ToggleGroup>
		</div>
	);
}

export { EditorToolbar };
export type { EditorAlignment, EditorFormat, EditorToolbarProps };
