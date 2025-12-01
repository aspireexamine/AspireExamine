import React from 'react';
import { HelpArticle } from '../HelpArticle';

const AttemptingTests: React.FC = () => {
  return (
    <HelpArticle
      title="How to Attempt a Practice Test"
      category="Practice Tests"
      categoryHref="/help"
      relatedArticles={[
        { title: "Understanding test modes (Practice vs Exam)", href: "/help/practice-tests/test-modes" },
        { title: "Using the question palette and navigation", href: "/help/practice-tests/question-palette" },
        { title: "Reviewing answers and solutions", href: "/help/practice-tests/reviewing-answers" }
      ]}
    >
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">Step-by-Step Guide</h2>
          <ol className="list-decimal list-inside space-y-4 ml-2">
            <li>
              <strong>Navigate to Your Dashboard</strong>
              <p className="text-sm mt-1 ml-4">After logging in, you'll see your student dashboard with all available exam streams.</p>
            </li>
            <li>
              <strong>Select Your Exam Stream</strong>
              <p className="text-sm mt-1 ml-4">Choose between NEET, JEE Main, JEE Advanced, or other competitive exams.</p>
            </li>
            <li>
              <strong>Choose a Subject or Chapter</strong>
              <p className="text-sm mt-1 ml-4">You can practice by:
                <ul className="list-disc list-inside ml-6 mt-2">
                  <li>Full syllabus tests</li>
                  <li>Subject-wise tests (Physics, Chemistry, Biology, Mathematics)</li>
                  <li>Chapter-wise tests for focused practice</li>
                </ul>
              </p>
            </li>
            <li>
              <strong>Select a Practice Test</strong>
              <p className="text-sm mt-1 ml-4">Click on any available practice test, previous year question paper, or test series.</p>
            </li>
            <li>
              <strong>Choose Test Mode</strong>
              <p className="text-sm mt-1 ml-4">Select between:
                <ul className="list-disc list-inside ml-6 mt-2">
                  <li><strong>Practice Mode</strong> - Answer questions one by one with immediate feedback</li>
                  <li><strong>Exam Mode</strong> - Full-length test with timer, question palette, and exam-like experience</li>
                </ul>
              </p>
            </li>
            <li>
              <strong>Start the Test</strong>
              <p className="text-sm mt-1 ml-4">Click "Start Test" and begin answering questions. Your progress is automatically saved.</p>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">During the Test</h2>
          <div className="bg-pastel-yellow/20 p-4 rounded-xl border border-pastel-yellow/30">
            <ul className="space-y-2">
              <li>✓ <strong>Auto-save</strong> - Your answers are saved automatically as you progress</li>
              <li>✓ <strong>Question Palette</strong> - Use the visual palette to navigate between questions</li>
              <li>✓ <strong>Mark for Review</strong> - Mark questions you want to revisit later</li>
              <li>✓ <strong>Timer</strong> - Keep track of time remaining (in Exam Mode)</li>
              <li>✓ <strong>Navigation</strong> - Use Previous/Next buttons or click questions in the palette</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">Submitting Your Test</h2>
          <p className="mb-3">
            When you're ready to submit:
          </p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>Click the "Submit Test" button</li>
            <li>Review your submission summary</li>
            <li>Confirm submission</li>
            <li>View your detailed results immediately</li>
          </ol>
          <p className="mt-3 text-sm text-gray-600">
            <strong>Note:</strong> In Exam Mode, the test will auto-submit when time runs out. Make sure to review all questions before the timer ends.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">After Submission</h2>
          <p className="mb-3">
            You'll immediately see:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>Your total score and percentage</li>
            <li>Subject-wise breakdown</li>
            <li>Correct and incorrect answers</li>
            <li>Detailed solutions and explanations</li>
            <li>Performance analytics</li>
            <li>Option to download PDF report</li>
          </ul>
        </section>
      </div>
    </HelpArticle>
  );
};

export default AttemptingTests;

