const { React, getModule } = require('powercord/webpack')

const { Modal } = require('powercord/components/modal')
const { sendMessage } = getModule([ 'sendMessage' ], false)
const { FormTitle, Card, Text, Button } = require('powercord/components')
const { close: closeModal } = require('powercord/modal')

module.exports = ({ slowmode, channel, message }) =>
<Modal size={ Modal.Sizes.SMALL }>
  <Modal.Header>
    <FormTitle tag="h3">WARNING!</FormTitle>
    <Modal.CloseButton onClick={ closeModal } />
  </Modal.Header>
  <Modal.Content>
    <div className='dnsm-notice'>
      <Card id='card'>
        <Text>This will put you in a { slowmode } second Slowmode, continue?</Text>
      </Card>
    </div>
  </Modal.Content>
  <Modal.Footer>
    <Button
      style={{ marginRight: '10px' }}
      onClick={ () => { closeModal();  sendMessage(channel, { ...message, __DNSM_afterWarn: true })} }
      color={ Button.Colors.RED }>
      Send Message Anyway
    </Button>
    <Button
      style={{ marginRight: '10px' }}
      onClick={ closeModal }
      color={ Button.Colors.GREEN }>
      Take Me Back to Safety
    </Button>
  </Modal.Footer>
</Modal>