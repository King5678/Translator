import { getHMACSHA256, arrayBufferToBase64, hmacSHA256 } from '../../util/hmac.js';

Page({
  data: {
    result: '',
    ws: null,
    status: 0,
  },

  startRecording() {
    const date = new Date().toUTCString();
    const wssUrl = this.getWebSocketUrl(date);

    wx.connectSocket({
      url: wssUrl,
      success: () => {
        console.log("WebSocket connection request sent.");
      },
      fail: (err) => {
        console.error("WebSocket connection request failed:", err);
      }
    });

    wx.onSocketOpen(() => {
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

    wx.onSocketMessage((message) => {
      this.handleMessage(message);
    });

    wx.onSocketClose(() => {
      console.log("WebSocket connection closed.");
    });

    wx.onSocketError((err) => {
      console.error("WebSocket error:", err);
    });
  },

  stopRecording() {
    if (this.data.ws) {
      wx.closeSocket();
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

    wx.sendSocketMessage({
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
      wx.closeSocket();
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
    const apiKey = "MjI4YjU0NjQ0ODMyODQ2NzJmNTZmMTlk";
    const apiSecret = "de90c4244252ef0c77b6eebd58d5f351";

      const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${uri} HTTP/1.1`;
      const signature = hmacSHA256(signatureOrigin, apiSecret);

      // 定义 authorizationOrigin
      const authorizationOrigin = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;

      // 使用 TextEncoder 将字符串转换为 ArrayBuffer
      const encoder = new TextEncoder();
      const authorizationBuffer = encoder.encode(authorizationOrigin).buffer;

      const authorization = arrayBufferToBase64(authorizationBuffer);

      // 手动构建查询字符串
      const queryString = `authorization=${encodeURIComponent(authorization)}&date=${encodeURIComponent(date)}&host=${encodeURIComponent(host)}`;

      return `wss://iat-api.xfyun.cn/v2/iat?${queryString}`;
  },

});