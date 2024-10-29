const CryptoJS = require('crypto-js');

const config = {
  hostUrl: "wss://iat-api.xfyun.cn/v2/iat",
  host: "iat-api.xfyun.cn",
  appid: "你的appid",
  apiSecret: "你的apiSecret",
  apiKey: "你的apiKey"
};

let status = 0; // 0: STATUS_FIRST_FRAME, 1: STATUS_CONTINUE_FRAME, 2: STATUS_LAST_FRAME
let currentSid = "";
let iatResult = [];

Page({
  data: {
    recognizedText: ''
  },

  onLoad() {
    this.startVoiceRecognition();
  },

  startVoiceRecognition() {
    const date = new Date().toUTCString();
    const wssUrl = `${config.hostUrl}?authorization=${this.getAuthStr(date)}&date=${date}&host=${config.host}`;
    const ws = wx.connectSocket({ url: wssUrl });

    ws.onOpen(() => {
      console.log("WebSocket connected!");
      this.startSendingAudio(ws);
    });

    ws.onMessage((message) => {
      const res = JSON.parse(message.data);
      if (res.code !== 0) {
        console.error(`Error code ${res.code}: ${res.message}`);
        return;
      }

      if (res.data.status === 2) {
        console.log("Final result received");
        currentSid = res.sid;
        ws.close();
      } else {
        console.log("Intermediate result");
      }

      this.processResult(res);
    });

    ws.onClose(() => {
      console.log(`Session ID: ${currentSid}`);
      console.log('Connection closed!');
    });

    ws.onError((err) => {
      console.error("WebSocket error: " + err);
    });
  },

  startSendingAudio(ws) {
    // 这里你需要实现获取音频流的代码，示例中假设你已录音并准备好发送
    // 使用 wx.startRecord 录音，并在结束后读取录音文件发送
    wx.startRecord({
      success: (res) => {
        const tempFilePath = res.tempFilePath;
        wx.getFileSystemManager().readFile({
          filePath: tempFilePath,
          success: (fileRes) => {
            this.sendData(ws, fileRes.data);
          },
          fail: (err) => {
            console.error("Failed to read file: ", err);
          }
        });
      },
      fail: (err) => {
        console.error("Failed to start recording: ", err);
      }
    });
  },

  sendData(ws, data) {
    const frameDataSection = {
      status: status,
      format: "audio/L16;rate=16000",
      audio: data.toString('base64'),
      encoding: "raw"
    };

    let frame;
    if (status === 0) {
      frame = {
        common: {
          app_id: config.appid
        },
        business: {
          language: "zh_cn",
          domain: "iat",
          accent: "mandarin",
          dwa: "wpgs"
        },
        data: frameDataSection
      };
      status = 1;
    } else {
      frame = {
        data: frameDataSection
      };
    }

    ws.send({
      data: JSON.stringify(frame),
      success: () => console.log("Data sent successfully"),
      fail: (err) => console.error("Failed to send data: ", err)
    });
  },

  processResult(res) {
    let str = "";
    if (res.data.status === 2) {
      str += "最终识别结果";
    } else {
      str += "中间识别结果";
    }

    iatResult[res.data.result.sn] = res.data.result;
    if (res.data.result.pgs === 'rpl') {
      res.data.result.rg.forEach(i => {
        iatResult[i] = null;
      });
      str += "【动态修正】";
    }
    str += ": ";
    iatResult.forEach(i => {
      if (i != null) {
        i.ws.forEach(j => {
          j.cw.forEach(k => {
            str += k.w;
          });
        });
      }
    });

    this.setData({ recognizedText: str });
    console.log(str);
  },

  getAuthStr(date) {
    const signatureOrigin = `host: ${config.host}\ndate: ${date}\nGET ${config.uri} HTTP/1.1`;
    const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, config.apiSecret);
    const signature = CryptoJS.enc.Base64.stringify(signatureSha);
    const authorizationOrigin = `api_key="${config.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(authorizationOrigin));
  }
});
