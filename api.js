const apiKey = 'sk-fcc50cd5139844dfb83f4ba01d59eeb4'; // 注册 Deepseek API 的密钥

function translate(q, { from = 'auto', to = 'auto' } = { from: 'auto', to: 'auto' }) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'https://api.deepseek.com/translate', // 确认 API 地址
            method: 'POST',
            header: {
                'Content-Type': 'application/json', // 修改为 JSON
                'Authorization': `${apiKey}`
            },
            data: {
                "message": [
                    {
                        "content": 'You need to translate those sentences to Chinese',
                        "role": "system"
                    },
                    {
                        "content": `${q}`,
                        "role": "user"
                    }
                ],
                "model": "deepseek-chat",
                "frequency_penalty": 0,
                "max_tokens": 2048,
                "response_format": {
                    "type": "text"
                },
                "temperature": 1.3,
                "top_p": 1,
            },
            success(res) {
                if (res.data && res.data.translations) {
                    resolve(res.data.translations);
                } else {
                    reject({ status: 'error', msg: '翻译失败' });
                    wx.showToast({
                        title: '翻译失败',
                        icon: 'none',
                        duration: 3000
                    });
                }
            },
            fail() {
                reject({ status: 'error', msg: '翻译失败' });
                wx.showToast({
                    title: '网络异常',
                    icon: 'none',
                    duration: 3000
                });
            }
        });
    });
}
