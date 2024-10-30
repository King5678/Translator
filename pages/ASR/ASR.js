const sha1 = require('../../util/sha1.js')

Page({
  data: {
    result: '',
    ws: null,
    status: 0,
  },

  startRecording() {
    const date = new Date().toUTCString();
    const wssUrl = this.getWebSocketUrl(date);

    this.setData({
      ws: wx.connectSocket({ url: wssUrl })
    });

    this.data.ws.onOpen(() => {
      console.log("WebSocket connected!");

      const recorderManager = wx.getRecorderManager();
      recorderManager.start({
        format: 'pcm',
        sampleRate: 16000,
      });

      recorderManager.onRecordingProgress((res) => {
        // 可以处理录音进度
      });

      recorderManager.onStop((res) => {
        this.sendAudioData(res.tempFilePath);
      });
    });

    this.data.ws.onMessage((message) => {
      this.handleMessage(message);
    });

    this.data.ws.onClose(() => {
      console.log("WebSocket connection closed.");
    });

    this.data.ws.onError((err) => {
      console.error("WebSocket error:", err);
    });
  },

  stopRecording() {
    if (this.data.ws) {
      this.data.ws.close();
    }
  },

  sendAudioData(filePath) {
    wx.getFileSystemManager().readFile({
      filePath: filePath,
      encoding: 'base64',
      success: (res) => {
        this.sendWebSocketData(res.data);
      },
      fail: (err) => {
        console.error("Read file failed:", err);
      }
    });
  },

  sendWebSocketData(audio) {
    const frameDataSection = {
      status: this.data.status,
      format: "audio/L16;rate=16000",
      audio: audio,
      encoding: "raw"
    };

    let frame;
    if (this.data.status === 0) {
      frame = {
        common: {
          app_id: "你的appid"
        },
        business: {
          language: "zh_cn",
          domain: "iat",
          accent: "mandarin",
          dwa: "wpgs"
        },
        data: frameDataSection
      };
      this.data.status = 1;
    } else {
      frame = {
        data: frameDataSection
      };
    }

    this.data.ws.send({
      data: JSON.stringify(frame),
      success: () => console.log("Data sent successfully"),
      fail: (err) => console.error("Failed to send data:", err)
    });
  },

  handleMessage(message) {
    const res = JSON.parse(message.data);
    if (res.code !== 0) {
      console.error(`Error code ${res.code}: ${res.message}`);
      return;
    }

    let str = "";
    if (res.data.status === 2) {
      console.log("Final result received.");
      this.data.ws.close();
    } else {
      console.log("Intermediate result received.");
    }

    res.data.result.ws.forEach(j => {
      j.cw.forEach(k => {
        str += k.w;
      });
    });

    this.setData({ result: this.data.result + str });
  },

  getWebSocketUrl(date) {
    const host = "iat-api.xfyun.cn";
    const uri = "/v2/iat";
    const appid = "你的appid";
    const apiKey = "你的apiKey";
    const apiSecret = "你的apiSecret";

    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${uri} HTTP/1.1`;
    const signature = this.hmacSHA256(signatureOrigin, apiSecret);
    const authorization = wx.arrayBufferToBase64(wx.stringToArrayBuffer(authorizationOrigin));

    return `wss://iat-api.xfyun.cn/v2/iat?authorization=${authorization}&date=${date}&host=${host}`;
  },

  hmacSHA256(data, key) {
    // 手动实现 HMAC-SHA256
    const hash = sha1.getHMACSHA256(data, key);
    return sha1.arrayBufferToBase64(hash);
  },
});
