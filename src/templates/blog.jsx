import { graphql } from 'gatsby'
import React from 'react'
import Helmet from 'react-helmet'
import PostListing from '../components/PostListing/PostListing'
import SEO from '../components/SEO/SEO'
import config from '../../data/SiteConfig'
import Drawer from '../components/Drawer/Drawer'
import Navigation from '../components/Nav/Nav'
import SiteWrapper from '../components/SiteWrapper/SiteWrapper'
import Footer from '../components/Footer/Footer'
import MainHeader from '../components/MainHeader/MainHeader'
import BlogHomeLogo from '../components/BlogHomeLogo/BlogHomeLogo'
import PageTitle from '../components/PageTitle/PageTitle'
import PageDescription from '../components/PageDescription/PageDescription'
import PaginatedContent from '../components/PaginatedContent/PaginatedContent'
import Layout from '../components/layout'

class BlogTemplate extends React.Component {
  state = {
    menuOpen: false
  }

  handleOnClick = evt => {
    evt.stopPropagation()
    if (this.state.menuOpen) {
      this.closeMenu()
    } else {
      this.openMenu()
    }
  }

  handleOnClose = evt => {
    evt.stopPropagation()
    this.closeMenu()
  }

  openMenu = () => {
    this.setState({ menuOpen: true })
  }

  closeMenu = () => {
    this.setState({ menuOpen: false })
  }

  render() {
    const {
      nodes,
      page,
      pages,
      total,
      limit,
      prev,
      next
    } = this.props.pageContext
    const authorsEdges = this.props.data.authors.edges

    return (
      <Layout location={this.props.location}>
        <Drawer className="home-template" isOpen={this.state.menuOpen}>
          <Helmet title={config.siteTitle} />
          <SEO postEdges={nodes} />

          <SiteWrapper>
            {/* All the main content gets inserted here */}
            <div className="home-template">
              {/* The big featured header */}
              <MainHeader cover={config.siteCover}>
                <div className="vertical">
                  <div className="main-header-content inner">
                    {config.siteNavigation ? <Navigation /> : ''}
                    <BlogHomeLogo
                      logo={config.siteLogo}
                      style={{ float: 'none' }}
                      title={config.siteTitle}
                    />

                    <PageTitle text={config.siteTitle} />
                    <PageDescription text={config.siteTitleAlt} />
                  </div>
                </div>
              </MainHeader>

              <PaginatedContent
                page={page}
                pages={pages}
                total={total}
                limit={limit}
                prev={prev}
                next={next}
              >
                {/* PostListing component renders all the posts */}
                <PostListing postEdges={nodes} postAuthors={authorsEdges} />
              </PaginatedContent>
            </div>

            {/* The tiny footer at the very bottom */}
            <Footer
              copyright={config.copyright}
              promoteGatsby={config.promoteGatsby}
            />
          </SiteWrapper>
        </Drawer>
      </Layout>
    )
  }
}

/* eslint no-undef: "off" */
export const pageQuery = graphql`
  query BlogQuery {
    # posts data comes from the context
    # authors
    authors: allAuthorsJson {
      edges {
        node {
          uid
          name
          image
          url
          bio
        }
      }
    }
  }
`

export default BlogTemplate
