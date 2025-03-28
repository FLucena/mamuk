import { ArrowLeft, Users, Target, Heart, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/useLanguage';

const About = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <Link 
          to="/"
          className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('back_to_home')}
        </Link>

        {/* Content */}
        <div className="prose dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold mb-8">{t('about_title')}</h1>
          
          {/* Mission Statement */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">{t('about_mission_title')}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('about_mission_content')}
            </p>
          </section>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="flex items-start space-x-4">
              <Users className="h-8 w-8 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2">{t('about_features.community_title')}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('about_features.community_content')}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Target className="h-8 w-8 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2">{t('about_features.goals_title')}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('about_features.goals_content')}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Heart className="h-8 w-8 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2">{t('about_features.health_title')}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('about_features.health_content')}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Award className="h-8 w-8 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2">{t('about_features.results_title')}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('about_features.results_content')}
                </p>
              </div>
            </div>
          </div>

          {/* Story Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">{t('about_story_title')}</h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('about_story_content')}
            </p>
          </section>

          {/* Team Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">{t('about_team_title')}</h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('about_team_content')}
            </p>
          </section>

          {/* Contact Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('about_contact_title')}</h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('about_contact_content')}
            </p>
            <p className="mt-2">
              Email: contact@mamukfitness.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About; 