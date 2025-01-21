export function createChatApi() {
  const controller = new AbortController()
  const signal = controller.signal

  async function chat(baseUrl, apiKey, body, callback) {
    try {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body),
        signal,// 将信号传递给 fetch
        cache: 'no-store'
      })

      if (!response.ok) {
        console.error(response)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let result = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        // 处理每个数据块
        const lines = chunk.split('\n') // 按行分割
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonData = line.slice(6) // 去掉 "data: " 前缀
            if (jsonData === '[DONE]') {
              callback(null, null) // 传输完成，返回 null
              return
            }

            try {
              const parsedData = JSON.parse(jsonData)
              const content = parsedData.choices[0]?.delta?.content || ''
              result += content // 累加内容
              // 使用 try...catch 捕获回调函数中的错误
              try {
                callback(content, null) // 返回当前接收到的内容
              } catch (callbackError) {
                console.error('回调函数执行错误:', callbackError)
                // 可以选择在这里处理回调错误，例如记录日志或发送通知
              }
            } catch (error) {
              console.error('解析错误:', error)
              callback(null, '解析错误')
              console.log(line)
            }
          }
        }
      }

      // 在所有数据读取完成后，返回最终结果
      callback(result, null) // 最后一次回调，返回完整内容
    } catch (error) {
      if (error.name === 'AbortError') {
        callback(null, '请求已被取消')
      } else {
        callback(null, error.message)
      }
    }
  }

  function cancel() {
    controller.abort() // 取消请求
  }

  return { chat, cancel }
}


export function chatDeepseekReasoner() {
  const controller = new AbortController()
  const signal = controller.signal

  async function chat(baseUrl, apiKey, body, callback, callback_1) {
    let isended = false // 是否传输完成

    try {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body),
        signal,
        cache: 'no-store'
      })

      if (!response.ok) {
        console.error('HTTP错误:', response.status, response.statusText)
        throw new Error(`HTTP错误! 状态码: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let finalContent = ''
      let finalReasoning = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(line => line.trim() !== '') // 过滤空行

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue

          const jsonStr = line.slice(6)
          if (jsonStr === '[DONE]') {
            callback(null, null)       // 最终内容
            callback_1(null, null)   // 最终思维链
            return
          }

          try {
            const data = JSON.parse(jsonStr)
            const delta = data.choices[0]?.delta || {}

            // 独立处理两个字段
            if (delta.reasoning_content !== undefined) {
              const chunk = delta.reasoning_content || ''
              finalReasoning += chunk
              try {
                chunk && callback_1(chunk, null)
              } catch (e) {
                console.error('思维链回调错误:', e)
              }
            }

            if (delta.content !== undefined) {
              const chunk = delta.content || ''
              finalContent += chunk
              try {
                if (!isended) {
                  callback_1(null, null)
                  isended = true
                }
                chunk && callback(chunk, null)
              } catch (e) {
                console.error('内容回调错误:', e)
              }
            }

          } catch (error) {
            console.error('JSON解析错误:', error)
            console.error('原始数据:', jsonStr)
            callback(null, '解析错误')
            callback_1(null, '解析错误')
          }
        }
      }

    } catch (error) {
      const msg = error.name === 'AbortError' ? '请求已取消' : error.message
      callback(null, msg)
      callback_1(null, msg)
    }
  }

  function cancel() {
    controller.abort()
  }

  return { chat, cancel }
}
