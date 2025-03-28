import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/useLanguage';

const Terms = () => {
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
          <h1 className="text-3xl font-bold mb-8">{t('terms_of_service')}</h1>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('terms_acceptance_title')}</h2>
            <p>{t('terms_acceptance_content')}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('terms_license_title')}</h2>
            <p>{t('terms_license_content')}</p>
            <ul className="list-disc pl-6 mt-2">
              <li>{t('terms_license_items.modify')}</li>
              <li>{t('terms_license_items.commercial')}</li>
              <li>{t('terms_license_items.reverse')}</li>
              <li>{t('terms_license_items.copyright')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('terms_responsibilities_title')}</h2>
            <p>{t('terms_responsibilities_content')}</p>
            <ul className="list-disc pl-6 mt-2">
              <li>{t('terms_responsibilities_items.confidentiality')}</li>
              <li>{t('terms_responsibilities_items.activities')}</li>
              <li>{t('terms_responsibilities_items.workout_plans')}</li>
              <li>{t('terms_responsibilities_items.healthcare')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('terms_disclaimer_title')}</h2>
            <p>{t('terms_disclaimer_content')}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('terms_limitations_title')}</h2>
            <p>{t('terms_limitations_content')}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('terms_revisions_title')}</h2>
            <p>{t('terms_revisions_content')}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('terms_contact_title')}</h2>
            <p>{t('terms_contact_content')}</p>
            <p className="mt-2">
              Email: support@mamukfitness.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms; 