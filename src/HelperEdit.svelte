<script>
  import ResizableModal from "./ResizableModal.svelte";
  export let isOpen = false;
</script>

<ResizableModal {isOpen} width={1} height={1}>
  <div class="popups-setting">
    <div class="content">
      <form id="setting-form" action="javascript:void(0);">
        <div class="header">
          <button
            on:click={() => {
              isOpen = false;
            }}
            class="iconfont">&#xe6ff; 返回</button>
          <h1>修改默认配置</h1>
          <button class="iconfont">&#xe62b; 保存</button>
        </div>
        <!-- 设置内容 -->
        <div class="setting-content">
          <div class="item">
            <span>智能体名称</span>
            <input type="text" placeholder="请输入智能体名称" />
          </div>
          <div class="item">
            <span>智能体设定</span>
            <textarea name="" id="" placeholder="请输入智能体设定"></textarea>
          </div>
          <div class="item">
            <span>对话模型</span>
            <select name="" id="">
              <option value="">请选择对话模型</option>
              <option value="">小冰</option>
              <option value="">小冰V2</option>
            </select>
          </div>
          <div class="item">
            <span>请求地址(baseurl)</span>
            <input type="text" placeholder="默认为:https://api.openai-up.com/v1" />
          </div>
          <div class="item">
            <span>请求密钥(apikey)</span>
            <input type="text" placeholder="密钥，必填！" />
          </div>
          <div class="item">
            <span>自定义模型</span>
            <input type="text" placeholder="例: gpt4,o1-mini" />
          </div>
          <div class="item">
            <span>采样温度(temperature)</span>
            <input type="text" placeholder="取值 [0,2]，默认为1" />
          </div>
          <div class="item">
            <span>核心采样(top_p)</span>
            <input type="text" placeholder="取值 [0,1]，默认为1" />
          </div>
          <div class="item">
            <span>频率惩罚(frequency_penalty)</span>
            <input type="text" placeholder="取值 [-2,2]，默认为0" />
          </div>
          <div class="item">
            <span>附带历史消息数</span>
            <input type="text" placeholder="表示携带的上下文轮次，一轮对话包含两条消息" />
          </div>
        </div>
      </form>
    </div>
  </div>
</ResizableModal>

<style>
  .popups-setting {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: var(--color-bg);
    min-width: 850px;
    min-height: 500px;
    overflow: auto;
  }

  .popups-setting * {
    background-color: var(--color-bg);
    color: var(--color-text);
    font-size: 14px;
  }

  .popups-setting select,
  .popups-setting textarea,
  .popups-setting input[type="text"] {
    width: 70%;
    line-height: 1.5em;
    caret-color: var(--color-text);
    border: 1px solid var(--color-border);
    padding: 0.5em 1em;
    min-width: 100px;
  }

  .popups-setting select {
    outline: none;
    border-radius: 5px;
  }

  .popups-setting textarea {
    resize: none;
    height: calc(1.5em * 3);
  }

  .popups-setting > .content {
    max-width: 960px;
    margin: 0 auto;
    padding: 30px;
    padding-bottom: 0;
    overflow-y: auto;
    user-select: none;
  }

  #setting-form > .header {
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
  }

  #setting-form > .header > button {
    border: 1px solid var(--color-border);
    padding: 5px 15px;
    font-size: 16px;
    color: var(--color-btn-text);
  }

  .setting-content {
    border: 1px solid var(--color-border);
    margin-top: 30px;
    padding: 10px;
    border-radius: 5px;
    overflow: auto;
    height: calc(100vh - 130px);
  }

  .setting-content > .item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 3px;
    border-bottom: 1px solid var(--color-border);
    padding: 10px 0;
  }

  .setting-content > .item:last-child {
    border-bottom: none;
  }

  .setting-content > .item > span {
    color: var(--color-secondary-text);
  }

  .setting-content > .item > span::after {
    content: ":";
  }
</style>
