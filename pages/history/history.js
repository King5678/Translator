Page({
  data: {
    historyList: [] // 用于存储历史记录
  },

  onShow() {
    const app = getApp();
    this.setData({
      historyList: (app.globalData.history || []).map(item => ({ text: item, checked: false })) // 添加一个checked属性
    });
  },

  toggleCheck(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.historyList[index];
    item.checked = !item.checked;
    this.setData({
      [`historyList[${index}]`]: item // 更新特定项
    });
  },

  deleteItem(e) {
    const index = e.currentTarget.dataset.index;
    const app = getApp();

    wx.showModal({
      title: '删除记录',
      content: '确定删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          // 从全局数据中移除
          app.globalData.history.splice(index, 1);

          // 从视图中移除
          const updatedList = this.data.historyList.filter((_, i) => i !== index);
          this.setData({
            historyList: updatedList
          });

          // 更新本地存储
          wx.setStorage({
            key: 'history',
            data: app.globalData.history,
            fail: (err) => {
              console.error('Failed to update history in storage:', err);
            }
          });
        }
      }
    });
  },

  clearHistory() {
    const app = getApp();
    wx.showModal({
      title: '清空历史',
      content: '确定清空所有历史记录吗？',
      success: (res) => {
        if (res.confirm) {
          app.globalData.history = []; // 清空全局记录
          wx.setStorage({
            key: 'history',
            data: [], // 同步清空本地存储
            success: () => {
              this.setData({ historyList: [] }); // 更新页面显示
              wx.showToast({
                title: '历史记录已清空',
                icon: 'success',
                duration: 2000
              });
            },
            fail: (err) => {
              console.error('Failed to clear history:', err);
            }
          });
        }
      }
    });
  }
});