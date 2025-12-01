import React from 'react';
import { HelpArticle } from '../HelpArticle';

const TestModes: React.FC = () => {
  return (
    <HelpArticle
      title="Understanding Test Modes (Practice vs Exam)"
      category="Practice Tests"
      categoryHref="/help"
      relatedArticles={[
        { title: "How to attempt a practice test", href: "/help/practice-tests/attempting-tests" },
        { title: "Using the question palette and navigation", href: "/help/practice-tests/question-palette" },
        { title: "Reviewing answers and solutions", href: "/help/practice-tests/reviewing-answers" }
      ]}
    >
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">Two Test Modes Available</h2>
          <p className="mb-4">
            AspireExamine offers two distinct test modes to suit different learning needs and preparation styles. Choose the mode that best fits your current study goals.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">Practice Mode</h2>
          <div className="bg-pastel-green/20 p-4 rounded-xl border border-pastel-green/30 mb-4">
            <h3 className="font-bold text-pastel-dark mb-2">Best For: Learning and Understanding</h3>
            <ul className="space-y-2 text-sm">
              <li>✓ Answer questions one by one with immediate feedback</li>
              <li>✓ See correct answers and explanations after each question</li>
              <li>✓ Learn from mistakes in real-time</li>
              <li>✓ No time pressure - take your time to understand concepts</li>
              <li>✓ Perfect for first-time learning or concept reinforcement</li>
            </ul>
          </div>
          <p className="text-sm text-gray-600">
            In Practice Mode, you answer questions sequentially. After selecting an answer, you immediately see if you're correct, the correct answer, and a detailed explanation. This mode is ideal when you're learning new topics or want to understand concepts better.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">Exam Mode</h2>
          <div className="bg-pastel-purple/20 p-4 rounded-xl border border-pastel-purple/30 mb-4">
            <h3 className="font-bold text-pastel-dark mb-2">Best For: Exam Simulation and Assessment</h3>
            <ul className="space-y-2 text-sm">
              <li>✓ Full-length exam simulation with timer</li>
              <li>✓ Question palette for easy navigation</li>
              <li>✓ Mark questions for review</li>
              <li>✓ Auto-save answers as you progress</li>
              <li>✓ Final scoring and comprehensive results</li>
              <li>✓ Realistic exam experience</li>
            </ul>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Exam Mode simulates the actual exam environment. You have a set time limit, can navigate between questions using the question palette, and mark questions for review. Your answers are saved automatically. At the end, you'll see your complete score and detailed performance analysis.
          </p>
          <div className="bg-pastel-yellow/20 p-3 rounded-lg border border-pastel-yellow/30">
            <p className="text-xs font-semibold text-pastel-dark">⚠️ Important:</p>
            <p className="text-xs text-gray-700 mt-1">The test will auto-submit when time runs out. Make sure to review all questions before the timer ends.</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">When to Use Each Mode</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border-2 border-pastel-green/30">
              <h3 className="font-bold text-pastel-dark mb-2">Use Practice Mode When:</h3>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Learning new topics</li>
                <li>• Understanding concepts for the first time</li>
                <li>• Wanting immediate feedback</li>
                <li>• Building confidence</li>
                <li>• Reviewing specific chapters</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-xl border-2 border-pastel-purple/30">
              <h3 className="font-bold text-pastel-dark mb-2">Use Exam Mode When:</h3>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Preparing for actual exams</li>
                <li>• Testing your knowledge</li>
                <li>• Practicing time management</li>
                <li>• Building exam stamina</li>
                <li>• Taking mock tests</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">Switching Between Modes</h2>
          <p className="mb-3">
            You can choose your test mode when you start a practice test. The mode selection screen appears before you begin answering questions. Once you've selected a mode and started the test, you cannot switch modes mid-test, but you can always attempt the same test again in a different mode.
          </p>
        </section>
      </div>
    </HelpArticle>
  );
};

export default TestModes;

