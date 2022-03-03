/** @jsx node */
import { node } from 'jsx-pragmatic'
import { stringRenderer } from '../render'
import classnames from 'classnames'

export default stringRenderer(ctx => {
  const {
    t,
    currentPage,
    panels,
    options: {
      unlockNavigation
    }
  } = ctx

  let currentStep = currentPage + 1
  let numSteps = panels.length
  for (let i = 0; i < panels.length; i++) {
    if (panels[i].properties.hideFromNavigation === 'true') {
      numSteps--
      currentStep--
    }
  }

  return (
    <nav
      aria-label='navigation'
      id={`${ctx.wizardKey}-header`}
      class='fg-light-slate mb-4 mb-md-0 ml-md-5 mt-md-1'
    >
      <div data-toggle-container>
        <div
          aria-expanded='false'
          aria-controls='nav-content'
          id='nav-accordion'
          class='small d-md-none bg-dark-blue border-0 fg-white round-1'
        >
          <div class='d-flex'>
            <div class='flex-auto w-full'>
              Section <span>{currentStep} of {numSteps}</span>
            </div>
            <div>
              <span class='d-block' data-icon='chevron' />
            </div>
          </div>
        </div>
        <div
          aria-labeledby='nav-accordion'
          id='nav-content'
          class='p-md-0'
          hidden
        >
          <ul class='nav-list m-0 p-0 pt-2 pt-md-0'>
            {panels.map((panel, index) => {
              const { hideFromNavigation } = panel.properties

              if (hideFromNavigation !== 'false') {
                const completed = index < currentPage
                const active = index === currentPage
                const enabled = active || completed || unlockNavigation
                const color = active || completed ? 'fg-slate' : 'fg-inherit'

                const style = classnames(color, {
                  'font-medium': active,
                  underline: completed && !active
                },
                enabled ? 'cursor-pointer' : 'cursor-default')

                const last = index === ctx.panels.length - 1

                return (
                  <li
                    class={classnames(
                      'mb-0 d-flex flex-items-start',
                      last && 'pb-2',
                      hideFromNavigation === 'true' && 'd-none first-hidden'
                    )}
                    style='padding-bottom: 30px;'
                    data-current={active}
                    data-complete={completed}
                  >
                    {completed
                      ? (
                        <span
                          class='bg-green-3 round-round fg-white flex-no-shrink'
                          style={`
                            margin-top: 2px;
                            margin-right: -5px;
                            margin-left: -9px;
                            width: 20px;
                            height: 20px;
                          `}
                          data-icon='check'
                          data-width='10'
                        />
                      ) : (
                        <span
                          class={classnames(
                            'flex-no-shrink',
                            active ? color : 'fg-grey-4'
                          )}
                          style='margin: -1px 0 0 -.24em;'
                          data-icon='square'
                          data-width='10'
                        />
                      )}
                    <button
                      class={classnames(
                        'font-inherit border-0 bg-none flex-auto align-left pl-2 py-0',
                        style
                      )}
                      aria-current={active ? 'page' : false}
                      ref={enabled ? `${ctx.wizardKey}-link` : false}
                      disabled={!enabled}
                      style={enabled ? null : 'cursor: default;'}
                    >
                      {t([
                        `${panel.key}.displayTitle`,
                        `${panel.key}.title`,
                        panel.properties.displayTitle || panel.title
                      ])}
                    </button>
                  </li>
                )
              } else {
                // if we don't render something, the nav indexes are wrong and nav clicks go to the wrong place
                return <li ref={`${ctx.wizardKey}-link`} hidden />
              }
            })}
          </ul>
        </div>
      </div>
    </nav>
  )
})
