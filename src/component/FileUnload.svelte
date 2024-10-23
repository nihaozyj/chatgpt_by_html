<script>
  import { createEventDispatcher, onMount } from "svelte";

  let fileInput;
  let fileFrom;
  let files = []; // 存储选择的文件

  let show = false;

  const daspach = createEventDispatcher();

  onMount(() => {
    fileFrom.addEventListener("submit", async (event) => {
      event.preventDefault();
      const result = await processFiles();
      console.log(result);
      show = true;
      setTimeout(() => {
        daspach("file-upload-result", result);
      }, 300);
    });
  });

  function close() {
    show = true;
    setTimeout(() => {
      daspach("close");
    }, 300);
  }

  function handleFileChange(event) {
    const selectedFiles = Array.from(event.target.files);
    files = [...files, ...selectedFiles].reverse(); // 添加新选择的文件
  }

  function removeFile(index) {
    files = files.filter((_, i) => i !== index); // 移除指定索引的文件
  }

  async function processFiles() {
    const results = [];
    for (let file of files) {
      const fileType = file.type.split("/")[0]; // 获取文件类型
      if (fileType === "image") {
        // 检查文件大小，假设限制为 3MB
        if (file.size > 3 * 1024 * 1024) {
          file = await compressImage(file); // 压缩文件
        }
        const base64 = await convertToBase64(file);
        results.push({ type: "img", content: base64, name: file.name });
      } else if (fileType === "text") {
        const textContent = await readTextFile(file);
        results.push({ type: "txt", content: textContent, name: file.name });
      }
      // 对于其他类型的文件，不做处理
    }
    return results;
  }

  function convertToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file); // 将文件读取为 Data URL
    });
  }

  function readTextFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(file); // 将文件读取为文本
    });
  }

  async function compressImage(file, maxWidth = 1280, maxHeight = 720) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (event) => {
        img.src = event.target.result;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // 计算压缩后的宽高
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // 绘制图像到 canvas
        ctx.drawImage(img, 0, 0, width, height);

        // 将 canvas 转换为 Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: file.type })); // 返回压缩后的文件
            } else {
              reject(new Error("压缩失败"));
            }
          },
          file.type,
          0.7,
        ); // 0.7 是压缩质量，范围 0-1
      };

      img.onerror = (error) => {
        reject(error);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file); // 读取文件为 Data URL
    });
  }
</script>

<main class={`modal ${show ? "fadeOut" : "fadeIn"}`}>
  <div class="modal-content input">
    <form id="uploadForm" enctype="multipart/form-data" bind:this={fileFrom}>
      <div class="header">
        <button data-tyle="cancel" type="button" on:click={close}>放弃</button>
        <h2>选择文件</h2>
        <button data-tyle="enter" type="submit">插入</button>
      </div>
      <div class="file_box">
        <label for="fileInput">
          <input bind:this={fileInput} type="file" name="file" id="fileInput" multiple on:change={handleFileChange} />
        </label>
        <div id="fileList">
          {#each files as file, index}
            <div>
              {file.name}
              <button type="button" on:click={() => removeFile(index)}>取消选择</button>
            </div>
          {/each}
        </div>
        <div class="tips">tips: 超过3MB的图片将会压缩，其他文件会直接以文本发送，不限制大小，谨慎使用!</div>
      </div>
    </form>
  </div>
</main>

<style>
  .modal-content {
    height: 320px !important;
  }

  #fileList {
    overflow-y: auto;
    height: 140px;
    margin-top: 20px;
    padding: 0 10px;
  }

  #fileList > div {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
  }

  .file_box {
    position: relative;
  }

  label {
    height: 50px;
    display: block;
    border-radius: var(--radius);
    border: 1px solid var(--color-border);
    background-color: var(--color-code-bg);
    color: var(--color-tip-text);
    font-size: 14px;
    cursor: pointer;
  }
  label::after {
    content: "点我选择文件";
    position: absolute;
    width: 100%;
    left: 0;
    top: 14px;
    text-align: center;
    font-size: 14px;
  }

  label [type="file"] {
    visibility: hidden;
  }

  .tips {
    font-size: 12px;
    color: var(--color-tip-text);
    border-top: 1px solid var(--color-border);
    padding-top: 5px;
  }
</style>
