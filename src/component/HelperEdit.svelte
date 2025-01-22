<script>
  import { createEventDispatcher } from 'svelte';
  import ResizableModal from './ResizableModal.svelte';
  import * as db from '../js/db.js';
  import * as Ag from '../js/agent.js';
  import util from '../js/utils.js';

  export let isOpen = false;
  export let title = '修改智能体';
  export let agent;

  // 为true时，表示不进行提交，点击保存后，通过事件返回修改后的智能体数据
  export let isSave = false;

  // 解决上一个版本的历史记录中可能没有max_tokens属性的问题
  'max_tokens' in agent || (agent.max_tokens = 100);

  const dispatch = createEventDispatcher();

  $: if (isOpen) {
    db.isSpaceBarFocused.set(false);
    if (!agent && isSave) isOpen = false;
  } else {
    db.isSpaceBarFocused.set(true);
    if (agent && typeof agent === 'object') {
      const _agent = JSON.parse(JSON.stringify(agent));
      dispatch('close', _agent);
    } else {
      dispatch('close', null);
    }
  }

  function save() {
    const _agent = Ag.Agent.createAgent();
    // 校验智能体名称
    if (!agent.name) {
      agent.name = _agent.name;
    }
    // 校验智能体设定
    agent.setting = agent.setting.trim();
    // 校验对话模型
    if (!Ag.modelList.includes(agent.model) && !util.filter(agent.custom_model_list).includes(agent.model)) {
      agent.model = Ag.modelList[0]; // 默认选择第一个模型
    }
    // 校验请求地址
    if (!agent.base_url) {
      agent.base_url = _agent.base_url;
    }
    // 校验请求密钥
    if (!agent.api_key) {
      console.error('请填写请求密钥！');
    }
    // 校验采样温度(将输入值转换为数字)
    agent.temperature = Number(agent.temperature);
    if (isNaN(agent.temperature) || agent.temperature < 0 || agent.temperature > 2) {
      agent.temperature = 1; // 默认值
    }
    // 校验核心采样(将输入值转换为数字)
    agent.top_p = Number(agent.top_p);
    if (isNaN(agent.top_p) || agent.top_p < 0 || agent.top_p > 1) {
      agent.top_p = 1; // 默认值
    }
    // 校验频率惩罚(将输入值转换为数字)
    agent.frequency_penalty = Number(agent.frequency_penalty);
    if (isNaN(agent.frequency_penalty) || agent.frequency_penalty < -2 || agent.frequency_penalty > 2) {
      agent.frequency_penalty = 0; // 默认值
    }
    // 校验附带历史消息数(将输入值转换为数字)
    agent.lst_message_num = Number(agent.lst_message_num);
    if (isNaN(agent.lst_message_num) || agent.lst_message_num < 0) {
      agent.lst_message_num = 2; // 默认值
    }

    if (!isSave) {
      try {
        db.updateData(db.storeNames.agents, agent);
        isOpen = false;
      } catch (e) {
        console.error('数据存储失败！', e);
      }
    } else {
      isOpen = false;
    }
  }

  function calcel() {
    agent = null;
    isOpen = false;
  }
</script>

<ResizableModal {isOpen} width={1} height={1}>
  <div class="popups-setting">
    <div class="content">
      <form id="setting-form" action="javascript:void(0);">
        <div class="header">
          <button on:click={calcel} class="iconfont">&#xe6ff; 返回</button>
          <h1>{title}</h1>
          <button class="iconfont" on:click={save}>&#xe62b; 保存</button>
        </div>
        <!-- 设置内容 -->
        <div class="setting-content">
          {#if agent}
            <div class="item">
              <span>智能体名称</span>
              <input bind:value={agent.name} type="text" placeholder="请输入智能体名称" />
            </div>
            <div class="item">
              <span>智能体设定</span>
              <textarea bind:value={agent.setting} name="" id="" placeholder="请输入智能体设定"></textarea>
            </div>
            <div class="item">
              <span>对话模型</span>
              <select bind:value={agent.model}>
                {#each [...util.filter(agent.custom_model_list), ...Ag.modelList] as model}
                  <option value={model}>{model}</option>
                {/each}
              </select>
            </div>
            <div class="item">
              <span>请求地址(baseurl)</span>
              <input bind:value={agent.base_url} type="text" placeholder="示例:https://api.openai.com/v1" />
            </div>
            <div class="item">
              <span>请求密钥(apikey)</span>
              <input bind:value={agent.api_key} type="text" placeholder="密钥，必填！" />
            </div>
            <div class="item">
              <span>自定义模型</span>
              <input bind:value={agent.custom_model_list} type="text" placeholder="例: gpt4,o1-mini" />
            </div>
            <div class="item">
              <span>采样温度(temperature)</span>
              <input bind:value={agent.temperature} type="text" placeholder="取值 [0,2]，默认为1" />
            </div>
            <div class="item">
              <span>核心采样(top_p)</span>
              <input bind:value={agent.top_p} type="text" placeholder="取值 [0,1]，默认为1" />
            </div>
            <div class="item">
              <span>频率惩罚(frequency_penalty)</span>
              <input bind:value={agent.frequency_penalty} type="text" placeholder="取值 [-2,2]，默认为0" />
            </div>
            <div class="item">
              <span>附带历史消息数</span>
              <input bind:value={agent.lst_message_num} type="text" placeholder="携带的上下文条数" />
            </div>

            <div class="item">
              <span>最大回复长度</span>
              <input bind:value={agent.max_tokens} type="number" placeholder="最大回复长度(max_tokens)" />
            </div>
          {/if}
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
    font-size: 1.5em;
  }

  .popups-setting * {
    background-color: var(--color-bg);
    color: var(--color-text);
    font-size: 0.875em;
  }

  .popups-setting select,
  .popups-setting textarea,
  .popups-setting input[type='number'],
  .popups-setting input[type='text'] {
    width: 70%;
    line-height: 1.5em;
    caret-color: var(--color-text);
    border: 1px solid var(--color-border);
    padding: 0.5em 1em;
    min-width: 100px;
  }

  /* 移除 type="number" 输入框的上下箭头 */
  input[type='number'] {
    -moz-appearance: textfield; /* Firefox */
    appearance: textfield; /* 标准属性 */
  }

  /* 移除 Webkit 浏览器（如 Chrome、Safari）中的上下箭头 */
  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .popups-setting select {
    outline: none;
    border-radius: 5px;
  }

  .popups-setting textarea {
    resize: none;
    max-height: calc(1.5em * 6);
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
    font-size: 1em;
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
    content: ':';
  }
</style>
