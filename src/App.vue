<template>
  <div id="app">
    <TopMenu/>
    <div id="setting">
      <el-collapse id="settingBox" v-model="topActiveName">
        <el-collapse-item title="连接设置" name="1">
          <el-form hide-required-asterisk size="small" label-position="left" :model="connection">
            <el-row :gutter="20">
              <el-col :span="10">
                <el-form-item label="Host">
                  <el-input placeholder="请输入内容" v-model="connection.host" class="input-with-select">
                    <el-select v-model="connection.selectValue" slot="prepend" placeholder="请选择">
                      <el-option v-for="item in connection.select"
                                 :label="item.label"
                                 :value="item.value"
                                 :key="item.value">
                      </el-option>
                    </el-select>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="5">
                <el-form-item label="Port">
                  <el-input v-model.number="connection.port" type="number" placeholder="8083/8084"></el-input>
                </el-form-item>

              </el-col>
              <el-col :span="5">
                <el-form-item label="Mountpoint">
                  <el-input v-model="connection.endpoint" placeholder="/mqtt"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="Client ID">
                  <el-input v-model="connection.clientId">
                    <el-button slot="append" icon="el-icon-refresh-left" @click="setClientId"></el-button>
                  </el-input>

                </el-form-item>
              </el-col>
              <el-col :span="5">
                <el-form-item label="Username">
                  <el-input v-model="connection.username"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="5">
                <el-form-item label="Password">
                  <el-input v-model="connection.password"></el-input>
                </el-form-item>
              </el-col>

              <el-col :span="24">
                <el-button
                    type="success"
                    size="small"
                    class="conn-btn"
                    style="margin-right: 20px;"
                    :disabled="client.connected"
                    @click="createConnection"
                >
                  {{ client.connected ? '已连接' : '连接' }}
                </el-button>
                <el-button v-if="client.connected" type="danger" size="small" class="conn-btn" @click="destroyConnection">
                  断开连接
                </el-button>
              </el-col>
            </el-row>
          </el-form>
        </el-collapse-item>
        <el-collapse-item title="订阅设置" name="2">
          <el-form>
            <el-form-item label="QoS" style="width: 20%;">
              <el-input v-model="subscription.qos"></el-input>
            </el-form-item>
            <el-form-item label="订阅地址" style="width: 50%">
              <el-input v-model="subscription.topic">
                <el-button :disabled="subscribeSuccess = false" slot="append" icon="el-icon-connection" @click="doSubscribe">订阅</el-button>
                <el-button :disabled="subscribeSuccess" slot="append" icon="el-icon-close" @click="doUnSubscribe">取消订阅</el-button>
              </el-input>
            </el-form-item>
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </div>
    <div id="messageBox">
      <el-table
          :data="Logs"
          height="250"
          border
          style="width: 100%"
          :row-class-name="tableRowClassName"
          size="mini">
        <el-table-column
            prop="date"
            label="时间"
            width="120">
        </el-table-column>
        <el-table-column
            prop="type"
            label="类型"
            width="80">
        </el-table-column>
        <el-table-column
            prop="sub"
            label="订阅"
            width="140">
        </el-table-column>
        <el-table-column
            prop="message"
            label="消息">
        </el-table-column>
      </el-table>
    </div>
    <div id="sendBox">
      <div style="margin: 10px 0 10px 0">
        发送地址：
        <el-input v-model="publish.topic" style="width: 220px"></el-input>
      </div>
      <div style="margin: 10px 0 10px 0">
        <el-input v-model="publish.payload" style="width: 600px;margin-left: 5px"></el-input>
        <el-button style="margin-left: 20px" @click="doPublish">发送</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import TopMenu from "@/components/topMenu";
import mqtt from  "mqtt"
export default {
  name: 'App',
  components: {TopMenu},
  mounted: function () {
    this.connection.clientId = this.getRandomString(8)
  },
  data() {
    return {
      topActiveName: '1',
      connection: {
        host: '',
        port: 8083,
        endpoint: '/mqtt',
        clean: true, // 保留会话
        connectTimeout: 6000, // 超时时间
        // 认证信息
        clientId: '',
        username: '',
        password: '',
        select: [{
          label:'ws://',
          value:'ws://'
        },{
          label:'wss://',
          value:'wss://'
        }],
        selectValue:'ws://'
      },
      subscription: {
        topic: 'topic/test',
        qos: 0,
      },
      publish: {
        topic: 'topic/test',
        qos: 0,
        payload: '{ "msg": "Hello, I am browser." }',
      },
      client: {
        connected: false,
      },
      subscribeSuccess: false,
      input1: '',
      input2: '',
      input3: '',
      Logs: [],
      charStr: 'abacdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789'
    };
  },
  methods: {
    /**
     * 随机生成索引
     * @param min 最小值
     * @param max 最大值
     * @param i 当前获取位置
     */
    RandomIndex(min, max, i){
      let index = Math.floor(Math.random()*(max-min+1)+min),
          numStart = this.charStr.length - 10;
      //如果字符串第一位是数字，则递归重新获取
      if(i===0&&index>=numStart){
        index = this.RandomIndex(min, max, i);
      }
      //返回最终索引值
      return index;
    },
    getRandomString(len){
      let min = 0, max = this.charStr.length-1, _str = '';
      //判断是否指定长度，否则默认长度为15
      len = len || 15;
      //循环生成字符串
      for(let i = 0, index; i < len; i++){
        index = this.RandomIndex(min, max, i);
        _str += this.charStr[index];
      }
      return 'mqttweb_' + _str;
    },
    setClientId(){
      this.connection.clientId = this.getRandomString(8)
    },
    tableRowClassName({row}) {
      if (row.type === '发送') {
        return 'warning-row';
      }
      return '';
    },
    // 创建连接
    createConnection() {
      // 连接字符串, 通过协议指定使用的连接方式
      // ws 未加密 WebSocket 连接
      // wss 加密 WebSocket 连接
      const { host, port, selectValue, endpoint, ...options } = this.connection
      const connectUrl = `${selectValue}${host}:${port}${endpoint}`
      try {
        this.client = mqtt.connect(connectUrl, options)
      } catch (error) {
        console.log('[MQTT Manager] 连接出错', error)
      }
      this.client.on('connect', () => {
        console.log('[MQTT Manager] 连接服务器成功！')
        console.log('[MQTT Manager] 连接地址：' + connectUrl)
      })
      this.client.on('error', error => {
        this.destroyConnection()
        console.log('[MQTT Manager] 连接失败', error)
      })
    },
    destroyConnection() {
      try {
        this.client.end()
        this.client = {
          connected: false,
        }
        console.log('[MQTT Manager] 服务器断开成功!')
      } catch (error) {
        console.log('[MQTT Manager] 服务器断开失败!', error.toString())
      }
    },
    doSubscribe() {
      const { topic, qos } = this.subscription
      if(!this.client.connected){
        this.$message.error('服务器未连接');
        return
      }
      this.doUnSubscribe()
      this.client.subscribe(topic, { qos }, (error, res) => {
        if (error) {
          console.log('[MQTT Manager] 订阅出错', error)
          return
        }
        this.subscribeSuccess = true
        console.log('[MQTT Manager] 订阅成功', res)
        this.client.on('message', (topic, message) => {
          console.log(`[MQTT Manager] 收到来自 ${topic} 的消息：${message}`)
          this.addLogs("接收",topic,message.toString())
        })
      })

    },
    doUnSubscribe() {
      const { topic } = this.subscription
      if(!this.client.connected){
        this.$message.error('服务器未连接');
        return
      }
      this.client.unsubscribe(topic, error => {
        if (error) {
          console.log('[MQTT Manager] 取消订阅出错', error)
          return
        }
        console.log('[MQTT Manager] 取消订阅成功！')
        this.subscribeSuccess = false
      })
    },
    doPublish() {
      const { topic, qos, payload } = this.publish
      if(!this.client.connected){
        this.$message.error('服务器未连接');
        return
      }
      this.client.publish(topic, payload, qos, error => {
        if (error) {
          console.log('[MQTT Manager] 发送消息出现错误', error)
          return
        }
        console.log('[MQTT Manager] 消息发送：' + payload)
        this.addLogs("发送",topic,payload)
      })
    },
    getNowDate() {
      return new Date().toLocaleTimeString()
    },
    addLogs(type, sub, message) {
      const mess = {date: this.getNowDate(), type: type, sub: sub, message: message};
      this.Logs.unshift(mess)
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 1300px;
  margin:0 auto 0 auto;

}
#setting {
  width: 70%;
  margin:10px auto 0 auto;
  border: 1px solid #EBEEF5;
  border-radius: 10px;
}

#settingBox{
  margin:10px 10px 10px 10px;

}
.el-select .el-input {
  width: 100px;
}
.input-with-select .el-input-group__prepend {
  background-color: #fff;
}
#messageBox{
  width: 70%;
  margin:10px auto 0 auto;
}
#sendBox{
  width: 70%;
  margin:10px auto 0 auto;
  border: 1px solid #EBEEF5;
  border-radius: 10px;
}
.el-table .warning-row {
  background: oldlace;
}
</style>
