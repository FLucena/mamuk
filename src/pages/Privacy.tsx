import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/useLanguage';

const Privacy = () => {
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
          <h1 className="text-3xl font-bold mb-8">{t('privacy_policy')}</h1>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('privacy_info_collect_title')}</h2>
            <p>{t('privacy_info_collect_content')}</p>
            <ul className="list-disc pl-6 mt-2">
              <li>{t('privacy_info_collect_items.account')}</li>
              <li>{t('privacy_info_collect_items.profile')}</li>
              <li>{t('privacy_info_collect_items.workout')}</li>
              <li>{t('privacy_info_collect_items.preferences')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('privacy_info_use_title')}</h2>
            <p>{t('privacy_info_use_content')}</p>
            <ul className="list-disc pl-6 mt-2">
              <li>{t('privacy_info_use_items.provide')}</li>
              <li>{t('privacy_info_use_items.personalize')}</li>
              <li>{t('privacy_info_use_items.track')}</li>
              <li>{t('privacy_info_use_items.updates')}</li>
              <li>{t('privacy_info_use_items.improve')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('privacy_security_title')}</h2>
            <p>{t('privacy_security_content')}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('privacy_sharing_title')}</h2>
            <p>{t('privacy_sharing_content')}</p>
            <ul className="list-disc pl-6 mt-2">
              <li>{t('privacy_sharing_items.providers')}</li>
              <li>{t('privacy_sharing_items.analytics')}</li>
              <li>{t('privacy_sharing_items.law')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('privacy_rights_title')}</h2>
            <p>{t('privacy_rights_content')}</p>
            <ul className="list-disc pl-6 mt-2">
              <li>{t('privacy_rights_items.access')}</li>
              <li>{t('privacy_rights_items.correct')}</li>
              <li>{t('privacy_rights_items.delete')}</li>
              <li>{t('privacy_rights_items.opt_out')}</li>
              <li>{t('privacy_rights_items.export')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('privacy_cookies_title')}</h2>
            <p>{t('privacy_cookies_content')}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('privacy_changes_title')}</h2>
            <p>{t('privacy_changes_content')}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('privacy_contact_title')}</h2>
            <p>{t('privacy_contact_content')}</p>
            <p className="mt-2">
              Email: privacy@mamukfitness.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy; 