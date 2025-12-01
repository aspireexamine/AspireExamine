import React from 'react';
import { HelpArticle } from '../HelpArticle';

const QuestionPalette: React.FC = () => {
  return (
    <HelpArticle
      title="Using the Question Palette and Navigation"
      category="Practice Tests"
      categoryHref="/help"
      relatedArticles={[
        { title: "How to attempt a practice test", href: "/help/practice-tests/attempting-tests" },
        { title: "Understanding test modes (Practice vs Exam)", href: "/help/practice-tests/test-modes" },
        { title: "Reviewing answers and solutions", href: "/help/practice-tests/reviewing-answers" }
      ]}
    >
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">What is the Question Palette?</h2>
          <p className="mb-4">
            The Question Palette is a visual navigation tool that shows all questions in your test at a glance. It helps you track your progress, navigate quickly between questions, and manage your test effectively.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">Understanding Question Status Colors</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
              <div className="w-8 h-8 rounded bg-gray-300 flex items-center justify-center text-white font-bold">1</div>
              <div>
                <p className="font-semibold text-sm text-pastel-dark">Gray/Unanswered</p>
                <p className="text-xs text-gray-600">Questions you haven't answered yet</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
              <div className="w-8 h-8 rounded bg-green-500 flex items-center justify-center text-white font-bold">2</div>
              <div>
                <p className="font-semibold text-sm text-pastel-dark">Green/Answered</p>
                <p className="text-xs text-gray-600">Questions you've already answered</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
              <div className="w-8 h-8 rounded bg-yellow-500 flex items-center justify-center text-white font-bold">3</div>
              <div>
                <p className="font-semibold text-sm text-pastel-dark">Yellow/Marked for Review</p>
                <p className="text-xs text-gray-600">Questions you want to revisit before submitting</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
              <div className="w-8 h-8 rounded border-2 border-pastel-purple flex items-center justify-center text-pastel-purple font-bold">4</div>
              <div>
                <p className="font-semibold text-sm text-pastel-dark">Current Question</p>
                <p className="text-xs text-gray-600">The question you're currently viewing</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">How to Use the Question Palette</h2>
          <ol className="list-decimal list-inside space-y-3 ml-2">
            <li>
              <strong>View All Questions</strong>
              <p className="text-sm mt-1 ml-4">The palette displays all question numbers in a grid layout, making it easy to see your progress at a glance.</p>
            </li>
            <li>
              <strong>Jump to Any Question</strong>
              <p className="text-sm mt-1 ml-4">Click on any question number in the palette to instantly jump to that question. This is much faster than using Previous/Next buttons.</p>
            </li>
            <li>
              <strong>Track Your Progress</strong>
              <p className="text-sm mt-1 ml-4">The color-coded system helps you quickly identify which questions need attention and which you've already completed.</p>
            </li>
            <li>
              <strong>Mark for Review</strong>
              <p className="text-sm mt-1 ml-4">Use the "Mark for Review" option on any question, and it will appear in yellow on the palette, making it easy to find and revisit later.</p>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">Navigation Tips</h2>
          <div className="bg-pastel-lilac/20 p-4 rounded-xl border border-pastel-lilac/30">
            <ul className="space-y-2 text-sm">
              <li>✓ Use the palette to quickly review all questions before submitting</li>
              <li>✓ Check for any gray (unanswered) questions before final submission</li>
              <li>✓ Revisit yellow (marked) questions to double-check your answers</li>
              <li>✓ The palette is especially useful in Exam Mode for time management</li>
              <li>✓ You can use keyboard shortcuts (if available) along with the palette</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">Best Practices</h2>
          <div className="space-y-3">
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-sm"><strong className="text-pastel-dark">Answer First, Review Later:</strong> Answer all questions first, then use the palette to review marked questions.</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-sm"><strong className="text-pastel-dark">Check Unanswered:</strong> Before submitting, check the palette for any gray questions you might have missed.</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-sm"><strong className="text-pastel-dark">Time Management:</strong> In Exam Mode, use the palette to quickly identify and prioritize questions you're confident about.</p>
            </div>
          </div>
        </section>
      </div>
    </HelpArticle>
  );
};

export default QuestionPalette;

