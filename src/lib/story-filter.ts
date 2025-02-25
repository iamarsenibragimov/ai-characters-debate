import type { NewsStory, StoryRelevanceScore } from '@/types/reddit-types'
import { openai } from './openai'

const RELEVANCE_SYSTEM_PROMPT = `You are a news curator responsible for analyzing and scoring news stories.
Your task is to:
1. Rate the story's relevance on a scale of 1-10
2. Identify the main topics it covers
3. Provide a brief explanation of your scoring

Consider these factors:
- General interest and importance
- Credibility and newsworthiness
- Impact and reach
- Timeliness
- Educational or informative value

Respond in JSON format with:
{
  "score": number (1-10),
  "topics": string[] (from: technology, politics, business, science, health, entertainment, sports, other),
  "explanation": string
}`

export type StoryTopic = 'technology' | 'politics' | 'business' | 'science' | 'health' | 'entertainment' | 'sports' | 'other';

export interface FilteredNewsStory extends NewsStory {
  relevanceScore: number;
  topics: StoryTopic[];
  isRelevant: boolean;
}

export class StoryFilterError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StoryFilterError'
  }
}

export async function analyzeStory(story: NewsStory): Promise<StoryRelevanceScore> {
  try {
    const storyContent = `
Title: ${story.title}
Summary: ${story.summary}
Subreddit: ${story.subreddit}
Score: ${story.score}
Comments: ${story.commentCount}
`
    console.log('Analyzing story:', {
      id: story.id,
      title: story.title.substring(0, 50) + '...'
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: RELEVANCE_SYSTEM_PROMPT },
        { role: 'user', content: storyContent }
      ],
      temperature: 0,
      response_format: { type: 'json_object' },
      store: true
    })

    console.log('OpenAI response:', completion.choices[0].message.content);

    const result = JSON.parse(completion.choices[0].message.content) as StoryRelevanceScore

    console.log('Parsed result:', result);

    // Validate the response
    if (
      typeof result.score !== 'number' ||
      result.score < 1 ||
      result.score > 10 ||
      !Array.isArray(result.topics) ||
      !result.topics.every((topic): topic is StoryTopic =>
        ['technology', 'politics', 'business', 'science', 'health', 'entertainment', 'sports', 'other'].includes(topic)
      ) ||
      typeof result.explanation !== 'string'
    ) {
      console.error('Validation failed:', {
        hasScore: typeof result.score === 'number',
        scoreInRange: result.score >= 1 && result.score <= 10,
        hasTopicsArray: Array.isArray(result.topics),
        validTopics: result.topics?.every(topic =>
          ['technology', 'politics', 'business', 'science', 'health', 'entertainment', 'sports', 'other'].includes(topic)
        ),
        hasExplanation: typeof result.explanation === 'string'
      });
      throw new StoryFilterError('Invalid response format from OpenAI')
    }

    return result
  } catch (error) {
    console.error('Error in analyzeStory:', error);
    throw new StoryFilterError(
      error instanceof Error ? error.message : 'Failed to analyze story'
    )
  }
}

export async function filterStories(
  stories: NewsStory[],
  options: {
    minRelevanceScore?: number
    maxStories?: number
  } = {}
): Promise<FilteredNewsStory[]> {
  const { minRelevanceScore = 7, maxStories = 5 } = options

  // Filter out NSFW content first
  const sfw_stories = stories.filter(story => !story.isNsfw)

  // Analyze all stories in parallel
  const analysisResults = await Promise.allSettled(
    sfw_stories.map(story => analyzeStory(story))
  )

  // Convert stories to FilteredNewsStory objects with their analysis results
  const filteredStories = sfw_stories
    .map((story, index) => {
      const result = analysisResults[index]

      if (result.status === 'rejected') {
        console.error(`Failed to analyze story ${story.id}:`, result.reason)
        return null
      }

      const analysis = result.value
      return {
        ...story,
        relevanceScore: analysis.score,
        topics: analysis.topics,
        isRelevant: analysis.score >= minRelevanceScore
      }
    })
    .filter((story: NewsStory & Partial<FilteredNewsStory>): story is FilteredNewsStory =>
      story !== null &&
      'isRelevant' in story &&
      'topics' in story &&
      'relevanceScore' in story &&
      story.isRelevant &&
      Array.isArray(story.topics) &&
      story.topics.every((topic): topic is StoryTopic =>
        ['technology', 'politics', 'business', 'science', 'health', 'entertainment', 'sports', 'other'].includes(topic)
      )
    )
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxStories)

  return filteredStories
} 