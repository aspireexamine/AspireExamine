import React from 'react';
import { HelpArticle } from '../HelpArticle';

const MobileAccess: React.FC = () => {
  return (
    <HelpArticle
      title="Can I Use AspireExamine on Mobile?"
      category="Getting Started"
      categoryHref="/help"
      relatedArticles={[
        { title: "Understanding the interface", href: "/help/getting-started/interface-overview" },
        { title: "Navigating the student dashboard", href: "/help/getting-started/dashboard-navigation" }
      ]}
    >
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">Yes! Fully Mobile Compatible</h2>
          <p className="mb-4">
            AspireExamine is fully responsive and works seamlessly on mobile phones, tablets, and desktops. You can access all features from any device with an internet connection.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">Mobile Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-pastel-green/20 p-4 rounded-xl border border-pastel-green/30">
              <h3 className="font-bold text-pastel-dark mb-2">✓ All Features Available</h3>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Practice tests and exams</li>
                <li>• AI Assistant chat</li>
                <li>• Smart Study Hub</li>
                <li>• Performance analytics</li>
                <li>• Library access</li>
              </ul>
            </div>
            <div className="bg-pastel-purple/20 p-4 rounded-xl border border-pastel-purple/30">
              <h3 className="font-bold text-pastel-dark mb-2">✓ Optimized Experience</h3>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Touch-friendly interface</li>
                <li>• Responsive design</li>
                <li>• Fast loading times</li>
                <li>• Easy navigation</li>
                <li>• Mobile-optimized forms</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">How to Access on Mobile</h2>
          <ol className="list-decimal list-inside space-y-3 ml-2">
            <li>
              <strong>Open Your Browser</strong>
              <p className="text-sm mt-1 ml-4">Use any modern mobile browser (Chrome, Safari, Firefox, Edge) on your smartphone or tablet.</p>
            </li>
            <li>
              <strong>Visit AspireExamine</strong>
              <p className="text-sm mt-1 ml-4">Navigate to the AspireExamine website - the interface will automatically adapt to your mobile screen.</p>
            </li>
            <li>
              <strong>Sign In</strong>
              <p className="text-sm mt-1 ml-4">Log in with your account credentials - the same account works across all devices.</p>
            </li>
            <li>
              <strong>Start Learning</strong>
              <p className="text-sm mt-1 ml-4">Access all features including practice tests, AI Assistant, and study materials directly from your mobile device.</p>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">Mobile-Specific Tips</h2>
          <div className="bg-pastel-lilac/20 p-4 rounded-xl border border-pastel-lilac/30">
            <ul className="space-y-2 text-sm">
              <li>✓ Use landscape mode for better viewing during practice tests</li>
              <li>✓ Enable notifications (if available) to stay updated</li>
              <li>✓ Bookmark the website for quick access</li>
              <li>✓ Ensure stable internet connection for best experience</li>
              <li>✓ Use mobile data or Wi-Fi - both work perfectly</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold text-pastel-dark mb-3">No App Installation Required</h2>
          <p className="mb-3">
            AspireExamine is a web-based platform, so you don't need to download or install any mobile app. Simply visit our website in your mobile browser and start using all features immediately. Your progress and data are synced across all devices automatically.
          </p>
        </section>
      </div>
    </HelpArticle>
  );
};

export default MobileAccess;

