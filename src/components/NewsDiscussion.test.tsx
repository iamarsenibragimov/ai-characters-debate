import { render, act, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import NewsDiscussion from './NewsDiscussion';
import { DebateCharacter, DebateMessage } from '@/types/debate';

describe('NewsDiscussion', () => {
  const mockCharacters: DebateCharacter[] = [{
    character_number: 1,
    name: 'Anchor 1',
    age: 45,
    location: 'New York',
    occupation: 'News Anchor',
    background: 'Veteran journalist with 20 years experience',
    personality: 'Professional and articulate',
    avatar_url: 'test.jpg',
    voice_id: 'test-voice',
    system_prompt: 'You are a professional news anchor'
  }];

  const mockMessages: DebateMessage[] = [];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('correctly displays and animates topic text', async () => {
    const testTopic = 'Test Topic';
    
    render(
      <NewsDiscussion
        topic={testTopic}
        isLoading={false}
        messages={mockMessages}
        isSpeaking={false}
        characters={mockCharacters}
      />
    );

    // Initially, topic should be empty
    const topicHeading = screen.getByTestId('topic-heading');
    expect(topicHeading.textContent).toBe('');

    // Advance timers to simulate typing animation
    await act(async () => {
      for (let i = 0; i < testTopic.length; i++) {
        vi.advanceTimersByTime(30);
        await Promise.resolve(); // Flush microtasks
      }
    });

    // After animation, full topic should be displayed
    expect(topicHeading.textContent).toBe(testTopic);
  });

  it('handles long topics by truncating to 128 characters', async () => {
    const longTopic = 'A'.repeat(200);
    const expectedTruncated = 'A'.repeat(128) + '...';
    
    render(
      <NewsDiscussion
        topic={longTopic}
        isLoading={false}
        messages={mockMessages}
        isSpeaking={false}
        characters={mockCharacters}
      />
    );

    // Advance timers to complete animation
    await act(async () => {
      for (let i = 0; i < expectedTruncated.length; i++) {
        vi.advanceTimersByTime(30);
        await Promise.resolve(); // Flush microtasks
      }
    });

    // Verify truncated text
    const topicHeading = screen.getByTestId('topic-heading');
    expect(topicHeading.textContent).toBe(expectedTruncated);
  });

  it('handles topic changes by resetting and retyping', async () => {
    const { rerender } = render(
      <NewsDiscussion
        topic="First Topic"
        isLoading={false}
        messages={mockMessages}
        isSpeaking={false}
        characters={mockCharacters}
      />
    );

    // Complete first animation
    await act(async () => {
      for (let i = 0; i < "First Topic".length; i++) {
        vi.advanceTimersByTime(30);
        await Promise.resolve(); // Flush microtasks
      }
    });

    // Change topic
    rerender(
      <NewsDiscussion
        topic="Second Topic"
        isLoading={false}
        messages={mockMessages}
        isSpeaking={false}
        characters={mockCharacters}
      />
    );

    // Verify text was cleared
    const topicHeading = screen.getByTestId('topic-heading');
    expect(topicHeading.textContent).toBe('');

    // Complete second animation
    await act(async () => {
      for (let i = 0; i < "Second Topic".length; i++) {
        vi.advanceTimersByTime(30);
        await Promise.resolve(); // Flush microtasks
      }
    });

    // Verify new topic
    expect(topicHeading.textContent).toBe('Second Topic');
  });

  it('handles special characters in topic', async () => {
    const specialTopic = 'Test: Special & Characters!';
    
    render(
      <NewsDiscussion
        topic={specialTopic}
        isLoading={false}
        messages={mockMessages}
        isSpeaking={false}
        characters={mockCharacters}
      />
    );

    await act(async () => {
      for (let i = 0; i < specialTopic.length; i++) {
        vi.advanceTimersByTime(30);
        await Promise.resolve(); // Flush microtasks
      }
    });

    const topicHeading = screen.getByTestId('topic-heading');
    expect(topicHeading.textContent).toBe(specialTopic);
  });

  it('handles empty topic gracefully', () => {
    render(
      <NewsDiscussion
        topic=""
        isLoading={false}
        messages={mockMessages}
        isSpeaking={false}
        characters={mockCharacters}
      />
    );

    // Should show loading state when no topic
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
}); 