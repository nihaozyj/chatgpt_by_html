<script>
	import Header from "./component/Header.svelte";
	import Message from "./component/Message.svelte";
	import MsgBoxAndBtn from "./component/MsgBoxAndBtn.svelte";
	import Historys from "./component/Historys.svelte";
	import config from "./js/config.js";
	import Setting from "./component/Setting.svelte";
	import Agents from "./component/Agents.svelte";
	import eventMgr from "./js/eventMgr";
	import FileUnload from "./component/FileUnload.svelte";
	import { writable } from "svelte/store";
	import { onMount } from "svelte";

	export const settingIsOpen = writable(false);
	export const agentsIsOpen = writable(false);

	let leftWidth = config.sidebarWidth;

	let isLeftHide = config.sidebarHidden;

	// 弹出层参数
	let { on, eventType: type } = eventMgr;

	function startDrag() {
		function doDrag(e) {
			config.sidebarWidth = leftWidth = e.clientX;
		}
		function stopDrag() {
			document.removeEventListener("mousemove", doDrag);
			document.removeEventListener("mouseup", stopDrag);
			document.body.style.userSelect = "auto";
		}
		document.addEventListener("mousemove", doDrag);
		document.addEventListener("mouseup", stopDrag);
	}

	on(type.OPEN_SETTING_PANEL, function () {
		settingIsOpen.set(true);
	});

	on(type.OPEN_AGENT_LIST, () => {
		agentsIsOpen.set(true);
	});

	eventMgr.on(type.TOGGLE_SIDEBAR, (data) => {
		config.sidebarHidden = isLeftHide = !isLeftHide;
	});

	onMount(() => {
		document.body.addEventListener("keydown", (e) => {
			if (e.ctrlKey && e.key === "b") {
				eventMgr.emit(type.TOGGLE_SIDEBAR);
			}
		});
	});
</script>

<main>
	<Historys width={leftWidth} bind:isLeftHide />
	<div class={`resizer ${!isLeftHide ? "hide" : ""}`} on:mousedown={startDrag}></div>
	<div class="right">
		<Header />
		<Message />
		<MsgBoxAndBtn />
	</div>
</main>

<!-- 设置弹窗 -->
<Setting bind:isOpen={$settingIsOpen} />
<!-- 智能体列表 -->
<Agents bind:isOpen={$agentsIsOpen} />

<style scoped>
	main {
		display: flex;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		padding: 10px;
	}

	.resizer {
		width: 6px;
		cursor: ew-resize;
		height: 110vh;
		margin-top: -10px;
		border-left: 1px solid var(--color-border);
	}

	.right {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		width: 0;
	}
</style>
