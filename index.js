/* eslint-disable semi */
const { Plugin } = require('powercord/entities')
const { getModule, channels, messages, React } = require('powercord/webpack')
const { inject, uninject } = require('powercord/injector')
const { open } = require('powercord/modal')

const Modal = require('./components/modal.jsx')

let messagecontent;

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
      if (!args[1]?.__DNSM_afterWarn && !checkPerms() && checkCooldown() >= this.settings.get('slowmodeTrigger', '600')) {
        const msg = args[1]
        messagecontent = args
        open(() => React.createElement(Modal, {
          slowmode: checkCooldown(),
          channel: channels.getChannelId(),
          message: msg
        }));
        return false
      } else if (args[1]?.__DNSM_afterWarn) {
        return messagecontent
      }
      return args
    }, true);
  }

  pluginWillUnload () {
    uninject('dontSlowmodeMeMommy')
    powercord.api.settings.unregisterSettings('DNSM!')
  }
}
