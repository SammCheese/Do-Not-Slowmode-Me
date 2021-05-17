const { Plugin } = require('powercord/entities')
const { getModule, channels, messages } = require('powercord/webpack')
const { inject, uninject } = require('powercord/injector')

function checkCooldownandSetting() {
  const channel = channels.getChannelId()
  const Channelcooldown = getModule([ 'getChannel' ], false).getChannel(channel).rateLimitPerUser
  
  return Channelcooldown
}

module.exports = class doNotSlowmode extends Plugin {
  async startPlugin() {
    this._injectMessageSent()
    powercord.api.settings.registerSettings("DNSM!", {
      category: this.entityID,
      label: "Do Not Slowmode Me",
      render: require("./components/Settings.jsx"),
    })
  }

  _injectMessageSent() {
    inject("dontSlowmodeMeMommy", messages, "sendMessage", args => {
      if (checkCooldownandSetting() >= this.settings.get("slowmodeTrigger", "600")) {
        const msg = args[1];
        msg.send = true;
        return false;
      }
      return args
    }, true);
  }

  pluginWillUnload() {
    uninject("dontSlowmodeMeMommy");
    powercord.api.settings.unregisterSettings("DNSM!")
  }
}