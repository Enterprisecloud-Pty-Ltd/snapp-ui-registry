import dismiss12 from "@/assets/snapp/forms/2f239.svg";
import approve from "@/assets/snapp/forms/f7b63.svg";
import chevronField from "@/assets/snapp/forms/b7931.svg";
import chevronDownField from "@/assets/snapp/forms/43304.svg";
import chevronUpField from "@/assets/snapp/forms/85373.svg";
import search16 from "@/assets/snapp/forms/5ccad.svg";
import selection20 from "@/assets/snapp/forms/cac04.svg";
import error20 from "@/assets/snapp/forms/46297.svg";
import success20 from "@/assets/snapp/forms/fe229.svg";
import warning20 from "@/assets/snapp/forms/1ddae.svg";
import info20 from "@/assets/snapp/forms/18abf.svg";
import general20 from "@/assets/snapp/forms/a98ab.svg";
import calendar20 from "@/assets/snapp/forms/ca494.svg";
import upload20 from "@/assets/snapp/forms/af529.svg";
import eyedropper20 from "@/assets/snapp/forms/04a5a.svg";
import upload24 from "@/assets/snapp/forms/04372.svg";
import search20 from "@/assets/snapp/forms/281df.svg";
import bold from "@/assets/snapp/forms/7e97e.svg";
import italic from "@/assets/snapp/forms/04586.svg";
import underline from "@/assets/snapp/forms/5414c.svg";
import orderedList from "@/assets/snapp/forms/d2380.svg";
import unorderedList from "@/assets/snapp/forms/3cdee.svg";
import alignLeft from "@/assets/snapp/forms/314dc.svg";
import alignCenter from "@/assets/snapp/forms/c29fc.svg";
import alignRight from "@/assets/snapp/forms/0720f.svg";
import commentDivider from "@/assets/snapp/forms/f2794.svg";
import requestChanges from "@/assets/snapp/forms/c7ec0.svg";
import reject from "@/assets/snapp/forms/7de11.svg";
import defer from "@/assets/snapp/forms/089d9.svg";
import dismiss24 from "@/assets/snapp/forms/bed95.svg";
import submenuChevron from "@/assets/snapp/forms/bdb38.svg";
import quickAdd from "@/assets/snapp/forms/2e911.svg";
import calendar16 from "@/assets/snapp/forms/aa14a.svg";
import calendarPrevious from "@/assets/snapp/forms/cad1d.svg";
import calendarChevron from "@/assets/snapp/forms/d601f.svg";
import calendarNext from "@/assets/snapp/forms/3ac06.svg";
import selectChevron from "@/assets/snapp/forms/fb5ec.svg";
import selectCheck from "@/assets/snapp/forms/75657.svg";
import inputSearch from "@/assets/snapp/forms/4e8e8.svg";
import inputInfo from "@/assets/snapp/forms/4e21d.svg";
import inputPlus from "@/assets/snapp/forms/353a2.svg";
import inputDivider from "@/assets/snapp/forms/a0f15.svg";
import inputSend from "@/assets/snapp/forms/93986.svg";
import inputVerified from "@/assets/snapp/forms/edb53.svg";
import approveReject from "@/assets/snapp/forms/b2167.svg";
import approveInvert from "@/assets/snapp/forms/6d339.svg";
import approveDisabled from "@/assets/snapp/forms/901a5.svg";
import approveHover from "@/assets/snapp/forms/ccfd4.svg";
import draggable from "@/assets/snapp/forms/9cb34.svg";
import person from "@/assets/snapp/forms/dd133.svg";
import filter from "@/assets/snapp/forms/8befd.svg";
import filterSearch from "@/assets/snapp/forms/91d33.svg";
import filterDivider from "@/assets/snapp/forms/4a221.svg";
import book from "@/assets/snapp/forms/e9e37.svg";
import status from "@/assets/snapp/forms/c9690.svg";
import building from "@/assets/snapp/forms/ceace.svg";
import wrench from "@/assets/snapp/forms/8b12b.svg";
import branch from "@/assets/snapp/forms/47f1b.svg";
import table from "@/assets/snapp/forms/187bf.svg";
import back from "@/assets/snapp/forms/97161.svg";
import checkboxCheck from "@/assets/snapp/forms/73dfa.svg";
import filterDismiss from "@/assets/snapp/forms/2b288.svg";
import filterAdd from "@/assets/snapp/forms/cad5e.svg";
import filterGroupDivider from "@/assets/snapp/forms/f5e29.svg";

const formIconSources = {
	dismiss12,
	approve,
	chevronField,
	chevronDownField,
	chevronUpField,
	search16,
	selection20,
	error20,
	success20,
	warning20,
	info20,
	general20,
	calendar20,
	upload20,
	eyedropper20,
	upload24,
	search20,
	bold,
	italic,
	underline,
	orderedList,
	unorderedList,
	alignLeft,
	alignCenter,
	alignRight,
	commentDivider,
	requestChanges,
	reject,
	defer,
	dismiss24,
	submenuChevron,
	quickAdd,
	calendar16,
	calendarPrevious,
	calendarChevron,
	calendarNext,
	selectChevron,
	selectCheck,
	inputSearch,
	inputInfo,
	inputPlus,
	inputDivider,
	inputSend,
	inputVerified,
	approveReject,
	approveInvert,
	approveDisabled,
	approveHover,
	draggable,
	person,
	filter,
	filterSearch,
	filterDivider,
	book,
	status,
	building,
	wrench,
	branch,
	table,
	back,
	checkboxCheck,
	filterDismiss,
	filterAdd,
	filterGroupDivider,
} as const;

type FormIconName = keyof typeof formIconSources;

export { formIconSources };
export type { FormIconName };
