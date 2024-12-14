const app = getApp();
const apiKey = "sk-5275544707394201ac76ea70e7872f28"; // 替换为实际的 API 密钥

Page({
  data: {
    result: '',
    translatedResult: '',
    recorderManager: null,
    audioFilePath: '',
    sourceLanguage: 'en', // 源语言默认值
    targetLanguage: 'zh', // 目标语言默认值
    languages: ['zh', 'en', 'fr', 'de'] // 支持的语言列表
  },

  onLoad() {
    this.initRecorder();
  },
  

  initRecorder() {
    this.setData({
      recorderManager: wx.getRecorderManager()
    });

    this.data.recorderManager.onStart(() => {
      console.log('录音开始');
    });

    this.data.recorderManager.onStop((res) => {
      console.log('录音结束', res);
      this.data.audioFilePath = res.tempFilePath;
      this.uploadAudio(res.tempFilePath);
    });
  },

  startRecording() {
    const options = {
      duration: 60000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
      format: 'm4a'
    };
    this.data.recorderManager.start(options);
  },

  stopRecording() {
    this.data.recorderManager.stop();
  },

  getAccessToken: function() {
    return new Promise((resolve, reject) => {
      const AK = "ZvUFDMQBpRn2nVwfteh4qcMS"; 
      const SK = "5CtKraOlQTiTrmGszUKwnmGE6MYt318Y";

      wx.request({
        url: 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=' + AK + '&client_secret=' + SK,
        method: 'POST',
        success: function(res) {
          if (res.data && res.data.access_token) {
            resolve(res.data.access_token);
          } else {
            reject('获取 Access Token 失败');
          }
        },
        fail: function(error) {
          reject(error);
        }
      });
    });
  },

  uploadAudio(filePath) {
    wx.getFileSystemManager().readFile({
      filePath: filePath,
      encoding: 'base64',
      success: (res) => {  // 使用箭头函数
        const audioData = res.data;
  
        wx.getFileSystemManager().getFileInfo({
          filePath: filePath,
          success: (info) => {  // 使用箭头函数
            const len = info.size;
  
            this.getAccessToken().then(token => {
              wx.request({
                url: 'https://vop.baidu.com/pro_api',
                method: 'POST',
                data: JSON.stringify({
                  format: 'm4a',
                  rate: 16000,
                  channel: 1,
                  cuid: 'YOUR_CUID',
                  dev_pid: 80001,
                  token: token,
                  speech: audioData,
                  len: len
                }),
                header: {
                  'Content-Type': 'application/json'
                },
                success: (res) => {  // 使用箭头函数
                  if (res.data.err_no === 0) {
                    this.setData({ result: res.data.result[0] });
                    app.globalData.asrResult = res.data.result[0];
                    this.translate(res.data.result[0], { from: this.data.sourceLanguage, to: this.data.targetLanguage });
                  } else {
                    console.error('识别错误:', res.data.err_msg);
                  }
                },
                fail: (err) => {  // 使用箭头函数
                  console.error('请求失败:', err);
                }
              });
            }).catch(error => {
              console.error(error);
            });
          },
          fail: (err) => {
            console.error('获取文件信息失败:', err);
          }
        });
      },
      fail: (err) => {
        console.error('读取文件失败:', err);
      }
    });
  },  

  translate(q, { from = 'auto', to = 'auto' } = {}) {
    return new Promise((resolve, reject) => {
      const payload = {
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: `请将以下文本从${from}翻译成${to}：${q}` }
        ],
        stream: false
      };
  
      wx.request({
        url: 'https://api.deepseek.com/chat/completions',
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        data: payload,
        timeout: 10000,
        success: (res) => {  // 使用箭头函数
          if (res.statusCode === 200 && res.data && res.data.choices && res.data.choices[0].message.content) {
            const translatedContent = res.data.choices[0].message.content;
            this.setData({ translatedResult: translatedContent });  // 这里可以正常使用 this
            resolve(translatedContent);
          } else {
            reject({ status: 'error', msg: '翻译失败，状态码：' + res.statusCode });
            wx.showToast({ title: '翻译失败', icon: 'none', duration: 3000 });
          }
        },
        fail: (err) => {  // 使用箭头函数
          reject({ status: 'error', msg: `请求失败：${err.errMsg}` });
          wx.showToast({ title: '网络异常', icon: 'none', duration: 3000 });
        }
      });
    });
  }
  
});
