import React from 'react';
import { HelpArticle } from '../HelpArticle';

const YouTubeExtraction: React.FC = () => {
  return (
    <HelpArticle
      title="Extracting Content from YouTube Videos"
      category="Smart Study Hub"
      categoryHref="/help"
      relatedArticles={[
        { title: "Generating notes and summaries", href: "/help/study-hub/generating-notes" },
        { title: "Creating flashcards automatically", href: "/help/study-hub/flashcards" },
        { title: "Creating practice questions from content", href: "/help/study-hub/practice-questions" }
      ]}
    >
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">How It Works</h2>
          <p className="mb-4">
            The Smart Study Hub can extract transcripts from YouTube videos and automatically generate comprehensive study materials. This feature saves you hours of manual note-taking!
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">Step-by-Step Guide</h2>
          <ol className="list-decimal list-inside space-y-4 ml-2">
            <li>
              <strong>Navigate to Smart Study Hub</strong>
              <p className="text-sm mt-1 ml-4">From your dashboard, click on "Smart Study Hub" in the sidebar.</p>
            </li>
            <li>
              <strong>Select YouTube Video Option</strong>
              <p className="text-sm mt-1 ml-4">Choose the option to extract content from a YouTube video.</p>
            </li>
            <li>
              <strong>Paste YouTube URL</strong>
              <p className="text-sm mt-1 ml-4">Copy the YouTube video URL and paste it into the input field. The system will automatically extract the video transcript.</p>
            </li>
            <li>
              <strong>Choose Content Type</strong>
              <p className="text-sm mt-1 ml-4">Select what you want to generate:
                <ul className="list-disc list-inside ml-6 mt-2">
                  <li>Study Notes - Comprehensive notes from the video</li>
                  <li>Summary - Concise summary of key points</li>
                  <li>Flashcards - Question-answer flashcards</li>
                  <li>Mind Map - Visual mind map of concepts</li>
                  <li>Practice Questions - Test questions based on content</li>
                </ul>
              </p>
            </li>
            <li>
              <strong>Generate Content</strong>
              <p className="text-sm mt-1 ml-4">Click "Generate" and wait for the AI to process the video transcript and create your study materials.</p>
            </li>
            <li>
              <strong>Review and Save</strong>
              <p className="text-sm mt-1 ml-4">Review the generated content, make any edits if needed, and save it to your study library.</p>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">What Gets Generated</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-pastel-lilac/20 p-4 rounded-xl border border-pastel-lilac/30">
              <h3 className="font-bold text-pastel-dark mb-2">Study Notes</h3>
              <p className="text-sm">Well-organized notes with headings, bullet points, and key concepts extracted from the video.</p>
            </div>
            <div className="bg-pastel-green/20 p-4 rounded-xl border border-pastel-green/30">
              <h3 className="font-bold text-pastel-dark mb-2">Flashcards</h3>
              <p className="text-sm">Question-answer pairs automatically created from important concepts in the video.</p>
            </div>
            <div className="bg-pastel-yellow/20 p-4 rounded-xl border border-pastel-yellow/30">
              <h3 className="font-bold text-pastel-dark mb-2">Mind Maps</h3>
              <p className="text-sm">Visual representation of concepts and their relationships from the video content.</p>
            </div>
            <div className="bg-pastel-pink/20 p-4 rounded-xl border border-pastel-pink/30">
              <h3 className="font-bold text-pastel-dark mb-2">Practice Questions</h3>
              <p className="text-sm">Multiple-choice and descriptive questions based on the video content for self-assessment.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">Tips for Best Results</h2>
          <div className="bg-pastel-purple/10 p-4 rounded-xl border border-pastel-purple/20">
            <ul className="space-y-2 text-sm">
              <li>✓ Use educational videos with clear audio and transcripts</li>
              <li>✓ Longer videos (10+ minutes) generate more comprehensive content</li>
              <li>✓ Videos with structured content (lectures, tutorials) work best</li>
              <li>✓ Review and edit generated content to match your learning style</li>
              <li>✓ Save generated materials to your library for easy access later</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">Supported Video Types</h2>
          <p className="mb-3">The YouTube extraction works with:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Educational lectures and tutorials</li>
            <li>Exam preparation videos</li>
            <li>Concept explanation videos</li>
            <li>Any YouTube video with available transcripts</li>
          </ul>
          <p className="mt-3 text-sm text-gray-600">
            <strong>Note:</strong> Videos must have captions/transcripts enabled on YouTube for extraction to work.
          </p>
        </section>
      </div>
    </HelpArticle>
  );
};

export default YouTubeExtraction;

