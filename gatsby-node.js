const path = require('path')
const _ = require('lodash')
const fs = require('fs')
const {
  createPaginationPages,
  createLinkedPages
} = require('gatsby-pagination')
const siteConfig = require('./data/SiteConfig')

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions
  let slug
  if (node.internal.type === 'MarkdownRemark') {
    const fileNode = getNode(node.parent)
    const parsedFilePath = path.parse(fileNode.relativePath)
    if (
      Object.prototype.hasOwnProperty.call(node, 'frontmatter') &&
      Object.prototype.hasOwnProperty.call(node.frontmatter, 'slug')
    ) {
      slug = `/${_.kebabCase(node.frontmatter.slug)}`
    } else if (
      Object.prototype.hasOwnProperty.call(node, 'frontmatter') &&
      Object.prototype.hasOwnProperty.call(node.frontmatter, 'title')
    ) {
      slug = `/${_.kebabCase(node.frontmatter.title)}`
    } else if (parsedFilePath.name !== 'blog' && parsedFilePath.dir !== '') {
      slug = `/${parsedFilePath.dir}/${parsedFilePath.name}/`
    } else if (parsedFilePath.dir === '') {
      slug = `/${parsedFilePath.name}/`
    } else {
      slug = `/${parsedFilePath.dir}/`
    }
    createNodeField({ node, name: 'slug', value: slug })
  }
}

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions

  return new Promise((resolve, reject) => {
    const blogPage = path.resolve('src/templates/blog.jsx')
    const postPage = path.resolve('src/templates/post.jsx')
    const tagPage = path.resolve('src/templates/tag.jsx')

    if (
      !fs.existsSync(
        path.resolve(`content/${siteConfig.blogAuthorDir}/authors/`)
      )
    ) {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject(
        "The 'authors' folder is missing within the 'blogAuthorDir' folder."
      )
    }

    resolve(
      graphql(
        `
          {
            allMarkdownRemark(
              limit: 1000
              sort: { fields: [frontmatter___date], order: DESC }
            ) {
              totalCount
              edges {
                node {
                  frontmatter {
                    title
                    tags
                    cover
                    date
                    author
                  }
                  fields {
                    slug
                  }
                  excerpt
                  timeToRead
                }
              }
            }
          }
        `
      ).then(result => {
        if (result.errors) {
          /* eslint no-console: "off" */
          console.log(result.errors)
          reject(result.errors)
        }

        // Creates Index page
        const blogFormatter = route => `/blog/${route !== 1 ? route : ''}`
        createPaginationPages({
          createPage,
          edges: result.data.allMarkdownRemark.edges,
          component: blogPage,
          pathFormatter: blogFormatter,
          limit: siteConfig.sitePaginationLimit
        })

        // Creates Posts
        createLinkedPages({
          createPage,
          edges: result.data.allMarkdownRemark.edges,
          component: postPage,
          edgeParser: edge => ({
            path: edge.node.fields.slug,
            context: {
              slug: edge.node.fields.slug
            }
          }),
          circular: true
        })

        const tagSet = new Set()
        const tagMap = new Map()
        const authorSet = new Set()
        authorSet.add(siteConfig.blogAuthorId)

        result.data.allMarkdownRemark.edges.forEach(edge => {
          if (edge.node.frontmatter.tags) {
            edge.node.frontmatter.tags.forEach(tag => {
              tagSet.add(tag)

              const array = tagMap.has(tag) ? tagMap.get(tag) : []
              array.push(edge)
              tagMap.set(tag, array)
            })
          }

          if (edge.node.frontmatter.author) {
            authorSet.add(edge.node.frontmatter.author)
          }
        })

        const tagFormatter = tag => route =>
          `/tags/${_.kebabCase(tag)}/${route !== 1 ? route : ''}`
        const tagList = Array.from(tagSet)
        tagList.forEach(tag => {
          // Creates tag pages
          createPaginationPages({
            createPage,
            edges: tagMap.get(tag),
            component: tagPage,
            pathFormatter: tagFormatter(tag),
            limit: siteConfig.sitePaginationLimit,
            context: {
              tag
            }
          })
        })
      })
    )
  })
}
