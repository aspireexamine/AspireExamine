import React from 'react';
import { HelpArticle } from '../HelpArticle';

const PDFReports: React.FC = () => {
  return (
    <HelpArticle
      title="Downloading PDF Reports"
      category="Practice Tests"
      categoryHref="/help"
      relatedArticles={[
        { title: "Understanding your test results", href: "/help/analytics/test-results" },
        { title: "Reviewing answers and solutions", href: "/help/practice-tests/reviewing-answers" },
        { title: "Understanding performance analytics", href: "/help/practice-tests/performance-analytics" }
      ]}
    >
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">What are PDF Reports?</h2>
          <p className="mb-4">
            PDF Reports are comprehensive downloadable documents that contain all the details of your test performance. These reports are perfect for offline review, sharing with teachers or mentors, or keeping a record of your progress.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">How to Download Your PDF Report</h2>
          <ol className="list-decimal list-inside space-y-3 ml-2">
            <li>
              <strong>Complete Your Test</strong>
              <p className="text-sm mt-1 ml-4">Finish your practice test or exam and submit your answers.</p>
            </li>
            <li>
              <strong>View Results Page</strong>
              <p className="text-sm mt-1 ml-4">After submission, you'll be taken to the detailed results page showing your performance.</p>
            </li>
            <li>
              <strong>Find Download Button</strong>
              <p className="text-sm mt-1 ml-4">Look for the "Download PDF Report" or "Export as PDF" button, usually located at the top or bottom of the results page.</p>
            </li>
            <li>
              <strong>Click to Download</strong>
              <p className="text-sm mt-1 ml-4">Click the button and your PDF report will be generated and downloaded automatically to your device.</p>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">What's Included in the PDF Report</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-pastel-green/20 p-4 rounded-xl border border-pastel-green/30">
              <h3 className="font-bold text-pastel-dark mb-2">Performance Summary</h3>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Total score and percentage</li>
                <li>• Subject-wise breakdown</li>
                <li>• Time taken</li>
                <li>• Overall performance rating</li>
              </ul>
            </div>
            <div className="bg-pastel-purple/20 p-4 rounded-xl border border-pastel-purple/30">
              <h3 className="font-bold text-pastel-dark mb-2">Question Details</h3>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• All questions with your answers</li>
                <li>• Correct answers highlighted</li>
                <li>• Detailed explanations</li>
                <li>• Question difficulty levels</li>
              </ul>
            </div>
            <div className="bg-pastel-yellow/20 p-4 rounded-xl border border-pastel-yellow/30">
              <h3 className="font-bold text-pastel-dark mb-2">Analytics</h3>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Performance trends</li>
                <li>• Weak areas identified</li>
                <li>• Improvement suggestions</li>
                <li>• Comparison with previous tests</li>
              </ul>
            </div>
            <div className="bg-pastel-pink/20 p-4 rounded-xl border border-pastel-pink/30">
              <h3 className="font-bold text-pastel-dark mb-2">Test Information</h3>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Test name and date</li>
                <li>• Exam stream and subject</li>
                <li>• Total questions and marks</li>
                <li>• Test duration</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">Benefits of PDF Reports</h2>
          <div className="bg-pastel-lilac/20 p-4 rounded-xl border border-pastel-lilac/30">
            <ul className="space-y-2 text-sm">
              <li>✓ <strong>Offline Access:</strong> Review your performance without internet connection</li>
              <li>✓ <strong>Print for Study:</strong> Print and annotate for better learning</li>
              <li>✓ <strong>Share with Mentors:</strong> Share reports with teachers or tutors for guidance</li>
              <li>✓ <strong>Track Progress:</strong> Keep a record of all your test attempts</li>
              <li>✓ <strong>Detailed Analysis:</strong> Comprehensive breakdown of your performance</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">Tips for Using PDF Reports</h2>
          <ul className="list-disc list-inside space-y-2 ml-2 text-sm">
            <li>Download reports immediately after completing tests to ensure you have a backup</li>
            <li>Review PDFs regularly to track your improvement over time</li>
            <li>Use the detailed explanations in PDFs for focused revision</li>
            <li>Compare PDFs from different test attempts to see progress</li>
            <li>Share PDFs with study groups or mentors for collaborative learning</li>
          </ul>
        </section>
      </div>
    </HelpArticle>
  );
};

export default PDFReports;

