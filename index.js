/* eslint-disable semi */
const { Plugin } = require('powercord/entities')
const { inject, uninject } = require('powercord/injector')
const { open } = require('powercord/modal')
const { getModule, channels, messages, React, constants: { Permissions : { MANAGE_MESSAGES, MANAGE_CHANNELS } } } = require('powercord/webpack')

const channelObj      = getModule([ 'getChannel', 'getDMFromUserId' ], false)
const highestRole     = getModule([ 'getHighestRole' ], false)

const Modal = require('./components/modal.jsx')

module.exports = class doNotSlowmode extends Plugin {
  async startPlugin () {
    this._injectMessageSent()
    await this.import('getCurrentUser')
    powercord.api.settings.registerSettings('DNSM!', {
      category: this.entityID,
      label: 'Do Not Slowmode Me',
      render: require('./components/Settings.jsx')
    })
  }

  _injectMessageSent () {
    inject('dontSlowmodeMeMommy', messages, 'sendMessage', (args) => {
      if (!args[1]?.__DNSM_afterWarn && !this.hasPermissions() && this.checkCooldown() >= this.settings.get('slowmodeTrigger', '600')) {
        open(() => React.createElement(Modal, {
          slowmode: this.checkCooldown(),
          channel: channels.getChannelId(),
          message: args[1]
        }));
        return false;
      }
      return args;
    }, true);
  }

  hasPermissions () {
    const channel = channelObj.getChannel(channels.getChannelId())
    if (highestRole.can(MANAGE_MESSAGES, this.getCurrentUser(), channel) ||
        highestRole.can(MANAGE_CHANNELS, this.getCurrentUser(), channel)
    ) {
      return true
    }
  }

  checkCooldown () {
    const channel = channels.getChannelId();
    const Channelcooldown = channelObj.getChannel(channel).rateLimitPerUser

    return Channelcooldown
  }

  async import (filter, functionName = filter) {
    if (typeof filter === 'string') {
      filter = [ filter ];
    }
    this[functionName] = (await getModule(filter))[functionName];
  }

  pluginWillUnload () {
    uninject('dontSlowmodeMeMommy')
    powercord.api.settings.unregisterSettings('DNSM!')
  }
}
