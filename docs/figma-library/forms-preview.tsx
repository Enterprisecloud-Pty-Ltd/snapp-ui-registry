import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupTextarea, InputGroupText } from "@/components/ui/input-group"
import { FormIcon } from "@/components/snapp/forms/figma-form-icons"
import { FormField, FormControlSurface, FieldNotice, SearchField, ColorPickerField, SwitchField, CheckboxField, Pill, TextButton, UploadField, CommentBox, DatePickerField, NumberSelect } from "@/components/snapp/forms/form-controls"
import { SearchableCombobox } from "@/components/snapp/forms/searchable-combobox"
import { QuickActions, type QuickActionItem } from "@/components/snapp/forms/quick-actions"
import { FilterButton, FilterControl, FilterSelection } from "@/components/snapp/filters/filter-controls"
import { EditorToolbar } from "@/components/snapp/navigation/editor-toolbar"

function Case({ node, variant, children, width }: { node: string; variant: string; children: React.ReactNode; width?: number }) {
  const specimen = React.useRef<HTMLElement>(null)
  return <section ref={specimen} data-figma-node={node} data-variant={variant} style={{ width, maxWidth: "100%" }} className="flex shrink-0 flex-col items-start gap-3 rounded border border-dashed border-purple-300 bg-[#cecece] p-5"><h3 style={{ marginBottom: node === "96:9877" ? 48 : undefined }} className="flex items-center gap-3 font-snapp-inter text-xs text-slate-600">{variant}{node === "96:9877" && <Button size="sm" variant="outline" onClick={() => { const textarea = specimen.current?.querySelector("textarea"); textarea?.focus({ preventScroll: true }); textarea?.setSelectionRange(6, 13) }}>Select sample text</Button>}</h3>{children}</section>
}
const options = [1, 2, 3, 4].map(value => ({ value: String(value), label: "Selection " + value }))
const noticeText = "Catalogue Name is required to Add a new Experience View"
function Lookup({ pills = false }: { pills?: boolean }) {
  const [value, setValue] = React.useState("1")
  return <div className="flex w-full flex-col gap-2"><SearchableCombobox aria-label="Field Content" placeholder="Field Content" searchPlacement="popup" triggerLabel={value === "1" ? "Field Content" : undefined} options={options} value={value} onValueChange={setValue} />{pills && <div className="flex gap-2">{["Enterprise Service Hub", "Debit Card", "8 +"].map(label => <Pill key={label} onRemove={() => undefined}>{label}</Pill>)}</div>}</div>
}
function NumberLookup() {
  const [value, setValue] = React.useState("1"); const [number, setNumber] = React.useState<number | "">(99)
  return <NumberSelect aria-label="Field Content" searchPlacement="none" triggerLabel={value === "1" ? "Field Content" : undefined} options={options} value={value} onValueChange={setValue} number={number} onNumberChange={setNumber} numberLabel="Count" />
}
function DateExample({ inter = false }: { inter?: boolean }) {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2025, 5, 1))
  return <DatePickerField label={inter ? "Subscription Date" : "Target Completion Date"} value={date} onValueChange={setDate} variant={inter ? "inter" : "default"} />
}
function ColorPickerExample() {
  const [color, setColor] = React.useState<string>()
  return <div className="w-full" data-selected-color={color ?? ""}><ColorPickerField label="Cabinet Colour" value={color} onValueChange={setColor} /><output className="sr-only" aria-live="polite">{color ? "Selected colour " + color : "No colour selected"}</output></div>
}
function CommentToolbarExample() {
  const [formats, setFormats] = React.useState<React.ComponentProps<typeof EditorToolbar>["formats"]>([])
  const [alignment, setAlignment] = React.useState<React.ComponentProps<typeof EditorToolbar>["alignment"]>("center")
  return <EditorToolbar formats={formats} alignment={alignment} onFormatsChange={setFormats} onAlignmentChange={setAlignment} />
}
function FieldExample({ name }: { name: string }) {
  if (name === "Error") return <div className="w-168"><FieldNotice>{noticeText}</FieldNotice></div>
  if (name === "Error Multiple") return <FieldNotice messages={[noticeText, "Description is required to Add a new Experience View", ...Array(3).fill("Restrict Access is required to Add a new Experience View")]} />
  if (["Positive Notice", "Warning", "Notice", "General Message"].includes(name)) return <div className={name === "Positive Notice" || name === "Warning" ? "w-168" : "w-full"}><FieldNotice tone={name === "Positive Notice" ? "success" : name === "Warning" ? "warning" : name === "Notice" ? "info" : "general"}>{noticeText}</FieldNotice></div>
  if (name === "Date Picker") return <DateExample />
  if (name === "Colour Picker") return <ColorPickerExample />
  if (name === "Upload" || name === "Large Uploader") return <UploadField label={name === "Upload" ? "Icon" : "Upload Certificate"} large={name === "Large Uploader"} hint="PDF, JPG, or PNG (max 10MB)" />
  if (name === "Switch") return <SwitchField label="Switch" defaultChecked />
  if (name === "Checkbox") return <CheckboxField label="Selection" />
  if (name === "Search" || name === "Inline Search") return <SearchField label={name === "Search" ? "Search" : undefined} aria-label="Search" />
  if (name.startsWith("Comment Box")) return <CommentBox aria-label="Comment" defaultValue={name === "Comment Box Edit" ? "Add a comment" : undefined} actions={name === "Comment Box Buttons" && <><TextButton>Approve</TextButton><TextButton icon="requestChanges">Request Changes</TextButton><TextButton tone="reject" icon="reject">Request Changes</TextButton><TextButton icon="defer">Defer</TextButton></>} toolbar={name === "Comment Box Edit" && <CommentToolbarExample />} />
  const required = ["Required Field", "Error Field", "Is Selected"].includes(name)
  return <FormField label={required || name === "Is Disabled" ? "Field Content" : name === "Colour Picker" ? "Cabinet Colour" : "Field Name"} required={required}>
    {name === "Text Entry" ? <Textarea variant="form" placeholder="Field Content" /> : name.includes("Drop") || name === "Number select" ? (name === "Number select" ? <NumberLookup /> : <Lookup pills={name === "Drop down with pills"} />) : name === "Is Selected" || name === "Error Field" ? <FormControlSurface selected={name === "Is Selected"} invalid={name === "Error Field"} end={<FormIcon name="chevronField" />}><Input placeholder="Field Content" aria-invalid={name === "Error Field"} /></FormControlSurface> : <Input placeholder="Field Content" disabled={name === "Is Disabled"} />}
  </FormField>
}
function ModalExample({ size, node }: { size: "lg" | "md" | "sm"; node: string }) {
  // Source instances occupy 65px while their visible children reach 69px.
  // Keep that sample layout here; generic product fields remain content-driven.
  const field = (key: string, width?: number) => <FormField key={key} label="Field Name" className="h-16.25 shrink-0 [&>input]:shrink-0" style={{ width, maxWidth: "100%" }}><Input placeholder="Field Content" /></FormField>
  return <Dialog><DialogTrigger asChild><Button size="sm">Open modal {size}</Button></DialogTrigger><DialogContent size={size} data-figma-node={node}><DialogHeader><DialogTitle>Heading Text</DialogTitle></DialogHeader>{Array.from({ length: 12 }, (_, index) => <React.Fragment key={index}>{size === "sm" && index === 2 && <span className="h-4 shrink-0 text-xs leading-4 text-snapp-text-secondary">Field Content</span>}{index === 4 || index === 5 ? <div className="grid shrink-0 grid-cols-2 gap-6">{field("left")}{field("right")}</div> : field("field", size === "lg" ? 670 : undefined)}</React.Fragment>)}<DialogFooter><Button variant="outline">Button Text</Button><Button>Button Text</Button></DialogFooter></DialogContent></Dialog>
}
const quickTree: QuickActionItem[] = [{ id: "descriptors", label: "Descriptors", children: [{ id: "titles", label: "Titles", children: ["H1", "H2", "H3", "H3"].map((label, index) => ({ id: String(index), label, icon: "quickAdd" })) }, ...["Descriptions", "Descriptions", "Descriptions"].map((label, index) => ({ id: String(index), label, children: [{ id: "item", label: "Item", icon: "quickAdd" as const }] }))] }, ...["Sections", "Fields", "Elements"].map(label => ({ id: label, label, children: [{ id: "item", label: "Item", icon: "quickAdd" as const }] }))]
function QuickExample({ name }: { name: string }) {
  const compact = ["Time", "Action", "No title"].includes(name)
  const labels = name === "Time" ? ["1 hour", "2 hours", "4 hours"] : name === "Action" ? ["Item", "Learning Item", "Learning Item"] : ["Action", "Action", "Action"]
  return <QuickActions title={name === "No title" ? undefined : name === "Time" ? "Quick Add Time" : name === "Action" ? "Quick Add - Title" : "Quick Add"} compact={compact} items={compact ? labels.map((label, index) => ({ id: String(index), label, icon: "quickAdd" })) : quickTree}><Button variant="outline" size="sm">Open {name}</Button></QuickActions>
}
function SelectExample({ selected = false }: { selected?: boolean }) { return <Select defaultValue={selected ? "Apple" : undefined}><SelectTrigger><SelectValue placeholder="Select a fruit" /></SelectTrigger><SelectContent><SelectGroup><SelectLabel>Fruits</SelectLabel>{["Apple", "Banana", "Blueberry", "Grapes", "Pineapple"].map(fruit => <SelectItem key={fruit} value={fruit}>{fruit}</SelectItem>)}</SelectGroup></SelectContent></Select> }
function InputGroupExample({ kind }: { kind: number }) {
  if (kind === 3) return <InputGroup className="w-86"><InputGroupTextarea placeholder="Ask, Search or Chat..." /><InputGroupAddon align="block-end" className="gap-2 pt-1.5"><InputGroupButton size="icon-xs" className="rounded-full border border-[#e5e5e5]"><FormIcon name="inputPlus" /></InputGroupButton><InputGroupText className="px-2 text-base leading-6 font-medium">Auto</InputGroupText><InputGroupText className="ml-auto text-base leading-6 font-medium">52% used</InputGroupText><span className="flex h-4 w-0 items-center justify-center"><FormIcon name="inputDivider" className="rotate-90" /></span><InputGroupButton size="icon-xs" className="rounded-full bg-[#171717] shadow-[0_1px_2px_rgb(0_0_0/0.1)]"><FormIcon name="inputSend" /></InputGroupButton></InputGroupAddon></InputGroup>
  return <InputGroup className="w-86">{kind === 1 ? <InputGroupAddon><FormIcon name="inputSearch" /></InputGroupAddon> : kind === 2 ? <InputGroupAddon><InputGroupText className="font-medium">https://</InputGroupText></InputGroupAddon> : null}<InputGroupInput placeholder={kind === 1 ? "Search..." : kind === 2 ? "example.com" : "@shadcn"} /><InputGroupAddon align="inline-end">{kind === 1 ? <InputGroupText className="font-medium">12 results</InputGroupText> : <FormIcon name={kind === 2 ? "inputInfo" : "inputVerified"} />}</InputGroupAddon></InputGroup>
}
const filterCategories = [{ id: "client", label: "Client", icon: "person" as const, options: [{ value: "a", label: "Client A" }] }, { id: "context", label: "Context", icon: "book" as const, options: [{ value: "a", label: "Context A" }] }, { id: "status", label: "Status", icon: "status" as const, options: ["Not Started", "Ready", "In Progress", "Blocked", "Completed", "Cancelled"].map(label => ({ value: label, label })) }, ...[["Business Domain", "building"], ["Capability", "wrench"], ["Learning Path", "branch"], ["Table", "table"]].map(([label, icon]) => ({ id: label, label, icon: icon as "building", options: [{ value: "a", label: "Option A" }] }))]
function FilterExample({ selection = false }: { selection?: boolean }) {
  const [filters, setFilters] = React.useState(selection ? [] : [{ id: "progress", categoryId: "status", value: "In Progress" }])
  // The 224px Figma selection frame has five choices; its later six-choice
  // add-filter frame includes Not Started. These are specimen data, not UI rules.
  const categories = selection ? filterCategories.map(category => category.id === "status" ? { ...category, options: category.options.filter(option => option.value !== "Not Started") } : category) : filterCategories
  return <FilterControl categories={categories} filters={filters} onFiltersChange={setFilters} />
}
const buttonCases = [{ "id": "1:3049", "appearance": "primary", "state": "Standard" }, { "id": "243:2123", "appearance": "primary", "state": "Hover" }, { "id": "243:2125", "appearance": "primary", "state": "Focus" }, { "id": "243:2127", "appearance": "primary", "state": "Pressed" }, { "id": "243:2129", "appearance": "primary", "state": "Disabled" }, { "id": "1:3051", "appearance": "outline", "state": "Standard" }, { "id": "243:2133", "appearance": "outline", "state": "Hover" }, { "id": "243:2137", "appearance": "outline", "state": "Focus" }, { "id": "243:2167", "appearance": "outline", "state": "Pressed" }, { "id": "243:2171", "appearance": "outline", "state": "Disabled" }, { "id": "1:3053", "appearance": "secondary", "state": "Standard" }, { "id": "243:2149", "appearance": "secondary", "state": "Hover" }, { "id": "243:2153", "appearance": "secondary", "state": "Focus" }, { "id": "243:2157", "appearance": "secondary", "state": "Pressed" }, { "id": "243:2161", "appearance": "secondary", "state": "Disabled" }, { "id": "248:2188", "appearance": "text", "state": "Standard" }, { "id": "248:2192", "appearance": "text", "state": "Hover" }, { "id": "248:2196", "appearance": "text", "state": "Focus" }, { "id": "248:2200", "appearance": "text", "state": "Pressed" }, { "id": "248:2204", "appearance": "text", "state": "Disabled" }]
const fieldCases = [{ "id": "13:1295", "name": "Standard Field" }, { "id": "13:1297", "name": "Required Field" }, { "id": "255:2210", "name": "Is Disabled" }, { "id": "13:1301", "name": "Error Field" }, { "id": "248:2179", "name": "Is Selected" }, { "id": "13:1305", "name": "Look up/Drop Down" }, { "id": "127:1943", "name": "Drop down Open" }, { "id": "153:2212", "name": "Number select" }, { "id": "13:1312", "name": "Drop down with pills" }, { "id": "13:1355", "name": "Text Entry" }, { "id": "13:1399", "name": "Error" }, { "id": "13:1383", "name": "Error Multiple" }, { "id": "311:2855", "name": "Positive Notice" }, { "id": "311:2863", "name": "Warning" }, { "id": "13:1434", "name": "Notice" }, { "id": "313:2933", "name": "General Message" }, { "id": "13:1413", "name": "Date Picker" }, { "id": "19:1588", "name": "Upload" }, { "id": "23:1804", "name": "Colour Picker" }, { "id": "13:1463", "name": "Large Uploader" }, { "id": "13:1482", "name": "Switch" }, { "id": "158:2394", "name": "Checkbox" }, { "id": "35:2080", "name": "Inline Search" }, { "id": "36:4528", "name": "Search" }, { "id": "96:9862", "name": "Comment Box" }, { "id": "96:9877", "name": "Comment Box Edit" }, { "id": "96:9937", "name": "Comment Box Buttons" }]
export function FormsLibraryPreview() {
  return <div className="flex flex-col items-start gap-6 p-6 font-sans text-sm leading-5">
    <div className="flex flex-wrap items-start gap-3">{buttonCases.map(item => <Case key={item.id} node={item.id} variant={"Button/" + item.appearance + "/" + item.state}><Button variant={item.appearance as "primary"} disabled={item.state === "Disabled"} data-preview-state={item.state.toLowerCase()}>Button Text</Button></Case>)}</div>
    {fieldCases.map(item => <Case key={item.id} node={item.id} variant={"Fields/" + item.name} width={712}><div className="w-full"><FieldExample name={item.name} /></div></Case>)}
    <div className="flex gap-4">{["Off", "On"].map((name, index) => <Case key={name} node={index ? "13:1548" : "13:1542"} variant={"Switch/" + name}><SwitchField label="Airplane mode" defaultChecked={index === 1} /></Case>)}</div>
    <div className="flex gap-4">{(["lg", "md", "sm"] as const).map((size, index) => <Case key={size} node={["19:1601", "19:1648", "19:1698"][index]} variant={"Modal/" + size}><ModalExample size={size} node={["19:1601", "19:1648", "19:1698"][index]} /></Case>)}</div>
    <div className="flex gap-4">{(["standard", "white"] as const).map((name, index) => <Case key={name} node={index ? "26:1900" : "26:1898"} variant={"Pill/" + name}><Pill variant={name} onRemove={() => undefined}>Enterprise Service Hub</Pill></Case>)}</div>
    <div className="flex flex-wrap gap-4">{["1 Level", "2 Levels", "3 Levels", "Time", "Action", "No title"].map((name, index) => <Case key={name} node={["36:4344", "36:4388", "36:4428", "36:4479", "36:4512", "38:4550"][index]} variant={"Quick Actions/" + name}><QuickExample name={name} /></Case>)}</div>
    <div className="flex gap-4">{["Default", "Open"].map((name, index) => <Case key={name} node={index ? "49:4999" : "49:4992"} variant={"Picker with Input/" + name}><DateExample inter /></Case>)}</div>
    <div className="flex gap-4">{["Default", "Open"].map((name, index) => <Case key={name} node={index ? "49:5120" : "49:5115"} variant={"Select/" + name}><SelectExample selected={index === 1} /></Case>)}</div>
    {[1, 2, 3, 4].map((kind, index) => <Case key={kind} node={["49:5144", "49:5151", "49:5158", "49:5175"][index]} variant={"Input Group/" + kind}><InputGroupExample kind={kind} /></Case>)}
    <Case node="49:5180" variant="Default"><CheckboxField variant="inter" label="Accept terms and conditions" /></Case>
    <div className="flex gap-4">{["Default", "Invert", "Reject", "Disable", "Hover"].map((name, index) => <Case key={name} node={["69:9405", "69:9407", "69:9411", "69:9415", "74:9427"][index]} variant={"Text Button/" + name}><TextButton tone={name === "Invert" ? "invert" : name === "Reject" ? "reject" : "default"} disabled={name === "Disable"} data-preview-state={name.toLowerCase()}>Approve</TextButton></Case>)}</div>
    <div className="flex flex-wrap gap-4">{["Filter Button", "Hover", "Filter Open", "Filter Selection", "Filtered", "Filter Applied", "Add Filter Open", "Add Filter Open 2"].map((name, index) => <Case key={name} node={["102:10660", "248:2206", "102:10662", "102:10739", "102:10810", "102:10814", "102:10929", "102:11018"][index]} variant={"Filter Button/" + name}>{index < 2 ? <FilterButton data-preview-state={name.toLowerCase()} /> : <FilterExample selection={index === 3} />}</Case>)}</div>
    <div className="flex flex-wrap gap-4">{["Default", "Unchecked", "Checked", "No Icon Unselected", "No Icon Selected"].map((name, index) => <Case key={name} node={["112:11236", "112:11238", "112:11254", "112:11359", "112:11419"][index]} variant={"Filter Selection/" + name}>{[false, true].map(draggable => <div key={String(draggable)} className="w-33.75"><FilterSelection draggable={draggable} icon={index > 2 ? null : "person"} checked={index === 0 ? undefined : index === 2 || index === 4} onCheckedChange={() => undefined}>Client</FilterSelection></div>)}</Case>)}</div>
    <div className="flex gap-4">{["Default", "Selected"].map((name, index) => <Case key={name} node={index ? "158:2385" : "158:2383"} variant={"Checkbox/" + name}><CheckboxField label="Selection" defaultChecked={index === 1} /></Case>)}</div>
    {/* Property contracts are separate from the 89 Figma variant wrappers. */}
    <div data-qa-number-disabled className="w-86"><NumberSelect aria-label="Disabled lookup" options={options} value="1" onValueChange={() => undefined} number={99} onNumberChange={() => undefined} numberLabel="Disabled count" disabled /></div>
    <div data-qa-color-disabled className="w-86"><ColorPickerField label="Disabled colour" defaultValue="#12ab34" disabled /></div>
  </div>
}
