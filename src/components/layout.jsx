import React from 'react'
import Helmet from 'react-helmet'
import Transition from './Transition'
import config from '../../data/SiteConfig'
import './layout.css'

export default class MainLayout extends React.Component {
  getLocalTitle() {
    function capitalize(string) {
      return string.charAt(0).toUpperCase() + string.slice(1)
    }
    const pathPrefix = config.pathPrefix ? config.pathPrefix : '/'
    // eslint-disable-next-line react/destructuring-assignment
    const currentPath = this.props.location.pathname
      .replace(pathPrefix, '')
      .replace('/', '')
    let title = ''
    if (currentPath === '') {
      title = 'Home'
    } else if (currentPath === 'tags/') {
      title = 'Tags'
    } else if (currentPath.includes('posts')) {
      title = 'Article'
    } else if (currentPath.includes('tags/')) {
      const tag = currentPath
        .replace('tags/', '')
        .replace('/', '')
        .replace('-', ' ')
      title = `Tagged in ${capitalize(tag)}`
    }
    return title
  }

  render() {
    const { children, location } = this.props
    return (
      <div>
        <Helmet>
          <title>{`${config.siteTitle} |  ${this.getLocalTitle()}`}</title>
          <meta name="description" content={config.siteDescription} />
        </Helmet>
        <Transition location={location}>{children}</Transition>
      </div>
    )
  }
}
