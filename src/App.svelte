<script>
	import Header from "./Header.svelte";
	import Message from "./Message.svelte";
	import MsgBoxAndBtn from "./MsgBoxAndBtn.svelte";
	import Historys from "./Historys.svelte";
	import config from "./config.js";
	import HelperEdit from "./HelperEdit.svelte";

	let leftWidth = config.sidebarWidth;

	function startDrag(event) {
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

	let isOpen = true;
</script>

<main>
	<Historys width={leftWidth} />
	<div class="resizer" on:mousedown={startDrag}></div>
	<div class="right">
		<Header />
		<Message />
		<MsgBoxAndBtn />
	</div>
</main>

<!-- 设置弹窗 -->
<HelperEdit {isOpen} />

<style scoped>
	main {
		display: flex;
		width: 100vw;
		height: 100vh;
		min-width: 850px;
		min-height: 500px;
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
