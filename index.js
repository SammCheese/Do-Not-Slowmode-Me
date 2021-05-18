/* eslint-disable semi */
const { Plugin } = require('powercord/entities')
const { getModule, channels, messages } = require('powercord/webpack')
const { inject, uninject } = require('powercord/injector')

function checkCooldown () {
  const channel = channels.getChannelId()
  const Channelcooldown = getModule([ 'getChannel' ], false).getChannel(channel).rateLimitPerUser

  return Channelcooldown
}

function checkPerms () {
  const channelObj      = getModule([ 'getChannel' ], false).getChannel(channels.getChannelId())
  const highestRole     = getModule([ 'getHighestRole' ], false)

  const { Permissions } = getModule([ 'Permissions' ], false)

  if (highestRole.can(Permissions.MANAGE_MESSAGES || Permissions.MANAGE_CHANNEL, channelObj)) {
    return true
  }
  return false
}


module.exports = class doNotSlowmode extends Plugin {
  async startPlugin () {
    this._injectMessageSent()
    powercord.api.settings.registerSettings('DNSM!', {
      category: this.entityID,
      label: 'Do Not Slowmode Me',
      render: require('./components/Settings.jsx')
    })
  }

  _injectMessageSent () {
    inject('dontSlowmodeMeMommy', messages, 'sendMessage', args => {
      if (!checkPerms() && checkCooldown() >= this.settings.get('slowmodeTrigger', '600')) {
        const msg = args[1]
        return false;
      }
      return args
    }, true);
  }

  pluginWillUnload () {
    uninject('dontSlowmodeMeMommy')
    powercord.api.settings.unregisterSettings('DNSM!')
  }
}
