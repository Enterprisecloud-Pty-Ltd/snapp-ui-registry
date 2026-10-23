"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	SearchableCombobox,
	type SearchableComboboxProps,
} from "@/components/snapp/forms/searchable-combobox";
import {
	FormIcon,
	type FormIconName,
} from "@/components/snapp/forms/figma-form-icons";

function FormField({
	label,
	htmlFor,
	required,
	children,
	className,
	...props
}: React.ComponentProps<"div"> & {
	label: React.ReactNode;
	htmlFor?: string;
	required?: boolean;
}) {
	return (
		<div
			data-slot="form-field"
			className={cn(
				"flex w-full min-w-0 flex-col items-start gap-2 font-sans text-sm leading-5 font-normal",
				className
			)}
			{...props}
		>
			<Label htmlFor={htmlFor} appearance="form-field">
				<span>
					{label}
					{required && (
						<span
							className="whitespace-pre text-snapp-text-red"
							aria-hidden="true"
						>
							{" "}
							*
						</span>
					)}
				</span>
			</Label>
			{children}
		</div>
	);
}

// 15px CSS padding + the native 1px border equals Figma’s 16px content inset.
function FormControlSurface({
	className,
	children,
	end,
	helperText,
	invalid,
	disabled,
	selected,
	...props
}: React.ComponentProps<"div"> & {
	end?: React.ReactNode;
	helperText?: React.ReactNode;
	invalid?: boolean;
	disabled?: boolean;
	selected?: boolean;
}) {
	return (
		<div
			data-slot="form-control-surface"
			data-disabled={disabled || undefined}
			data-invalid={invalid || undefined}
			data-selected={selected || undefined}
			className={cn(
				"flex h-10.25 w-full min-w-0 shrink-0 items-center gap-0 rounded-lg border border-snapp-border-primary bg-snapp-surface-primary px-3.75 font-sans text-sm leading-5 font-normal text-snapp-text-secondary focus-within:border-snapp-border-brand data-[selected=true]:border-snapp-border-brand data-[invalid=true]:border-snapp-surface-red data-[disabled=true]:bg-snapp-control-disabled data-[disabled=true]:text-snapp-control-disabled-text [&>input]:h-full [&>input]:min-w-0 [&>input]:flex-1 [&>input]:rounded-none [&>input]:border-0 [&>input]:bg-transparent [&>input]:p-0 [&>input]:outline-none [&>input]:focus-visible:ring-0",
				className
			)}
			{...props}
		>
			{children}
			{helperText && (
				<span className="min-w-0 flex-1 text-right">{helperText}</span>
			)}
			{end}
		</div>
	);
}

type NoticeTone = "error" | "success" | "warning" | "info" | "general";
const noticeIcons: Record<NoticeTone, FormIconName> = {
	error: "error20",
	success: "success20",
	warning: "warning20",
	info: "info20",
	general: "general20",
};

function FieldNotice({
	tone = "error",
	children,
	messages,
	className,
	...props
}: React.ComponentProps<"div"> & {
	tone?: NoticeTone;
	messages?: readonly React.ReactNode[];
}) {
	const contents = messages?.length ? messages : [children];
	return (
		<div
			data-slot="field-notice"
			data-tone={tone}
			role={tone === "error" ? "alert" : "status"}
			className={cn(
				"flex w-full items-center gap-2 rounded-lg px-4 py-3 inset-ring font-sans text-sm leading-5 font-normal",
				tone === "error" &&
					"inset-ring-snapp-surface-red bg-snapp-notice-error text-snapp-text-red",
				tone === "success" &&
					"inset-ring-snapp-surface-green bg-snapp-notice-success text-snapp-text-green",
				tone === "warning" &&
					"inset-ring-snapp-surface-amber bg-snapp-notice-warning text-snapp-text-amber",
				tone === "info" &&
					"inset-ring-snapp-border-highlight bg-snapp-notice-info text-snapp-text-blue",
				tone === "general" &&
					"inset-ring-snapp-border-primary bg-snapp-surface-secondary text-snapp-text-brand",
				contents.length > 1 && "items-start",
				className
			)}
			{...props}
		>
			<FormIcon
				name={noticeIcons[tone]}
				className={cn(contents.length > 1 && "mt-px")}
			/>
			<div
				className={cn(
					"flex min-w-0 flex-1 flex-col gap-1",
					contents.length > 1 && "py-px"
				)}
			>
				{React.Children.map(contents, (message) => (
					<div>{message}</div>
				))}
			</div>
		</div>
	);
}

function SearchField({
	label,
	className,
	inputClassName,
	id,
	...props
}: React.ComponentProps<typeof Input> & {
	label?: React.ReactNode;
	inputClassName?: string;
}) {
	const generatedId = React.useId();
	const inputId = id ?? generatedId;
	const control = (
		<FormControlSurface
			className={className}
			end={<FormIcon name="search20" />}
		>
			<Input
				id={inputId}
				type="search"
				placeholder="Search"
				className={cn(
					"[&::-webkit-search-cancel-button]:appearance-none",
					inputClassName
				)}
				{...props}
			/>
		</FormControlSurface>
	);
	return label ? (
		<FormField label={label} htmlFor={inputId}>
			{control}
		</FormField>
	) : (
		control
	);
}

type ColorPickerFieldProps = Omit<
	React.ComponentProps<"input">,
	"type" | "value" | "defaultValue" | "children"
> & {
	label: React.ReactNode;
	value?: string;
	defaultValue?: string;
	placeholder?: string;
	onValueChange?: (value: string) => void;
};

function ColorPickerField({
	label,
	value,
	defaultValue,
	placeholder = "Colour Picker",
	onValueChange,
	onChange,
	className,
	id,
	disabled,
	required,
	...props
}: ColorPickerFieldProps) {
	const generatedId = React.useId();
	const inputId = id ?? generatedId;
	const [internalValue, setInternalValue] = React.useState(defaultValue);
	const selectedValue = value ?? internalValue;
	return (
		<FormField
			label={label}
			htmlFor={inputId}
			required={required}
			className={className}
		>
			<FormControlSurface
				className="relative"
				disabled={disabled}
				end={<FormIcon name="eyedropper20" />}
			>
				<span className="min-w-0 flex-1 truncate">
					{selectedValue || placeholder}
				</span>
				<input
					{...props}
					id={inputId}
					type="color"
					disabled={disabled}
					required={required}
					value={selectedValue || "#000000"}
					className="absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
					onChange={(event) => {
						if (value === undefined)
							setInternalValue(event.target.value);
						onValueChange?.(event.target.value);
						onChange?.(event);
					}}
				/>
			</FormControlSurface>
		</FormField>
	);
}

function SwitchField({
	label,
	id,
	className,
	...props
}: React.ComponentProps<typeof Switch> & { label: React.ReactNode }) {
	const generatedId = React.useId();
	const controlId = id ?? generatedId;
	return (
		<div
			data-slot="switch-field"
			className={cn("flex items-center gap-2", className)}
		>
			<Switch id={controlId} {...props} />
			<Label htmlFor={controlId}>{label}</Label>
		</div>
	);
}

function CheckboxField({
	label,
	id,
	className,
	variant,
	...props
}: React.ComponentProps<typeof Checkbox> & { label: React.ReactNode }) {
	const generatedId = React.useId();
	const controlId = id ?? generatedId;
	return (
		<div
			data-slot="checkbox-field"
			className={cn(
				"flex items-center gap-2",
				variant === "inter" && "gap-3",
				className
			)}
		>
			<Checkbox variant={variant} id={controlId} {...props} />
			<Label
				htmlFor={controlId}
				appearance={variant === "inter" ? "inter" : "default"}
			>
				{label}
			</Label>
		</div>
	);
}

function Pill({
	children,
	onRemove,
	removeLabel,
	variant = "standard",
	className,
	...props
}: React.ComponentProps<"span"> & {
	onRemove?: () => void;
	removeLabel?: string;
	variant?: "standard" | "white";
}) {
	return (
		<span
			data-slot="pill"
			data-variant={variant}
			className={cn(
				"inline-flex h-9 shrink-0 items-center gap-2 rounded-full bg-snapp-surface-secondary px-4 py-2 font-sans text-sm leading-5 font-normal whitespace-nowrap text-snapp-text-secondary",
				variant === "white" && "bg-snapp-surface-primary",
				className
			)}
			{...props}
		>
			{children}
			{onRemove && (
				<button
					type="button"
					onClick={onRemove}
					aria-label={removeLabel ?? "Remove selection"}
					className="flex size-3 shrink-0 cursor-pointer items-center justify-center rounded focus-visible:outline-1 focus-visible:outline-snapp-border-highlight"
				>
					<FormIcon name="dismiss12" />
				</button>
			)}
		</span>
	);
}

function TextButton({
	className,
	children,
	tone = "default",
	icon,
	disabled,
	...props
}: React.ComponentProps<"button"> & {
	tone?: "default" | "invert" | "reject";
	icon?: FormIconName | React.ReactNode;
}) {
	const defaultIcon: FormIconName = disabled
		? "approveDisabled"
		: tone === "invert"
			? "approveInvert"
			: tone === "reject"
				? "approveReject"
				: "approve";
	return (
		<button
			type="button"
			data-slot="text-button"
			data-tone={tone}
			disabled={disabled}
			className={cn(
				"group/text-button inline-flex cursor-pointer items-center gap-2 rounded-none bg-transparent p-0 font-sans text-sm leading-5 font-normal text-snapp-text-brand outline-none hover:text-snapp-text-secondary focus-visible:text-snapp-text-blue disabled:pointer-events-none disabled:cursor-not-allowed disabled:text-snapp-control-disabled-text",
				tone === "invert" && "text-snapp-text-invert",
				tone === "reject" && "text-snapp-text-red",
				className
			)}
			{...props}
		>
			{typeof icon === "string" ? (
				<FormIcon name={icon as FormIconName} />
			) : (
				(icon ?? (
					<span className="relative size-4 shrink-0">
						<FormIcon
							name={defaultIcon}
							className="group-enabled/text-button:group-hover/text-button:hidden"
						/>
						{!disabled && (
							<FormIcon
								name="approveHover"
								className="absolute inset-0 hidden group-enabled/text-button:group-hover/text-button:block"
							/>
						)}
					</span>
				))
			)}
			{children}
		</button>
	);
}

function UploadField({
	label,
	large = false,
	hint,
	buttonLabel = "Click to select a file",
	onFilesChange,
	className,
	id,
	disabled,
	multiple,
	accept,
	required,
	name,
	...props
}: Omit<React.ComponentProps<"input">, "type" | "onChange"> & {
	label: React.ReactNode;
	large?: boolean;
	hint?: React.ReactNode;
	buttonLabel?: React.ReactNode;
	onFilesChange?: (files: File[]) => void;
}) {
	const generatedId = React.useId();
	const inputId = id ?? generatedId;
	const inputRef = React.useRef<HTMLInputElement>(null);
	const [fileNames, setFileNames] = React.useState("");
	const receiveFiles = (files: File[]) => {
		const selectedFiles = multiple ? files : files.slice(0, 1);
		const transfer = new DataTransfer();
		selectedFiles.forEach((file) => {
			transfer.items.add(file);
		});
		if (inputRef.current) inputRef.current.files = transfer.files;
		setFileNames(selectedFiles.map((file) => file.name).join(", "));
		onFilesChange?.(selectedFiles);
	};
	return (
		<FormField
			label={label}
			htmlFor={inputId}
			required={required}
			className={className}
		>
			<input
				{...props}
				ref={inputRef}
				id={inputId}
				type="file"
				name={name}
				multiple={multiple}
				accept={accept}
				required={required}
				disabled={disabled}
				className="sr-only"
				onChange={(event) =>
					receiveFiles(Array.from(event.target.files ?? []))
				}
			/>
			<button
				type="button"
				disabled={disabled}
				onClick={() => inputRef.current?.click()}
				onDragOver={(event) => {
					if (large && !disabled) event.preventDefault();
				}}
				onDrop={(event) => {
					if (!large || disabled) return;
					event.preventDefault();
					receiveFiles(Array.from(event.dataTransfer.files));
				}}
				className={cn(
					"flex w-full cursor-pointer rounded-lg border border-snapp-border-primary bg-snapp-surface-primary font-sans text-sm leading-5 font-normal text-snapp-text-secondary outline-none focus-visible:border-snapp-border-highlight disabled:cursor-not-allowed disabled:bg-snapp-control-disabled",
					large
						? "flex-col items-center gap-1 border-0 bg-transparent p-6 outline outline-dashed -outline-offset-1 outline-snapp-border-primary focus-visible:outline-snapp-border-highlight"
						: "h-10.25 items-center justify-between px-3.75"
				)}
			>
				{large ? (
					<>
						<FormIcon name="upload24" />
						<span className="w-full text-center text-snapp-text-brand">
							{fileNames || buttonLabel}
						</span>
						{hint && (
							<span className="w-full text-center text-xs leading-3.75">
								{hint}
							</span>
						)}
					</>
				) : (
					<>
						<span className="min-w-0 flex-1 truncate text-left">
							{fileNames || "File upload"}
						</span>
						<FormIcon name="upload20" />
					</>
				)}
			</button>
		</FormField>
	);
}

function CommentBox({
	className,
	actions,
	toolbar,
	...props
}: React.ComponentProps<typeof Textarea> & {
	actions?: React.ReactNode;
	toolbar?: React.ReactNode;
}) {
	return (
		<div
			data-slot="comment-box"
			className={cn(
				"relative flex w-full flex-col gap-8 rounded-lg inset-ring inset-ring-snapp-border-primary bg-snapp-surface-primary p-4 font-sans text-sm leading-5",
				className
			)}
		>
			<Textarea
				placeholder="Add a comment"
				appearance="comment"
				className={cn(actions && "h-5 min-h-5")}
				{...props}
			/>
			{toolbar && (
				<div
					data-slot="comment-toolbar"
					className="absolute -top-9.25 left-30 z-10"
				>
					{toolbar}
				</div>
			)}
			{actions && (
				<div className="flex flex-col gap-3">
					<div className="relative h-0 w-full">
						<FormIcon
							name="commentDivider"
							className="absolute -top-px left-0"
						/>
					</div>
					<div className="flex flex-wrap items-center gap-6">
						{actions}
					</div>
				</div>
			)}
		</div>
	);
}

function DatePickerField({
	label,
	value,
	onValueChange,
	disabled,
	className,
	variant = "default",
	placeholder = "Pick a date",
	...calendarProps
}: Omit<
	React.ComponentProps<typeof Calendar>,
	"mode" | "selected" | "onSelect" | "disabled"
> & {
	label: React.ReactNode;
	value?: Date;
	onValueChange?: (value: Date | undefined) => void;
	disabled?: boolean;
	variant?: "default" | "inter";
	placeholder?: string;
}) {
	const generatedId = React.useId();
	const [open, setOpen] = React.useState(false);
	return (
		<FormField
			label={label}
			htmlFor={generatedId}
			className={cn(
				variant === "inter" &&
					"w-56 gap-3 **:data-[slot=label]:font-snapp-inter **:data-[slot=label]:font-medium **:data-[slot=label]:text-snapp-inter-text",
				className
			)}
		>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<button
						id={generatedId}
						type="button"
						disabled={disabled}
						className={cn(
							"flex h-10.25 w-full cursor-pointer items-center justify-between gap-1 rounded-lg border border-snapp-border-primary bg-snapp-surface-primary px-3.75 font-sans text-sm leading-5 font-normal text-snapp-text-secondary outline-none focus-visible:border-snapp-border-brand disabled:cursor-not-allowed disabled:bg-snapp-control-disabled",
							variant === "inter" &&
								"h-9 rounded-md border-snapp-inter-border px-2.75 py-1 font-snapp-inter text-base leading-6 text-snapp-inter-text shadow-snapp-inter-control"
						)}
					>
						<span>
							{value
								? new Intl.DateTimeFormat("en-US", {
										month: "long",
										day: "2-digit",
										year: "numeric",
									}).format(value)
								: placeholder}
						</span>
						<FormIcon
							name={
								variant === "inter"
									? "calendar16"
									: "calendar20"
							}
						/>
					</button>
				</PopoverTrigger>
				{/* Figma 49:5007 includes its inside stroke in the 12px content inset.
          Its 226px header retains seven fixed 32px day columns below it. */}
				<PopoverContent align="end" appearance="calendar">
					<Calendar
						{...calendarProps}
						appearance="date-picker"
						mode="single"
						selected={value}
						onSelect={(next) => {
							onValueChange?.(next);
							setOpen(false);
						}}
						captionLayout="dropdown"
						defaultMonth={value}
					/>
				</PopoverContent>
			</Popover>
		</FormField>
	);
}

// Match the intrinsic numeral width plus Figma’s two 16px insets, growing with data.
function NumberSelect({
	number,
	onNumberChange,
	numberLabel,
	className,
	...props
}: SearchableComboboxProps & {
	number: number | "";
	onNumberChange: (number: number | "") => void;
	numberLabel: string;
}) {
	const popupAnchor = React.useRef<HTMLDivElement>(null);
	return (
		<div
			ref={popupAnchor}
			data-slot="number-select"
			className={cn("flex w-full items-start gap-2", className)}
		>
			<SearchableCombobox
				{...props}
				popupAnchor={props.popupAnchor ?? popupAnchor}
				className="min-w-0 flex-1"
				inputClassName={props.inputClassName}
				muted
			/>
			<Input
				aria-label={numberLabel}
				type="number"
				disabled={props.disabled}
				value={number}
				style={{
					width: `calc(${Math.max(1, String(number).length)}ch + 32px)`,
				}}
				appearance="number-select"
				onChange={(event) =>
					onNumberChange(
						event.target.value === ""
							? ""
							: event.target.valueAsNumber
					)
				}
			/>
		</div>
	);
}

export {
	FormField,
	FormControlSurface,
	FieldNotice,
	SearchField,
	ColorPickerField,
	SwitchField,
	CheckboxField,
	Pill,
	TextButton,
	UploadField,
	CommentBox,
	DatePickerField,
	NumberSelect,
};
export type { ColorPickerFieldProps };
