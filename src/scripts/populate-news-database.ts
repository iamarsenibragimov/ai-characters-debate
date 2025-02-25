import { writeFileSync } from 'fs'
import path from 'path'
import { fetchTopPosts } from '../lib/reddit'
import { filterStories } from '../lib/story-filter'
import fs from 'fs'

function sanitizeText(text: string): string {
  return text
    .replace(/[\r\n]+/g, ' ') // Replace all newlines with spaces
    .replace(/\s+/g, ' ')     // Normalize multiple spaces to single space
    .trim()                   // Remove leading/trailing whitespace
    .replace(/"/g, '""')      // Escape quotes by doubling them
}

async function populateNewsDatabase() {
  try {
    console.log('Fetching stories from Reddit...')
    const stories = await fetchTopPosts(100)

    console.log('Filtering and analyzing stories...')
    const filteredStories = await filterStories(stories, {
      minRelevanceScore: 7,
      maxStories: 100,
      skipAnalytics: true
    })

    // Read existing content if file exists
    let existingContent = ''
    const filePath = path.join(process.cwd(), 'news_database.csv')
    try {
      existingContent = fs.readFileSync(filePath, 'utf-8')
    } catch (err) {
      // File doesn't exist yet, start with empty content
    }

    const csvRows = filteredStories.map(story => {
      const title = sanitizeText(story.title)
      const content = sanitizeText(story.summary || '')
      return `"${title}","${content}"`
    })

    // Combine existing content with new rows
    const newContent = existingContent
      ? existingContent + '\n' + csvRows.join('\n')
      : csvRows.join('\n')

    writeFileSync(filePath, newContent, 'utf-8')
    console.log(`Successfully added ${filteredStories.length} stories to news_database.csv`)
  } catch (error) {
    console.error('Failed to populate news database:', error)
    process.exit(1)
  }
}

populateNewsDatabase() 