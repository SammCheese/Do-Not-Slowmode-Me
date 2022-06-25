const { React } = require('powercord/webpack')
const { TextInput } = require('powercord/components/settings')

module.exports = class Settings extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = { opened : { main: false } }
  }
  render() {
    const { getSetting, updateSetting } = this.props
    return (<div>
      <TextInput
        note="The Time in Seconds at which the Slowmode blocker should activate"
        defaultValue={getSetting("slowmodeTrigger", "600")}
        onChange={v => updateSetting("slowmodeTrigger", v)}>
          Slowmode Trigger
      </TextInput>
    </div>)
  }
}