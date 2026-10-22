"use client";

import type * as React from "react";

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
		children: React.ReactNode
	) => (
		<ToggleGroup
			aria-label={label}
			appearance="editor"
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
				"inline-flex w-fit items-center gap-2 rounded-lg bg-snapp-surface-primary p-2 drop-shadow-snapp-editor",
				className
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
						appearance="editor"
						value="bold"
					>
						<NavigationIcon name="editorBold" />
					</ToggleGroupItem>
					<ToggleGroupItem
						aria-label="Italic"
						appearance="editor"
						value="italic"
					>
						<NavigationIcon name="editorItalic" />
					</ToggleGroupItem>
					<ToggleGroupItem
						aria-label="Underline"
						appearance="editor"
						value="underline"
					>
						<NavigationIcon name="editorUnderline" />
					</ToggleGroupItem>
				</>
			)}
			<span
				aria-hidden="true"
				className="h-7 w-px bg-snapp-border-primary"
			/>
			{formatGroup(
				["ordered-list", "unordered-list"],
				"Lists",
				<>
					<ToggleGroupItem
						aria-label="Numbered list"
						appearance="editor"
						value="ordered-list"
					>
						<NavigationIcon name="editorListOrdered" />
					</ToggleGroupItem>
					<ToggleGroupItem
						aria-label="Bulleted list"
						appearance="editor"
						value="unordered-list"
					>
						<NavigationIcon name="editorListUnordered" />
					</ToggleGroupItem>
				</>
			)}
			<span
				aria-hidden="true"
				className="h-7 w-px bg-snapp-border-primary"
			/>
			<ToggleGroup
				aria-label="Text alignment"
				appearance="editor"
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
					appearance="editor"
					value="left"
				>
					<NavigationIcon name="editorAlignLeft" />
				</ToggleGroupItem>
				<ToggleGroupItem
					aria-label="Align center"
					appearance="editor"
					value="center"
				>
					<NavigationIcon name="editorAlignCenter" />
				</ToggleGroupItem>
				<ToggleGroupItem
					aria-label="Align right"
					appearance="editor"
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
