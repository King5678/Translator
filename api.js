const apiKey = 'sk-4fdba1b308d34ebeb4a389e6265136c4';

function translate(q, { from = 'auto', to = 'auto' } = { from: 'auto', to: 'auto' }) {
    return new Promise((resolve, reject) => {
        // 设置请求的 payload 数据
        const payload = {
            model: "deepseek-chat",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: `请将以下文本从${from}翻译成${to}：${q}` }
            ],
            stream: false
        };

        // 发起 wx.request 请求
        wx.request({
            url: 'https://api.deepseek.com/chat/completions',
            method: 'POST',
            header: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            data: payload, // 直接传递对象数据
            timeout: 10000, // 设置超时时间，单位为毫秒
            success(res) {
                if (res.statusCode === 200 && res.data && res.data.choices && res.data.choices[0].message.content) {
                    
                    // 提取并返回 DeepSeek 的翻译结果
                    const translatedContent = res.data.choices[0].message.content;
                    resolve(translatedContent);
                } else {
                    // 处理 DeepSeek API 返回数据不完整的情况
                    reject({ status: 'error', msg: '翻译失败，状态码：' + res.statusCode });
                    wx.showToast({
                        title: '翻译失败',
                        icon: 'none',
                        duration: 3000
                    });
                }
            },
            fail(err) {
                // 请求失败处理，包含具体错误消息
                reject({ status: 'error', msg: `请求失败：${err.errMsg}` });
                wx.showToast({
                    title: '网络异常',
                    icon: 'none',
                    duration: 3000
                });
            }
        });
    });
}
