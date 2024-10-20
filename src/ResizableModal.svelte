<script>
  /** 控制弹窗是否显示 */
  export let isOpen = false;
  /** 内容区域的尺寸，小于1为百分比，大于1为像素 */
  export let width = 0.5;
  export let height = 0.5;

  $: _width = width > 1 ? `${width}px` : `${width * 100}%`;
  $: _height = height > 1 ? `${height}px` : `${height * 100}%`;
</script>

<main class:open={isOpen}>
  <div class="content" style="width: {_width}; height: {_height};">
    <slot></slot>
  </div>
</main>

<style>
  main {
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    position: absolute;
    left: 0;
    top: 0;
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 0.5s ease,
      visibility 0.5s ease;
  }

  .open {
    visibility: visible;
    opacity: 1;
  }
</style>
