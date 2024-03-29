/* eslint-disable semi */
const { open } = require('powercord/modal')
const { Plugin } = require('powercord/entities')
const { inject, uninject } = require('powercord/injector')
const { getModule, channels, messages, React, constants: { Permissions } } = require('powercord/webpack')

const channelObj = getModule(['getChannel', 'getDMFromUserId'], false)

const { getGuild } = getModule(['getGuild'], false);
const { default: { getMember } } = getModule(m => m.default && m.default.getMember, false);

const Modal = require('./components/modal.jsx')

module.exports = class doNotSlowmode extends Plugin {
  async startPlugin() {
    this._injectMessageSent()
    await this.import('getCurrentUser')
    powercord.api.settings.registerSettings('DNSM!', {
      category: this.entityID,
      label: 'Do Not Slowmode Me',
      render: require('./components/Settings.jsx')
    })
  }

  _injectMessageSent() {
    inject('dontSlowmodeMe', messages, 'sendMessage', (args) => {

      // Avoid Unnecessary Checks if there is no Slowmode
      if (!this.cooldownTime()) return args;

      const guildID = channelObj.getChannel(channels.getChannelId()).guild_id;

      let permissions = this.getPermissionsRaw(
        getGuild(guildID),
        this.getCurrentUser().id
      );

      let parsedPermissions = this.parseBitFieldPermissions(permissions);

      // There is no need to show a notice if the user has perms that bypass the slowmode
      if (parsedPermissions['MANAGE_MESSAGES'] || parsedPermissions['MANAGE_CHANNELS']) return args;


      if (this.cooldownTime() < this.settings.get('slowmodeTrigger', '600')) return args;
      console.log(args)

      if (!args[1]?.__DNSM_afterWarn) {
        open(() => React.createElement(Modal, {
          slowmode: this.cooldownTime(),
          channel: channels.getChannelId(),
          message: args[1],
          other: args[2],
          reply: args[3]
        }));
        return false;
      }
      return args;
    }, true);
  }

  parseBitFieldPermissions(allowed) {
    const permissions = {};
    for (const perm of Object.keys(Permissions)) {
      if (!perm.startsWith('all')) {
        if (BigInt(allowed) & BigInt(Permissions[perm])) {
          permissions[perm] = true;
        }
      }
    }
    return permissions
  };

  getPermissionsRaw(guild, user_id) {
    if (!guild) return false;

    let permissions = 0n;

    const member = getMember(guild.id, user_id);

    if (guild && member) {
      if (guild.ownerId === user_id) {
        permissions = BigInt(Permissions.ADMINISTRATOR);
      } else {
        /* @everyone is not inlcuded in the member's roles */
        permissions |= BigInt(guild.roles[guild.id]?.permissions);

        for (const roleId of member.roles) {
          const rolePerms = guild.roles[roleId]?.permissions;
          if (rolePerms !== undefined) {
            permissions |= BigInt(rolePerms);
          }
        }
      }

      /* If they have administrator they have every permission */
      if (
        (BigInt(permissions) & BigInt(Permissions.ADMINISTRATOR)) ===
        BigInt(Permissions.ADMINISTRATOR)
      ) {
        return Object.values(Permissions).reduce(
          (a, b) => BigInt(a) | BigInt(b),
          0n
        );
      }
    }

    return permissions;
  }

  cooldownTime() {
    const channel = channels.getChannelId();
    return channelObj.getChannel(channel).rateLimitPerUser
  }

  async import(filter, functionName = filter) {
    if (typeof filter === 'string') {
      filter = [filter];
    }
    this[functionName] = (await getModule(filter))[functionName];
  }

  pluginWillUnload() {
    uninject('dontSlowmodeMe')
    powercord.api.settings.unregisterSettings('DNSM!')
  }
}
