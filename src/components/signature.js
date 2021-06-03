const { signature: BaseSignature } = window.Formio.Components.components

const overrides = {
  height: {
    initial: '150px',
    override: '254px'
  },
  penColor: {
    initial: 'black',
    override: '#1c3e57' // Slate
  },
  backgroundColor: {
    initial: 'rgb(245,245,235)',
    override: 'transparent' // the template handles this
  }
}

export default class Signature extends BaseSignature {
  mergeSchema (component) {
    const merged = super.mergeSchema(component)
    for (const [key, { initial, override }] of Object.entries(overrides)) {
      if (merged[key] === initial) {
        merged[key] = override
      }
    }
    return merged
  }
}
