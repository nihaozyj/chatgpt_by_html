/**
 * @param {string} base_url 接口地址
 * @param {string} apiKey 接口密钥
 * @param {(status: 'success'|'error'|'complete', message: string, error: string) => void} callback 回调函数，接收三个参数：状态，消息内容，错误信息
 */
async function chat(base_url, apiKey, callback) {
  try {
    const response = await fetch(base_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o', // 或 'gpt-4omini'
        messages: [
          { role: 'user', content: '你好，GPT！' }
        ],
        stream: true // 开启流式响应
      })
    });

    if (!response.ok) {
      callback('error', null, `HTTP error! status: ${response.status}`);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let result = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });

      // 处理流式响应，提取消息文本
      const messages = result.split('\n').filter(line => line.trim() !== '');
      for (const message of messages) {
        try {
          const parsedMessage = JSON.parse(message);
          if (parsedMessage.choices && parsedMessage.choices.length > 0) {
            const content = parsedMessage.choices[0].delta.content || '';
            callback('success', content, null);
          }
        } catch (e) {
          callback('error', null, `解析消息时出错: ${e.message}`);
        }
      }
    }
    // 最后返回完整的结果
    callback('complete', result, null);
  } catch (error) {
    callback('error', null, `请求过程中发生错误: ${error.message}`);
  }
}


export {
  chat
};
