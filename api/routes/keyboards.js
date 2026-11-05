const { Router } = require('express')
const zmk = require('../services/zmk')

const router = Router()

router.get('/behaviors', (req, res) => res.json(zmk.loadBehaviors()))
router.get('/keycodes', (req, res) => res.json(zmk.loadKeycodes()))
router.get('/layout', (req, res) => res.json(zmk.loadLayout()))
router.get('/keymap', (req, res) => res.json(zmk.loadKeymap()))
router.post('/parse-keymap', (req, res) => {
  try {
    const { dts } = req.body || {}
    if (!dts) {
      return res.status(400).json({ error: 'Missing dts property' })
    }
    const loaded = zmk.loadKeymapFromDts(dts)
    const parsed = zmk.parseKeymap(loaded)
    res.json(parsed)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})
router.post('/keymap', (req, res) => {
  const keymap = req.body
  const layout = zmk.loadLayout()
  const generatedKeymap = zmk.generateKeymap(layout, keymap)
  const exportStdout = zmk.exportKeymap(generatedKeymap, 'flash' in req.query, err => {
    if (err) {
      res.status(500).send(err)
      return
    }

    res.send()
  })

  // exportStdout.stdout.on('data', data => {
  //   for (let sub of subscribers) {
  //     sub.send(data)
  //   }
  // })
})

module.exports = router
