const app = getApp();

Page({
  data: {
    result: '',
    recorderManager: null,
    audioFilePath: ''
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
      sampleRate: 16000, // 采样率
      numberOfChannels: 1, // 单声道
      encodeBitRate: 48000, // 比特率
      format: 'm4a' // 格式修改为 m4a
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
      success: (res) => {
        const audioData = res.data;

        console.log('音频数据:', audioData);

        // 获取音频文件的原始大小
        wx.getFileSystemManager().getFileInfo({
          filePath: filePath,
          success: (info) => {
            const len = info.size; // 原始文件大小
            console.log('文件大小:',len);

            this.getAccessToken().then(token => {
              wx.request({
                url: 'https://vop.baidu.com/pro_api', // 确保使用正确的API地址
                method: 'POST',
                data: JSON.stringify({
                  format: 'm4a', // 确保格式为 m4a
                  rate: 16000,
                  channel: 1,
                  cuid: 'test_cuid', // 确保唯一标识有效
                  token: token,
                  len: len, // 使用实际的文件大小
                  speech: audioData // 确保是有效的 Base64 字符串
                }),
                header: {
                  'Content-Type': 'application/json'
                },
                success: (res) => {
                  if (res.data.err_no === 0) {
                    this.setData({
                      result: res.data.result[0]
                    });
                  } else {
                    console.error('识别错误:', res.data.err_msg);
                  }
                },
                fail: (err) => {
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
  }
});
